import type { Metadata } from "next";
import { Suspense } from "react";
import Proposal from "../../components/Proposal";

export const metadata: Metadata = {
  title: "Book a Call — Apex Applications",
  description:
    "See how the Apex system turns distributor catalogs into predictable Amazon wholesale profit, then book a call.",
  // Paid-traffic bridge page: keep it out of the organic index so it never
  // competes with the pages built to rank.
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Proposal />
    </Suspense>
  );
}
