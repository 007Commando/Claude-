"use client";

import { motion } from "motion/react";
import {
  Sparkles,
  Rocket,
  Building2,
  Star,
  BookOpen,
  LayoutGrid,
  Check,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
} from "lucide-react";

// TODO: replace with the real $27 Stripe Payment Link (or GHL order-form URL).
// Until then this is a placeholder — the buy buttons won't charge anything.
const CHECKOUT_URL = "#";

const includes = [
  {
    icon: Rocket,
    title: "Extended Trial to the #1 Amazon Reselling Suite",
    body: "Full access to Apex Black, Blue & Green — sourcing, analytics, purchase orders, and more — on an extended trial, not the standard 7 days.",
  },
  {
    icon: Building2,
    title: "3 Free Suppliers",
    body: "Three vetted, authorized US wholesale distributors handed to you on registration — skip the months of cold outreach.",
  },
  {
    icon: Star,
    title: "Free Lifetime Review Booster",
    body: "Our automated review-generation tool — free for life, so your new listings build social proof from day one.",
  },
  {
    icon: BookOpen,
    title: "Keepa Playbook",
    body: "The exact framework we use to read Keepa charts and spot profitable, stable, fast-moving wholesale products.",
  },
  {
    icon: LayoutGrid,
    title: "9 Core Wholesale Modules",
    body: "A step-by-step curriculum covering ungating, supplier approval, scanning, purchase orders, and scaling — start to finish.",
  },
];

const trustPoints = [
  { icon: Zap, label: "Instant access" },
  { icon: Lock, label: "Secure checkout" },
  { icon: ShieldCheck, label: "Cancel anytime" },
];

function BuyButton({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <a
      href={CHECKOUT_URL}
      className={`inline-flex items-center justify-center gap-2 transition-all ${className}`}
    >
      {children}
    </a>
  );
}

export default function FbaStarterBundle() {
  return (
    <div className="pt-28 sm:pt-32 pb-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 text-brand text-xs font-black rounded-full uppercase tracking-[0.2em] mb-6">
            <Sparkles size={14} />
            Amazon FBA Starter Bundle
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[1.05]">
            Everything You Need to Launch on Amazon —{" "}
            <span className="text-brand">for $27</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed mb-8">
            One bundle, everything to start: extended access to the #1 Amazon reselling suite, 3
            free suppliers, lifetime review automation, the Keepa Playbook, and 9 core wholesale
            modules.
          </p>

          <div className="flex flex-col items-center gap-4">
            <BuyButton className="bg-brand text-white px-10 py-4 rounded-[20px] font-black hover:scale-105 text-lg shadow-[0_20px_40px_rgba(249,115,22,0.3)] uppercase tracking-wide">
              Get Instant Access — $27 <ArrowRight size={18} />
            </BuyButton>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {trustPoints.map((t) => (
                <span key={t.label} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <t.icon size={14} className="text-emerald-500 shrink-0" />
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        {/* What's inside */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              What's Inside the Bundle
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Five things that normally take months and hundreds of dollars to assemble — bundled
              into one $27 starter pack.
            </p>
          </div>

          <div className="space-y-4">
            {includes.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex gap-5 rounded-2xl bg-slate-50/70 border border-slate-100 p-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center shrink-0">
                  <item.icon size={22} className="text-white" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Check size={16} className="text-emerald-500 shrink-0" strokeWidth={3} />
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{item.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Price anchor + CTA */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-10 lg:p-16 bg-blue-600 rounded-[56px] text-white relative overflow-hidden text-center"
        >
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="text-blue-200 text-sm font-bold uppercase tracking-[0.2em] mb-4">
              Your Amazon FBA head start
            </div>
            <h2 className="text-3xl lg:text-5xl font-black mb-3 tracking-tight leading-tight">
              Start Selling for Just $27
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
              A one-time $27 gets you the whole starter bundle. No experience required — everything
              you need to land your first profitable deal is included.
            </p>

            <div className="bg-white rounded-[28px] p-8 max-w-md mx-auto text-left shadow-2xl">
              <div className="flex items-baseline justify-center gap-2 mb-6">
                <span className="text-5xl font-black text-slate-900">$27</span>
                <span className="text-sm font-bold text-slate-400">one-time</span>
              </div>
              <ul className="space-y-3 mb-8">
                {includes.map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={3} />
                    <span className="text-sm font-semibold text-slate-700">{item.title}</span>
                  </li>
                ))}
              </ul>
              <BuyButton className="w-full bg-brand text-white px-8 py-4 rounded-[20px] font-black hover:scale-[1.02] text-lg shadow-lg uppercase tracking-wide">
                Get the Bundle — $27
              </BuyButton>
              <p className="text-center text-xs text-slate-400 mt-3">
                Secure checkout · Instant access · Cancel anytime
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
