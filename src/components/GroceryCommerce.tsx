"use client";

import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CalendarClock,
  ClipboardList,
  Gauge,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  Timer,
  TrendingUp,
  Truck,
  Warehouse,
} from "lucide-react";

const CALENDLY_URL = "https://calendly.com/apexapplications-info/new-meeting";

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: "easeOut" }
} as const;

function DemoButton({ dark = false, big = false }: { dark?: boolean; big?: boolean }) {
  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-black uppercase tracking-wide transition-all hover:scale-[1.03] ${
        big ? "px-10 py-5 text-lg" : "px-8 py-4"
      } ${
        dark
          ? "bg-white text-slate-950 shadow-[0_20px_40px_rgba(255,255,255,0.15)]"
          : "bg-slate-950 text-white shadow-[0_20px_40px_rgba(2,6,23,0.35)]"
      }`}
    >
      Request a demo <ArrowRight size={18} />
    </a>
  );
}

/**
 * The brands our customers' pallets actually carry. Names only, set as plain
 * text chips: these identify the products enterprise grocery sellers move,
 * not partners of ours -- the fine print under the wall says so.
 */
const BRAND_WALL = [
  "Skittles", "Tide", "Gatorade", "Snickers", "Colgate", "Dove",
  "Cheerios", "Pampers", "M&M's", "Old Spice", "Kraft", "Red Bull",
  "Listerine", "Pringles", "Hershey's", "Gillette",
];

/** A single kraft carton face on the animated pallet. */
function Carton({ hue, delay }: { hue: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -14, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="relative h-10 sm:h-12 rounded-[4px] border overflow-hidden"
      style={{ background: hue, borderColor: "rgba(2,6,23,0.18)" }}
    >
      <span className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[3px] rounded bg-slate-950/15" />
    </motion.div>
  );
}

/**
 * Original concept art: a wrapped pallet mid-assembly. The top row lands
 * last, the strap draws across, and the label chip carries the detail the
 * page is actually selling -- lot, units, and the expiration date Apex
 * tracks per grocery listing.
 */
function PalletStack() {
  const rows = [
    { hues: ["#d6bfa3", "#cbb191", "#d6bfa3"], delay: 0.5 },
    { hues: ["#cbb191", "#d6bfa3", "#cbb191"], delay: 0.3 },
    { hues: ["#d6bfa3", "#cbb191", "#d6bfa3"], delay: 0.1 },
  ];
  return (
    <div className="relative w-full max-w-xs mx-auto select-none" aria-hidden>
      <div className="space-y-1.5">
        {rows.map((row, r) => (
          <div key={r} className="grid grid-cols-3 gap-1.5">
            {row.hues.map((hue, i) => (
              <Carton key={i} hue={hue} delay={row.delay + i * 0.08} />
            ))}
          </div>
        ))}
      </div>
      {/* strap */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="absolute left-1/2 top-0 bottom-6 w-[3px] -translate-x-1/2 origin-top bg-amber-500/70"
      />
      {/* pallet deck */}
      <div className="mt-1.5 space-y-1">
        <div className="h-2.5 rounded-sm bg-amber-800/80" />
        <div className="flex justify-between px-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2 w-6 rounded-sm bg-amber-900/80" />
          ))}
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="absolute -right-3 -top-3 rounded-lg bg-white shadow-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-black text-slate-700 leading-tight"
      >
        LOT 8842 · CONFECTIONERY
        <span className="block text-emerald-600">1,240 units · EXP 03/2027 ✓</span>
      </motion.div>
    </div>
  );
}

/** Original concept art: a forklift silhouette easing a pallet forward. */
function Forklift() {
  return (
    <motion.svg
      viewBox="0 0 220 120"
      className="w-full max-w-[240px] mx-auto"
      initial={{ x: -30, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      aria-hidden
    >
      {/* mast + fork */}
      <rect x="128" y="18" width="6" height="76" rx="2" fill="#0f172a" />
      <rect x="128" y="88" width="58" height="5" rx="2" fill="#0f172a" />
      {/* carried cartons */}
      <rect x="138" y="62" width="40" height="24" rx="2" fill="#d6bfa3" stroke="#0f172a" strokeOpacity="0.2" />
      <rect x="138" y="40" width="40" height="20" rx="2" fill="#cbb191" stroke="#0f172a" strokeOpacity="0.2" />
      {/* body */}
      <rect x="52" y="52" width="76" height="34" rx="8" fill="#f59e0b" />
      <rect x="60" y="30" width="40" height="30" rx="6" fill="#0f172a" />
      <rect x="66" y="36" width="28" height="18" rx="3" fill="#94a3b8" />
      {/* wheels */}
      <circle cx="72" cy="94" r="13" fill="#0f172a" />
      <circle cx="72" cy="94" r="6" fill="#64748b" />
      <circle cx="118" cy="96" r="10" fill="#0f172a" />
      <circle cx="118" cy="96" r="4.5" fill="#64748b" />
      {/* ground */}
      <rect x="8" y="106" width="204" height="3" rx="1.5" fill="#0f172a" opacity="0.15" />
    </motion.svg>
  );
}

/** The hero's conveyor: cartons roll left on a belt of rollers, endlessly. */
function Conveyor() {
  const boxes = [46, 34, 52, 38, 46, 34, 52, 40];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] py-6" aria-hidden>
      <style>{`
        @keyframes gc-belt { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .gc-belt { animation: none !important; } }
      `}</style>
      <div className="gc-belt flex w-[200%]" style={{ animation: "gc-belt 22s linear infinite" }}>
        {[0, 1].map((half) => (
          <div key={half} className="flex w-1/2 items-end justify-around px-4">
            {boxes.map((width, i) => (
              <div key={i} className="relative" style={{ width }}>
                <div
                  className="h-9 rounded-[3px] border border-white/10"
                  style={{ background: i % 2 ? "#b9a284" : "#c8b295" }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-around px-2">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="h-2 w-2 rounded-full bg-white/15" />
        ))}
      </div>
    </div>
  );
}

const PILLARS = [
  {
    icon: ClipboardList,
    title: "Restock & purchase order creation",
    body: "Apex reads your sell-through and builds the restock math into ready-to-send purchase orders -- cases, cost, supplier, and landed margin -- so replenishment runs on numbers, not gut feel.",
  },
  {
    icon: Banknote,
    title: "Cashflow & inventory turnover",
    body: "Grocery margins live and die on turns. Track cash tied up per SKU, days of cover, and true inventory turnover across every warehouse, with P&L pulled from your own store data.",
  },
  {
    icon: CalendarClock,
    title: "Expiration date tracking",
    body: "Every grocery listing carries its lot dates. Apex watches shelf life across your inventory and flags what must move before Amazon's expiration windows close -- before it becomes unsellable stock.",
  },
  {
    icon: Gauge,
    title: "Automatic repricer bidding",
    body: "Break-even floors computed from real FBA fees, then automated bidding keeps every listing competitive around the clock -- aggressive when you own the Buy Box math, disciplined when you don't.",
  },
];

const GATE_POINTS = [
  { icon: TrendingUp, text: "$1M+ in monthly sales -- our enterprise minimum" },
  { icon: Warehouse, text: "Grocery, beverage, or personal care at pallet volume" },
  { icon: Truck, text: "Amazon B2B today; expanding across ecommerce" },
];

export default function GroceryCommerce() {
  return (
    <main className="bg-white">
      {/* ============ HERO ============ */}
      <section className="bg-slate-950 text-white pt-28 pb-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "26px 26px" }}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div {...fadeIn} className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-amber-300 mb-6">
              <ShieldCheck size={14} /> Enterprise only · $1M+ monthly sales
            </span>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.04] mb-6">
              The #1 software for{" "}
              <span className="text-amber-400">B2B Amazon &amp; ecommerce grocery</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto mb-8">
              Restock and purchase orders, cashflow and inventory turns, expiration tracking on
              every grocery listing, and automatic repricer bidding &mdash; one roof, built for
              operations that move pallets, not parcels.
            </p>
            <div className="flex flex-col items-center gap-3">
              <DemoButton dark big />
              <span className="text-xs font-bold text-slate-500">
                30 minutes with our enterprise team. No self-serve signup at this tier.
              </span>
            </div>
          </motion.div>

          <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.15 }} className="mt-14">
            <Conveyor />
          </motion.div>
        </div>
      </section>

      {/* ============ BRAND WALL ============ */}
      <section className="bg-slate-950 text-white pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.p {...fadeIn} className="text-center text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-7">
            Trusted to move the brands America restocks daily
          </motion.p>
          <motion.div {...fadeIn} className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
            {BRAND_WALL.map((brand) => (
              <span
                key={brand}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-300"
              >
                {brand}
              </span>
            ))}
          </motion.div>
          <p className="text-center text-[11px] text-slate-600 mt-6">
            Product brands our customers distribute and resell. No endorsement or affiliation implied.
          </p>
        </div>
      </section>

      {/* ============ LOGISTICS BAND ============ */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 mb-4">
              Built where the work happens: the warehouse floor
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Assembly lines, palletizing, forklifts and trailers &mdash; Apex speaks the language
              of the floor and turns it into software your buyers and finance team share.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            <motion.div {...fadeIn} className="rounded-3xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
              <PalletStack />
              <p className="text-sm text-slate-500 mt-6 leading-relaxed">
                <span className="font-black text-slate-900">Palletized, dated, tracked.</span>{" "}
                Every case that gets wrapped carries lot and expiration data Apex follows to the
                listing.
              </p>
            </motion.div>

            <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.1 }} className="rounded-3xl overflow-hidden border border-slate-200 relative min-h-[280px]">
              <img
                src="/images/rewards-prep-center.png"
                alt="Apex prep center worker taping a carton on the warehouse line"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent p-5 pt-14">
                <p className="text-sm text-white font-bold leading-snug">
                  A national prep network on the line &mdash; insured, negotiated member rates,
                  restock-aware.
                </p>
              </div>
            </motion.div>

            <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.2 }} className="rounded-3xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
              <Forklift />
              <p className="text-sm text-slate-500 mt-6 leading-relaxed">
                <span className="font-black text-slate-900">From dock to listing.</span> Inbound
                pallets reconcile against purchase orders automatically &mdash; shortages surface
                the day the truck unloads, not at month end.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ PILLARS ============ */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 mb-4">
              Everything under one roof
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Four systems that usually live in four tools &mdash; connected, because in grocery
              a purchase order, a shelf date and a price are the same decision.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6">
            {PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                {...fadeIn}
                transition={{ ...fadeIn.transition, delay: i * 0.07 }}
                className="rounded-3xl border border-slate-200 bg-white p-8"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center mb-5">
                  <pillar.icon size={22} className="text-amber-400" strokeWidth={1.75} />
                </div>
                <h3 className="text-xl font-black tracking-tight text-slate-900 mb-2">{pillar.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{pillar.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ONE-ROOF FLOW ============ */}
      <section className="py-16 bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 {...fadeIn} className="text-center text-2xl lg:text-3xl font-black tracking-tight mb-12">
            One system, dock to deposit
          </motion.h2>
          <motion.div {...fadeIn} className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: ClipboardList, label: "Purchase order" },
              { icon: Truck, label: "Inbound pallets" },
              { icon: PackageCheck, label: "Live inventory" },
              { icon: Timer, label: "Expiry watch" },
              { icon: RefreshCcw, label: "Repricer bids" },
              { icon: Banknote, label: "Cashflow & turns" },
            ].map((step, i, all) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3.5">
                  <step.icon size={18} className="text-amber-400 shrink-0" />
                  <span className="text-sm font-bold whitespace-nowrap">{step.label}</span>
                </div>
                {i < all.length - 1 && <ArrowRight size={16} className="text-slate-600 shrink-0" />}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ ENTERPRISE GATE + CTA ============ */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeIn} className="rounded-[32px] border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-8 sm:p-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 text-amber-400 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] mb-6">
              <BadgeCheck size={14} /> Enterprise plan only
            </span>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 mb-4">
              Built for a smaller room
            </h2>
            <p className="text-slate-500 leading-relaxed max-w-xl mx-auto mb-8">
              GroceryCommerce is not self-serve and not for everyone &mdash; it is the enterprise
              tier of Apex, deployed with our team beside yours.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              {GATE_POINTS.map((point) => (
                <div key={point.text} className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                  <point.icon size={20} className="text-slate-400 mx-auto mb-2.5" />
                  <p className="text-sm font-semibold text-slate-700 leading-snug">{point.text}</p>
                </div>
              ))}
            </div>
            <DemoButton big />
            <p className="text-xs text-slate-400 mt-4">
              Demos are scheduled directly with the founding team.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
