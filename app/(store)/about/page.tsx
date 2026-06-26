import type { Metadata } from "next";
import Link from "next/link";
import { IconShield, IconLeaf, IconHeartPulse, IconArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description: "Doctermatee ร้านอาหารเสริมและวิตามินคุณภาพสูง คัดสรรของแท้มีเลข อย. พร้อมคำแนะนำจากแพทย์ผู้เชี่ยวชาญ",
};

const VALUES = [
  { icon: <IconShield size={24} color="var(--teal-600)" />, title: "ของแท้ 100%", desc: "สินค้าทุกชิ้นมีเลข อย. นำเข้าและจัดจำหน่ายอย่างถูกต้องตามกฎหมาย" },
  { icon: <IconHeartPulse size={24} color="var(--teal-600)" />, title: "คัดโดยผู้เชี่ยวชาญ", desc: "ทีมเภสัชกรและแพทย์ช่วยคัดสรรผลิตภัณฑ์ที่ปลอดภัยและได้ผลจริง" },
  { icon: <IconLeaf size={24} color="var(--teal-600)" />, title: "ใส่ใจทุกขั้นตอน", desc: "จัดเก็บในอุณหภูมิที่เหมาะสม จัดส่งรวดเร็ว พร้อมบริการหลังการขาย" },
];

export default function AboutPage() {
  return (
    <div style={{ padding: "48px 0 80px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 36, color: "var(--neutral-900)", marginBottom: 14 }}>เกี่ยวกับ Doctermatee</h1>
          <p style={{ fontSize: 16, color: "var(--neutral-500)", maxWidth: 600, margin: "0 auto", lineHeight: 1.8 }}>
            เราเชื่อว่าสุขภาพดีคือรากฐานของชีวิตที่มีความสุข Doctermatee จึงตั้งใจคัดสรรอาหารเสริม วิตามิน
            และผลิตภัณฑ์ดูแลสุขภาพคุณภาพสูง เพื่อให้คนไทยเข้าถึงของแท้ในราคาที่เป็นธรรม
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 56 }}>
          {VALUES.map((v) => (
            <div key={v.title} className="card" style={{ padding: "28px 24px", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--teal-50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>{v.icon}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--neutral-900)", marginBottom: 8 }}>{v.title}</h3>
              <p style={{ fontSize: 14, color: "var(--neutral-500)", lineHeight: 1.7 }}>{v.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ background: "linear-gradient(120deg,var(--teal-700),var(--teal-500))", borderRadius: "var(--radius-lg)", padding: "40px 44px", textAlign: "center", color: "#fff" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, marginBottom: 10 }}>พร้อมเริ่มต้นดูแลสุขภาพแล้วหรือยัง?</h2>
          <p style={{ color: "#CFFAEE", marginBottom: 24, fontSize: 15 }}>เลือกชมสินค้าคุณภาพที่เราคัดสรรมาเพื่อคุณ</p>
          <Link href="/products" className="promo-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "var(--teal-700)", borderRadius: "var(--radius-full)", padding: "12px 28px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
            ดูสินค้าทั้งหมด <IconArrowRight size={16} color="var(--teal-700)" />
          </Link>
        </div>
      </div>
    </div>
  );
}
