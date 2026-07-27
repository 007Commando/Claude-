import type { Metadata } from "next";
import DistributorVault from "../../components/DistributorVault";

export const metadata: Metadata = {
  title: "Distributor Vault — Apex Applications",
  description:
    "Apex Annual Member Distributor Vault: vetted wholesale distributors with contact emails and websites, searchable by category.",
  alternates: { canonical: "https://apexapplications.io/distributor-vault" },
};

export default function Page() {
  return <DistributorVault />;
}
