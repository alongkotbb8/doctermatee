import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ล้าง cache ของหน้าร้านเมื่อแอดมินแก้ข้อมูล (admin เท่านั้น)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let tags: string[] = ["catalog", "articles", "banners", "settings"];
  try {
    const body = await req.json();
    if (Array.isArray(body?.tags) && body.tags.length) tags = body.tags;
  } catch { /* ใช้ default */ }

  // ล้าง Data Cache
  tags.forEach((t) => revalidateTag(t, { expire: 0 }));

  // ล้าง Full Route Cache ของหน้าที่เกี่ยวข้อง
  if (tags.includes("articles"))  revalidatePath("/articles", "layout");
  if (tags.includes("catalog"))   revalidatePath("/products", "layout");
  if (tags.includes("banners") || tags.includes("catalog") || tags.includes("articles")) {
    revalidatePath("/", "layout");
  }

  return NextResponse.json({ ok: true, revalidated: tags });
}
