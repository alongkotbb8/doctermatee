import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("order_id");
  if (!orderId) return NextResponse.json({ paid: false });

  const service = createServiceClient();
  const { data } = await service
    .from("orders")
    .select("payment_status")
    .eq("id", orderId)
    .single();

  return NextResponse.json({ paid: data?.payment_status === "paid" });
}
