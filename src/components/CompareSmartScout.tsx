"use client";

import { motion } from "motion/react";
import { CompareTable, CompareCta, HonestVerdict, FactsFootnote, fadeIn, WorkflowCoverage, PriceBars, SuiteShot } from "./CompareShared";
import HeroCta from "./HeroCta";
import { APEX_ENTRY, APEX_EXTENSION, APEX_GOLD, APEX_RED } from "../data/comparisons";
import { planById } from "../config/offer";

export default function CompareSmartScout() {
  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* initial={false}: the hero is the LCP element and must render visible on the server, not at opacity 0. */}
        <motion.header {...fadeIn} initial={false} className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-5">Honest comparison</p>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.05] mb-6">
            Apex Applications vs SmartScout
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            The short version: SmartScout is a research and analytics tool.
            Apex covers research <em>and then runs the business you find</em>: purchase orders,
            repricing (Pro, beta) and P&amp;L in the same platform, with shipment handling (Apex Red)
            in beta and by invitation. Which one you need depends on
            whether you want to study the market or operate in it.
          </p>
          <HeroCta cta="compare-smartscout-hero" />
        </motion.header>

        <WorkflowCoverage
          rivalName="SmartScout"
          rival={[
            { state: "full", note: "brand analytics" },
            { state: "none" },
            { state: "none" },
            { state: "none" },
            { state: "none" },
          ]}
        />

        <CompareTable
          rivalName="SmartScout"
          rows={[
            { label: "What it is", apex: "Wholesale sourcing, purchasing and profit; repricer on Pro (beta)", rival: "Research & market analytics" },
            { label: "Entry price", apex: APEX_ENTRY, rival: "$49/mo (Basic, $29 on annual)" },
            { label: "Free trial", apex: "7 days, every plan", rival: "No trial; 7-day money-back" },
            { label: "Brand & product research", apex: true, rival: true },
            { label: "Supplier price-list scanning", apex: true, rival: true },
            { label: "Keyword & traffic analytics", apex: false, rival: true },
            { label: "Automated repricer", apex: APEX_GOLD, rival: "Not verified" },
            { label: "Purchase orders & restock", apex: true, rival: "Not verified" },
            { label: "P&L / cashflow from your store", apex: true, rival: "Not verified" },
            { label: "Prep & logistics coordination", apex: APEX_RED, rival: "Not verified" },
            { label: "Review automation", apex: "Review Booster (Amazon's own review request)", rival: true },
            { label: "Chrome extension", apex: APEX_EXTENSION, rival: true },
          ]}
        />

        <PriceBars
          items={[
            { label: "SmartScout Basic", price: 49, caption: "Research only, 25 keyword searches/mo" },
            { label: "SmartScout Essentials", price: 119, caption: "Full brand & keyword data" },
            // Was "Apex Starter, whole suite" with the repricer in the caption. Starter has no repricer (Pro does).
            { label: "Apex Starter", price: planById("starter").monthly, caption: "Research, POs and P&L. Repricer is on Pro; shipments (Red) in beta.", apex: true },
            { label: "Apex Pro", price: planById("pro").monthly, caption: "Adds the repricer on every listing (beta)", apex: true },
            { label: "SmartScout Business", price: 299, caption: "Adds exports and automation" },
          ]}
        />

        {/* Was "What the $149 actually opens: the whole operating suite". $149 is Starter, which has no repricer. */}
        <SuiteShot caption="Beyond research: purchase orders, profit reporting and, on Pro, the repricer (beta)." />

        <HonestVerdict
          rivalName="SmartScout"
          chooseRival={[
            "You mainly want market maps, keyword and traffic analytics, and brand prospecting at the lowest entry price.",
            "You already run operations elsewhere and only need a research layer on top.",
            "You want a Chrome extension for on-page Amazon research.",
          ]}
          chooseApex={[
            "You want the products you find to flow into purchase orders, repricing (Pro, beta), and P&L without exporting spreadsheets between tools.",
            "A repricer (Pro, beta) with break-even floors matters to you, computed from your own landed costs rather than bounds you maintain by hand.",
            "You'd rather pay for one platform than stack a research tool, a repricer, and an accounting sheet separately.",
          ]}
        />

        <CompareCta line="Research a brand, cut the PO and, on Pro, let the repricer work from your margin floor, in one login." />

        <FactsFootnote
          rivalName="SmartScout"
          sources={[
            { label: "SmartScout pricing", href: "https://www.smartscout.com/pricing" },
            { label: "Capterra", href: "https://www.capterra.com/p/237572/SmartScout/" },
            { label: "SmartScout pricing review", href: "https://revenuegeeks.com/software/smartscout/pricing" },
          ]}
        />
      </div>
    </div>
  );
}
