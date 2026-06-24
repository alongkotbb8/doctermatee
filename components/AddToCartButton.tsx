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

  function flyToCart(startEl: HTMLElement) {
    if (typeof window === "undefined" || typeof startEl.animate !== "function") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const target = document.getElementById("cart-fly-target");
    if (!target) return;

    const s = startEl.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    const startX = s.left + s.width / 2;
    const startY = s.top + s.height / 2;
    const dx = t.left + t.width / 2 - startX;
    const dy = t.top + t.height / 2 - startY;

    const fly = document.createElement("div");
    fly.setAttribute("aria-hidden", "true");
    fly.style.cssText = `position:fixed;left:${startX - 24}px;top:${startY - 24}px;width:48px;height:48px;border-radius:50%;z-index:9999;pointer-events:none;overflow:hidden;box-shadow:0 10px 24px -6px rgba(13,148,136,.55);display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#14B8A6,#0F766E);`;
    if (image) {
      fly.style.background = `#fff center/cover no-repeat url("${image}")`;
    } else {
      fly.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>';
    }
    document.body.appendChild(fly);

    const anim = fly.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 90}px) scale(0.95)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.15)`, opacity: 0.3 },
      ],
      { duration: 780, easing: "cubic-bezier(.5,-0.08,.75,1)" }
    );
    anim.onfinish = () => {
      fly.remove();
      target.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.4)" }, { transform: "scale(1)" }],
        { duration: 320, easing: "ease-out" }
      );
    };
  }

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (!canAdd) return;
    flyToCart(e.currentTarget as HTMLElement);
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
