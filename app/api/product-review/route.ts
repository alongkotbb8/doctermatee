import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidateTag } from "next/cache";

// ลูกค้าที่ล็อกอินส่งรีวิวสินค้า — บันทึกเป็นสถานะ pending รออนุมัติหลังบ้าน
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนรีวิว" }, { status: 401 });

  let body: { product_id?: string; rating?: number; title?: string; body?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 }); }

  const product_id = String(body.product_id ?? "");
  const rating = Number(body.rating);
  const text = String(body.body ?? "").trim();
  const title = body.title ? String(body.title).trim().slice(0, 120) : null;

  if (!product_id) return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: "กรุณาให้คะแนน 1–5 ดาว" }, { status: 400 });
  if (text.length < 10 || text.length > 2000) return NextResponse.json({ error: "ข้อความรีวิวต้องมี 10–2000 ตัวอักษร" }, { status: 400 });

  const service = createServiceClient();

  // ตรวจว่าสินค้ามีจริง
  const { data: product } = await service.from("products").select("id").eq("id", product_id).single();
  if (!product) return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });

  // ชื่อผู้รีวิว: จาก profile → email (กันการปลอมชื่อจาก client)
  const { data: profile } = await service.from("profiles").select("full_name").eq("id", user.id).single();
  const authorName = profile?.full_name?.trim() || (user.email ? user.email.split("@")[0] : "ลูกค้า Doctermatee");

  const { error } = await service.from("product_reviews").insert({
    product_id,
    user_id: user.id,
    author_name: authorName,
    rating,
    title,
    body: text,
    status: "pending",
  });
  if (error) return NextResponse.json({ error: "ส่งรีวิวไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });

  // ถ้าแอดมินอนุมัติทันทีค่อย bust; ตอนนี้ pending ยังไม่โชว์ แต่ revalidate เผื่อ moderation
  revalidateTag("product-reviews", "max");
  return NextResponse.json({ ok: true });
}
