import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getShippingConfig } from "@/lib/shipping";

function generateOrderNo(): string {
  const now = new Date();
  const ymd = now.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `DM${ymd}${rand}`;
}

const ADDR_FIELDS = ["full_name", "phone", "address", "district", "province", "postal_code"];

export async function POST(req: NextRequest) {
  const body = await req.json();
  // ⚠️ ไม่เชื่อราคา/ยอดรวม/ส่วนลดจาก client — ใช้เฉพาะ items, ที่อยู่, โค้ดคูปอง
  const { items, shipping_address, coupon_code } = body;

  // --- ตรวจรูปแบบข้อมูล ---
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return NextResponse.json({ error: "ข้อมูลสินค้าไม่ถูกต้อง" }, { status: 400 });
  }
  if (!shipping_address || typeof shipping_address !== "object") {
    return NextResponse.json({ error: "ไม่มีที่อยู่จัดส่ง" }, { status: 400 });
  }
  for (const f of ADDR_FIELDS) {
    if (!shipping_address[f] || typeof shipping_address[f] !== "string") {
      return NextResponse.json({ error: "กรุณากรอกที่อยู่จัดส่งให้ครบ" }, { status: 400 });
    }
  }

  // รวมจำนวนต่อสินค้า + ตรวจ qty เป็นจำนวนเต็มบวก
  const qtyById = new Map<string, number>();
  for (const it of items) {
    const id = String(it?.product_id ?? "");
    const qty = Number(it?.qty);
    if (!id || !Number.isInteger(qty) || qty <= 0 || qty > 999) {
      return NextResponse.json({ error: "รายการสินค้าไม่ถูกต้อง" }, { status: 400 });
    }
    qtyById.set(id, (qtyById.get(id) ?? 0) + qty);
  }
  const productIds = [...qtyById.keys()];

  const service = createServiceClient();

  // --- ดึงราคา/สต็อกจริงจาก DB (server เป็นแหล่งความจริงเดียว) ---
  const { data: products } = await service
    .from("products")
    .select("id, name, price, stock, status")
    .in("id", productIds);

  const orderItems: { product_id: string; name: string; price: number; qty: number }[] = [];
  let subtotal = 0;
  for (const [id, qty] of qtyById) {
    const p = products?.find((x) => x.id === id);
    if (!p) return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 400 });
    if (p.status !== "active") return NextResponse.json({ error: `${p.name} ไม่พร้อมจำหน่าย` }, { status: 400 });
    if (p.stock < qty) return NextResponse.json({ error: `${p.name} สินค้าไม่เพียงพอ (คงเหลือ ${p.stock} ชิ้น)` }, { status: 400 });
    const price = Number(p.price);
    subtotal += price * qty;
    orderItems.push({ product_id: id, name: p.name, price, qty });
  }
  subtotal = Math.round(subtotal * 100) / 100;

  // --- คูปอง: ตรวจสอบและคำนวณส่วนลดฝั่ง server ---
  let discount = 0;
  let validCouponCode: string | null = null;
  if (coupon_code) {
    const code = String(coupon_code).toUpperCase();
    const { data: c } = await service
      .from("coupons")
      .select("code, type, value, min_order, usage_limit, used_count, expires_at, active")
      .eq("code", code)
      .single();
    const now = new Date();
    const usable =
      c && c.active &&
      (!c.expires_at || new Date(c.expires_at) >= now) &&
      (c.usage_limit == null || c.used_count < c.usage_limit) &&
      subtotal >= Number(c.min_order ?? 0);
    if (usable) {
      discount = c.type === "percent" ? Math.round((subtotal * Number(c.value)) / 100) : Number(c.value);
      discount = Math.min(discount, subtotal); // กันส่วนลดเกินยอด
      validCouponCode = c.code;
    }
    // คูปองใช้ไม่ได้ → ไม่ลด (ราคายังถูกต้องเสมอ)
  }

  // --- ค่าจัดส่งจาก site_settings ---
  const { freeThreshold, standardFee } = await getShippingConfig();
  const shipping = subtotal >= freeThreshold ? 0 : standardFee;

  const total = Math.max(0, Math.round((subtotal + shipping - discount) * 100) / 100);

  // ผู้ใช้ (ถ้ามี — รองรับ guest)
  const userSupabase = await createClient();
  const { data: { user } } = await userSupabase.auth.getUser();

  // --- สร้างออเดอร์ด้วยค่าที่ server คำนวณ ---
  const order_no = generateOrderNo();
  const { data: order, error: orderErr } = await service
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      order_no,
      status: "pending",
      payment_status: "unpaid",
      shipping_address,
      coupon_code: validCouponCode,
      subtotal,
      shipping_fee: shipping,
      discount,
      total,
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: "ไม่สามารถสร้างออเดอร์ได้" }, { status: 500 });
  }

  await service.from("order_items").insert(orderItems.map((i) => ({ order_id: order.id, ...i })));

  // ตัดสต็อก
  for (const [id, qty] of qtyById) {
    await service.rpc("decrement_stock", { product_id: id, amount: qty });
  }

  // เพิ่มจำนวนการใช้คูปอง
  if (validCouponCode) {
    const { data: cur } = await service.from("coupons").select("used_count").eq("code", validCouponCode).single();
    if (cur) await service.from("coupons").update({ used_count: cur.used_count + 1 }).eq("code", validCouponCode);
  }

  // FR1: บันทึกที่อยู่ผูกกับบัญชี (ฝั่ง server ด้วย service client — เลี่ยง RLS ให้เซฟได้ชัวร์)
  // เพื่อ pre-fill ที่อยู่ครบทุกช่องในการสั่งซื้อครั้งถัดไป
  if (user) {
    await service.from("profiles").upsert({
      id: user.id,
      full_name: shipping_address.full_name,
      phone: shipping_address.phone,
      default_address: shipping_address,
    }, { onConflict: "id" });
  }

  return NextResponse.json({ order_id: order.id, total });
}
