import CartPageClient from "./CartPageClient";
import { getShippingConfig } from "@/lib/shipping";

export default async function CartPage() {
  const { freeThreshold, standardFee } = await getShippingConfig();
  return <CartPageClient freeThreshold={freeThreshold} standardFee={standardFee} />;
}
