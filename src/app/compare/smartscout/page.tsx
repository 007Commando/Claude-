import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import CompareSmartScout from "../../../components/CompareSmartScout";

export const metadata: Metadata = pageMetadata({
  title: "Apex vs SmartScout (2026): Honest Comparison",
  description:
    "SmartScout is Amazon research and analytics. Apex covers research plus purchase orders and P&L, with a repricer (beta) on Pro and logistics (Red) in beta.",
  path: "/compare/smartscout",
});

export default function Page() {
  return <CompareSmartScout />;
}
