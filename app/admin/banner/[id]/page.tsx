import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BannerForm, { type BannerData } from "../BannerForm";

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("banners").select("*").eq("id", id).single();
  if (!data) notFound();
  return <BannerForm banner={data as BannerData} />;
}
