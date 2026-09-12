"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { CompareTable, CompareCta, HonestVerdict, FactsFootnote, fadeIn, WorkflowCoverage, PriceBars, SuiteShot } from "./CompareShared";

export default function CompareHelium10() {
  return (
    <main className="pt-32 pb-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <motion.header {...fadeIn} className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-5">Honest comparison</p>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.05] mb-6">
            Apex Applications vs Helium 10
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            Helium 10 is the giant of <strong>private label</strong> — launching your own product
            and winning search: keyword research, listing optimization, PPC. Apex is built for the
            other Amazon business: <strong>third-party resellers</strong> moving other brands at
            wholesale, where the game is purchase orders, Buy Box dynamics against other sellers,
            break-even repricing and inventory turns. Most sellers do not need both — they need to
            know which business they are in.
          </p>
        </motion.header>

        <WorkflowCoverage
          rivalName="Helium 10"
          rival={[
            { state: "partial", note: "private-label" },
            { state: "none" },
            { state: "partial", note: "rule-based" },
            { state: "none" },
            { state: "partial", note: "profits dash" },
          ]}
        />

        <CompareTable
          rivalName="Helium 10"
          rows={[
            { label: "Built for", apex: "Wholesale & third-party reselling", rival: "Private label & brand launch" },
            { label: "Entry price", apex: "$149.99/mo (Starter)", rival: "$129/mo Platinum · $359/mo Diamond ($99/$279 annual)" },
            { label: "Free trial", apex: "7 days, every plan", rival: "Limited free plan" },
            { label: "Keyword research & listing optimization", apex: false, rival: "Best in class (Cerebro, 30+ tools)" },
            { label: "PPC / AI advertising tools", apex: false, rival: true },
            { label: "Wholesale brand & seller research", apex: "122M+ product catalog, brand intel", rival: "Private-label product discovery" },
            { label: "Repricer with break-even floors from live fees", apex: true, rival: "Rule-based repricing, floors set manually" },
            { label: "Purchase orders & restock math", apex: true, rival: false },
            { label: "Prep center & logistics coordination", apex: true, rival: false },
            { label: "P&L / cashflow from your store", apex: true, rival: "Profits dashboard" },
            { label: "Chrome extension", apex: false, rival: true },
          ]}
        />

        <PriceBars
          items={[
            { label: "Helium 10 Platinum", price: 129, caption: "Keywords, listings, launch tooling" },
            { label: "Apex Starter — whole suite", price: 149.99, caption: "Wholesale research + POs + repricer + P&L", apex: true },
            { label: "Helium 10 Diamond", price: 359, caption: "Higher limits, AI ad tools" },
          ]}
        />

        <SuiteShot caption="Built around a wholesale reseller's week — not a launch calendar." />

        <HonestVerdict
          rivalName="Helium 10"
          chooseRival={[
            "You are launching your own product and living in keywords, listings, and PPC — that is exactly what its 30+ tools are for.",
            "You want the deepest search-ranking dataset on Amazon (Cerebro is the reference tool for a reason).",
            "TikTok Shop and ad automation matter to your brand playbook.",
          ]}
          chooseApex={[
            "You resell other brands at wholesale — your questions are which brand, what break-even, which supplier, and when to reorder, none of which are keyword problems.",
            "You compete for the Buy Box against other sellers on shared listings, and need repricing anchored to true fees, not manual floors.",
            "You want the purchase order, the repricer, and the P&L in one platform instead of a launch suite plus spreadsheets.",
          ]}
        />

        <CompareCta line="If your business is other people's brands at wholesale, you're Helium 10's edge case — and our entire roadmap." />

        <FactsFootnote
          rivalName="Helium 10"
          sources={[
            { label: "Helium 10 pricing breakdown", href: "https://www.demandsage.com/helium-10-pricing/" },
            { label: "RevenueGeeks", href: "https://revenuegeeks.com/helium-10-pricing/" },
          ]}
        />
        <p className="text-center text-sm text-slate-400">
          Comparing repricers specifically?{" "}
          <Link href="/compare/sellersnap" className="text-blue-600 underline hover:text-blue-700">Apex vs Seller Snap</Link>
          {" "}· Research tools?{" "}
          <Link href="/compare/smartscout" className="text-blue-600 underline hover:text-blue-700">Apex vs SmartScout</Link>
        </p>
      </div>
    </main>
  );
}
