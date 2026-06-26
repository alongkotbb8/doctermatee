import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

// Export ใบกำกับภาษีเป็น .xlsx ส่งบัญชี (admin เท่านั้น) — แยกฐาน/VAT 7%/รวม
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");

  const service = createServiceClient();
  let q = service
    .from("tax_invoices")
    .select("number, type, buyer, base_amount, vat_amount, vat_rate, total, issued_at, orders(order_no)")
    .order("issued_at", { ascending: true });
  if (from) q = q.gte("issued_at", `${from}T00:00:00`);
  if (to) q = q.lte("issued_at", `${to}T23:59:59`);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: "query failed" }, { status: 500 });

  const rows = (data ?? []).map((inv) => {
    const buyer = (inv.buyer ?? {}) as Record<string, string>;
    const isFull = inv.type === "full";
    const orders = inv.orders as { order_no?: string } | null;
    return {
      "เลขที่ใบกำกับภาษี": inv.number,
      "วันที่": new Date(inv.issued_at).toLocaleDateString("th-TH", { year: "numeric", month: "2-digit", day: "2-digit" }),
      "ประเภท": isFull ? "เต็มรูป" : "อย่างย่อ",
      "เลขออเดอร์": orders?.order_no ?? "",
      "ชื่อผู้ซื้อ": (isFull ? buyer.name : buyer.full_name) ?? "",
      "เลขผู้เสียภาษี": isFull ? (buyer.tax_id ?? "") : "",
      "มูลค่าก่อน VAT": Number(inv.base_amount),
      [`VAT ${Number(inv.vat_rate)}%`]: Number(inv.vat_amount),
      "รวมทั้งสิ้น": Number(inv.total),
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [{ wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 16 }, { wch: 28 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "ใบกำกับภาษี");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  const fname = `tax-invoices${from ? `_${from}` : ""}${to ? `_${to}` : ""}.xlsx`;
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fname}"`,
    },
  });
}
