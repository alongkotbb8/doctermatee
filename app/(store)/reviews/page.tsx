import Link from "next/link";
import type { Metadata } from "next";
import { getAllReviews } from "@/lib/reviews";
import Stars from "@/components/Stars";
import { IconArrowRight, IconClock } from "@/components/icons";

export const metadata: Metadata = {
  title: "รีวิว & เปรียบเทียบอาหารเสริม — เลือกยี่ห้อไหนดี | Doctermatee",
  description:
    "รีวิวและเปรียบเทียบอาหารเสริม วิตามิน คอลลาเจน น้ำมันปลา โดยเภสัชกร พร้อมคะแนนดาว ข้อดี-ข้อเสีย และคำแนะนำการเลือกซื้อปี 2026",
};

export const revalidate = 60;

export default async function ReviewsIndexPage() {
  const reviews = await getAllReviews();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://doctermatee.co.th";

  // ItemList JSON-LD — ช่วยให้ AI/Google เข้าใจว่าหน้านี้คือชุดบทความรีวิว
  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "รีวิวและเปรียบเทียบอาหารเสริม",
    itemListElement: reviews.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteUrl}/reviews/${r.slug}`,
      name: r.question,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }} />
      <div style={{ padding: "40px 0 72px" }}>
        <div className="wrap">
          {/* Breadcrumb */}
          <nav style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 13, color: "var(--neutral-400)" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>หน้าแรก</Link>
            <IconArrowRight size={10} color="currentColor" />
            <span style={{ color: "var(--neutral-600)" }}>รีวิว & เปรียบเทียบ</span>
          </nav>

          <header style={{ marginBottom: 32, maxWidth: 720 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 34, letterSpacing: "-.02em", color: "var(--neutral-900)", lineHeight: 1.2, marginBottom: 12 }}>
              รีวิว & เปรียบเทียบอาหารเสริม
            </h1>
            <p style={{ fontSize: 16, color: "var(--neutral-600)", lineHeight: 1.8 }}>
              คู่มือเลือกซื้ออาหารเสริมโดยเภสัชกร — เปรียบเทียบยี่ห้อยอดนิยม พร้อมคะแนน ข้อดี-ข้อเสีย และคำตอบสำหรับคำถามที่พบบ่อย อัปเดตล่าสุดปี 2026
            </p>
          </header>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>
            {reviews.map((r) => {
              const top = r.products.find((p) => p.highlight) ?? r.products[0];
              return (
                <Link key={r.slug} href={`/reviews/${r.slug}`} style={{ textDecoration: "none" }}>
                  <article className="card pcard-hover" style={{ padding: "22px 22px 24px", height: "100%", display: "flex", flexDirection: "column", transition: "box-shadow .2s, transform .2s" }}>
                    <span style={{ alignSelf: "flex-start", background: "var(--teal-50)", color: "var(--teal-700)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, padding: "4px 12px", borderRadius: "var(--radius-full)", marginBottom: 14 }}>
                      {r.category}
                    </span>
                    <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 19, color: "var(--neutral-900)", lineHeight: 1.4, margin: "0 0 12px" }}>
                      {r.question}
                    </h2>
                    <p style={{ fontSize: 14, color: "var(--neutral-600)", lineHeight: 1.7, margin: "0 0 16px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {r.summary}
                    </p>
                    <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--neutral-100)" }}>
                      <p style={{ fontSize: 12, color: "var(--neutral-400)", margin: "0 0 6px" }}>อันดับ 1: {top.name}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Stars value={top.rating} size={14} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--neutral-700)" }}>{top.rating.toFixed(1)}</span>
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--neutral-400)" }}>
                          <IconClock size={12} color="currentColor" />
                          {new Date(r.dateUpdated).toLocaleDateString("th-TH", { month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
