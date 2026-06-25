"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useCart } from "@/store/cart";
import { IconTag, IconTruck, IconShield, IconPill, IconCreditCard, IconQr } from "@/components/icons";
import Link from "next/link";
import Image from "next/image";

interface Props {
  user: User | null;
  profile: { full_name: string | null; phone: string | null; default_address: Record<string, string> | null } | null;
  freeThreshold?: number;
  standardFee?: number;
}

export default function CheckoutClient({ user, profile, freeThreshold = 500, standardFee = 50 }: Props) {
  const router = useRouter();
  const { items, totalPrice } = useCart();
  const SHIPPING_FEE = standardFee;
  const FREE_SHIPPING_AT = freeThreshold;
  const placedRef = useRef(false);

  const addr = profile?.default_address ?? {};
  const [fullName, setFullName] = useState(profile?.full_name ?? addr.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? addr.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? addr.email ?? "");
  const [address, setAddress] = useState(addr.address ?? "");
  const [district, setDistrict] = useState(addr.district ?? "");
  const [province, setProvince] = useState(addr.province ?? "");
  const [postalCode, setPostalCode] = useState(addr.postal_code ?? "");

  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [couponData, setCouponData] = useState<{ discount_type: string; discount_value: number; code: string } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");

  const [payMethod, setPayMethod] = useState<"promptpay" | "card">("promptpay");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

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
    // อย่าเด้งกลับ /cart ระหว่างกำลังพาไปหน้าชำระเงิน (cart จะถูกล้างหลังจ่ายสำเร็จ)
    if (items.length === 0 && !placedRef.current) router.replace("/cart");
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
    const required: Record<string, string> = { fullName, phone, email, address, district, province, postalCode };
    const missing: Record<string, boolean> = {};
    Object.entries(required).forEach(([k, v]) => { if (!v.trim()) missing[k] = true; });
    if (Object.keys(missing).length > 0) {
      setFieldErrors(missing);
      setError("กรุณากรอกข้อมูลในช่องที่ไฮไลต์ให้ครบ");
      return;
    }
    setFieldErrors({});
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

    // FR1: ที่อยู่ถูกบันทึกผูกบัญชีฝั่ง server แล้วใน /api/order (service client ข้าม RLS)
    // → pre-fill ครบทุกช่องในการสั่งซื้อครั้งถัดไป

    // ไม่ล้าง cart ที่นี่ — จะล้างหลังชำระเงินสำเร็จในหน้า /payment
    placedRef.current = true;
    router.push(`/payment/${json.order_id}?method=${payMethod}`);
  }

  if (items.length === 0) return null;

  const inputStyle = {
    width: "100%", height: 44,
    border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)",
    padding: "0 16px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none",
  };
  const inputNoIconStyle = inputStyle;

  // ไฮไลต์ช่องที่กรอกไม่ครบเป็นสีแดง
  const fieldStyle = (key: string, base: React.CSSProperties) => ({
    ...base, borderColor: fieldErrors[key] ? "#EF4444" : "var(--neutral-200)",
  });
  const clearErr = (key: string) => { if (fieldErrors[key]) setFieldErrors((p) => ({ ...p, [key]: false })); };
  const onBlurField = (key: string) => (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = fieldErrors[key] ? "#EF4444" : "var(--neutral-200)";
  };

  return (
    <div style={{ padding: "36px 0 64px", background: "var(--neutral-50)", minHeight: "80vh" }}>
      <div className="wrap">
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--neutral-900)", marginBottom: 28 }}>ชำระเงิน</h1>

        <form onSubmit={handleSubmit} className="grid-12" style={{ gap: 24 }}>
          {/* Left — shipping form */}
          <div className="col-8" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Shipping address card */}
            <div className="card" style={{ padding: "24px 22px" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--neutral-800)", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
                <IconTruck size={18} color="var(--teal-600)" /> ที่อยู่จัดส่ง
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* full name */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>ชื่อ-นามสกุล *</label>
                  <input value={fullName} onChange={(e) => { setFullName(e.target.value); clearErr("fullName"); }} style={fieldStyle("fullName", inputStyle)} placeholder="สมชาย ใจดี"
                    onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={onBlurField("fullName")} />
                </div>

                {/* phone */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>เบอร์โทร *</label>
                  <input value={phone} onChange={(e) => { setPhone(e.target.value); clearErr("phone"); }} style={fieldStyle("phone", inputStyle)} placeholder="08X-XXX-XXXX"
                    onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={onBlurField("phone")} />
                </div>

                {/* email */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>อีเมล *</label>
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); clearErr("email"); }} style={fieldStyle("email", inputStyle)} placeholder="example@email.com"
                    onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={onBlurField("email")} />
                </div>

                {/* address */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>ที่อยู่ *</label>
                  <input value={address} onChange={(e) => { setAddress(e.target.value); clearErr("address"); }} style={fieldStyle("address", inputNoIconStyle)} placeholder="บ้านเลขที่ ถนน แขวง/ตำบล"
                    onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={onBlurField("address")} />
                </div>

                {/* district */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>เขต/อำเภอ *</label>
                  <input value={district} onChange={(e) => { setDistrict(e.target.value); clearErr("district"); }} style={fieldStyle("district", inputNoIconStyle)} placeholder="เขต/อำเภอ"
                    onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={onBlurField("district")} />
                </div>

                {/* province */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>จังหวัด *</label>
                  <input value={province} onChange={(e) => { setProvince(e.target.value); clearErr("province"); }} style={fieldStyle("province", inputNoIconStyle)} placeholder="กรุงเทพมหานคร"
                    onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={onBlurField("province")} />
                </div>

                {/* postal */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>รหัสไปรษณีย์ *</label>
                  <input value={postalCode} onChange={(e) => { setPostalCode(e.target.value); clearErr("postalCode"); }} style={fieldStyle("postalCode", inputNoIconStyle)} placeholder="10110" maxLength={5}
                    onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={onBlurField("postalCode")} />
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
                  style={{ flex: 1, height: 42, border: `1px solid ${couponStatus === "valid" ? "var(--teal-500)" : couponStatus === "invalid" ? "#EF4444" : "var(--neutral-200)"}`, borderRadius: "var(--radius-input)", padding: "0 16px", fontSize: 14, fontFamily: "var(--font-body)", letterSpacing: "0.08em", outline: "none" }}
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

            {/* Payment method selection */}
            <div className="card" style={{ padding: "20px 22px" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--neutral-800)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <IconCreditCard size={16} color="var(--teal-600)" /> วิธีชำระเงิน
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {([
                  { value: "promptpay" as const, label: "PromptPay QR Code", sub: "สแกนจ่ายได้ทุกธนาคาร รวดเร็ว ปลอดภัย", Icon: IconQr },
                  { value: "card" as const, label: "บัตรเครดิต / เดบิต", sub: "Visa, Mastercard, JCB — ชำระทันที", Icon: IconCreditCard },
                ] as const).map((opt) => {
                  const active = payMethod === opt.value;
                  return (
                    <button key={opt.value} type="button" onClick={() => setPayMethod(opt.value)}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", border: `2px solid ${active ? "var(--teal-500)" : "var(--neutral-200)"}`, borderRadius: "var(--radius-md)", background: active ? "var(--teal-50)" : "#fff", cursor: "pointer", textAlign: "left", transition: "all .15s", width: "100%" }}>
                      <opt.Icon size={22} color={active ? "var(--teal-600)" : "var(--neutral-400)"} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: active ? "var(--teal-700)" : "var(--neutral-800)", margin: 0 }}>{opt.label}</p>
                        <p style={{ fontSize: 12, color: "var(--neutral-500)", margin: "2px 0 0" }}>{opt.sub}</p>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${active ? "var(--teal-500)" : "var(--neutral-300)"}`, background: active ? "var(--teal-500)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
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
          <div className="col-4" style={{ position: "sticky", top: 90 }}>
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
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><IconPill size={22} color="var(--teal-400)" /></div>
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
