"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll } from "motion/react";
import {
  ShieldCheck,
  Tag,
  Building2,
  Receipt,
  ImageIcon,
  GraduationCap,
  Package,
  ShoppingCart,
  PackagePlus,
  Truck,
  Upload,
  RotateCw,
  PartyPopper,
  ExternalLink,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  FileCheck,
  CheckCircle2,
  Calendar,
  Leaf,
  Rocket,
  Barcode,
  SlidersHorizontal,
  Map,
} from "lucide-react";

const invoiceRequirements = [
  "Dated within the last 180 days",
  "Your business name and address",
  "The distributor's name and address",
  "A combined purchase of at least 10 units",
  "Pricing on the invoice is optional — you can leave it off",
];

const gatedCategories = [
  "Grocery & Gourmet Food",
  "Beauty",
  "Toys & Games",
  "Sports & Outdoors",
  "Automotive",
  "Baby Products",
  "Supplements",
  "Fine Jewelry & Watches",
  "Fine Art & Collectibles",
];

const gatedBrandExamples = [
  { category: "Toys & Games", brands: ["LEGO"] },
  { category: "Footwear & Apparel", brands: ["Nike", "Adidas"] },
  { category: "Electronics", brands: ["Apple"] },
];

const generalSteps = [
  {
    icon: Building2,
    title: "Buy From an Authorized Distributor",
    body: "Not retail arbitrage — a real wholesale or authorized-dealer account. This is the account type our Distributor Vault and the wholesale accounts you open in Step 2 of the roadmap are built for.",
  },
  {
    icon: Receipt,
    title: "Keep the Invoice",
    body: "The invoice's business name and address need to match what's on file with your Amazon seller account. Mismatches are the #1 reason ungating requests get rejected.",
  },
  {
    icon: ImageIcon,
    title: "Submit Invoice + Product Photos",
    body: "Amazon's ungating application asks for the invoice and clear photos of the physical product (and packaging) for the exact ASIN you're applying for.",
  },
];

const quickWinSteps = [
  {
    icon: ShoppingCart,
    title: "Create a Frontier Co-op Account",
    body: "Sign up at frontiercoop.com. Make sure the business name and shipping address exactly match what's on file with your Amazon seller account — this is what Amazon checks the invoice against.",
    image: {
      src: "/images/ungating-guide/frontier-coop-homepage.png",
      alt: "Frontier Co-op homepage",
      caption: "frontiercoop.com",
    },
  },
  {
    icon: PackagePlus,
    title: "Order 10 Units of Pumpkin Pie Spice",
    body: "Frontier Co-op Pumpkin Pie Spice (1.72 oz) is one of their more affordable items — a low-cost way to get a real, verifiable invoice for a Grocery ASIN. Ten units puts the total around $62 before shipping.",
    product: {
      name: "Frontier Co-op Pumpkin Pie Spice",
      size: "1.72 oz bottle",
      price: "$6.19",
      note: "price as of 2026 — always confirm current pricing",
      photo: "/images/ungating-guide/pumpkin-pie-spice-product.png",
    },
    link: {
      label: "View product on Frontier Co-op",
      href: "https://www.frontiercoop.com/products/frontier-co-op-pumpkin-pie-spice-1-72-oz",
    },
  },
  {
    icon: Truck,
    title: "Choose Fast Shipping",
    body: "Ship it to your home or business address — whichever matches your Amazon seller account. You need the physical product in hand for the photos in the next step.",
  },
  {
    icon: Upload,
    title: "Submit to Amazon's Ungating Portal",
    body: "Once it arrives, upload the Frontier Co-op invoice and clear photos of the product and packaging into Amazon's application for that ASIN's Grocery category approval.",
    image: {
      src: "/images/ungating-guide/amazon-ungating-portal.png",
      alt: "Amazon Seller Central selling application for Brand, listing required invoice documents",
      caption: "sellercentral.amazon.com",
    },
  },
  {
    icon: RotateCw,
    title: "Resubmit if Needed",
    body: "Approval isn't always instant on the first try. If it gets rejected, resubmit the exact same invoice and photos — a second or third attempt often goes through once Amazon's review queue catches up.",
  },
  {
    icon: PartyPopper,
    title: "You're Ungated in Grocery",
    body: "Grocery is one of the largest third-party-friendly categories on Amazon. You can now source and list in it freely.",
  },
];

