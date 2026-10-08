import Link from "next/link";
import type { ReactNode } from "react";

import LazyVideo from "../LazyVideo";
import { TRUSTPILOT } from "../TrustpilotBadge";
import { TRUSTPILOT_REVIEWS } from "../TrustpilotReviews";
import { Band, Heading, MoreLink, ProductFrame, TrialButton, TrialNote } from "./ui";
import { PLANS_SHOWN, PLAN_LIMITS, formatPrice, planById, trialTerms } from "../../config/offer";
import { isBeta } from "../../config/features";
import { MODULES, VERIFIED_STATS, type ModuleKey } from "../../config/product";

import bullBlack from "../../assets/bull-black.png.asset.json";
import bullBlue from "../../assets/bull-blue.png.asset.json";
import bullGold from "../../assets/bull-gold.png.asset.json";
import bullGreen from "../../assets/bull-green.png.asset.json";
import bullRed from "../../assets/bull-red.png.asset.json";
import upcScanner from "../../assets/upc-scanner.png.asset.json";
import purchaseOrders from "../../assets/purchase-orders.png.asset.json";
import profitLoss from "../../assets/profit-loss-dashboard.png.asset.json";

/**
 * The homepage, design v2 (October 2026).
 *
 * "We are the example of what success is." Built to feel engineered: one
 * statement per screen, the product itself as the hero, and the proof in large
 * type. Every claim still comes from config/offer.ts and config/product.ts, the
 * same facts the rest of the site states, so the finish is premium and the
 * substance is unchanged.
 */

const BULL: Record<ModuleKey, string> = {
  black: bullBlack.url, blue: bullBlue.url, gold: bullGold.url, green: bullGreen.url, red: bullRed.url,
};

/** One line with power per module, true to what each does today. */
const TAGLINE: Record<ModuleKey, string> = {
  green: "Every supplier list. Every match. One pass.",
  blue: "Know your margin before you buy.",
  gold: "Pricing with a floor.",
  red: "From supplier dock to Amazon.",
  black: "Your business, at a glance.",
};

const ACCENT: Record<ModuleKey, string> = {
  green: "text-mod-green", blue: "text-mod-blue", gold: "text-mod-gold", red: "text-mod-red", black: "text-ink",
};

const STEPS = [
  {
    label: "Find",
    title: "The products worth buying, out of thousands.",
    body: "Drop in a supplier's price list. Apex matches every UPC to Amazon and shows profit, ROI, rank and competition on every row.",
    img: upcScanner.url,
    alt: "The Apex UPC Scanner showing a matched supplier price list",
    href: "/features/green",
    more: "Explore Apex Green",
  },
  {
    label: "Buy",
    title: "Purchase orders that know their margin.",
    body: "Turn the winners into a purchase order with landed cost, projected profit and ROI worked out before you commit a dollar.",
    img: purchaseOrders.url,
    alt: "A purchase order in Apex Blue with projected profit",
    href: "/features/blue",
    more: "Explore Apex Blue",
  },
  {
    label: "Know",
    title: "Real profit. Updated as you sell.",
    body: "Sales and Amazon fees sync every few minutes. Your costs come from your own purchase orders, so the number is the one you actually made.",
    img: profitLoss.url,
    alt: "The Apex profit and loss dashboard",
    href: "/features/blue",
    more: "See profit and loss",
  },
];


/** Kept from the previous homepage: the questions buyers ask before a trial. */
const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: "Who is Apex for?",
    a: "Amazon sellers who buy from wholesale suppliers and resell existing brands: people working through supplier price lists, placing purchase orders and restocking what sells. It is not built for private label keyword research or PPC management.",
  },
  { q: "How does the trial work?", a: trialTerms("starter") },
  {
    q: "Is the repricer included in every plan?",
    a: `No. Apex Gold, the repricer, is in beta and part of Pro. Plus (${formatPrice(planById("plus").monthly)} a month) can use it on 5 listings and Beginner on 1; Starter does not include it.`,
  },
  {
    q: "Do I need to connect my Amazon account?",
    a: "To see your own sales, profit, inventory and reorder suggestions, yes. You can scan supplier price lists and research products before you connect.",
  },
  {
    q: "Can I use ChatGPT or Claude with Apex?",
    a: (
      <>
        Yes. On any paid plan, including the trial, you can connect Claude or ChatGPT to read your Apex data. On Pro, a
        separate link lets them prepare drafts for you to review. <Link href="/ai" className="text-link hover:underline">See how it works</Link>.
      </>
    ),
  },
  {
    q: "I am new to wholesale. Where do I start?",
    a: (
      <>
        Apex University is included with every account and walks through the first steps in order. The{" "}
        <Link href="/free-course" className="text-link hover:underline">free course</Link> is a good place to begin before you start a trial.
      </>
    ),
  },
];

