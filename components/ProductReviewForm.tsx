"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { IconStar, IconCheck, IconUser } from "@/components/icons";

export default function ProductReviewForm({ productId }: { productId: string }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, []);

  async function submit() {
    if (rating < 1) { setError("กรุณาเลือกคะแนนดาว"); return; }
    if (body.trim().length < 10) { setError("เขียนรีวิวอย่างน้อย 10 ตัวอักษร"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/product-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, rating, title, body }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setError(json.error ?? "ส่งไม่สำเร็จ"); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div className="card" style={{ padding: "22px 24px", display: "flex", alignItems: "center", gap: 12, background: "var(--teal-50)", borderColor: "var(--teal-100)" }}>
        <IconCheck size={20} color="var(--teal-600)" />
        <p style={{ margin: 0, fontSize: 14, color: "var(--neutral-700)", lineHeight: 1.6 }}>
          ขอบคุณสำหรับรีวิว! รีวิวของคุณจะแสดงหลังทีมงานตรวจสอบและอนุมัติ
        </p>
      </div>
    );
  }

  if (authed === null) return null; // กำลังเช็คสถานะ

  if (!authed) {
    return (
      <div className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--neutral-600)" }}>
          <IconUser size={18} color="var(--teal-600)" /> เข้าสู่ระบบเพื่อเขียนรีวิวสินค้านี้
        </span>
        <Link href="/login" style={{ background: "var(--teal-600)", color: "#fff", borderRadius: "var(--radius-full)", padding: "10px 22px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>เข้าสู่ระบบ</Link>
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-pop" style={{ background: "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "12px 26px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
        เขียนรีวิว
      </button>
    );
  }

  return (
    <div className="card" style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--neutral-900)", margin: 0 }}>เขียนรีวิวของคุณ</h3>

      {/* ดาว */}
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => setRating(i)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 2, lineHeight: 0 }} aria-label={`ให้ ${i} ดาว`}>
            <IconStar size={28} color={(hover || rating) >= i ? "#F59E0B" : "var(--neutral-200)"} />
          </button>
        ))}
      </div>

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="หัวข้อรีวิว (ไม่บังคับ)" maxLength={120}
        style={{ width: "100%", height: 44, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "0 16px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none" }}
        onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; }} />

      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="เล่าประสบการณ์การใช้สินค้านี้…" maxLength={2000}
        style={{ width: "100%", border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "12px 16px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", resize: "vertical", lineHeight: 1.7 }}
        onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; }} />

      {error && <p style={{ margin: 0, fontSize: 13, color: "#DC2626" }}>{error}</p>}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={submit} disabled={loading} className="btn-pop" style={{ background: loading ? "var(--neutral-300)" : "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "11px 26px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "กำลังส่ง…" : "ส่งรีวิว"}
        </button>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-full)", padding: "11px 22px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--neutral-600)", cursor: "pointer" }}>
          ยกเลิก
        </button>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "var(--neutral-400)" }}>รีวิวจะแสดงหลังทีมงานอนุมัติ</p>
    </div>
  );
}
