import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { IconCheck, IconTruck, IconPackage, IconArrowRight } from "@/components/icons";

export const metadata = { title: "ยืนยันออเดอร์ — Doctermatee" };

const STATUS: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:   { label: "รอดำเนินการ", color: "#92400E", bg: "#FEF3C7", icon: <IconPackage size={16} color="#92400E" /> },
  paid:      { label: "ชำระแล้ว",    color: "#065F46", bg: "#D1FAE5", icon: <IconCheck size={16} color="#065F46" /> },
  shipped:   { label: "จัดส่งแล้ว",  color: "#1E40AF", bg: "#DBEAFE", icon: <IconTruck size={16} color="#1E40AF" /> },
  cancelled: { label: "ยกเลิก",      color: "#991B1B", bg: "#FEE2E2", icon: null },
};

export default async function OrderPage({ params, searchParams }: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { orderId } = await params;
  const { success } = await searchParams;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      id, order_no, status, payment_status, total, subtotal, shipping_fee, discount,
      shipping_address, tracking_no, created_at,
      order_items (
        qty, price,
        products ( name, images, slug )
      )
    `)
    .eq("id", orderId)
    .single();

  if (!order) notFound();

  const s = STATUS[order.status] ?? STATUS.pending;
  const addr = order.shipping_address as Record<string, string>;
  const isSuccess = success === "1";

  return (
    <div style={{ padding: "40px 0 80px", background: "var(--neutral-50)", minHeight: "80vh" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px" }}>

        {/* Success banner */}
        {isSuccess && (
          <div className="anim-pop-in" style={{ background: "linear-gradient(135deg,var(--teal-600),var(--teal-800))", borderRadius: "var(--radius-lg)", padding: "28px 32px", textAlign: "center", marginBottom: 28, color: "#fff" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <IconCheck size={28} color="#fff" />
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, margin: "0 0 6px" }}>ชำระเงินสำเร็จแล้ว!</h1>
            <p style={{ fontSize: 14, opacity: .85, margin: 0 }}>ขอบคุณที่สั่งซื้อกับ Doctermatee — เราจะจัดส่งให้เร็วที่สุดครับ</p>
          </div>
        )}

        {/* Order header */}
        <div className="card" style={{ padding: "22px 24px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontSize: 13, color: "var(--neutral-500)", marginBottom: 2 }}>หมายเลขออเดอร์</p>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--neutral-900)" }}>#{order.order_no}</p>
              <p style={{ fontSize: 12, color: "var(--neutral-400)", marginTop: 2 }}>
                {new Date(order.created_at).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div style={{ background: s.bg, color: s.color, borderRadius: "var(--radius-full)", padding: "8px 16px", display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 14 }}>
              {s.icon} {s.label}
            </div>
          </div>

          {order.tracking_no && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px dashed var(--neutral-200)", display: "flex", alignItems: "center", gap: 8 }}>
              <IconTruck size={16} color="var(--teal-600)" />
              <span style={{ fontSize: 13, color: "var(--neutral-600)" }}>เลขพัสดุ:</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--teal-700)", letterSpacing: ".04em" }}>{order.tracking_no}</span>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="card" style={{ padding: "20px 24px", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", marginBottom: 16 }}>รายการสินค้า</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {(order.order_items as any[]).map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", background: "var(--neutral-100)", flexShrink: 0, position: "relative" }}>
                  {item.products?.images?.[0] ? (
                    <Image src={item.products.images[0]} alt={item.products.name} fill style={{ objectFit: "cover" }} sizes="56px" />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>💊</div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--neutral-800)" }}>{item.products?.name}</p>
                  <p style={{ fontSize: 13, color: "var(--neutral-500)" }}>฿{item.price.toLocaleString()} × {item.qty}</p>
                </div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-900)" }}>฿{(item.price * item.qty).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px dashed var(--neutral-200)", display: "flex", flexDirection: "column", gap: 8 }}>
            <Row label="ราคาสินค้า" value={`฿${order.subtotal.toLocaleString()}`} />
            <Row label="ค่าจัดส่ง" value={order.shipping_fee === 0 ? "ฟรี" : `฿${order.shipping_fee}`} />
            {order.discount > 0 && <Row label="ส่วนลด" value={`-฿${order.discount.toLocaleString()}`} valueColor="#EF4444" />}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "2px solid var(--neutral-900)", marginTop: 4 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)" }}>รวมทั้งหมด</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--teal-700)" }}>฿{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="card" style={{ padding: "20px 24px", marginBottom: 24 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <IconTruck size={16} color="var(--teal-600)" /> ที่อยู่จัดส่ง
          </h2>
          <p style={{ fontSize: 14, color: "var(--neutral-600)", lineHeight: 1.9, margin: 0 }}>
            {addr?.full_name}<br />
            {addr?.phone}<br />
            {addr?.address}<br />
            {addr?.district} {addr?.province} {addr?.postal_code}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/products" style={{ flex: 1, textAlign: "center", background: "var(--teal-600)", color: "#fff", textDecoration: "none", borderRadius: "var(--radius-full)", padding: "13px 0", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            ช้อปต่อ <IconArrowRight size={14} color="#fff" />
          </Link>
          <Link href="/account" style={{ flex: 1, textAlign: "center", background: "var(--neutral-100)", color: "var(--neutral-700)", textDecoration: "none", borderRadius: "var(--radius-full)", padding: "13px 0", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            ดูออเดอร์ทั้งหมด
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontSize: 13, color: "var(--neutral-500)" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: valueColor ?? "var(--neutral-800)" }}>{value}</span>
    </div>
  );
}
