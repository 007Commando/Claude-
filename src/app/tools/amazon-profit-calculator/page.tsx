import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import ProfitCalculator from "../../../components/ProfitCalculator";

export const metadata: Metadata = pageMetadata({
  title: "Amazon Profit, ROI & Break-Even Calculator | Apex",
  description:
    "Enter your price, product cost and fee assumptions to estimate profit, margin, ROI and break-even price. No account, no live-fee lookup, no lead capture.",
  path: "/tools/amazon-profit-calculator",
});

export default function Page() {
  return <ProfitCalculator />;
}
