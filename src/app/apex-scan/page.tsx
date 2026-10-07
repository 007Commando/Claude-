import type { Metadata } from "next";

import ApexScanFunnel from "../../components/ApexScanFunnel";

/**
 * Where the catalog-scan video ads land (October 2026). The structure is
 * studied from a top software funnel; see marketing-exports/funnels/
 * hyros-teardown.md. Not indexed: it's an ad destination, not a search page.
 */
export const metadata: Metadata = {
  title: "Apex: More Products That Actually Make Money, From the Suppliers You Have",
  description:
    "Apex checks every line of a supplier's price list against Amazon fees, Buy Box and monthly sales. $1 for your first week.",
  alternates: { canonical: "https://www.apexapplications.io/apex-scan" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ApexScanFunnel />;
}