const TOOLS = [
  { title: "FBA calculator", body: "Paste an ASIN for Buy Box history, Amazon fees and profit at your cost.", href: "/tools/fba-calculator" },
  { title: "Profit and ROI calculator", body: "Type a price, cost and fees to get profit, margin, ROI and break-even.", href: "/tools/amazon-profit-calculator" },
  { title: "Free wholesale course", body: "The first steps of Amazon wholesale, in order, before you spend a dollar.", href: "/free-course" },
  { title: "Wholesale software guide", body: "What wholesale software needs to do at each step, and how to compare tools.", href: "/amazon-wholesale-software" },
];

export default function HomeV2() {
  const reviews = TRUSTPILOT_REVIEWS.slice(0, 3);
  const stats = [VERIFIED_STATS.catalog, VERIFIED_STATS.identifiers, VERIFIED_STATS.orders];

  return (
    <div className="bg-white text-graphite">
      {/* Hero */}
      <section className="px-4 pb-20 pt-32 sm:px-6 md:pt-40">
        <div className="mx-auto max-w-[1100px] text-center">
          <h1 className="text-[17px] font-semibold text-quiet">Amazon Wholesale Software</h1>
          <p className="type-display mx-auto mt-3 max-w-[900px] text-[52px] text-ink sm:text-[80px] lg:text-[96px]">
            Wholesale, engineered.
          </p>
          <p className="mx-auto mt-6 max-w-[640px] text-[21px] leading-relaxed text-quiet sm:text-[24px]">
            Source it. Buy it. Price it. Know exactly what you made. One system, built for sellers who buy from wholesale
            suppliers.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
            <TrialButton cta="v2-home-hero" size="lg" />
            <MoreLink href="#product">See it in action</MoreLink>
          </div>
          <TrialNote />
        </div>

        <div id="product" className="mx-auto mt-16 max-w-[1200px] scroll-mt-24 md:mt-20">
          <div className="overflow-hidden rounded-[28px] border border-hairline bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04),0_40px_80px_-40px_rgba(0,0,0,0.35)]">
            <LazyVideo src="/videos/dashboard-hero-demo.mp4" label="The Apex dashboard in use" className="block aspect-video w-full bg-mist" />
          </div>
        </div>
      </section>

      {/* Proof in numbers */}
      <Band tone="ink">
        <Heading tone="dark" label="The data behind every decision" title="Built on a catalog this deep." />
        <dl className="mt-16 grid gap-12 text-center sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.what}>
              <dt className="sr-only">{s.what}</dt>
              <dd>
                <span className="type-display block text-[64px] text-white sm:text-[80px]">{s.value}</span>
                <span className="mt-2 block text-[17px] text-white/60">{s.what}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Band>

      {/* Find, Buy, Know */}
      {STEPS.map((step, i) => (
        <Band key={step.label} tone={i % 2 ? "mist" : "white"}>
          <div className="text-center">
            <p className="text-[17px] font-semibold text-quiet">{step.label}</p>
            <h2 className="type-display mx-auto mt-3 max-w-[820px] text-[40px] text-ink sm:text-[56px]">{step.title}</h2>
            <p className="mx-auto mt-5 max-w-[640px] text-[19px] leading-relaxed text-quiet sm:text-[21px]">{step.body}</p>
            <div className="mt-6">
              <MoreLink href={step.href}>{step.more}</MoreLink>
            </div>
          </div>
          <ProductFrame src={step.img} alt={step.alt} className="mt-14" />
        </Band>
      ))}

      {/* The five modules */}
      <Band tone="white">
        <Heading label="The Apex system" title="Five modules. One set of numbers." sub="Every module reads the same products, suppliers and costs. Nothing is typed in twice." />
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => (
            <Link
              key={m.key}
              href={m.path}
              className={`group flex flex-col justify-between rounded-[28px] bg-mist p-8 transition hover:bg-[#ececf0] ${i < 2 ? "lg:col-span-1" : ""}`}
            >
              <div>
                <img src={BULL[m.key]} alt="" className="h-10 w-auto mix-blend-multiply" />
                <p className="mt-6 text-[15px] font-semibold text-quiet">
                  {m.name}
                  {isBeta(m.key) && <span className="ml-2 text-[13px] font-medium text-quiet">· {m.key === "red" ? "Beta, by invitation" : "Beta"}</span>}
                </p>
                <p className={`type-display mt-2 text-[28px] ${ACCENT[m.key]}`}>{TAGLINE[m.key]}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-quiet">{m.label}</p>
              </div>
              <span className="mt-8 inline-flex items-center text-[15px] font-medium text-link group-hover:underline">Learn more ›</span>
            </Link>
          ))}
          <Link href="/ai" className="group flex flex-col justify-between rounded-[28px] bg-ink p-8 text-white">
            <div>
              <p className="text-[15px] font-semibold text-white/60">AI Integrations</p>
              <p className="type-display mt-2 text-[28px]">Ask your business anything.</p>
              <p className="mt-3 text-[15px] leading-relaxed text-white/60">ChatGPT and Claude, connected to your own Apex data.</p>
            </div>
            <span className="mt-8 inline-flex items-center text-[15px] font-medium text-[#2997ff] group-hover:underline">Learn more ›</span>
          </Link>
        </div>
      </Band>

      {/* AI */}
      <Band tone="ink">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Heading
              tone="dark"
              align="left"
              label="ChatGPT and Claude"
              title="Your numbers. Your assistant."
              sub="Connect Claude or ChatGPT and ask about profit, stock, supplier scans and purchase orders. On Pro, it can prepare a draft purchase order for you to review in Apex."
            />
            <div className="mt-8">
              <MoreLink href="/ai" tone="dark">How it works</MoreLink>
            </div>
          </div>
          <div className="space-y-3">
            {["Which profitable products should I reorder this week?", "How did we do this month after expenses?", "Draft a purchase order for the best five."].map((q) => (
              <p key={q} className="ml-auto w-fit max-w-[90%] rounded-[22px] rounded-br-md bg-[#0a84ff] px-5 py-3.5 text-[17px] text-white">{q}</p>
            ))}
            <p className="pt-2 text-right text-[13px] text-white/40">Example questions. It reads what you can see in Apex, and can never submit, spend or change a live price.</p>
          </div>
        </div>
      </Band>

      {/* What sellers say */}
      <Band tone="white">
        <Heading label={`Rated ${TRUSTPILOT.score.toFixed(1)} on Trustpilot`} title="From the sellers using it." />
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.name}>
              <blockquote className="text-[19px] leading-relaxed text-graphite line-clamp-[8]">&ldquo;{r.body}&rdquo;</blockquote>
              <figcaption className="mt-5 text-[15px] text-quiet">{r.name}, {r.country}</figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-12 text-center">
          <MoreLink href={TRUSTPILOT.href}>Read every review on Trustpilot</MoreLink>
        </div>
      </Band>

      {/* Plans */}
      <Band tone="mist">
        <Heading label="Pricing" title={`Plans from ${formatPrice(PLANS_SHOWN[0].monthly)} a month.`} sub="Every plan starts with a seven-day trial. Pay yearly and Starter and Pro are 20% off." />
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {PLANS_SHOWN.map((plan) => (
            <div key={plan.id} className={`rounded-[28px] p-8 ${plan.id === "pro" ? "bg-ink text-white" : "bg-white"}`}>
              <p className={`text-[17px] font-semibold ${plan.id === "pro" ? "text-white/60" : "text-quiet"}`}>{plan.name}</p>
              <p className="type-display mt-3 text-[44px]">
                {formatPrice(plan.monthly)}
                <span className={`ml-1 text-[17px] font-medium tracking-normal ${plan.id === "pro" ? "text-white/60" : "text-quiet"}`}>/mo</span>
              </p>
              <p className={`mt-3 text-[15px] leading-relaxed ${plan.id === "pro" ? "text-white/70" : "text-quiet"}`}>{plan.fitsWho}</p>
              <p className={`mt-5 text-[15px] ${plan.id === "pro" ? "text-white/80" : "text-graphite"}`}>
                {PLAN_LIMITS[plan.id].housedAsins.toLocaleString("en-US")} products · {plan.id === "pro" ? "Repricer on every listing" : plan.id === "beginner" ? "Repricer on 1 listing" : "No repricer"}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <MoreLink href="/pricing">Compare every plan</MoreLink>
        </div>
      </Band>

      {/* Free tools and guides */}
      <Band tone="white">
        <Heading label="Free to use" title="Tools and guides." />
        <div className="mt-14 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((t) => (
            <Link key={t.href} href={t.href} className="group border-t border-hairline py-6">
              <h3 className="text-[19px] font-semibold text-ink group-hover:text-link">{t.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-quiet">{t.body}</p>
            </Link>
          ))}
        </div>
        <p className="mt-8 text-[15px] leading-relaxed text-quiet">
          Want hands-on help with your first month? <Link href="/apex-elite" className="text-link hover:underline">Apex Elite</Link> is a one-time paid starter package with three suppliers, 90 days of the software and first-week help from our team. It is separate from the free trial.
        </p>
      </Band>

      {/* Questions */}
      <Band tone="mist">
        <Heading title="Questions before you start." />
        <div className="mx-auto mt-12 max-w-[760px] divide-y divide-hairline border-y border-hairline">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[19px] font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink">
                {f.q}
                <span aria-hidden="true" className="text-[24px] font-light text-quiet transition group-open:rotate-45">+</span>
              </summary>
              <div className="mt-3 text-[17px] leading-relaxed text-quiet">{f.a}</div>
            </details>
          ))}
        </div>
      </Band>

      {/* Close */}
      <section className="bg-white px-4 py-28 text-center sm:px-6 md:py-36">
        <p className="type-display mx-auto max-w-[860px] text-[44px] text-ink sm:text-[64px]">Your next supplier list deserves better.</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
          <TrialButton cta="v2-home-close" size="lg" />
          <MoreLink href="/pricing">See plans</MoreLink>
        </div>
        <TrialNote />
      </section>
    </div>
  );
}
