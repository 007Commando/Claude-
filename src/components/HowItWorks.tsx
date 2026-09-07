"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll } from "motion/react";
import {
  BookOpen,
  Building2,
  Barcode,
  SlidersHorizontal,
  RotateCw,
  ArrowRight,
  Map,
  Sparkles,
} from "lucide-react";
import ViewAppButton from "./ViewAppButton";
import apexBlueCtaBull from "../assets/apex-blue-cta-bull.png.asset.json";

const steps = [
  {
    icon: BookOpen,
    title: "Build Your Foundation",
    body: "Before you ever reach out to a supplier, get your business foundation right. Our proven setup guide is built to maximize your approval odds with wholesale vendors from day one.",
    highlights: ["Ungating Unlock SOP", "9 High-Level Videos", "Keepa Playbook"],
    linkLabel: "See the Foundation Guide",
    linkHref: "/features/black#apex-university",
  },
  {
    icon: Building2,
    title: "Open Wholesale Accounts",
    body: "Reach out to vetted, authorized distributors and brands, open your wholesale accounts, and start pulling their full product catalogs.",
    highlights: ["3 Free Suppliers in the US", "Review Booster Automation to Hyper-Scale New Stores"],
    linkLabel: "Browse Vetted Vendors",
    linkHref: "/features/black#resource-library",
  },
  {
    icon: Barcode,
    title: "Scan & Catalog Everything",
    body: "Run every account's catalog through our UPC Scanner and store the profitable winners in your Master Catalog inside Apex Blue.",
    highlights: ["Scan Up to 100,000 UPCs/Hour", "Auto-Match UPC to ASIN", "Cross-Vendor Price Comparison"],
    linkLabel: "View UPC Scanner",
    linkHref: "/features/green#upc-scanner",
  },
  {
    icon: SlidersHorizontal,
    title: "Filter & Build Purchase Orders",
    body: "Set your profitability filters and turn your best finds into real purchase orders — ready to send with confidence.",
    highlights: ["Live Profit Projections", "Per-Supplier Margin & ROI Breakdown", "Buy Box Profit Tracking"],
    linkLabel: "View Purchase Orders",
    linkHref: "/features/blue#purchase-orders",
  },
  {
    icon: RotateCw,
    title: "Restock & Scale at Your Pace",
    body: "Once inventory starts moving, use the Restock Purchase Order Builder to rinse and repeat. Scale slow and steady, or aggressive and fast — it's entirely up to you.",
    highlights: ["Sales Velocity Restock Alerts", "Dead Inventory Warnings", "One-Click PO Creation"],
    linkLabel: "View Analytics & Restocking",
    linkHref: "/features/blue#analytics",
  },
];

const STEP_HEIGHT = 340;
const VIEWBOX_WIDTH = 400;

function buildPath() {
  const points = steps.map((_, i) => ({
    x: i % 2 === 0 ? 260 : 140,
    y: i * STEP_HEIGHT + STEP_HEIGHT / 2,
  }));

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }
  return { d, points };
}

export default function HowItWorks() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.3", "end 0.7"],
  });

  const { d: pathD, points } = buildPath();
  const totalHeight = steps.length * STEP_HEIGHT;

  return (
    <div className="pt-32 pb-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="interiorHero text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 text-brand text-xs font-black rounded-full uppercase tracking-[0.2em] mb-6">
            <Map size={14} />
            Apex Roadmap
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            How Amazon Wholesale <span className="text-brand">Works</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            The easiest path to growing a real Amazon FBA wholesale business — five steps, start
            to scale. Scroll down to follow the route.
          </p>
        </motion.section>

        {/* Roadmap */}
        <div ref={containerRef} className="relative" style={{ minHeight: totalHeight }}>
          <svg
            className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${totalHeight}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d={pathD} fill="none" stroke="#e2e8f0" strokeWidth={3} strokeLinecap="round" />
            <motion.path
              d={pathD}
              fill="none"
              stroke="#2563eb"
              strokeWidth={3}
              strokeLinecap="round"
              style={{ pathLength: scrollYProgress }}
            />
          </svg>

          {steps.map((step, i) => {
            const Icon = step.icon;
            const point = points[i];
            const leftCard = i % 2 === 0;
            const circleLeftPct = (point.x / VIEWBOX_WIDTH) * 100;

            return (
              <div
                key={i}
                className="relative z-10 flex items-center"
                style={{ minHeight: STEP_HEIGHT }}
              >
                {/* Numbered marker on the path */}
                <div
                  className="hidden lg:flex absolute -translate-x-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border-2 border-brand text-brand items-center justify-center font-black text-sm shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)]"
                  style={{ left: `${circleLeftPct}%`, top: "50%" }}
                >
                  {i + 1}
                </div>

                <motion.div
                  initial={{ opacity: 0, x: leftCard ? -32 : 32 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className={`w-full lg:w-[46%] bg-slate-50/70 border border-slate-100 rounded-[28px] p-8 ${
                    leftCard ? "lg:mr-auto" : "lg:ml-auto"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-brand flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-white" strokeWidth={1.75} />
                    </div>
                    <div className="text-xs font-black text-brand uppercase tracking-[0.2em]">
                      Step {i + 1}
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">{step.body}</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {step.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand bg-brand/10 rounded-full px-3 py-1.5"
                      >
                        <Sparkles size={12} className="shrink-0" />
                        {highlight}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => router.push(step.linkHref)}
                    className="inline-flex items-center gap-2 text-brand font-bold text-sm hover:gap-3 transition-all"
                  >
                    {step.linkLabel} <ArrowRight size={16} />
                  </button>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Closing CTA */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 p-12 lg:p-16 bg-blue-600 rounded-[56px] text-white relative overflow-hidden text-center"
        >
          <div className="absolute right-[-2rem] top-1/2 -translate-y-1/2 h-[90%] w-auto opacity-40 brightness-150 scale-x-[-1] pointer-events-none">
            <img
              src={apexBlueCtaBull.url}
              alt="Apex Blue bull logo"
              className="h-full w-auto object-contain"
            />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="text-blue-200 text-sm font-bold uppercase tracking-[0.2em] mb-4">
              You've seen the roadmap.
            </div>
            <h2 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight leading-tight">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
              Everything you just saw is already built into Apex — jump in and start your first
              deal today.
            </p>
            <ViewAppButton className="bg-white text-blue-600 px-10 py-4 rounded-[20px] font-black hover:scale-105 transition-all text-lg shadow-2xl">
              Start Free Trial
            </ViewAppButton>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
