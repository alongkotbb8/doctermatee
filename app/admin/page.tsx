import { createClient } from "@/lib/supabase/server";
import { IconBarChart, IconTruck, IconPackage, IconTag } from "@/components/icons";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: orderCount },
    { data: revenue },
    { data: pending },
    { count: productCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total").eq("payment_status", "paid"),
    supabase.from("orders").select("total").eq("payment_status", "unpaid"),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders")
      .select("id, order_no, total, status, payment_status, created_at, shipping_address")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const totalRevenue = revenue?.reduce((s, o) => s + o.total, 0) ?? 0;
  const pendingRevenue = pending?.reduce((s, o) => s + o.total, 0) ?? 0;

  const STATUS: Record<string, { label: string; color: string; bg: string }> = {
    pending:   { label: "รอดำเนินการ", color: "#92400E", bg: "#FEF3C7" },
    paid:      { label: "ชำระแล้ว",    color: "#065F46", bg: "#D1FAE5" },
    shipped:   { label: "จัดส่งแล้ว",  color: "#1E40AF", bg: "#DBEAFE" },
    cancelled: { label: "ยกเลิก",      color: "#991B1B", bg: "#FEE2E2" },
  };

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--neutral-900)", marginBottom: 28 }}>แดชบอร์ด</h1>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "รายได้รวม (ชำระแล้ว)", value: `฿${totalRevenue.toLocaleString()}`, icon: <IconBarChart size={22} color="var(--teal-600)" />, bg: "var(--teal-50)" },
          { label: "รายได้รอชำระ", value: `฿${pendingRevenue.toLocaleString()}`, icon: <IconTag size={22} color="#D97706" />, bg: "#FFFBEB" },
          { label: "ออเดอร์ทั้งหมด", value: `${orderCount ?? 0}`, icon: <IconTruck size={22} color="#1E40AF" />, bg: "#EFF6FF" },
          { label: "สินค้าทั้งหมด", value: `${productCount ?? 0}`, icon: <IconPackage size={22} color="#7C3AED" />, bg: "#F5F3FF" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "20px 22px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: 12, color: "var(--neutral-500)", marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--neutral-900)" }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card" style={{ padding: "22px 24px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--neutral-800)", marginBottom: 18 }}>ออเดอร์ล่าสุด</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--neutral-100)" }}>
              {["ออเดอร์", "ลูกค้า", "วันที่", "ยอด", "สถานะ"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0 0 10px", fontSize: 12, fontWeight: 600, color: "var(--neutral-500)", fontFamily: "var(--font-display)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(recentOrders ?? []).map((o) => {
              const s = STATUS[o.status] ?? STATUS.pending;
              const addr = o.shipping_address as Record<string, string>;
              return (
                <tr key={o.id} style={{ borderBottom: "1px solid var(--neutral-50)" }}>
                  <td style={{ padding: "12px 0", fontSize: 14, fontWeight: 600, color: "var(--teal-700)" }}>
                    <a href={`/admin/orders/${o.id}`} style={{ textDecoration: "none", color: "inherit" }}>#{o.order_no}</a>
                  </td>
                  <td style={{ padding: "12px 0", fontSize: 14, color: "var(--neutral-700)" }}>{addr?.full_name ?? "—"}</td>
                  <td style={{ padding: "12px 0", fontSize: 13, color: "var(--neutral-500)" }}>
                    {new Date(o.created_at).toLocaleDateString("th-TH", { day: "2-digit", month: "short" })}
                  </td>
                  <td style={{ padding: "12px 0", fontSize: 14, fontWeight: 700, color: "var(--neutral-900)", fontFamily: "var(--font-display)" }}>฿{o.total.toLocaleString()}</td>
                  <td style={{ padding: "12px 0" }}>
                    <span style={{ background: s.bg, color: s.color, borderRadius: "var(--radius-full)", padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{s.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(recentOrders?.length ?? 0) === 0 && (
          <p style={{ textAlign: "center", color: "var(--neutral-400)", padding: "24px 0", fontSize: 14 }}>ยังไม่มีออเดอร์</p>
        )}
      </div>
    </div>
  );
}
