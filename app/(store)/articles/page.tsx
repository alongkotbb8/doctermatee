import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { IconArrowRight, IconClock } from "@/components/icons";

export const metadata: Metadata = {
  title: "บทความสุขภาพ — Doctermatee",
  description: "บทความและความรู้ด้านสุขภาพ วิตามิน อาหารเสริม จากผู้เชี่ยวชาญ",
};

export default async function ArticlesPage() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, cover_image, published_at, read_time_min")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <div style={{ padding: "48px 0 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 36, color: "var(--neutral-900)", marginBottom: 12 }}>
            บทความสุขภาพ
          </h1>
          <p style={{ fontSize: 16, color: "var(--neutral-500)", maxWidth: 480, margin: "0 auto" }}>
            ความรู้ด้านสุขภาพ วิตามิน และอาหารเสริม จากผู้เชี่ยวชาญ
          </p>
        </div>

        {(articles?.length ?? 0) === 0 ? (
          <p style={{ textAlign: "center", color: "var(--neutral-400)", padding: "48px 0" }}>ยังไม่มีบทความ</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {articles!.map((a, i) => (
              <Link key={a.id} href={`/articles/${a.slug}`} style={{ textDecoration: "none" }} className={`anim-fade-up d${Math.min(i + 1, 5)}`}>
                <article className="card pcard-hover" style={{ overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
                  <div style={{ height: 200, background: "var(--neutral-100)", position: "relative", flexShrink: 0 }}>
                    {a.cover_image
                      ? <Image src={a.cover_image} alt={a.title} fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 33vw" />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>📰</div>}
                  </div>
                  <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, color: "var(--neutral-400)", fontSize: 12 }}>
                      <IconClock size={12} color="currentColor" />
                      <span>{a.read_time_min ?? 5} นาที</span>
                      {a.published_at && (
                        <span>· {new Date(a.published_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</span>
                      )}
                    </div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--neutral-900)", margin: "0 0 8px", lineHeight: 1.4 }}>{a.title}</h2>
                    {a.excerpt && <p style={{ fontSize: 13, color: "var(--neutral-500)", lineHeight: 1.7, margin: "0 0 14px", flex: 1 }}>{a.excerpt}</p>}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--teal-600)", fontSize: 13, fontWeight: 600 }}>
                      อ่านต่อ <IconArrowRight size={12} color="var(--teal-600)" />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`@media(max-width:768px){div[style*="repeat(3"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
