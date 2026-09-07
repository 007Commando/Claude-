"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  TrendingUp,
  ExternalLink,
  BarChart,
  Globe,
  Database,
  FileText,
  CreditCard
} from "lucide-react";
import opexDashboard from "../assets/opex-dashboard.png.asset.json";
import poBuilder from "../assets/purchase-orders.png.asset.json";
import marketDatabase from "../assets/market-database.png.asset.json";
import coreFeaturesPanel from "../assets/apex-blue-core-features.png.asset.json";
import marketIntelligenceDatabase from "../assets/market-intelligence-database.png.asset.json";
import inventoryRestocking from "../assets/inventory-restocking.png.asset.json";
import vendorsDashboard from "../assets/vendors-dashboard.png.asset.json";
import profitLossDashboard from "../assets/profit-loss-dashboard.png.asset.json";
import apexBlueCtaBull from "../assets/apex-blue-cta-bull.png.asset.json";
import ViewAppButton from "./ViewAppButton";
import FeatureSection from "./FeatureSection";
import ScrollProgressLine from "./ScrollProgressLine";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function ApexBlue() {
  const [analyticsTab, setAnalyticsTab] = useState("Profit & Loss");
  const sectionsRef = useRef<HTMLDivElement>(null);
  return (
    <div className="pt-40 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="interiorHero max-w-4xl mx-auto mb-8"
        >
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-sm">
              <TrendingUp size={14} className="stroke-[3]" />
              Enterprise Logistics
            </div>
          </div>
          <h1 className="text-[clamp(3rem,8vw,5rem)] font-black text-slate-900 mb-10 tracking-tight text-center leading-[0.95]">
            Operational <br/>
            <span className="text-blue-600 italic">dominance.</span>
          </h1>
          <p className="text-2xl text-slate-500 leading-relaxed text-center font-medium opacity-80 mb-12">
            Apex Blue is the engine room of your enterprise. Built specifically for wholesale high-volume operations, automating the complex financial and logistical workflows.
          </p>
        </motion.div>

        <div className="text-center mb-24">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">the journey ↓</span>
        </div>

        <div ref={sectionsRef} className="relative space-y-32">
          <ScrollProgressLine containerRef={sectionsRef} colorClassName="bg-blue-600" />

          {/* 01 — Spotlight: Apex Blue Core Features */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-center">
              <div className="max-w-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                    <TrendingUp size={18} className="text-white" strokeWidth={1.75} />
                  </div>
                  <div className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">01 — Core Features</div>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Apex Blue — Core Features</h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Experience integration across your suppliers, build purchase orders, keep stock on your inventory and analyze profit and loss all in one system.
                </p>
                <div className="space-y-4 mb-8">
                   {[
                     "Experience integration across your suppliers",
                     "Build purchase orders",
                     "Keep stock on your inventory",
                     "Analyze profit and loss"
                   ].map((item, i) => (
                      <div key={i} className="flex gap-3 items-start">
                         <CheckCircle2 size={20} className="text-blue-600 shrink-0 mt-0.5" />
                         <span className="font-medium text-slate-700 text-sm leading-relaxed">{item}</span>
                      </div>
                   ))}
                </div>
                <ViewAppButton data-feature-cta className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">View Apex Blue <ExternalLink size={18} /></ViewAppButton>
              </div>
              <div className="relative flex justify-center">
                 <div className="absolute inset-0 rounded-[40px] bg-blue-500/30 blur-3xl animate-pulse" aria-hidden />
                 <div data-feature-image className="relative bg-white rounded-[40px] p-3 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.45)] ring-1 ring-blue-400/40 overflow-hidden max-w-[78%]">
                    <img
                      src={coreFeaturesPanel.url}
                      alt="Apex Blue core features overview"
                      className="w-full rounded-[32px]"
                    />
                 </div>
              </div>
            </div>
          </motion.div>

          {/* 02 — Analytics with Tabs (bespoke) */}
          <motion.div
            id="analytics"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 bg-white scroll-mt-28"
          >
            <div className="max-w-xl mx-auto text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                  <BarChart size={18} className="text-white" strokeWidth={1.75} />
                </div>
                <div className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">02 — Analytics</div>
              </div>
              <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter leading-tight">Elite <span className="italic text-slate-300">Analytics.</span></h2>

              <div className="inline-flex p-1 bg-slate-100 rounded-2xl">
                {["Profit & Loss", "Inventory & Restocking"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAnalyticsTab(tab)}
                    className={`flex-1 min-w-0 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      analyticsTab === tab
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-12">
              {analyticsTab === "Profit & Loss" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="grid lg:grid-cols-[1fr_2fr] gap-16 items-center"
                >
                  <div className="max-w-xl">
                    <div className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Profit & Loss</div>
                    <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Real-Time Margin Clarity</h3>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                      Connect your Amazon accounts once and never deal with fragmented spreadsheets again. Apex's analytics engine accounts for storage fees, PPC spend, and overhead automatically — so you always know your true margin.
                    </p>
                    <div className="space-y-4 mb-8">
                      {[
                        "Real-time Profit & Loss across every marketplace",
                        "Automatic deduction of fees, PPC spend and OpEx",
                        "SKU-level profitability and margin breakdown",
                        "Portfolio-wide trend tracking with daily updates"
                      ].map((item, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <CheckCircle2 size={20} className="text-blue-600 shrink-0 mt-0.5" />
                          <span className="font-medium text-slate-700 text-sm leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                    <ViewAppButton data-feature-cta className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">View Analytics <ExternalLink size={18} /></ViewAppButton>
                  </div>
                  <div className="relative">
                    <div data-feature-image className="bg-white rounded-[32px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden">
                      <img
                        src={profitLossDashboard.url}
                        alt="Apex Profit & Loss analytics dashboard"
                        className="w-full h-auto block scale-[1.05] hover:scale-[1.08] transition-transform duration-300"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {analyticsTab === "Inventory & Restocking" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="grid lg:grid-cols-[1fr_2fr] gap-16 items-center"
                >
                  <div className="max-w-xl">
                    <div className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Inventory & Restocking</div>
                    <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Never Miss a Restock</h3>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                      Never miss a restock or get stuck with dead inventory. Apex reads sales velocity, on-hand quantities, and storage costs to generate precise buy recommendations and restock alerts across every SKU.
                    </p>
                    <div className="space-y-4 mb-8">
                      {[
                        "Sales velocity-driven restock alerts by SKU",
                        "Overstock & dead inventory warnings before storage fees hit",
                        "Days-of-inventory and days-until-next-order forecasting",
                        "One-click export and PO creation from restock recommendations"
                      ].map((item, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <CheckCircle2 size={20} className="text-blue-600 shrink-0 mt-0.5" />
                          <span className="font-medium text-slate-700 text-sm leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                    <ViewAppButton data-feature-cta className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">View Inventory <ExternalLink size={18} /></ViewAppButton>
                  </div>
                  <div className="relative">
                    <div data-feature-image className="bg-white rounded-[32px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden">
                      <img
                        src={inventoryRestocking.url}
                        alt="Apex Inventory & Restocking dashboard"
                        className="w-full h-auto block scale-[1.05] hover:scale-[1.08] transition-transform duration-300"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

            </div>
          </motion.div>

          {/* 03 — Vendors */}
          <FeatureSection
            id="vendors"
            number="03"
            eyebrow="Vendors"
            icon={Globe}
            title="Supplier Network"
            description="Centralize your supplier network in one command center. Store contact info, negotiation history, and minimum order requirements while Apex tracks how each vendor performs against their lead time promises."
            bullets={[
              "Global supplier profiles across US, UK, and EU markets",
              "Auto-calculated vendor reliability and lead-time scores",
              "Negotiation history and minimum order requirements stored per vendor",
              "Performance alerts when vendors miss fulfillment targets"
            ]}
            accentText="text-blue-600"
            accentBg="bg-blue-600"
            image={{ url: vendorsDashboard.url, alt: "Apex Vendors supplier organization dashboard" }}
            imageSide="left"
            cta={<ViewAppButton data-feature-cta className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">View Vendors <ExternalLink size={18} /></ViewAppButton>}
          />

          {/* 04 — Databases */}
          <FeatureSection
            id="databases"
            number="04"
            eyebrow="Database"
            icon={Database}
            title="Market Intelligence"
            description="Apex's Database is real-time market intelligence for your listings — instantly see what's profitable across all your suppliers, with live Buy Box pricing, fees, ROI, and margins on thousands of ASINs so you can build faster, smarter POs."
            bullets={[
              "Real-time data — live Buy Box prices, 30/60/90-day sold averages",
              "Know what's profitable across every supplier at a glance",
              "Net proceeds, profit, ROI & margin calculated automatically",
              "Build faster POs and create listings straight from the data"
            ]}
            accentText="text-blue-600"
            accentBg="bg-blue-600"
            image={{ url: marketIntelligenceDatabase.url, alt: "Apex Market Intelligence Database dashboard" }}
            imageSide="right"
            cta={<ViewAppButton data-feature-cta className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">View Database <ExternalLink size={18} /></ViewAppButton>}
          />

          {/* 05 — Purchase Orders */}
          <FeatureSection
            id="purchase-orders"
            number="05"
            eyebrow="Purchase Orders"
            icon={FileText}
            title="Purchase Order Builder"
            description="Apex's Purchase Order Builder turns sourcing into a true profit engine — build POs, run projections, and see exact revenue, expenses, and profit before you ever spend a dollar with a supplier."
            bullets={[
              "Live profit projections — total revenue, expenses & profit at a glance",
              "Per-supplier breakdowns with Margin, ROI & GPPA built in",
              "Average sale price, units, COGs, Amazon fees & shipping all tracked",
              "Switch between Buy Box and other profit data settings instantly"
            ]}
            accentText="text-blue-600"
            accentBg="bg-blue-600"
            image={{ url: poBuilder.url, alt: "Apex Purchase Order Builder dashboard" }}
            imageSide="left"
            cta={<ViewAppButton data-feature-cta className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">View Purchase Orders <ExternalLink size={18} /></ViewAppButton>}
          />

          {/* 06 — Opex */}
          <FeatureSection
            id="opex"
            number="06"
            eyebrow="Opex"
            icon={CreditCard}
            title="Operating Expenses"
            description="Apex's Opex tracker gives you total clarity on what it actually costs to run your business — track every recurring subscription, software, and team expense in one place so your real profit is never a mystery."
            bullets={[
              "Expense-by-category breakdown with a clear visual donut chart",
              "Recurring monthly expenses tracked by day, service & amount",
              "Monthly totals so you can spot cost creep before it hurts",
              "See true net profit once operating expenses are factored in"
            ]}
            accentText="text-blue-600"
            accentBg="bg-blue-600"
            image={{ url: opexDashboard.url, alt: "Apex Opex Operating Expenses dashboard" }}
            imageSide="right"
            cta={<ViewAppButton data-feature-cta className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">View Opex <ExternalLink size={18} /></ViewAppButton>}
          />

        </div>

        {/* CTA Section */}
        <div className="mt-32 p-12 lg:p-16 bg-blue-600 rounded-[56px] text-white relative overflow-hidden text-center">
           <div className="absolute right-[-2rem] top-1/2 -translate-y-1/2 h-[90%] w-auto opacity-40 brightness-150 scale-x-[-1] pointer-events-none">
              <img
                src={apexBlueCtaBull.url}
                alt="Apex Blue bull logo"
                className="h-full w-auto object-contain"
              />
           </div>
           <div className="relative z-10 max-w-3xl mx-auto">
              <div className="text-blue-200 text-sm font-bold uppercase tracking-[0.2em] mb-4">You've seen the engine room.</div>
              <h2 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight leading-tight">Ready to Scale Your Amazon Reselling Business?</h2>
              <p className="text-lg lg:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Join the elite sellers who have moved from spreadsheets to systems.</p>
              <ViewAppButton className="bg-white text-blue-600 px-10 py-4 rounded-[20px] font-black hover:scale-105 transition-all text-lg shadow-2xl">
                Start 7-Day Free Trial
              </ViewAppButton>
           </div>
        </div>

      </div>
    </div>
  );
}
