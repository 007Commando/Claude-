import type { Metadata } from "next";
import CompareJungleScout from "../../../components/CompareJungleScout";

export const metadata: Metadata = {
  title: "Apex Applications vs Jungle Scout (2026) — Honest Comparison | Apex Applications",
  description:
    "Jungle Scout invented private-label product research. Apex is built for third-party resellers moving real brands at wholesale: purchase orders, break-even repricing, and P&L. Honest comparison with 2026 pricing.",
  alternates: { canonical: "https://apexapplications.io/compare/junglescout" },
};

export default function Page() {
  return <CompareJungleScout />;
}
