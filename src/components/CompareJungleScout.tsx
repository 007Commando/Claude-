"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { CompareTable, CompareCta, HonestVerdict, FactsFootnote, fadeIn, WorkflowCoverage, PriceBars, SuiteShot } from "./CompareShared";

export default function CompareJungleScout() {
  return (
    <main className="pt-32 pb-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <motion.header {...fadeIn} className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-5">Honest comparison</p>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.05] mb-6">
            Apex Applications vs Jungle Scout
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            Jungle Scout practically invented private-label product research — finding a niche,
            validating demand, sourcing a supplier to make <em>your</em> product. Apex is for the
            seller whose product already exists on the shelf: <strong>third-party resellers</strong>{" "}
            buying real brands at wholesale and winning on execution — restock timing, break-even
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
            { label: "Entry price", apex: "$149.99/mo (Starter)", rival: "$49/mo Starter · $79 Growth · $149 Brand Owner + CI" },
            { label: "Free trial", apex: "7 days, every plan", rival: "None; 7-day money-back" },
            { label: "Niche & demand validation", apex: false, rival: "Best in class (Opportunity Finder)" },
            { label: "Manufacturer sourcing (make your product)", apex: false, rival: "Supplier Database" },
            { label: "Wholesale brand & seller intelligence", apex: "122M+ products, per-brand seller maps", rival: "Top tier only (Competitive Intelligence)" },
            { label: "Automated repricer", apex: "Included, break-even floors", rival: false },
            { label: "Purchase orders & restock math", apex: true, rival: false },
            { label: "Prep center & logistics coordination", apex: true, rival: false },
            { label: "P&L / cashflow from your store", apex: true, rival: "Sales analytics" },
            { label: "Browser extension", apex: false, rival: true },
          ]}
        />

        <PriceBars
          items={[
            { label: "Jungle Scout Starter", price: 49, caption: "Product research, browser extension" },
            { label: "Jungle Scout Growth", price: 79, caption: "Adds listing & keyword tooling" },
            { label: "Jungle Scout Brand Owner + CI", price: 149, caption: "Competitive Intelligence, top tier only" },
            { label: "Apex Starter — whole suite", price: 149.99, caption: "Research + POs + repricer + P&L + logistics", apex: true },
          ]}
        />

        <SuiteShot caption="For sellers whose products already exist — bought, priced, restocked, and banked in one place." />

        <HonestVerdict
          rivalName="Jungle Scout"
          chooseRival={[
            "You are hunting for a product to create — niche validation and demand data are the whole game, and nobody does it longer.",
            "You need manufacturer sourcing to have your own product made.",
            "You want the cheapest respected entry into Amazon research at $49/mo.",
          ]}
          chooseApex={[
            "Your products already exist — you buy Skittles and Tide at wholesale, and your questions are break-even, restock, and Buy Box.",
            "You need the tools after research: purchase orders, repricing with fee-derived floors, prep logistics, and P&L in one place.",
            "Seller-level competition data matters on every listing you run, not as a top-tier add-on.",
          ]}
        />

        <CompareCta line="Jungle Scout helps you invent a product. Apex helps you run five hundred that already exist." />

        <FactsFootnote
          rivalName="Jungle Scout"
          sources={[
            { label: "Capterra", href: "https://www.capterra.com/p/249574/Jungle-Scout/pricing/" },
            { label: "Jungle Scout pricing breakdown", href: "https://www.demandsage.com/jungle-scout-pricing/" },
          ]}
        />
        <p className="text-center text-sm text-slate-400">
          Also see{" "}
          <Link href="/compare/helium10" className="text-blue-600 underline hover:text-blue-700">Apex vs Helium 10</Link>
          {" "}·{" "}
          <Link href="/compare/smartscout" className="text-blue-600 underline hover:text-blue-700">Apex vs SmartScout</Link>
          {" "}·{" "}
          <Link href="/compare/sellersnap" className="text-blue-600 underline hover:text-blue-700">Apex vs Seller Snap</Link>
        </p>
      </div>
    </main>
  );
}
