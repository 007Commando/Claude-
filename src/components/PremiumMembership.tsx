"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Crown,
  CalendarDays,
  Database,
  Truck,
  Percent,
  Check,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  ChevronDown,
  Award,
} from "lucide-react";
import dashboardHeroImage from "../assets/dashboard-hero.png.asset.json";
import opexDashboardImage from "../assets/opex-dashboard.png.asset.json";
import { prepCenters, projectToMapPercent } from "../data/prepCenters";
import { distributors, categories } from "../data/distributors";

const CHECKOUT_URL = "https://buy.stripe.com/aFa3cn4YW9in5CO6eLdwc0c";

const coreIncludes = [
  {
    icon: CalendarDays,
    title: "2 Years of Apex Applications",
    body: "Full access to the entire Apex Suite, Apex Black, Blue, Green & Red, for 24 months. Your dashboard, financial analytics, purchase order tracking, sourcing tools, and logistics, without a single monthly bill until your two years are up.",
    image: {
      src: opexDashboardImage.url,
      alt: "Apex Opex dashboard showing operating expenses and recurring monthly costs",
      caption: "Apex Opex — financial tracking",
    },
  },
  {
    icon: Database,
    title: `All ${distributors.length} Suppliers in the Vault`,
    body: `Every vetted wholesale distributor in the Apex Vault, unlocked. ${distributors.length} suppliers across ${categories.length} categories, from grocery and beauty to electronics and pet supplies, each with a real website and direct contact email. Normally reserved for Apex Annual members.`,
    vault: true,
  },
  {
    icon: Truck,
    title: "Full Prep Center Network Access",
    body: `Every prep center in our vetted network unlocked, all ${prepCenters.length} partners across the US, with member pricing, priority onboarding, and real-time inventory and restock tools.`,
    map: true,
  },
  {
    icon: Percent,
    title: "Membership Lifetime Discounts",
    body: "The discount rate you lock in with a prep center partner stays locked in for as long as you work with them. As a Premium Member, that starts the day you join and carries through your entire membership.",
    highlights: ["Locked-in pricing", "No renegotiating", "Member-only rates"],
  },
];

const valueStack: { label: string; value: number | null }[] = [
  { label: "2 Years of Apex Applications", value: 7176 },
  { label: `All ${distributors.length} Suppliers in the Vault`, value: null },
  { label: "Full Prep Center Network Access", value: 200 },
  { label: "Membership Lifetime Discounts", value: null },
];
const totalValue = valueStack.reduce((sum, item) => sum + (item.value ?? 0), 0);
const PRICE = 5999;

const faqs = [
  {
    q: "Is this a subscription, or a one-time payment?",
    a: "This is a one-time payment of $5,999. It covers your first two years of full Apex Suite access, plus vault and prep center network access with discount rates that stay locked in beyond that. It is not a recurring charge.",
  },
  {
    q: "What happens after the 2 years?",
    a: "Your Apex Suite access continues on our standard Starter or Pro plans, whichever fits you at that point. Your unlocked vault access and prep center discount rates carry forward with you, they do not reset.",
  },
  {
    q: "I already have an Apex account. Can I still get this?",
    a: "Yes. Existing members can upgrade to Premium Membership to unlock the full vault, the full prep center network, and lock in two years of access. Reach out through Contact Us and our team will get you set up correctly.",
  },
  {
    q: "How is this different from Apex Elite?",
    a: `Apex Elite is a $297 one-time entry point: 90 days of software, 3 starting suppliers, and Prep Center Network access. Premium Membership is built for sellers ready to commit further: two full years of software, all ${distributors.length} suppliers in the vault, full prep center network access, and discount rates locked in for the life of your membership.`,
  },
  {
    q: "Do I need any prior experience with Amazon or wholesale?",
    a: "No. Premium Membership is built to take someone from zero to a running system: suppliers, software, logistics, and locked-in pricing around you. Our team is there to help you get set up correctly.",
  },
];

