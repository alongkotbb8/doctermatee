"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconMail } from "@/components/icons";

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/account`,
    });
    if (error) {
      setError("ส่งอีเมลไม่สำเร็จ กรุณาลองใหม่");
      setLoading(false);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✉️</div>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--neutral-900)", marginBottom: 8 }}>ส่งลิงก์แล้ว</h3>
        <p style={{ fontSize: 14, color: "var(--neutral-500)", lineHeight: 1.7 }}>
          หากมีบัญชีที่ใช้อีเมล <strong>{email}</strong><br />
          เราได้ส่งลิงก์ตั้งรหัสผ่านใหม่ไปให้แล้วครับ
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--neutral-700)", marginBottom: 6 }}>อีเมล</label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <IconMail size={16} color="var(--neutral-400)" />
          </span>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            style={{ width: "100%", height: 44, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", paddingLeft: 38, paddingRight: 14, fontSize: 14, fontFamily: "var(--font-body)", outline: "none", background: "#fff" }}
            onFocus={(e) => { e.target.style.borderColor = "var(--color-primary)"; e.target.style.boxShadow = "var(--focus-ring)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "#DC2626" }}>
          {error}
        </div>
      )}

      <button
        type="submit" disabled={loading} className="btn-pop"
        style={{ marginTop: 4, width: "100%", background: loading ? "var(--neutral-300)" : "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "13px 0", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "กำลังส่ง…" : "ส่งลิงก์ตั้งรหัสผ่านใหม่"}
      </button>
    </form>
  );
}
