import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PaymentClient from "./PaymentClient";

export const metadata = { title: "ชำระเงิน — Doctermatee" };

export default async function PaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_no, total, payment_status, status")
    .eq("id", orderId)
    .single();

  if (!order) notFound();
  if (order.payment_status === "paid") redirect(`/order/${orderId}`);

  return (
    <PaymentClient
      orderId={order.id}
      orderNo={order.order_no}
      total={order.total}
      omisePublicKey={process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY ?? ""}
    />
  );
}
