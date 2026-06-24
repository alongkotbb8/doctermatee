import { createClient } from "@/lib/supabase/server";
import CouponManager from "./CouponManager";

export default async function AdminCoupons() {
  const supabase = await createClient();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("code, type, value, min_order, usage_limit, used_count, expires_at, active")
    .order("code");

  return <CouponManager initial={coupons ?? []} />;
}
