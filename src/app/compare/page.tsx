import type { Metadata } from "next";
import CompareIndex from "../../components/CompareIndex";
import { absoluteUrl } from "../../config/site";

export const metadata: Metadata = {
  title: "Compare Amazon Seller Software | Apex Applications",
  description:
    "Sixteen honest comparisons: Apex against the repricers, scanners, profit dashboards and prep tools Amazon sellers actually shortlist. Current 2026 pricing, sources, and where each rival wins.",
  alternates: { canonical: absoluteUrl("/compare") },
};

export default function Page() {
  return <CompareIndex />;
}
