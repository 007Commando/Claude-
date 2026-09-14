import type { Metadata } from "next";
import PickPlan from "../../components/PickPlan";
import { PLANS, TRIAL_DAYS } from "../../config/offer";
import { absoluteUrl, SITE_URL } from "../../config/site";

export const metadata: Metadata = {
  title: `Apex Applications Pricing & ${TRIAL_DAYS}-Day Trial`,
  description:
    "Compare the workflows, capacity and team access included in Starter and Pro. Both plans include the repricer, and both start with a seven-day trial.",
  alternates: { canonical: absoluteUrl("/pricing") },
};

/**
 * The suite's product listing, on the one page that describes what it costs.
 *
 * This block used to sit in the root layout, which published a priced offer on
 * every blog post, the sign-in page and the privacy policy. Here it is in
 * context, and its prices come from the shared offer config rather than being
 * retyped — so the structured data and the cards below it can never quote
 * different numbers to a crawler and a customer.
 *
 * Deliberately no `aggregateRating`: Google wants one before it will show a
 * software-app rich result, and we have no review system to source it from.
 * Ineligible and honest beats eligible and invented.
 */
const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Apex Applications",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Amazon wholesale software suite: supplier catalogue analysis, purchase orders, profit analytics and repricing.",
  url: SITE_URL,
  offers: PLANS.map((plan) => ({
    "@type": "Offer",
    name: `${plan.name} Plan`,
    price: plan.monthly.toFixed(2),
    priceCurrency: "USD",
    category: "subscription",
    url: absoluteUrl("/pricing"),
  })),
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationJsonLd),
        }}
      />
      <PickPlan />
    </>
  );
}
