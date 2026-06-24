"use client";

import { IconBarChart, IconPackage, IconTruck } from "@/components/icons";

interface Props {
  orders: any[];
  dailyRevenue: { date: string; revenue: number }[];
  topProducts: { name: string; qty: number; revenue: number }[];
  stats: { totalRevenue: number; totalOrders: number; paidOrders: number };
}

export default function ReportsClient({ orders, dailyRevenue, topProducts, stats }: Props) {

  function exportCSV() {
    const rows = [
      ["ออเดอร์", "วันที่", "ชื่อลูกค้า", "เบอร์โทร", "ยอด", "สถานะ", "การชำระ", "เลขพัสดุ"],
      ...orders.map((o) => {
        const addr = o.shipping_address ?? {};
        return [
          o.order_no,
          new Date(o.created_at).toLocaleDateString("th-TH"),
          addr.full_name ?? "",
          addr.phone ?? "",
          o.total,
          o.status,
          o.payment_status,
          o.tracking_no ?? "",
        ];
      }),
    ];

    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const bom = "﻿"; // UTF-8 BOM for Excel Thai support
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const maxRevenue = Math.max(...dailyRevenue.map((d) => d.revenue), 1);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--neutral-900)", margin: 0 }}>รายงาน (30 วันล่าสุด)</h1>
        <button onClick={exportCSV} style={{ background: "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "10px 20px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          ⬇ Export CSV
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "รายได้ (ชำระแล้ว)", value: `฿${stats.totalRevenue.toLocaleString()}`, icon: <IconBarChart size={20} color="var(--teal-600)" />, bg: "var(--teal-50)" },
          { label: "ออเดอร์ทั้งหมด", value: `${stats.totalOrders}`, icon: <IconTruck size={20} color="#1E40AF" />, bg: "#EFF6FF" },
          { label: "ชำระแล้ว", value: `${stats.paidOrders}`, icon: <IconPackage size={20} color="#7C3AED" />, bg: "#F5F3FF" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: 12, color: "var(--neutral-500)", margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--neutral-900)", margin: 0 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

        {/* Revenue chart */}
        <div className="card" style={{ padding: "22px 24px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", marginBottom: 20 }}>รายได้รายวัน</h2>
          {dailyRevenue.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--neutral-400)", padding: "32px 0", fontSize: 14 }}>ยังไม่มีข้อมูล</p>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 180 }}>
              {dailyRevenue.map((d) => {
                const h = Math.max((d.revenue / maxRevenue) * 160, 4);
                const day = new Date(d.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
                return (
                  <div key={d.date} title={`${day}: ฿${d.revenue.toLocaleString()}`}
                    style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "default" }}>
                    <div style={{ width: "100%", height: h, background: "var(--teal-500)", borderRadius: "4px 4px 0 0", transition: "opacity .2s", minWidth: 6 }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = ".7"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }} />
                    {dailyRevenue.length <= 14 && (
                      <span style={{ fontSize: 9, color: "var(--neutral-400)", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{day}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="card" style={{ padding: "22px 20px" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", marginBottom: 16 }}>สินค้าขายดี</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topProducts.length === 0 && <p style={{ fontSize: 13, color: "var(--neutral-400)", textAlign: "center", padding: "16px 0" }}>ยังไม่มีข้อมูล</p>}
            {topProducts.map((p, i) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: i < 3 ? "var(--teal-500)" : "var(--neutral-200)", color: i < 3 ? "#fff" : "var(--neutral-600)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--neutral-800)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--neutral-400)" }}>{p.qty} ชิ้น</p>
                </div>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--teal-700)", whiteSpace: "nowrap" }}>฿{p.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className="card" style={{ marginTop: 20, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", margin: 0 }}>รายการออเดอร์</h2>
          <span style={{ fontSize: 12, color: "var(--neutral-400)" }}>{orders.length} รายการ</span>
        </div>
        <div style={{ overflowX: "auto", marginTop: 14 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--neutral-50)", borderBottom: "1px solid var(--neutral-100)" }}>
                {["ออเดอร์", "วันที่", "ลูกค้า", "ยอด", "สถานะ"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--neutral-500)", fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const addr = o.shipping_address ?? {};
                const STATUS_COLORS: Record<string, [string, string]> = {
                  paid: ["#065F46", "#D1FAE5"], shipped: ["#1E40AF", "#DBEAFE"],
                  pending: ["#92400E", "#FEF3C7"], cancelled: ["#991B1B", "#FEE2E2"],
                };
                const [color, bg] = STATUS_COLORS[o.status] ?? ["#374151", "#F3F4F6"];
                return (
                  <tr key={o.id} style={{ borderBottom: "1px solid var(--neutral-50)" }}>
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: "var(--teal-700)" }}>#{o.order_no}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--neutral-500)", whiteSpace: "nowrap" }}>
                      {new Date(o.created_at).toLocaleDateString("th-TH", { day: "2-digit", month: "short" })}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "var(--neutral-700)" }}>{addr.full_name ?? "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>฿{o.total.toLocaleString()}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: bg, color, borderRadius: "var(--radius-full)", padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                        {(({ pending: "รอดำเนินการ", paid: "ชำระแล้ว", shipped: "จัดส่งแล้ว", cancelled: "ยกเลิก" } as Record<string, string>)[o.status]) ?? o.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
