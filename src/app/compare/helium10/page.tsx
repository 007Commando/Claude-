import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import CompareHelium10 from "../../../components/CompareHelium10";

export const metadata: Metadata = pageMetadata({
  title: "Apex vs Helium 10 (2026): Wholesale vs Private Label",
  description:
    "Helium 10 is the giant of private label. Apex is built for resellers: purchase orders, break-even repricing, Buy Box competition, cashflow. 2026 pricing.",
  path: "/compare/helium10",
});

export default function Page() {
  return <CompareHelium10 />;
}
