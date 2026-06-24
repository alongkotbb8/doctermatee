import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "คำถามที่พบบ่อย",
  description: "วิธีสั่งซื้อ การจัดส่ง การชำระเงิน และการคืนสินค้า — คำถามที่พบบ่อยของ Doctermatee",
};

const FAQS: { q: string; a: string }[] = [
  { q: "สั่งซื้อสินค้าอย่างไร?", a: "เลือกสินค้าที่ต้องการ กด “เพิ่มลงตะกร้า” จากนั้นไปที่ตะกร้าสินค้าแล้วกด “ดำเนินการต่อ” กรอกที่อยู่จัดส่งและเลือกวิธีชำระเงิน (บัตรเครดิต/เดบิต หรือ PromptPay) ระบบจะยืนยันออเดอร์ให้ทันที" },
  { q: "มีค่าจัดส่งเท่าไหร่?", a: "ค่าจัดส่งมาตรฐาน 50 บาททั่วประเทศ และจัดส่งฟรีเมื่อสั่งซื้อครบ 500 บาทขึ้นไป" },
  { q: "ใช้เวลาจัดส่งกี่วัน?", a: "โดยปกติจัดส่งภายใน 1–3 วันทำการ คุณจะได้รับเลขพัสดุทางอีเมลเมื่อสินค้าถูกจัดส่ง และสามารถติดตามสถานะได้จากหน้า “บัญชีของฉัน”" },
  { q: "ชำระเงินด้วยวิธีใดได้บ้าง?", a: "รองรับบัตรเครดิต/เดบิต (Visa, Mastercard, JCB) และ PromptPay QR ผ่านระบบ Omise ที่ปลอดภัยตามมาตรฐาน PCI-DSS" },
  { q: "สินค้าเป็นของแท้หรือไม่?", a: "สินค้าทุกชิ้นเป็นของแท้ มีเลขทะเบียน อย. และนำเข้า/จัดจำหน่ายอย่างถูกต้องตามกฎหมาย" },
  { q: "เปลี่ยนหรือคืนสินค้าได้ไหม?", a: "หากสินค้าชำรุดหรือไม่ตรงตามที่สั่ง สามารถแจ้งภายใน 7 วันนับจากวันที่ได้รับสินค้า โดยสินค้าต้องอยู่ในสภาพเดิมและยังไม่เปิดใช้งาน ทีมงานจะดำเนินการเปลี่ยน/คืนเงินให้" },
  { q: "ต้องสมัครสมาชิกก่อนสั่งซื้อไหม?", a: "ไม่จำเป็น สามารถสั่งซื้อแบบไม่ล็อกอินได้ แต่การสมัครสมาชิกจะช่วยให้ติดตามออเดอร์และบันทึกที่อยู่ได้สะดวกขึ้น" },
];

export default function FaqPage() {
  return (
    <div style={{ padding: "48px 0 80px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 34, color: "var(--neutral-900)", marginBottom: 12 }}>คำถามที่พบบ่อย</h1>
          <p style={{ fontSize: 16, color: "var(--neutral-500)" }}>รวมคำถามเกี่ยวกับการสั่งซื้อ จัดส่ง และคืนสินค้า</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {FAQS.map((f, i) => (
            <details key={i} className="card" style={{ padding: "18px 22px", cursor: "pointer" }}>
              <summary style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--neutral-900)", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                {f.q}
                <span style={{ color: "var(--teal-600)", fontSize: 22, fontWeight: 400, lineHeight: 1 }}>+</span>
              </summary>
              <p style={{ fontSize: 14, color: "var(--neutral-600)", lineHeight: 1.8, marginTop: 12 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
      <style>{`details summary::-webkit-details-marker{display:none}`}</style>
    </div>
  );
}
