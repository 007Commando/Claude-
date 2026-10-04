import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import DistributorVault from "../../components/DistributorVault";
import { assertDistributorStats } from "../../data/assertDistributorStats";
import { distributors } from "../../data/distributors";

export const metadata: Metadata = pageMetadata({
  title: "Wholesale Distributor Vault for Amazon | Apex",
  description:
    "Apex Annual Member Distributor Vault: vetted wholesale distributors with contact emails and websites, searchable by category, for Amazon wholesale sellers.",
  path: "/distributor-vault",
});

export default function Page() {
  assertDistributorStats();
  // Names and categories only. Websites and emails are the members' asset and
  // never leave the server.
  const list = distributors.map((d) => ({ name: d.name, category: d.category, contacts: d.emails.length }));
  return <DistributorVault distributors={list} />;
}
