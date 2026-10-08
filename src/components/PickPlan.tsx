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
  Hourglass,
  FileDown,
  Tag,
} from "lucide-react";
import { ANNUAL_DISCOUNT, PRICE_LIMITED_M, PRICE_UNLIMITED_M } from "../data/planPricing";
import {
  ANNUAL_DISCOUNT_PERCENT,
  ANNUAL_MEMBER_PERK,
  countLabel,
  formatPrice,
  limitLabel,
  PAID_TRIALS,
  PLAN_LIMITS,
  planById,
  salesCeilingLabel,
  TAX_SUFFIX,
  TRIAL_DAYS,
} from "../config/offer";
import { REPRICER_FACTS, SUPPLIER_ACCESS, moduleByKey, type ModuleKey } from "../config/product";

type Row = {
  label: string;
  icon?: React.ReactNode;
  /** Beginner's value; left out where Beginner matches Starter. */
  beginner?: React.ReactNode;
  limited: React.ReactNode;
  unlimited: React.ReactNode;
};

const B = PLAN_LIMITS.beginner;
/** The table's columns: label, Beginner, Starter, Pro. */
const COLS = "grid grid-cols-[1fr_190px_210px_230px] lg:grid-cols-[1fr_240px_260px_280px]";

type Section = {
  title: string;
  rows: Row[];
};

