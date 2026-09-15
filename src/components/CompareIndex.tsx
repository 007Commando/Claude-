"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fadeIn, CompareCta } from "./CompareShared";
import { COMPARISONS as WRITTEN } from "../data/comparisons";

type Card = {
  href: string;
  rival: string;
  category: string;
  frame: string;
  /** Which job the rival competes for, used to group the index. */
  module: string;
};

/**
 * The four hand-built comparisons.
 *
 * They predate the data file and keep their own components and their own
 * copy; there is nothing to gain from rewriting pages that work. They are
 * described here so the index can show all sixteen in one ordering.
 */
const HAND_BUILT: Card[] = [
  {
    href: "/compare/helium10",
    rival: "Helium 10",
    category: "Private-label suite",
    module: "/features/green",
    frame:
      "The giant of private label: keywords, listings, PPC. Apex plays the other game, third-party wholesale. The comparison is really a fork: which business are you in?",
  },
  {
    href: "/compare/junglescout",
    rival: "Jungle Scout",
    category: "Product research",
    module: "/features/green",
    frame:
      "The original niche-validation tool, for inventing your own product. Apex runs products that already exist. Bought at wholesale, repriced to break-even, restocked on math.",
  },
  {
    href: "/compare/smartscout",
    rival: "SmartScout",
    category: "Wholesale research",
    module: "/features/green",
    frame:
      "Closest to our lane: excellent brand and market analytics. The difference is what happens after research. Apex adds the purchase orders, repricer, and P&L.",
  },
  {
    href: "/compare/sellersnap",
    rival: "Seller Snap",
    category: "AI repricer",
    module: "/features/gold",
    frame:
      "A respected game-theory repricer, and only a repricer. Apex Gold reprices with break-even floors from live fees. Inside the suite the rest of your operation runs on.",
  },
];

const ALL: Card[] = [
  ...HAND_BUILT,
  ...WRITTEN.map((comparison) => ({
    href: `/compare/${comparison.slug}`,
    rival: comparison.rival,
    category: comparison.category,
    module: comparison.moduleHref,
    frame: comparison.frame,
  })),
];

/**
 * Grouped by the job the rival is hired for, not alphabetically.
 *
 * Sixteen cards in one undifferentiated grid is a list to scroll past. Someone
 * arriving here is shopping for one thing — a repricer, a scanner, a profit
 * dashboard — and the grouping lets them find the three pages that are about
 * their decision and ignore the rest.
 */
const SECTIONS: { module: string; title: string; blurb: string }[] = [
  {
    module: "/features/gold",
    title: "Repricers",
    blurb:
      "Tools whose main job is deciding your price. Apex Gold does this from break-even floors computed out of your own costs.",
  },
  {
    module: "/features/green",
    title: "Sourcing and research",
    blurb:
      "Tools for finding what to buy. Apex Green scans a supplier's whole price list against the marketplace.",
  },
  {
    module: "/features/blue",
    title: "Profit and analytics",
    blurb:
      "Tools that tell you what the business earned. Apex Blue reports from the same data that bought and priced the stock.",
  },
  {
    module: "/features/red",
    title: "Shipping and prep",
    blurb:
      "Tools for getting boxes to Amazon. The Apex module here, Apex Red, is in beta, every page in this group says so.",
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
            at the bottom. Where a rival is the right choice for your business, the page says so,
            because the sellers these comparisons are wrong for were never our customers, and the
            ones they are right for deserve a straight answer.
          </p>
          <p className="mt-4 text-sm text-slate-400">
            Where we have not verified a competitor&apos;s capability, the table says so rather
            than marking it absent. Prices were checked in September 2026 against each
            company&apos;s own pricing page.
          </p>
        </motion.header>

        {SECTIONS.map((section) => {
          const cards = ALL.filter((card) => card.module === section.module);
          if (cards.length === 0) return null;

          return (
            <section key={section.module} className="space-y-6">
              <motion.div {...fadeIn} className="max-w-2xl">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-2">
                  {section.title}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">{section.blurb}</p>
              </motion.div>

              <div className="grid sm:grid-cols-2 gap-6">
                {cards.map((item, i) => (
                  <motion.div
                    key={item.href}
                    {...fadeIn}
                    transition={{ ...fadeIn.transition, delay: Math.min(i, 5) * 0.07 }}
                  >
                    <Link
                      href={item.href}
                      className="group block h-full rounded-3xl border border-slate-200 bg-white p-8 transition-all hover:border-blue-300 hover:shadow-[0_20px_40px_-24px_rgba(21,112,239,0.35)]"
                    >
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                        {item.category}
                      </div>
                      <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-3">
                        Apex vs {item.rival}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed mb-5">{item.frame}</p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-black text-blue-600">
                        Read the comparison
                        <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          );
        })}

        <CompareCta line="Or skip the reading: connect your store and see your own numbers inside Apex in fifteen minutes." />
      </div>
    </main>
  );
}
