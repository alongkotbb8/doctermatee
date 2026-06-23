import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { IconPlus, IconEdit } from "@/components/icons";

export default async function AdminProducts() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price, stock, is_active, image_url, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--neutral-900)", margin: 0 }}>สินค้า</h1>
        <Link href="/admin/products/new" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--teal-600)", color: "#fff", textDecoration: "none", borderRadius: "var(--radius-full)", padding: "10px 20px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>
          <IconPlus size={16} color="#fff" /> เพิ่มสินค้า
        </Link>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--neutral-50)", borderBottom: "1px solid var(--neutral-100)" }}>
              {["สินค้า", "หมวด", "ราคา", "สต็อก", "สถานะ", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--neutral-500)", fontFamily: "var(--font-display)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--neutral-50)" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", background: "var(--neutral-100)", flexShrink: 0, position: "relative" }}>
                      {p.image_url
                        ? <Image src={p.image_url} alt={p.name} fill style={{ objectFit: "cover" }} sizes="44px" />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💊</div>}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--neutral-800)" }}>{p.name}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--neutral-500)" }}>{(p.categories as any)?.name ?? "—"}</td>
                <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: "var(--neutral-900)", fontFamily: "var(--font-display)" }}>฿{p.price.toLocaleString()}</td>
                <td style={{ padding: "12px 16px", fontSize: 14, color: p.stock <= 5 ? "#EF4444" : "var(--neutral-700)", fontWeight: p.stock <= 5 ? 700 : 400 }}>{p.stock}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ background: p.is_active ? "#D1FAE5" : "#F3F4F6", color: p.is_active ? "#065F46" : "#6B7280", borderRadius: "var(--radius-full)", padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
                    {p.is_active ? "เผยแพร่" : "ซ่อน"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Link href={`/admin/products/${p.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--teal-600)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                    <IconEdit size={14} color="var(--teal-600)" /> แก้ไข
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(products?.length ?? 0) === 0 && (
          <p style={{ textAlign: "center", color: "var(--neutral-400)", padding: "40px 0", fontSize: 14 }}>ยังไม่มีสินค้า</p>
        )}
      </div>
    </div>
  );
}
