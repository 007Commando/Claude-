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
} from "lucide-react";
import apexBrandCollage from "../assets/apex-brand-collage.png.asset.json";

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
      { label: "Monthly Sales", icon: <DollarSign className="w-4 h-4" />, limited: "Up to $50K/mo in revenue", unlimited: "Unlimited" },
      { label: "Marketplaces", icon: <ShoppingBag className="w-4 h-4" />, limited: "2", unlimited: "3" },
      { label: "Listings", icon: <Store className="w-4 h-4" />, limited: "Unlimited", unlimited: "Unlimited" },
    ],
  },
  {
    title: "Apex Black",
    rows: [
      { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "Review Booster", icon: <Star className="w-4 h-4" />, limited: "Unlimited", unlimited: "Unlimited" },
    ],
  },
  {
    title: "Apex Green",
    rows: [
      { label: "Master Catalog", icon: <Layers className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "UPC Scanner", icon: <Barcode className="w-4 h-4" />, limited: yes, unlimited: yes },
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
      { label: "Listings Being Monitored", limited: "4,000 Listings", unlimited: "Unlimited" },
      { label: "Purchase Orders", icon: <FileText className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "Purchase Order Discrepancy", limited: yes, unlimited: yes },
      { label: "Opex", icon: <Wallet className="w-4 h-4" />, limited: yes, unlimited: yes },
    ],
  },
  {
    title: "Essentials",
    rows: [
      { label: "Authorized Users", icon: <UserCheck className="w-4 h-4" />, limited: "5", unlimited: "10" },
      { label: "Additional Seat $8.99 / Month", limited: yes, unlimited: yes },
      { label: "Email Support", icon: <Mail className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "Priority Onboarding", icon: <Rocket className="w-4 h-4" />, limited: no, unlimited: yes },
      { label: "Historical Data", icon: <Hourglass className="w-4 h-4" />, limited: yes, unlimited: yes },
      { label: "Export Data", icon: <FileDown className="w-4 h-4" />, limited: yes, unlimited: yes },
    ],
  },
];

const PRICE_LIMITED_M = 149.99;
const PRICE_UNLIMITED_M = 299;
const ANNUAL_DISCOUNT = 0.2;

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
    </div>
  );
}
