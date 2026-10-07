"use client";

import { useState, useRef } from "react";
import {
  CheckCircle2,
  ArrowRight,
  BarChart,
  Boxes,
  Globe,
  Database,
  FileText,
  CreditCard
} from "lucide-react";
import opexDashboard from "../assets/opex-dashboard.png.asset.json";
import poBuilder from "../assets/purchase-orders.png.asset.json";
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
import FeatureHero from "./FeatureHero";
import { trialCta, trialTerms } from "../config/offer";

export default function ApexBlue() {
  const [analyticsTab, setAnalyticsTab] = useState("Profit & Loss");
  const sectionsRef = useRef<HTMLDivElement>(null);
  return (
    <div className="pb-24 overflow-hidden">
      <FeatureHero
        module="blue"
        intro="Apex Blue keeps your suppliers, purchase orders, landed costs, profit and loss and restock planning in one place, built for Amazon wholesale sellers."
        primary={
          <ViewAppButton className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white transition hover:bg-blue-700">
            Start my 7-day trial <ArrowRight size={18} aria-hidden="true" />
          </ViewAppButton>
        }
        image={{ url: poBuilder.url, alt: "Building a purchase order in Apex Blue" }}
        note={trialTerms()}
      />

      {/* What it is, who it is for, what it needs and which plan: one shared block per module (config/product.ts MODULE_FACTS). */}
      <FeatureFacts module="blue" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div ref={sectionsRef} className="relative space-y-32">
          <ScrollProgressLine containerRef={sectionsRef} colorClassName="bg-blue-600" />

          {/* Spotlight: core features */}
          <div>
            <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-center">
              <div className="max-w-xl">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center shrink-0">
                    <Boxes size={16} className="text-blue-600" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <div className="text-sm font-semibold text-slate-600">Core features</div>
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-5 tracking-tight leading-tight [text-wrap:balance]">Purchasing and profit in one place</h2>
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
                <ViewAppButton data-feature-cta className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">Try Apex Blue <ArrowRight size={18} /></ViewAppButton>
              </div>
              <div className="relative flex justify-center">
                 <div data-feature-image className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] overflow-hidden max-w-[78%]">
                    <img
                      src={coreFeaturesPanel.url}
                      alt="Apex Blue core features overview"
                      className="w-full h-auto block"
                    />
                 </div>
              </div>
            </div>
          </div>

          {/* Analytics with tabs (bespoke) */}
          <div
            id="analytics"
            className="relative z-10 bg-white scroll-mt-28"
          >
            <div className="mb-12">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center shrink-0">
                  <BarChart size={16} className="text-blue-600" strokeWidth={2} aria-hidden="true" />
                </div>
                <div className="text-sm font-semibold text-slate-600">Analytics</div>
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-8 tracking-tight leading-tight [text-wrap:balance]">Profit, loss and restocking</h2>

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
                <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-center">
                  <div className="max-w-xl">
                    <div className="text-sm font-semibold text-slate-600 mb-3">Profit & Loss</div>
                    <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-5 tracking-tight leading-tight">Profit and loss from your own costs</h3>
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
                    <ViewAppButton data-feature-cta className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">Try Analytics <ArrowRight size={18} /></ViewAppButton>
                  </div>
                  <div className="relative">
                    <div data-feature-image className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] overflow-hidden">
                      <img
                        src={profitLossDashboard.url}
                        alt="Apex Profit & Loss analytics dashboard"
                        className="w-full h-auto block"
                      />
                    </div>
                  </div>
                </div>
              )}

              {analyticsTab === "Inventory & Restocking" && (
                <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-center">
                  <div className="max-w-xl">
                    <div className="text-sm font-semibold text-slate-600 mb-3">Inventory & Restocking</div>
                    <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-5 tracking-tight leading-tight">Restock suggestions</h3>
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
                    <ViewAppButton data-feature-cta className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">Try Inventory <ArrowRight size={18} /></ViewAppButton>
                  </div>
                  <div className="relative">
                    <div data-feature-image className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] overflow-hidden">
                      <img
                        src={inventoryRestocking.url}
                        alt="Apex Inventory & Restocking dashboard"
                        className="w-full h-auto block"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Vendors */}
          <FeatureSection
            id="vendors"
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
            image={{ url: vendorsDashboard.url, alt: "Apex Vendors supplier organization dashboard" }}
            imageSide="left"
            cta={<ViewAppButton data-feature-cta className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">Try Vendors <ArrowRight size={18} /></ViewAppButton>}
          />

          {/* Databases */}
          <FeatureSection
            id="databases"
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
            image={{ url: marketIntelligenceDatabase.url, alt: "Apex Market Intelligence Database dashboard" }}
            imageSide="right"
            cta={<ViewAppButton data-feature-cta className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">Try the Database <ArrowRight size={18} /></ViewAppButton>}
          />

          {/* Purchase Orders */}
          <FeatureSection
            id="purchase-orders"
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
            image={{ url: poBuilder.url, alt: "Apex Purchase Order Builder dashboard" }}
            imageSide="left"
            cta={<ViewAppButton data-feature-cta className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">Try Purchase Orders <ArrowRight size={18} /></ViewAppButton>}
          />

          {/* Opex */}
          <FeatureSection
            id="opex"
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
            image={{ url: opexDashboard.url, alt: "Apex Opex Operating Expenses dashboard" }}
            imageSide="right"
            cta={<ViewAppButton data-feature-cta className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">Try Opex <ArrowRight size={18} /></ViewAppButton>}
          />

        </div>

        {/* CTA Section */}
        <div className="mt-32 p-12 lg:p-16 bg-blue-600 rounded-3xl text-white relative overflow-hidden text-center">
           <div className="absolute right-[-2rem] top-1/2 -translate-y-1/2 h-[90%] w-auto opacity-40 brightness-150 scale-x-[-1] pointer-events-none">
              <img
                src={apexBlueCtaBull.url}
                alt="Apex Blue bull logo"
                className="h-full w-auto object-contain"
              />
           </div>
           <div className="relative z-10 max-w-3xl mx-auto">
              <div className="text-blue-200 text-sm font-semibold mb-3">Apex Blue</div>
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 tracking-tight leading-tight [text-wrap:balance]">Start with your next purchase order</h2>
              <p className="text-lg lg:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">{trialTerms()}</p>
              <ViewAppButton className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors text-lg">
                {trialCta}
              </ViewAppButton>
           </div>
        </div>

      </div>
    </div>
  );
}
