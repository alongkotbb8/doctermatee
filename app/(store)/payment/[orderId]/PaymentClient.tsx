"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { IconCreditCard, IconQr, IconShield, IconCheck } from "@/components/icons";

declare global {
  interface Window {
    Omise: {
      setPublicKey: (key: string) => void;
      createToken: (type: string, data: object, cb: (code: number, res: { id?: string; message?: string }) => void) => void;
    };
  }
}

type PayMethod = "card" | "promptpay";

interface Props {
  orderId: string;
  orderNo: string;
  total: number;
  omisePublicKey: string;
}

export default function PaymentClient({ orderId, orderNo, total, omisePublicKey }: Props) {
  const router = useRouter();
  const clearCart = useCart((s) => s.clearCart);
  const [method, setMethod] = useState<PayMethod>("promptpay");
  const [omiseReady, setOmiseReady] = useState(false);

  // Card fields
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoQrRef = useRef(false);

  // Load OmiseJS
  useEffect(() => {
    if (document.getElementById("omise-js")) { setOmiseReady(true); return; }
    const script = document.createElement("script");
    script.id = "omise-js";
    script.src = "https://cdn.omise.co/omise.js";
    script.onload = () => {
      window.Omise.setPublicKey(omisePublicKey);
      setOmiseReady(true);
    };
    document.head.appendChild(script);
  }, [omisePublicKey]);

  // Poll for payment status after QR shown
  useEffect(() => {
    if (!polling) { if (pollRef.current) clearInterval(pollRef.current); return; }
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/payment/status?order_id=${orderId}`);
      const json = await res.json();
      if (json.paid) {
        clearInterval(pollRef.current!);
        clearCart();
        router.push(`/order/${orderId}?success=1`);
      }
    }, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [polling, orderId, router]);

  async function payByCard() {
    if (!omiseReady) { setError("ระบบยังโหลดไม่เสร็จ กรุณารอสักครู่"); return; }
    setLoading(true); setError("");

    const [month, year] = [parseInt(expMonth), parseInt(expYear)];
    window.Omise.createToken("card", {
      name: cardName,
      number: cardNumber.replace(/\s/g, ""),
      expiration_month: month,
      expiration_year: year,
      security_code: cvv,
    }, async (code, res) => {
      if (code !== 200 || !res.id) {
        setError(res.message ?? "ข้อมูลบัตรไม่ถูกต้อง");
        setLoading(false);
        return;
      }
      const charge = await fetch("/api/payment/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, token: res.id, method: "card" }),
      });
      const chargeJson = await charge.json();
      if (chargeJson.status === "successful") {
        clearCart();
        router.push(`/order/${orderId}?success=1`);
      } else {
        setError(chargeJson.error ?? "การชำระเงินไม่สำเร็จ กรุณาลองใหม่");
        setLoading(false);
      }
    });
  }

  // สร้าง QR PromptPay อัตโนมัติเมื่อเข้าหน้า/เลือก PromptPay (ไม่ต้องกดเอง)
  useEffect(() => {
    if (method === "promptpay" && !qrImage && !loading && !autoQrRef.current) {
      autoQrRef.current = true;
      payByPromptPay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, qrImage, loading]);

  async function payByPromptPay() {
    setLoading(true); setError("");
    const res = await fetch("/api/payment/charge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, method: "promptpay" }),
    });
    const json = await res.json();
    if (json.qr_image) {
      setQrImage(json.qr_image);
      setPolling(true);
    } else {
      setError(json.error ?? "ไม่สามารถสร้าง QR ได้");
    }
    setLoading(false);
  }

  const tabStyle = (active: boolean) => ({
    flex: 1, padding: "12px 0", border: "none",
    background: active ? "var(--teal-600)" : "var(--neutral-100)",
    color: active ? "#fff" : "var(--neutral-600)",
    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14,
    cursor: "pointer", transition: "all .2s",
    borderRadius: "var(--radius-full)",
  });

  const inputStyle = {
    width: "100%", height: 44,
    border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)",
    padding: "0 14px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none",
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--gradient-hero)", padding: "clamp(20px,6vw,40px) clamp(16px,5vw,24px)" }}>
      <div className="anim-pop-in" style={{ width: "100%", maxWidth: 440 }}>

        {/* Order info */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: "var(--neutral-500)" }}>ออเดอร์ #{orderNo}</p>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32, color: "var(--teal-700)", marginTop: 4 }}>
            ฿{total.toLocaleString()}
          </p>
        </div>

        <div className="card" style={{ padding: "clamp(20px,5vw,28px) clamp(18px,5vw,24px)" }}>

          {/* QR view */}
          {qrImage ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--neutral-800)", marginBottom: 16 }}>
                สแกน QR เพื่อชำระเงิน
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrImage} alt="PromptPay QR" style={{ width: 220, height: 220, margin: "0 auto 16px", display: "block", borderRadius: 12, border: "1px solid var(--neutral-100)" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--neutral-500)", fontSize: 13 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                กำลังรอการชำระเงิน…
              </div>
              <p style={{ fontSize: 12, color: "var(--neutral-400)", marginTop: 8 }}>QR หมดอายุใน 15 นาที</p>
            </div>
          ) : (
            <>
              {/* Method tabs */}
              <div style={{ display: "flex", gap: 6, background: "var(--neutral-100)", borderRadius: "var(--radius-full)", padding: 4, marginBottom: 24 }}>
                <button style={tabStyle(method === "promptpay")} onClick={() => setMethod("promptpay")}>
                  <IconQr size={14} color="inherit" /> PromptPay
                </button>
                <button style={tabStyle(method === "card")} onClick={() => setMethod("card")}>
                  <IconCreditCard size={14} color="inherit" /> บัตรเครดิต
                </button>
              </div>

              {/* PromptPay — QR สร้างอัตโนมัติ */}
              {method === "promptpay" && (
                <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--teal-50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <IconQr size={30} color="var(--teal-600)" />
                  </div>
                  {error ? (
                    <button onClick={() => { autoQrRef.current = true; payByPromptPay(); }} disabled={loading} className="btn-pop"
                      style={{ width: "100%", background: loading ? "var(--neutral-300)" : "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "14px 0", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer" }}>
                      {loading ? "กำลังสร้าง QR…" : "ลองสร้าง QR อีกครั้ง"}
                    </button>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "8px 0 16px", color: "var(--neutral-500)" }}>
                      <span style={{ width: 26, height: 26, borderRadius: "50%", border: "3px solid var(--teal-100)", borderTopColor: "var(--teal-600)", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                      <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>กำลังสร้าง QR Code สำหรับสแกนจ่าย…</p>
                    </div>
                  )}
                </div>
              )}

              {/* Card */}
              {method === "card" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>ชื่อบนบัตร</label>
                    <input value={cardName} onChange={(e) => setCardName(e.target.value)} style={inputStyle} placeholder="SOMCHAI JAIDEE"
                      onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>หมายเลขบัตร</label>
                    <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())} maxLength={19} style={inputStyle} placeholder="0000 0000 0000 0000"
                      onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>เดือน</label>
                      <input value={expMonth} onChange={(e) => setExpMonth(e.target.value)} style={inputStyle} placeholder="MM" maxLength={2}
                        onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>ปี</label>
                      <input value={expYear} onChange={(e) => setExpYear(e.target.value)} style={inputStyle} placeholder="YYYY" maxLength={4}
                        onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>CVV</label>
                      <input value={cvv} onChange={(e) => setCvv(e.target.value)} style={inputStyle} placeholder="123" maxLength={4} type="password"
                        onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }} onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; }} />
                    </div>
                  </div>
                  <button onClick={payByCard} disabled={loading || !omiseReady} className="btn-pop"
                    style={{ width: "100%", background: loading ? "var(--neutral-300)" : "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "14px 0", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
                    {loading ? "กำลังประมวลผล…" : `ชำระ ฿${total.toLocaleString()}`}
                  </button>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "var(--neutral-400)", fontSize: 12 }}>
                    <IconShield size={12} color="var(--neutral-400)" /> ข้อมูลบัตรเข้ารหัสด้วย SSL — Powered by Omise
                  </div>
                </div>
              )}

              {error && (
                <div style={{ marginTop: 14, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "#DC2626" }}>
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Security badge */}
        <div style={{ textAlign: "center", marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "var(--neutral-400)", fontSize: 12 }}>
          <IconCheck size={12} color="var(--teal-500)" /> ปลอดภัย 100% — ไม่มีการเก็บข้อมูลบัตร
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}
