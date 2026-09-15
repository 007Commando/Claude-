import type { Metadata } from "next";
import ApexRed from "../../../components/ApexRed";

export const metadata: Metadata = {
  title: "Apex Red, Amazon FBA Shipment Workflow (Beta)",
  description:
    "Manage shipments, warehouses, inventory, and prep center coordination and billing in one place.",
  alternates: { canonical: "https://www.apexapplications.io/features/red" },
};

export default function Page() {
  return <ApexRed />;
}
