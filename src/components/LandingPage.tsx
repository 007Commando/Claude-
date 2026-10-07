import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Calculator,
  FileText,
  GraduationCap,
  Search,
  ShieldCheck,
  Tag,
} from "lucide-react";
import sourcingSpeedVideo from "../assets/sourcing-speed.mp4.asset.json";
import SuiteMap from "./SuiteMap";
import CheckoutLink from "./CheckoutLink";
import LazyVideo from "./LazyVideo";
import { TRUSTPILOT } from "./TrustpilotBadge";
import { TRUSTPILOT_REVIEWS } from "./TrustpilotReviews";
import { PLANS_SHOWN, PLAN_LIMITS, TRIAL_CHECKOUT_URL, formatPrice, planById, trialCta, trialTerms } from "../config/offer";
import { isBeta } from "../config/features";
import { VERIFIED_STATS, moduleByKey } from "../config/product";

/**
 * The homepage, rebuilt 2026-10-07 around one question a visitor brings:
 * "is this for me, and what does it do?" In order: what Apex is, the product
 * itself, the workflow it connects, the modules, what an AI assistant can do
 * with it, who it fits and what it costs, what customers said, free things to
 * try, and the questions people ask before a trial.
 *
 * Removed in the rebuild, because the product does not do them: an
 * "intelligence engine" that "predicts Amazon rank fluctuations and competitor
 * replenishment cycles", "predictive BSR analysis", auto-filtering of
 * "IP-claim brands", and "join hundreds of wholesale experts" (Stripe had about
 * thirty paying customers that day). The animated gross-sales counter went
 * too: it re-rendered the page sixty times a second to show a number that was
 * not anyone's.
 *
 * A server component: everything here is in the HTML before any script runs.
 */

const WORKFLOW = [
  {
    icon: Search,
    step: "Find",
    title: "Scan a supplier price list",
    body: "Drop in the spreadsheet your supplier sent. Apex matches each UPC to Amazon and shows landed cost, profit at the Buy Box, 30, 60 and 90 day price and rank, seller count, whether Amazon is on the listing, and hazmat or meltable flags.",
    module: moduleByKey("green"),
  },
  {
    icon: FileText,
    step: "Buy",
    title: "Turn the winners into a purchase order",
    body: "Keep suppliers, costs and case packs in one database, build purchase orders from it, and see projected profit and ROI on every order before you send it.",
    module: moduleByKey("blue"),
  },
  {
    icon: Tag,
    step: "Sell",
    title: "Reprice without going below your floor",
    body: "Set floors from your own cost and Amazon's fees, preview a strategy before it moves a price, and see every price change the repricer made.",
    module: moduleByKey("gold"),
  },
  {
    icon: BarChart3,
    step: "Track",
    title: "Know your real profit and what to reorder",
    body: "Sales and fees sync from Amazon every few minutes. Profit and loss uses the costs you have entered, and inventory shows days of stock left and what needs restocking.",
    module: moduleByKey("blue"),
  },
];

const AI_QUESTIONS = [
  "Which profitable products should I reorder this week?",
  "How did my business do this month after expenses?",
  "Which products from my last supplier scan clear 30% ROI?",
];

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Who is Apex for?",
    a: "Amazon sellers who buy from wholesale suppliers and resell existing brands: people working through supplier price lists, placing purchase orders and restocking what sells. It is not built for private label keyword research or PPC management.",
  },
  {
    q: "How does the trial work?",
    a: trialTerms("starter"),
  },
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
        separate link lets them prepare drafts for you to review. <Link href="/ai" className="font-semibold text-brand hover:underline">See how it works</Link>.
      </>
    ),
  },
  {
    q: "I am new to wholesale. Where do I start?",
    a: (
      <>
        Apex University is included with every account and walks through the first steps in order. The{" "}
        <Link href="/free-course" className="font-semibold text-brand hover:underline">free course</Link> is a good place to begin before you start a trial.
      </>
    ),
  },
];

