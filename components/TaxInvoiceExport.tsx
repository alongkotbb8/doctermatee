"use client";

import { useState } from "react";

export default function TaxInvoiceExport() {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [from, setFrom] = useState(`${ym}-01`);
  const [to, setTo] = useState(`${ym}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, "0")}`);

  function download() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    window.location.href = `/api/admin/tax-invoices/export?${params.toString()}`;
  }

  const inp: React.CSSProperties = { height: 40, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "0 12px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none" };

  return (
    <div className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
      <div>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>ตั้งแต่วันที่</label>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={inp} />
      </div>
      <div>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 5 }}>ถึงวันที่</label>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={inp} />
      </div>
      <button onClick={download} style={{ height: 40, background: "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "0 22px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
        ⬇ Export Excel
      </button>
    </div>
  );
}
