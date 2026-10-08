import type { ReactNode } from "react";

import { PLAN_LIMITS, limitLabel } from "../../config/offer";
import { REPRICER_FACTS, VERIFIED_STATS, reviewBoosterFreeNow, REVIEW_BOOSTER, type ModuleKey } from "../../config/product";

import upcScanner from "../../assets/upc-scanner.png.asset.json";
import masterCatalog from "../../assets/master-catalog.png.asset.json";
import purchaseOrders from "../../assets/purchase-orders.png.asset.json";
import profitLoss from "../../assets/profit-loss-dashboard.png.asset.json";
import inventoryRestocking from "../../assets/inventory-restocking.png.asset.json";
import vendorsDashboard from "../../assets/vendors-dashboard.png.asset.json";
import opexDashboard from "../../assets/opex-dashboard.png.asset.json";
import marketDatabase from "../../assets/market-intelligence-database.png.asset.json";
import dashboard from "../../assets/dashboard.png.asset.json";
import reviewBooster from "../../assets/review-booster.png.asset.json";
import apexUniversity from "../../assets/apex-university.png.asset.json";
import resourceLibrary from "../../assets/resource-library.png.asset.json";

/**
 * The words on each v2 module page.
 *
 * The display lines carry the power; everything under them is a fact the app
 * does today. Gold and Red have no real screenshots yet, so they show a plainly
 * labelled example and a checked list instead of concept art.
 */

export interface ModuleRow {
  id?: string;
  label: string;
  title: string;
  body: string;
  points?: string[];
  src?: string;
  alt?: string;
  node?: ReactNode;
}

export interface ModuleContent {
  display: string;
  intro: string;
  cta: { label?: string; href?: string; plan?: "starter" | "pro"; note?: string };
  hero: { kind: "image"; src: string; alt: string } | { kind: "node"; node: ReactNode };
  highlightsTitle: string;
  highlights: { big: string; small: string }[];
  rows: ModuleRow[];
  close: string;
}

/* ------------------------------------------------------------------ */
/* Illustrations for the modules without screenshots                    */
/* ------------------------------------------------------------------ */

const REPRICE_EXAMPLE = [
  { sku: "Facial Serum 1oz", floor: "$7.29", price: "$18.90", change: "+$0.35" },
  { sku: "Tea Tree Oil 2oz", floor: "$9.14", price: "$21.40", change: "−$0.22" },
  { sku: "Wave Serum 5.3oz", floor: "$11.02", price: "$26.15", change: "+$1.10" },
  { sku: "Hair Pack 8.4oz", floor: "$8.61", price: "$19.75", change: "+$0.18" },
];

