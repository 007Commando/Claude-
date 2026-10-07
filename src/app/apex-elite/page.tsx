import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import ApexElite from "../../components/ApexElite";

export const metadata: Metadata = pageMetadata({
  title: "Apex Elite: Amazon Wholesale System, $297",
  description:
    "Apex Elite: 3 starting wholesale suppliers, 90 days of the Starter plan, prep center network access, a private community and an onboarding call.",
  path: "/apex-elite",
});

export default function Page() {
  return <ApexElite />;
}
