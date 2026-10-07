"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { CompareTable, CompareCta, HonestVerdict, FactsFootnote, fadeIn, WorkflowCoverage, PriceBars, SuiteShot } from "./CompareShared";
import { APEX_GOLD, APEX_PRO_ENTRY } from "../data/comparisons";
import { planById } from "../config/offer";


export default function CompareSellerSnap() {
  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* initial={false}: the hero is the LCP element and must render visible on the server, not at opacity 0. */}
        <motion.header {...fadeIn} initial={false} className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-5">Honest comparison</p>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.05] mb-6">
            Apex Applications vs Seller Snap
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            Seller Snap is a dedicated AI repricer built on a game-theory engine.{" "}
            <Link href="/features/gold" className="text-blue-600 underline hover:text-blue-700">Apex Gold</Link>{" "}
            is a repricer (beta, on Pro) that lives inside a wholesale platform. Floors computed from your
            real fees, connected to the P&amp;L and purchase orders the prices feed. The honest question
            is whether you want a dedicated standalone repricer, or repricing as part of one
            operating platform.
          </p>
        </motion.header>

        <WorkflowCoverage
          rivalName="Seller Snap"
          rival={[
            { state: "none" },
            { state: "none" },
            { state: "full", note: "game-theory AI" },
            { state: "none" },
            { state: "partial", note: "repricing analytics" },
          ]}
        />

        <CompareTable
          rivalName="Seller Snap"
          rows={[
            { label: "What it is", apex: "Wholesale platform; repricer on Pro (Apex Gold, beta)", rival: "Dedicated AI repricer" },
            { label: "Entry price", apex: APEX_PRO_ENTRY, rival: "$100/mo (1,000 SKUs, $15k/mo revenue cap, annual commitment); Standard $500/mo" },
            { label: "Free trial", apex: "7 days, card required", rival: "Demo or trial by arrangement, ask them directly" },
            { label: "Game-theory AI repricing", apex: false, rival: true },
            { label: "Break-even floors from live FBA fees", apex: APEX_GOLD, rival: "Not verified" },
            { label: "Automatic price calculation", apex: "Beta: prices change when you run your strategies", rival: true },
            { label: "Floors by ROI / margin / $ goal, in bulk", apex: APEX_GOLD, rival: "Not verified" },
            { label: "Walmart repricing", apex: false, rival: true },
            { label: "B2B quantity-discount repricing", apex: false, rival: true },
            { label: "Purchase orders & restock", apex: true, rival: "Not verified" },
            { label: "P&L / cashflow from your store", apex: true, rival: "Not verified" },
            { label: "Product & brand research", apex: true, rival: "Not verified" },
            { label: "Plan limits", apex: "Repricer on Pro (every listing), Beginner (1 listing) and Plus (5 listings); none on Starter", rival: "Tiered by trailing revenue" },
          ]}
        />

        <PriceBars
          items={[
            { label: "Seller Snap Starter", price: 100, caption: "1,000 SKUs, $15k/mo revenue cap, annual commitment" },
            // Was "Apex Starter, whole suite" at $149. A repricer comparison uses Pro, the plan that has the repricer on every listing.
            { label: "Apex Pro", price: planById("pro").monthly, caption: "Repricer on every listing (beta), plus the rest of Apex", apex: true },
            { label: "Seller Snap Accelerator", price: 250, caption: "Repricing only, higher caps" },
            { label: "Seller Snap Standard", price: 500, caption: "Repricing only" },
          ]}
        />

        <SuiteShot caption="The repricer is one tab of this. The POs it protects and the P&L it feeds are the tabs next to it." />

        <HonestVerdict
          rivalName="Seller Snap"
          chooseRival={[
            "Repricing is your single biggest lever and you want the most sophisticated standalone engine, including game-theory tactics against other AI repricers.",
            "You sell on Walmart as well as Amazon and want one repricer across both.",
            "You need B2B quantity-discount repricing today.",
          ]}
          chooseApex={[
            "You want repricing anchored to break-evens computed from your real fees, not min/max fields you have to calculate yourself.",
            "The repricer should share a platform with your POs, restock math, and P&L, so a price floor and a reorder decision use the same numbers.",
            "You'd rather pay for Pro than for repricing alone, with the repricer one part of it. Check both plans' limits against your own volume before choosing.",
          ]}
        />

        <CompareCta line="Repricing is one decision in a bigger loop: buy, price, restock, bank. Apex covers each step." />

        <FactsFootnote
          rivalName="Seller Snap"
          sources={[
            { label: "Web Retailer review", href: "https://www.webretailer.com/reviews/seller-snap/" },
            { label: "Research.com review", href: "https://research.com/software/seller-snap-review" },
          ]}
        />
      </div>
    </div>
  );
}