const nextSteps = [
  {
    icon: Rocket,
    title: "Sign Up & Get Ungated Today",
    body: "Start your free trial and the Foundation Guide, Distributor Vault, and this exact walkthrough are unlocked from day one.",
    highlights: ["7-Day Free Trial", "Ungating Unlock SOP"],
    linkLabel: "Start Free Trial",
    linkHref: "/auth?mode=signup&plan=starter&period=monthly",
  },
  {
    icon: Building2,
    title: "Receive 3 Free Suppliers",
    body: "Reach out to vetted, authorized distributors and brands, open your wholesale accounts, and start pulling their full product catalogs.",
    highlights: ["3 Free Suppliers in the US"],
    linkLabel: "Browse Vetted Vendors",
    linkHref: "/features/black#resource-library",
  },
  {
    icon: Barcode,
    title: "Analyze with UPC Scanner",
    body: "Run every account's catalog through our UPC Scanner and store the profitable winners in your Master Catalog inside Apex Blue.",
    highlights: ["Scan Up to 100,000 UPCs/Hour", "Auto-Match UPC to ASIN"],
    linkLabel: "View UPC Scanner",
    linkHref: "/features/green#upc-scanner",
  },
  {
    icon: SlidersHorizontal,
    title: "Build Purchase Order",
    body: "Set your profitability filters and turn your best finds into real purchase orders — ready to send with confidence.",
    highlights: ["Live Profit Projections", "Per-Supplier Margin & ROI Breakdown"],
    linkLabel: "View Purchase Orders",
    linkHref: "/features/blue#purchase-orders",
  },
];

const NEXT_STEP_HEIGHT = 260;
const NEXT_VIEWBOX_WIDTH = 400;