function BuyButton({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <a
      href={CHECKOUT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 transition-all ${className}`}
    >
      {children}
    </a>
  );
}

function BrowserFrame({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-[0_20px_40px_-24px_rgba(15,23,42,0.25)] bg-white">
      <div className="flex items-center gap-1.5 bg-slate-100 px-3.5 py-2.5 border-b border-slate-200">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2.5 text-[11px] text-slate-400 font-medium tracking-wide truncate">{caption}</span>
      </div>
      <img src={src} alt={alt} className="w-full h-auto block" />
    </div>
  );
}

function VaultPreview() {
  return (
    <div className="rounded-3xl border border-slate-200 shadow-sm bg-white p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {distributors.length}+
        </div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
          Vetted Distributors, Fully Unlocked
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <span
            key={category}
            className="text-xs font-bold text-slate-600 bg-slate-100 rounded-full px-3 py-1.5"
          >
            {category}
          </span>
        ))}
      </div>
    </div>
  );
}

const MAP_REGIONS = [
  { label: "West", from: 0, to: 33.3 },
  { label: "Central", from: 33.3, to: 66.6 },
  { label: "East", from: 66.6, to: 100 },
];

const mapDots = prepCenters.map((c) => ({
  key: c.name,
  ...projectToMapPercent(c.lat, c.long),
}));

function PrepNetworkMap() {
  return (
    <div className="relative rounded-3xl border border-slate-200 shadow-sm overflow-hidden aspect-[4/3] bg-gradient-to-b from-slate-50 to-white">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          maskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black 55%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black 55%, transparent 100%)",
        }}
      />
      {MAP_REGIONS.slice(0, -1).map((r) => (
        <div
          key={r.label}
          className="absolute top-0 bottom-0 border-r border-dashed border-slate-200"
          style={{ left: `${r.to}%` }}
        />
      ))}
      {MAP_REGIONS.map((r) => (
        <div
          key={`label-${r.label}`}
          className="absolute top-3 text-[10px] font-black text-slate-300 uppercase tracking-widest"
          style={{ left: `${(r.from + r.to) / 2}%`, transform: "translateX(-50%)" }}
        >
          {r.label}
        </div>
      ))}
      {mapDots.map((dot) => (
        <span
          key={dot.key}
          style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-white shadow"
        />
      ))}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] font-bold text-slate-400">
        {MAP_REGIONS.map((r) => {
          const count = mapDots.filter((d) => d.x >= r.from && d.x < r.to).length;
          return (
            <span key={r.label} className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              {r.label} · {count}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {faqs.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.q} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-5"
            >
              <span className="text-base font-bold text-slate-900">{item.q}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 sm:px-6 pb-5 text-sm text-slate-600 leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

const trustPoints = [
  { icon: Zap, label: "Instant access" },
  { icon: Lock, label: "Secure checkout" },
  { icon: ShieldCheck, label: "Real human support" },
];

export default function PremiumMembership() {
  return (
    <div className="pt-28 sm:pt-32 pb-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white text-xs font-black rounded-full uppercase tracking-[0.2em] mb-6">
            <Crown size={14} />
            Apex Premium Membership
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[1.05]">
            The Full Apex System, Locked In{" "}
            <span className="text-brand">for $5,999</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed mb-8">
            Every supplier in our vault. Every prep center in our network. Two years of the
            complete Apex Suite. One membership, built for sellers who are done piecing it
            together.
          </p>

          <div className="flex flex-col items-center gap-4">
            <BuyButton className="bg-brand text-white px-10 py-4 rounded-[20px] font-black hover:scale-105 text-lg shadow-[0_20px_40px_rgba(249,115,22,0.3)] uppercase tracking-wide">
              Get Premium Membership for $5,999 <ArrowRight size={18} />
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

        {/* Hero product shot */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto mb-20"
        >
          <BrowserFrame
            src={dashboardHeroImage.url}
            alt="Apex dashboard showing Amazon balance, sales, and profit"
            caption="Your complete Apex system"
          />
        </motion.div>

        {/* Core includes */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              Everything, Unlocked, for Two Years
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Not a starter offer. The entire vault, the entire network, and the entire Apex
              Suite, all unlocked at once.
            </p>
          </div>

          <div className="space-y-6">
            {coreIncludes.map((item, i) => {
              const textBlock = (
                <div className="flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center shrink-0 mb-4">
                    <item.icon size={22} className="text-white" strokeWidth={1.75} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Check size={16} className="text-emerald-500 shrink-0" strokeWidth={3} />
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{item.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{item.body}</p>
                  {"highlights" in item && item.highlights && (
                    <div className="flex flex-wrap gap-2">
                      {item.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand bg-brand/10 rounded-full px-3 py-1.5"
                        >
                          <Crown size={12} className="shrink-0" />
                          {highlight}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );

              const isReversed = i % 2 === 1;

              if ("vault" in item && item.vault) {
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className={`flex flex-col ${
                      isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
                    } items-center gap-8 lg:gap-12 rounded-[28px] bg-slate-50/70 border border-slate-100 p-6 sm:p-8`}
                  >
                    {textBlock}
                    <div className="flex-1 w-full">
                      <VaultPreview />
                    </div>
                  </motion.div>
                );
              }

              if ("map" in item && item.map) {
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className={`flex flex-col ${
                      isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
                    } items-center gap-8 lg:gap-12 rounded-[28px] bg-slate-50/70 border border-slate-100 p-6 sm:p-8`}
                  >
                    {textBlock}
                    <div className="flex-1 w-full">
                      <PrepNetworkMap />
                    </div>
                  </motion.div>
                );
              }

              if (!("image" in item) || !item.image) {
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="rounded-[28px] bg-slate-50/70 border border-slate-100 p-6 sm:p-8 max-w-xl mx-auto lg:mx-0"
                  >
                    {textBlock}
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className={`flex flex-col ${
                    isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
                  } items-center gap-8 lg:gap-12 rounded-[28px] bg-slate-50/70 border border-slate-100 p-6 sm:p-8`}
                >
                  {textBlock}
                  <div className="flex-1 w-full">
                    <BrowserFrame src={item.image.src} alt={item.image.alt} caption={item.image.caption} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Value stack + Price anchor + CTA */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-8 sm:p-10 lg:p-16 bg-slate-900 rounded-[56px] text-white relative overflow-hidden text-center mb-20"
        >
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] mb-4">
              Your complete wholesale membership
            </div>
            <h2 className="text-3xl lg:text-5xl font-black mb-3 tracking-tight leading-tight">
              Get Everything for $5,999
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
              A one-time payment of $5,999 unlocks two years of Apex, the entire supplier
              vault, and the entire prep center network, with discount rates locked in for
              as long as you're a member.
            </p>

            <div className="bg-white rounded-[28px] p-8 max-w-md mx-auto text-left shadow-2xl">
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className="text-2xl font-bold text-slate-300 line-through">${totalValue.toLocaleString()}+</span>
                <span className="text-5xl font-black text-slate-900">${PRICE.toLocaleString()}</span>
              </div>
              <div className="text-center text-xs font-bold text-emerald-600 uppercase tracking-wide mb-6">
                One-time payment · Save ${(totalValue - PRICE).toLocaleString()}+
              </div>
              <ul className="space-y-3 mb-8">
                {valueStack.map((item) => (
                  <li key={item.label} className="flex items-start justify-between gap-3">
                    <span className="flex items-start gap-3">
                      <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={3} />
                      <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                    </span>
                    <span className="text-sm font-bold text-slate-400 shrink-0">
                      {item.value === null ? "Priceless" : `$${item.value.toLocaleString()}`}
                    </span>
                  </li>
                ))}
              </ul>
              <BuyButton className="w-full bg-brand text-white px-8 py-4 rounded-[20px] font-black hover:scale-[1.02] text-lg shadow-lg uppercase tracking-wide">
                Get Premium Membership for $5,999
              </BuyButton>
              <p className="text-center text-xs text-slate-400 mt-3">
                Secure checkout · Instant access · Real human support
              </p>
            </div>
          </div>
        </motion.section>

        {/* Apex Guarantee */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20 rounded-[40px] border border-slate-200 bg-slate-50/70 p-8 sm:p-12 text-center max-w-3xl mx-auto"
        >
          <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-6">
            <Award size={28} className="text-brand" strokeWidth={1.75} />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-4 tracking-tight">
            The Apex Guarantee
          </h2>
          <p className="text-slate-600 leading-relaxed max-w-xl mx-auto">
            We stand behind every supplier, tool, and system in your Premium Membership. This
            isn't a product you buy and get left alone with for two years. Our team stays
            hands-on with you, through our support channels and the Private Amazon Community,
            until your suppliers, software, and logistics are actually set up and working. We
            built this system to be used, and we're invested in you actually using it for the
            full two years.
          </p>
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-3 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>
          <FaqAccordion />

          <div className="mt-12 text-center">
            <BuyButton className="bg-brand text-white px-10 py-4 rounded-[20px] font-black hover:scale-105 text-lg shadow-[0_20px_40px_rgba(249,115,22,0.3)] uppercase tracking-wide">
              Get Premium Membership for $5,999 <ArrowRight size={18} />
            </BuyButton>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
