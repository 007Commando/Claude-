import type { Metadata } from "next";
import ContentPage from "../../components/ContentPage";
import { absoluteUrl } from "../../config/site";

export const metadata: Metadata = {
  title: "Amazon Inventory Management & Restock Planning | Apex Applications",
  description:
    "Review stock needs, organize suppliers and prepare purchase orders with the context of your Amazon business beside you. What Apex actually does, and what it does not.",
  alternates: { canonical: absoluteUrl("/amazon-inventory-management-software") },
};

export default function Page() {
  return (
    <ContentPage
      eyebrow="Inventory and purchasing"
      h1="Plan your next order with inventory and profit in view."
      intro="Restock decisions go wrong in the gap between two screens: what you have on hand lives in one place, what it costs and earns lives in another, and the order gets placed on a feeling. Apex keeps stock, cost and margin on the same row, and turns the decision straight into a purchase order."
      sections={[
        {
          heading: "See the products that need attention",
          body:
            "Your housed products carry the stock picture beside the economics: units available, what is already inbound, and what is sitting in a warehouse or prep center rather than at Amazon. Inbound and unavailable units are counted separately from sellable stock, because a restock decision that treats a pallet in transit as available buys the same units twice.",
          points: [
            "Available, inbound and warehouse quantities shown as separate figures, not one total",
            "Buy Box and 30, 60 and 90-day average prices on the same row as your landed cost",
            "Profit, ROI and margin computed from your own unit cost, prep cost and shipping",
            "A filter for products that clear your thresholds on every price basis at once, not just the best one",
          ],
        },
        {
          heading: "Make the assumptions visible",
          body:
            "Restock planning in Apex is assumption-based rather than predictive, and the assumptions are fields you set rather than a model you cannot inspect. You choose the target days of inventory to hold, whether to use each vendor's own lead time, and how many days to allow for prep. Those three numbers drive the suggestion. There is no black-box demand forecast here, and this page is not going to describe one.",
          points: [
            "Target days of inventory — how deep you want to be covered",
            "Vendor lead time, taken per supplier, or a single figure across all of them",
            "Prep days, added on top of the supplier's lead time",
          ],
        },
        {
          heading: "Prepare a supplier order",
          body:
            "From the restock view, the products you select become a purchase order grouped by vendor, carrying the unit cost, case pack and bundle quantity already on record. The order tracks through submission to the warehouse or prep center, and when the receiving counts come back you can see them against what you ordered — including the lines that arrived short, damaged, or that arrived without being ordered at all.",
          points: [
            "Purchase orders grouped by vendor, seeded with your recorded costs and case packs",
            "The current selling price carried across from your database, not re-entered",
            "Receiving discrepancies tracked line by line against the original order",
          ],
        },
      ]}
      caveat={{
        heading: "What this page does not claim",
        body:
          "Apex Red, the module that builds and sends FBA shipments, is in beta — this page describes inventory planning and purchasing, which are not. Restock suggestions are arithmetic on the assumptions you enter, not a statistical forecast with a service level. And a purchase order is an accounting document, not a cash-flow plan: the profit a product shows is not the cash you will have when the invoice falls due.",
      }}
      faqs={[
        {
          question: "Does this include FBA shipment creation?",
          answer:
            "Apex Red covers shipment building and it is in beta. Inventory planning and purchasing, described on this page, are not in beta. Confirm fulfillment support separately before you rely on it.",
        },
        {
          question: "Can I use my own lead times?",
          answer:
            "Yes. Lead time can be set per vendor and used automatically, or you can work from a single figure. Prep days are a separate field on top, and target days of inventory decides how deep you want to be covered.",
        },
        {
          question: "Does it forecast demand?",
          answer:
            "No, and we are not going to say otherwise. The restock figure comes from your target cover, your lead times and your current stock. If you want a statistical forecast with a service level, this is not that.",
        },
      ]}
      ctaHeading="Plan your next order on your own numbers"
      ctaBody="Connect your store and the stock, costs and margins land on one screen, with the purchase order one step away."
      ctaLabel="Plan my next order"
      related={[
        { label: "Apex Blue — profit and analytics", href: "/features/blue" },
        { label: "Apex vs InventoryLab / Seller 365", href: "/compare/inventorylab" },
        { label: "Profit and ROI calculator", href: "/tools/amazon-profit-calculator" },
        { label: "What a plan costs", href: "/pricing" },
      ]}
    />
  );
}
