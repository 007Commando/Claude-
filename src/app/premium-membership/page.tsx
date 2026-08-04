import type { Metadata } from "next";
import PremiumMembership from "../../components/PremiumMembership";

export const metadata: Metadata = {
  title: "Apex Premium Membership: 2 Years of Apex, $5,999 | Apex Applications",
  description:
    "Apex Premium Membership: 2 years of the full Apex Suite, every supplier in our vault, full access to our Prep Center Network, and lifetime member discounts, for a one-time $5,999.",
  alternates: { canonical: "https://apexapplications.io/premium-membership" },
};

export default function Page() {
  return <PremiumMembership />;
}
