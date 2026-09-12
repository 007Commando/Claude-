import type { Metadata } from "next";
import CompareSmartScout from "../../../components/CompareSmartScout";

export const metadata: Metadata = {
  title: "Apex Applications vs SmartScout (2026) — Honest Comparison | Apex Applications",
  description:
    "SmartScout is Amazon research and analytics; Apex covers research plus execution — purchase orders, repricing with break-even floors, P&L, and logistics. Prices, features, and who should pick which.",
  alternates: { canonical: "https://apexapplications.io/compare/smartscout" },
};

export default function Page() {
  return <CompareSmartScout />;
}
