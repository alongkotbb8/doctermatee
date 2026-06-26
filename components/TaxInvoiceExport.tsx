"use client";

import { useState } from "react";

export default function TaxInvoiceExport() {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const [from, setFrom] = useState(`${ym}-01`);
  const [to, setTo] = useState(`${ym}-${String(lastDay).padStart(2, "0")}`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/admin/tax-invoices/export?${params.toString()}`, { credentials: "same-origin" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error === "forbidden" ? "เฉพาะแอดมินเท่านั้น" : j.error === "unauthorized" ? "กรุณาเข้าสู่ระบบใหม่" : "ดาวน์โหลดไม่สำเร็จ");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tax-invoices_${from}_${to}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  const inp: React.CSSProperties = { height: 40, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "0 12px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none" };

  return (
    <div className="card" style={{ padding: "18px 20px", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>ตั้งแต่วันที่</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={inp} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>ถึงวันที่</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={inp} />
        </div>
        <button onClick={download} disabled={loading} style={{ height: 40, background: loading ? "var(--neutral-300)" : "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "0 22px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "กำลังสร้างไฟล์…" : "⬇ Export Excel"}
        </button>
      </div>
      {error && <p style={{ margin: "10px 0 0", fontSize: 13, color: "#DC2626" }}>{error}</p>}
    </div>
  );
}
