import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SELLER, VAT_RATE } from "@/lib/taxInvoice";
import PrintButton from "@/components/PrintButton";

interface Props { params: Promise<{ id: string }> }

interface OrderItem { qty: number; price: number; products: { name: string } | null }

export default async function TaxInvoicePrintPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_no, total, created_at, payment_status, shipping_address, order_items(qty, price, products(name))")
    .eq("id", id)
    .single();
  if (!order) notFound();

  const { data: inv } = await supabase
    .from("tax_invoices")
    .select("number, type, buyer, base_amount, vat_amount, vat_rate, total, issued_at")
    .eq("order_id", id)
    .maybeSingle();

  if (!inv) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p style={{ fontSize: 16, color: "var(--neutral-700)", marginBottom: 8 }}>ยังไม่มีใบกำกับภาษีสำหรับออเดอร์นี้</p>
        <p style={{ fontSize: 14, color: "var(--neutral-400)" }}>ใบกำกับภาษีจะออกอัตโนมัติเมื่อออเดอร์ชำระเงินแล้ว (สถานะปัจจุบัน: {order.payment_status})</p>
      </div>
    );
  }

  const items = (order.order_items ?? []) as unknown as OrderItem[];
  const buyer = (inv.buyer ?? {}) as Record<string, string>;
  const isFull = inv.type === "full";
  const fmtB = (n: number) => `฿${Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const issued = new Date(inv.issued_at).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });

  // ชื่อ+ที่อยู่ผู้ซื้อ
  const buyerName = isFull ? buyer.name : buyer.full_name;
  const buyerAddr = isFull
    ? buyer.address
    : [buyer.address, buyer.subdistrict, buyer.district, buyer.province, buyer.postal_code].filter(Boolean).join(" ");

  const Copy = ({ label }: { label: string }) => (
    <div className="invoice-copy">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #0F766E", paddingBottom: 12, marginBottom: 14 }}>
        <div style={{ maxWidth: "55%" }}>
          <p style={{ fontWeight: 800, fontSize: 15, margin: "0 0 4px", color: "#0F766E" }}>{SELLER.name}</p>
          <p style={{ fontSize: 11.5, lineHeight: 1.6, margin: 0, color: "#333" }}>{SELLER.address}</p>
          <p style={{ fontSize: 11.5, margin: "2px 0 0", color: "#333" }}>เลขประจำตัวผู้เสียภาษี {SELLER.taxId} · โทร {SELLER.phone}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontWeight: 800, fontSize: 15, margin: "0 0 2px" }}>{isFull ? "ใบกำกับภาษี/ใบเสร็จรับเงิน" : "ใบกำกับภาษีอย่างย่อ/ใบเสร็จรับเงิน"}</p>
          <p style={{ fontSize: 12, margin: "0 0 2px", color: "#666" }}>({label})</p>
          <p style={{ fontSize: 12, margin: 0 }}>เลขที่: <strong>{inv.number}</strong></p>
          <p style={{ fontSize: 12, margin: 0 }}>วันที่: {issued}</p>
          <p style={{ fontSize: 11.5, margin: "2px 0 0", color: "#666" }}>อ้างอิงออเดอร์ #{order.order_no}</p>
        </div>
      </div>

      {/* Buyer */}
      <div style={{ border: "1px solid #ddd", borderRadius: 6, padding: "8px 12px", marginBottom: 12, fontSize: 12 }}>
        <p style={{ margin: 0 }}><strong>ลูกค้า:</strong> {buyerName ?? "-"}{isFull && buyer.buyer_type === "company" ? " (นิติบุคคล)" : ""}</p>
        {isFull && <p style={{ margin: "2px 0 0" }}><strong>เลขผู้เสียภาษี:</strong> {buyer.tax_id} {buyer.branch === "branch" ? `(สาขา ${buyer.branch_code})` : "(สำนักงานใหญ่)"}</p>}
        <p style={{ margin: "2px 0 0" }}><strong>ที่อยู่:</strong> {buyerAddr || "-"}</p>
        {buyer.phone && <p style={{ margin: "2px 0 0" }}><strong>โทร:</strong> {buyer.phone}</p>}
      </div>

      {/* Items */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 10 }}>
        <thead>
          <tr style={{ background: "#F1F5F9" }}>
            <th style={{ ...thb, width: 28 }}>#</th>
            <th style={thb}>รายการ</th>
            <th style={{ ...thb, textAlign: "center", width: 50 }}>จำนวน</th>
            <th style={{ ...thb, textAlign: "right", width: 90 }}>ราคา/หน่วย</th>
            <th style={{ ...thb, textAlign: "right", width: 90 }}>มูลค่า</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td style={tdb}>{i + 1}</td>
              <td style={tdb}>{it.products?.name ?? "-"}</td>
              <td style={{ ...tdb, textAlign: "center" }}>{it.qty}</td>
              <td style={{ ...tdb, textAlign: "right" }}>{fmtB(it.price)}</td>
              <td style={{ ...tdb, textAlign: "right" }}>{fmtB(it.price * it.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ marginLeft: "auto", width: 260, fontSize: 12.5 }}>
        <Row label="มูลค่าที่คำนวณภาษี" value={fmtB(inv.base_amount)} />
        <Row label={`ภาษีมูลค่าเพิ่ม ${Number(inv.vat_rate ?? VAT_RATE)}%`} value={fmtB(inv.vat_amount)} />
        <div style={{ borderTop: "2px solid #0F766E", marginTop: 4, paddingTop: 4 }}>
          <Row label="รวมทั้งสิ้น" value={fmtB(inv.total)} bold />
        </div>
      </div>
    </div>
  );

  return (
    <div className="ti-wrap">
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <a href={`/admin/orders/${id}`} style={{ fontSize: 13, color: "var(--neutral-500)", textDecoration: "none" }}>← กลับไปออเดอร์</a>
        <PrintButton />
      </div>

      <Copy label="ต้นฉบับ (Original)" />
      <div className="copy-divider" />
      <Copy label="สำเนา (Copy)" />

      <style>{`
        .ti-wrap { max-width: 800px; margin: 0 auto; padding: 24px; color: #111; }
        .invoice-copy { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; }
        .copy-divider { height: 24px; }
        @media print {
          .no-print { display: none !important; }
          .ti-wrap { max-width: none; padding: 0; }
          .invoice-copy { border: none; border-radius: 0; padding: 12mm; page-break-after: always; }
          .copy-divider { display: none; }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
      <span style={{ color: "#555", fontWeight: bold ? 800 : 400 }}>{label}</span>
      <span style={{ fontWeight: bold ? 800 : 600 }}>{value}</span>
    </div>
  );
}

const thb: React.CSSProperties = { padding: "7px 8px", textAlign: "left", fontWeight: 700, borderBottom: "1px solid #cbd5e1" };
const tdb: React.CSSProperties = { padding: "6px 8px", borderBottom: "1px solid #eee" };
