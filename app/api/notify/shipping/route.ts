import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendShippingEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  // Verify admin
  const userSupabase = await createClient();
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await userSupabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { order_id, tracking_number } = await req.json();
  const service = createServiceClient();

  const { data: order } = await service
    .from("orders")
    .select("order_no, shipping_address")
    .eq("id", order_id)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const addr = order.shipping_address as Record<string, string>;
  if (addr?.email) {
    await sendShippingEmail({
      to: addr.email,
      orderNo: order.order_no,
      orderId: order_id,
      trackingNumber: tracking_number,
      recipientName: addr.full_name ?? "ลูกค้า",
    });
  }

  return NextResponse.json({ ok: true });
}
