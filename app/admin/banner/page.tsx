import { createClient } from "@/lib/supabase/server";
import BannerForm from "./BannerForm";

export default async function AdminBanner() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "hero").single();
  const hero = (data?.value ?? {}) as {
    title?: string; accent?: string; subtitle?: string; image?: string;
    cta_primary?: string; cta_secondary?: string;
  };
  return <BannerForm hero={hero} />;
}
