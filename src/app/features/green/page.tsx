import type { Metadata } from "next";
import ApexGreen from "../../../components/ApexGreen";

export const metadata: Metadata = {
  title: "Apex Green — Amazon Wholesale Catalog Scanner",
  description:
    "High-speed catalog merging, UPC scanning, and product discovery tools to find profitable Amazon wholesale opportunities.",
  alternates: { canonical: "https://www.apexapplications.io/features/green" },
};

export default function Page() {
  return <ApexGreen />;
}
