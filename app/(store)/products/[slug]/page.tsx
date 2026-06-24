import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AddToCartButton from "@/components/AddToCartButton";
import { IconPill, IconFlask, IconSparkles, IconBaby, IconHeartPulse, IconLeaf } from "@/components/icons";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("name, description").eq("slug", slug).single();
  if (!data) return { title: "ไม่พบสินค้า" };
  return { title: data.name, description: data.description ?? undefined };
}

const CAT_ICONS: Record<string, React.ReactNode> = {
  vitamins: <IconPill size={96} color="var(--teal-400)" />,
  supplements: <IconFlask size={96} color="var(--teal-400)" />,
  beauty: <IconSparkles size={96} color="var(--teal-400)" />,
  "mother-and-child": <IconBaby size={96} color="var(--teal-400)" />,
  "medical-devices": <IconHeartPulse size={96} color="var(--teal-400)" />,
};

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(id,name,slug)")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!product) notFound();

  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round((1 - product.price / product.compare_at_price) * 100)
      : null;

  const catSlug = (product.categories as { slug: string } | null)?.slug ?? "";
  const icon = CAT_ICONS[catSlug] ?? <IconLeaf size={96} color="var(--teal-400)" />;

  return (
    <div style={{ padding: "32px 0 64px" }}>
      <div className="wrap">
        {/* Breadcrumb */}
        <nav style={{ fontSize: 13, color: "var(--neutral-500)", marginBottom: 24, display: "flex", gap: 8, alignItems: "center" }}>
          <Link href="/" style={{ color: "var(--teal-600)", textDecoration: "none" }}>หน้าแรก</Link>
          <span>›</span>
          <Link href="/products" style={{ color: "var(--teal-600)", textDecoration: "none" }}>สินค้า</Link>
          <span>›</span>
          <span>{product.name}</span>
        </nav>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
          {/* Image */}
          <div style={{ background: "var(--green-50)", borderRadius: "var(--radius-lg)", height: 420, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--neutral-200)" }}>
            {product.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--radius-lg)" }} />
            ) : (
              <span style={{ opacity: 0.8 }}>{icon}</span>
            )}
          </div>

          {/* Info */}
          <div>
            <span style={{ fontSize: 13, color: "var(--teal-600)", fontWeight: 500, letterSpacing: ".03em" }}>
              {(product.categories as { name: string } | null)?.name ?? ""}
            </span>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, letterSpacing: "-.02em", color: "var(--neutral-900)", margin: "8px 0 16px", lineHeight: 1.2 }}>
              {product.name}
            </h1>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 34, color: "var(--teal-600)" }}>
                ฿{product.price.toLocaleString()}
              </span>
              {product.compare_at_price && (
                <span style={{ fontSize: 18, color: "var(--neutral-400)", textDecoration: "line-through" }}>
                  ฿{product.compare_at_price.toLocaleString()}
                </span>
              )}
              {discount && (
                <span style={{ background: "var(--color-sale)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, padding: "4px 10px", borderRadius: "var(--radius-full)" }}>
                  ลด {discount}%
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p style={{ fontSize: 15, color: "var(--neutral-700)", lineHeight: 1.8, marginBottom: 24 }}>
                {product.description}
              </p>
            )}

            {/* Meta */}
            <div style={{ background: "var(--neutral-50)", borderRadius: "var(--radius-md)", padding: "16px 18px", marginBottom: 24, fontSize: 14 }}>
              {product.fda_no && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "var(--neutral-500)" }}>เลข อย.</span>
                  <span style={{ fontWeight: 500 }}>{product.fda_no}</span>
                </div>
              )}
              {product.sku && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "var(--neutral-500)" }}>รหัสสินค้า</span>
                  <span style={{ fontWeight: 500 }}>{product.sku}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--neutral-500)" }}>สต๊อก</span>
                <span style={{ fontWeight: 600, color: product.stock > 0 ? "var(--green-700)" : "var(--color-sale)" }}>
                  {product.stock > 0 ? `มีสินค้า (${product.stock} ชิ้น)` : "สินค้าหมด"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <AddToCartButton
                productId={product.id}
                productName={product.name}
                price={product.price}
                compareAtPrice={product.compare_at_price}
                image={product.images[0] ?? null}
                categoryName={(product.categories as { name: string } | null)?.name ?? null}
                stock={product.stock}
                size="lg"
              />
              {product.stock > 0 && (
                <Link href="/checkout" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "transparent", color: "var(--teal-700)", border: "1.5px solid var(--teal-600)", borderRadius: "var(--radius-full)", padding: "13px 0", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
                  ซื้อเลย
                </Link>
              )}
            </div>

            {/* Shipping note */}
            <p style={{ fontSize: 13, color: "var(--neutral-500)", marginTop: 14, textAlign: "center" }}>
              🚚 จัดส่งฟรีเมื่อสั่งซื้อครบ ฿500
            </p>
          </div>
        </div>
      </div>
      <style>{`.wrap{max-width:1180px;margin:0 auto;padding:0 24px}`}</style>
    </div>
  );
}
