import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.toUpperCase() ?? "";
  const subtotal = Number(req.nextUrl.searchParams.get("subtotal") ?? 0);

  if (!code) return NextResponse.json({ valid: false, message: "กรุณาใส่โค้ด" });

  const supabase = createServiceClient();
  const { data: coupon } = await supabase
    .from("coupons")
    .select("code, type, value, min_order, usage_limit, used_count, expires_at, active")
    .eq("code", code)
    .single();

  if (!coupon || !coupon.active) {
    return NextResponse.json({ valid: false, message: "ไม่พบโค้ดนี้หรือโค้ดหมดอายุแล้ว" });
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, message: "โค้ดนี้หมดอายุแล้ว" });
  }
  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    return NextResponse.json({ valid: false, message: "โค้ดนี้ถูกใช้ครบจำนวนแล้ว" });
  }
  if (coupon.min_order && subtotal < coupon.min_order) {
    return NextResponse.json({ valid: false, message: `ต้องซื้อขั้นต่ำ ฿${coupon.min_order.toLocaleString()} เพื่อใช้โค้ดนี้` });
  }

  const discountAmt = coupon.type === "percent"
    ? Math.round(subtotal * coupon.value / 100)
    : coupon.value;

  return NextResponse.json({
    valid: true,
    coupon: { code: coupon.code, discount_type: coupon.type, discount_value: coupon.value },
    message: coupon.type === "percent"
      ? `ลด ${coupon.value}% (ประหยัด ฿${discountAmt.toLocaleString()})`
      : `ลด ฿${coupon.value.toLocaleString()}`,
  });
}
