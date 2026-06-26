import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendOrderConfirmEmail } from "@/lib/email";
import { issueTaxInvoice } from "@/lib/taxInvoice";

const OMISE_SECRET = process.env.OPN_SECRET_KEY ?? "";
const OMISE_API = "https://api.omise.co";

// Re-fetch charge from Omise — never trust raw webhook payload
async function fetchCharge(chargeId: string) {
  const res = await fetch(`${OMISE_API}/charges/${chargeId}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(OMISE_SECRET + ":").toString("base64")}`,
    },
  });
  return res.json();
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Only handle charge events
  const eventType: string = body?.key ?? "";
  if (!eventType.startsWith("charge.")) {
    return NextResponse.json({ ok: true });
  }

  const rawChargeId: string = body?.data?.id ?? "";
  if (!rawChargeId) return NextResponse.json({ ok: true });

  // Re-fetch from Omise to get the authoritative state
  const charge = await fetchCharge(rawChargeId);
  if (charge.object === "error") {
    return NextResponse.json({ error: "could not verify charge" }, { status: 400 });
  }

  const orderId: string = charge.metadata?.order_id ?? "";
  if (!orderId) return NextResponse.json({ ok: true });

  const service = createServiceClient();

  // Save payment event log (idempotent ด้วย event id ของ Omise)
  await service.from("payment_events").insert({
    omise_event_id: body?.id ?? charge.id,
    order_id: orderId,
    type: eventType,
    raw: charge,
  });

  // Update order on successful payment
  if (charge.status === "successful") {
    // ตรวจยอดเงินที่จ่ายจริงให้ตรงกับยอดออเดอร์ (กันการ mark paid ผิดยอด)
    const { data: ord } = await service.from("orders").select("total").eq("id", orderId).single();
    if (!ord || Math.round(Number(ord.total) * 100) !== charge.amount) {
      return NextResponse.json({ ok: true, note: "amount mismatch" });
    }

    const { data: updated } = await service
      .from("orders")
      .update({ payment_status: "paid", status: "paid" })
      .eq("id", orderId)
      .neq("payment_status", "paid") // idempotent
      .select("id, order_no, total, subtotal, shipping_fee, discount, shipping_address, order_items(qty,price,products(name))")
      .single();

    // ออกใบกำกับภาษี (ย่อ/เต็ม) — idempotent, เฉพาะตอนที่เพิ่งเปลี่ยนเป็น paid จริง
    if (updated) {
      await issueTaxInvoice(orderId);
    }

    // Send confirmation email
    if (updated) {
      const addr = updated.shipping_address as Record<string, string>;
      const email = addr?.email;
      if (email) {
        await sendOrderConfirmEmail({
          to: email,
          orderNo: updated.order_no,
          orderId: updated.id,
          items: (updated.order_items as any[]).map((i) => ({
            name: i.products?.name ?? "",
            qty: i.qty,
            price: i.price,
          })),
          subtotal: updated.subtotal,
          shipping: updated.shipping_fee,
          discount: updated.discount,
          total: updated.total,
          shippingAddress: addr as any,
        });
      }
    }
  }

  // Mark failed/expired
  if (charge.status === "failed" || charge.status === "expired") {
    await service
      .from("orders")
      .update({ payment_status: charge.status })
      .eq("id", orderId)
      .eq("payment_status", "unpaid");
  }

  return NextResponse.json({ ok: true });
}
