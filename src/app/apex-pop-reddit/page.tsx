import type { Metadata } from "next";

import ApexPop from "../../components/ApexPop";
import { TRUSTPILOT } from "../../components/TrustpilotBadge";

/**
 * Where Reddit ads land (October 2026 test).
 *
 * The same funnel as /apex-pop-facebook (this page, the qualifier, then the
 * $1 week) on its own URL, so Live View and the Lead Desk can tell the two
 * networks apart by landing page as well as by utm_source. The hero is
 * written for Reddit's sellers, who read past anything that sounds like an
 * ad: what the tool does with their price list, in plain words.
 *
 * The button carries no utm of its own. The ad's tags (utm_source=reddit,
 * the campaign, ad group and ad names, and Reddit's rdt_cid) were stored on
 * landing, and the qualifier reads them from there.
 */
export const metadata: Metadata = {
  title: "Apex: Check Every Line of a Supplier Price List Against Amazon Fees",
  description:
    "Upload any wholesale price list and Apex checks every line against real Amazon fees in minutes. Three vetted US distributors when you sign up. $1 for the first week.",
  alternates: {
    canonical: "https://www.apexapplications.io/apex-pop-reddit",
  },
  robots: { index: false, follow: false },
};

const TRY_URL = "/apex-pop/start?from=apex-pop-reddit";

export default function Page() {
  return (
    <ApexPop
      chrome="site"
      utmTerm="apex-pop-reddit"
      cta={{
        label: "Try Apex and scan your first price list",
        sub: "Upload a supplier catalog and see what's profitable before you order.",
        href: TRY_URL,
      }}
      trustpilot={TRUSTPILOT}
      dollarWeek
      bare
      q4Ticker
      hero={{
        eyebrow: "For Amazon wholesale and arbitrage sellers",
        title: (
          <>
            Upload a supplier price list. See which items{" "}
            <mark>actually make money on Amazon.</mark>
          </>
        ),
        sub: "Apex checks every line against real Amazon fees and sales rank in minutes, so you stop doing it row by row in a spreadsheet. You also get three vetted US distributors when you sign up.",
      }}
      hide={["denial", "problem", "flow", "outcome", "fit", "faq", "disclaimer", "heroFine"]}
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
