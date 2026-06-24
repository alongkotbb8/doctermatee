import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://doctermatee.co.th";
  const service = createServiceClient();

  const [{ data: products }, { data: articles }] = await Promise.all([
    service.from("products").select("name, slug, description, price").eq("status", "active").limit(50),
    service.from("articles").select("title, slug, excerpt").eq("is_published", true).limit(20),
  ]);

  const lines = [
    `# Doctermatee — ร้านอาหารเสริมและวิตามินออนไลน์`,
    `> เว็บไซต์: ${siteUrl}`,
    `> ประเภท: E-commerce, Health Supplement, Vitamin`,
    `> ภาษา: ภาษาไทย (Thai)`,
    ``,
    `## สินค้า (Products)`,
    ...(products ?? []).map((p) =>
      `- [${p.name}](${siteUrl}/products/${p.slug}) — ฿${p.price}${p.description ? ` — ${p.description.slice(0, 80)}` : ""}`
    ),
    ``,
    `## บทความ (Articles)`,
    ...(articles ?? []).map((a) =>
      `- [${a.title}](${siteUrl}/articles/${a.slug})${a.excerpt ? ` — ${a.excerpt.slice(0, 80)}` : ""}`
    ),
    ``,
    `## ข้อมูลร้าน`,
    `- ชำระเงิน: บัตรเครดิต/เดบิต, PromptPay`,
    `- จัดส่ง: ทั่วประเทศไทย ค่าส่ง ฿50 (ฟรีเมื่อซื้อ ฿500+)`,
    `- ติดต่อ: ${siteUrl}`,
  ];

  return new NextResponse(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
