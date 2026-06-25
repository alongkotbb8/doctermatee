import type { MetadataRoute } from "next";

const PRIVATE = ["/admin", "/api/", "/account", "/checkout", "/payment", "/order"];

// AI crawler / LLM bots — อนุญาตให้เก็บเนื้อหา (AEO/GEO) เพื่อให้สินค้า/รีวิวถูกอ้างอิงใน AI search
const AI_BOTS = [
  "GPTBot",          // OpenAI / ChatGPT
  "ClaudeBot",       // Anthropic Claude
  "anthropic-ai",    // Anthropic (legacy)
  "Google-Extended", // Gemini / Vertex
  "PerplexityBot",   // Perplexity
  "CCBot",           // Common Crawl (ใช้ train หลายโมเดล)
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://doctermatee.co.th";

  return {
    rules: [
      // ผู้ใช้/เสิร์ชเอนจินทั่วไป
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      // AI crawlers — อนุญาตเนื้อหาสาธารณะ แต่ยังกันส่วนหลังบ้าน/ข้อมูลส่วนตัว
      ...AI_BOTS.map((bot) => ({ userAgent: bot, allow: "/", disallow: PRIVATE })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
