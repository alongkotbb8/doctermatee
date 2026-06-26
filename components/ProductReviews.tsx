import Stars from "./Stars";
import ProductReviewForm from "./ProductReviewForm";
import { getApprovedReviews } from "@/lib/productReviews";

// รีวิวสินค้าจริงจากลูกค้า (อนุมัติแล้ว) + ฟอร์มเขียนรีวิว
export default async function ProductReviews({ productId }: { productId: string }) {
  const { avg, total, dist, reviews } = await getApprovedReviews(productId);

  return (
    <section style={{ marginTop: 56, paddingTop: 40, borderTop: "1px solid var(--neutral-100)" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--neutral-900)", marginBottom: 24 }}>
        คะแนนและรีวิวจากลูกค้า
      </h2>

      {total > 0 ? (
        <>
          <div className="rv-top" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 36, alignItems: "center", marginBottom: 32 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 56, lineHeight: 1, color: "var(--neutral-900)" }}>
                {avg.toFixed(1)}<span style={{ fontSize: 22, color: "var(--neutral-400)" }}>/5</span>
              </div>
              <div style={{ margin: "10px 0 6px", display: "flex", justifyContent: "center" }}><Stars value={avg} size={18} /></div>
              <p style={{ fontSize: 13, color: "var(--neutral-500)" }}>({total.toLocaleString()} รีวิว)</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[5, 4, 3, 2, 1].map((star, idx) => {
                const pct = total ? Math.round((dist[idx] / total) * 100) : 0;
                return (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, color: "var(--neutral-600)", width: 14, textAlign: "right" }}>{star}</span>
                    <IconStarSm />
                    <div style={{ flex: 1, height: 8, background: "var(--neutral-100)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "#F59E0B", borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 12, color: "var(--neutral-400)", width: 34, textAlign: "right" }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rv-cards" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
            {reviews.slice(0, 6).map((r) => (
              <div key={r.id} className="card" style={{ padding: "18px 18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--teal-50)", color: "var(--teal-700)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                    {r.author_name.trim().charAt(0)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--neutral-800)", margin: 0 }}>{r.author_name}</p>
                    <p style={{ fontSize: 11.5, color: "var(--neutral-400)", margin: 0 }}>
                      {new Date(r.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                      {r.verified_purchase && <span style={{ color: "var(--teal-600)", fontWeight: 600 }}> · ✓ ผู้ซื้อจริง</span>}
                    </p>
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}><Stars value={r.rating} size={13} /></div>
                {r.title && <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--neutral-800)", margin: "0 0 4px" }}>{r.title}</p>}
                <p style={{ fontSize: 13.5, color: "var(--neutral-600)", lineHeight: 1.7, margin: 0 }}>{r.body}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "8px 0 28px" }}>
          <div style={{ display: "inline-flex", marginBottom: 10 }}><Stars value={0} size={22} /></div>
          <p style={{ fontSize: 15, color: "var(--neutral-600)", margin: "0 0 4px", fontWeight: 600 }}>ยังไม่มีรีวิวสำหรับสินค้านี้</p>
          <p style={{ fontSize: 13.5, color: "var(--neutral-400)", margin: 0 }}>เป็นคนแรกที่แบ่งปันประสบการณ์การใช้งาน</p>
        </div>
      )}

      {/* ฟอร์มเขียนรีวิว */}
      <ProductReviewForm productId={productId} />

    </section>
  );
}

function IconStarSm() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
