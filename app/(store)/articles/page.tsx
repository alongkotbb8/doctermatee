import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { IconArrowRight, IconClock } from "@/components/icons";

export const metadata: Metadata = {
  title: "บทความสุขภาพ",
  description: "บทความและความรู้ด้านสุขภาพ วิตามิน อาหารเสริม จากผู้เชี่ยวชาญ",
};

interface Art { id: string; title: string; slug: string; excerpt: string | null; cover_image: string | null; published_at: string | null; read_time_min: number | null; }

function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "";
}

export default async function ArticlesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, cover_image, published_at, read_time_min")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  const articles = (data ?? []) as Art[];
  const featured = articles[0];
  const sideList = articles.slice(1, 4);
  const rest = articles.slice(4);

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
            {/* Featured (ซ้าย) + รายการ (ขวา) */}
            <div className="grid-12" style={{ gap: 28, marginBottom: rest.length ? 40 : 0 }}>
              {/* Featured ใหญ่ */}
              <Link href={`/articles/${featured.slug}`} className="col-7 anim-fade-up" style={{ textDecoration: "none" }}>
                <article className="card pcard-hover" style={{ overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ aspectRatio: "16 / 9", background: "linear-gradient(145deg,var(--green-50),var(--teal-50))", position: "relative" }}>
                    {featured.cover_image
                      ? <Image src={featured.cover_image} alt={featured.title} fill style={{ objectFit: "cover" }} sizes="(max-width:768px) 100vw, 700px" priority />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal-300)" }}><IconClock size={56} color="currentColor" /></div>}
                  </div>
                  <div style={{ padding: "24px 26px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, color: "var(--neutral-400)", fontSize: 12.5 }}>
                      <IconClock size={13} color="currentColor" /> {featured.read_time_min ?? 5} นาที
                      {featured.published_at && <span>· {fmtDate(featured.published_at)}</span>}
                    </div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--neutral-900)", margin: "0 0 12px", lineHeight: 1.3, letterSpacing: "-.01em" }}>{featured.title}</h2>
                    {featured.excerpt && <p style={{ fontSize: 14.5, color: "var(--neutral-500)", lineHeight: 1.8, margin: "0 0 16px" }}>{featured.excerpt}</p>}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--teal-600)", fontSize: 14, fontWeight: 600 }}>
                      อ่านบทความ <IconArrowRight size={14} color="var(--teal-600)" />
                    </span>
                  </div>
                </article>
              </Link>

              {/* รายการด้านขวา */}
              <div className="col-5" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {sideList.map((a, i) => (
                  <Link key={a.id} href={`/articles/${a.slug}`} className={`anim-fade-up d${Math.min(i + 1, 5)}`} style={{ textDecoration: "none" }}>
                    <article className="card" style={{ display: "flex", gap: 14, padding: 12, alignItems: "stretch", transition: "box-shadow .2s, transform .2s" }}>
                      <div style={{ width: 104, height: 84, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "linear-gradient(145deg,var(--green-50),var(--teal-50))", position: "relative" }}>
                        {a.cover_image
                          ? <Image src={a.cover_image} alt={a.title} fill style={{ objectFit: "cover" }} sizes="104px" />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal-300)" }}><IconClock size={26} color="currentColor" /></div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <span style={{ fontSize: 11, color: "var(--teal-600)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>บทความ</span>
                        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--neutral-900)", margin: "0 0 6px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.title}</h3>
                        <span style={{ fontSize: 12, color: "var(--neutral-400)" }}>{fmtDate(a.published_at)} · {a.read_time_min ?? 5} นาที</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>

            {/* บทความที่เหลือ — กริดการ์ด */}
            {rest.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
                {rest.map((a, i) => (
                  <Link key={a.id} href={`/articles/${a.slug}`} className={`anim-fade-up d${Math.min(i + 1, 5)}`} style={{ textDecoration: "none" }}>
                    <article className="card pcard-hover" style={{ overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
                      <div style={{ aspectRatio: "16 / 10", background: "linear-gradient(145deg,var(--green-50),var(--teal-50))", position: "relative" }}>
                        {a.cover_image
                          ? <Image src={a.cover_image} alt={a.title} fill style={{ objectFit: "cover" }} sizes="(max-width:768px) 100vw, 33vw" />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal-300)" }}><IconClock size={40} color="currentColor" /></div>}
                      </div>
                      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 12, color: "var(--neutral-400)", marginBottom: 6 }}>{fmtDate(a.published_at)}</span>
                        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-900)", margin: 0, lineHeight: 1.4 }}>{a.title}</h3>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
