import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidateTag } from "next/cache";

function toSlug(str: string) {
  return str.toLowerCase().replace(/[^฀-๿a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").trim();
}

// ผู้ใช้ที่ล็อกอินตั้งคำถาม → บันทึกเป็น pending รออนุมัติ
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนตั้งคำถาม" }, { status: 401 });

  let body: { title?: string; body?: string; category?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 }); }

  const title = String(body.title ?? "").trim();
  const text = String(body.body ?? "").trim();
  const category = body.category ? String(body.category).trim().slice(0, 80) : null;
  if (title.length < 5 || title.length > 200) return NextResponse.json({ error: "หัวข้อคำถามต้องมี 5–200 ตัวอักษร" }, { status: 400 });
  if (text.length < 10 || text.length > 5000) return NextResponse.json({ error: "รายละเอียดต้องมี 10–5000 ตัวอักษร" }, { status: 400 });

  const service = createServiceClient();
  const { data: profile } = await service.from("profiles").select("full_name").eq("id", user.id).single();
  const authorName = profile?.full_name?.trim() || (user.email ? user.email.split("@")[0] : "ผู้ใช้ Doctermatee");

  const slug = `${toSlug(title) || "q"}-${crypto.randomUUID().slice(0, 6)}`;

  const { error } = await service.from("questions").insert({
    slug, title, body: text, category, user_id: user.id, author_name: authorName, status: "pending",
  });
  if (error) return NextResponse.json({ error: "ส่งคำถามไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });

  revalidateTag("qa", "max");
  return NextResponse.json({ ok: true });
}
