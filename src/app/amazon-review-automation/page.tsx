import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import ContentPage from "../../components/ContentPage";

export const metadata: Metadata = pageMetadata({
  title: "Amazon Review Request Automation | Apex Review Booster",
  description:
    "What automated Request a Review is allowed to do on Amazon, and how Apex Review Booster stays inside it: Amazon's own message, eligible Amazon.com orders, no cherry-picking.",
  path: "/amazon-review-automation",
});

export default function Page() {
  return (
    <ContentPage
      eyebrow="Reviews and feedback"
      h1="Amazon review request automation that stays inside the rules."
      intro="Amazon already has a Request a Review button. The problem is that nobody clicks it on every order, every day, forever. Apex Review Booster carries out exactly that request, on eligible Amazon.com orders, on a schedule, and keeps a record of which orders it sent and when. This page explains the rules; the product itself is on the Review Booster page."
      sections={[
        {
          heading: "It sends Amazon's request, not ours",
          body:
            "Review Booster calls Amazon's Solicitations API. The same standardized product review and seller feedback request behind the button in Seller Central. That means the buyer receives Amazon's own message, in Amazon's wording. There is no custom copy, no template to edit and no branded email, because that mechanism does not offer one. Anyone advertising customised messages is describing a different mechanism, and you should ask which.",
        },
        {
          heading: "Every eligible order, treated the same way",
          body:
            "The queue is built from Amazon.com orders that have shipped and reached the waiting period you set. Amazon does not give sellers a delivery date for FBA orders, so the wait is a set number of days after the order date. It never looks at how a customer felt, because that information is not part of the decision and could not be even if we wanted it to be. What you can exclude is a listing. If a particular SKU should not be soliciting feedback, you exclude that SKU and every order containing it is skipped, for every buyer alike.",
          points: [
            "Orders must be shipped, from Amazon.com, and past your chosen number of days after the order date",
            "Exclusions are per listing, never per customer or per sentiment",
            "An order already requested is not requested again",
            "Requests are spaced out rather than fired in a burst, to stay inside Amazon's throttling",
          ],
        },
        {
          heading: "Know what was sent and when",
          body:
            "Each request is recorded against its Amazon order id, with the result Amazon returned. Amazon's reply that a review has already been requested for an order is treated as a success, because it means the buyer has been asked, by you, earlier, or by this. Failures are recorded as failures rather than silently retried forever, so the log is a record of what actually happened rather than what was attempted.",
        },
      ]}
      caveat={{
        heading: "A request is not a review",
        body:
          "Automation can carry out a request process consistently. It cannot produce a rating, raise a review count, or improve a ranking, and this page is not going to imply that it can. It also cannot solicit only satisfied customers: selective positive-review solicitation is against Amazon's policy, it is not something Review Booster is able to do, and it is not something we would build.",
      }}
      faqs={[
        {
          question: "Can I request reviews only from happy customers?",
          answer:
            "No. Review Booster has no visibility of how a customer felt and no way to filter on it. You can exclude a listing entirely, which applies to every buyer of that listing equally. Selecting customers by expected sentiment is against Amazon's policy and is not something the product supports.",
        },
        {
          question: "Can I customise the message?",
          answer:
            "No. The request goes through Amazon's Solicitations API, which sends Amazon's own standardized product review and seller feedback message. There is no message field to edit.",
        },
        {
          question: "When does it send?",
          answer:
            "After the order has shipped and the number of days you set has passed since the order date. Only Amazon.com orders are covered. It runs on a schedule rather than instantly, and it will not ask twice about the same order.",
        },
        {
          question: "Will this increase my reviews?",
          answer:
            "No one can promise you a number, and we are not going to. What Review Booster does is make sure the eligible orders get asked.",
        },
        {
          question: "What does it cost?",
          answer:
            "Review Booster is free to switch on, with no card, until October 31, 2026. After that it needs an Apex plan or the 7-day trial (card required, nothing charged until day 8). The Beginner plan allows 20 requests a month; Starter, Plus and Pro are unlimited.",
        },
      ]}
      ctaHeading="Ask on every eligible order, without remembering to"
      ctaBody="Review Booster runs on a schedule against the Amazon.com orders that qualify, and keeps the record of what it sent. It is free to switch on until October 31, 2026."
      ctaLabel="Create your account"
      related={[
        { label: "Apex Black, the daily dashboard", href: "/features/black" },
        { label: "Review Booster, the product", href: "/review-booster" },
        { label: "What a plan costs", href: "/pricing" },
      ]}
    />
  );
}
