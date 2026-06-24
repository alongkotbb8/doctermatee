"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function Field({ label, type = "text", value, onChange, placeholder, required = true }: {
  label: string; type?: string;
  value: string; onChange: (v: string) => void; placeholder: string; required?: boolean;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--neutral-700)", marginBottom: 6 }}>{label}</label>
      <input
        type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", height: 44, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "0 16px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", transition: "border-color .2s, box-shadow .2s", background: "#fff" }}
        onFocus={(e) => { e.target.style.borderColor = "var(--color-primary)"; e.target.style.boxShadow = "var(--focus-ring)"; }}
        onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("รหัสผ่านไม่ตรงกัน"); return; }
    if (password.length < 8) { setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); return; }
    setLoading(true); setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName, phone },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message === "User already registered" ? "อีเมลนี้มีบัญชีอยู่แล้ว" : "เกิดข้อผิดพลาด กรุณาลองใหม่");
      setLoading(false);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✉️</div>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--neutral-900)", marginBottom: 8 }}>ตรวจสอบอีเมลของคุณ</h3>
        <p style={{ fontSize: 14, color: "var(--neutral-500)", lineHeight: 1.7 }}>
          ส่งลิงก์ยืนยันไปยัง <strong>{email}</strong> แล้วครับ<br />
          กรุณากดลิงก์ในอีเมลเพื่อเปิดใช้งานบัญชี
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="ชื่อ-นามสกุล" value={fullName} onChange={setFullName} placeholder="สมชาย ใจดี" />
      <Field label="เบอร์โทรศัพท์" value={phone} onChange={setPhone} placeholder="08X-XXX-XXXX" required={false} />
      <Field label="อีเมล" type="email" value={email} onChange={setEmail} placeholder="example@email.com" />
      <Field label="รหัสผ่าน" type="password" value={password} onChange={setPassword} placeholder="อย่างน้อย 8 ตัวอักษร" />
      <Field label="ยืนยันรหัสผ่าน" type="password" value={confirm} onChange={setConfirm} placeholder="พิมพ์รหัสผ่านอีกครั้ง" />

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "#DC2626" }}>
          {error}
        </div>
      )}

      <button
        type="submit" disabled={loading} className="btn-pop"
        style={{ marginTop: 4, width: "100%", background: loading ? "var(--neutral-300)" : "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "13px 0", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "กำลังสมัคร…" : "สมัครสมาชิก"}
      </button>
    </form>
  );
}
