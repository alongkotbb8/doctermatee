import { getPublishedArticles, type HomeArticle } from "@/lib/data";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { IconArrowRight, IconClock } from "@/components/icons";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "บทความสุขภาพและอาหารเสริม",
  description: "บทความความรู้ด้านสุขภาพ วิตามิน อาหารเสริม คอลลาเจน น้ำมันปลา เขียนโดยเภสัชกรและผู้เชี่ยวชาญ อ่านฟรี อัปเดตทุกสัปดาห์ | Doctermatee",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://doctermatee.co.th"}/articles` },
};

function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "";
}

export default async function ArticlesPage() {
  const articles: HomeArticle[] = await getPublishedArticles();

  return (
    <div style={{ padding: "48px 0 80px" }}>
      <div className="wrap">
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 36, color: "var(--neutral-900)", marginBottom: 10 }}>บทความสุขภาพ</h1>
          <p style={{ fontSize: 16, color: "var(--neutral-500)" }}>ความรู้ด้านสุขภาพ วิตามิน และอาหารเสริม จากผู้เชี่ยวชาญ</p>
        </div>

        {articles.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--neutral-400)", padding: "48px 0" }}>ยังไม่มีบทความ</p>
        ) : (
          <>
            {/* 2-column card grid */}
            <div className="articles-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 28 }}>
              {articles.map((a, i) => (
                <Link key={a.id} href={`/articles/${a.slug}`} className={`anim-fade-up d${Math.min(i + 1, 5)}`} style={{ textDecoration: "none" }}>
                  <article className="card pcard-hover" style={{ overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
                    {/* Cover image */}
                    <div style={{ aspectRatio: "16/9", background: "linear-gradient(145deg,var(--green-50),var(--teal-50))", position: "relative", flexShrink: 0 }}>
                      {a.cover_image ? (
                        <Image src={a.cover_image} alt={a.title} fill style={{ objectFit: "cover" }} sizes="(max-width:768px) 100vw, 50vw" priority={i < 2} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal-300)" }}>
                          <IconClock size={48} color="currentColor" />
                        </div>
                      )}
                      {i === 0 && (
                        <span style={{ position: "absolute", top: 14, left: 14, background: "var(--teal-600)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, padding: "5px 14px", borderRadius: "var(--radius-full)" }}>
                          ★ บทความแนะนำ
                        </span>
                      )}
                    </div>

                    {/* Text */}
                    <div style={{ padding: "20px 22px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--neutral-400)" }}>
                        <IconClock size={12} color="currentColor" />
                        <span>{a.read_time_min ?? 5} นาที</span>
                        {a.published_at && <span>· {fmtDate(a.published_at)}</span>}
                      </div>

                      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: i === 0 ? 20 : 16, color: "var(--neutral-900)", margin: 0, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {a.title}
                      </h2>

                      {a.excerpt && i < 2 && (
                        <p style={{ fontSize: 13.5, color: "var(--neutral-500)", lineHeight: 1.7, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {a.excerpt}
                        </p>
                      )}

                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--teal-600)", fontSize: 13, fontWeight: 600, marginTop: "auto" }}>
                        อ่านบทความ <IconArrowRight size={13} color="var(--teal-600)" />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
