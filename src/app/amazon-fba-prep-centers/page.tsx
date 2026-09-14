import type { Metadata } from "next";
import ContentPage from "../../components/ContentPage";
import { absoluteUrl } from "../../config/site";

export const metadata: Metadata = {
  title: "How to Choose an FBA Prep Center | Apex Applications",
  description:
    "Compare service scope, location, intake rules and the full cost structure before choosing an FBA prep center. A per-unit rate is not a quote — here is what else to price.",
  alternates: { canonical: absoluteUrl("/amazon-fba-prep-centers") },
};

export default function Page() {
  return (
    <ContentPage
      eyebrow="Prep and fulfillment"
      h1="Find a prep partner that fits your operation."
      intro="Prep centers are usually chosen on the per-unit rate, which is the one number that tells you least. The total cost of a prep relationship is receiving, storage, exceptions and forwarding, and the difference between a cheap rate and a cheap invoice is where most of the money moves."
      sections={[
        {
          heading: "Match the service to the inventory",
          body:
            "Prep is not one service. What you need depends on what you buy: case-packed goods from a distributor need different handling from mixed pallets, and anything fragile, meltable, hazmat or expiry-dated narrows the field before price is even discussed. Ask what they actually do in-house rather than what they list.",
          points: [
            "Inspection, and what happens when a unit fails it",
            "Labeling, polybagging, bundling and multipacks",
            "Expiry-dated, hazmat, meltable and oversize handling",
            "Storage between receiving and shipment, and how long is free",
            "Shipment creation and forwarding to Amazon, or handoff back to you",
          ],
        },
        {
          heading: "Price the whole quote, not the per-unit rate",
          body:
            "A lower per-unit rate does not establish a lower total cost, and comparing prep centers on that number alone is how sellers end up paying more. Build the same quote from each one on a representative month of your actual volume, and include the charges that only appear on an invoice.",
          points: [
            "Receiving: per box, per pallet, or per unit, and any monthly minimum",
            "Prep charges by type, with the rate for the prep you actually need",
            "Storage after the free window, and how it is measured",
            "Forwarding and freight, including whether their rates or yours apply",
            "Exception fees: unexpected arrivals, missing labels, returns, disposal",
            "Turnaround time, in writing, and what happens when it slips",
          ],
        },
        {
          heading: "Prepare for the handoff",
          body:
            "Most first-shipment problems are paperwork, not capability. Agree what a clean delivery looks like before the supplier ships anything, and make sure your purchase order and their intake expect the same thing — the discrepancy you find at receiving is much cheaper than the one you find at Amazon.",
          points: [
            "Send the purchase order ahead so they can reconcile what arrives against it",
            "Agree how case quantities, bundles and multipacks are counted",
            "Confirm how shortages, damage and over-deliveries get reported back",
            "Set your per-unit prep cost in your own records so profitability reflects it",
          ],
        },
      ]}
      caveat={{
        heading: "Apex does not operate a prep center",
        body:
          "Apex is software. We connect to prep centers and warehouses so purchase orders, receiving counts and prep costs live in the same system as your buying and pricing, but we do not handle your inventory and we do not rank or endorse providers. This page is a checklist rather than a directory: we are not going to publish provider listings, local offices or ratings we cannot stand behind. Apex Red, the module that builds FBA shipments, is in beta.",
      }}
      faqs={[
        {
          question: "Does Apex operate a prep center?",
          answer:
            "No. Apex is software that connects to the prep center or warehouse you choose, so the order you sent and the units they received can be compared in one place. Your inventory is handled by them, not us.",
        },
        {
          question: "Can I search for a center near me?",
          answer:
            "Not here. A location search is only useful on top of maintained, verified location data, and inventing one to catch local searches would send you to offices that may not exist. When we have data worth searching, that will be a different page.",
        },
        {
          question: "How do prep costs reach my profit numbers?",
          answer:
            "You set your prep cost per unit in Apex, and it becomes part of the landed cost behind every profit, ROI and margin figure — including the floor the repricer will not sell below.",
        },
      ]}
      ctaHeading="Keep prep costs in the numbers that decide the buy"
      ctaBody="Prep and shipping costs belong in the landed cost, not in a spreadsheet beside it. In Apex they sit behind every margin and every price floor."
      ctaLabel="Compare prep requirements"
      related={[
        { label: "Inventory and restock planning", href: "/amazon-inventory-management-software" },
        { label: "Apex Red — shipments (beta)", href: "/features/red" },
        { label: "Prep center network", href: "/prep-center-network" },
        { label: "Profit and ROI calculator", href: "/tools/amazon-profit-calculator" },
      ]}
    />
  );
}
