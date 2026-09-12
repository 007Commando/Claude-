import type { Metadata } from "next";
import ApexGold from "../../../components/ApexGold";

export const metadata: Metadata = {
  title: "Apex Gold — Amazon Repricer with Break-Even Floors | Apex Applications",
  description:
    "Automated Amazon repricing anchored to true break-evens from real FBA fees. Floors by ROI, margin, or dollar profit, bulk strategies, dry-run previews, and a full activity log — included in every Apex plan.",
  alternates: { canonical: "https://apexapplications.io/features/gold" },
};

export default function Page() {
  return <ApexGold />;
}
