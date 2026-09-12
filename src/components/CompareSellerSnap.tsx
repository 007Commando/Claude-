"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { CompareTable, CompareCta, HonestVerdict, FactsFootnote, fadeIn, WorkflowCoverage, PriceBars, SuiteShot } from "./CompareShared";

export default function CompareSellerSnap() {
  return (
    <main className="pt-32 pb-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <motion.header {...fadeIn} className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-5">Honest comparison</p>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.05] mb-6">
            Apex Applications vs Seller Snap
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            Seller Snap is a dedicated AI repricer with a genuinely respected game-theory engine.{" "}
            <Link href="/features/gold" className="text-blue-600 underline hover:text-blue-700">Apex Gold</Link>{" "}
            is a repricer that lives inside a full wholesale suite — floors computed from your real
            fees, connected to the P&amp;L and purchase orders the prices feed. The honest question
            is whether you want the deepest standalone repricer, or repricing as part of one
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
            { label: "What it is", apex: "Full suite incl. repricer (Apex Gold)", rival: "Dedicated AI repricer" },
            { label: "Entry price", apex: "$149.99/mo — whole suite", rival: "$100/mo (1,000 SKUs, $15k/mo revenue cap, annual commitment); Standard $500/mo" },
            { label: "Free trial", apex: "7 days, every plan", rival: "Demo/trial by arrangement" },
            { label: "Game-theory AI repricing", apex: false, rival: true },
            { label: "Break-even floors from live FBA fees", apex: true, rival: "Min/max set by you" },
            { label: "Floors by ROI / margin / $ goal, in bulk", apex: true, rival: false },
            { label: "Walmart repricing", apex: false, rival: true },
            { label: "B2B quantity-discount repricing", apex: false, rival: true },
            { label: "Purchase orders & restock", apex: true, rival: false },
            { label: "P&L / cashflow from your store", apex: true, rival: false },
            { label: "Product & brand research", apex: true, rival: false },
            { label: "Revenue caps on plans", apex: "None", rival: "Tiered by trailing revenue" },
          ]}
        />

        <PriceBars
          items={[
            { label: "Seller Snap Starter", price: 100, caption: "1,000 SKUs, $15k/mo revenue cap, annual commitment" },
            { label: "Apex Starter — whole suite", price: 149.99, caption: "Repricer with break-even floors + everything else, no caps", apex: true },
            { label: "Seller Snap Accelerator", price: 250, caption: "Repricing only, higher caps" },
            { label: "Seller Snap Standard", price: 500, caption: "Repricing only" },
          ]}
        />

        <SuiteShot caption="The repricer is one tab of this — the POs it protects and the P&L it feeds are the tabs next to it." />

        <HonestVerdict
          rivalName="Seller Snap"
          chooseRival={[
            "Repricing is your single biggest lever and you want the most sophisticated standalone engine, including game-theory tactics against other AI repricers.",
            "You sell on Walmart as well as Amazon and want one repricer across both.",
            "You need B2B quantity-discount repricing today.",
          ]}
          chooseApex={[
            "You want repricing anchored to true break-evens computed from your real fees — not min/max fields you have to calculate yourself.",
            "The repricer should share a platform with your POs, restock math, and P&L, so a price floor and a reorder decision use the same numbers.",
            "You'd rather pay $149.99 for a whole suite than a comparable amount for repricing alone, with no revenue caps deciding your tier.",
          ]}
        />

        <CompareCta line="Repricing is one decision in a bigger loop: buy, price, restock, bank. Apex runs the loop." />

        <FactsFootnote
          rivalName="Seller Snap"
          sources={[
            { label: "Web Retailer review", href: "https://www.webretailer.com/reviews/seller-snap/" },
            { label: "Research.com review", href: "https://research.com/software/seller-snap-review" },
          ]}
        />
      </div>
    </main>
  );
}
