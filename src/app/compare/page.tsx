import type { Metadata } from "next";
import CompareIndex from "../../components/CompareIndex";

export const metadata: Metadata = {
  title: "Apex Applications vs Helium 10, Jungle Scout, SmartScout & Seller Snap | Apex Applications",
  description:
    "Honest comparisons of Apex Applications against Helium 10, Jungle Scout, SmartScout, and Seller Snap — current 2026 pricing, where each tool wins, and which Amazon business each is built for.",
  alternates: { canonical: "https://apexapplications.io/compare" },
};

export default function Page() {
  return <CompareIndex />;
}
