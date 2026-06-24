import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./SettingsForm";

export default async function AdminSettings() {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("site_settings").select("key, value");
  const map = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value]));

  return (
    <SettingsForm
      contact={(map.contact ?? {}) as { phone?: string; email?: string; hours?: string }}
      shipping={(map.shipping ?? {}) as { free_threshold?: number; standard_fee?: number }}
    />
  );
}
