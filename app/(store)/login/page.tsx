import LoginForm from "./LoginForm";
import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage() {
  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--gradient-hero)", padding: "40px 16px" }}>
      <div className="anim-pop-in auth-card" style={{ width: "100%", maxWidth: 460, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", backdropFilter: "blur(var(--glass-blur))", boxShadow: "var(--shadow-lg)", padding: "40px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ marginBottom: 16 }}><Logo size={32} /></div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--neutral-900)", marginBottom: 6 }}>เข้าสู่ระบบ</h1>
          <p style={{ fontSize: 14, color: "var(--neutral-500)" }}>ยินดีต้อนรับกลับมา</p>
        </div>
        <LoginForm />
        <p style={{ textAlign: "center", fontSize: 14, color: "var(--neutral-500)", marginTop: 20 }}>
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" style={{ color: "var(--teal-600)", fontWeight: 600, textDecoration: "none" }}>สมัครสมาชิก</Link>
        </p>
      </div>
    </div>
  );
}
