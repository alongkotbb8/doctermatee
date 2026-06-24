import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { name, email, phone, topic, message } = await req.json();

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "กรุณากรอกชื่อ อีเมล และข้อความให้ครบ" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "รูปแบบอีเมลไม่ถูกต้อง" }, { status: 400 });
  }

  const service = createServiceClient();
  const { error } = await service.from("contact_messages").insert({
    name: String(name).slice(0, 200),
    email: String(email).slice(0, 200),
    phone: phone ? String(phone).slice(0, 50) : null,
    topic: topic ? String(topic).slice(0, 100) : null,
    message: String(message).slice(0, 5000),
  });

  if (error) {
    return NextResponse.json({ error: "ส่งข้อความไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
