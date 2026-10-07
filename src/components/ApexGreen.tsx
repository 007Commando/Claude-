"use client";

import { useRef } from "react";
import { CheckCircle2, ArrowRight, Layers, Barcode, ListChecks } from "lucide-react";
import upcScanner from "../assets/upc-scanner.png.asset.json";
import masterCatalog from "../assets/master-catalog.png.asset.json";
import apexGreenCtaBull from "../assets/apex-green-cta-bull.png.asset.json";
import greenCoreFeaturesImage from "../assets/apex-green-core-features.png.asset.json";
import ViewAppButton from "./ViewAppButton";
import FeatureSection from "./FeatureSection";
import ScrollProgressLine from "./ScrollProgressLine";
import FeatureFacts from "./FeatureFacts";
import FeatureHero from "./FeatureHero";
import { trialCta, trialTerms } from "../config/offer";

export default function ApexGreen() {
  const sectionsRef = useRef<HTMLDivElement>(null);
  return (
    <div className="pb-24 overflow-hidden">
      <FeatureHero
        module="green"
        intro="Hand Apex Green a supplier's whole price list and it works through every row against the Amazon catalogue in the background, so the shortlist is waiting for you instead of you waiting for it."
        primary={
          <ViewAppButton className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 font-bold text-white transition hover:bg-green-700">
            Start my 7-day trial <ArrowRight size={18} aria-hidden="true" />
          </ViewAppButton>
        }
        image={{ url: upcScanner.url, alt: "Apex UPC Scanner results for a supplier price list" }}
        note={trialTerms()}
      />

      {/* What it is, who it is for, what it needs and which plan: one shared block per module (config/product.ts MODULE_FACTS). */}
      <FeatureFacts module="green" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div ref={sectionsRef} className="relative space-y-32">
          <ScrollProgressLine containerRef={sectionsRef} colorClassName="bg-green-600" />

          {/* Spotlight: core features */}
          <div>
            <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-center">
              <div className="max-w-xl">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center shrink-0">
                    <ListChecks size={16} className="text-green-600" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <div className="text-sm font-semibold text-slate-600">Core features</div>
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-5 tracking-tight leading-tight [text-wrap:balance]">Everything for sourcing in one place</h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Built for long supplier lists. Scan a whole price list, unify them into one catalogue, and get back the products worth buying.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    "High-volume UPC & EAN scanning",
                    "Auto-match products to Amazon listings",
                    "Unified master catalog across every vendor",
                    "Profit, ROI and competition signals"
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                <ViewAppButton data-feature-cta className="bg-green-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all">Try Apex Green <ArrowRight size={18} /></ViewAppButton>
              </div>
              <div className="relative flex justify-center">
                <div data-feature-image className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] overflow-hidden max-w-[78%]">
                  <img
                    src={greenCoreFeaturesImage.url}
                    alt="Apex Green core features overview"
                    className="w-full h-auto block"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* UPC Scanner */}
          <FeatureSection
            id="upc-scanner"
            eyebrow="UPC Scanner"
            icon={Barcode}
            title="High-Volume Scanning"
            description="Upload a spreadsheet of UPCs or EANs and Apex matches each row to the Amazon catalogue, returning rank, estimated sales and competition. Matches can be ambiguous because of pack sizes and variations, so check them before ordering."
            bullets={[
              "Works through the whole file in the background",
              "Auto-match UPC/EAN to ASIN with full catalog data",
              "Sales rank and estimated sales per listing",
              "Seller counts and who holds the Buy Box"
            ]}
            accentText="text-green-600"
            image={{ url: upcScanner.url, alt: "Apex UPC Scanner dashboard showing product scan results with pricing and profitability metrics" }}
            imageSide="right"
            cta={<ViewAppButton data-feature-cta className="bg-green-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all">Try the UPC Scanner <ArrowRight size={18} /></ViewAppButton>}
          />

          {/* Master Catalog */}
          <FeatureSection
            id="master-catalog"
            eyebrow="Master Catalog"
            icon={Layers}
            title="Unified Data"
            description="Managing multiple supplier feeds is a thing of the past. Apex Green merges every price list into a single Master Catalog, so you can see which supplier has the best price on a product you already sell."
            bullets={[
              "Cross-vendor price comparison on every SKU",
              "Add matched products to your database or a purchase order"
            ]}
            accentText="text-green-600"
            image={{ url: masterCatalog.url, alt: "Apex Master Catalog dashboard showing vendor catalog and UPC data" }}
            imageSide="left"
            cta={<ViewAppButton data-feature-cta className="bg-green-600 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all">Try the Master Catalog <ArrowRight size={18} /></ViewAppButton>}
          />

        </div>

        {/* CTA Section */}
        <div className="mt-32 p-12 lg:p-16 bg-green-600 rounded-3xl text-white relative overflow-hidden text-center">
           <div className="absolute right-[-2rem] top-1/2 -translate-y-1/2 h-[90%] w-auto opacity-40 brightness-125 scale-x-[-1] pointer-events-none">
              <img
                src={apexGreenCtaBull.url}
                alt="Apex Green bull logo"
                className="h-full w-auto object-contain"
              />
           </div>
           <div className="relative z-10 max-w-3xl mx-auto">
              <div className="text-green-200 text-sm font-semibold mb-3">Apex Green</div>
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 tracking-tight leading-tight [text-wrap:balance]">Start with a supplier price list you already have</h2>
              <p className="text-lg lg:text-xl text-green-100 mb-8 max-w-2xl mx-auto">{trialTerms()}</p>
              <ViewAppButton className="bg-white text-green-600 px-10 py-4 rounded-xl font-bold hover:bg-green-50 transition-colors text-lg">
                {trialCta}
              </ViewAppButton>
           </div>
        </div>

      </div>
    </div>
  );
}
