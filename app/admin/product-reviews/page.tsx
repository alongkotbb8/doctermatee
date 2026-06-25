import { createClient } from "@/lib/supabase/server";
import ProductReviewModeration, { type ModReview } from "@/components/ProductReviewModeration";

export default async function AdminProductReviews() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_reviews")
    .select("id, author_name, rating, title, body, status, created_at, product_id, products(name, slug)")
    .order("created_at", { ascending: false });

  const tableMissing = data === null;
  const reviews = (data ?? []) as unknown as ModReview[];
  const pending = reviews.filter((r) => r.status === "pending").length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--neutral-900)", margin: 0 }}>
          รีวิวลูกค้า {pending > 0 && <span style={{ fontSize: 13, color: "#fff", background: "#EF4444", borderRadius: 99, padding: "2px 10px", marginLeft: 8, verticalAlign: "middle" }}>{pending} รออนุมัติ</span>}
        </h1>
      </div>

      {tableMissing && (
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "var(--radius-md)", padding: "14px 18px", marginBottom: 18, fontSize: 13.5, color: "#92400E", lineHeight: 1.7 }}>
          ⚠️ ยังไม่พบตาราง <code>product_reviews</code> — กรุณารัน migration <code>20260625000008_reviews.sql</code> ใน Supabase SQL Editor ก่อน
        </div>
      )}

      <ProductReviewModeration initial={reviews} />
    </div>
  );
}
