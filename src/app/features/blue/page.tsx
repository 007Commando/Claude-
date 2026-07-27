import type { Metadata } from "next";
import ApexBlue from "../../../components/ApexBlue";

export const metadata: Metadata = {
  title: "Apex Blue — Amazon Wholesale Financial Analytics & Purchase Orders | Apex Applications",
  description:
    "Financial analytics, vendor management, market intelligence databases, purchase orders, and Opex tracking for Amazon wholesale sellers.",
  alternates: { canonical: "https://apexapplications.io/features/blue" },
};

export default function Page() {
  return <ApexBlue />;
}
