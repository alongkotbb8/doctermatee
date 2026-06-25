import Link from "next/link";
import { getSettings } from "@/lib/data";
import { IconPhone, IconMail, IconClock, IconCreditCard, IconQr } from "./icons";
import Logo from "./Logo";

export default async function Footer() {
  const settings = await getSettings();
  const c = (settings.contact ?? {}) as { phone?: string; email?: string; hours?: string };
  const phone = c.phone ?? "02-123-4567";
  const email = c.email ?? "hello@doctermatee.co.th";
  const hours = c.hours ?? "ทุกวัน 8:00–20:00";
  return (
    <footer style={{ background: "var(--teal-900)", color: "#9FE1CB", padding: "54px 0 26px", marginTop: "auto" }}>
      <div className="wrap">
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr", gap: 32, marginBottom: 36 }}>
          <div>
            <div style={{ marginBottom: 14 }}>
              <Logo size={28} dark />
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.8 }}>ร้านอาหารเสริม วิตามิน และผลิตภัณฑ์ดูแลสุขภาพ ที่คัดสรรของแท้มีเลข อย. พร้อมคำแนะนำจากแพทย์ผู้เชี่ยวชาญ</p>
            <div style={{ display: "flex", gap: 10, marginTop: 16, color: "#5DCAA5" }}>
              <IconCreditCard size={22} color="#5DCAA5" />
              <IconQr size={22} color="#5DCAA5" />
            </div>
          </div>
          <div>
            <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#fff", fontSize: 15, marginBottom: 14 }}>ช้อปปิ้ง</h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {[["สินค้าทั้งหมด", "/products"], ["วิตามิน", "/products?category=vitamins"], ["อาหารเสริม", "/products?category=supplements"], ["โปรโมชัน", "/products"]].map(([t, h]) => (
                <li key={t} style={{ marginBottom: 9, fontSize: 14 }}>
                  <Link href={h} style={{ color: "#9FE1CB", textDecoration: "none" }}>{t}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#fff", fontSize: 15, marginBottom: 14 }}>ช่วยเหลือ</h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {[["วิธีสั่งซื้อ", "/faq"], ["การจัดส่ง", "/faq"], ["คืนสินค้า", "/faq"], ["คำถามที่พบบ่อย", "/faq"]].map(([t, h]) => (
                <li key={t} style={{ marginBottom: 9, fontSize: 14 }}>
                  <Link href={h} style={{ color: "#9FE1CB", textDecoration: "none" }}>{t}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#fff", fontSize: 15, marginBottom: 14 }}>ติดต่อเรา</h4>
            <div style={{ fontSize: 14, lineHeight: 1 }}>
              {[
                { icon: <IconPhone size={14} color="#9FE1CB" />, text: phone },
                { icon: <IconMail size={14} color="#9FE1CB" />, text: email },
                { icon: <IconClock size={14} color="#9FE1CB" />, text: hours },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  {icon}<span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.12)", paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: 13 }}>
          <span>© 2026 Doctermatee. สงวนลิขสิทธิ์</span>
          <span>
            <Link href="/privacy" style={{ color: "#9FE1CB", textDecoration: "none" }}>นโยบายความเป็นส่วนตัว</Link>
            {" · "}
            <Link href="/terms" style={{ color: "#9FE1CB", textDecoration: "none" }}>เงื่อนไขการใช้งาน</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
