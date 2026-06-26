import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getQuestion, getApprovedQuestions, type QAAnswer } from "@/lib/qa";
import { jsonLd, breadcrumbLd } from "@/lib/jsonld";
import AnswerForm from "@/components/AnswerForm";
import { IconArrowRight, IconStethoscope, IconUser, IconShield } from "@/components/icons";

export const revalidate = 60;

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const qs = await getApprovedQuestions();
  return qs.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const q = await getQuestion(slug);
  if (!q) return { title: "ไม่พบคำถาม" };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://doctermatee.co.th";
  return {
    title: `${q.title} | ถาม-ตอบ Doctermatee`,
    description: q.body.slice(0, 160),
    alternates: { canonical: `${siteUrl}/qa/${slug}` },
    openGraph: { title: q.title, description: q.body.slice(0, 160), type: "article" },
  };
}

function answerLd(a: QAAnswer) {
  return {
    "@type": "Answer",
    text: a.body,
    dateCreated: a.created_at,
    author: { "@type": "Person", name: a.author_name },
  };
}

export default async function QuestionPage({ params }: Props) {
  const { slug } = await params;
  const q = await getQuestion(slug);
  if (!q) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://doctermatee.co.th";
  const official = q.answers.filter((a) => a.is_official);
  const community = q.answers.filter((a) => !a.is_official);
  const suggested = [...official.slice(1), ...community];
  const fmt = (d: string) => new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });

  // QAPage JSON-LD — ให้ Google/AI เข้าใจว่าเป็นหน้าถาม-ตอบ
  const qaLd = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: q.title,
      text: q.body,
      answerCount: q.answers.length,
      dateCreated: q.created_at,
      author: { "@type": "Person", name: q.author_name },
      ...(official.length ? { acceptedAnswer: answerLd(official[0]) } : {}),
      ...(suggested.length ? { suggestedAnswer: suggested.map(answerLd) } : {}),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([qaLd, breadcrumbLd(siteUrl, [
        { name: "หน้าแรก", url: "/" },
        { name: "ถาม-ตอบ", url: "/qa" },
        { name: q.title, url: `/qa/${slug}` },
      ])]) }} />

      <div style={{ padding: "40px 0 80px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 13, color: "var(--neutral-400)", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>หน้าแรก</Link>
            <IconArrowRight size={10} color="currentColor" />
            <Link href="/qa" style={{ color: "inherit", textDecoration: "none" }}>ถาม-ตอบ</Link>
            <IconArrowRight size={10} color="currentColor" />
            <span style={{ color: "var(--neutral-600)" }}>{q.category ?? "คำถาม"}</span>
          </nav>

          {/* คำถาม */}
          <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--teal-50)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <IconStethoscope size={22} color="var(--teal-600)" />
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, letterSpacing: "-.01em", color: "var(--neutral-900)", lineHeight: 1.3, margin: 0 }}>{q.title}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--neutral-400)", fontSize: 13, marginBottom: 18, paddingLeft: 58 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><IconUser size={13} color="currentColor" /> {q.author_name}</span>
            <span>· {fmt(q.created_at)}</span>
            {q.category && <span style={{ background: "var(--neutral-100)", color: "var(--neutral-600)", borderRadius: 99, padding: "2px 10px", fontWeight: 600 }}>{q.category}</span>}
          </div>
          <p style={{ fontSize: 16, color: "var(--neutral-700)", lineHeight: 1.9, margin: "0 0 36px", paddingLeft: 58, whiteSpace: "pre-wrap" }}>{q.body}</p>

          {/* คำตอบ */}
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--neutral-900)", margin: "0 0 16px" }}>
            {q.answers.length} คำตอบ
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
            {q.answers.map((a) => (
              <div key={a.id} className="card" style={{ padding: "18px 20px", borderColor: a.is_official ? "var(--teal-200)" : undefined, borderWidth: a.is_official ? 2 : 1, borderStyle: "solid", background: a.is_official ? "var(--teal-50)" : undefined }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--neutral-900)" }}>{a.author_name}</span>
                  {a.is_official && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--teal-600)", color: "#fff", borderRadius: 99, padding: "2px 10px", fontSize: 11.5, fontWeight: 700 }}>
                      <IconShield size={11} color="#fff" /> คำตอบทางการ
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: "var(--neutral-400)", marginLeft: "auto" }}>{fmt(a.created_at)}</span>
                </div>
                <p style={{ fontSize: 15, color: "var(--neutral-700)", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{a.body}</p>
              </div>
            ))}
            {q.answers.length === 0 && (
              <p style={{ color: "var(--neutral-400)", fontSize: 14, padding: "8px 0" }}>ยังไม่มีคำตอบ — เป็นคนแรกที่ตอบคำถามนี้</p>
            )}
          </div>

          {/* ฟอร์มตอบ */}
          <AnswerForm questionId={q.id} />
        </div>
      </div>
    </>
  );
}
