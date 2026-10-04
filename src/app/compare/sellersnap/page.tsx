import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import CompareSellerSnap from "../../../components/CompareSellerSnap";

export const metadata: Metadata = pageMetadata({
  title: "Apex vs Seller Snap (2026): Repricer Comparison",
  description:
    "Seller Snap is a game-theory AI repricer. Apex Gold reprices with true break-even floors inside a wholesale suite. Prices, features, who should pick which.",
  path: "/compare/sellersnap",
});

export default function Page() {
  return <CompareSellerSnap />;
}
