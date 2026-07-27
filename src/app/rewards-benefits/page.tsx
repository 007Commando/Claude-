import type { Metadata } from "next";
import RewardsBenefits from "../../components/RewardsBenefits";

export const metadata: Metadata = {
  title: "Rewards & Benefits — Apex Applications",
  description:
    "Member perks for Apex Applications customers, including the Prep Center Network and Distributor Vault.",
  alternates: { canonical: "https://apexapplications.io/rewards-benefits" },
};

export default function Page() {
  return <RewardsBenefits />;
}
