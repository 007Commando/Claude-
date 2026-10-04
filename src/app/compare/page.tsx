import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import CompareIndex from "../../components/CompareIndex";
import { COMPARISON_COUNT } from "../../data/compareIndexCards";

export const metadata: Metadata = pageMetadata({
  title: "Amazon Seller Software Comparison 2026 | Apex",
  description:
    `${COMPARISON_COUNT} honest comparisons of Apex against the repricers, scanners, profit dashboards and prep tools sellers shortlist, with 2026 pricing and where rivals win.`,
  path: "/compare",
});

export default function Page() {
  return <CompareIndex />;
}
