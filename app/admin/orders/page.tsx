import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { IconArrowRight } from "@/components/icons";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "รอดำเนินการ", color: "#92400E", bg: "#FEF3C7" },
  paid:      { label: "ชำระแล้ว",    color: "#065F46", bg: "#D1FAE5" },
  shipped:   { label: "จัดส่งแล้ว",  color: "#1E40AF", bg: "#DBEAFE" },
  cancelled: { label: "ยกเลิก",      color: "#991B1B", bg: "#FEE2E2" },
};

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("id, order_no, total, status, payment_status, created_at, tracking_no, shipping_address, tax_invoice")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: orders } = await query;

  const filters = [
    { key: "", label: "ทั้งหมด" },
    { key: "pending", label: "รอดำเนินการ" },
    { key: "paid", label: "ชำระแล้ว" },
    { key: "shipped", label: "จัดส่งแล้ว" },
    { key: "cancelled", label: "ยกเลิก" },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--neutral-900)", marginBottom: 24 }}>ออเดอร์</h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {filters.map((f) => (
          <Link key={f.key} href={f.key ? `/admin/orders?status=${f.key}` : "/admin/orders"}
            style={{ padding: "7px 16px", borderRadius: "var(--radius-full)", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)", textDecoration: "none", background: status === f.key || (!status && !f.key) ? "var(--teal-600)" : "var(--neutral-100)", color: status === f.key || (!status && !f.key) ? "#fff" : "var(--neutral-600)", transition: "all .15s" }}>
            {f.label}
          </Link>
        ))}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--neutral-50)", borderBottom: "1px solid var(--neutral-100)" }}>
              {["ออเดอร์", "ลูกค้า", "วันที่", "ยอด", "สถานะ", "เลขพัสดุ", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--neutral-500)", fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => {
              const s = STATUS[o.status] ?? STATUS.pending;
              const addr = o.shipping_address as Record<string, string>;
              const wantsFull = (o.tax_invoice as { type?: string } | null)?.type === "full";
              return (
                <tr key={o.id} style={{ borderBottom: "1px solid var(--neutral-50)" }}>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "var(--teal-700)" }}>
                    #{o.order_no}
                    {wantsFull && (
                      <span title="ลูกค้าขอใบกำกับภาษีเต็มรูป" style={{ display: "block", marginTop: 4, background: "#FEF3C7", color: "#92400E", borderRadius: 99, padding: "2px 8px", fontSize: 10.5, fontWeight: 700, width: "fit-content" }}>
                        🧾 ขอใบกำกับเต็มรูป
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--neutral-700)" }}>{addr?.full_name ?? "—"}<br /><span style={{ fontSize: 12, color: "var(--neutral-400)" }}>{addr?.phone}</span></td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--neutral-500)", whiteSpace: "nowrap" }}>
                    {new Date(o.created_at).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit" })}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: "var(--neutral-900)", fontFamily: "var(--font-display)" }}>฿{o.total.toLocaleString()}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: s.bg, color: s.color, borderRadius: "var(--radius-full)", padding: "4px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{s.label}</span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--neutral-600)", fontFamily: "var(--font-display)", letterSpacing: ".04em" }}>
                    {o.tracking_no ?? <span style={{ color: "var(--neutral-300)" }}>—</span>}
                  </td>
                  <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                    <Link href={`/admin/orders/${o.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--teal-600)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                      จัดการ <IconArrowRight size={12} color="var(--teal-600)" />
                    </Link>
                    {o.payment_status === "paid" && (
                      <a href={`/admin/orders/${o.id}/tax-invoice`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--neutral-500)", fontSize: 12.5, fontWeight: 600, textDecoration: "none", marginLeft: 12 }}>
                        🧾 ใบกำกับ
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(orders?.length ?? 0) === 0 && (
          <p style={{ textAlign: "center", color: "var(--neutral-400)", padding: "40px 0", fontSize: 14 }}>ไม่มีออเดอร์</p>
        )}
      </div>
    </div>
  );
}
