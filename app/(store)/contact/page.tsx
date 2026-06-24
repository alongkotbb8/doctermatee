import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { IconPhone, IconMail, IconClock, IconStethoscope } from "@/components/icons";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "ติดต่อเรา / ปรึกษาแพทย์",
  description: "ติดต่อ Doctermatee สอบถามสินค้า ปรึกษาเภสัชกรและแพทย์ผู้เชี่ยวชาญ",
};

interface Contact { phone?: string; email?: string; hours?: string }

export default async function ContactPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "contact").single();
  const c = (data?.value ?? {}) as Contact;
  const phone = c.phone ?? "02-123-4567";
  const email = c.email ?? "hello@doctermatee.co.th";
  const hours = c.hours ?? "ทุกวัน 8:00–20:00";

  const items = [
    { icon: <IconPhone size={22} color="var(--teal-600)" />, label: "โทรศัพท์", value: phone, href: `tel:${phone.replace(/[^0-9]/g, "")}` },
    { icon: <IconMail size={22} color="var(--teal-600)" />, label: "อีเมล", value: email, href: `mailto:${email}` },
    { icon: <IconClock size={22} color="var(--teal-600)" />, label: "เวลาทำการ", value: hours, href: null },
  ];

  return (
    <div style={{ padding: "48px 0 80px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--teal-50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <IconStethoscope size={30} color="var(--teal-600)" />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 34, color: "var(--neutral-900)", marginBottom: 12 }}>ติดต่อเรา / ปรึกษาแพทย์</h1>
          <p style={{ fontSize: 16, color: "var(--neutral-500)", maxWidth: 520, margin: "0 auto", lineHeight: 1.8 }}>
            มีคำถามเรื่องสินค้า การสั่งซื้อ หรือต้องการคำแนะนำด้านสุขภาพ ทีมเภสัชกรและแพทย์ของเรายินดีให้บริการ
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginBottom: 40 }}>
          {items.map((it) => (
            <div key={it.label} className="card" style={{ padding: "26px 20px", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--teal-50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>{it.icon}</div>
              <p style={{ fontSize: 13, color: "var(--neutral-400)", marginBottom: 4 }}>{it.label}</p>
              {it.href ? (
                <a href={it.href} style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-900)", textDecoration: "none" }}>{it.value}</a>
              ) : (
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-900)" }}>{it.value}</p>
              )}
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--neutral-900)", marginBottom: 16, textAlign: "center" }}>ส่งข้อความถึงเรา</h2>
        <ContactForm />
      </div>
      <style>{`@media(max-width:768px){div[style*="repeat(3"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
