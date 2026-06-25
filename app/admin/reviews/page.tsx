import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { IconPlus, IconEdit, IconStar } from "@/components/icons";

export default async function AdminReviews() {
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, question, category, slug, is_published, updated_at")
    .order("updated_at", { ascending: false });

  const tableMissing = reviews === null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--neutral-900)", margin: 0 }}>รีวิว & เปรียบเทียบ</h1>
        <Link href="/admin/reviews/new" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--teal-600)", color: "#fff", textDecoration: "none", borderRadius: "var(--radius-full)", padding: "10px 20px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>
          <IconPlus size={16} color="#fff" /> เพิ่มรีวิว
        </Link>
      </div>

      {tableMissing && (
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "var(--radius-md)", padding: "14px 18px", marginBottom: 18, fontSize: 13.5, color: "#92400E", lineHeight: 1.7 }}>
          ⚠️ ยังไม่พบตาราง <code>reviews</code> ใน Supabase — กรุณารัน migration <code>20260625000008_reviews.sql</code> ใน SQL Editor ก่อน (ตอนนี้หน้าร้านใช้ข้อมูลสำรองชั่วคราว)
        </div>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--neutral-50)", borderBottom: "1px solid var(--neutral-100)" }}>
              {["คำถาม (หัวข้อ)", "หมวด", "สถานะ", "อัปเดตล่าสุด", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--neutral-500)", fontFamily: "var(--font-display)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(reviews ?? []).map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--neutral-50)" }}>
                <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600, color: "var(--neutral-800)", display: "flex", alignItems: "center", gap: 8 }}>
                  <IconStar size={14} color="#F59E0B" /> {r.question}
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--neutral-500)" }}>{r.category}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ background: r.is_published ? "#D1FAE5" : "#F3F4F6", color: r.is_published ? "#065F46" : "#6B7280", borderRadius: "var(--radius-full)", padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                    {r.is_published ? "เผยแพร่" : "ฉบับร่าง"}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--neutral-500)" }}>
                  {r.updated_at ? new Date(r.updated_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <Link href={`/admin/reviews/${r.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--teal-600)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                    <IconEdit size={14} color="var(--teal-600)" /> แก้ไข
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!tableMissing && (reviews?.length ?? 0) === 0 && (
          <p style={{ textAlign: "center", color: "var(--neutral-400)", padding: "40px 0", fontSize: 14 }}>ยังไม่มีรีวิว</p>
        )}
      </div>
    </div>
  );
}
