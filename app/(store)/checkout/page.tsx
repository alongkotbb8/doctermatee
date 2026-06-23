import { createClient } from "@/lib/supabase/server";
import CheckoutClient from "./CheckoutClient";

export const metadata = { title: "ชำระเงิน — Doctermatee" };

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone, default_address")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return <CheckoutClient user={user} profile={profile} />;
}
