"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Crosshair,
  ArrowRight,
  Gauge,
  ShieldCheck,
  Sliders,
  Zap,
} from "lucide-react";
import ViewAppButton from "./ViewAppButton";
import ScrollProgressLine from "./ScrollProgressLine";
import FeatureFacts from "./FeatureFacts";
import FeatureHero from "./FeatureHero";
import { REPRICER_FACTS } from "../config/product";
import { trialTerms } from "../config/offer";

/** A mock repricer row: the concept art for a page with no screenshots yet. Every panel that uses it carries an "Example, not real data" label. */
function RepriceRow({
  sku, floor, price, delta, up, winning,
}: {
  sku: string; floor: string; price: string; delta: string; up: boolean; winning: boolean;
}) {
  return (
    <div
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
          <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5">
            Buy Box
          </span>
        )}
      </div>
    </div>
  );
}

export default function ApexGold() {
  const sectionsRef = useRef<HTMLDivElement>(null);
  return (
    <div className="pb-24 overflow-hidden">
      <FeatureHero
        module="gold"
        intro="Apex Gold works out what each listing should sell for, using break-evens worked out from your real Amazon fees, and lets you preview every price move before it reaches your storefront."
        primary={
          <ViewAppButton plan="pro" className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 font-bold text-white transition hover:bg-amber-600">
            Start a 7-day Pro trial <ArrowRight size={18} aria-hidden="true" />
          </ViewAppButton>
        }
        note={trialTerms("pro")}
      />

      {/* What it is, who it is for, what it needs and which plan: one shared block per module (config/product.ts MODULE_FACTS). */}
      <FeatureFacts module="gold" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">

        {/*
          The same thing the application says to a first-time Gold user, said
          before they pay rather than after. The in-app notice reads "this
          feature is in beta — check your prices in Seller Central until you're
          confident in the results", and a marketing page that promised a
          finished autopilot was contradicting our own product.
        */}
        <div className="max-w-3xl mx-auto mb-24 rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
          <p className="text-sm font-black text-amber-900 mb-1.5">Apex Gold is in beta</p>
          <p className="text-sm leading-relaxed text-amber-900/80">
            Set a floor on every listing before switching repricing on, keep an eye on your
            listings while you get started, and check your prices in Seller Central until you are
            confident in the results. Pricing is one of several factors in Amazon&apos;s offer
            selection. No repricer can promise you the Buy Box, and this one does not.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-amber-900/80">{REPRICER_FACTS.howPricesMove}</p>
        </div>

        <div ref={sectionsRef} className="relative space-y-32">
          <ScrollProgressLine containerRef={sectionsRef} colorClassName="bg-amber-500" />

          {/* Repricer core */}
          <div id="repricer">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="max-w-xl">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center shrink-0">
                    <Zap size={16} className="text-amber-600" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <div className="text-sm font-semibold text-slate-600">The repricer</div>
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-5 tracking-tight leading-tight [text-wrap:balance]">
                  A floor under every listing, before anything moves
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Assign a strategy across the whole catalog or tune it per SKU. Gold reads the Buy Box,
                  the featured offer and every competing seller, then works the price your rules
                  and your costs imply, and shows you the result before you act on it.
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
                <ViewAppButton plan="pro" data-feature-cta className="bg-amber-500 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-600 transition-all">
                  Try Apex Gold <ArrowRight size={18} />
                </ViewAppButton>
              </div>
              <div className="relative">
                <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-600">Example, not real data</p>
                  <RepriceRow sku="B08KHQ · Facial Serum 1oz" floor="$7.29" price="$18.90" delta="+$0.35" up winning />
                  <RepriceRow sku="B0CRSN · Tea Tree Oil 2oz" floor="$9.14" price="$21.40" delta="-$0.22" up={false} winning={false} />
                  <RepriceRow sku="B006IF · Wave Serum 5.3oz" floor="$11.02" price="$26.15" delta="+$1.10" up winning />
                  <RepriceRow sku="B018D3 · Hair Pack 8.4oz" floor="$8.61" price="$19.75" delta="+$0.18" up winning={false} />
                </div>
              </div>
            </div>
          </div>

          {/* Break-even floors & goals */}
          <div id="floor-goals">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-last lg:order-first">
                <div className="rounded-2xl border border-slate-200 bg-white p-7">
                  <div className="text-sm font-semibold text-slate-900 mb-1">Set floors by goal</div>
                  <p className="mb-5 text-sm font-semibold text-slate-600">Example, not real data</p>
                  {[
                    { label: "Minimum 10% ROI", detail: "floor computed per SKU from cost + real FBA fees", active: true },
                    { label: "Minimum 15% margin", detail: "solved from referral rate and fulfillment fee", active: false },
                    { label: "Minimum $1.00 profit", detail: "a hard dollar floor under every unit sold", active: false },
                  ].map((goal) => (
                    <div key={goal.label} className={`flex items-start gap-3 rounded-xl px-4 py-3.5 mb-2 border ${goal.active ? "border-slate-300 bg-slate-100" : "border-slate-100 bg-slate-50/60"}`}>
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
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center shrink-0">
                    <Gauge size={16} className="text-amber-600" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <div className="text-sm font-semibold text-slate-600">Break-even floors</div>
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-5 tracking-tight leading-tight [text-wrap:balance]">
                  Floors built from your real fees
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Most repricers ask you to type a minimum price and hope you did the math. Gold
                  computes the true break-even for every listing: referral fee, fulfillment fee,
                  your cost, then sets the floor from the goal you actually run your business on:
                  a minimum ROI, a minimum margin, or a minimum dollar profit. In bulk.
                </p>
                <div className="space-y-4">
                  {[
                    "True break-even per SKU from Amazon fee data",
                    "Floors by goal: ROI %, margin %, or $ profit; bulk applied",
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
          </div>

          {/* Strategy & safety */}
          <div id="strategies">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="max-w-xl">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center shrink-0">
                    <Sliders size={16} className="text-amber-600" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <div className="text-sm font-semibold text-slate-600">Strategies and safety</div>
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-5 tracking-tight leading-tight [text-wrap:balance]">
                  Aggressive where you win, disciplined where you don&apos;t
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Build strategies once, assign them in bulk, and let every listing play its own
                  game. Chase the Buy Box on your winners, hold margin on the long tail, and never
                  cross a floor anywhere.
                </p>
                <div className="space-y-4">
                  {[
                    "Custom strategy builder with per-listing assignment",
                    "Floors enforced on every move; no strategy can undercut them",
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
                <div className="rounded-2xl border border-slate-200 bg-white p-7">
                  <div className="flex items-center gap-2 mb-5">
                    <Activity size={16} className="text-amber-600" />
                    <span className="text-sm font-semibold text-slate-900">Activity log</span>
                    {/* Invented rows (concept art, not output): labelled so they cannot be read as real Buy Box results. */}
                    <span className="ml-auto text-sm font-semibold text-slate-600">Example, not real data</span>
                  </div>
                  {[
                    { t: "2m ago", line: "Raised B006IF to $26.15; competitor left the Buy Box" },
                    { t: "9m ago", line: "Held B018D3 at floor $19.75; undercut would break 10% ROI" },
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
          </div>

          {/* Connected to the suite */}
          <div id="connected">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} className="text-amber-600" strokeWidth={2} aria-hidden="true" />
                </div>
                <div className="text-sm font-semibold text-slate-600">Part of the suite</div>
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-5 tracking-tight leading-tight [text-wrap:balance]">
                A repricer that knows your whole business
              </h2>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                Standalone repricers see a price. Gold sees the purchase order the unit came in on,
                the P&amp;L it lands in, and the restock decision it feeds, because it shares one
                platform with Apex Blue, Green, and Red. {REPRICER_FACTS.plans} It is not sold as a
                separate subscription, and it is in beta.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <ViewAppButton plan="pro" data-feature-cta className="bg-amber-500 text-white px-8 py-4 rounded-xl font-bold inline-flex items-center gap-2 hover:bg-amber-600 transition-all">
                  Start a 7-day Pro trial <ArrowRight size={18} />
                </ViewAppButton>
                <Link href="/pricing" className="rounded-xl border border-amber-300 px-8 py-4 font-bold text-amber-800 hover:bg-amber-50 transition-all">
                  See the Pro plan
                </Link>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                {/* The trial button starts Pro, the plan the repricer is on (ViewAppButton plan="pro"). */}
                {trialTerms("pro")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
