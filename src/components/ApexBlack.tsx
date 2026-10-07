"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Activity, ExternalLink, LayoutGrid, Star, School, BookOpen } from "lucide-react";
import apexBullLogo from "../assets/apex-bull-logo.png.asset.json";
import apexUniversityImage from "../assets/apex-university.png.asset.json";
import resourceLibraryImage from "../assets/resource-library.png.asset.json";
import reviewBoosterImage from "../assets/review-booster.png.asset.json";
import dashboardImage from "../assets/dashboard.png.asset.json";
import coreFeaturesImage from "../assets/apex-black-core-features.png.asset.json";
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

export default function ApexBlack() {
  const sectionsRef = useRef<HTMLDivElement>(null);
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={false}
          animate="animate"
          variants={fadeIn}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 border border-slate-800 text-white text-[11px] font-bold rounded-full uppercase tracking-[0.1em] shadow-2xl">
              <Activity size={14} className="text-brand" />
              Dashboard, Reviews &amp; Training
            </div>
          </div>
          {/* The H1 is the descriptive module label plus the brand (SEO); the big slogan below is decoration. */}
          <h1 className="mb-6 text-sm font-black uppercase tracking-[0.2em] text-slate-600 text-center">Apex Black: {moduleByKey("black").label}</h1>
          <p className="text-6xl lg:text-7xl font-black text-slate-900 mb-8 tracking-tighter text-center leading-[0.9]">
            THE OMNISPECTIVE <br/>
            <span className="text-slate-400">COMMAND CENTER</span>
          </p>
          <p className="text-2xl text-slate-600 leading-relaxed text-center font-medium">
            Apex Black is the home screen of your Apex account: your sales, profit and inventory value, Review Booster for Amazon&apos;s own review request, and Apex University.
          </p>
        </motion.div>
      </div>

      {/* What it is, who it is for, what it needs and which plan: one shared block per module (config/product.ts MODULE_FACTS). */}
      <FeatureFacts module="black" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mt-16 mb-24">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">the journey ↓</span>
        </div>

        <div ref={sectionsRef} className="relative space-y-32">
          <ScrollProgressLine containerRef={sectionsRef} colorClassName="bg-slate-900" />

          {/* 01 — Spotlight: Apex Black Core Features */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-center">
              <div className="max-w-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                    <Activity size={18} className="text-white" strokeWidth={1.75} />
                  </div>
                  <div className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">01 · Core Features</div>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Apex Black: Core Features</h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  One place to check how the business is doing, ask buyers for reviews and learn wholesale, with a directory of service providers alongside.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    "Omnispective business dashboard",
                    "Apex University wholesale curriculum",
                    "Review Booster: Amazon's own review request, sent for you",
                    "A directory of service providers and templates"
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <CheckCircle2 size={20} className="text-slate-900 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                <ViewAppButton data-feature-cta className="bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">View Apex Black <ExternalLink size={18} /></ViewAppButton>
              </div>
              <div className="relative flex justify-center">
                <div className="absolute inset-0 rounded-[32px] bg-slate-900/25 blur-3xl animate-pulse" aria-hidden />
                <div data-feature-image className="relative bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(15,23,42,0.45)] ring-1 ring-slate-900/30 overflow-hidden max-w-[78%]">
                  <img
                    src={coreFeaturesImage.url}
                    alt="Apex Black core features overview"
                    className="w-full h-auto block"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 02 — Dashboard */}
          <FeatureSection
            id="dashboard"
            number="02"
            eyebrow="Dashboard"
            icon={LayoutGrid}
            title="Omnispective Command"
            description="Stop toggling between tabs. The dashboard pulls your Amazon sales, profit and inventory value into one screen."
            bullets={[
              "Sales, profit and inventory value in one view",
              "Daily sales velocity by SKU",
              "Brand-level performance breakdown"
            ]}
            accentText="text-slate-900"
            accentBg="bg-slate-900"
            image={{ url: dashboardImage.url, alt: "Apex Applications Dashboard, Omnispective Command overview" }}
            imageSide="right"
            cta={<ViewAppButton data-feature-cta className="bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">View Dashboard <ExternalLink size={18} /></ViewAppButton>}
          />

          {/* 03 — Review Booster */}
          <FeatureSection
            id="review-booster"
            number="03"
            eyebrow="Review Booster"
            icon={Star}
            title="Review requests"
            description="Apex Black sends Amazon's own Request a Review on eligible Amazon.com orders, a set number of days after the order, and keeps a log of every request. It never selects buyers by sentiment, and it cannot suppress negative feedback."
            bullets={[
              "A log of every request sent",
              "Requests go out a set number of days after the order, and you choose the wait",
              "Amazon's own standard message, with no custom wording",
              "Leave out any listings you do not want asked about"
            ]}
            accentText="text-slate-900"
            accentBg="bg-slate-900"
            image={{ url: reviewBoosterImage.url, alt: "Review Booster, Amazon Review Automation" }}
            imageSide="left"
            cta={<ViewAppButton data-feature-cta className="bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">View Review Booster <ExternalLink size={18} /></ViewAppButton>}
          />

          {/* 04 — Apex University (full-width, bespoke) */}
          <motion.section
            id="apex-university"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 bg-white scroll-mt-28"
          >
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                  <School size={18} className="text-white" strokeWidth={1.75} />
                </div>
                <div className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">04 · Apex University</div>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Wholesale Blueprint</h2>
              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                A video curriculum for Amazon wholesale sellers. It comes with every Apex account: work through the lessons one at a time and put each one into practice.
              </p>
            </div>

            <div data-feature-image className="rounded-[32px] overflow-hidden border border-slate-200 shadow-sm bg-white">
              <img src={apexUniversityImage.url} alt="Apex University, Wholesale Blueprint curriculum" className="w-full h-auto block rounded-[32px]" />
            </div>

            <div className="mt-8 flex justify-center">
              <ViewAppButton data-feature-cta className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black hover:bg-slate-800 transition-all uppercase tracking-widest text-sm">
                Open Apex University
              </ViewAppButton>
            </div>
          </motion.section>

          {/* 05 — Resource Library */}
          <FeatureSection
            id="resource-library"
            number="05"
            eyebrow="Resource Library"
            icon={BookOpen}
            title="Provider directory"
            description="The Resource Library is a directory of service providers and templates for Amazon sellers, kept inside the app so you do not have to search for them one by one."
            bullets={[
              "3PL and prep center directory",
              "IP and legal service providers",
              "P&L spreadsheet templates",
              "Foreign currency exchange providers"
            ]}
            accentText="text-slate-900"
            accentBg="bg-slate-900"
            image={{ url: resourceLibraryImage.url, alt: "Resource Library, Books & Resources" }}
            imageSide="right"
            cta={<ViewAppButton data-feature-cta className="bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">View Resource Library <ExternalLink size={18} /></ViewAppButton>}
          />

        </div>

        <div className="mt-32 p-12 lg:p-16 bg-slate-900 rounded-[56px] text-white relative overflow-hidden text-center">
           <div className="absolute right-[-2rem] top-1/2 -translate-y-1/2 h-[90%] w-auto opacity-40 brightness-150 scale-x-[-1] pointer-events-none">
              <img
                src={apexBullLogo.url}
                alt="Apex Black bull logo"
                className="h-full w-auto object-contain"
              />
           </div>
           <div className="relative z-10 max-w-3xl mx-auto">
              <div className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] mb-4">Apex Black</div>
              <h2 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight leading-tight">Try the dashboard, Review Booster and Apex University</h2>
              <p className="text-lg lg:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">{trialTerms()}</p>
              <ViewAppButton className="bg-white text-slate-900 px-10 py-4 rounded-[20px] font-black hover:scale-105 transition-all text-lg shadow-2xl">
                {trialCta}
              </ViewAppButton>
           </div>
        </div>
      </div>
    </div>
  );
}
