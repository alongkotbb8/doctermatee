"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconTruck, IconCheck, IconPackage, IconImage } from "@/components/icons";
import Image from "next/image";
import Link from "next/link";

const STATUSES = [
  { value: "pending",   label: "รอดำเนินการ" },
  { value: "paid",      label: "ชำระแล้ว" },
  { value: "shipped",   label: "จัดส่งแล้ว" },
  { value: "cancelled", label: "ยกเลิก" },
];

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  pending:   { color: "#92400E", bg: "#FEF3C7" },
  paid:      { color: "#065F46", bg: "#D1FAE5" },
  shipped:   { color: "#1E40AF", bg: "#DBEAFE" },
  cancelled: { color: "#991B1B", bg: "#FEE2E2" },
};

export default function OrderDetailClient({ order }: { order: any }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.tracking_number ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addr = order.shipping_address as Record<string, string>;
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.pending;

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const wasNotShipped = order.status !== "shipped";
    await supabase.from("orders").update({ status, tracking_number: tracking || null }).eq("id", order.id);

    // Send shipping email when status changes to shipped and tracking is set
    if (status === "shipped" && tracking && wasNotShipped) {
      await fetch("/api/notify/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id, tracking_number: tracking }),
      });
    }

    setSaving(false); setSaved(true);
    setTimeout(() => { setSaved(false); router.refresh(); }, 1500);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <Link href="/admin/orders" style={{ fontSize: 13, color: "var(--neutral-400)", textDecoration: "none" }}>← ออเดอร์</Link>
        <span style={{ color: "var(--neutral-200)" }}>/</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--neutral-900)", margin: 0 }}>#{order.order_no}</h1>
        <span style={{ background: s.bg, color: s.color, borderRadius: "var(--radius-full)", padding: "4px 12px", fontSize: 13, fontWeight: 600 }}>
          {STATUSES.find((s) => s.value === status)?.label}
        </span>
        <Link href={`/admin/orders/${order.id}/print`} target="_blank" style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, background: "var(--neutral-100)", color: "var(--neutral-700)", textDecoration: "none", borderRadius: "var(--radius-full)", padding: "8px 16px", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-display)" }}>
          <IconImage size={14} color="currentColor" /> พิมพ์ Label
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Items */}
          <div className="card" style={{ padding: "22px 24px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", marginBottom: 16 }}>รายการสินค้า</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {order.order_items.map((item: any, i: number) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 8, overflow: "hidden", background: "var(--neutral-100)", flexShrink: 0, position: "relative" }}>
                    {item.products?.image_url
                      ? <Image src={item.products.image_url} alt={item.products.name} fill style={{ objectFit: "cover" }} sizes="52px" />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>💊</div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--neutral-800)" }}>{item.products?.name}</p>
                    <p style={{ fontSize: 13, color: "var(--neutral-500)" }}>x{item.qty} × ฿{item.price.toLocaleString()}</p>
                  </div>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>฿{(item.price * item.qty).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px dashed var(--neutral-200)", display: "flex", flexDirection: "column", gap: 6 }}>
              <Row label="ราคาสินค้า" value={`฿${order.subtotal.toLocaleString()}`} />
              <Row label="ค่าจัดส่ง" value={order.shipping_fee === 0 ? "ฟรี" : `฿${order.shipping_fee}`} />
              {order.discount > 0 && <Row label="ส่วนลด" value={`-฿${order.discount.toLocaleString()}`} color="#EF4444" />}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "2px solid var(--neutral-900)", marginTop: 4 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>ยอดรวม</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--teal-700)" }}>฿{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="card" style={{ padding: "20px 24px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <IconTruck size={16} color="var(--teal-600)" /> ที่อยู่จัดส่ง
            </h2>
            <p style={{ fontSize: 14, color: "var(--neutral-600)", lineHeight: 2, margin: 0 }}>
              {addr?.full_name}<br />
              {addr?.phone} {addr?.email && `· ${addr.email}`}<br />
              {addr?.address}<br />
              {addr?.district} {addr?.province} {addr?.postal_code}
            </p>
          </div>
        </div>

        {/* Right — actions */}
        <div style={{ position: "sticky", top: 20 }}>
          <div className="card" style={{ padding: "22px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-800)", margin: 0 }}>จัดการออเดอร์</h2>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 6 }}>สถานะออเดอร์</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                style={{ width: "100%", height: 42, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "0 12px", fontSize: 14, fontFamily: "var(--font-body)", background: "#fff", outline: "none" }}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--neutral-600)", marginBottom: 6 }}>
                <IconTruck size={13} color="var(--neutral-400)" /> เลขพัสดุ
              </label>
              <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="TH123456789TH"
                style={{ width: "100%", height: 42, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-input)", padding: "0 12px", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", letterSpacing: ".04em" }}
                onFocus={(e) => { e.target.style.borderColor = "var(--teal-600)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--neutral-200)"; }}
              />
            </div>

            <button onClick={save} disabled={saving} style={{ background: saved ? "var(--teal-700)" : "var(--teal-600)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "12px 0", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {saved ? <><IconCheck size={15} color="#fff" /> บันทึกแล้ว</> : saving ? "กำลังบันทึก…" : "บันทึก"}
            </button>

            <div style={{ background: "var(--neutral-50)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
              <p style={{ fontSize: 12, color: "var(--neutral-400)", margin: 0, lineHeight: 1.7 }}>
                วันที่สั่ง: {new Date(order.created_at).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
              <p style={{ fontSize: 12, color: "var(--neutral-400)", margin: "4px 0 0" }}>
                การชำระ: <span style={{ fontWeight: 600, color: order.payment_status === "paid" ? "var(--teal-600)" : "#D97706" }}>
                  {order.payment_status === "paid" ? "ชำระแล้ว" : "ยังไม่ชำระ"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontSize: 13, color: "var(--neutral-500)" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: color ?? "var(--neutral-800)" }}>{value}</span>
    </div>
  );
}
