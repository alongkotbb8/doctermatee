import Link from "next/link";
import type { Metadata } from "next";
import { getApprovedQuestions } from "@/lib/qa";
import AskQuestionForm from "@/components/AskQuestionForm";
import { IconArrowRight, IconStethoscope } from "@/components/icons";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ถาม-ตอบสุขภาพ & อาหารเสริม | Doctermatee",
  description: "ถามคำถามเรื่องวิตามิน อาหารเสริม และสุขภาพ ตอบโดยทีมเภสัชกรและชุมชน Doctermatee รวมคำถามยอดนิยมพร้อมคำตอบ",
};

export default async function QAIndexPage() {
  const questions = await getApprovedQuestions();

  return (
    <div style={{ padding: "40px 0 72px" }}>
      <div className="wrap">
        <nav style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 13, color: "var(--neutral-400)" }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>หน้าแรก</Link>
          <IconArrowRight size={10} color="currentColor" />
          <span style={{ color: "var(--neutral-600)" }}>ถาม-ตอบ</span>
        </nav>

        <header style={{ marginBottom: 28, maxWidth: 720 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 34, letterSpacing: "-.02em", color: "var(--neutral-900)", lineHeight: 1.2, marginBottom: 12 }}>
            ถาม-ตอบ สุขภาพ & อาหารเสริม
          </h1>
          <p style={{ fontSize: 16, color: "var(--neutral-600)", lineHeight: 1.8 }}>
            มีคำถามเรื่องวิตามินหรืออาหารเสริม? ถามได้เลย — ตอบโดยทีมเภสัชกรและชุมชนผู้ใช้จริง
          </p>
        </header>

        <div style={{ marginBottom: 28 }}><AskQuestionForm /></div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {questions.map((q) => (
            <Link key={q.id} href={`/qa/${q.slug}`} style={{ textDecoration: "none" }}>
              <article className="card pcard-hover" style={{ padding: "20px 22px", transition: "box-shadow .2s, transform .2s" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--teal-50)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <IconStethoscope size={20} color="var(--teal-600)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--neutral-900)", margin: "0 0 6px", lineHeight: 1.4 }}>{q.title}</h2>
                    <p style={{ fontSize: 14, color: "var(--neutral-500)", lineHeight: 1.6, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{q.body}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12.5, color: "var(--neutral-400)" }}>
                      {q.category && <span style={{ background: "var(--neutral-100)", color: "var(--neutral-600)", borderRadius: 99, padding: "2px 10px", fontWeight: 600 }}>{q.category}</span>}
                      <span>{q.answerCount} คำตอบ</span>
                      <span>{new Date(q.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
          {questions.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--neutral-400)" }}>
              <p style={{ fontSize: 15, margin: 0 }}>ยังไม่มีคำถาม — เป็นคนแรกที่ตั้งคำถาม!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
