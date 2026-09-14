"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  DollarSign,
  ShoppingBag,
  Store,
  LayoutDashboard,
  Star,
  Layers,
  Barcode,
  BarChart3,
  Globe,
  Database,
  FileText,
  Wallet,
  UserCheck,
  Mail,
  Rocket,
  Hourglass,
  FileDown,
  Tag,
} from "lucide-react";
import apexBrandCollage from "../assets/apex-brand-collage.png.asset.json";
import { ANNUAL_DISCOUNT, PRICE_LIMITED_M, PRICE_UNLIMITED_M } from "../data/planPricing";
import {
  ANNUAL_DISCOUNT_PERCENT,
  countLabel,
  formatPrice,
  limitLabel,
  PAID_TRIALS,
  PLAN_LIMITS,
  planById,
  salesCeilingLabel,
  TRIAL_DAYS,
} from "../config/offer";

type Row = {
  label: string;
  icon?: React.ReactNode;
  limited: React.ReactNode;
  unlimited: React.ReactNode;
};

type Section = {
  title: string;
  rows: Row[];
};

const yes = <Check className="w-5 h-5 text-emerald-500 mx-auto stroke-[3]" />;
const no = <X className="w-5 h-5 text-slate-300 mx-auto stroke-[3]" />;

const sections: Section[] = [
  {
    title: "Overview",
    rows: [
      /**
       * These read from PLAN_LIMITS, which transcribes what billing enforces.
       * Every row here used to show the next tier up: Starter advertised $50K
       * of monthly sales against an enforced $10K, and crossing the real figure
       * moves the account onto Plus rather than warning about it.
       */
      { label: "Monthly Sales", icon: <DollarSign className="w-4 h-4" />, limited: salesCeilingLabel("starter"), unlimited: salesCeilingLabel("pro") },
      { label: "Marketplaces", icon: <ShoppingBag className="w-4 h-4" />, limited: "2", unlimited: "3" },
      { label: "Listings", icon: <Store className="w-4 h-4" />, limited: "Unlimited", unlimited: "Unlimited" },
    ],
  },
  {
    title: "Apex Black",
    rows: [
      { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "Review Booster", icon: <Star className="w-4 h-4" />, limited: `${PLAN_LIMITS.starter.reviewRequestsPerMonth}/month`, unlimited: limitLabel(PLAN_LIMITS.pro.reviewRequestsPerMonth) },
    ],
  },
  {
    title: "Apex Green",
    rows: [
      { label: "Master Catalog", icon: <Layers className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "UPC Scanner", icon: <Barcode className="w-4 h-4" />, limited: `${PLAN_LIMITS.starter.upcScansPerMonth} scans/month`, unlimited: limitLabel(PLAN_LIMITS.pro.upcScansPerMonth) },
      { label: "SKUs Scanned", icon: <Barcode className="w-4 h-4" />, limited: `${limitLabel(PLAN_LIMITS.starter.upcSkusPerMonth)}/month`, unlimited: limitLabel(PLAN_LIMITS.pro.upcSkusPerMonth) },
      { label: "Monthly UPC Scanned", limited: "Unlimited", unlimited: "Unlimited" },
    ],
  },
  {
    title: "Apex Blue",
    rows: [
      { label: "Analytics", icon: <BarChart3 className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "Restock Management", limited: yes, unlimited: yes },
      { label: "Vendors", icon: <Globe className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "Database", icon: <Database className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "ASINs in Your Database", limited: countLabel(PLAN_LIMITS.starter.housedAsins, "ASINs"), unlimited: countLabel(PLAN_LIMITS.pro.housedAsins, "ASINs") },
      { label: "Prep Centre Connections", limited: String(PLAN_LIMITS.starter.prepCenterConnections), unlimited: String(PLAN_LIMITS.pro.prepCenterConnections) },
      { label: "Purchase Orders", icon: <FileText className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "Purchase Order Discrepancy", limited: PLAN_LIMITS.starter.purchaseOrderDiscrepancy ? yes : no, unlimited: PLAN_LIMITS.pro.purchaseOrderDiscrepancy ? yes : no },
      { label: "Opex", icon: <Wallet className="w-4 h-4" />, limited: yes, unlimited: yes },
    ],
  },
  /**
   * Gold was missing from this matrix entirely while the comparison pages
   * claimed the repricer was included — a buyer could read both and not know
   * which to believe. It is included: every Gold route is gated by a
   * subscription check with no plan restriction, so any active plan reaches it.
   */
  {
    title: "Apex Gold",
    rows: [
      { label: "Repricer", icon: <Tag className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "Break-Even Floors", limited: yes, unlimited: yes },
      { label: "Repricing Strategies", limited: yes, unlimited: yes },
      { label: "Dry-Run Previews & Activity Log", limited: yes, unlimited: yes },
    ],
  },
  /**
   * Red is beta and says so here. It was absent from the matrix while some
   * comparison pages counted fulfilment as a live feature, which is the
   * contradiction the audit picked up.
   */
  {
    title: "Apex Red (beta)",
    rows: [
      { label: "Shipments & Warehouses", limited: "Beta access", unlimited: "Beta access" },
      { label: "Prep Centre Workflows", limited: "Beta access", unlimited: "Beta access" },
    ],
  },
  {
    title: "Essentials",
    rows: [
      { label: "Authorized Users Included", icon: <UserCheck className="w-4 h-4" />, limited: String(PLAN_LIMITS.starter.authorizedUsers), unlimited: String(PLAN_LIMITS.pro.authorizedUsers) },
      { label: "Additional Seat $8.99 / Month", limited: yes, unlimited: yes },
      { label: "Email Support", icon: <Mail className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "Priority Onboarding", icon: <Rocket className="w-4 h-4" />, limited: no, unlimited: yes },
      { label: "30/60/90 Day Buy Box History", icon: <Hourglass className="w-4 h-4" />, limited: PLAN_LIMITS.starter.historicalBuyBoxAverages ? yes : no, unlimited: PLAN_LIMITS.pro.historicalBuyBoxAverages ? yes : no },
      { label: "Export Data", icon: <FileDown className="w-4 h-4" />, limited: PLAN_LIMITS.starter.exports ? yes : no, unlimited: PLAN_LIMITS.pro.exports ? yes : no },
    ],
  },
];


