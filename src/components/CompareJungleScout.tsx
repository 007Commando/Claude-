"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { CompareTable, CompareCta, HonestVerdict, FactsFootnote, fadeIn, WorkflowCoverage, PriceBars, SuiteShot } from "./CompareShared";
import { APEX_ENTRY, APEX_EXTENSION, APEX_GOLD, APEX_RED } from "../data/comparisons";
import { planById } from "../config/offer";

export default function CompareJungleScout() {
  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* initial={false}: the hero is the LCP element and must render visible on the server, not at opacity 0. */}
        <motion.header {...fadeIn} initial={false} className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-5">Honest comparison</p>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.05] mb-6">
            Apex Applications vs Jungle Scout
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            Jungle Scout is known for private-label product research: finding a niche,
            validating demand, sourcing a supplier to make <em>your</em> product. Apex is for the
            seller whose product already exists on the shelf: <strong>third-party resellers</strong>{" "}
            buying real brands at wholesale and winning on execution. Restock timing, break-even
            repricing, and cashflow. Both are research tools at heart; they research different
            businesses.
          </p>
        </motion.header>

        <WorkflowCoverage
          rivalName="Jungle Scout"
          rival={[
            { state: "partial", note: "niche validation" },
            { state: "partial", note: "manufacturers" },
            { state: "none" },
            { state: "none" },
            { state: "partial", note: "sales analytics" },
          ]}
        />

        <CompareTable
          rivalName="Jungle Scout"
          rows={[
            { label: "Built for", apex: "Wholesale & third-party reselling", rival: "Private label research & launch" },
            { label: "Entry price", apex: APEX_ENTRY, rival: "$49/mo Starter · $79 Growth · $149 Brand Owner + CI" },
            { label: "Free trial", apex: "7 days, every plan", rival: "None; 7-day money-back" },
            { label: "Niche & demand validation", apex: false, rival: "Opportunity Finder" },
            { label: "Manufacturer sourcing (make your product)", apex: false, rival: "Supplier Database" },
            { label: "Wholesale brand & seller intelligence", apex: "122M+ products, per-brand seller maps", rival: "Top tier only (Competitive Intelligence)" },
            { label: "Automated repricer", apex: APEX_GOLD, rival: "Not verified" },
            { label: "Purchase orders & restock math", apex: true, rival: "Not verified" },
            { label: "Prep center & logistics coordination", apex: APEX_RED, rival: "Not verified" },
            { label: "P&L / cashflow from your store", apex: true, rival: "Sales analytics" },
            { label: "Browser extension", apex: APEX_EXTENSION, rival: true },
          ]}
        />

        <PriceBars
          items={[
            { label: "Jungle Scout Starter", price: 49, caption: "Product research, browser extension" },
            { label: "Jungle Scout Growth", price: 79, caption: "Adds listing & keyword tooling" },
            { label: "Jungle Scout Brand Owner + CI", price: 149, caption: "Competitive Intelligence, top tier only" },
            // Was "Apex Starter, whole suite" with the repricer in the caption. Starter has no repricer (Pro does).
            { label: "Apex Starter", price: planById("starter").monthly, caption: "Research, POs and P&L. Repricer is on Pro; shipments (Red) in beta.", apex: true },
          ]}
        />

        <SuiteShot caption="For sellers whose products already exist. Bought, priced, restocked, and banked in one place." />

        <HonestVerdict
          rivalName="Jungle Scout"
          chooseRival={[
            "You are hunting for a product to create, and niche validation and demand data are the whole game.",
            "You need manufacturer sourcing to have your own product made.",
            "You want a low-cost entry into Amazon research at $49/mo.",
          ]}
          chooseApex={[
            "Your products already exist. You buy Skittles and Tide at wholesale, and your questions are break-even, restock, and Buy Box.",
            "You need the tools after research: purchase orders, repricing (Pro, beta) with fee-derived floors, and P&L in one place. Shipment handling is in the Apex Red beta, by invitation.",
            "Seller-level competition data matters on every listing you run, not as a top-tier add-on.",
          ]}
        />

        {/* Removed "run five hundred that already exist": an implied capacity with no basis. */}
        <CompareCta line="Jungle Scout helps you invent a product. Apex helps you run the products that already exist." />

        <FactsFootnote
          rivalName="Jungle Scout"
          sources={[
            { label: "Jungle Scout pricing", href: "https://www.junglescout.com/pricing/catalyst-plans/" },
            { label: "Capterra", href: "https://www.capterra.com/p/249574/Jungle-Scout/pricing/" },
            { label: "Jungle Scout pricing breakdown", href: "https://www.demandsage.com/jungle-scout-pricing/" },
          ]}
        />
        <p className="text-center text-sm text-slate-500">
          Also see{" "}
          <Link href="/compare/helium10" className="text-blue-600 underline hover:text-blue-700">Apex vs Helium 10</Link>
          {" "}·{" "}
          <Link href="/compare/smartscout" className="text-blue-600 underline hover:text-blue-700">Apex vs SmartScout</Link>
          {" "}·{" "}
          <Link href="/compare/sellersnap" className="text-blue-600 underline hover:text-blue-700">Apex vs Seller Snap</Link>
        </p>
      </div>
    </div>
  );
}
