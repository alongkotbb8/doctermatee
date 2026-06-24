import { createClient } from "@/lib/supabase/server";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  const supabase = await createClient();

  // Last 30 days daily revenue
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_no, total, status, payment_status, created_at, tracking_no, shipping_address, order_items(qty, price, products(name, categories(name)))")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: false });

  // Daily revenue aggregation
  const dailyMap: Record<string, number> = {};
  (orders ?? [])
    .filter((o) => o.payment_status === "paid")
    .forEach((o) => {
      const day = o.created_at.slice(0, 10);
      dailyMap[day] = (dailyMap[day] ?? 0) + o.total;
    });

  const dailyRevenue = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue }));

  // Top products
  const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  (orders ?? [])
    .filter((o) => o.payment_status === "paid")
    .forEach((o) => {
      (o.order_items as any[]).forEach((item) => {
        const name = item.products?.name ?? "unknown";
        if (!productMap[name]) productMap[name] = { name, qty: 0, revenue: 0 };
        productMap[name].qty += item.qty;
        productMap[name].revenue += item.price * item.qty;
      });
    });

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const totalRevenue = (orders ?? []).filter((o) => o.payment_status === "paid").reduce((s, o) => s + o.total, 0);
  const totalOrders = orders?.length ?? 0;
  const paidOrders = orders?.filter((o) => o.payment_status === "paid").length ?? 0;

  return (
    <ReportsClient
      orders={orders as any}
      dailyRevenue={dailyRevenue}
      topProducts={topProducts}
      stats={{ totalRevenue, totalOrders, paidOrders }}
    />
  );
}
