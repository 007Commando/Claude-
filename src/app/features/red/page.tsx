import type { Metadata } from "next";
import ApexRed from "../../../components/ApexRed";

export const metadata: Metadata = {
  title: "Apex Red — Amazon Wholesale Logistics & Prep Center Management | Apex Applications",
  description:
    "Manage shipments, warehouses, inventory, and prep center coordination and billing in one place.",
  alternates: { canonical: "https://apexapplications.io/features/red" },
};

export default function Page() {
  return <ApexRed />;
}
