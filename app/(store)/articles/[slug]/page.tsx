import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconClock, IconArrowRight } from "@/components/icons";

export const revalidate = 60;

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase.from("articles").select("title, excerpt, cover_image").eq("slug", slug).single();
  if (!data) return { title: "ไม่พบบทความ" };
  return {
    title: data.title,
    description: data.excerpt ?? undefined,
    openGraph: { title: data.title, description: data.excerpt ?? undefined, images: data.cover_image ? [data.cover_image] : [] },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!article) notFound();

  const { data: related } = await supabase
    .from("articles")
    .select("id, title, slug, cover_image, read_time_min")
    .eq("is_published", true)
    .neq("slug", slug)
    .limit(3);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  // Schema.org Article JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.cover_image,
    datePublished: article.published_at,
    dateModified: article.updated_at ?? article.published_at,
    author: { "@type": "Organization", name: "Doctermatee", url: siteUrl },
    publisher: {
      "@type": "Organization",
      name: "Doctermatee",
      url: siteUrl,
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/articles/${slug}` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ padding: "48px 0 80px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>

          {/* Breadcrumb */}
          <nav style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24, fontSize: 13, color: "var(--neutral-400)" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>หน้าแรก</Link>
            <IconArrowRight size={10} color="currentColor" />
            <Link href="/articles" style={{ color: "inherit", textDecoration: "none" }}>บทความ</Link>
            <IconArrowRight size={10} color="currentColor" />
            <span style={{ color: "var(--neutral-600)" }}>{article.title}</span>
          </nav>

          {/* Header */}
          <header style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32, color: "var(--neutral-900)", lineHeight: 1.3, marginBottom: 16 }}>
              {article.title}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--neutral-400)", fontSize: 13 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <IconClock size={13} color="currentColor" /> {article.read_time_min ?? 5} นาที
              </span>
              {article.published_at && (
                <span>{new Date(article.published_at).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span>
              )}
            </div>
          </header>

          {/* Cover image */}
          {article.cover_image && (
            <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: 36, aspectRatio: "16/9", position: "relative" }}>
              <Image src={article.cover_image} alt={article.title} fill style={{ objectFit: "cover" }} sizes="760px" priority />
            </div>
          )}

          {/* Content */}
          <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content ?? "" }} />

          {/* Related */}
          {(related?.length ?? 0) > 0 && (
            <div style={{ marginTop: 56, paddingTop: 36, borderTop: "1px solid var(--neutral-100)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--neutral-900)", marginBottom: 20 }}>บทความที่เกี่ยวข้อง</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                {related!.map((r) => (
                  <Link key={r.id} href={`/articles/${r.slug}`} style={{ textDecoration: "none" }}>
                    <div className="card" style={{ overflow: "hidden" }}>
                      <div style={{ height: 120, background: "var(--neutral-100)", position: "relative" }}>
                        {r.cover_image && <Image src={r.cover_image} alt={r.title} fill style={{ objectFit: "cover" }} sizes="240px" />}
                      </div>
                      <div style={{ padding: "12px 14px" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "var(--neutral-800)", lineHeight: 1.4, margin: 0 }}>{r.title}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .article-body { font-size: 16px; line-height: 1.9; color: var(--neutral-700); }
        .article-body h2 { font-family: var(--font-display); font-weight: 700; font-size: 22px; color: var(--neutral-900); margin: 36px 0 14px; }
        .article-body h3 { font-family: var(--font-display); font-weight: 600; font-size: 18px; color: var(--neutral-800); margin: 28px 0 10px; }
        .article-body p { margin: 0 0 18px; }
        .article-body ul, .article-body ol { padding-left: 24px; margin: 0 0 18px; }
        .article-body li { margin-bottom: 6px; }
        .article-body strong { color: var(--neutral-900); font-weight: 700; }
        .article-body a { color: var(--teal-600); text-decoration: underline; }
        .article-body img { max-width: 100%; border-radius: 10px; margin: 16px 0; }
        .article-body blockquote { border-left: 4px solid var(--teal-400); padding: 12px 20px; margin: 24px 0; background: var(--teal-50); border-radius: 0 8px 8px 0; color: var(--neutral-700); font-style: italic; }
        @media(max-width:768px){ .article-body{font-size:15px} div[style*="repeat(3"]{grid-template-columns:1fr!important} }
      `}</style>
    </>
  );
}
