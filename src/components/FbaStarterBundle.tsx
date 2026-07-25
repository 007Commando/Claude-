"use client";

import { useEffect, useState } from "react";
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
import dashboardHeroImage from "../assets/dashboard-hero.png.asset.json";
import reviewBoosterImage from "../assets/review-booster.png.asset.json";
import apexUniversityImage from "../assets/apex-university.png.asset.json";

const apexSuiteOverviewImage = "/images/fba-starter-bundle/apex-suite-overview.png";
const keepaPlaybookBookImage = "/images/fba-starter-bundle/keepa-playbook-book.png";
const ungatingSopBookImage = "/images/fba-starter-bundle/ungating-sop-book.png";
const productCatalogCollageImage = "/images/fba-starter-bundle/product-catalog-collage.png";
const amazonSellerSalesImage = "/images/fba-starter-bundle/amazon-seller-app-sales.png";

const COUNTDOWN_SECONDS = 9 * 60;

const CHECKOUT_URL = "https://buy.stripe.com/7sY9ALcrobqvc1c6eLdwc0a";

const includes = [
  {
    icon: Rocket,
    title: "Extended Trial to the #1 Amazon Reselling Suite",
    body: "Full access to Apex Black, Blue & Green, including sourcing, analytics, purchase orders, and more, on an extended trial, not the standard 7 days.",
    image: {
      src: apexSuiteOverviewImage,
      alt: "Apex dashboard with the Tools menu open, showing Apex Black, Blue, and Green modules",
      caption: "Apex Black, Blue & Green",
    },
  },
  {
    icon: Building2,
    title: "3 Free Suppliers",
    body: "Three vetted, authorized US wholesale distributors handed to you on registration, so you skip the months of cold outreach.",
    photo: {
      src: productCatalogCollageImage,
      alt: "Real products and UPC catalogs from wholesale suppliers",
    },
  },
  {
    icon: Star,
    title: "Free Lifetime Review Booster",
    body: "Our automated review-generation tool, free for life, so your new listings build social proof from day one.",
    highlights: [
      "Autopilot growth for starting sellers",
      "Win more sales",
      "Ungate easier",
      "Earn more trust with Amazon customers",
    ],
    image: { src: reviewBoosterImage.url, alt: "Apex Review Booster automation", caption: "Apex Black Review Booster" },
  },
  {
    icon: BookOpen,
    title: "Keepa Playbook and Ungating SOP",
    body: "The exact framework we use to read Keepa charts and spot profitable, stable, fast-moving wholesale products, plus our step-by-step SOP for getting ungated fast.",
    books: [
      { src: keepaPlaybookBookImage, alt: "Apex Keepa Playbook book cover", label: "Keepa Playbook" },
      { src: ungatingSopBookImage, alt: "Apex Ungating SOP book cover", label: "Ungating SOP" },
    ],
  },
  {
    icon: LayoutGrid,
    title: "9 Core Wholesale Modules",
    body: "A step-by-step curriculum covering ungating, supplier approval, scanning, purchase orders, and scaling, from start to finish.",
    image: { src: apexUniversityImage.url, alt: "Apex University course modules", caption: "Apex University" },
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
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 transition-all ${className}`}
    >
      {children}
    </a>
  );
}

function CountdownBadge() {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="flex items-center justify-center gap-2 mb-4 text-sm font-bold text-red-500">
      <span>This price disappears in</span>
      <span className="tabular-nums bg-red-50 rounded-lg px-2 py-1">
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
}

function ShakeOnScroll({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ x: 0 }}
      whileInView={{ x: [0, -6, 6, -5, 5, -3, 3, 0] }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
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

export default function FbaStarterBundle() {
  return (
    <div className="pt-28 sm:pt-32 pb-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 text-brand text-xs font-black rounded-full uppercase tracking-[0.2em] mb-6">
            <Sparkles size={14} />
            Amazon FBA Starter Bundle
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[1.05]">
            Everything You Need to Launch on Amazon{" "}
            <span className="text-brand">for Just $29</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed mb-8">
            One bundle, everything to start: extended access to the #1 Amazon reselling suite, 3
            free suppliers, lifetime review automation, the Keepa Playbook, and 9 core wholesale
            modules.
          </p>

          <div className="flex flex-col items-center gap-4">
            <BuyButton className="bg-brand text-white px-10 py-4 rounded-[20px] font-black hover:scale-105 text-lg shadow-[0_20px_40px_rgba(249,115,22,0.3)] uppercase tracking-wide">
              Get Instant Access for $29 <ArrowRight size={18} />
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
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl lg:text-3xl font-black text-slate-900 text-center tracking-tight mb-8 max-w-2xl mx-auto"
        >
          The Fastest Path to a Real FBA Business
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative max-w-4xl mx-auto mb-24 sm:mb-20"
        >
          <BrowserFrame
            src={dashboardHeroImage.url}
            alt="Apex dashboard showing Amazon balance, sales, and profit"
            caption="What We Promise You"
          />
          <div className="absolute -right-2 sm:-right-6 lg:-right-14 -bottom-10 sm:-bottom-12 lg:-bottom-14 w-28 sm:w-36 lg:w-48 rotate-3 rounded-[22px] border-4 border-white shadow-[0_30px_60px_-20px_rgba(15,23,42,0.45)] overflow-hidden bg-white">
            <img
              src={amazonSellerSalesImage}
              alt="Amazon Seller app showing real-time sales, units sold, and 7-day growth"
              className="w-full h-auto block"
            />
          </div>
        </motion.div>

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
              Five things that normally take months and hundreds of dollars to assemble, bundled
              into one $29 starter pack.
            </p>
          </div>

          <div className="space-y-6">
            {includes.map((item, i) => {
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
              Start Selling for Just $29
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
              A one-time $29 gets you the whole starter bundle. No experience required, everything
              you need to land your first profitable deal is included.
            </p>

            <div className="bg-white rounded-[28px] p-8 max-w-md mx-auto text-left shadow-2xl">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl font-black text-slate-900">$29</span>
                <span className="text-sm font-bold text-slate-400">one-time</span>
              </div>
              <CountdownBadge />
              <ul className="space-y-3 mb-8 mt-6">
                {includes.map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={3} />
                    <span className="text-sm font-semibold text-slate-700">{item.title}</span>
                  </li>
                ))}
              </ul>
              <ShakeOnScroll>
                <BuyButton className="w-full bg-brand text-white px-8 py-4 rounded-[20px] font-black hover:scale-[1.02] text-lg shadow-lg uppercase tracking-wide">
                  Get the Bundle for $29
                </BuyButton>
              </ShakeOnScroll>
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
