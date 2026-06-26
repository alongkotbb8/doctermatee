import { createClient } from "@/lib/supabase/server";
import TaxInvoiceExport from "@/components/TaxInvoiceExport";

interface InvRow {
  number: string; type: string; buyer: Record<string, string> | null;
  base_amount: number; vat_amount: number; total: number; issued_at: string;
  orders: { order_no: string } | null;
}

export default async function AdminTaxInvoices() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tax_invoices")
    .select("number, type, buyer, base_amount, vat_amount, total, issued_at, orders(order_no)")
    .order("issued_at", { ascending: false })
    .limit(200);

  const tableMissing = data === null;
  const invoices = (data ?? []) as unknown as InvRow[];
  const fmtB = (n: number) => Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--neutral-900)", marginBottom: 24 }}>ใบกำกับภาษี</h1>

      {tableMissing && (
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "var(--radius-md)", padding: "14px 18px", marginBottom: 18, fontSize: 13.5, color: "#92400E", lineHeight: 1.7 }}>
          ⚠️ ยังไม่พบตาราง <code>tax_invoices</code> — กรุณารัน migration <code>20260625000012_tax_invoices.sql</code> ใน Supabase SQL Editor ก่อน
        </div>
      )}

      <TaxInvoiceExport />

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--neutral-50)", borderBottom: "1px solid var(--neutral-100)" }}>
              {["เลขที่", "วันที่", "ประเภท", "ผู้ซื้อ", "ก่อน VAT", "VAT", "รวม", ""].map((h) => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--neutral-500)", fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const isFull = inv.type === "full";
              const buyerName = (isFull ? inv.buyer?.name : inv.buyer?.full_name) ?? "—";
              return (
                <tr key={inv.number} style={{ borderBottom: "1px solid var(--neutral-50)" }}>
                  <td style={{ padding: "12px 14px", fontSize: 13.5, fontWeight: 700, color: "var(--teal-700)", fontFamily: "var(--font-display)", letterSpacing: ".02em" }}>{inv.number}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--neutral-500)", whiteSpace: "nowrap" }}>{new Date(inv.issued_at).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "2-digit" })}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ background: isFull ? "#DBEAFE" : "#F1F5F9", color: isFull ? "#1E40AF" : "#475569", borderRadius: 99, padding: "3px 10px", fontSize: 11.5, fontWeight: 600 }}>{isFull ? "เต็มรูป" : "อย่างย่อ"}</span>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--neutral-700)" }}>{buyerName}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--neutral-600)", textAlign: "right", whiteSpace: "nowrap" }}>{fmtB(inv.base_amount)}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--neutral-600)", textAlign: "right", whiteSpace: "nowrap" }}>{fmtB(inv.vat_amount)}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13.5, fontWeight: 700, color: "var(--neutral-900)", textAlign: "right", whiteSpace: "nowrap", fontFamily: "var(--font-display)" }}>{fmtB(inv.total)}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--neutral-400)", whiteSpace: "nowrap" }}>{inv.orders?.order_no ? `#${inv.orders.order_no}` : ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!tableMissing && invoices.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--neutral-400)", padding: "40px 0", fontSize: 14 }}>ยังไม่มีใบกำกับภาษี (จะออกอัตโนมัติเมื่อมีออเดอร์ชำระเงิน)</p>
        )}
      </div>
    </div>
  );
}
