"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { CheckCircle2, TrendingUp, ExternalLink, Layers, Barcode } from "lucide-react";
import upcScanner from "../assets/upc-scanner.png.asset.json";
import masterCatalog from "../assets/master-catalog.png.asset.json";
import apexGreenCtaBull from "../assets/apex-green-cta-bull.png.asset.json";
import greenCoreFeaturesImage from "../assets/apex-green-core-features.png.asset.json";
import ViewAppButton from "./ViewAppButton";
import FeatureSection from "./FeatureSection";
import ScrollProgressLine from "./ScrollProgressLine";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function ApexGreen() {
  const sectionsRef = useRef<HTMLDivElement>(null);
  return (
    <div className="pt-40 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 border border-green-100 text-green-600 text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-sm">
              <TrendingUp size={14} className="stroke-[3]" />
              Data Intelligence
            </div>
          </div>
          <h1 className="text-[clamp(3rem,8vw,5rem)] font-black text-slate-900 mb-10 tracking-tight text-center leading-[0.95]">
            HUNTING <br/>
            <span className="text-green-600 italic">ALGORITHMS.</span>
          </h1>
          <p className="text-2xl text-slate-500 leading-relaxed text-center font-medium opacity-80 mb-12">
            Apex Green is built for the hunt. High-speed catalog processing and scanning tools that find profit in thousands of spreadsheet rows in seconds.
          </p>
        </motion.div>

        <div className="text-center mb-24">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">the journey ↓</span>
        </div>

        <div ref={sectionsRef} className="relative space-y-32">
          <ScrollProgressLine containerRef={sectionsRef} colorClassName="bg-green-600" />

          {/* 01 — Spotlight: Apex Green Core Features */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-center">
              <div className="max-w-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center shrink-0">
                    <TrendingUp size={18} className="text-white" strokeWidth={1.75} />
                  </div>
                  <div className="text-xs font-black text-green-600 uppercase tracking-[0.2em]">01 — Core Features</div>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Apex Green — Core Features</h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Sourcing intelligence built for speed. Scan massive supplier lists, unify your catalogs, and surface profitable products in seconds — not days.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    "High-volume UPC & EAN scanning",
                    "Auto-match products to Amazon listings",
                    "Unified master catalog across every vendor",
                    "Live profitability and competition signals"
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                <ViewAppButton data-feature-cta className="bg-green-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all">View Apex Green <ExternalLink size={18} /></ViewAppButton>
              </div>
              <div className="relative flex justify-center">
                <div className="absolute inset-0 rounded-[32px] bg-green-500/30 blur-3xl animate-pulse" aria-hidden />
                <div data-feature-image className="relative bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(22,163,74,0.45)] ring-1 ring-green-400/40 overflow-hidden max-w-[78%]">
                  <img
                    src={greenCoreFeaturesImage.url}
                    alt="Apex Green core features overview"
                    className="w-full h-auto block"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 02 — UPC Scanner */}
          <FeatureSection
            id="upc-scanner"
            number="02"
            eyebrow="UPC Scanner"
            icon={Barcode}
            title="High-Volume Scanning"
            description="Upload a CSV of UPCs or EANs and get instant mapping to Amazon listings — rank, estimated sales, and live competition for every product in your supplier list."
            bullets={[
              "Scan up to 100,000 UPCs per hour",
              "Auto-match UPC/EAN to ASIN with full catalog data",
              "BSR proxy & predictive sales velocity per listing",
              "Competition counts and Buy Box eligibility at a glance"
            ]}
            accentText="text-green-600"
            accentBg="bg-green-600"
            image={{ url: upcScanner.url, alt: "Apex UPC Scanner dashboard showing product scan results with pricing and profitability metrics" }}
            imageSide="right"
            cta={<ViewAppButton data-feature-cta className="bg-green-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all">View UPC Scanner <ExternalLink size={18} /></ViewAppButton>}
          />

          {/* 03 — Master Catalog */}
          <FeatureSection
            id="master-catalog"
            number="03"
            eyebrow="Master Catalog"
            icon={Layers}
            title="Unified Data"
            description="Managing multiple supplier feeds is a thing of the past. Apex Green merges every price list into a single Master Catalog so you can see exactly who has the best price, instantly."
            bullets={[
              "Cross-vendor price comparison on every SKU",
              "Automatic stock-level reconciliation across feeds",
              "Smart lead tagging and duplicate detection",
              "One-click export into POs and listing builders"
            ]}
            accentText="text-green-600"
            accentBg="bg-green-600"
            image={{ url: masterCatalog.url, alt: "Apex Master Catalog dashboard showing vendor catalog and UPC data" }}
            imageSide="left"
            cta={<ViewAppButton data-feature-cta className="bg-green-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all">View Master Catalog <ExternalLink size={18} /></ViewAppButton>}
          />

        </div>

        {/* CTA Section */}
        <div className="mt-32 p-12 lg:p-16 bg-green-600 rounded-[56px] text-white relative overflow-hidden text-center">
           <div className="absolute right-[-2rem] top-1/2 -translate-y-1/2 h-[90%] w-auto opacity-40 brightness-125 scale-x-[-1] pointer-events-none">
              <img
                src={apexGreenCtaBull.url}
                alt="Apex Green bull logo"
                className="h-full w-auto object-contain"
              />
           </div>
           <div className="relative z-10 max-w-3xl mx-auto">
              <div className="text-green-200 text-sm font-bold uppercase tracking-[0.2em] mb-4">You've seen the hunt in action.</div>
              <h2 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight leading-tight">Begin sourcing like a PRO</h2>
              <p className="text-lg lg:text-xl text-green-100 mb-8 max-w-2xl mx-auto">Join the elite sellers who have moved from spreadsheets to systems.</p>
              <ViewAppButton className="bg-white text-green-600 px-10 py-4 rounded-[20px] font-black hover:scale-105 transition-all text-lg shadow-2xl">
                View Apex Green
              </ViewAppButton>
           </div>
        </div>

      </div>
    </div>
  );
}