export default function LandingPage() {
  const reviews = TRUSTPILOT_REVIEWS.slice(0, 3);

  return (
    <>
      {/* 1. Positioning and the primary action */}
      <section className="pt-32 pb-16 lg:pt-44 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-[1fr_1.15fr] lg:gap-16 items-center">
            <div className="max-w-2xl">
              <p className="mb-5 text-xs font-black uppercase tracking-[0.2em] text-brand">Software for Amazon wholesale sellers</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] mb-8 tracking-tight [text-wrap:balance]">
                Amazon Wholesale Software for Sourcing, Purchasing, and Profit
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                Scan a supplier&rsquo;s price list, see what is profitable on Amazon, turn the best products into purchase
                orders, and track your real profit and restocks in one place. Then ask ChatGPT or Claude about it, using your
                own Apex data.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <CheckoutLink
                  href={TRIAL_CHECKOUT_URL}
                  className="bg-brand text-white px-9 py-4 rounded-2xl text-sm font-black hover:brightness-110 transition-all shadow-[0_20px_40px_rgba(249,115,22,0.25)] flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                  <span data-cta="home-hero-trial">{trialCta}</span> <ArrowRight size={18} aria-hidden="true" />
                </CheckoutLink>
                <Link
                  href="/pricing"
                  data-cta="home-hero-pricing"
                  className="bg-white text-slate-900 border border-slate-200 px-9 py-4 rounded-2xl text-sm font-black hover:border-slate-300 hover:shadow-lg transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                  See plans
                </Link>
              </div>
              <p className="mt-4 max-w-lg text-sm text-slate-500">{trialTerms("starter")}</p>
            </div>

            {/* 2. The product itself */}
            <div className="mt-16 lg:mt-0">
              <div className="relative bg-white rounded-[32px] p-2 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden">
                <LazyVideo src="/videos/dashboard-hero-demo.mp4" label="The Apex dashboard in use" className="w-full h-auto rounded-[26px] aspect-video bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The workflow */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">From supplier price list to profit, without the spreadsheets</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Plenty of wholesale sellers keep each of these steps in a different tool or tab. In Apex they share one database of
              products, suppliers and costs, so what you find in a scan is what you order, reprice and measure.
            </p>
          </div>
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW.map((w, i) => {
              const Icon = w.icon;
              return (
                <li key={w.title} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand"><Icon size={20} aria-hidden="true" /></span>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">{i + 1}. {w.step}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">{w.title}</h3>
                  <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-600">{w.body}</p>
                  <Link href={w.module.path} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 hover:text-brand">
                    {w.module.label}
                    {isBeta(w.module.key) && <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700">Beta</span>}
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ol>

          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.3fr] items-center">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-4">Let Apex sort the whole supplier list</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Map the columns once and Apex works through every row in the background, matching against a catalog of{" "}
                {VERIFIED_STATS.catalog.value} Amazon products. Filter by ROI, rank and competition, hide what you already
                carry, and send the rest to a purchase order.
              </p>
              <Link href="/features/green" data-cta="home-green" className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:gap-3 transition-all">
                How the UPC scanner works <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <div className="relative bg-white rounded-[32px] p-2 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden">
              <LazyVideo src={sourcingSpeedVideo.url} label="A supplier price list being scanned in Apex Green" className="w-full h-auto rounded-[26px] aspect-video bg-slate-100" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. The modules */}
      <SuiteMap />

      {/* 5. AI */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-700"><Bot size={16} aria-hidden="true" /> ChatGPT and Claude</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Ask your assistant about your actual business</h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Connect Claude or ChatGPT to Apex and they answer from your own profit, stock, purchase orders and supplier
              scans. Reading works on every paid plan, trial included. On Pro, they can also prepare draft purchase orders
              for you to review in Apex. They can never submit an order, spend money or change a live price.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/ai" data-cta="home-ai" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800">
                See what you can ask <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/integrations/claude" className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-900 hover:border-slate-300">Claude setup</Link>
              <Link href="/integrations/chatgpt" className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-900 hover:border-slate-300">ChatGPT setup</Link>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <ul className="space-y-3">
              {AI_QUESTIONS.map((q) => (
                <li key={q} className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm font-medium text-white">{q}</li>
              ))}
            </ul>
            <p className="mt-5 flex items-start gap-2 text-sm text-slate-600">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
              The assistant sees what you can see in Apex and nothing more, and you can turn its access off in one click.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Who it fits, and plans */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Pick the plan that fits where you are</h2>
            <p className="text-lg text-slate-600 leading-relaxed">Every plan starts with a seven-day trial. Monthly prices shown; paying yearly takes 20% off Starter and Pro.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {PLANS_SHOWN.map((plan) => {
              const limits = PLAN_LIMITS[plan.id];
              return (
                <div key={plan.id} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <p className="mt-1 text-3xl font-black text-slate-900">{formatPrice(plan.monthly)}<span className="text-base font-semibold text-slate-500">/month</span></p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{plan.fitsWho}</p>
                  <ul className="mt-4 flex-1 space-y-1.5 text-sm text-slate-600">
                    <li>{limits.housedAsins.toLocaleString("en-US")} products in your database</li>
                    <li>{limits.upcScansPerMonth === null ? "Unlimited" : limits.upcScansPerMonth} supplier scans a month</li>
                    <li>{plan.id === "pro" ? "Repricer on every listing" : plan.id === "beginner" ? "Repricer on 1 listing" : "No repricer"}</li>
                    <li>{plan.id === "pro" ? "AI reads and drafts" : "AI reads"}</li>
                  </ul>
                </div>
              );
            })}
          </div>
          <Link href="/pricing" data-cta="home-plans" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-brand hover:gap-3 transition-all">
            Compare everything in each plan <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 7. Customer evidence: real, public reviews only */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">What sellers wrote on Trustpilot</h2>
            <a href={TRUSTPILOT.href} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-900 hover:text-brand">
              Read all {TRUSTPILOT.reviews} reviews on Trustpilot
            </a>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.name} className="flex flex-col rounded-3xl border border-slate-200 p-6">
                <p className="mb-2 text-sm font-bold text-slate-900">{r.title}</p>
                <blockquote className="flex-1 text-sm leading-relaxed text-slate-600 line-clamp-6">{r.body}</blockquote>
                <figcaption className="mt-4 text-xs text-slate-500">{r.name}, {r.country} · {r.stars} of 5 stars · {r.date}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Free tools and learning */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-10 tracking-tight">Free tools and guides</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Calculator, title: "FBA calculator", body: "Paste an ASIN for Buy Box history, Amazon fees and profit at your cost.", href: "/tools/fba-calculator" },
              { icon: Calculator, title: "Profit and ROI calculator", body: "Type a price, cost and fees to get profit, margin, ROI and break-even.", href: "/tools/amazon-profit-calculator" },
              { icon: GraduationCap, title: "Free wholesale course", body: "The first steps of Amazon wholesale, in order, before you spend a dollar.", href: "/free-course" },
              { icon: FileText, title: "Wholesale software guide", body: "What wholesale software needs to do at each step, and how to compare tools.", href: "/amazon-wholesale-software" },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <Link key={t.href} href={t.href} className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-lg">
                  <Icon size={22} className="mb-4 text-brand" aria-hidden="true" />
                  <h3 className="mb-2 font-bold text-slate-900 group-hover:text-brand">{t.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{t.body}</p>
                </Link>
              );
            })}
          </div>
          <p className="mt-8 text-sm text-slate-600">
            Want hands-on help with your first month? <Link href="/apex-elite" className="font-semibold text-brand hover:underline">Apex Elite</Link> is a one-time paid starter package with three suppliers, 90 days of the software and first-week help from our team. It is separate from the free trial.
          </p>
        </div>
      </section>

      {/* 9. Questions */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-8 tracking-tight">Questions before you start</h2>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">
                  {f.q}
                  <span aria-hidden="true" className="text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 text-slate-600 leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Next step */}
      <section className="py-20 bg-brand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Try it on your next supplier list</h2>
          <p className="text-white/85 text-lg mb-8">{trialTerms("starter")}</p>
          <CheckoutLink href={TRIAL_CHECKOUT_URL} className="inline-flex items-center justify-center gap-2 bg-white text-brand px-10 py-4 rounded-2xl text-base font-black hover:shadow-2xl transition-all">
            <span data-cta="home-footer-trial">{trialCta}</span> <ArrowRight size={18} aria-hidden="true" />
          </CheckoutLink>
        </div>
      </section>
    </>
  );
}
