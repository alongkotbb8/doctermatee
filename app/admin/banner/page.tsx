import { createClient } from "@/lib/supabase/server";
import BannerManager from "./BannerManager";

export default async function AdminBanner() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("banners")
    .select("id, title, subtitle, image, is_active, sort_order")
    .order("sort_order", { ascending: true });
  return <BannerManager initial={data ?? []} />;
}
