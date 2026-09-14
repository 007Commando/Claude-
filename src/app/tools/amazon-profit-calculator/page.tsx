import type { Metadata } from "next";
import ProfitCalculator from "../../../components/ProfitCalculator";
import { absoluteUrl } from "../../../config/site";

export const metadata: Metadata = {
  title: "Amazon Profit, ROI & Break-Even Calculator | Apex",
  description:
    "Enter your price, product cost and fee assumptions to estimate contribution profit, margin, ROI and a break-even selling price. No account, no live-fee lookup, no lead capture.",
  alternates: { canonical: absoluteUrl("/tools/amazon-profit-calculator") },
};

export default function Page() {
  return <ProfitCalculator />;
}
