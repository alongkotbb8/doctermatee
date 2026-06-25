"use client";

import { useState } from "react";
import { IconCheck } from "@/components/icons";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("สอบถามสินค้า");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("กรุณากรอกชื่อ อีเมล และข้อความให้ครบ");
      return;
    }
    setLoading(true); setError("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, topic, message }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? "ส่งไม่สำเร็จ"); setLoading(false); return; }
    setSent(true); setLoading(false);
  }

  const inp = { width: "100%", height: 44, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "0 16px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", background: "#fff" } as React.CSSProperties;
  const lbl: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "var(--neutral-700)", marginBottom: 6 };
  const foc = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.target.style.borderColor = "var(--teal-600)"; };
  const blr = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.target.style.borderColor = "var(--neutral-200)"; };

  if (sent) {
    return (
      <div className="card anim-pop-in" style={{ padding: "40px 28px", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--green-100)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <IconCheck size={26} color="var(--green-700)" />
        </div>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--neutral-900)", marginBottom: 8 }}>ส่งข้อความเรียบร้อย</h3>
        <p style={{ fontSize: 14, color: "var(--neutral-500)", lineHeight: 1.7 }}>ทีมงานจะติดต่อกลับโดยเร็วที่สุดครับ ขอบคุณที่ติดต่อ Doctermatee</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card" style={{ padding: "28px 26px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={lbl}>ชื่อ-นามสกุล *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={inp} placeholder="สมชาย ใจดี" onFocus={foc} onBlur={blr} />
        </div>
        <div>
          <label style={lbl}>เบอร์โทร</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inp} placeholder="08X-XXX-XXXX" onFocus={foc} onBlur={blr} />
        </div>
        <div>
          <label style={lbl}>อีเมล *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inp} placeholder="example@email.com" onFocus={foc} onBlur={blr} />
        </div>
        <div>
          <label style={lbl}>หัวข้อ</label>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} style={inp} onFocus={foc} onBlur={blr}>
            <option>สอบถามสินค้า</option>
            <option>ปรึกษาแพทย์/เภสัชกร</option>
            <option>ติดตามออเดอร์</option>
            <option>อื่นๆ</option>
          </select>
        </div>
      </div>
      <div>
        <label style={lbl}>ข้อความ *</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5}
          style={{ ...inp, height: "auto", padding: "12px 14px", resize: "vertical" }}
          placeholder="พิมพ์คำถามหรือเรื่องที่ต้องการปรึกษา..." onFocus={foc} onBlur={blr} />
      </div>

      {error && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "#DC2626" }}>{error}</div>}

      <button type="submit" disabled={loading} className="btn-pop"
        style={{ alignSelf: "flex-start", background: loading ? "var(--neutral-300)" : "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "13px 32px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}>
        {loading ? "กำลังส่ง…" : "ส่งข้อความ"}
      </button>
    </form>
  );
}
