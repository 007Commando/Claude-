import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import { assertDistributorStats } from "../../data/assertDistributorStats";
import PremiumMembership from "../../components/PremiumMembership";

export const metadata: Metadata = pageMetadata({
  title: "Apex Premium Membership: 2 Years, $5,999",
  description:
    "Two years of the full Apex Suite, every supplier in our vault, full access to the Prep Center Network and lifetime member discounts, for a one-time $5,999.",
  path: "/premium-membership",
});

export default function Page() {
  assertDistributorStats();
  return <PremiumMembership />;
}
