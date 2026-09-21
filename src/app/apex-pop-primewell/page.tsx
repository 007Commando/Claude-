import type { Metadata } from "next";

import ApexPop from "../../components/ApexPop";
import { TRUSTPILOT } from "../../components/TrustpilotBadge";

/**
 * The Apex POP page for PrimeWell applicants.
 *
 * PrimeWell is the distribution company advertised on Wholesale Central, and
 * the sellers who apply for a PrimeWell account are sent here. They did not
 * come from an ad, so this version keeps the regular site header and footer:
 * they can reach Features, Pricing and sign-up from it, where the paid
 * version at /apex-pop deliberately offers nothing but the booking.
 *
 * Same content as /apex-pop, its own utm_term, so bookings from PrimeWell
 * applicants are told apart from ad bookings in the calendar. Kept out of
 * the index like its siblings.
 */
export const metadata: Metadata = {
  title: "Apex POP for PrimeWell Sellers: Build Your First or Next Purchase Order",
  description:
    "For sellers applying to PrimeWell: Apex POP is a working process with the Apex team, from suppliers and catalog analysis to a purchase order built in the Apex software. Not a course.",
  alternates: {
    canonical: "https://www.apexapplications.io/apex-pop-primewell",
  },
  robots: { index: false, follow: false },
};

/**
 * Into the software, not onto a call. A PrimeWell applicant is sent here
 * straight after applying, and the ask is to try Apex free and build their
 * next order in it. utm_source=primewell is what the app later reads off
 * the account to run the PrimeWell walkthrough; plan=free is the free
 * account the app has always had.
 */
const TRY_URL =
  "https://www.apexapplications.io/auth?mode=signup&plan=free&utm_source=primewell&utm_medium=funnel&utm_campaign=apex-pop-primewell";

export default function Page() {
  return (
    <ApexPop
      chrome="site"
      utmTerm="apex-pop-primewell"
      cta={{
        label: "Try Apex free and build your next order",
        sub: "Free account. Scan the PrimeWell catalog and build a purchase order in it.",
        href: TRY_URL,
      }}
      trustpilot={TRUSTPILOT}
      hide={["denial", "problem"]}
    />
  );
}
