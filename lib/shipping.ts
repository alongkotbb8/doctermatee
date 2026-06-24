import { createClient } from "@/lib/supabase/server";

export interface ShippingConfig {
  freeThreshold: number;
  standardFee: number;
}

export const DEFAULT_SHIPPING: ShippingConfig = { freeThreshold: 500, standardFee: 50 };

/** อ่านค่าจัดส่งจาก site_settings (key="shipping") — ใช้ค่า default ถ้าไม่มี/ผิดพลาด
 *  ทั้งหน้าตะกร้าและหน้าชำระเงินดึงจากที่เดียวกันเพื่อให้ตรงกันเสมอ */
export async function getShippingConfig(): Promise<ShippingConfig> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("value").eq("key", "shipping").single();
    const v = (data?.value ?? {}) as { free_threshold?: number; standard_fee?: number };
    return {
      freeThreshold: typeof v.free_threshold === "number" ? v.free_threshold : DEFAULT_SHIPPING.freeThreshold,
      standardFee: typeof v.standard_fee === "number" ? v.standard_fee : DEFAULT_SHIPPING.standardFee,
    };
  } catch {
    return DEFAULT_SHIPPING;
  }
}
