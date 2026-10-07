import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import PickPlan from "../../components/PickPlan";
import { PLANS_SHOWN, TRIAL_DAYS } from "../../config/offer";
import { absoluteUrl, SITE_URL } from "../../config/site";
import { ORGANIZATION_ID, SOFTWARE_ID } from "../../config/product";

export const metadata: Metadata = pageMetadata({
  title: `Apex Pricing: Plans and ${TRIAL_DAYS}-Day Trial`,
  description:
    `Compare what the ${PLANS_SHOWN.map((p) => p.name).join(", ").replace(/, ([^,]*)$/, " and $1")} plans include, from supplier scans and products to the repricer and AI access. Every plan starts with a ${TRIAL_DAYS}-day trial.`,
  path: "/pricing",
});

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
  "@id": SOFTWARE_ID,
  name: "Apex Applications",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Amazon wholesale software: supplier catalog analysis, purchase orders, profit and loss, inventory and restock planning, repricing on Pro, and ChatGPT and Claude connections to your own data.",
  url: SITE_URL,
  publisher: { "@id": ORGANIZATION_ID },
  // PLANS_SHOWN, not PLANS: the structured data must offer exactly what the
  // cards below it offer, or a crawler and a customer are quoted different
  // catalogues — which is the failure this config was written to prevent.
  offers: PLANS_SHOWN.map((plan) => ({
    "@type": "Offer",
    name: `${plan.name} Plan`,
    description: plan.fitsWho,
    price: plan.monthly.toFixed(2),
    priceCurrency: "USD",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: plan.monthly.toFixed(2),
      priceCurrency: "USD",
      billingDuration: "P1M",
      unitText: "month",
    },
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
