"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Rocket,
  Building2,
  Star,
  BookOpen,
  Truck,
  Users,
  Check,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  ChevronDown,
  Award,
} from "lucide-react";
import dashboardHeroImage from "../assets/dashboard-hero.png.asset.json";
import reviewBoosterImage from "../assets/review-booster.png.asset.json";
import { prepCenters, projectToMapPercent } from "../data/prepCenters";

const apexSuiteOverviewImage = "/images/fba-starter-bundle/apex-suite-overview.png";
const keepaPlaybookBookImage = "/images/fba-starter-bundle/keepa-playbook-book.png";
const ungatingSopBookImage = "/images/fba-starter-bundle/ungating-sop-book.png";
const productCatalogCollageImage = "/images/fba-starter-bundle/product-catalog-collage.png";

const CHECKOUT_URL = "https://buy.stripe.com/3cIeV50IGcuzfdofPldwc0b";

const coreIncludes = [
  {
    icon: Building2,
    title: "3 Starting Suppliers",
    body: "Three vetted, authorized US wholesale distributors handed to you on day one, so you skip the months most sellers spend on cold outreach just to find someone who will sell to them.",
    photo: {
      src: productCatalogCollageImage,
      alt: "Real products and UPC catalogs from wholesale suppliers",
    },
  },
  {
    icon: Rocket,
    title: "Full Apex Suite for 90 Days",
    body: "Apex Black, Blue, Green & Red: your dashboard, financial analytics, purchase order tracking, sourcing tools, and logistics, all connected in one system instead of five separate subscriptions.",
    image: {
      src: apexSuiteOverviewImage,
      alt: "Apex dashboard with the Tools menu open, showing Apex Black, Blue, and Green modules",
      caption: "Apex Black, Blue, Green & Red",
    },
  },
  {
    icon: Truck,
    title: "Connect to Prep Centers",
    body: "Access to our vetted Prep Center Network across the US with negotiated member pricing, plus real-time inventory and restock tools, so a slow prep center never turns into a stockout.",
    map: true,
  },
  {
    icon: Star,
    title: "Free Lifetime Review Booster",
    body: "Our automated, Amazon-compliant review request tool, free for life, so your new listings build social proof from day one without you tracking a single order manually.",
    highlights: ["Autopilot growth for new sellers", "Win more sales", "Ungate easier", "Earn more trust with buyers"],
    image: { src: reviewBoosterImage.url, alt: "Apex Review Booster automation", caption: "Apex Black Review Booster" },
  },
  {
    icon: BookOpen,
    title: "Complete Playbook Library ($300 Value)",
    body: "Ten tactical playbooks covering the wholesale blueprint, distributor outreach, negotiation, Keepa reading, and ungating SOPs, the exact frameworks our own team uses.",
    books: [
      { src: keepaPlaybookBookImage, alt: "Apex Keepa Playbook book cover", label: "Keepa Playbook" },
      { src: ungatingSopBookImage, alt: "Apex Ungating SOP book cover", label: "Ungating SOP" },
    ],
  },
];

const bonusIncludes = [
  {
    icon: Users,
    title: "Private Amazon Community",
    body: "Join a private network of serious wholesale sellers using the same systems you are, to trade suppliers, ask questions, and stay accountable as you scale.",
  },
];

const valueStack: { label: string; value: number | null }[] = [
  { label: "3 Starting Suppliers", value: 500 },
  { label: "Full Apex Suite (90 Days)", value: 450 },
  { label: "Connect to Prep Centers", value: 200 },
  { label: "Private Amazon Community", value: null },
  { label: "Free Lifetime Review Booster", value: 300 },
  { label: "Complete Playbook Library", value: 300 },
];
const totalValue = valueStack.reduce((sum, item) => sum + (item.value ?? 0), 0);

