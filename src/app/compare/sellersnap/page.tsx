import type { Metadata } from "next";
import CompareSellerSnap from "../../../components/CompareSellerSnap";

export const metadata: Metadata = {
  title: "Apex Applications vs Seller Snap (2026) — Repricer Comparison | Apex Applications",
  description:
    "Seller Snap is a dedicated game-theory AI repricer; Apex Gold reprices with true break-even floors inside a full wholesale suite. Prices, features, and who should pick which.",
  alternates: { canonical: "https://apexapplications.io/compare/sellersnap" },
};

export default function Page() {
  return <CompareSellerSnap />;
}
