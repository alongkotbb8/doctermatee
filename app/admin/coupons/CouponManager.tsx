"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconPlus, IconTag, IconTrash, IconCheck } from "@/components/icons";

interface Coupon {
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_order: number;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  active: boolean;
}

export default function CouponManager({ initial }: { initial: Coupon[] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // form fields
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  async function addCoupon() {
    if (!code.trim() || !value) { setError("กรุณากรอกโค้ดและมูลค่าส่วนลด"); return; }
    setSaving(true); setError("");
    const supabase = createClient();
    const row = {
      code: code.trim().toUpperCase(),
      type,
      value: parseFloat(value),
      min_order: minOrder ? parseFloat(minOrder) : 0,
      usage_limit: usageLimit ? parseInt(usageLimit) : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      active: true,
    };
    const { error: e } = await supabase.from("coupons").insert(row);
    if (e) { setError(e.message); setSaving(false); return; }
    setCoupons((c) => [...c, { ...row, used_count: 0 }]);
    setCode(""); setValue(""); setMinOrder(""); setUsageLimit(""); setExpiresAt("");
    setShowForm(false); setSaving(false);
    router.refresh();
  }

  async function toggleActive(c: Coupon) {
    const supabase = createClient();
    await supabase.from("coupons").update({ active: !c.active }).eq("code", c.code);
    setCoupons((list) => list.map((x) => x.code === c.code ? { ...x, active: !x.active } : x));
  }

  async function deleteCoupon(codeToDel: string) {
    if (!confirm(`ลบคูปอง ${codeToDel}?`)) return;
    const supabase = createClient();
    await supabase.from("coupons").delete().eq("code", codeToDel);
    setCoupons((list) => list.filter((x) => x.code !== codeToDel));
  }

  const inp = { width: "100%", height: 42, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "0 14px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", background: "#fff" } as React.CSSProperties;
  const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 6 };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--neutral-900)", margin: 0 }}>คูปอง</h1>
        <button onClick={() => setShowForm((s) => !s)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "10px 20px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          <IconPlus size={16} color="#fff" /> เพิ่มคูปอง
        </button>
      </div>

      {showForm && (
        <div className="card anim-fade-up" style={{ padding: "22px 24px", marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            <div>
              <label style={lbl}>โค้ด *</label>
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} style={inp} placeholder="WELCOME10" />
            </div>
            <div>
              <label style={lbl}>ประเภท</label>
              <select value={type} onChange={(e) => setType(e.target.value as "percent" | "fixed")} style={inp}>
                <option value="percent">เปอร์เซ็นต์ (%)</option>
                <option value="fixed">จำนวนเงิน (฿)</option>
              </select>
            </div>
            <div>
              <label style={lbl}>มูลค่าส่วนลด *</label>
              <input type="number" value={value} onChange={(e) => setValue(e.target.value)} style={inp} placeholder={type === "percent" ? "10" : "50"} />
            </div>
            <div>
              <label style={lbl}>ยอดซื้อขั้นต่ำ (฿)</label>
              <input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} style={inp} placeholder="300" />
            </div>
            <div>
              <label style={lbl}>จำกัดจำนวนครั้ง</label>
              <input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} style={inp} placeholder="ไม่จำกัด" />
            </div>
            <div>
              <label style={lbl}>วันหมดอายุ</label>
              <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} style={inp} />
            </div>
          </div>
          {error && <div style={{ marginTop: 14, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "#DC2626" }}>{error}</div>}
          <button onClick={addCoupon} disabled={saving} style={{ marginTop: 16, background: "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "11px 26px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <IconCheck size={15} color="#fff" /> {saving ? "กำลังบันทึก…" : "บันทึกคูปอง"}
          </button>
        </div>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--neutral-50)", borderBottom: "1px solid var(--neutral-100)" }}>
              {["โค้ด", "ส่วนลด", "ขั้นต่ำ", "ใช้ไป", "หมดอายุ", "สถานะ", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--neutral-500)", fontFamily: "var(--font-display)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.code} style={{ borderBottom: "1px solid var(--neutral-50)" }}>
                <td style={{ padding: "13px 16px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--neutral-900)", letterSpacing: ".05em" }}>
                    <IconTag size={14} color="var(--teal-600)" /> {c.code}
                  </span>
                </td>
                <td style={{ padding: "13px 16px", fontSize: 14, color: "var(--neutral-700)" }}>{c.type === "percent" ? `${c.value}%` : `฿${c.value.toLocaleString()}`}</td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--neutral-500)" }}>{c.min_order ? `฿${c.min_order.toLocaleString()}` : "—"}</td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--neutral-500)" }}>{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ""}</td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--neutral-500)" }}>{c.expires_at ? new Date(c.expires_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                <td style={{ padding: "13px 16px" }}>
                  <button onClick={() => toggleActive(c)} style={{ cursor: "pointer", border: "none", background: c.active ? "#D1FAE5" : "#F3F4F6", color: c.active ? "#065F46" : "#6B7280", borderRadius: "var(--radius-full)", padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>
                    {c.active ? "เปิดใช้งาน" : "ปิด"}
                  </button>
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <button onClick={() => deleteCoupon(c.code)} style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center" }}>
                    <IconTrash size={15} color="#EF4444" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--neutral-400)", padding: "40px 0", fontSize: 14 }}>ยังไม่มีคูปอง</p>
        )}
      </div>
    </div>
  );
}
