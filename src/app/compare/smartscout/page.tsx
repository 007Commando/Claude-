import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import CompareSmartScout from "../../../components/CompareSmartScout";

export const metadata: Metadata = pageMetadata({
  title: "Apex vs SmartScout (2026): Honest Comparison",
  description:
    "SmartScout is Amazon research and analytics; Apex covers research plus execution: purchase orders, break-even repricing, P&L and logistics.",
  path: "/compare/smartscout",
});

export default function Page() {
  return <CompareSmartScout />;
}
