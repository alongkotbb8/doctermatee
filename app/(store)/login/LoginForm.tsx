"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
      return;
    }
    // admin → ไปหน้าหลังบ้านอัตโนมัติ, ลูกค้า → หน้าบัญชี
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    router.push(profile?.role === "admin" ? "/admin" : "/account");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--neutral-700)", marginBottom: 6 }}>อีเมล</label>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          style={{ width: "100%", height: 44, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "0 16px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", transition: "border-color .2s, box-shadow .2s", background: "#fff" }}
          onFocus={(e) => { e.target.style.borderColor = "var(--color-primary)"; e.target.style.boxShadow = "var(--focus-ring)"; }}
          onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; e.target.style.boxShadow = "none"; }}
        />
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--neutral-700)" }}>รหัสผ่าน</label>
          <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--teal-600)", fontWeight: 600, textDecoration: "none" }}>ลืมรหัสผ่าน?</Link>
        </div>
        <input
          type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={{ width: "100%", height: 44, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "0 16px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", transition: "border-color .2s, box-shadow .2s", background: "#fff" }}
          onFocus={(e) => { e.target.style.borderColor = "var(--color-primary)"; e.target.style.boxShadow = "var(--focus-ring)"; }}
          onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; e.target.style.boxShadow = "none"; }}
        />
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
        {loading ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
