"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useCart } from "@/store/cart";
import { IconTag, IconTruck, IconUser, IconPhone, IconMail, IconShield } from "@/components/icons";
import Link from "next/link";
import Image from "next/image";

const SHIPPING_FEE = 50;
const FREE_SHIPPING_AT = 500;

interface Props {
  user: User | null;
  profile: { full_name: string | null; phone: string | null; default_address: Record<string, string> | null } | null;
}

export default function CheckoutClient({ user, profile }: Props) {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();

  const addr = profile?.default_address ?? {};
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [address, setAddress] = useState(addr.address ?? "");
  const [district, setDistrict] = useState(addr.district ?? "");
  const [province, setProvince] = useState(addr.province ?? "");
  const [postalCode, setPostalCode] = useState(addr.postal_code ?? "");

  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [couponData, setCouponData] = useState<{ discount_type: string; discount_value: number; code: string } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subtotal = totalPrice();
  const shipping = subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING_FEE;

  let discount = 0;
  if (couponData) {
    if (couponData.discount_type === "percent") {
      discount = Math.round(subtotal * couponData.discount_value / 100);
    } else {
      discount = couponData.discount_value;
    }
  }
  const total = subtotal + shipping - discount;

  useEffect(() => {
    if (items.length === 0) router.replace("/cart");
  }, [items, router]);

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponStatus("checking");
    const res = await fetch(`/api/coupon?code=${encodeURIComponent(couponCode.trim())}&subtotal=${subtotal}`);
    const json = await res.json();
    if (json.valid) {
      setCouponData(json.coupon);
      setCouponStatus("valid");
      setCouponMsg(json.message);
    } else {
      setCouponData(null);
      setCouponStatus("invalid");
      setCouponMsg(json.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !phone || !address || !district || !province || !postalCode) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ product_id: i.id, name: i.name, qty: i.qty, price: i.price })),
        shipping_address: { full_name: fullName, phone, email, address, district, province, postal_code: postalCode },
        coupon_code: couponData?.code ?? null,
        subtotal, shipping, discount, total,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
      setSubmitting(false);
      return;
    }

    clearCart();
    router.push(`/payment/${json.order_id}`);
  }

  if (items.length === 0) return null;

  const inputStyle = {
    width: "100%", height: 44,
    border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)",
    paddingLeft: 38, paddingRight: 14, fontSize: 14, fontFamily: "var(--font-body)", outline: "none",
  };
  const inputNoIconStyle = { ...inputStyle, paddingLeft: 14 };

  return (
    <div style={{ padding: "36px 0 64px", background: "var(--neutral-50)", minHeight: "80vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--neutral-900)", marginBottom: 28 }}>ชำระเงิน</h1>

        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
          {/* Left — shipping form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Shipping address card */}
            <div className="card" style={{ padding: "24px 22px" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--neutral-800)", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
                <IconTruck size={18} color="var(--teal-600)" /> ที่อยู่จัดส่ง
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* full name */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>ชื่อ-นามสกุล *</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><IconUser size={15} color="var(--neutral-400)" /></span>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} placeholder="สมชาย ใจดี"
                      onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; }} />
                  </div>
                </div>

                {/* phone */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>เบอร์โทร *</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><IconPhone size={15} color="var(--neutral-400)" /></span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} placeholder="08X-XXX-XXXX"
                      onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; }} />
                  </div>
                </div>

                {/* email */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>อีเมล *</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><IconMail size={15} color="var(--neutral-400)" /></span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="example@email.com"
                      onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; }} />
                  </div>
                </div>

                {/* address */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>ที่อยู่ *</label>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} style={inputNoIconStyle} placeholder="บ้านเลขที่ ถนน แขวง/ตำบล"
                    onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; }} />
                </div>

                {/* district */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>เขต/อำเภอ *</label>
                  <input value={district} onChange={(e) => setDistrict(e.target.value)} style={inputNoIconStyle} placeholder="เขต/อำเภอ"
                    onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; }} />
                </div>

                {/* province */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>จังหวัด *</label>
                  <input value={province} onChange={(e) => setProvince(e.target.value)} style={inputNoIconStyle} placeholder="กรุงเทพมหานคร"
                    onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; }} />
                </div>

                {/* postal */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>รหัสไปรษณีย์ *</label>
                  <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} style={inputNoIconStyle} placeholder="10110" maxLength={5}
                    onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; }} />
                </div>

                {/* note */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>หมายเหตุ (ไม่บังคับ)</label>
                  <textarea rows={2} style={{ width: "100%", border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "10px 14px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", resize: "vertical" }} placeholder="แจ้งวันรับ, ฝากไว้ที่รปภ. ฯลฯ"
                    onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; }} />
                </div>
              </div>
            </div>

            {/* Coupon card */}
            <div className="card" style={{ padding: "20px 22px" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--neutral-800)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <IconTag size={16} color="var(--teal-600)" /> โค้ดส่วนลด
              </h2>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={couponCode} onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponStatus("idle"); }}
                  style={{ flex: 1, height: 42, border: `1px solid ${couponStatus === "valid" ? "var(--teal-500)" : couponStatus === "invalid" ? "#EF4444" : "var(--neutral-200)"}`, borderRadius: "var(--radius-input)", padding: "0 14px", fontSize: 14, fontFamily: "var(--font-body)", letterSpacing: "0.08em", outline: "none" }}
                  placeholder="เช่น WELCOME10"
                  onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={(e) => { if (couponStatus === "idle") e.target.style.borderColor = "var(--neutral-200)"; }}
                />
                <button type="button" onClick={applyCoupon} disabled={couponStatus === "checking" || !couponCode.trim()}
                  style={{ padding: "0 20px", height: 42, background: "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}>
                  {couponStatus === "checking" ? "…" : "ใช้โค้ด"}
                </button>
              </div>
              {couponMsg && (
                <p style={{ marginTop: 8, fontSize: 13, color: couponStatus === "valid" ? "var(--teal-600)" : "#EF4444", fontWeight: 500 }}>
                  {couponStatus === "valid" ? "✓ " : "✗ "}{couponMsg}
                </p>
              )}
            </div>

            {/* Guest notice */}
            {!user && (
              <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "var(--radius-md)", padding: "14px 18px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <IconShield size={16} color="#D97706" />
                <p style={{ fontSize: 13, color: "#92400E", lineHeight: 1.6 }}>
                  คุณกำลังสั่งซื้อแบบไม่ได้ล็อกอิน{" "}
                  <Link href="/login" style={{ color: "var(--teal-600)", fontWeight: 600, textDecoration: "none" }}>เข้าสู่ระบบ</Link>{" "}
                  เพื่อติดตามออเดอร์ได้ง่ายกว่า
                </p>
              </div>
            )}
          </div>

          {/* Right — order summary */}
          <div style={{ position: "sticky", top: 90 }}>
            <div className="card" style={{ padding: "22px 20px" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--neutral-800)", marginBottom: 16 }}>สรุปออเดอร์</h2>

              {/* Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                {items.map((item) => (
                  <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 8, overflow: "hidden", background: "var(--neutral-100)", flexShrink: 0, position: "relative" }}>
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} sizes="52px" />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💊</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--neutral-800)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                      <p style={{ fontSize: 12, color: "var(--neutral-500)" }}>x{item.qty}</p>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--neutral-900)", whiteSpace: "nowrap" }}>฿{(item.price * item.qty).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px dashed var(--neutral-200)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <Row label="ราคาสินค้า" value={`฿${subtotal.toLocaleString()}`} />
                <Row label="ค่าจัดส่ง" value={shipping === 0 ? "ฟรี" : `฿${shipping}`} valueColor={shipping === 0 ? "var(--teal-600)" : undefined} />
                {discount > 0 && <Row label={`ส่วนลดโค้ด (${couponCode})`} value={`-฿${discount.toLocaleString()}`} valueColor="#EF4444" />}
              </div>

              <div style={{ borderTop: "2px solid var(--neutral-900)", marginTop: 14, paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)" }}>รวมทั้งหมด</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--teal-700)" }}>฿{total.toLocaleString()}</span>
              </div>

              {shipping > 0 && (
                <p style={{ textAlign: "center", fontSize: 12, color: "var(--neutral-400)", marginTop: 6 }}>
                  ซื้อเพิ่ม ฿{(FREE_SHIPPING_AT - subtotal).toLocaleString()} เพื่อรับส่งฟรี
                </p>
              )}

              {error && (
                <div style={{ marginTop: 12, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "#DC2626" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn-pop"
                style={{ marginTop: 16, width: "100%", background: submitting ? "var(--neutral-300)" : "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "14px 0", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, cursor: submitting ? "not-allowed" : "pointer" }}>
                {submitting ? "กำลังสร้างออเดอร์…" : "ดำเนินการชำระเงิน"}
              </button>

              <p style={{ textAlign: "center", fontSize: 12, color: "var(--neutral-400)", marginTop: 10, lineHeight: 1.6 }}>
                ชำระเงินผ่านระบบ Omise — บัตรเครดิต/เดบิต, PromptPay
              </p>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @media (max-width: 768px) {
          form { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "var(--neutral-600)" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: valueColor ?? "var(--neutral-800)" }}>{value}</span>
    </div>
  );
}
