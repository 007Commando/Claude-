import type { Metadata } from "next";
import ApexBlue from "../../../components/ApexBlue";

export const metadata: Metadata = {
  title: "Apex Blue, Amazon Profit Tracker & Seller Analytics",
  description:
    "Financial analytics, vendor management, market intelligence databases, purchase orders, and Opex tracking for Amazon wholesale sellers.",
  alternates: { canonical: "https://www.apexapplications.io/features/blue" },
};

export default function Page() {
  return <ApexBlue />;
}
