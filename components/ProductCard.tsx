"use client";

import Link from "next/link";
import { IconFlask, IconPill, IconSparkles, IconBaby, IconHeartPulse } from "./icons";
import AddToCartButton from "./AddToCartButton";
import type { Product } from "@/lib/types";

const CAT_ICONS: Record<string, React.ReactNode> = {
  vitamins: <IconPill size={52} color="var(--teal-500)" />,
  supplements: <IconFlask size={52} color="var(--teal-500)" />,
  beauty: <IconSparkles size={52} color="var(--teal-500)" />,
  "mother-and-child": <IconBaby size={52} color="var(--teal-500)" />,
  "medical-devices": <IconHeartPulse size={52} color="var(--teal-500)" />,
};

export default function ProductCard({ product }: { product: Product }) {
  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round((1 - product.price / product.compare_at_price) * 100)
      : null;

  const catSlug = product.categories?.slug ?? "";
  const icon = CAT_ICONS[catSlug] ?? <IconPill size={52} color="var(--teal-500)" />;
  const isNew = new Date(product.created_at) > new Date(Date.now() - 30 * 86400000);

  return (
    <Link href={`/products/${product.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <article className="pcard-hover" style={{
        position: "relative", background: "#fff",
        border: "1px solid var(--neutral-100)", borderRadius: "var(--radius-md)",
        overflow: "hidden", boxShadow: "var(--shadow-sm)", cursor: "pointer",
      }}>
        {/* Image */}
        <div style={{ position: "relative", height: 220, background: "linear-gradient(145deg, var(--green-50), var(--teal-50))", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ opacity: 0.7 }}>{icon}</div>
          )}

          {isNew && (
            <span style={{ position: "absolute", top: 12, left: 0, background: "var(--green-500)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, padding: "4px 12px 4px 10px", borderRadius: "0 var(--radius-full) var(--radius-full) 0", zIndex: 3 }}>
              ใหม่
            </span>
          )}
          {discount && (
            <span style={{ position: "absolute", top: 16, right: -34, width: 130, textAlign: "center", transform: "rotate(45deg)", background: "var(--color-sale)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 11, padding: "5px 0", zIndex: 3 }}>
              ลด {discount}%
            </span>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "16px 16px 18px" }}>
          <span style={{ fontSize: 11, color: "var(--teal-600)", fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase" }}>
            {product.categories?.name ?? ""}
          </span>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--neutral-900)", margin: "5px 0 12px", lineHeight: 1.4, minHeight: 40 }}>
            {product.name}
          </h3>
          <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            {product.compare_at_price && (
              <span style={{ fontSize: 12, color: "var(--neutral-400)", textDecoration: "line-through" }}>
                ฿{product.compare_at_price.toLocaleString()}
              </span>
            )}
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--teal-600)" }}>
              ฿{product.price.toLocaleString()}
            </span>
          </div>
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

        <style>{`.pcard-hover:hover{transform:translateY(-5px);box-shadow:var(--shadow-md);border-color:var(--teal-200)!important;transition:.25s var(--ease)}`}</style>
      </article>
    </Link>
  );
}