// The ticks carry their meaning in text too, for screen readers and anyone
// who cannot tell a green tick from a grey cross.
const yes = (
  <>
    <Check aria-hidden="true" className="w-5 h-5 text-emerald-500 mx-auto stroke-[3]" />
    <span className="sr-only">Included</span>
  </>
);
const no = (
  <>
    <X aria-hidden="true" className="w-5 h-5 text-slate-400 mx-auto stroke-[3]" />
    <span className="sr-only">Not included</span>
  </>
);

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
      { label: "Monthly Sales", icon: <DollarSign className="w-4 h-4" />, beginner: `Under $${(B.monthlySales! / 1000).toFixed(0)}K/mo in revenue`, limited: salesCeilingLabel("starter"), unlimited: salesCeilingLabel("pro") },
      { label: "Marketplaces", icon: <ShoppingBag className="w-4 h-4" />, limited: String(PLAN_LIMITS.starter.marketplaces), unlimited: String(PLAN_LIMITS.pro.marketplaces) },
      // "Listings" read as a second listing limit beside "Listings Monitored". This is how many you can sell.
      { label: "Listings You Can Sell", icon: <Store className="w-4 h-4" />, limited: "Unlimited", unlimited: "Unlimited" },
    ],
  },
  {
    title: "Apex Black",
    rows: [
      { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "Review Booster", icon: <Star className="w-4 h-4" />, beginner: `${limitLabel(B.reviewRequestsPerMonth)}/month`, limited: limitLabel(PLAN_LIMITS.starter.reviewRequestsPerMonth), unlimited: limitLabel(PLAN_LIMITS.pro.reviewRequestsPerMonth) },
    ],
  },
  {
    title: "Apex Green",
    rows: [
      { label: "Master Catalog", icon: <Layers className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "UPC Scanner", icon: <Barcode className="w-4 h-4" />, beginner: `${B.upcScansPerMonth} scans/month`, limited: `${PLAN_LIMITS.starter.upcScansPerMonth} scans/month`, unlimited: limitLabel(PLAN_LIMITS.pro.upcScansPerMonth) },
      { label: "Brand Searches", beginner: `${limitLabel(B.brandSearchesPerMonth)}/month`, limited: `${limitLabel(PLAN_LIMITS.starter.brandSearchesPerMonth)}/month`, unlimited: limitLabel(PLAN_LIMITS.pro.brandSearchesPerMonth) },
    ],
  },
  {
    title: "Apex Blue",
    rows: [
      { label: "Analytics", icon: <BarChart3 className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "Restock Management", limited: yes, unlimited: yes },
      { label: "Vendors", icon: <Globe className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "Database", icon: <Database className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "Listings Monitored", beginner: countLabel(B.housedAsins, "listings"), limited: countLabel(PLAN_LIMITS.starter.housedAsins, "listings"), unlimited: countLabel(PLAN_LIMITS.pro.housedAsins, "listings") },
      { label: "Purchase Orders", icon: <FileText className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "Purchase Order Discrepancy", limited: PLAN_LIMITS.starter.purchaseOrderDiscrepancy ? yes : no, unlimited: PLAN_LIMITS.pro.purchaseOrderDiscrepancy ? yes : no },
      { label: "Opex", icon: <Wallet className="w-4 h-4" />, limited: yes, unlimited: yes },
    ],
  },
  /**
   * The repricer is Pro's: the backend allows Beginner one listing to try it
   * on, Starter none, Pro every listing (REPRICED_LISTINGS in offer.ts).
   */
  {
    title: "Apex Gold",
    rows: [
      { label: "Repricer", icon: <Tag className="w-4 h-4" />, beginner: "1 listing", limited: no, unlimited: "Every listing" },
      { label: "Break-Even Floors", beginner: yes, limited: no, unlimited: yes },
      { label: "Repricing Strategies", beginner: yes, limited: no, unlimited: yes },
      { label: "Dry-Run Previews & Activity Log", beginner: yes, limited: no, unlimited: yes },
    ],
  },
  /**
   * Red is a beta opened by invitation (the app shows an invite-only dialog to
   * sellers without access; clients of an approved prep center get it free),
   * so a tick here promised something a new subscriber could not open. Prep
   * center connections are no longer limited by plan (backend 071b8fb), so
   * that row went too.
   */
  {
    title: "Apex Red (beta)",
    rows: [
      { label: "Shipments & Warehouses", beginner: "Beta, by invitation", limited: "Beta, by invitation", unlimited: "Beta, by invitation" },
      { label: "Inventory, Prep Chat & Prep Billing", beginner: "Beta, by invitation", limited: "Beta, by invitation", unlimited: "Beta, by invitation" },
    ],
  },
  /** From config/product.ts AI_CONNECTOR: reads follow each page's plan gate, drafts need Pro. */
  {
    title: "AI Assistants (ChatGPT & Claude)",
    rows: [
      { label: "Read your Apex data", beginner: yes, limited: yes, unlimited: yes },
      { label: "Draft purchase orders, products & vendors", beginner: no, limited: no, unlimited: yes },
    ],
  },
  {
    title: "Essentials",
    rows: [
      { label: "Authorized Users Included", icon: <UserCheck className="w-4 h-4" />, limited: String(PLAN_LIMITS.starter.authorizedUsers), unlimited: String(PLAN_LIMITS.pro.authorizedUsers) },
      { label: "Additional Seat $8.99 / Month", limited: yes, unlimited: yes },
      { label: "Email Support", icon: <Mail className="w-4 h-4" />, limited: yes, unlimited: yes },
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
    answer: `The Beginner Plan is ${formatPrice(planById("beginner").monthly)}/month, the Starter Plan is ${formatPrice(planById("starter").monthly)}/month and the Pro Plan is ${formatPrice(planById("pro").monthly)}/month. Billed yearly, Starter and Pro are ${ANNUAL_DISCOUNT_PERCENT}% off, more than two months free, and ${ANNUAL_MEMBER_PERK.replace(/^Annual Members also/, "Annual Members")} Beginner is monthly only.`,
  },
  {
    question: "Who is the Beginner plan for?",
    answer: `New sellers doing under $${(B.monthlySales! / 1000).toFixed(0)},000 a month in Amazon sales. It includes ${B.housedAsins.toLocaleString("en-US")} monitored listings, ${B.upcScansPerMonth} UPC scans, ${B.brandSearchesPerMonth} brand searches and ${B.reviewRequestsPerMonth} review requests a month, and one listing on the repricer. If your sales grow past that, Starter is the next step.`,
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
      : `Yes. Every plan, Beginner, Starter and Pro, includes a ${TRIAL_DAYS}-day free trial, and ${SUPPLIER_ACCESS.replace(/^Every subscription, trial included,/, "every trial")} We take a card when you start so billing can begin automatically, and nothing is charged until day ${TRIAL_DAYS + 1}.`,
  },
  {
    question: "Is the repricer included?",
    answer:
      `Apex Gold, the repricer, is in beta. ${REPRICER_FACTS.plans} ${REPRICER_FACTS.howPricesMove}`,
  },
  {
    question: "What's the difference between the Starter and Pro plans?",
    // Serialized into the FAQPage schema below, so a wrong figure here is a
    // wrong figure in Google's answer too. Derived from PLAN_LIMITS for that
    // reason: this answer previously named the next tier up on both counts.
    answer:
      `Starter covers up to $${(PLAN_LIMITS.starter.monthlySales! / 1000).toFixed(0)}K a month in sales, ${PLAN_LIMITS.starter.housedAsins.toLocaleString("en-US")} monitored listings, ${PLAN_LIMITS.starter.marketplaces} marketplace and ${PLAN_LIMITS.starter.authorizedUsers} authorized user, with email support. Pro removes the sales ceiling and raises that to ${PLAN_LIMITS.pro.housedAsins.toLocaleString("en-US")} listings, ${PLAN_LIMITS.pro.marketplaces} marketplaces and ${PLAN_LIMITS.pro.authorizedUsers} authorized users, with unlimited UPC scans and brand searches. Pro also includes the repricer on every listing. Extra seats can be added to either plan for $8.99 a month.`,
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

/**
 * Section titles in the table read as jobs, with the brand name beside them.
 * "Apex Black" alone told a new visitor nothing about what the rows were for.
 */
const SECTION_MODULE: Record<string, ModuleKey> = {
  "Apex Black": "black",
  "Apex Green": "green",
  "Apex Blue": "blue",
  "Apex Gold": "gold",
  "Apex Red (beta)": "red",
};

type PlanColumn = {
  id: "beginner" | "starter" | "pro";
  name: string;
  /** The per-month figure shown large. */
  price: string;
  /** What is actually billed, in words, under the price. */
  billed: string;
  fit: string;
  /** A factual tag; never a popularity claim we cannot back. */
  tag?: string;
  featured?: boolean;
};

/**
 * The pricing page, polished 2026-10-07.
 *
 * Removed: the brand collage and the gradient "business growth" headline,
 * the dotted texture, a "Best Seller" badge on Annual and "Most Popular" on
 * Pro (no sales data behind either; Pro now carries the factual "Includes the
 * repricer"), and the per-row icons that only some rows had, which threw the
 * label column out of line. The plan header now really sticks under the nav
 * while the table scrolls: it sat inside an overflow container, which is
 * the one place `position: sticky` cannot work.
 */
export default function PickPlan() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);

  const yearly = (monthly: number) => monthly * 12 * (1 - ANNUAL_DISCOUNT);
  const money2 = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

  const plans: PlanColumn[] = [
    {
      id: "beginner",
      name: "Beginner",
      price: formatPrice(planById("beginner").monthly),
      billed: isAnnual ? "Monthly only" : "Billed monthly",
      fit: planById("beginner").fitsWho,
    },
    {
      id: "starter",
      name: "Starter",
      price: isAnnual ? money2(yearly(PRICE_LIMITED_M) / 12) : formatPrice(PRICE_LIMITED_M),
      billed: isAnnual ? `${money2(yearly(PRICE_LIMITED_M))} billed yearly` : "Billed monthly",
      fit: planById("starter").fitsWho,
    },
    {
      id: "pro",
      name: "Pro",
      price: isAnnual ? money2(yearly(PRICE_UNLIMITED_M) / 12) : formatPrice(PRICE_UNLIMITED_M),
      billed: isAnnual ? `${money2(yearly(PRICE_UNLIMITED_M))} billed yearly` : "Billed monthly",
      fit: planById("pro").fitsWho,
      tag: "Includes the repricer",
      featured: true,
    },
  ];

  // Beginner is sold monthly only, so it ignores the annual toggle.
  const handleStart = (plan: PlanColumn["id"]) =>
    router.push(
      `/auth?mode=signup&plan=${plan}&period=${isAnnual && plan !== "beginner" ? "yearly" : "monthly"}`,
    );

  const startButton = (plan: PlanColumn, size: "sm" | "md" = "sm") => (
    <button
      type="button"
      onClick={() => handleStart(plan.id)}
      className={`w-full rounded-full font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
        size === "md" ? "py-3 text-sm" : "py-2.5 text-sm"
      } ${
        plan.featured
          ? "bg-ink text-white hover:bg-graphite"
          : "border border-hairline bg-white text-ink hover:border-quiet"
      }`}
    >
      Start my {TRIAL_DAYS}-day trial
    </button>
  );

  return (
    <div className="bg-white pb-24 pt-32 text-slate-900 lg:pt-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-[17px] font-semibold text-quiet">Pricing</p>
          <h1 className="type-display mb-6 text-[44px] text-ink sm:text-[64px]">
            A plan for every stage of a wholesale business.
          </h1>
          <p className="text-[19px] leading-relaxed text-quiet sm:text-[21px]">
            Every plan starts with a {TRIAL_DAYS}-day trial. A card is required, nothing is charged until day{" "}
            {TRIAL_DAYS + 1}, and you can cancel any time before then.
          </p>

          <div className="mt-8 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Billing period">
            <button
              type="button"
              aria-pressed={!isAnnual}
              onClick={() => setIsAnnual(false)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition ${!isAnnual ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:text-slate-900"}`}
            >
              Monthly
            </button>
            <button
              type="button"
              aria-pressed={isAnnual}
              onClick={() => setIsAnnual(true)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition ${isAnnual ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:text-slate-900"}`}
            >
              Yearly
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                Save {ANNUAL_DISCOUNT_PERCENT}%
              </span>
            </button>
          </div>
          {/* Stefano, 2026-10-05: drive annual. The reason sits beside the switch. */}
          <p className="mt-4 text-sm text-slate-600">
            Yearly billing takes {ANNUAL_DISCOUNT_PERCENT}% off Starter and Pro. {ANNUAL_MEMBER_PERK}
          </p>
        </div>

        {/*
          Phones and small tablets: one card per plan, the full comparison
          folded inside it. A 900px table scrolling sideways in a 390px screen
          was hard to read, and Chrome counted its width against the page, so
          the whole page scrolled sideways too.
        */}
        <div className="grid gap-5 md:grid-cols-3 lg:hidden">
          {plans.map((plan) => (
            <div key={plan.id} className={`rounded-2xl border bg-white p-6 ${plan.featured ? "border-ink ring-1 ring-ink" : "border-hairline"}`}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
                {plan.tag && <span className="rounded-full bg-ink px-2 py-0.5 text-xs font-medium text-white">{plan.tag}</span>}
              </div>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">{plan.price}</span>
                <span className="text-sm text-slate-500">/month</span>
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">{plan.billed}</p>
              <p className="mt-3 text-sm leading-snug text-slate-600">{plan.fit}</p>
              <div className="mt-4">{startButton(plan, "md")}</div>
              <details className="group mt-5 border-t border-slate-100 pt-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
                  <span className="group-open:hidden">See everything in {plan.name}</span>
                  <span className="hidden group-open:inline">Hide the details</span>
                </summary>
                <div className="mt-3 space-y-5">
                  {sections.map((section) => {
                    const key = SECTION_MODULE[section.title];
                    const m = key ? moduleByKey(key) : null;
                    return (
                      <div key={section.title}>
                        <h3 className="mb-1.5 text-sm font-bold text-slate-900">{m ? m.label : section.title}</h3>
                        <dl className="divide-y divide-slate-100 text-sm">
                          {section.rows.map((row) => (
                            <div key={row.label} className="flex items-center justify-between gap-4 py-1.5">
                              <dt className="text-slate-600">{row.label}</dt>
                              <dd className="text-right font-medium text-slate-900">
                                {plan.id === "beginner" ? row.beginner ?? row.limited : plan.id === "starter" ? row.limited : row.unlimited}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    );
                  })}
                </div>
              </details>
            </div>
          ))}
          <p className="text-sm text-slate-500 md:col-span-3">Prices in USD{TAX_SUFFIX}.</p>
        </div>

        {/* Large screens: the full table, with the plan header sticking under the nav. */}
        <div className="hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.18)] lg:block">
          <div>
            <div>
              <div className="sticky top-20 z-20 rounded-t-2xl border-b border-slate-200 bg-white">
                <div className={COLS}>
                  <div className="flex flex-col justify-end p-6">
                    <p className="text-lg font-bold text-slate-900">Compare plans</p>
                    <p className="mt-1 text-sm text-slate-500">Prices in USD{TAX_SUFFIX}.</p>
                  </div>
                  {plans.map((plan) => (
                    <div key={plan.id} className={`flex flex-col border-l border-slate-200 p-6 ${plan.featured ? "bg-mist" : ""}`}>
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-base font-bold text-slate-900">{plan.name}</h2>
                        {plan.tag && (
                          <span className="rounded-full bg-ink px-2 py-0.5 text-xs font-medium text-white">{plan.tag}</span>
                        )}
                      </div>
                      <p className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold tracking-tight text-slate-900">{plan.price}</span>
                        <span className="text-sm text-slate-500">/month</span>
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">{plan.billed}</p>
                      <p className="mt-3 text-sm leading-snug text-slate-600">{plan.fit}</p>
                      <div className="mt-auto pt-4">{startButton(plan)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {sections.map((section) => {
                const key = SECTION_MODULE[section.title];
                const m = key ? moduleByKey(key) : null;
                return (
                  <div key={section.title}>
                    <div className="flex items-baseline gap-3 px-6 pb-3 pt-8 lg:px-8">
                      <h3 className="text-lg font-bold tracking-tight text-slate-900">{m ? m.label : section.title}</h3>
                      {m && (
                        <span className="text-sm text-slate-500">
                          {m.name}
                          {section.title.includes("beta") || m.status === "beta" ? " · beta" : ""}
                        </span>
                      )}
                    </div>
                    {section.rows.map((row) => (
                      <div key={row.label} className={`${COLS} border-t border-slate-100`}>
                        <div className="flex items-center px-6 py-3.5 text-sm font-medium text-slate-700 lg:px-8">{row.label}</div>
                        <div className="flex items-center justify-center border-l border-slate-100 px-4 py-3.5 text-center text-sm text-slate-700">
                          {row.beginner ?? row.limited}
                        </div>
                        <div className="flex items-center justify-center border-l border-slate-100 px-4 py-3.5 text-center text-sm text-slate-700">
                          {row.limited}
                        </div>
                        <div className="flex items-center justify-center border-l border-slate-100 bg-mist/60 px-4 py-3.5 text-center text-sm text-slate-700">
                          {row.unlimited}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}

              <div className={`${COLS} border-t border-slate-200 bg-slate-50/60`}>
                <div />
                {plans.map((plan) => (
                  <div key={plan.id} className="border-l border-slate-200 p-6">
                    {startButton(plan, "md")}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-3xl px-4 sm:px-6 lg:px-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <h2 className="mb-8 text-2xl font-extrabold tracking-tight text-slate-900 lg:text-3xl">Pricing questions</h2>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map((faq) => (
            <div key={faq.question} className="py-6">
              <h3 className="mb-2 text-base font-bold text-slate-900">{faq.question}</h3>
              <p className="text-[15px] leading-relaxed text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
