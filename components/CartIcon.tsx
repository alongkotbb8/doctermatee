"use client";

import Link from "next/link";
import { useCart } from "@/store/cart";
import { IconCart } from "./icons";

export default function CartIcon() {
  const totalItems = useCart((s) => s.totalItems());

  return (
    <Link href="/cart" className="icon-btn" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: "var(--neutral-700)", fontSize: 11, position: "relative", textDecoration: "none" }}>
      <span style={{ position: "relative" }}>
        <IconCart size={22} color="var(--neutral-700)" />
        {totalItems > 0 && (
          <span style={{
            position: "absolute", top: -6, right: -6,
            background: "var(--color-sale)", color: "#fff",
            fontSize: 10, fontWeight: 700,
            minWidth: 17, height: 17, borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 4px", fontFamily: "var(--font-display)",
            animation: "popIn 0.3s var(--ease)",
          }}>
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </span>
      ตะกร้า
    </Link>
  );
}
