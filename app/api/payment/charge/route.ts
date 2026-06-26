import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendOrderConfirmEmail } from "@/lib/email";
import { issueTaxInvoice } from "@/lib/taxInvoice";

const OMISE_SECRET = process.env.OPN_SECRET_KEY ?? "";
const OMISE_API = "https://api.omise.co";

async function omiseFetch(path: string, body: object) {
  const res = await fetch(`${OMISE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(OMISE_SECRET + ":").toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function POST(req: NextRequest) {
  const { order_id, token, method } = await req.json();

  if (!order_id || !method) {
    return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: order } = await service
    .from("orders")
    .select("id, order_no, total, payment_status")
    .eq("id", order_id)
    .single();

  if (!order) return NextResponse.json({ error: "ไม่พบออเดอร์" }, { status: 404 });
  if (order.payment_status === "paid") return NextResponse.json({ status: "successful" });

  const amountSatang = Math.round(order.total * 100);

  // --- PromptPay ---
  if (method === "promptpay") {
    // Create source
    const source = await omiseFetch("/sources", {
      type: "promptpay",
      amount: amountSatang,
      currency: "THB",
    });

    if (source.object === "error") {
      return NextResponse.json({ error: source.message }, { status: 400 });
    }

    // Create charge
    const charge = await omiseFetch("/charges", {
      amount: amountSatang,
      currency: "THB",
      source: source.id,
      description: `Doctermatee order ${order.order_no}`,
      metadata: { order_id },
    });

    if (charge.object === "error") {
      return NextResponse.json({ error: charge.message }, { status: 400 });
    }

    // Save payment event (idempotent ด้วย omise_event_id)
    await service.from("payment_events").insert({
      omise_event_id: charge.id,
      order_id,
      type: "charge.create.promptpay",
      raw: charge,
    });

    const qrImage = charge.source?.scannable_code?.image?.download_uri ?? null;
    return NextResponse.json({ qr_image: qrImage, charge_id: charge.id });
  }

  // --- Card ---
  if (method === "card") {
    if (!token) return NextResponse.json({ error: "ไม่มี token บัตร" }, { status: 400 });

    const charge = await omiseFetch("/charges", {
      amount: amountSatang,
      currency: "THB",
      card: token,
      description: `Doctermatee order ${order.order_no}`,
      metadata: { order_id },
      capture: true,
    });

    if (charge.object === "error") {
      return NextResponse.json({ error: charge.message }, { status: 400 });
    }

    await service.from("payment_events").insert({
      omise_event_id: charge.id,
      order_id,
      type: "charge.create.card",
      raw: charge,
    });

    if (charge.status === "successful") {
      await service.from("orders").update({ payment_status: "paid", status: "paid" }).eq("id", order_id);

      // ออกใบกำกับภาษี (ย่อ/เต็ม) — idempotent
      await issueTaxInvoice(order_id);

      // Send confirmation email
      const { data: fullOrder } = await service
        .from("orders")
        .select("order_no, total, subtotal, shipping_fee, discount, shipping_address, order_items(qty,price,products(name))")
        .eq("id", order_id)
        .single();
      if (fullOrder) {
        const addr = fullOrder.shipping_address as Record<string, string>;
        if (addr?.email) {
          await sendOrderConfirmEmail({
            to: addr.email,
            orderNo: fullOrder.order_no,
            orderId: order_id,
            items: (fullOrder.order_items as any[]).map((i) => ({ name: i.products?.name ?? "", qty: i.qty, price: i.price })),
            subtotal: fullOrder.subtotal,
            shipping: fullOrder.shipping_fee,
            discount: fullOrder.discount,
            total: fullOrder.total,
            shippingAddress: addr as any,
          });
        }
      }

      return NextResponse.json({ status: "successful" });
    }

    return NextResponse.json({ status: charge.status, error: charge.failure_message ?? "ชำระไม่สำเร็จ" });
  }

  return NextResponse.json({ error: "method ไม่รองรับ" }, { status: 400 });
}
