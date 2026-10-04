import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import ApexElite from "../../components/ApexElite";

export const metadata: Metadata = pageMetadata({
  title: "Apex Elite: Amazon Wholesale System, $297",
  description:
    "Apex Elite is the complete Amazon wholesale system: 3 starting suppliers, full software access, logistics, community, a strategy call, an account manager.",
  path: "/apex-elite",
});

export default function Page() {
  return <ApexElite />;
}
