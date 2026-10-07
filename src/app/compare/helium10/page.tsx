import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import CompareHelium10 from "../../../components/CompareHelium10";

export const metadata: Metadata = pageMetadata({
  title: "Apex vs Helium 10 (2026): Wholesale vs Private Label",
  description:
    "Helium 10 is built for private label. Apex is built for wholesale resellers: purchase orders, profit and cashflow, with a repricer (beta) on Pro. 2026 pricing.",
  path: "/compare/helium10",
});

export default function Page() {
  return <CompareHelium10 />;
}
