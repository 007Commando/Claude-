"use client";

import { useRef } from "react";
import { CheckCircle2, Activity, ArrowRight, LayoutGrid, Star, School, BookOpen } from "lucide-react";
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
import FeatureHero from "./FeatureHero";
import { trialCta, trialTerms } from "../config/offer";

export default function ApexBlack() {
  const sectionsRef = useRef<HTMLDivElement>(null);
  return (
    <div className="pb-24">
      <FeatureHero
        module="black"
        intro="Apex Black is the home screen of your Apex account: your sales, profit and inventory value, Review Booster for Amazon's own review request, and Apex University."
        primary={
          <ViewAppButton className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 font-bold text-white transition hover:bg-slate-800">
            Start my 7-day trial <ArrowRight size={18} aria-hidden="true" />
          </ViewAppButton>
        }
        image={{ url: dashboardImage.url, alt: "The Apex Black dashboard" }}
        note={trialTerms()}
      />

      {/* What it is, who it is for, what it needs and which plan: one shared block per module (config/product.ts MODULE_FACTS). */}
      <FeatureFacts module="black" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div ref={sectionsRef} className="relative space-y-32">
          <ScrollProgressLine containerRef={sectionsRef} colorClassName="bg-slate-900" />

          {/* Spotlight: core features */}
          <div>
            <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-center">
              <div className="max-w-xl">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center shrink-0">
                    <Activity size={16} className="text-slate-900" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <div className="text-sm font-semibold text-slate-600">Core features</div>
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-5 tracking-tight leading-tight [text-wrap:balance]">Your Amazon business on one screen</h2>
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
                <ViewAppButton data-feature-cta className="bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">Try Apex Black <ArrowRight size={18} /></ViewAppButton>
              </div>
              <div className="relative flex justify-center">
                <div data-feature-image className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] overflow-hidden max-w-[78%]">
                  <img
                    src={coreFeaturesImage.url}
                    alt="Apex Black core features overview"
                    className="w-full h-auto block"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard */}
          <FeatureSection
            id="dashboard"
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
            image={{ url: dashboardImage.url, alt: "Apex Applications Dashboard, Omnispective Command overview" }}
            imageSide="right"
            cta={<ViewAppButton data-feature-cta className="bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">Try the Dashboard <ArrowRight size={18} /></ViewAppButton>}
          />

          {/* Review Booster */}
          <FeatureSection
            id="review-booster"
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
            image={{ url: reviewBoosterImage.url, alt: "Review Booster, Amazon Review Automation" }}
            imageSide="left"
            cta={<ViewAppButton data-feature-cta className="bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">Try Review Booster <ArrowRight size={18} /></ViewAppButton>}
          />

          {/* Apex University (full-width, bespoke) */}
          <section
            id="apex-university"
            className="relative z-10 bg-white scroll-mt-28"
          >
            <div className="mb-16">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center shrink-0">
                  <School size={16} className="text-slate-900" strokeWidth={2} aria-hidden="true" />
                </div>
                <div className="text-sm font-semibold text-slate-600">Apex University</div>
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-5 tracking-tight leading-tight [text-wrap:balance]">Wholesale Blueprint</h2>
              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                A video curriculum for Amazon wholesale sellers. It comes with every Apex account: work through the lessons one at a time and put each one into practice.
              </p>
            </div>

            <div data-feature-image className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]">
              <img src={apexUniversityImage.url} alt="Apex University, Wholesale Blueprint curriculum" className="w-full h-auto block" />
            </div>

            <div className="mt-8 flex justify-center">
              <ViewAppButton data-feature-cta className="bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all">
                Open Apex University
              </ViewAppButton>
            </div>
          </section>

          {/* Resource Library */}
          <FeatureSection
            id="resource-library"
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
            image={{ url: resourceLibraryImage.url, alt: "Resource Library, Books & Resources" }}
            imageSide="right"
            cta={<ViewAppButton data-feature-cta className="bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">Try the Resource Library <ArrowRight size={18} /></ViewAppButton>}
          />

        </div>

        <div className="mt-32 p-12 lg:p-16 bg-slate-900 rounded-3xl text-white relative overflow-hidden text-center">
           <div className="absolute right-[-2rem] top-1/2 -translate-y-1/2 h-[90%] w-auto opacity-40 brightness-150 scale-x-[-1] pointer-events-none">
              <img
                src={apexBullLogo.url}
                alt="Apex Black bull logo"
                className="h-full w-auto object-contain"
              />
           </div>
           <div className="relative z-10 max-w-3xl mx-auto">
              <div className="text-slate-400 text-sm font-semibold mb-3">Apex Black</div>
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 tracking-tight leading-tight [text-wrap:balance]">Try the dashboard, Review Booster and Apex University</h2>
              <p className="text-lg lg:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">{trialTerms()}</p>
              <ViewAppButton className="bg-white text-slate-900 px-10 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors text-lg">
                {trialCta}
              </ViewAppButton>
           </div>
        </div>
      </div>
    </div>
  );
}
