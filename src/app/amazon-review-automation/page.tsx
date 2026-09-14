import type { Metadata } from "next";
import ContentPage from "../../components/ContentPage";
import { absoluteUrl } from "../../config/site";

export const metadata: Metadata = {
  title: "Amazon Review Request Automation | Apex ReviewBooster",
  description:
    "Apex ReviewBooster sends Amazon's own standardized review request on eligible orders, on a schedule, with a log of what was sent. No custom messages, no selecting happy customers.",
  alternates: { canonical: absoluteUrl("/amazon-review-automation") },
};

export default function Page() {
  return (
    <ContentPage
      eyebrow="Reviews and feedback"
      h1="Make eligible review requests part of your routine."
      intro="Amazon already has a Request a Review button. The problem is that nobody clicks it on every order, every day, forever. Apex ReviewBooster carries out exactly that request, on the orders that are eligible, on a schedule — and keeps a record of which orders it sent and when."
      sections={[
        {
          heading: "It sends Amazon's request, not ours",
          body:
            "ReviewBooster calls Amazon's Solicitations API — the same standardized product review and seller feedback request behind the button in Seller Central. That means the buyer receives Amazon's own message, in Amazon's wording. There is no custom copy, no template to edit and no branded email, because that mechanism does not offer one. Anyone advertising customised messages is describing a different mechanism, and you should ask which.",
        },
        {
          heading: "Every eligible order, treated the same way",
          body:
            "The queue is built from orders that have shipped and reached the waiting period you set after their delivery date. It never looks at how a customer felt, because that information is not part of the decision and could not be even if we wanted it to be. What you can exclude is a listing — if a particular SKU should not be soliciting feedback, you exclude that SKU and every order containing it is skipped, for every buyer alike.",
          points: [
            "Orders must be shipped and past your chosen wait after the delivery date",
            "Exclusions are per listing, never per customer or per sentiment",
            "An order already requested is not requested again",
            "Requests are spaced out rather than fired in a burst, to stay inside Amazon's throttling",
          ],
        },
        {
          heading: "Know what was sent and when",
          body:
            "Each request is recorded against its Amazon order id, with the result Amazon returned. Amazon's reply that a review has already been requested for an order is treated as a success, because it means the buyer has been asked — by you, earlier, or by this. Failures are recorded as failures rather than silently retried forever, so the log is a record of what actually happened rather than what was attempted.",
        },
      ]}
      caveat={{
        heading: "A request is not a review",
        body:
          "Automation can carry out a request process consistently. It cannot produce a rating, raise a review count, or improve a ranking, and this page is not going to imply that it can. It also cannot solicit only satisfied customers: selective positive-review solicitation is against Amazon's policy, it is not something ReviewBooster is able to do, and it is not something we would build.",
      }}
      faqs={[
        {
          question: "Can I request reviews only from happy customers?",
          answer:
            "No. ReviewBooster has no visibility of how a customer felt and no way to filter on it. You can exclude a listing entirely, which applies to every buyer of that listing equally. Selecting customers by expected sentiment is against Amazon's policy and is not something the product supports.",
        },
        {
          question: "Can I customise the message?",
          answer:
            "No. The request goes through Amazon's Solicitations API, which sends Amazon's own standardized product review and seller feedback message. There is no message field to edit.",
        },
        {
          question: "When does it send?",
          answer:
            "After the order has shipped and the waiting period you set has passed since the delivery date. It runs on a schedule rather than instantly, and it will not ask twice about the same order.",
        },
        {
          question: "Will this increase my reviews?",
          answer:
            "Asking consistently tends to produce more responses than asking occasionally, but no one can promise you a number, and we are not going to. What this guarantees is that the eligible orders get asked.",
        },
      ]}
      ctaHeading="Ask on every eligible order, without remembering to"
      ctaBody="ReviewBooster runs on a schedule against the orders that qualify, and keeps the record of what it sent."
      ctaLabel="Explore review automation"
      related={[
        { label: "Apex Black — the daily dashboard", href: "/features/black" },
        { label: "ReviewBooster", href: "/review-booster" },
        { label: "What a plan costs", href: "/pricing" },
      ]}
    />
  );
}
