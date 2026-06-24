import { createClient } from "@/lib/supabase/server";
import { getShippingConfig } from "@/lib/shipping";
import CheckoutClient from "./CheckoutClient";

export const metadata = { title: "ชำระเงิน" };

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { freeThreshold, standardFee } = await getShippingConfig();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone, default_address")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return <CheckoutClient user={user} profile={profile} freeThreshold={freeThreshold} standardFee={standardFee} />;
}
