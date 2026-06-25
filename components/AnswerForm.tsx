"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { IconCheck, IconUser } from "@/components/icons";

export default function AnswerForm({ questionId }: { questionId: string }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, []);

  async function submit() {
    if (body.trim().length < 10) { setError("คำตอบต้องมีอย่างน้อย 10 ตัวอักษร"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/qa/answer", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: questionId, body }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setError(json.error ?? "ส่งไม่สำเร็จ"); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div className="card" style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 12, background: "var(--teal-50)", borderColor: "var(--teal-100)" }}>
        <IconCheck size={18} color="var(--teal-600)" />
        <p style={{ margin: 0, fontSize: 14, color: "var(--neutral-700)" }}>ส่งคำตอบแล้ว! จะแสดงหลังทีมงานอนุมัติ</p>
      </div>
    );
  }

  if (authed === null) return null;

  if (!authed) {
    return (
      <div className="card" style={{ padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--neutral-600)" }}>
          <IconUser size={18} color="var(--teal-600)" /> เข้าสู่ระบบเพื่อตอบคำถามนี้
        </span>
        <Link href="/login" style={{ background: "var(--teal-600)", color: "#fff", borderRadius: "var(--radius-full)", padding: "9px 20px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>เข้าสู่ระบบ</Link>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-900)", margin: 0 }}>ตอบคำถามนี้</h3>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="แบ่งปันคำตอบหรือประสบการณ์ของคุณ…" maxLength={5000}
        style={{ width: "100%", border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "12px 16px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", resize: "vertical", lineHeight: 1.7 }}
        onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; }} />
      {error && <p style={{ margin: 0, fontSize: 13, color: "#DC2626" }}>{error}</p>}
      <button onClick={submit} disabled={loading} className="btn-pop" style={{ alignSelf: "flex-start", background: loading ? "var(--neutral-300)" : "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "11px 26px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>
        {loading ? "กำลังส่ง…" : "ส่งคำตอบ"}
      </button>
      <p style={{ margin: 0, fontSize: 12, color: "var(--neutral-400)" }}>คำตอบจะแสดงหลังทีมงานอนุมัติ</p>
    </div>
  );
}
