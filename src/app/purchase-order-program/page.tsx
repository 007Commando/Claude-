import type { Metadata } from "next";

import PurchaseOrderProgram from "../../components/PurchaseOrderProgram";

/**
 * Kept out of the index, like /apex-pop and /first-order-roadmap.
 *
 * This is a paid-traffic landing page for one action. Indexed, it would
 * compete with /amazon-wholesale-suppliers and the feature pages for the same
 * queries while saying less about the product, and the copy is written for
 * someone who has just clicked an ad rather than someone searching.
 */
export const metadata: Metadata = {
  title: "Purchase Order Program: Your First Suppliers, Ungating, Research and First Order | Apex",
  description:
    "A working program with the Apex team: your first suppliers, your selling approvals, your research and your first purchase order, built together in the Apex software. Not a course.",
  alternates: {
    canonical: "https://www.apexapplications.io/purchase-order-program",
  },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PurchaseOrderProgram />;
}
