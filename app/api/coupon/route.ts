import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.toUpperCase() ?? "";
  const subtotal = Number(req.nextUrl.searchParams.get("subtotal") ?? 0);

  if (!code) return NextResponse.json({ valid: false, message: "กรุณาใส่โค้ด" });

  const supabase = createServiceClient();
  const { data: coupon } = await supabase
    .from("coupons")
    .select("id, code, discount_type, discount_value, min_order, max_uses, used_count, expires_at, is_active")
    .eq("code", code)
    .single();

  if (!coupon || !coupon.is_active) {
    return NextResponse.json({ valid: false, message: "ไม่พบโค้ดนี้หรือโค้ดหมดอายุแล้ว" });
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, message: "โค้ดนี้หมดอายุแล้ว" });
  }
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return NextResponse.json({ valid: false, message: "โค้ดนี้ถูกใช้ครบจำนวนแล้ว" });
  }
  if (coupon.min_order && subtotal < coupon.min_order) {
    return NextResponse.json({ valid: false, message: `ต้องซื้อขั้นต่ำ ฿${coupon.min_order.toLocaleString()} เพื่อใช้โค้ดนี้` });
  }

  const discountAmt = coupon.discount_type === "percent"
    ? Math.round(subtotal * coupon.discount_value / 100)
    : coupon.discount_value;

  return NextResponse.json({
    valid: true,
    coupon: { id: coupon.id, discount_type: coupon.discount_type, discount_value: coupon.discount_value },
    message: coupon.discount_type === "percent"
      ? `ลด ${coupon.discount_value}% (ประหยัด ฿${discountAmt.toLocaleString()})`
      : `ลด ฿${coupon.discount_value.toLocaleString()}`,
  });
}
