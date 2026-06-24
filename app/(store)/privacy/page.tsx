import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว",
  description: "นโยบายความเป็นส่วนตัวของ Doctermatee — วิธีที่เราเก็บ ใช้ และคุ้มครองข้อมูลส่วนบุคคลของคุณ",
};

const SECTIONS: { h: string; p: string }[] = [
  { h: "1. ข้อมูลที่เราเก็บรวบรวม", p: "เราเก็บข้อมูลที่จำเป็นต่อการให้บริการ ได้แก่ ชื่อ-นามสกุล อีเมล เบอร์โทรศัพท์ ที่อยู่จัดส่ง และประวัติการสั่งซื้อ ข้อมูลการชำระเงินดำเนินการผ่านผู้ให้บริการ Omise โดยตรง เราไม่จัดเก็บหมายเลขบัตรเครดิตของคุณ" },
  { h: "2. วัตถุประสงค์การใช้ข้อมูล", p: "เราใช้ข้อมูลเพื่อดำเนินการสั่งซื้อและจัดส่ง แจ้งสถานะออเดอร์ ให้บริการหลังการขาย และปรับปรุงประสบการณ์การใช้งาน เราจะไม่ใช้ข้อมูลของคุณนอกเหนือจากวัตถุประสงค์ที่แจ้งไว้" },
  { h: "3. การเปิดเผยข้อมูล", p: "เราจะไม่ขายหรือให้เช่าข้อมูลส่วนบุคคลของคุณแก่บุคคลที่สาม ยกเว้นผู้ให้บริการที่จำเป็น เช่น บริษัทขนส่งและผู้ให้บริการชำระเงิน เพื่อดำเนินการตามคำสั่งซื้อของคุณเท่านั้น" },
  { h: "4. ความปลอดภัยของข้อมูล", p: "เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสม ทั้งการเข้ารหัสข้อมูล (SSL) และการควบคุมการเข้าถึง เพื่อปกป้องข้อมูลของคุณจากการเข้าถึงโดยไม่ได้รับอนุญาต" },
  { h: "5. สิทธิของเจ้าของข้อมูล", p: "คุณมีสิทธิขอเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของคุณ รวมถึงขอถอนความยินยอมได้ตลอดเวลา โดยติดต่อผ่านช่องทางที่ระบุในหน้า “ติดต่อเรา”" },
  { h: "6. คุกกี้", p: "เว็บไซต์ใช้คุกกี้ที่จำเป็นเพื่อให้ระบบทำงานได้อย่างถูกต้อง เช่น การจดจำตะกร้าสินค้าและสถานะการเข้าสู่ระบบ" },
];

export default function PrivacyPage() {
  return <LegalPage title="นโยบายความเป็นส่วนตัว" updated="ปรับปรุงล่าสุด: มิถุนายน 2569" sections={SECTIONS} />;
}

function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: { h: string; p: string }[] }) {
  return (
    <div style={{ padding: "48px 0 80px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32, color: "var(--neutral-900)", marginBottom: 8 }}>{title}</h1>
        <p style={{ fontSize: 13, color: "var(--neutral-400)", marginBottom: 36 }}>{updated}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {sections.map((s) => (
            <section key={s.h}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--neutral-900)", marginBottom: 10 }}>{s.h}</h2>
              <p style={{ fontSize: 15, color: "var(--neutral-600)", lineHeight: 1.9 }}>{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
