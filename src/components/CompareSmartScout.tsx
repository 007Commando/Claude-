"use client";

import { motion } from "motion/react";
import { CompareTable, CompareCta, HonestVerdict, FactsFootnote, fadeIn } from "./CompareShared";

export default function CompareSmartScout() {
  return (
    <main className="pt-32 pb-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <motion.header {...fadeIn} className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-5">Honest comparison</p>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.05] mb-6">
            Apex Applications vs SmartScout
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            The short version: SmartScout is a research and analytics tool — and a good one.
            Apex covers research <em>and then runs the business you find</em>: purchase orders,
            repricing, P&amp;L, and logistics in the same platform. Which one you need depends on
            whether you want to study the market or operate in it.
          </p>
        </motion.header>

        <CompareTable
          rivalName="SmartScout"
          rows={[
            { label: "What it is", apex: "Full wholesale operating suite", rival: "Research & market analytics" },
            { label: "Entry price", apex: "$149.99/mo (Starter)", rival: "$49/mo (Basic, $29 on annual)" },
            { label: "Free trial", apex: "7 days, every plan", rival: "No trial; 7-day money-back" },
            { label: "Brand & product research", apex: true, rival: true },
            { label: "Keyword & traffic analytics", apex: false, rival: true },
            { label: "Automated repricer", apex: "Included, with break-even floors", rival: false },
            { label: "Purchase orders & restock", apex: true, rival: false },
            { label: "P&L / cashflow from your store", apex: true, rival: false },
            { label: "Prep & logistics coordination", apex: true, rival: false },
            { label: "Review automation", apex: "Free for life", rival: false },
            { label: "Chrome extension", apex: false, rival: true },
          ]}
        />

        <HonestVerdict
          rivalName="SmartScout"
          chooseRival={[
            "You mainly want market maps, keyword and traffic analytics, and brand prospecting at the lowest entry price.",
            "You already run operations elsewhere and only need a research layer on top.",
            "You want a Chrome extension for on-page Amazon research.",
          ]}
          chooseApex={[
            "You want the products you find to flow into purchase orders, repricing, and P&L without exporting spreadsheets between tools.",
            "A repricer with true break-even floors matters to you — SmartScout does not reprice at all.",
            "You'd rather pay for one platform than stack a research tool, a repricer, and an accounting sheet separately.",
          ]}
        />

        <CompareCta line="Research a brand, cut the PO, and let the repricer defend the margin — in one login. That's the part no research tool does." />

        <FactsFootnote
          rivalName="SmartScout"
          sources={[
            { label: "Capterra", href: "https://www.capterra.com/p/237572/SmartScout/" },
            { label: "SmartScout pricing review", href: "https://revenuegeeks.com/software/smartscout/pricing" },
          ]}
        />
      </div>
    </main>
  );
}
