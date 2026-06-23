import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PrintLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("order_no, tracking_number, shipping_address, total, created_at, order_items(qty, products(name))")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const addr = order.shipping_address as Record<string, string>;

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          .label { page-break-after: always; }
        }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; }
      `}</style>

      {/* Print button */}
      <div className="no-print" style={{ padding: "16px 24px", background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", display: "flex", gap: 12, alignItems: "center" }}>
        <a href={`/admin/orders/${id}`} style={{ fontSize: 13, color: "#6B7280", textDecoration: "none" }}>← กลับ</a>
        <button onClick={() => window.print()} style={{ background: "#0F766E", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          🖨️ พิมพ์ Label
        </button>
      </div>

      {/* Label */}
      <div className="label" style={{ width: 400, margin: "32px auto", border: "2px solid #111", borderRadius: 8, padding: 24, boxSizing: "border-box" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 16, borderBottom: "2px solid #111", marginBottom: 16 }}>
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>Doctermatee</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6B7280" }}>www.doctermatee.co.th</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 11, color: "#6B7280" }}>ออเดอร์</p>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>#{order.order_no}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6B7280" }}>
              {new Date(order.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
            </p>
          </div>
        </div>

        {/* To */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".08em" }}>ผู้รับ</p>
          <p style={{ margin: "0 0 2px", fontWeight: 800, fontSize: 17 }}>{addr?.full_name}</p>
          <p style={{ margin: "0 0 2px", fontSize: 14 }}>{addr?.phone}</p>
          <p style={{ margin: "0 0 2px", fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
            {addr?.address}<br />
            {addr?.district} {addr?.province} {addr?.postal_code}
          </p>
        </div>

        {/* Tracking */}
        {order.tracking_number && (
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 6, padding: "10px 14px", marginBottom: 16 }}>
            <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, color: "#065F46", textTransform: "uppercase", letterSpacing: ".08em" }}>เลขพัสดุ</p>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 18, letterSpacing: ".12em", color: "#065F46" }}>{order.tracking_number}</p>
          </div>
        )}

        {/* Items */}
        <div style={{ borderTop: "1px dashed #D1D5DB", paddingTop: 12 }}>
          <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".08em" }}>รายการ</p>
          {(order.order_items as any[]).map((item, i) => (
            <p key={i} style={{ margin: "0 0 4px", fontSize: 12, color: "#374151" }}>
              {item.products?.name} × {item.qty}
            </p>
          ))}
          <p style={{ margin: "10px 0 0", fontWeight: 800, fontSize: 14 }}>ยอดรวม ฿{order.total.toLocaleString()}</p>
        </div>

        {/* From */}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px dashed #D1D5DB" }}>
          <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" }}>ผู้ส่ง</p>
          <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>Doctermatee — กรุงเทพมหานคร 10XXX</p>
        </div>
      </div>
    </>
  );
}
