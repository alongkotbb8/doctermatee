import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getReview, getAllReviews } from "@/lib/reviews";
import { jsonLd, breadcrumbLd } from "@/lib/jsonld";
import Stars from "@/components/Stars";
import { IconArrowRight, IconCheck, IconX, IconShield, IconClock, IconUser } from "@/components/icons";

interface Props { params: Promise<{ slug: string }> }

export const revalidate = 60;

export async function generateStaticParams() {
  const all = await getAllReviews();
  return all.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = await getReview(slug);
  if (!r) return { title: "ไม่พบรีวิว" };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://doctermatee.co.th";
  return {
    title: `${r.question} | Doctermatee`,
    description: r.summary,
    alternates: { canonical: `${siteUrl}/reviews/${slug}` },
    openGraph: { title: r.question, description: r.summary, type: "article" },
  };
}

export default async function ReviewDetailPage({ params }: Props) {
  const { slug } = await params;
  const r = await getReview(slug);
  if (!r) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://doctermatee.co.th";
  const top = r.products.find((p) => p.highlight) ?? r.products[0];
  const fmt = (d: string) => new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });

  // ── JSON-LD: FAQPage + Product(ผู้ชนะ) + AggregateRating + Review ──
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: r.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: top.name,
    brand: { "@type": "Brand", name: "Doctermatee" },
    review: {
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: top.rating, bestRating: 5 },
      author: { "@type": "Person", name: r.author },
      datePublished: r.datePublished,
      reviewBody: r.verdict,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: top.rating,
      reviewCount: r.products.length,
      bestRating: 5,
    },
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: r.question,
    description: r.summary,
    image: `${siteUrl}/OG.png`,
    datePublished: r.datePublished,
    dateModified: r.dateUpdated,
    author: { "@type": "Person", name: r.author, jobTitle: r.authorRole },
    publisher: { "@type": "Organization", name: "Doctermatee", url: siteUrl, logo: { "@type": "ImageObject", url: `${siteUrl}/logo.svg` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/reviews/${slug}` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([faqLd, productLd, articleLd, breadcrumbLd(siteUrl, [
        { name: "หน้าแรก", url: "/" },
        { name: "รีวิว & เปรียบเทียบ", url: "/reviews" },
        { name: r.question, url: `/reviews/${slug}` },
      ])]) }} />

      <div style={{ padding: "40px 0 80px" }}>
        <article style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>

          {/* Breadcrumb */}
          <nav style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 13, color: "var(--neutral-400)", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>หน้าแรก</Link>
            <IconArrowRight size={10} color="currentColor" />
            <Link href="/reviews" style={{ color: "inherit", textDecoration: "none" }}>รีวิว</Link>
            <IconArrowRight size={10} color="currentColor" />
            <span style={{ color: "var(--neutral-600)" }}>{r.category}</span>
          </nav>

          {/* H1 = คำถามที่คนถาม AI */}
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 34, letterSpacing: "-.02em", color: "var(--neutral-900)", lineHeight: 1.25, marginBottom: 16 }}>
            {r.question}
          </h1>

          {/* ผู้เขียน + วันที่อัปเดต */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", color: "var(--neutral-500)", fontSize: 13.5, marginBottom: 28 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--teal-50)", color: "var(--teal-700)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IconUser size={15} color="currentColor" />
              </span>
              <span><strong style={{ color: "var(--neutral-800)", fontWeight: 700 }}>{r.author}</strong> · {r.authorRole}</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <IconClock size={13} color="currentColor" /> อัปเดต {fmt(r.dateUpdated)}
            </span>
          </div>

          {/* คำตอบสั้น (answer-first, 40–60 คำ) — สำคัญสุดสำหรับ AEO */}
          <div style={{ background: "var(--teal-50)", border: "1px solid var(--teal-100)", borderRadius: "var(--radius-lg)", padding: "20px 24px", marginBottom: 32 }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--teal-700)", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6 }}>
              <IconCheck size={15} color="var(--teal-600)" /> คำตอบสั้น ๆ
            </p>
            <p style={{ fontSize: 16, color: "var(--neutral-800)", lineHeight: 1.85, margin: 0 }}>{r.summary}</p>
          </div>

          {/* เกริ่นนำ */}
          <p style={{ fontSize: 16, color: "var(--neutral-700)", lineHeight: 1.9, marginBottom: 32 }}>{r.intro}</p>

          {/* ตารางเปรียบเทียบ + คะแนนดาว */}
          <h2 style={sectionH2}>ตารางเปรียบเทียบ {r.category} ทั้งหมด</h2>
          <div style={{ overflowX: "auto", marginBottom: 12 }}>
            <table className="rv-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "var(--neutral-50)", textAlign: "left" }}>
                  <th style={th}>อันดับ</th>
                  <th style={th}>ผลิตภัณฑ์</th>
                  <th style={th}>คะแนน</th>
                  <th style={th}>ราคา</th>
                  <th style={th}>เหมาะกับ</th>
                </tr>
              </thead>
              <tbody>
                {r.products.map((p) => (
                  <tr key={p.rank} style={{ borderBottom: "1px solid var(--neutral-100)", background: p.highlight ? "var(--teal-50)" : "transparent" }}>
                    <td style={{ ...td, fontWeight: 800, color: "var(--neutral-900)" }}>#{p.rank}</td>
                    <td style={{ ...td, fontWeight: 700, color: "var(--neutral-900)" }}>
                      {p.name} {p.highlight && <span style={{ fontSize: 11, color: "var(--teal-700)", background: "#fff", border: "1px solid var(--teal-200)", padding: "1px 7px", borderRadius: 99, marginLeft: 4 }}>แนะนำ</span>}
                    </td>
                    <td style={td}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Stars value={p.rating} size={13} /> <span style={{ fontWeight: 700 }}>{p.rating.toFixed(1)}</span></span>
                    </td>
                    <td style={{ ...td, fontWeight: 700, color: "var(--teal-700)" }}>{p.price}</td>
                    <td style={{ ...td, color: "var(--neutral-600)" }}>{p.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {r.comparisonNote && <p style={{ fontSize: 12.5, color: "var(--neutral-400)", marginBottom: 36, lineHeight: 1.6 }}>{r.comparisonNote}</p>}

          {/* การ์ดข้อดี-ข้อเสียแต่ละตัว */}
          <h2 style={sectionH2}>ข้อดี-ข้อเสียแต่ละยี่ห้อ</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 36 }}>
            {r.products.map((p) => (
              <div key={p.rank} className="card" style={{ padding: "20px 22px", borderColor: p.highlight ? "var(--teal-200)" : undefined, borderWidth: p.highlight ? 2 : 1, borderStyle: "solid" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "var(--neutral-900)", margin: 0 }}>
                    #{p.rank} {p.name}
                  </h3>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Stars value={p.rating} size={15} />
                    <span style={{ fontWeight: 800, color: "var(--neutral-800)" }}>{p.rating.toFixed(1)}</span>
                    <span style={{ color: "var(--teal-700)", fontWeight: 700, marginLeft: 8 }}>{p.price}</span>
                  </span>
                </div>
                <div className="rv-proscons" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--green-700)", margin: "0 0 8px" }}>ข้อดี</p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 7 }}>
                      {p.pros.map((x, i) => (
                        <li key={i} style={{ display: "flex", gap: 8, fontSize: 13.5, color: "var(--neutral-700)", lineHeight: 1.5 }}>
                          <IconCheck size={15} color="var(--green-600)" /> <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-sale)", margin: "0 0 8px" }}>ข้อเสีย</p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 7 }}>
                      {p.cons.map((x, i) => (
                        <li key={i} style={{ display: "flex", gap: 8, fontSize: 13.5, color: "var(--neutral-600)", lineHeight: 1.5 }}>
                          <IconX size={14} color="var(--color-sale)" /> <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {p.productHref && /^(\/|https:\/\/)/.test(p.productHref) && (
                  <Link href={p.productHref} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: 13.5, fontWeight: 600, color: "var(--teal-700)", textDecoration: "none" }}>
                    ดูสินค้าในร้าน <IconArrowRight size={13} color="var(--teal-700)" />
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* เนื้อหาเชิงลึก (หัวข้อย่อย = คำถามที่คนถาม) */}
          {r.sections.map((s, i) => (
            <section key={i} style={{ marginBottom: 28 }}>
              <h2 style={sectionH2}>{s.heading}</h2>
              {s.body.map((para, j) => (
                <p key={j} style={{ fontSize: 16, color: "var(--neutral-700)", lineHeight: 1.9, margin: "0 0 14px" }}>{para}</p>
              ))}
            </section>
          ))}

          {/* บทสรุป/คำตัดสิน */}
          <div style={{ background: "var(--neutral-900)", borderRadius: "var(--radius-lg)", padding: "26px 28px", margin: "12px 0 40px", color: "#fff" }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--teal-300)", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 10px" }}>สรุป</p>
            <p style={{ fontSize: 16, lineHeight: 1.85, margin: 0, color: "rgba(255,255,255,.92)" }}>{r.verdict}</p>
          </div>

          {/* FAQ — ใช้ <details> เพื่อให้อ่านได้แม้ไม่มี JS (ดีต่อ crawler) */}
          <h2 style={sectionH2}>คำถามที่พบบ่อย (FAQ)</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
            {r.faq.map((f, i) => (
              <details key={i} className="rv-faq card" style={{ padding: "0", overflow: "hidden" }}>
                <summary style={{ listStyle: "none", cursor: "pointer", padding: "16px 20px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-900)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  {f.q}
                  <span className="rv-faq-icon" style={{ color: "var(--teal-600)", flexShrink: 0, fontSize: 20, lineHeight: 1 }}>+</span>
                </summary>
                <p style={{ padding: "0 20px 18px", fontSize: 15, color: "var(--neutral-700)", lineHeight: 1.8, margin: 0 }}>{f.a}</p>
              </details>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center", padding: "32px 24px", background: "var(--teal-50)", borderRadius: "var(--radius-lg)" }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--neutral-900)", margin: "0 0 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <IconShield size={20} color="var(--teal-600)" /> สินค้าทุกชิ้นมีเลข อย.
            </p>
            <p style={{ fontSize: 14, color: "var(--neutral-600)", margin: "0 0 18px" }}>เลือกซื้ออาหารเสริมคุณภาพจากเภสัชกร พร้อมส่งฟรีเมื่อครบ ฿500</p>
            <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--teal-600)", color: "#fff", borderRadius: "var(--radius-full)", padding: "13px 28px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
              ดูสินค้าทั้งหมด <IconArrowRight size={15} color="#fff" />
            </Link>
          </div>
        </article>
      </div>

      <style>{`
        .rv-table th, .rv-table td { white-space: nowrap; }
        .rv-faq summary::-webkit-details-marker { display: none; }
        .rv-faq[open] .rv-faq-icon { transform: rotate(45deg); }
        .rv-faq-icon { transition: transform .2s; display: inline-block; }
        @media(max-width:640px){ .rv-proscons{ grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}

const sectionH2: React.CSSProperties = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--neutral-900)", margin: "8px 0 16px", letterSpacing: "-.01em",
};
const th: React.CSSProperties = { padding: "12px 14px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--neutral-600)" };
const td: React.CSSProperties = { padding: "12px 14px", verticalAlign: "middle" };
