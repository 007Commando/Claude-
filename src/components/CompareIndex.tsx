"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fadeIn, CompareCta } from "./CompareShared";

/**
 * The hub for every comparison we publish. Each card leads with the rival's
 * own strength -- the whole family's credibility rests on none of these
 * reading like a pamphlet.
 */
const COMPARISONS = [
  {
    href: "/compare/helium10",
    rival: "Helium 10",
    category: "Private-label suite",
    frame:
      "The giant of private label: keywords, listings, PPC. Apex plays the other game — third-party wholesale. The comparison is really a fork: which business are you in?",
  },
  {
    href: "/compare/junglescout",
    rival: "Jungle Scout",
    category: "Product research",
    frame:
      "The original niche-validation tool, for inventing your own product. Apex runs products that already exist — bought at wholesale, repriced to break-even, restocked on math.",
  },
  {
    href: "/compare/smartscout",
    rival: "SmartScout",
    category: "Wholesale research",
    frame:
      "Closest to our lane: excellent brand and market analytics. The difference is what happens after research — Apex adds the purchase orders, repricer, and P&L.",
  },
  {
    href: "/compare/sellersnap",
    rival: "Seller Snap",
    category: "AI repricer",
    frame:
      "A respected game-theory repricer, and only a repricer. Apex Gold reprices with break-even floors from live fees — inside the suite the rest of your operation runs on.",
  },
];

export default function CompareIndex() {
  return (
    <main className="pt-32 pb-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <motion.header {...fadeIn} className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-5">Comparisons</p>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.05] mb-6">
            Apex vs the field, honestly
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            Every page here names what the other tool does best, with current pricing and sources
            at the bottom. Where a rival is the right choice for your business, the page says so —
            because the sellers these comparisons are wrong for were never our customers, and the
            ones they are right for deserve a straight answer.
          </p>
        </motion.header>

        <div className="grid sm:grid-cols-2 gap-6">
          {COMPARISONS.map((item, i) => (
            <motion.div key={item.href} {...fadeIn} transition={{ ...fadeIn.transition, delay: i * 0.07 }}>
              <Link
                href={item.href}
                className="group block h-full rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:border-blue-300 hover:shadow-[0_20px_40px_-24px_rgba(21,112,239,0.35)]"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                  {item.category}
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-3">
                  Apex vs {item.rival}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">{item.frame}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-black text-blue-600">
                  Read the comparison
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <CompareCta line="Or skip the reading: connect your store and see your own numbers inside Apex in fifteen minutes." />
      </div>
    </main>
  );
}
