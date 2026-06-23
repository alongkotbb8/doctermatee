import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderDetailClient from "./OrderDetailClient";

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(`id, order_no, status, payment_status, total, subtotal, shipping_fee, discount, tracking_number, created_at, shipping_address,
      order_items(qty, price, products(name, image_url))`)
    .eq("id", id)
    .single();

  if (!order) notFound();
  return <OrderDetailClient order={order as any} />;
}
