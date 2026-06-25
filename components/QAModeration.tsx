"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconCheck, IconX, IconTrash, IconShield } from "@/components/icons";

export interface ModQuestion {
  id: string; title: string; slug: string; body: string; category: string | null;
  author_name: string; status: "pending" | "approved" | "rejected"; created_at: string;
}
export interface ModAnswer {
  id: string; body: string; author_name: string; is_official: boolean;
  status: "pending" | "approved" | "rejected"; created_at: string;
  question_id: string; questions: { title: string; slug: string } | null;
}

const ST: Record<string, { t: string; bg: string; c: string }> = {
  pending: { t: "รออนุมัติ", bg: "#FEF3C7", c: "#92400E" },
  approved: { t: "อนุมัติแล้ว", bg: "#D1FAE5", c: "#065F46" },
  rejected: { t: "ปฏิเสธ", bg: "#FEE2E2", c: "#991B1B" },
};

async function revalidate() {
  await fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tags: ["qa"] }) }).catch(() => {});
}

export default function QAModeration({ questions, answers }: { questions: ModQuestion[]; answers: ModAnswer[] }) {
  const [tab, setTab] = useState<"questions" | "answers">("questions");
  const [qs, setQs] = useState(questions);
  const [as, setAs] = useState(answers);
  const [busy, setBusy] = useState<string | null>(null);

  async function setQStatus(id: string, status: ModQuestion["status"]) {
    setBusy(id);
    const { error } = await createClient().from("questions").update({ status }).eq("id", id);
    if (!error) { setQs((x) => x.map((q) => (q.id === id ? { ...q, status } : q))); await revalidate(); }
    setBusy(null);
  }
  async function delQ(id: string) {
    if (!confirm("ลบคำถามนี้? (คำตอบทั้งหมดจะถูกลบด้วย)")) return;
    setBusy(id);
    const { error } = await createClient().from("questions").delete().eq("id", id);
    if (!error) { setQs((x) => x.filter((q) => q.id !== id)); setAs((x) => x.filter((a) => a.question_id !== id)); await revalidate(); }
    setBusy(null);
  }
  async function setAStatus(id: string, status: ModAnswer["status"]) {
    setBusy(id);
    const { error } = await createClient().from("answers").update({ status }).eq("id", id);
    if (!error) { setAs((x) => x.map((a) => (a.id === id ? { ...a, status } : a))); await revalidate(); }
    setBusy(null);
  }
  async function toggleOfficial(id: string, val: boolean) {
    setBusy(id);
    const { error } = await createClient().from("answers").update({ is_official: val }).eq("id", id);
    if (!error) { setAs((x) => x.map((a) => (a.id === id ? { ...a, is_official: val } : a))); await revalidate(); }
    setBusy(null);
  }
  async function delA(id: string) {
    if (!confirm("ลบคำตอบนี้?")) return;
    setBusy(id);
    const { error } = await createClient().from("answers").delete().eq("id", id);
    if (!error) { setAs((x) => x.filter((a) => a.id !== id)); await revalidate(); }
    setBusy(null);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <button onClick={() => setTab("questions")} style={tabBtn(tab === "questions")}>คำถาม ({qs.length})</button>
        <button onClick={() => setTab("answers")} style={tabBtn(tab === "answers")}>คำตอบ ({as.length})</button>
      </div>

      {tab === "questions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {qs.map((q) => {
            const st = ST[q.status];
            return (
              <div key={q.id} className="card" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-900)" }}>{q.title}</span>
                      <span style={{ background: st.bg, color: st.c, borderRadius: 99, padding: "2px 10px", fontSize: 11.5, fontWeight: 600 }}>{st.t}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--neutral-400)" }}>{q.author_name} · {new Date(q.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}{q.category ? ` · ${q.category}` : ""}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {q.status !== "approved" && <button onClick={() => setQStatus(q.id, "approved")} disabled={busy === q.id} title="อนุมัติ" style={act("#D1FAE5", "#A7F3D0")}><IconCheck size={15} color="#065F46" /></button>}
                    {q.status !== "rejected" && <button onClick={() => setQStatus(q.id, "rejected")} disabled={busy === q.id} title="ปฏิเสธ" style={act("#FEF3C7", "#FDE68A")}><IconX size={15} color="#92400E" /></button>}
                    <button onClick={() => delQ(q.id)} disabled={busy === q.id} title="ลบ" style={act("#FEF2F2", "#FECACA")}><IconTrash size={14} color="#EF4444" /></button>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: "var(--neutral-600)", lineHeight: 1.7 }}>{q.body}</p>
              </div>
            );
          })}
          {qs.length === 0 && <p style={empty}>ยังไม่มีคำถาม</p>}
        </div>
      )}

      {tab === "answers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {as.map((a) => {
            const st = ST[a.status];
            return (
              <div key={a.id} className="card" style={{ padding: "18px 20px", borderColor: a.is_official ? "var(--teal-200)" : undefined }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--neutral-900)" }}>{a.author_name}</span>
                      <span style={{ background: st.bg, color: st.c, borderRadius: 99, padding: "2px 10px", fontSize: 11.5, fontWeight: 600 }}>{st.t}</span>
                      {a.is_official && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "var(--teal-600)", color: "#fff", borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}><IconShield size={10} color="#fff" /> ทางการ</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--neutral-400)" }}>ตอบ: {a.questions?.title ?? "—"} · {new Date(a.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => toggleOfficial(a.id, !a.is_official)} disabled={busy === a.id} title={a.is_official ? "ยกเลิกทางการ" : "ตั้งเป็นคำตอบทางการ"} style={act(a.is_official ? "#E0F2F1" : "#F1F5F9", a.is_official ? "var(--teal-200)" : "#E2E8F0")}><IconShield size={14} color={a.is_official ? "var(--teal-700)" : "#64748B"} /></button>
                    {a.status !== "approved" && <button onClick={() => setAStatus(a.id, "approved")} disabled={busy === a.id} title="อนุมัติ" style={act("#D1FAE5", "#A7F3D0")}><IconCheck size={15} color="#065F46" /></button>}
                    {a.status !== "rejected" && <button onClick={() => setAStatus(a.id, "rejected")} disabled={busy === a.id} title="ปฏิเสธ" style={act("#FEF3C7", "#FDE68A")}><IconX size={15} color="#92400E" /></button>}
                    <button onClick={() => delA(a.id)} disabled={busy === a.id} title="ลบ" style={act("#FEF2F2", "#FECACA")}><IconTrash size={14} color="#EF4444" /></button>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: "var(--neutral-600)", lineHeight: 1.7 }}>{a.body}</p>
              </div>
            );
          })}
          {as.length === 0 && <p style={empty}>ยังไม่มีคำตอบ</p>}
        </div>
      )}
    </div>
  );
}

const tabBtn = (active: boolean): React.CSSProperties => ({
  border: `1px solid ${active ? "var(--teal-500)" : "var(--neutral-200)"}`, background: active ? "var(--teal-50)" : "#fff",
  color: active ? "var(--teal-700)" : "var(--neutral-600)", borderRadius: "var(--radius-full)", padding: "8px 18px",
  fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
});
const act = (bg: string, border: string): React.CSSProperties => ({ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "8px 10px", cursor: "pointer", lineHeight: 0 });
const empty: React.CSSProperties = { textAlign: "center", color: "var(--neutral-400)", padding: "40px 0", fontSize: 14 };
