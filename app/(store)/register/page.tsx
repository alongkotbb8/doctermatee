import RegisterForm from "./RegisterForm";
import Link from "next/link";
import { IconPlus } from "@/components/icons";

export const metadata = { title: "สมัครสมาชิก — Doctermatee" };

export default function RegisterPage() {
  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--gradient-hero)", padding: "40px 24px" }}>
      <div className="anim-pop-in" style={{ width: "100%", maxWidth: 440, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", backdropFilter: "blur(var(--glass-blur))", boxShadow: "var(--shadow-lg)", padding: "40px 36px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 16 }}>
            <span style={{ width: 38, height: 38, borderRadius: 10, background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconPlus size={20} color="#fff" />
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--neutral-900)" }}>Doctermatee</span>
          </Link>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--neutral-900)", marginBottom: 6 }}>สมัครสมาชิก</h1>
          <p style={{ fontSize: 14, color: "var(--neutral-500)" }}>สร้างบัญชีเพื่อติดตามออเดอร์และสิทธิพิเศษ</p>
        </div>
        <RegisterForm />
        <p style={{ textAlign: "center", fontSize: 14, color: "var(--neutral-500)", marginTop: 20 }}>
          มีบัญชีแล้ว?{" "}
          <Link href="/login" style={{ color: "var(--teal-600)", fontWeight: 600, textDecoration: "none" }}>เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
}
