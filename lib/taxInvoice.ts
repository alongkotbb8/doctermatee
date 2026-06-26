// ── ใบกำกับภาษี: ข้อมูลผู้ขาย, คำนวณ VAT, ออกเลข, ออกใบ ──
import { createServiceClient } from "@/lib/supabase/server";

// ข้อมูลผู้ขาย (แก้ที่นี่ได้) — ตามใบกำกับภาษีบริษัทแคร์ดีแม็กซ์
export const SELLER = {
  name: "บริษัท แคร์ดีแม็กซ์ จำกัด (สำนักงานใหญ่)",
  address: "300/45 ซอยลาดพร้าว 84 แขวงวังทองหลาง เขตวังทองหลาง จ.กรุงเทพฯ 10310",
  taxId: "0135560013047",
  phone: "0859956919",
};

export const VAT_RATE = 7;

// ราคารวม VAT แล้ว → แยกฐานก่อน VAT และ VAT
export function splitVat(total: number) {
  const base = Math.round((total / (1 + VAT_RATE / 100)) * 100) / 100;
  const vat = Math.round((total - base) * 100) / 100;
  return { base, vat };
}

const pad4 = (n: number) => String(n).padStart(4, "0");

export interface TaxInvoiceBuyer {
  buyer_type?: "company" | "person";
  name?: string;
  branch?: "head" | "branch";
  branch_code?: string;
  tax_id?: string;
  address?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  postal_code?: string;
  email?: string;
  phone?: string;
  full_name?: string; // จาก shipping_address (ใบย่อ)
}

// ออกใบกำกับภาษีสำหรับออเดอร์ที่ชำระแล้ว — idempotent (ออเดอร์ละ 1 ใบ), best-effort
export async function issueTaxInvoice(orderId: string): Promise<void> {
  try {
    const s = createServiceClient();

    // กันออกซ้ำ
    const { data: existing } = await s.from("tax_invoices").select("id").eq("order_id", orderId).maybeSingle();
    if (existing) return;

    const { data: order } = await s
      .from("orders")
      .select("id, total, shipping_address, tax_invoice")
      .eq("id", orderId)
      .single();
    if (!order) return;

    const req = (order.tax_invoice ?? null) as { type?: string } | null;
    const wantsFull = req?.type === "full";
    const type = wantsFull ? "full" : "short";
    const prefix = wantsFull ? "ICD" : "CD";

    const now = new Date();
    const period = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

    const { data: no, error: noErr } = await s.rpc("next_invoice_no", { p_prefix: prefix, p_period: period });
    if (noErr || no == null) return;

    const number = `${prefix}${period}${pad4(Number(no))}`;
    const { base, vat } = splitVat(Number(order.total));

    // ผู้ซื้อ: เต็มรูป = ข้อมูลที่กรอก / ย่อ = snapshot ที่อยู่จัดส่ง
    const buyer = wantsFull ? order.tax_invoice : order.shipping_address;

    await s.from("tax_invoices").insert({
      order_id: orderId,
      number,
      type,
      buyer,
      base_amount: base,
      vat_amount: vat,
      vat_rate: VAT_RATE,
      total: Number(order.total),
    });
  } catch {
    // best-effort: ถ้าออกใบไม่สำเร็จ ไม่ให้กระทบการชำระเงิน (admin ออกซ้ำภายหลังได้)
  }
}
