"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Stars from "./Stars";
import { IconCheck, IconX, IconTrash } from "@/components/icons";

export interface ModReview {
  id: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  product_id: string;
  products: { name: string; slug: string } | null;
}

type Filter = "all" | "pending" | "approved" | "rejected";

const STATUS_LABEL: Record<string, { t: string; bg: string; c: string }> = {
  pending: { t: "รออนุมัติ", bg: "#FEF3C7", c: "#92400E" },
  approved: { t: "อนุมัติแล้ว", bg: "#D1FAE5", c: "#065F46" },
  rejected: { t: "ปฏิเสธ", bg: "#FEE2E2", c: "#991B1B" },
};

export default function ProductReviewModeration({ initial }: { initial: ModReview[] }) {
  const [reviews, setReviews] = useState<ModReview[]>(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState<string | null>(null);

  async function revalidate() {
    await fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tags: ["product-reviews"] }) }).catch(() => {});
  }

  async function setStatus(id: string, status: ModReview["status"]) {
    setBusy(id);
    const supabase = createClient();
    const { error } = await supabase.from("product_reviews").update({ status }).eq("id", id);
    if (!error) { setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r))); await revalidate(); }
    setBusy(null);
  }

  async function remove(id: string) {
    if (!confirm("ลบรีวิวนี้ถาวร?")) return;
    setBusy(id);
    const supabase = createClient();
    const { error } = await supabase.from("product_reviews").delete().eq("id", id);
    if (!error) { setReviews((rs) => rs.filter((r) => r.id !== id)); await revalidate(); }
    setBusy(null);
  }

  const shown = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);
  const counts = {
    all: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  return (
    <div>
      {/* ตัวกรอง */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {(["all", "pending", "approved", "rejected"] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            border: `1px solid ${filter === f ? "var(--teal-500)" : "var(--neutral-200)"}`, background: filter === f ? "var(--teal-50)" : "#fff",
            color: filter === f ? "var(--teal-700)" : "var(--neutral-600)", borderRadius: "var(--radius-full)", padding: "7px 16px",
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}>
            {f === "all" ? "ทั้งหมด" : STATUS_LABEL[f].t} ({counts[f]})
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {shown.map((r) => {
          const st = STATUS_LABEL[r.status];
          return (
            <div key={r.id} className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--neutral-900)" }}>{r.author_name}</span>
                    <Stars value={r.rating} size={13} />
                    <span style={{ background: st.bg, color: st.c, borderRadius: 99, padding: "2px 10px", fontSize: 11.5, fontWeight: 600 }}>{st.t}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--neutral-400)" }}>
                    สินค้า: {r.products?.name ?? "—"} · {new Date(r.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {r.status !== "approved" && (
                    <button onClick={() => setStatus(r.id, "approved")} disabled={busy === r.id} title="อนุมัติ" style={{ ...actBtn, background: "#D1FAE5", borderColor: "#A7F3D0" }}>
                      <IconCheck size={15} color="#065F46" />
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button onClick={() => setStatus(r.id, "rejected")} disabled={busy === r.id} title="ปฏิเสธ" style={{ ...actBtn, background: "#FEF3C7", borderColor: "#FDE68A" }}>
                      <IconX size={15} color="#92400E" />
                    </button>
                  )}
                  <button onClick={() => remove(r.id)} disabled={busy === r.id} title="ลบ" style={{ ...actBtn, background: "#FEF2F2", borderColor: "#FECACA" }}>
                    <IconTrash size={14} color="#EF4444" />
                  </button>
                </div>
              </div>
              {r.title && <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "var(--neutral-800)" }}>{r.title}</p>}
              <p style={{ margin: 0, fontSize: 14, color: "var(--neutral-600)", lineHeight: 1.7 }}>{r.body}</p>
            </div>
          );
        })}
        {shown.length === 0 && <p style={{ textAlign: "center", color: "var(--neutral-400)", padding: "40px 0", fontSize: 14 }}>ไม่มีรีวิวในหมวดนี้</p>}
      </div>
    </div>
  );
}

const actBtn: React.CSSProperties = { border: "1px solid", borderRadius: 8, padding: "8px 10px", cursor: "pointer", lineHeight: 0 };
