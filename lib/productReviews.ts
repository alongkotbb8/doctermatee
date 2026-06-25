// ── รีวิวสินค้าจากลูกค้า (UGC) — ดึงเฉพาะที่อนุมัติแล้ว + คำนวณค่าเฉลี่ย ──
import { unstable_cache } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export interface PRReview {
  id: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  verified_purchase: boolean;
  created_at: string;
}

export interface PRAggregate {
  avg: number;
  total: number;
  dist: number[];      // [จำนวน5ดาว, 4, 3, 2, 1]
  reviews: PRReview[];
}

const EMPTY: PRAggregate = { avg: 0, total: 0, dist: [0, 0, 0, 0, 0], reviews: [] };

export async function getApprovedReviews(productId: string): Promise<PRAggregate> {
  const run = unstable_cache(
    async (): Promise<PRAggregate> => {
      try {
        const s = createServiceClient();
        const { data, error } = await s
          .from("product_reviews")
          .select("id, author_name, rating, title, body, verified_purchase, created_at")
          .eq("product_id", productId)
          .eq("status", "approved")
          .order("created_at", { ascending: false });
        if (error || !data) return EMPTY; // ตารางยังไม่มี / อ่านไม่ได้
        const reviews = data as PRReview[];
        const total = reviews.length;
        const avg = total ? reviews.reduce((a, r) => a + r.rating, 0) / total : 0;
        const dist = [5, 4, 3, 2, 1].map((star) => reviews.filter((r) => r.rating === star).length);
        return { avg, total, dist, reviews };
      } catch {
        return EMPTY;
      }
    },
    ["product-reviews", productId],
    { revalidate: 60, tags: ["product-reviews"] }
  );
  return run();
}

export async function getProductRating(productId: string): Promise<{ avg: number; total: number }> {
  const a = await getApprovedReviews(productId);
  return { avg: a.avg, total: a.total };
}
