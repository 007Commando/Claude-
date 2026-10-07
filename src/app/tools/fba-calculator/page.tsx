import type { Metadata } from "next";
import FbaCalculator from "../../../components/fba/FbaCalculator";
import { absoluteUrl } from "../../../config/site";
import { FBA_FAQ } from "../../../lib/fba/faq";

const TITLE = "Free Amazon FBA Calculator | Apex";
const DESCRIPTION =
  "Paste an ASIN to see the Buy Box price, 30, 60 and 90 day averages, sales rank and FBA fees. Add your cost for profit, margin and ROI. 3 free lookups, no account needed.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/tools/fba-calculator") },
  openGraph: {
    type: "website",
    siteName: "Apex Applications",
    title: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl("/tools/fba-calculator"),
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Free Amazon FBA Calculator",
    url: absoluteUrl("/tools/fba-calculator"),
    description: DESCRIPTION,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: "Apex Applications", url: absoluteUrl("/") },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FBA_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  },
];

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <FbaCalculator />
    </>
  );
}
