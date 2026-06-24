import { getSettings } from "@/lib/data";

export interface ShippingConfig {
  freeThreshold: number;
  standardFee: number;
}

export const DEFAULT_SHIPPING: ShippingConfig = { freeThreshold: 500, standardFee: 50 };

/** อ่านค่าจัดส่งจาก site_settings (key="shipping") — cache ร่วมกับ catalog
 *  ทั้งหน้าตะกร้าและหน้าชำระเงินดึงจากที่เดียวกันเพื่อให้ตรงกันเสมอ */
export async function getShippingConfig(): Promise<ShippingConfig> {
  try {
    const settings = await getSettings();
    const v = (settings.shipping ?? {}) as { free_threshold?: number; standard_fee?: number };
    return {
      freeThreshold: typeof v.free_threshold === "number" ? v.free_threshold : DEFAULT_SHIPPING.freeThreshold,
      standardFee: typeof v.standard_fee === "number" ? v.standard_fee : DEFAULT_SHIPPING.standardFee,
    };
  } catch {
    return DEFAULT_SHIPPING;
  }
}
