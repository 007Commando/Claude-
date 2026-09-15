import type { Metadata } from "next";
import ContentPage from "../../components/ContentPage";
import { absoluteUrl } from "../../config/site";

export const metadata: Metadata = {
  title: "Amazon Wholesale Suppliers: How to Vet Them",
  description:
    "A repeatable process for vetting Amazon wholesale suppliers. Identity, brand authorization, invoice requirements, channel terms and product eligibility, before you place an order.",
  alternates: { canonical: absoluteUrl("/amazon-wholesale-suppliers") },
};

export default function Page() {
  return (
    <ContentPage
      eyebrow="Suppliers"
      h1="Build a supplier shortlist you can evaluate."
      intro="Finding a supplier is the easy half. The half that costs money is finding out, after the pallet arrives, that they cannot give you the invoice Amazon will ask for, or that the brand does not permit the channel you are selling on. This is the process to run before you buy, in the order that fails cheapest first."
      sections={[
        {
          heading: "Check the business before the catalog",
          body:
            "Most bad supplier relationships are visible at this stage and skipped because the price list looks good. Confirm the company is who it says it is, in the jurisdiction it claims, with a trading history you can see. An introduction from any source. A directory, a broker, a list you bought, or ours. Is a starting point for this process, never a substitute for it.",
          points: [
            "Registered business identity and address you can independently confirm",
            "A real application route: account forms, references, resale certificate",
            "Trading history, and whether they have supplied online resellers before",
            "Who you would actually speak to when a delivery is wrong",
          ],
        },
        {
          heading: "Ask the questions Amazon will ask you",
          body:
            "Ungating and inauthenticity complaints both come down to paperwork you either have or do not. Ask for it before the order, not after a listing is suspended. A supplier who cannot produce a compliant invoice is not a supplier you can safely scale on, however good the pricing looks.",
          points: [
            "Invoices showing their details, your details, the product and the quantity",
            "Whether they are the brand, an authorized distributor, or neither",
            "Written confirmation that reselling on Amazon is permitted under their terms",
            "Whether the brand restricts channels, MAP pricing, or specific marketplaces",
          ],
        },
        {
          heading: "Then price the catalog properly",
          body:
            "Once the supplier passes, the question becomes whether the numbers work, and that is a scanning job rather than a reading job. Apex Green takes the whole price list, matches it against the marketplace and works the economics using your own prep and shipping costs, so the shortlist of products worth buying comes out of the file rather than out of a sample you checked by hand.",
          points: [
            "Minimum order value and quantity, against what you can actually sell through",
            "Payment terms, and what they cost you in cash tied up",
            "Lead time, which becomes the lead time in your restock planning",
            "The landed cost, not the list price, prep, freight and fees included",
          ],
        },
      ]}
      caveat={{
        heading: "What this page deliberately is not",
        body:
          "This is not a supplier directory. We are not going to publish a list of company names and contact details on a public page to rank for a search term. The businesses on such a list have not agreed to it, and a directory assembled for SEO is exactly how sellers end up contacting suppliers who never wanted the introduction. Apex subscribers get authorized distributor access inside the application, where the entitlement is real and the relationship is accounted for. A supplier introduction is never an approval to sell a brand.",
      }}
      faqs={[
        {
          question: "Does a supplier guarantee Amazon approval?",
          answer:
            "No. Ungating depends on your account, the specific brand and category, and the documentation you can produce. A supplier relationship is one input to that, not the outcome.",
        },
        {
          question: "What supplier access comes with a plan?",
          answer:
            "Subscriptions include authorized distributor access that grows the longer the subscription runs, and an annual plan opens the full roster immediately. The exact entitlement is shown in your account. We would rather you read it there than take a number from a marketing page.",
        },
        {
          question: "Can I just buy a supplier list?",
          answer:
            "You can, and they circulate widely enough that the same contacts reach thousands of sellers. The vetting process above matters more than the list, because it is what separates a supplier you can build on from a name in a spreadsheet.",
        },
      ]}
      ctaHeading="Price a supplier's catalog before you commit"
      ctaBody="Take one price list through Apex Green and see which lines actually clear your thresholds on your own costs."
      ctaLabel="Explore my supplier access"
      related={[
        { label: "Apex Green, catalog scanning", href: "/features/green" },
        { label: "Amazon ungating guide", href: "/ungating-guide" },
        { label: "Profit and ROI calculator", href: "/tools/amazon-profit-calculator" },
        { label: "What a plan costs", href: "/pricing" },
      ]}
    />
  );
}