function RepriceExample() {
  return (
    <figure className="mx-auto max-w-[900px] overflow-hidden rounded-[22px] border border-hairline bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04),0_30px_60px_-30px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between border-b border-hairline/70 bg-mist/60 px-5 py-3">
        <span className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="text-[13px] font-medium text-quiet">Preview · example, not real data</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-[15px] tabular-nums">
          <thead>
            <tr className="text-[13px] text-quiet">
              <th className="px-6 py-4 font-medium">Listing</th>
              <th className="px-6 py-4 font-medium">Your floor</th>
              <th className="px-6 py-4 font-medium">New price</th>
              <th className="px-6 py-4 text-right font-medium">Change</th>
            </tr>
          </thead>
          <tbody>
            {REPRICE_EXAMPLE.map((r) => (
              <tr key={r.sku} className="border-t border-hairline/70">
                <td className="px-6 py-4 font-medium text-ink">{r.sku}</td>
                <td className="px-6 py-4 text-quiet">{r.floor}</td>
                <td className="px-6 py-4 text-ink">{r.price}</td>
                <td className={`px-6 py-4 text-right font-medium ${r.change.startsWith("+") ? "text-mod-green" : "text-quiet"}`}>{r.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

const FLOOR_GOALS = [
  { goal: "Minimum 10% ROI", how: "Floor worked out per listing from your cost and Amazon's fees" },
  { goal: "Minimum 15% margin", how: "Solved from the referral rate and fulfillment fee" },
  { goal: "Minimum $1.00 profit", how: "A hard dollar floor under every unit sold" },
];

function FloorGoals() {
  return (
    <div className="mx-auto grid max-w-[900px] gap-4 sm:grid-cols-3">
      {FLOOR_GOALS.map((g) => (
        <div key={g.goal} className="rounded-[22px] bg-white p-6">
          <p className="type-display text-[24px] text-ink">{g.goal}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-quiet">{g.how}</p>
        </div>
      ))}
    </div>
  );
}

/** Checked against the running app, 14 September 2026 (kept from ApexRed). */
const RED_IN_BETA = [
  "Building an FBA shipment from your purchase orders, through Amazon's current Fulfillment Inbound API",
  "Packing and placement options returned by Amazon, with box contents, weights and dimensions",
  "Connecting a warehouse or prep center, and sending the order ahead so they can reconcile what arrives",
  "Receiving counts back against the order, including short, damaged and over-delivered lines",
  "Prep costs per unit, carried into the landed cost behind your margins and price floors",
  "Prep billing and invoices between a seller and their prep center",
  "Messaging between a seller and their prep center against a specific shipment",
];

const RED_NOT_YET = [
  "Discounted carrier rates. Apex does not resell freight and has no carrier agreement",
  "Automated 2D barcode or label printing workflows",
  "Marketplaces beyond Amazon US",
  "A guaranteed turnaround, SLA or support commitment while the module is in beta",
];

function RedFlow() {
  const steps = ["Purchase order", "Prep center", "Received and counted", "Shipment to Amazon"];
  return (
    <div className="mx-auto max-w-[1000px] rounded-[28px] bg-mist px-6 py-12 text-ink sm:px-12">
      <ol className="grid gap-8 sm:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s} className="border-t border-hairline pt-5">
            <span className="text-[13px] text-quiet">Step {i + 1}</span>
            <p className="mt-1 text-[19px] font-semibold">{s}</p>
          </li>
        ))}
      </ol>
      <p className="mt-10 text-[13px] text-quiet">The path a unit takes in Apex Red, with the prep center's chat and bills beside it.</p>
    </div>
  );
}

function RedScope() {
  return (
    <div className="grid gap-12 md:grid-cols-2">
      <div>
        <h3 className="text-[21px] font-semibold text-ink">Working in the beta today</h3>
        <ul className="mt-5 space-y-4 text-[17px] leading-relaxed text-graphite">
          {RED_IN_BETA.map((t) => <li key={t} className="border-t border-hairline pt-4">{t}</li>)}
        </ul>
      </div>
      <div>
        <h3 className="text-[21px] font-semibold text-ink">Not part of it</h3>
        <ul className="mt-5 space-y-4 text-[17px] leading-relaxed text-quiet">
          {RED_NOT_YET.map((t) => <li key={t} className="border-t border-hairline pt-4">{t}</li>)}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The five pages                                                       */
/* ------------------------------------------------------------------ */

const PRO_SIGNUP = "/auth?mode=signup&plan=pro&period=monthly";

export const MODULE_CONTENT: Record<ModuleKey, ModuleContent> = {
  green: {
    display: "Every supplier list. Every match. One pass.",
    intro:
      "Drop in a supplier's price list. Apex matches every UPC and EAN to Amazon in the background and shows profit, ROI, rank and competition on every line.",
    cta: {},
    hero: { kind: "image", src: upcScanner.url, alt: "The Apex UPC Scanner with a matched supplier price list" },
    highlightsTitle: "Sourcing at catalog scale.",
    highlights: [
      { big: VERIFIED_STATS.identifiers.value, small: "UPC and EAN identifiers to match your supplier lists against." },
      { big: VERIFIED_STATS.catalog.value, small: "Amazon products in the Apex catalog." },
      { big: limitLabel(PLAN_LIMITS.plus.upcSkusPerMonth), small: "Supplier lines a month on Plus. Unlimited on Pro." },
    ],
    rows: [
      {
        id: "upc-scanner",
        label: "UPC Scanner",
        title: "Thousands of lines. Only the winners.",
        body:
          "Filter every match by profit, ROI, sales rank, seller count and whether Amazon sells it, and hide what you already carry. Pack sizes and variations can make a match ambiguous, so check case packs before you order.",
        points: [
          "Works through the whole file in the background",
          "Sales rank and estimated sales per listing",
          "Seller counts and who holds the Buy Box",
          "Hazmat and meltable flags on every match",
        ],
      },
      {
        id: "master-catalog",
        label: "Master Catalog",
        title: "Every supplier. One catalog.",
        body:
          "Every price list you scan lands in one Master Catalog, so you can see which supplier has the best price on a product you already sell, and move it straight to your database or a purchase order.",
        src: masterCatalog.url,
        alt: "The Apex Master Catalog comparing suppliers",
      },
    ],
    close: "Your next supplier list is already waiting.",
  },

  blue: {
    display: "Know your margin before you buy.",
    intro:
      "Suppliers, purchase orders, landed cost, profit and loss and restocking, in one place. Built from your own costs and Amazon's real fees.",
    cta: {},
    hero: { kind: "image", src: purchaseOrders.url, alt: "A purchase order in Apex Blue with projected revenue and profit" },
    highlightsTitle: "The numbers you buy on.",
    highlights: [
      { big: "Every few minutes.", small: "Orders, sales, refunds, Amazon fees and FBA inventory sync from Amazon." },
      { big: "Day. Week. Month.", small: "A profit and loss statement at whatever range you choose." },
      { big: "Your cost wins.", small: "A submitted purchase order fills in unit costs. A cost you type yourself always overrides it." },
    ],
    rows: [
      {
        id: "analytics",
        label: "Profit and loss",
        title: "Real profit, as you sell.",
        body:
          "Sales sync from Amazon, fees come off automatically, and the operating expenses you record take you from gross to net. By day, week or month, down to each SKU.",
        src: profitLoss.url,
        alt: "The Apex profit and loss dashboard",
      },
      {
        label: "Restock",
        title: "Reorder before you run out.",
        body:
          "Days of stock left and a restock status for every product, from your stock, sales velocity and the cover you set. Start a purchase order straight from what needs restocking.",
        src: inventoryRestocking.url,
        alt: "Inventory and restock planning in Apex Blue",
      },
      {
        id: "vendors",
        label: "Suppliers",
        title: "Every vendor, on terms you can see.",
        body: "Contacts, terms and lead times for each supplier, with stated lead time shown against the actual one. Purchase orders start from the right details.",
        src: vendorsDashboard.url,
        alt: "The Apex vendors dashboard",
      },
      {
        id: "databases",
        label: "Products database",
        title: "What is profitable, across every supplier.",
        body:
          "Buy Box price, fees, net proceeds, profit, ROI and margin for every product in your database, with 30, 60 and 90 day averages on Plus and Pro.",
        src: marketDatabase.url,
        alt: "The Apex products database",
      },
      {
        id: "opex",
        label: "Operating expenses",
        title: "What it really costs to run.",
        body: "Track every subscription, tool and team cost by category, so net profit is the real number and cost creep shows up early.",
        src: opexDashboard.url,
        alt: "The Apex operating expenses tracker",
      },
    ],
    close: "Buy your next order on real numbers.",
  },

  gold: {
    display: "Pricing with a floor.",
    intro:
      "A rule-based repricer that knows what each unit cost you. Floors come from your cost and Amazon's fees, you preview every change, and every decision is logged.",
    cta: { label: "Start my 7-day Pro trial", href: PRO_SIGNUP, plan: "pro" },
    hero: { kind: "node", node: <RepriceExample /> },
    highlightsTitle: "Built to protect the margin.",
    highlights: [
      { big: "Your floor.", small: "Worked out from your cost and Amazon's fees, or from a target ROI, margin or profit." },
      { big: "Preview first.", small: "See what a strategy would change before any price moves." },
      { big: "Every decision logged.", small: "Price Activity shows each change and the reason for it." },
    ],
    rows: [
      {
        id: "floor-goals",
        label: "Break-even floors",
        title: "Set the floor by the goal you run on.",
        body:
          "Gold works out the true break-even for every listing from the referral fee, the fulfillment fee and your cost, then sets the floor from a minimum ROI, margin or dollar profit. In bulk. With no real fee data, it refuses to guess.",
        node: <FloorGoals />,
      },
      {
        id: "strategies",
        label: "How prices move",
        title: "You run it. It stays above your numbers.",
        body: `${REPRICER_FACTS.howPricesMove} ${REPRICER_FACTS.plans}`,
        points: [
          "Bulk on and off, and bulk strategy assignment",
          "Buy Box, featured offer and lowest offer per listing",
          "Seller count, Amazon on the listing and rank on every row",
          "MAP status by brand",
        ],
      },
    ],
    close: "Price with a floor under every listing.",
  },

  red: {
    display: "From supplier dock to Amazon.",
    intro:
      "Shipments, warehouses, prep centers and their billing, in the same system that buys and prices your stock. In beta and opened by invitation.",
    cta: {
      label: "Request an invitation",
      href: "/contact-us",
      note: "Free for sellers connected to a prep center that is approved on Apex.",
    },
    hero: { kind: "node", node: <RedFlow /> },
    highlightsTitle: "One system, all the way to the warehouse.",
    highlights: [
      { big: "Inbound API.", small: "FBA shipments built from your purchase orders through Amazon's current Fulfillment Inbound API." },
      { big: "Counted on arrival.", small: "Short, damaged and over-delivered lines reconciled against the order." },
      { big: "Prep in your margin.", small: "Prep costs per unit carried into the landed cost behind your margins and floors." },
    ],
    rows: [
      {
        id: "shipments",
        label: "The beta, honestly",
        title: "What works today.",
        body: "Checked against the running application. Screens and steps may still change while it is in beta.",
        node: <RedScope />,
      },
    ],
    close: "Bring your prep center into Apex.",
  },

  black: {
    display: "Your business, at a glance.",
    intro:
      "Sales, profit and inventory value on one screen. Amazon's own review request, sent for you. And a wholesale curriculum that comes with every account.",
    cta: {},
    hero: { kind: "image", src: dashboard.url, alt: "The Apex Black home dashboard" },
    highlightsTitle: "Where every Apex day starts.",
    highlights: [
      { big: "One screen.", small: "Sales, profit and inventory value, with daily velocity by SKU and brand performance." },
      { big: "Amazon's own button.", small: `Review Booster sends Amazon's Request a Review on eligible ${REVIEW_BOOSTER.marketplace} orders, after the wait you choose.` },
      reviewBoosterFreeNow()
        ? { big: `Free until ${REVIEW_BOOSTER.freeUntilLabel.replace(", 2026", "")}.`, small: "Switch Review Booster on with no card. Boosters you start keep running." }
        : { big: "Every lesson.", small: "Apex University's Wholesale Blueprint comes with every account." },
    ],
    rows: [
      {
        id: "review-booster",
        label: "Review Booster",
        title: "Every eligible order, asked.",
        body:
          "Amazon's standard Request a Review, sent a set number of days after the order, with a log of every request. It never picks buyers by sentiment and cannot write or guarantee a review.",
        points: [
          "You choose the wait after each order",
          "Leave out any listings you do not want asked about",
          "Amazon's own message, no custom wording",
          "A log of every request sent",
        ],
        src: reviewBooster.url,
        alt: "Review Booster in Apex Black",
      },
      {
        id: "apex-university",
        label: "Apex University",
        title: "The Wholesale Blueprint.",
        body: "A video curriculum for Amazon wholesale sellers. Work through the lessons one at a time and put each into practice.",
        src: apexUniversity.url,
        alt: "Apex University, the Wholesale Blueprint curriculum",
      },
      {
        id: "resource-library",
        label: "Resource Library",
        title: "The right people, already found.",
        body: "Prep centers and 3PLs, IP and legal services, P&L templates and currency exchange providers, inside the app.",
        src: resourceLibrary.url,
        alt: "The Apex Resource Library",
      },
    ],
    close: "Start every day with the whole picture.",
  },
};
