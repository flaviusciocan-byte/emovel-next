import { createPageMetadata } from "../seo";
import BillingClient from "./billing-client";

export const metadata = createPageMetadata({
  title: "Billing | EMOVEL",
  description: "Manage EMOVEL billing and Pro access.",
  path: "/billing",
});

export default function BillingPage() {
  return <BillingClient />;
}