const faqs = [
  {
    q: "Is this a subscription, or a one-time payment?",
    a: "This is a one-time payment of $297. It is not a recurring subscription. Continued access to the Apex software suite beyond the included 90 days follows our standard Starter or Pro plans, which you can review on our pricing page at any time.",
  },
  {
    q: "I already have an Apex account. Can I still get this?",
    a: "Yes. Existing members can add Apex Elite to layer in the additional suppliers, logistics access, and community. Reach out through Contact Us and our team will get you set up correctly.",
  },
  {
    q: "What exactly happens after I purchase?",
    a: "You will get immediate access to your software setup, your suppliers, and the playbook library, plus your invite to the Private Amazon Community, so you can start moving on your first purchase order right away.",
  },
  {
    q: "Do I need any prior experience with Amazon or wholesale?",
    a: "No. Apex Elite is built to take someone from zero to a running system: suppliers, software, logistics, and a real community around you. The playbook library starts from first principles.",
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
          <div
            key={item.q}
            className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
          >
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

export default function ApexElite() {
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 text-brand text-xs font-black rounded-full uppercase tracking-[0.2em] mb-6">
            <Sparkles size={14} />
            Apex Elite
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[1.05]">
            The Complete Amazon Wholesale System{" "}
            <span className="text-brand">for $297</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed mb-8">
            Suppliers, software, logistics, community, and a real team behind you. Everything it
            takes to build a real Amazon wholesale business, in one system, instead of stitched
            together from scratch.
          </p>

          <div className="flex flex-col items-center gap-4">
            <BuyButton className="bg-brand text-white px-10 py-4 rounded-[20px] font-black hover:scale-105 text-lg shadow-[0_20px_40px_rgba(249,115,22,0.3)] uppercase tracking-wide">
              Get Apex Elite for $297 <ArrowRight size={18} />
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
              Everything You Need, Built In
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Not a discount trial. The complete set of suppliers, software, and logistics it
              takes to actually run a wholesale business.
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
                          <Sparkles size={12} className="shrink-0" />
                          {highlight}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );

              if ("books" in item && item.books) {
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 rounded-[28px] bg-slate-50/70 border border-slate-100 p-6 sm:p-8"
                  >
                    {textBlock}
                    <div className="flex-1 w-full grid grid-cols-2 gap-4 sm:gap-6">
                      {item.books.map((book) => (
                        <div key={book.label} className="text-center">
                          <div className="rounded-2xl bg-white p-4 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.25)]">
                            <img src={book.src} alt={book.alt} className="w-full h-auto object-contain" />
                          </div>
                          <div className="mt-2 text-xs font-bold text-slate-500">{book.label}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              }

              if ("map" in item && item.map) {
                const mapOnLeft = i % 2 === 1;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className={`flex flex-col ${
                      mapOnLeft ? "lg:flex-row-reverse" : "lg:flex-row"
                    } items-center gap-8 lg:gap-12 rounded-[28px] bg-slate-50/70 border border-slate-100 p-6 sm:p-8`}
                  >
                    {textBlock}
                    <div className="flex-1 w-full">
                      <PrepNetworkMap />
                    </div>
                  </motion.div>
                );
              }

              if ("photo" in item && item.photo) {
                const photoOnLeft = i % 2 === 1;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className={`flex flex-col ${
                      photoOnLeft ? "lg:flex-row-reverse" : "lg:flex-row"
                    } items-center gap-8 lg:gap-12 rounded-[28px] bg-slate-50/70 border border-slate-100 p-6 sm:p-8`}
                  >
                    {textBlock}
                    <div className="flex-1 w-full rounded-2xl bg-white p-4 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.25)]">
                      <img src={item.photo.src} alt={item.photo.alt} className="w-full h-auto object-contain" />
                    </div>
                  </motion.div>
                );
              }

              if (!("image" in item) || !item.image) return null;

              const imageOnLeft = i % 2 === 1;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className={`flex flex-col ${
                    imageOnLeft ? "lg:flex-row-reverse" : "lg:flex-row"
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

        {/* Bonus includes */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-3 tracking-tight">
              Plus, You Also Get
            </h2>
          </div>
          <div className="max-w-md mx-auto">
            {bonusIncludes.map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] bg-slate-50/70 border border-slate-100 p-8 text-center flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center shrink-0 mb-4">
                  <item.icon size={22} className="text-white" strokeWidth={1.75} />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Value stack + Price anchor + CTA */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-8 sm:p-10 lg:p-16 bg-blue-600 rounded-[56px] text-white relative overflow-hidden text-center mb-20"
        >
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="text-blue-200 text-sm font-bold uppercase tracking-[0.2em] mb-4">
              Your complete wholesale system
            </div>
            <h2 className="text-3xl lg:text-5xl font-black mb-3 tracking-tight leading-tight">
              Get Everything for Just $297
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
              A one-time payment of $297 gets you the complete system. No experience required,
              real support included every step of the way.
            </p>

            <div className="bg-white rounded-[28px] p-8 max-w-md mx-auto text-left shadow-2xl">
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className="text-2xl font-bold text-slate-300 line-through">${totalValue}+</span>
                <span className="text-5xl font-black text-slate-900">$297</span>
              </div>
              <div className="text-center text-xs font-bold text-emerald-600 uppercase tracking-wide mb-6">
                One-time payment · Save ${totalValue - 297}+
              </div>
              <ul className="space-y-3 mb-8">
                {valueStack.map((item) => (
                  <li key={item.label} className="flex items-start justify-between gap-3">
                    <span className="flex items-start gap-3">
                      <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={3} />
                      <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                    </span>
                    <span className="text-sm font-bold text-slate-400 shrink-0">
                      {item.value === null ? "Priceless" : `$${item.value}`}
                    </span>
                  </li>
                ))}
              </ul>
              <BuyButton className="w-full bg-brand text-white px-8 py-4 rounded-[20px] font-black hover:scale-[1.02] text-lg shadow-lg uppercase tracking-wide">
                Get Apex Elite for $297
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
            We stand behind every supplier, tool, and system in Apex Elite. This isn't a product
            you buy and get left alone with. Complete your onboarding, and our team stays
            hands-on with you, through our support channels and the Private Amazon Community,
            until your suppliers, software, and logistics are actually set up and working. We
            built this system to be used, and we're invested in you actually using it.
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
              Get Apex Elite for $297 <ArrowRight size={18} />
            </BuyButton>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
