import Link from "next/link";
import { getActiveProducts, getCategories } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

interface Props {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category, q } = await searchParams;
  const term = (q ?? "").trim().toLowerCase();

  const [allProducts, categories] = await Promise.all([getActiveProducts(), getCategories()]);

  // กรองตามหมวด + คำค้นหา ในหน่วยความจำ (ข้อมูล cache แล้ว — ไม่ยิง DB ต่อคำขอ)
  let products = category
    ? allProducts.filter((p) => (p.categories as { slug?: string } | null)?.slug === category)
    : allProducts;
  if (term) {
    products = products.filter((p) =>
      p.name.toLowerCase().includes(term) ||
      (p.description ?? "").toLowerCase().includes(term) ||
      (p.categories?.name ?? "").toLowerCase().includes(term)
    );
  }

  const heading = term ? `ผลการค้นหา “${q}”` : "สินค้าทั้งหมด";

  return (
    <div style={{ padding: "32px 0 64px" }}>
      <div className="wrap">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32, letterSpacing: "-.02em", color: "var(--neutral-900)" }}>{heading}</h1>
          <p style={{ color: "var(--neutral-500)", marginTop: 4 }}>พบ {products?.length ?? 0} รายการ</p>
        </div>

        <div className="grid-12" style={{ gap: 32 }}>
          {/* Sidebar */}
          <aside className="col-3">
            <div style={{ background: "#fff", border: "1px solid var(--neutral-200)", borderRadius: "var(--radius-md)", padding: "20px 18px", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-900)", marginBottom: 14 }}>หมวดหมู่</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: 6 }}>
                  <Link href="/products" style={{ display: "block", padding: "8px 12px", borderRadius: "var(--radius-sm)", fontWeight: !category ? 600 : 400, background: !category ? "var(--green-50)" : "transparent", color: !category ? "var(--teal-700)" : "var(--neutral-700)", textDecoration: "none", fontSize: 14 }}>
                    ทั้งหมด
                  </Link>
                </li>
                {categories?.map((cat) => (
                  <li key={cat.id} style={{ marginBottom: 6 }}>
                    <Link href={`/products?category=${cat.slug}`} style={{ display: "block", padding: "8px 12px", borderRadius: "var(--radius-sm)", fontWeight: category === cat.slug ? 600 : 400, background: category === cat.slug ? "var(--green-50)" : "transparent", color: category === cat.slug ? "var(--teal-700)" : "var(--neutral-700)", textDecoration: "none", fontSize: 14 }}>
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Grid */}
          <div className="col-9">
            {products && products.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                {products.map((p) => (
                  <ProductCard key={p.id} product={p as unknown as Product} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "80px 0", color: "var(--neutral-500)" }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
                <p style={{ fontSize: 16 }}>ไม่พบสินค้าในหมวดหมู่นี้</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
