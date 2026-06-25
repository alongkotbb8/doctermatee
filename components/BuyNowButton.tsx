"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";

interface Props {
  productId: string;
  productName: string;
  price: number;
  compareAtPrice?: number | null;
  image?: string | null;
  categoryName?: string | null;
  stock: number;
}

// "ซื้อเลย" บนหน้าสินค้า — ใส่ตะกร้าก่อนแล้วไปหน้าชำระเงิน (เดิมเป็นลิงก์เปล่า → เด้งตะกร้าว่าง)
export default function BuyNowButton({ productId, productName, price, compareAtPrice, image, categoryName, stock }: Props) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);

  function buyNow() {
    if (stock <= 0) return;
    addItem({ id: productId, name: productName, price, compare_at_price: compareAtPrice ?? null, image: image ?? null, category_name: categoryName ?? null, stock });
    router.push("/checkout");
  }

  return (
    <button onClick={buyNow} className="btn-pop" style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      width: "100%", background: "transparent", color: "var(--teal-700)",
      border: "1.5px solid var(--teal-600)", borderRadius: "var(--radius-full)",
      padding: "13px 0", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, cursor: "pointer",
    }}>
      ซื้อเลย
    </button>
  );
}
