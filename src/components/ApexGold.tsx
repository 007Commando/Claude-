"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Crosshair,
  ExternalLink,
  Gauge,
  ShieldCheck,
  Sliders,
  Zap,
} from "lucide-react";
import ViewAppButton from "./ViewAppButton";
import ScrollProgressLine from "./ScrollProgressLine";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
} as const;

const sectionReveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
} as const;

/** A mock repricer row: the concept art for a page with no screenshots yet. */
function RepriceRow({
  sku, floor, price, delta, up, winning, delay,
}: {
  sku: string; floor: string; price: string; delta: string; up: boolean; winning: boolean; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
    >
      <div className="min-w-0">
        <div className="text-[13px] font-black text-slate-900 tracking-tight truncate">{sku}</div>
        <div className="text-[11px] text-slate-400 font-semibold">floor {floor} · break-even locked</div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`inline-flex items-center gap-1 text-[13px] font-black tabular-nums ${up ? "text-emerald-600" : "text-amber-600"}`}>
          {up ? <ArrowUp size={13} strokeWidth={3} /> : <ArrowDown size={13} strokeWidth={3} />}
          {price}
        </span>
        <span className="text-[11px] font-bold text-slate-400 tabular-nums">{delta}</span>
        {winning && (
          <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black px-2 py-0.5 uppercase">
            Buy Box
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function ApexGold() {
  const sectionsRef = useRef<HTMLDivElement>(null);
  return (
    <div className="pt-40 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div initial="initial" animate="animate" variants={fadeIn} className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-sm">
              <Zap size={14} className="stroke-[3]" />
              Automated Repricing
            </div>
          </div>
          <h1 className="text-[clamp(3rem,8vw,5rem)] font-black text-slate-900 mb-10 tracking-tight text-center leading-[0.95]">
            PRICING <br />
            <span className="text-amber-500 italic">REFLEXES.</span>
          </h1>
          <p className="text-2xl text-slate-500 leading-relaxed text-center font-medium opacity-80 mb-12">
            Apex Gold reprices every listing around the clock — anchored to true break-evens
            computed from your real Amazon fees, never a guess.
          </p>
        </motion.div>

        <div className="text-center mb-24">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">the journey ↓</span>
        </div>

        <div ref={sectionsRef} className="relative space-y-32">
          <ScrollProgressLine containerRef={sectionsRef} colorClassName="bg-amber-500" />

          {/* 01 — Repricer core */}
          <motion.div {...sectionReveal} id="repricer">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="max-w-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                    <Zap size={18} className="text-white" strokeWidth={1.75} />
                  </div>
                  <div className="text-xs font-black text-amber-600 uppercase tracking-[0.2em]">01 — The Repricer</div>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                  Every listing, repriced while you sleep
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Turn the whole catalog on with one switch, or tune strategy per SKU. Gold watches
                  the Buy Box, the featured offer, and every competing seller — and answers in
                  minutes, not mornings.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    "Bulk on/off and bulk strategy assignment across the catalog",
                    "Buy Box, featured offer and lowest-offer tracking per listing",
                    "Seller count, Amazon-on-listing and rank context on every row",
                    "Dry-run mode: preview every price move before it goes live",
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <CheckCircle2 size={20} className="text-amber-500 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                <ViewAppButton data-feature-cta className="bg-amber-500 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-600 transition-all">
                  View Apex Gold <ExternalLink size={18} />
                </ViewAppButton>
              </div>
              <div className="relative">
                <div className="absolute inset-0 rounded-[32px] bg-amber-400/25 blur-3xl" aria-hidden />
                <div className="relative space-y-2.5 rounded-[28px] border border-amber-200/70 bg-amber-50/40 p-5">
                  <RepriceRow sku="B08KHQ · Facial Serum 1oz" floor="$7.29" price="$18.90" delta="+$0.35" up winning delay={0.1} />
                  <RepriceRow sku="B0CRSN · Tea Tree Oil 2oz" floor="$9.14" price="$21.40" delta="-$0.22" up={false} winning={false} delay={0.2} />
                  <RepriceRow sku="B006IF · Wave Serum 5.3oz" floor="$11.02" price="$26.15" delta="+$1.10" up winning delay={0.3} />
                  <RepriceRow sku="B018D3 · Hair Pack 8.4oz" floor="$8.61" price="$19.75" delta="+$0.18" up winning={false} delay={0.4} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 02 — Break-even floors & goals */}
          <motion.div {...sectionReveal} id="floor-goals">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative order-last lg:order-first">
                <div className="absolute inset-0 rounded-[32px] bg-amber-400/20 blur-3xl" aria-hidden />
                <div className="relative rounded-[28px] border border-slate-200 bg-white p-7">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Set floors by goal</div>
                  {[
                    { label: "Minimum 10% ROI", detail: "floor computed per SKU from cost + real FBA fees", active: true },
                    { label: "Minimum 15% margin", detail: "solved from referral rate and fulfillment fee", active: false },
                    { label: "Minimum $1.00 profit", detail: "a hard dollar floor under every unit sold", active: false },
                  ].map((goal) => (
                    <div key={goal.label} className={`flex items-start gap-3 rounded-xl px-4 py-3.5 mb-2 border ${goal.active ? "border-amber-300 bg-amber-50" : "border-slate-100 bg-slate-50/60"}`}>
                      <Crosshair size={18} className={goal.active ? "text-amber-600 mt-0.5" : "text-slate-300 mt-0.5"} />
                      <div>
                        <div className="text-sm font-black text-slate-900">{goal.label}</div>
                        <div className="text-xs text-slate-500 font-medium">{goal.detail}</div>
                      </div>
                    </div>
                  ))}
                  <p className="text-[11px] text-slate-400 font-semibold mt-4">
                    Applied to 10 SKUs in one action · floors refuse to compute without real fee data
                  </p>
                </div>
              </div>
              <div className="max-w-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                    <Gauge size={18} className="text-white" strokeWidth={1.75} />
                  </div>
                  <div className="text-xs font-black text-amber-600 uppercase tracking-[0.2em]">02 — Break-Even Floors</div>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                  Floors built from your real fees
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Most repricers ask you to type a minimum price and hope you did the math. Gold
                  computes the true break-even for every listing — referral fee, fulfillment fee,
                  your cost — then sets the floor from the goal you actually run your business on:
                  a minimum ROI, a minimum margin, or a minimum dollar profit. In bulk.
                </p>
                <div className="space-y-4">
                  {[
                    "True break-even per SKU from live Amazon fee data",
                    "Floors by goal: ROI %, margin %, or $ profit — bulk applied",
                    "Refuses to guess: no floor without real fee data behind it",
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <CheckCircle2 size={20} className="text-amber-500 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 03 — Strategy & safety */}
          <motion.div {...sectionReveal} id="strategies">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="max-w-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                    <Sliders size={18} className="text-white" strokeWidth={1.75} />
                  </div>
                  <div className="text-xs font-black text-amber-600 uppercase tracking-[0.2em]">03 — Strategies & Safety</div>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                  Aggressive where you win, disciplined where you don&apos;t
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Build strategies once, assign them in bulk, and let every listing play its own
                  game — chase the Buy Box on your winners, hold margin on the long tail, and never
                  cross a floor anywhere.
                </p>
                <div className="space-y-4">
                  {[
                    "Custom strategy builder with per-listing assignment",
                    "Floors enforced on every move — no strategy can undercut them",
                    "Full activity log: every reprice, when, and why",
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <CheckCircle2 size={20} className="text-amber-500 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 rounded-[32px] bg-amber-400/20 blur-3xl" aria-hidden />
                <div className="relative rounded-[28px] border border-slate-200 bg-white p-7">
                  <div className="flex items-center gap-2 mb-5">
                    <Activity size={16} className="text-amber-600" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Live activity</span>
                  </div>
                  {[
                    { t: "2m ago", line: "Raised B006IF to $26.15 — competitor left the Buy Box" },
                    { t: "9m ago", line: "Held B018D3 at floor $19.75 — undercut would break 10% ROI" },
                    { t: "14m ago", line: "Matched B0CRSN featured offer at $21.40" },
                    { t: "31m ago", line: "Dry-run: 214 moves previewed, 0 floors crossed" },
                  ].map((row) => (
                    <div key={row.t} className="flex gap-3 items-start border-t border-slate-100 py-3 first:border-t-0">
                      <span className="text-[11px] font-bold text-slate-400 tabular-nums w-14 shrink-0">{row.t}</span>
                      <span className="text-[13px] text-slate-700 font-medium leading-snug">{row.line}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 04 — Connected to the suite */}
          <motion.div {...sectionReveal} id="connected">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex justify-center mb-4">
                <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center">
                  <ShieldCheck size={18} className="text-white" strokeWidth={1.75} />
                </div>
              </div>
              <div className="text-xs font-black text-amber-600 uppercase tracking-[0.2em] mb-4">04 — Part of the Suite</div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                A repricer that knows your whole business
              </h2>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                Standalone repricers see a price. Gold sees the purchase order the unit came in on,
                the P&amp;L it lands in, and the restock decision it feeds — because it shares one
                platform with Apex Blue, Green, and Red. Included in every Apex plan, not sold as a
                separate subscription.
              </p>
              <ViewAppButton data-feature-cta className="bg-amber-500 text-white px-8 py-4 rounded-xl font-bold inline-flex items-center gap-2 hover:bg-amber-600 transition-all">
                Start with Apex Gold <ExternalLink size={18} />
              </ViewAppButton>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
