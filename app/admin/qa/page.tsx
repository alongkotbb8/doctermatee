import { createClient } from "@/lib/supabase/server";
import QAModeration, { type ModQuestion, type ModAnswer } from "@/components/QAModeration";

export default async function AdminQA() {
  const supabase = await createClient();
  const [{ data: qData }, { data: aData }] = await Promise.all([
    supabase.from("questions").select("id, title, slug, body, category, author_name, status, created_at").order("created_at", { ascending: false }),
    supabase.from("answers").select("id, body, author_name, is_official, status, created_at, question_id, questions(title, slug)").order("created_at", { ascending: false }),
  ]);

  const tableMissing = qData === null;
  const questions = (qData ?? []) as unknown as ModQuestion[];
  const answers = (aData ?? []) as unknown as ModAnswer[];
  const pendingQ = questions.filter((q) => q.status === "pending").length;
  const pendingA = answers.filter((a) => a.status === "pending").length;

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--neutral-900)", margin: "0 0 24px" }}>
        ถาม-ตอบ {(pendingQ + pendingA) > 0 && <span style={{ fontSize: 13, color: "#fff", background: "#EF4444", borderRadius: 99, padding: "2px 10px", marginLeft: 8, verticalAlign: "middle" }}>{pendingQ + pendingA} รออนุมัติ</span>}
      </h1>

      {tableMissing && (
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "var(--radius-md)", padding: "14px 18px", marginBottom: 18, fontSize: 13.5, color: "#92400E", lineHeight: 1.7 }}>
          ⚠️ ยังไม่พบตาราง <code>questions</code>/<code>answers</code> — กรุณารัน migration <code>20260625000009_qa.sql</code> ใน Supabase SQL Editor ก่อน
        </div>
      )}

      <QAModeration questions={questions} answers={answers} />
    </div>
  );
}
