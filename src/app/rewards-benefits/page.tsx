import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import RewardsBenefits from "../../components/RewardsBenefits";

export const metadata: Metadata = pageMetadata({
  title: "Apex Rewards and Member Benefits",
  description:
    "Member perks for Apex Applications customers, including the Prep Center Network and Distributor Vault. See what your membership includes.",
  path: "/rewards-benefits",
});

export default function Page() {
  return <RewardsBenefits />;
}
