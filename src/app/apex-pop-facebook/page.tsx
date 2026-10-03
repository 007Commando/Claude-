import type { Metadata } from "next";

import ApexPop from "../../components/ApexPop";
import { TRUSTPILOT } from "../../components/TrustpilotBadge";

/**
 * The Apex POP page for Facebook lead-form applicants.
 *
 * Same page as /apex-pop-primewell, on its own URL so the two funnels can be
 * told apart at a glance in analytics, not only by the utm_source they carry.
 * The Apex Pop Promotion campaign's form end pages and its GoHighLevel
 * follow-ups all point here; PrimeWell's point at the PrimeWell twin.
 * Kept out of the index like its siblings.
 */
export const metadata: Metadata = {
  title: "Apex POP: Free Demo and Setup for Amazon Wholesale Sellers",
  description:
    "Your free demo and setup with the Apex team: three wholesale suppliers on sign-up, your first catalog scanned against real Amazon fees, and a purchase order built in the software. Not a course.",
  alternates: {
    canonical: "https://www.apexapplications.io/apex-pop-facebook",
  },
  robots: { index: false, follow: false },
};

/**
 * Into the software, not onto a call. utm_source=facebook is what the
 * marketing dashboard and the account's acquisition record read; plan=free
 * is the free account the app has always had.
 */
/**
 * The website arm of the Apex Pop A/B: the button goes to the qualifier,
 * which asks the instant form's questions on our own page (with a picture
 * for each answer) and only then makes the free account. utm_medium=website
 * is what separates this arm from the lead-form arm in GHL and in the app.
 */
const TRY_URL =
  "/apex-pop/start?from=apex-pop-facebook&utm_source=facebook&utm_medium=website&utm_campaign=apex-pop-promotion-web";

export default function Page() {
  return (
    <ApexPop
      chrome="site"
      utmTerm="apex-pop-facebook"
      cta={{
        label: "Try Apex free and build your next order",
        sub: "Free account. Scan a supplier catalog and build a purchase order in it.",
        href: TRY_URL,
      }}
      trustpilot={TRUSTPILOT}
      dollarWeek
      bare
      q4Ticker
      hero={{
        eyebrow: "For Amazon wholesale sellers",
        title: (
          <>
            Wholesale suppliers + the system that finds{" "}
            <mark>every profitable product.</mark>
          </>
        ),
        sub: "Three vetted US distributors when you sign up. Upload any price list and Apex checks every line against real Amazon fees in minutes.",
      }}
      hide={[
        "denial",
        "problem",
        "flow",
        "outcome",
        "fit",
        "faq",
        "disclaimer",
        "heroFine",
      ]}
      software={{
        label: "Suppliers included",
        title: (
          <>
            3 Wholesale Suppliers Sent Upon Sign up
            <br />
            <span className="pop-blue">+ Every month!</span>
          </>
        ),
        lede: "Sign up and we send you three vetted US wholesale distributors, each with the person who approves new resellers. Then three more every month.",
      }}
      showcase={{
        // The purchase order Short from /watch, 1:44 long.
        video: {
          id: "EClM6RcJ628",
          title: "Apex Applications: building an Amazon FBA purchase order",
          length: "1:44",
        },
      }}
    />
  );
}