function buildNextStepsPath() {
  const points = nextSteps.map((_, i) => ({
    x: i % 2 === 0 ? 260 : 140,
    y: i * NEXT_STEP_HEIGHT + NEXT_STEP_HEIGHT / 2,
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

export default function UngatingGuide() {
  const router = useRouter();
  const nextStepsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: nextStepsProgress } = useScroll({
    target: nextStepsRef,
    offset: ["start 0.3", "end 0.7"],
  });
  const { d: nextPathD, points: nextPoints } = buildNextStepsPath();

  return (
    <div className="pt-28 sm:pt-32 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="interiorHero text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 text-brand text-xs font-black rounded-full uppercase tracking-[0.2em] mb-6">
            <ShieldCheck size={14} />
            Ungating Guide
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            How <span className="text-brand">Ungating</span> Works on Amazon
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            A quick primer on category and brand restrictions — and a real, step-by-step way to
            unlock your first category today.
          </p>
        </motion.section>

        {/* What is ungating */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-3 tracking-tight text-center">
            Category vs. Brand Gating
          </h2>
          <p className="text-slate-500 leading-relaxed text-center max-w-2xl mx-auto mb-10">
            Amazon restricts certain categories and brands to protect buyers from counterfeit or
            unsafe products. Getting approved — "ungated" — just means proving you're a
            legitimate, authorized source.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Category Gating */}
            <div className="rounded-2xl border border-slate-100 p-6">
              <div className="w-11 h-11 rounded-xl bg-brand flex items-center justify-center mb-4">
                <Tag size={20} className="text-white" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">Category Gating</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">
                Entire categories require approval before you can list anything in them — regardless
                of brand. Commonly gated categories include:
              </p>
              <div className="flex flex-wrap gap-2">
                {gatedCategories.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-full px-3 py-1.5"
                  >
                    <Tag size={11} className="text-slate-400 shrink-0" />
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Brand Gating */}
            <div className="rounded-2xl border border-slate-100 p-6">
              <div className="w-11 h-11 rounded-xl bg-brand flex items-center justify-center mb-4">
                <ShieldCheck size={20} className="text-white" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">Brand Gating</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">
                Even inside an open category, specific brands can still need their own approval —
                usually to protect against counterfeits. A few well-known examples:
              </p>
              <div className="space-y-2.5">
                {gatedBrandExamples.map((row) => (
                  <div
                    key={row.category}
                    className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/70 px-3.5 py-2.5"
                  >
                    <span className="text-xs font-semibold text-slate-500">{row.category}</span>
                    <div className="flex gap-1.5">
                      {row.brands.map((b) => (
                        <span
                          key={b}
                          className="text-xs font-bold text-brand bg-brand/10 rounded-full px-2.5 py-1"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* General process */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 mb-3 tracking-tight text-center">
            The General Process
          </h2>
          <p className="text-slate-500 leading-relaxed text-center max-w-2xl mx-auto mb-10">
            Every ungating request comes down to the same three things.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {generalSteps.map((s, i) => (
              <div key={s.title} className="rounded-2xl bg-slate-50/70 border border-slate-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                    <s.icon size={16} className="text-white" strokeWidth={1.75} />
                  </div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Step {i + 1}
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 tracking-tight">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => router.push("/features/black#apex-university")}
              className="flex items-center gap-4 text-left rounded-2xl border border-slate-200 p-5 hover:border-brand/40 hover:bg-brand/5 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                <GraduationCap size={20} className="text-white" strokeWidth={1.75} />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm mb-0.5">Watch it in Apex University</div>
                <div className="text-xs text-slate-500">Sample ungating walkthrough videos, included free.</div>
              </div>
              <ArrowRight size={16} className="text-brand shrink-0 ml-auto" />
            </button>
            <button
              onClick={() => router.push("/distributor-vault")}
              className="flex items-center gap-4 text-left rounded-2xl border border-slate-200 p-5 hover:border-brand/40 hover:bg-brand/5 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                <Package size={20} className="text-white" strokeWidth={1.75} />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm mb-0.5">Use the Distributor Vault</div>
                <div className="text-xs text-slate-500">389+ authorized suppliers. Annual members only.</div>
              </div>
              <ArrowRight size={16} className="text-brand shrink-0 ml-auto" />
            </button>
          </div>
        </motion.section>

        {/* Quick Win */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 rounded-[40px] bg-slate-50/70 border border-slate-100 p-6 sm:p-10 lg:p-12"
        >
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 text-brand text-xs font-black rounded-full uppercase tracking-[0.2em] mb-6">
              <Sparkles size={14} />
              Quick Win
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              Get Ungated in Grocery
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Grocery is one of the largest third-party-friendly categories on Amazon. Here's a
              real, low-cost way to unlock it.
            </p>
          </div>

          {/* Real Amazon requirements checklist */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-[28px] border-2 border-brand/15 bg-white p-6 sm:p-8 mb-10"
          >
            <div className="flex items-center gap-2 mb-2">
              <FileCheck size={16} className="text-brand" />
              <div className="text-xs font-black text-brand uppercase tracking-[0.2em]">
                What Amazon Actually Checks
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 tracking-tight">
              Your invoice needs to show:
            </h3>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {invoiceRequirements.map((req) => (
                <div key={req} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-brand shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 leading-relaxed">{req}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-start gap-3">
              <Calendar size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                This is exactly why the walkthrough below has you order 10 units — it's the
                minimum Amazon looks for on a single invoice.
              </p>
            </div>
          </motion.div>

          <div className="space-y-4">
            {quickWinSteps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex gap-5 rounded-2xl bg-white border border-slate-100 p-6"
              >
                <div className="shrink-0 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center">
                    <s.icon size={20} className="text-white" strokeWidth={1.75} />
                  </div>
                  {i < quickWinSteps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-slate-100 mt-2" />
                  )}
                </div>
                <div className="pb-2 flex-1 min-w-0">
                  <div className="text-xs font-black text-brand uppercase tracking-widest mb-1">
                    Step {i + 1}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">{s.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.body}</p>

                  {s.image && (
                    <div className="mt-4 rounded-2xl border border-slate-200 overflow-hidden shadow-[0_20px_40px_-24px_rgba(15,23,42,0.25)]">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-3.5 py-2.5 border-b border-slate-200">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <span className="ml-2.5 text-[11px] text-slate-400 font-medium tracking-wide truncate">
                          {s.image.caption}
                        </span>
                      </div>
                      <img
                        src={s.image.src}
                        alt={s.image.alt}
                        className="w-full h-auto block"
                      />
                    </div>
                  )}

                  {s.product && (
                    <div className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {s.product.photo ? (
                          <img
                            src={s.product.photo}
                            alt={s.product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Leaf size={18} className="text-emerald-600" strokeWidth={1.75} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate">{s.product.name}</div>
                        <div className="text-xs text-slate-500">{s.product.size}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-black text-slate-900">{s.product.price}</div>
                        <div className="text-[10px] text-slate-400">per unit</div>
                      </div>
                    </div>
                  )}
                  {s.product && (
                    <p className="text-[11px] text-slate-400 mt-1.5">{s.product.note}</p>
                  )}

                  {s.link && (
                    <a
                      href={s.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold text-brand hover:underline"
                    >
                      {s.link.label} <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* What Happens Next */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 text-brand text-xs font-black rounded-full uppercase tracking-[0.2em] mb-6">
              <Map size={14} />
              What Happens Next
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              From Ungated to Your First Sale
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Getting ungated is step one. Here's the rest of the path once you're in.
            </p>
          </div>

          <div
            ref={nextStepsRef}
            className="relative"
            style={{ minHeight: nextSteps.length * NEXT_STEP_HEIGHT }}
          >
            <svg
              className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-0"
              viewBox={`0 0 ${NEXT_VIEWBOX_WIDTH} ${nextSteps.length * NEXT_STEP_HEIGHT}`}
              preserveAspectRatio="none"
              aria-hidden
            >
              <path d={nextPathD} fill="none" stroke="#e2e8f0" strokeWidth={3} strokeLinecap="round" />
              <motion.path
                d={nextPathD}
                fill="none"
                stroke="#2563eb"
                strokeWidth={3}
                strokeLinecap="round"
                style={{ pathLength: nextStepsProgress }}
              />
            </svg>

            {nextSteps.map((step, i) => {
              const Icon = step.icon;
              const point = nextPoints[i];
              const leftCard = i % 2 === 0;
              const circleLeftPct = (point.x / NEXT_VIEWBOX_WIDTH) * 100;

              return (
                <div
                  key={step.title}
                  className="relative z-10 flex items-center"
                  style={{ minHeight: NEXT_STEP_HEIGHT }}
                >
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
        </motion.section>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 flex items-start gap-3 mb-16"
        >
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-900">Not official Amazon guidance — </span>
            approval isn't guaranteed and Amazon's requirements can change without notice.
            Product pricing and availability shown here are also subject to change. Always confirm
            current terms directly with Amazon and the distributor before purchasing.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-12 lg:p-16 bg-blue-600 rounded-[56px] text-white relative overflow-hidden text-center"
        >
          <div className="relative z-10 max-w-xl mx-auto">
            <div className="text-blue-200 text-sm font-bold uppercase tracking-[0.2em] mb-4">
              Sign Up Today
            </div>
            <h2 className="text-3xl lg:text-4xl font-black mb-4 tracking-tight leading-tight">
              Let's Embark on Winning on Amazon
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              3 Free Suppliers the moment you register — everything else you just saw is already
              built into Apex.
            </p>
            <button
              onClick={() => router.push("/auth?mode=signup&plan=starter&period=monthly")}
              className="bg-white text-blue-600 px-10 py-4 rounded-[20px] font-black hover:scale-105 transition-all text-lg shadow-2xl"
            >
              Start Free Trial
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
