"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IconFlask, IconPill, IconSparkles, IconBaby, IconHeartPulse, IconStar } from "./icons";
import AddToCartButton from "./AddToCartButton";
import { useCart } from "@/store/cart";
import type { Product } from "@/lib/types";

const CAT_ICONS: Record<string, React.ReactNode> = {
  vitamins: <IconPill size={52} color="var(--teal-500)" />,
  supplements: <IconFlask size={52} color="var(--teal-500)" />,
  beauty: <IconSparkles size={52} color="var(--teal-500)" />,
  "mother-and-child": <IconBaby size={52} color="var(--teal-500)" />,
  "medical-devices": <IconHeartPulse size={52} color="var(--teal-500)" />,
};

// จำนวนรีวิว (decorative) — คงที่ต่อสินค้า อิงจาก id
function reviewCount(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 900;
  return 80 + h;
}

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);

  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round((1 - product.price / product.compare_at_price) * 100)
      : null;

  const catSlug = product.categories?.slug ?? "";
  const icon = CAT_ICONS[catSlug] ?? <IconPill size={52} color="var(--teal-500)" />;
  const isNew = product.is_new ?? new Date(product.created_at) > new Date(Date.now() - 30 * 86400000);
  const reviews = reviewCount(product.id);
  const soldOut = product.stock <= 0;

  function buyNow(e: React.MouseEvent) {
    e.preventDefault();
    if (soldOut) return;
    addItem({ id: product.id, name: product.name, price: product.price, compare_at_price: product.compare_at_price ?? null, image: product.images[0] ?? null, category_name: product.categories?.name ?? null, stock: product.stock });
    router.push("/checkout");
  }

  return (
    <Link href={`/products/${product.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <article className="pcard-hover" style={{
        position: "relative", background: "#fff",
        border: "1px solid var(--neutral-100)", borderRadius: "var(--radius-lg)",
        overflow: "hidden", boxShadow: "var(--shadow-sm)", cursor: "pointer",
        height: "100%", display: "flex", flexDirection: "column",
      }}>
        {/* Image */}
        <div style={{ position: "relative", height: 210, background: "linear-gradient(145deg, var(--green-50), var(--teal-50))", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {product.images[0] ? (
            <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: "cover" }} sizes="(max-width:768px) 50vw, 25vw" />
          ) : (
            <div style={{ opacity: 0.7 }}>{icon}</div>
          )}

          {/* Category chip — ขวาบน */}
          {product.categories?.name && (
            <span style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,.92)", color: "var(--neutral-600)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, padding: "4px 12px", borderRadius: "var(--radius-full)", boxShadow: "var(--shadow-sm)", backdropFilter: "blur(4px)" }}>
              {product.categories.name}
            </span>
          )}
          {isNew && (
            <span style={{ position: "absolute", top: 12, left: 0, background: "var(--green-500)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, padding: "4px 12px 4px 10px", borderRadius: "0 var(--radius-full) var(--radius-full) 0", zIndex: 3 }}>
              ใหม่
            </span>
          )}
          {discount && (
            <span style={{ position: "absolute", top: isNew ? 40 : 12, left: 0, background: "var(--color-sale)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, padding: "4px 12px 4px 10px", borderRadius: "0 var(--radius-full) var(--radius-full) 0", zIndex: 3 }}>
              ลด {discount}%
            </span>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "16px 16px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--neutral-900)", margin: "0 0 8px", lineHeight: 1.35, minHeight: 40 }}>
            {product.name}
          </h3>

          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
            <IconStar size={14} color="#F59E0B" />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--neutral-700)" }}>4.9</span>
            <span style={{ fontSize: 12, color: "var(--neutral-400)" }}>({reviews.toLocaleString()} รีวิว)</span>
          </div>

          {/* Price */}
          <div style={{ marginBottom: 14, display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--teal-600)" }}>
              ฿{product.price.toLocaleString()}
            </span>
            {product.compare_at_price && (
              <span style={{ fontSize: 12, color: "var(--neutral-400)", textDecoration: "line-through" }}>
                ฿{product.compare_at_price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
            <div style={{ flex: 1 }}>
              <AddToCartButton
                productId={product.id}
                productName={product.name}
                price={product.price}
                compareAtPrice={product.compare_at_price}
                image={product.images[0] ?? null}
                categoryName={product.categories?.name ?? null}
                stock={product.stock}
                size="sm"
              />
            </div>
            <button onClick={buyNow} disabled={soldOut} className={soldOut ? "" : "btn-pop"}
              style={{ flex: 1, background: soldOut ? "var(--neutral-300)" : "var(--neutral-900)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", padding: "10px 0", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, cursor: soldOut ? "not-allowed" : "pointer" }}>
              ซื้อเลย
            </button>
          </div>
        </div>

        <style>{`.pcard-hover:hover{transform:translateY(-5px);box-shadow:var(--shadow-md);border-color:var(--teal-200)!important;transition:.25s var(--ease)}`}</style>
      </article>
    </Link>
  );
}
