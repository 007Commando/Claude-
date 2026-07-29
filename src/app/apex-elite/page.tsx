import type { Metadata } from "next";
import ApexElite from "../../components/ApexElite";

export const metadata: Metadata = {
  title: "Apex Elite: The Complete Amazon Wholesale System, $297 | Apex Applications",
  description:
    "Apex Elite is the complete Amazon wholesale system: 3 starting suppliers, full software suite access, complete logistics, premium community access, a 1-on-1 strategy call, and a dedicated account manager, for a one-time $297.",
  alternates: { canonical: "https://apexapplications.io/apex-elite" },
};

export default function Page() {
  return <ApexElite />;
}
