import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

function generateOrderNo(): string {
  const now = new Date();
  const ymd = now.toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `DM${ymd}${rand}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { items, shipping_address, coupon_id, subtotal, shipping, discount, total } = body;

  if (!items?.length || !shipping_address || total == null) {
    return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
  }

  // Get authenticated user (optional — guest checkout allowed)
  const userSupabase = await createClient();
  const { data: { user } } = await userSupabase.auth.getUser();

  const service = createServiceClient();

  // Verify stock for all items
  const productIds = items.map((i: { product_id: string }) => i.product_id);
  const { data: products } = await service
    .from("products")
    .select("id, stock, name")
    .in("id", productIds);

  for (const item of items) {
    const product = products?.find((p) => p.id === item.product_id);
    if (!product) return NextResponse.json({ error: `ไม่พบสินค้า` }, { status: 400 });
    if (product.stock < item.qty) {
      return NextResponse.json({ error: `${product.name} สินค้าไม่เพียงพอ (คงเหลือ ${product.stock} ชิ้น)` }, { status: 400 });
    }
  }

  // Create order
  const order_no = generateOrderNo();
  const { data: order, error: orderErr } = await service
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      order_no,
      status: "pending",
      payment_status: "unpaid",
      shipping_address,
      coupon_id: coupon_id ?? null,
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

  // Create order items
  const orderItems = items.map((i: { product_id: string; qty: number; price: number }) => ({
    order_id: order.id,
    product_id: i.product_id,
    qty: i.qty,
    price: i.price,
  }));
  await service.from("order_items").insert(orderItems);

  // Deduct stock
  for (const item of items) {
    await service.rpc("decrement_stock", { product_id: item.product_id, amount: item.qty });
  }

  // Increment coupon usage
  if (coupon_id) {
    await service.rpc("increment_coupon_use", { coupon_id });
  }

  return NextResponse.json({ order_id: order.id });
}
