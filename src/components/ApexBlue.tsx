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
import FeatureFacts from "./FeatureFacts";
import { moduleByKey } from "../config/product";
import { trialCta, trialTerms } from "../config/offer";

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
          initial={false}
          animate="animate"
          variants={fadeIn}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-sm">
              <TrendingUp size={14} className="stroke-[3]" />
              Purchasing and profit
            </div>
          </div>
          {/* Badge was "Enterprise Logistics": Blue is purchasing and analytics (logistics is Apex Red, beta), and "Enterprise" suggests a plan that is not sold. The H1 is the descriptive module label plus the brand. */}
          <h1 className="mb-6 text-center text-sm font-black uppercase tracking-[0.2em] text-blue-700">Apex Blue: {moduleByKey("blue").label}</h1>
          <p className="text-[clamp(3rem,8vw,5rem)] font-black text-slate-900 mb-10 tracking-tight text-center leading-[0.95]">
            OPERATIONAL <br/>
            <span className="text-blue-600 italic">DOMINANCE.</span>
          </p>
          <p className="text-2xl text-slate-500 leading-relaxed text-center font-medium opacity-80 mb-12">
            Apex Blue keeps your suppliers, purchase orders, landed costs, profit and loss and restock planning in one place, built for Amazon wholesale sellers.
          </p>
        </motion.div>
      </div>

      {/* What it is, who it is for, what it needs and which plan: one shared block per module (config/product.ts MODULE_FACTS). */}
      <FeatureFacts module="blue" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mt-16 mb-24">
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
                  <div className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">01 · Core Features</div>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Apex Blue: Core Features</h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Keep your suppliers, build purchase orders, track your inventory and read profit and loss in one system.
                </p>
                <div className="space-y-4 mb-8">
                   {[
                     "Keep your suppliers in one place",
                     "Build purchase orders",
                     "Track your inventory",
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
                <div className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">02 · Analytics</div>
              </div>
              <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter leading-tight"><span className="italic text-slate-300">Analytics.</span></h2>

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
                    <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Profit and loss from your own costs</h3>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                      Connect your Amazon account once and stop rebuilding the same spreadsheet. Apex pulls your sales and Amazon's fees automatically, and your own costs (landed cost, prep, shipping, advertising and overhead) go in as operating expenses, so the margin you read is the one you actually made.
                    </p>
                    <div className="space-y-4 mb-8">
                      {[
                        "Profit & Loss that follows your sales, synced from Amazon every few minutes",
                        "Amazon fees deducted automatically; advertising and overhead recorded as your own OpEx",
                        "SKU-level profitability and margin breakdown",
                        "Profit and loss by day, week or month"
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
                    <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Restock suggestions</h3>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                      {/* Was "precise buy recommendations" and "forecasting". Restock is assumption-based, not a demand forecast (matches /amazon-inventory-management-software). */}
                      Apex reads your on-hand stock and sales velocity against the cover and lead time you set, and shows days of stock left and a restock status for each product.
                    </p>
                    <div className="space-y-4 mb-8">
                      {[
                        "Restock suggestions by SKU from stock, sales velocity and the cover you set",
                        "Days of stock left for each product",
                        "Purchase orders started from what needs restocking"
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
            title="Suppliers"
            description="Keep your suppliers in one place: contacts, terms and lead times for each vendor, so purchase orders start from the right details."
            bullets={[
              "Supplier profiles with contacts, terms and lead times",
              "Stated lead time shown against actual lead time",
              "Supplier details feed your purchase orders"
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
            title="Products database"
            description="Apex's Database is the market intelligence behind your buying: what is profitable across every supplier you hold, with Buy Box pricing, fees, ROI and margins for the products in your database."
            bullets={[
              "Buy Box price for every product, plus 30, 60 and 90 day averages on Plus and Pro",
              "Know what's profitable across every supplier at a glance",
              "Net proceeds, profit, ROI & margin calculated automatically",
              "Build purchase orders straight from the data"
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
            description="Apex's Purchase Order Builder lets you build a PO, run projections, and see projected revenue, expenses and profit from your own costs and prices before you order from a supplier."
            bullets={[
              "Projected revenue, expenses and profit at a glance",
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
            description="Apex's Opex tracker gives you total clarity on what it actually costs to run your business. Track every recurring subscription, software, and team expense in one place so your real profit is never a mystery."
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
              <div className="text-blue-200 text-sm font-bold uppercase tracking-[0.2em] mb-4">Apex Blue</div>
              <h2 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight leading-tight">Start with your next purchase order</h2>
              <p className="text-lg lg:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">{trialTerms()}</p>
              <ViewAppButton className="bg-white text-blue-600 px-10 py-4 rounded-[20px] font-black hover:scale-105 transition-all text-lg shadow-2xl">
                {trialCta}
              </ViewAppButton>
           </div>
        </div>

      </div>
    </div>
  );
}
