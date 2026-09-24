import type { Metadata } from "next";
import ApexVas from "../../../components/ApexVas";

/**
 * The transactional half of the VA offer.
 *
 * /apex-vas sells the trial and books the meeting. This is where somebody who
 * has already decided picks a profile, sets a schedule and pays, without
 * having to sit through the pitch again.
 *
 * Noindex for the same reason its parent is: /virtual-assistants is the page
 * that answers this query in search, and putting a third of our own pages in
 * that auction helps nobody.
 */
export const metadata: Metadata = {
  title: "Hire an Amazon VA. Rates and availability | Apex Applications",
  description:
    "Pick a trained Amazon wholesale VA, set the weekly schedule and start within one business day. Part-time from $7.00/hour, full-time from $5.50/hour, 5% off paid quarterly.",
  alternates: { canonical: "https://www.apexapplications.io/apex-vas/hire" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ApexVas />;
}
