import Link from "next/link";
import { ArrowRight } from "lucide-react";

import CheckoutLink from "./CheckoutLink";
import { TRIAL_CHECKOUT_URL, trialCta, trialTerms } from "../config/offer";

/**
 * The trial button at the top of a page that paid search lands on.
 *
 * Added 2026-10-07 for the Google Ads rebuild. An above-the-fold audit found
 * no trial button on any of the eighteen comparison pages, the wholesale and
 * inventory guides or /ai: a visitor who clicked "SellerAmp alternative" read
 * a headline and an essay before the first way to start. Same card-first
 * checkout as the homepage hero (TRIAL_CHECKOUT_URL, which returns to /auth
 * with the session id that fires Trial Started), so every paid landing page
 * converts the same way and the conversion is counted once, on return.
 *
 * `cta` names the button in the GA4 cta_click event (data-cta); it is never a
 * conversion.
 */
export default function HeroCta({
  cta,
  align = "center",
  secondary = { label: "See plans", href: "/pricing" },
}: {
  cta: string;
  align?: "center" | "left";
  secondary?: { label: string; href: string } | null;
}) {
  const center = align === "center";
  return (
    <div className={`mt-8 ${center ? "flex flex-col items-center text-center" : ""}`}>
      <div className={`flex flex-col gap-3 sm:flex-row ${center ? "justify-center" : ""}`}>
        <CheckoutLink
          href={TRIAL_CHECKOUT_URL}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-bold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <span data-cta={cta}>{trialCta}</span> <ArrowRight size={18} aria-hidden="true" />
        </CheckoutLink>
        {secondary && (
          <Link
            href={secondary.href}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-bold text-slate-900 transition hover:border-slate-400"
          >
            {secondary.label}
          </Link>
        )}
      </div>
      <p className={`mt-3 max-w-md text-sm text-slate-500 ${center ? "mx-auto" : ""}`}>{trialTerms("starter")}</p>
    </div>
  );
}
