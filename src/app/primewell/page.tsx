import type { Metadata } from "next";

import ApexPop from "../../components/ApexPop";
import PrimewellLeadForm from "../../components/PrimewellLeadForm";
import { TRUSTPILOT } from "../../components/TrustpilotBadge";

/**
 * /apex-pop-primewell with a sign-up form in the hero. One submit puts the
 * applicant into Apex's own GoHighLevel CRM tagged `primewell-lead` (see
 * /api/primewell-lead), which starts the PrimeWell SMS and email sequence
 * there, and creates their free Apex account; the form then becomes the
 * six-digit code screen. The original page stays as it is, so the two can be
 * compared.
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

/**
 * PrimeWell's thank-you page passes the applicant's details in the fragment
 * (#name=…&email=…&phone=…), never the query string, so they never reach a
 * server log or a Referer header. This runs while the HTML is parsed, before
 * the Meta pixel and Google tag load (both afterInteractive), so it can move
 * the details into sessionStorage and wipe the fragment before either tracker
 * reads the address. PrimewellLeadForm picks them up from there.
 */
const TAKE_PREFILL = `(function(){try{var h=location.hash;if(!h||h.length<2)return;var p=new URLSearchParams(h.slice(1)),d={},n=0;["name","first_name","last_name","email","phone"].forEach(function(k){var v=p.get(k);if(v){d[k]=v.slice(0,255);n++}});if(!n)return;window.__pwPrefill=d;history.replaceState(history.state,"",location.pathname+location.search);sessionStorage.setItem("apex_pw_prefill",JSON.stringify(d))}catch(e){}})();`;

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
      form={
        <>
          <script dangerouslySetInnerHTML={{ __html: TAKE_PREFILL }} />
          <PrimewellLeadForm />
        </>
      }
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
