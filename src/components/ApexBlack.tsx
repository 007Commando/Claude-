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
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 border border-slate-800 text-white text-[11px] font-bold rounded-full uppercase tracking-[0.1em] shadow-2xl">
              <Activity size={14} className="text-brand" />
              Core Infrastructure
            </div>
          </div>
          <h1 className="text-6xl lg:text-7xl font-black text-slate-900 mb-8 tracking-tighter text-center leading-[0.9]">
            THE OMNISPECTIVE <br/>
            <span className="text-slate-400">COMMAND CENTER</span>
          </h1>
          <p className="text-2xl text-slate-600 leading-relaxed text-center font-medium">
            Apex Black is the heart of your wholesale operations. It provides the high-level visibility and educational foundation needed to scale from a single account to a multi-brand empire.
          </p>
        </motion.div>

        <div className="text-center mb-24">
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
                  <div className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">01 — Core Features</div>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Apex Black — Core Features</h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  The command center for your entire wholesale operation. Monitor performance, level up your skills, and access the tools you need to scale — all in one place.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    "Omnispective business dashboard",
                    "Apex University wholesale curriculum",
                    "Review Booster automation",
                    "Full resource library at your fingertips"
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
            description="Stop toggling between tabs. Our dashboard aggregates your entire business state into a single, beautiful interface — total inventory value, pending shipments, and daily sales velocity at a glance."
            bullets={[
              "Global business health metrics in one view",
              "Inventory aging alerts before storage fees hit",
              "Daily sales velocity tracking across every SKU",
              "Brand-level performance breakdown and trend lines"
            ]}
            accentText="text-slate-900"
            accentBg="bg-slate-900"
            image={{ url: dashboardImage.url, alt: "Apex Applications Dashboard — Omnispective Command overview" }}
            imageSide="right"
            cta={<ViewAppButton data-feature-cta className="bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">View Dashboard <ExternalLink size={18} /></ViewAppButton>}
          />

          {/* 03 — Review Booster */}
          <FeatureSection
            id="review-booster"
            number="03"
            eyebrow="Review Booster"
            icon={Star}
            title="Engagement Engine"
            description="Your seller feedback score is your most valuable asset. Apex Black automates review requests from satisfied buyers while mitigating negative feedback in real time."
            bullets={[
              "Intelligent post-delivery review sequencing",
              "Custom messaging tailored to your brand voice",
              "Real-time feedback monitoring & alerts",
              "ASIN-specific campaign management"
            ]}
            accentText="text-slate-900"
            accentBg="bg-slate-900"
            image={{ url: reviewBoosterImage.url, alt: "Review Booster — Amazon Review Automation" }}
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
                <div className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">04 — Apex University</div>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Wholesale Blueprint</h2>
              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                The definitive video curriculum for scaling multi-brand wholesale enterprises on Amazon. Watch every module, implement the playbooks, and build your empire step by step.
              </p>
            </div>

            <div data-feature-image className="rounded-[32px] overflow-hidden border border-slate-200 shadow-sm bg-white">
              <img src={apexUniversityImage.url} alt="Apex University — Wholesale Blueprint curriculum" className="w-full h-auto block rounded-[32px]" />
            </div>

            <div className="mt-8 flex justify-center">
              <ViewAppButton data-feature-cta className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black hover:bg-slate-800 transition-all uppercase tracking-widest text-sm">
                Enroll in Free Course
              </ViewAppButton>
            </div>
          </motion.section>

          {/* 05 — Resource Library */}
          <FeatureSection
            id="resource-library"
            number="05"
            eyebrow="Resource Library"
            icon={BookOpen}
            title="Vendor Ecosystem"
            description="Don't waste months on unvetted partners. Our Resource Library is the “Yellow Pages” for high-volume Amazon sellers — featuring only the vendors we actually use and trust."
            bullets={[
              "Vetted 3PL & prep center directory",
              "IP-specialist legal representation",
              "Custom P&L spreadsheet templates",
              "Foreign currency exchange partners with member discounts"
            ]}
            accentText="text-slate-900"
            accentBg="bg-slate-900"
            image={{ url: resourceLibraryImage.url, alt: "Resource Library — Books & Resources" }}
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
              <div className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] mb-4">You've seen the full command center.</div>
              <h2 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight leading-tight">Ready for the Black Edition?</h2>
              <p className="text-lg lg:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">Join the elite tier of Amazon wholesale growth.</p>
              <ViewAppButton className="bg-white text-slate-900 px-10 py-4 rounded-[20px] font-black hover:scale-105 transition-all text-lg shadow-2xl">
                Start Trial
              </ViewAppButton>
           </div>
        </div>
      </div>
    </div>
  );
}
