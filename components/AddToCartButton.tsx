"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { IconCart } from "./icons";

interface Props {
  productId: string;
  productName: string;
  price: number;
  compareAtPrice?: number | null;
  image?: string | null;
  categoryName?: string | null;
  stock: number;
  size?: "sm" | "md" | "lg";
}

export default function AddToCartButton({
  productId, productName, price, compareAtPrice, image, categoryName, stock, size = "md",
}: Props) {
  const addItem = useCart((s) => s.addItem);
  const items = useCart((s) => s.items);
  const [added, setAdded] = useState(false);

  const inCart = items.find((i) => i.id === productId);
  const canAdd = stock > 0 && (!inCart || inCart.qty < stock);

  const pad = size === "lg" ? "13px 0" : size === "sm" ? "10px 0" : "11px 0";
  const fs = size === "lg" ? 15 : size === "sm" ? 12 : 13;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (!canAdd) return;
    addItem({ id: productId, name: productName, price, compare_at_price: compareAtPrice ?? null, image: image ?? null, category_name: categoryName ?? null, stock });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <button
      onClick={handleClick}
      disabled={!canAdd}
      className="btn-pop"
      style={{
        width: "100%",
        background: added ? "var(--green-700)" : canAdd ? "var(--teal-600)" : "var(--neutral-300)",
        color: "#fff",
        border: "none",
        borderRadius: "var(--radius-full)",
        padding: pad,
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: fs,
        cursor: canAdd ? "pointer" : "not-allowed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        transition: "background 0.25s var(--ease)",
      }}
    >
      <IconCart size={size === "lg" ? 16 : 14} color="#fff" />
      {added ? "เพิ่มแล้ว ✓" : stock === 0 ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
    </button>
  );
}
