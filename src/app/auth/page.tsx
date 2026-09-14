import type { Metadata } from "next";
import { Suspense } from "react";
import Auth from "../../components/Auth";
import { TRIAL_DAYS } from "../../config/offer";
import { absoluteUrl } from "../../config/site";

export const metadata: Metadata = {
  title: "Log In or Sign Up — Apex Applications",
  description: `Log in to your Apex Applications dashboard, or start your ${TRIAL_DAYS}-day trial of the Amazon wholesale software suite.`,
  alternates: { canonical: absoluteUrl("/auth") },
  /**
   * A sign-in form is somewhere a customer arrives from the product, not from
   * a search result. It was in the sitemap at priority 0.5 and indexable,
   * which invites Google to rank a login box for the brand name and puts every
   * `?mode=signup&plan=…` variant in the index as a separate URL.
   *
   * Crawling stays allowed in robots.txt on purpose: a page blocked there can
   * never be fetched, so this directive would never be read and the URL could
   * still surface as a bare link. Signup is unaffected — noindex changes what
   * search does with the page, not what it does.
   */
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Auth />
    </Suspense>
  );
}
