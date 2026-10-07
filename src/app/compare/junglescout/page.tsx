import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import CompareJungleScout from "../../../components/CompareJungleScout";

export const metadata: Metadata = pageMetadata({
  title: "Apex vs Jungle Scout (2026): Honest Comparison",
  description:
    "Jungle Scout is known for private-label product research. Apex is built for wholesale resellers: purchase orders and P&L, with a repricer (beta) on Pro. 2026 pricing.",
  path: "/compare/junglescout",
});

export default function Page() {
  return <CompareJungleScout />;
}
