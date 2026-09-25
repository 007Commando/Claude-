import type { Metadata } from "next";

import ApexPop from "../../components/ApexPop";
import PrimewellLeadForm from "../../components/PrimewellLeadForm";
import { TRUSTPILOT } from "../../components/TrustpilotBadge";

/**
 * /apex-pop-primewell with a form in the hero. A PrimeWell applicant who
 * fills it in lands in Apex's own GoHighLevel CRM tagged `primewell-lead`
 * (see /api/primewell-lead), which starts the PrimeWell SMS and email
 * sequence there, and is then sent on to the free account. The original page
 * stays as it is, so the two can be compared.
 */
export const metadata: Metadata = {
  title: "Apex for PrimeWell Sellers: Your Suppliers and Free Account",
  description:
    "For sellers applying to PrimeWell: get three vetted wholesale suppliers on sign up and three more every month, then scan the PrimeWell catalog and build your next purchase order in Apex.",
  alternates: { canonical: "https://www.apexapplications.io/primewell" },
  robots: { index: false, follow: false },
};

/** utm_source=primewell is what the app reads to run the PrimeWell walkthrough. */
const TRY_URL =
  "https://www.apexapplications.io/auth?mode=signup&plan=free&utm_source=primewell&utm_medium=funnel&utm_campaign=primewell-form";

export default function Page() {
  return (
    <ApexPop
      chrome="site"
      utmTerm="primewell-form"
      cta={{
        label: "Unlock my suppliers",
        sub: "Free. Takes 10 seconds.",
        href: TRY_URL,
      }}
      form={<PrimewellLeadForm signupUrl={TRY_URL} />}
      trustpilot={TRUSTPILOT}
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
        lede: "Your free account comes with three vetted US wholesale distributors, each with the contact who approves resellers, and three more every month. These are the screens you scan their catalogs and build the order in.",
      }}
    />
  );
}
