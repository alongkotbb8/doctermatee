import { createClient } from "@/lib/supabase/server";
import BannerForm, { type BannerProduct } from "../BannerForm";

export default async function NewBannerPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug")
    .eq("status", "active")
    .order("name");
  return <BannerForm products={(products ?? []) as BannerProduct[]} />;
}
