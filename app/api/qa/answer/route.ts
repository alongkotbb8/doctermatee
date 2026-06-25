import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidateTag } from "next/cache";

// ผู้ใช้ที่ล็อกอินตอบกระทู้ → บันทึกเป็น pending รออนุมัติ
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนตอบ" }, { status: 401 });

  let body: { question_id?: string; body?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 }); }

  const question_id = String(body.question_id ?? "");
  const text = String(body.body ?? "").trim();
  if (!question_id) return NextResponse.json({ error: "ไม่พบคำถาม" }, { status: 400 });
  if (text.length < 10 || text.length > 5000) return NextResponse.json({ error: "คำตอบต้องมี 10–5000 ตัวอักษร" }, { status: 400 });

  const service = createServiceClient();
  const { data: q } = await service.from("questions").select("id").eq("id", question_id).eq("status", "approved").single();
  if (!q) return NextResponse.json({ error: "ไม่พบคำถามนี้" }, { status: 404 });

  const { data: profile } = await service.from("profiles").select("full_name").eq("id", user.id).single();
  const authorName = profile?.full_name?.trim() || (user.email ? user.email.split("@")[0] : "ผู้ใช้ Doctermatee");

  const { error } = await service.from("answers").insert({
    question_id, user_id: user.id, author_name: authorName, body: text, is_official: false, status: "pending",
  });
  if (error) return NextResponse.json({ error: "ส่งคำตอบไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });

  revalidateTag("qa", "max");
  return NextResponse.json({ ok: true });
}
