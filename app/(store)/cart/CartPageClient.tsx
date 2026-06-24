"use client";

import Link from "next/link";
import { useCart, type CartItem } from "@/store/cart";
import { IconCart, IconFlask, IconPill, IconTag, IconArrowRight, IconTruck, IconShield, IconTrash, IconMinus, IconPlus } from "@/components/icons";

const FALLBACK_ICONS: Record<string, React.ReactNode> = {
  วิตามิน: <IconPill size={36} color="var(--teal-400)" />,
  อาหารเสริม: <IconFlask size={36} color="var(--teal-400)" />,
};

function QtyControl({ item }: { item: CartItem }) {
  const updateQty = useCart((s) => s.updateQty);
  const removeItem = useCart((s) => s.removeItem);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-full)", overflow: "hidden", height: 36 }}>
      <button
        onClick={() => updateQty(item.id, item.qty - 1)}
        aria-label={item.qty === 1 ? "ลบสินค้า" : "ลดจำนวน"}
        style={{ width: 36, height: 36, border: "none", background: "none", cursor: "pointer", color: item.qty === 1 ? "#EF4444" : "var(--neutral-600)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .15s" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--neutral-100)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
      >
        {item.qty === 1 ? <IconTrash size={15} color="currentColor" /> : <IconMinus size={16} color="currentColor" />}
      </button>
      <span style={{ minWidth: 32, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>{item.qty}</span>
      <button
        onClick={() => updateQty(item.id, item.qty + 1)}
        disabled={item.qty >= item.stock}
        aria-label="เพิ่มจำนวน"
        style={{ width: 36, height: 36, border: "none", background: "none", cursor: item.qty >= item.stock ? "not-allowed" : "pointer", color: item.qty >= item.stock ? "var(--neutral-300)" : "var(--neutral-600)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .15s" }}
        onMouseEnter={(e) => { if (item.qty < item.stock) (e.currentTarget as HTMLButtonElement).style.background = "var(--neutral-100)"; }}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "none")}
      >
        <IconPlus size={15} color="currentColor" />
      </button>
    </div>
  );
}

export default function CartPageClient({ freeThreshold = 500, standardFee = 50 }: { freeThreshold?: number; standardFee?: number }) {
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clearCart);
  const totalItems = useCart((s) => s.totalItems());
  const totalPrice = useCart((s) => s.totalPrice());

  const shippingFee = totalPrice >= freeThreshold ? 0 : standardFee;
  const grandTotal = totalPrice + shippingFee;

  if (items.length === 0) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 80, marginBottom: 20, opacity: 0.3 }}>
          <IconCart size={80} color="var(--neutral-400)" />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--neutral-700)", marginBottom: 8 }}>ตะกร้าว่างเปล่า</h2>
        <p style={{ color: "var(--neutral-500)", marginBottom: 28 }}>เลือกสินค้าที่คุณต้องการได้เลยครับ</p>
        <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--teal-600)", color: "#fff", borderRadius: "var(--radius-full)", padding: "12px 28px", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
          เลือกสินค้า <IconArrowRight size={16} color="#fff" />
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 0 64px" }}>
      <div className="wrap">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, letterSpacing: "-.02em", color: "var(--neutral-900)" }}>
            ตะกร้าสินค้า
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 15, color: "var(--neutral-500)", marginLeft: 12 }}>({totalItems} รายการ)</span>
          </h1>
          <button onClick={clearCart} style={{ background: "none", border: "none", color: "var(--neutral-400)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-body)", textDecoration: "underline" }}>
            ล้างตะกร้า
          </button>
        </div>

        <div className="grid-12" style={{ gap: 28 }}>
          {/* Item list */}
          <div className="col-8" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {items.map((item) => (
              <div key={item.id} className="anim-fade-up" style={{ display: "flex", gap: 16, padding: 18, background: "#fff", border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)", alignItems: "center" }}>
                {/* Image */}
                <div style={{ width: 88, height: 88, borderRadius: "var(--radius-md)", background: "linear-gradient(145deg,var(--green-50),var(--teal-50))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    FALLBACK_ICONS[item.category_name ?? ""] ?? <IconPill size={36} color="var(--teal-400)" />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {item.category_name && (
                    <span style={{ fontSize: 11, color: "var(--teal-600)", fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase" }}>
                      {item.category_name}
                    </span>
                  )}
                  <Link href={`/products/${item.id}`} style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--neutral-900)", margin: "3px 0 6px", textDecoration: "none", lineHeight: 1.3 }}>
                    {item.name}
                  </Link>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {item.compare_at_price && (
                      <span style={{ fontSize: 12, color: "var(--neutral-400)", textDecoration: "line-through" }}>
                        ฿{item.compare_at_price.toLocaleString()}
                      </span>
                    )}
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--teal-600)" }}>
                      ฿{item.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Qty */}
                <QtyControl item={item} />

                {/* Subtotal */}
                <div style={{ textAlign: "right", minWidth: 80 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--neutral-900)" }}>
                    ฿{(item.price * item.qty).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="col-4">
            <div style={{ background: "#fff", border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)", padding: "24px 22px", position: "sticky", top: 90 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--neutral-900)", marginBottom: 18 }}>สรุปคำสั่งซื้อ</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "var(--neutral-600)" }}>ราคาสินค้า</span>
                  <span style={{ fontWeight: 500 }}>฿{totalPrice.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "var(--neutral-600)", display: "flex", alignItems: "center", gap: 5 }}>
                    <IconTruck size={14} color="var(--neutral-400)" /> ค่าจัดส่ง
                  </span>
                  {shippingFee === 0 ? (
                    <span style={{ color: "var(--green-700)", fontWeight: 600, fontSize: 13 }}>ฟรี 🎉</span>
                  ) : (
                    <span style={{ fontWeight: 500 }}>฿{shippingFee}</span>
                  )}
                </div>

                {shippingFee > 0 && (
                  <div style={{ background: "var(--green-50)", borderRadius: "var(--radius-sm)", padding: "10px 12px", fontSize: 12, color: "var(--teal-700)", display: "flex", alignItems: "center", gap: 6 }}>
                    <IconTruck size={13} color="var(--teal-600)" />
                    ซื้อเพิ่มอีก ฿{(freeThreshold - totalPrice).toLocaleString()} เพื่อรับส่งฟรี
                  </div>
                )}
              </div>

              <div style={{ borderTop: "1px solid var(--neutral-100)", paddingTop: 14, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-900)" }}>ยอดรวม</span>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--teal-600)" }}>฿{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <Link href="/checkout" className="btn-pop" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--teal-600)", color: "#fff", borderRadius: "var(--radius-full)", padding: "14px 0", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, textDecoration: "none", width: "100%" }}>
                ดำเนินการต่อ <IconArrowRight size={16} color="#fff" />
              </Link>

              <Link href="/products" style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 12, fontSize: 13, color: "var(--neutral-500)", textDecoration: "none", gap: 5 }}>
                ← เลือกสินค้าต่อ
              </Link>

              {/* Trust */}
              <div style={{ borderTop: "1px solid var(--neutral-100)", paddingTop: 14, marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { icon: <IconShield size={13} color="var(--teal-600)" />, text: "ของแท้ มีเลข อย. ทุกชิ้น" },
                  { icon: <IconTag size={13} color="var(--teal-600)" />, text: "คุ้มค่าราคาดีที่สุด" },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--neutral-500)" }}>
                    {icon}{text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