/**
 * These answers are serialized into the FAQPage structured data below, so a
 * stale price here is not just wrong on the page — it is wrong in what Google
 * reads. Built from the shared offer config for that reason.
 */
const faqs = [
  {
    question: "How much does Apex Applications cost?",
    answer: `The Starter Plan is ${formatPrice(planById("starter").monthly)}/month and the Pro Plan is ${formatPrice(planById("pro").monthly)}/month. Paying annually saves ${ANNUAL_DISCOUNT_PERCENT}% on either plan.`,
  },
  {
    question: "How does the trial work?",
    /**
     * Starter no longer has free days — it opens at $1 for 5 — so "every plan
     * includes a free trial" stopped being true the moment the prices changed.
     * Both shapes are stated rather than the friendlier one generalised.
     */
    answer: PAID_TRIALS.starter
      ? `Starter starts at ${formatPrice(PAID_TRIALS.starter.price)} for your first ${PAID_TRIALS.starter.days} days, then ${formatPrice(planById("starter").monthly)} a month. Pro includes a ${TRIAL_DAYS}-day free trial. Either way we take a card when you start so billing can continue automatically, every trial comes with 3 free authorized US wholesale suppliers, and you can cancel before the first monthly charge.`
      : `Yes. Every plan, Starter and Pro, includes a ${TRIAL_DAYS}-day free trial, and every trial comes with 3 free authorized US wholesale suppliers to get you sourcing from day one. We take a card when you start so billing can begin automatically, and nothing is charged until the trial ends.`,
  },
  {
    question: "Is the repricer included?",
    answer:
      "Yes, on both plans. Apex Gold is available to every account with an active subscription, Starter included.",
  },
  {
    question: "What's the difference between the Starter and Pro plans?",
    // Serialized into the FAQPage schema below, so a wrong figure here is a
    // wrong figure in Google's answer too. Derived from PLAN_LIMITS for that
    // reason: this answer previously named the next tier up on both counts.
    answer:
      `Starter covers up to $${(PLAN_LIMITS.starter.monthlySales! / 1000).toFixed(0)}K a month in sales, ${PLAN_LIMITS.starter.housedAsins.toLocaleString("en-US")} ASINs in your database and ${PLAN_LIMITS.starter.authorizedUsers} authorized user, with email support. Pro removes the sales ceiling and raises the database to ${PLAN_LIMITS.pro.housedAsins.toLocaleString("en-US")} ASINs and ${PLAN_LIMITS.pro.authorizedUsers} authorized users, adding priority onboarding. Extra seats can be added to either plan for $8.99 a month, and the repricer is included in both.`,
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time, no long-term contract required.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function PickPlan() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);

  const limitedPrice = isAnnual
    ? (PRICE_LIMITED_M * (1 - ANNUAL_DISCOUNT)).toFixed(2)
    : PRICE_LIMITED_M.toFixed(2);
  const unlimitedPrice = isAnnual
    ? Math.round(PRICE_UNLIMITED_M * (1 - ANNUAL_DISCOUNT)).toString()
    : PRICE_UNLIMITED_M.toString();
  const annualSavingsPct = Math.round(ANNUAL_DISCOUNT * 100);

  const handleStart = (plan: "starter" | "pro") =>
    router.push(`/auth?mode=signup&plan=${plan}&period=${isAnnual ? "yearly" : "monthly"}`);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen pt-24 pb-24 text-slate-900">
      {/* Dotted texture */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
        {/* Brand collage */}
          <div className="relative flex items-center justify-center">
            <img
              src={apexBrandCollage.url}
              alt="Apex Applications suite"
              className="w-full max-w-[420px] h-auto drop-shadow-xl"
            />
          </div>

          {/* Headline */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              Invest in your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                business growth
              </span>
            </h1>
            <p className="text-slate-500 text-base font-medium mt-5 max-w-xl mx-auto lg:mx-0">
              Choose a plan that fits your Amazon Wholesale business. Cancel anytime.
            </p>

            {/* Monthly/Annual Toggle */}
            <div className="mt-8 inline-flex items-center gap-3 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  !isAnnual ? "bg-slate-900 text-white" : "text-slate-500"
                }`}
              >
                Monthly
              </button>
              <div className="relative">
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap shadow-sm">
                  Best Seller
                </span>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all border-2 ${
                    isAnnual
                      ? "bg-blue-600 text-white border-blue-600"
                      : "text-blue-600 border-blue-600 bg-blue-50"
                  }`}
                >
                  Annual
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Unified comparison container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          {/* Sticky plan headers */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100">
            <div className="grid grid-cols-[1fr_220px_240px] lg:grid-cols-[1fr_280px_300px]">
              <div />
              {/* Starter Plan */}
              <div className="p-6 border-l border-slate-100">
                <div className="text-sm font-bold text-slate-900">Starter Plan</div>
                <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                  <span className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">${limitedPrice}</span>
                    <span className="text-xs text-slate-400 font-semibold">/month</span>
                  </span>
                  {isAnnual && (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Save {annualSavingsPct}%
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-bold text-blue-600 mt-1">
                  7-Day Free Trial, Then ${limitedPrice}/month
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-snug">
                  Perfect for Amazon Wholesale businesses just getting started.
                </p>
                <button
                  onClick={() => handleStart("starter")}
                  className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold border border-blue-200 text-blue-600 hover:bg-blue-50 transition-all"
                >
                  Start Free Trial
                </button>
              </div>
              {/* Pro Plan */}
              <div className="p-6 border-l border-slate-100 bg-gradient-to-b from-indigo-50/40 to-white relative">
                <span className="absolute top-3 right-3 bg-orange-400 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                  Most Popular
                </span>
                <div className="text-sm font-bold text-slate-900">Pro Plan</div>
                <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                  <span className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">${unlimitedPrice}</span>
                    <span className="text-xs text-slate-400 font-semibold">/month</span>
                  </span>
                  {isAnnual && (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Save {annualSavingsPct}%
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-bold text-indigo-600 mt-1">
                  7-Day Free Trial, Then ${unlimitedPrice}/month
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-snug">
                  For serious Amazon Wholesale sellers looking to scale their business.
                </p>
                <button
                  onClick={() => handleStart("pro")}
                  className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <div className="px-6 lg:px-8 pt-8 pb-4">
                <h3 className="text-xl lg:text-2xl font-black tracking-tight text-slate-900">
                  {section.title}
                </h3>
              </div>
              <div>
                {section.rows.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_220px_240px] lg:grid-cols-[1fr_280px_300px] border-t border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="px-6 lg:px-8 py-4 flex items-center gap-3 text-sm font-bold text-slate-900">
                      {row.icon && <span className="text-slate-500">{row.icon}</span>}
                      <span>{row.label}</span>
                    </div>
                    <div className="px-6 py-4 border-l border-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700">
                      {row.limited}
                    </div>
                    <div className="px-6 py-4 border-l border-slate-100 bg-indigo-50/20 flex items-center justify-center text-sm font-semibold text-slate-700">
                      {row.unlimited}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Bottom CTAs */}
          <div className="grid grid-cols-[1fr_220px_240px] lg:grid-cols-[1fr_280px_300px] border-t border-slate-100 bg-slate-50/40">
            <div />
            <div className="p-6 border-l border-slate-100">
              <button
                onClick={() => handleStart("starter")}
                className="w-full py-3 rounded-xl text-xs font-bold border border-blue-200 text-blue-600 hover:bg-blue-50 transition-all"
              >
                Start Free Trial
              </button>
            </div>
            <div className="p-6 border-l border-slate-100">
              <button
                onClick={() => handleStart("pro")}
                className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
        </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 text-center mb-10">
          Pricing Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question} className="border-b border-slate-100 pb-6">
              <h3 className="text-base font-bold text-slate-900 mb-2">{faq.question}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
