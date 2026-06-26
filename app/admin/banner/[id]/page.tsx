import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BannerForm, { type BannerData, type BannerProduct } from "../BannerForm";

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, { data: products }] = await Promise.all([
    supabase.from("banners").select("*").eq("id", id).single(),
    supabase.from("products").select("id, name, slug").eq("status", "active").order("name"),
  ]);
  if (!data) notFound();
  return <BannerForm banner={data as BannerData} products={(products ?? []) as BannerProduct[]} />;
}
