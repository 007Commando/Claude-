import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, Chrome, GraduationCap, Search } from "lucide-react";
import { pageMetadata } from "../../lib/seo";
import { absoluteUrl } from "../../config/site";

export const metadata: Metadata = pageMetadata({
  title: "Free Amazon Seller Tools | Apex",
  description:
    "Free tools for Amazon FBA sellers: look up any ASIN for fees, price history and profit, or work out margin, ROI and break-even price yourself.",
  path: "/tools",
});

const TOOLS = [
  {
    href: "/tools/fba-calculator",
    icon: Search,
    name: "Free Amazon FBA Calculator",
    body: "Paste an ASIN or Amazon link. See the Buy Box price against its 30, 60 and 90 day averages, the sales rank trend, every Amazon fee including inbound placement by region, a two-year seasonality chart, and your profit once you enter your cost.",
    cta: "Look up a product",
  },
  {
    href: "/tools/amazon-profit-calculator",
    icon: Calculator,
    name: "Amazon Profit, ROI and Break-Even Calculator",
    body: "Type your selling price, product cost and fees and get contribution profit, margin, ROI and the break-even selling price. No lookup and nothing to sign up for.",
    cta: "Work out a margin",
  },
];

const GUIDES = [
  { href: "/blog/amazon-fba-fees-explained", label: "Amazon FBA fees in 2026, with real numbers" },
  { href: "/ungating-guide", label: "How to get ungated on Amazon" },
  { href: "/amazon-wholesale-suppliers", label: "How to find and vet wholesale suppliers" },
  { href: "/amazon-fba-prep-centers", label: "How to choose an FBA prep center" },
  { href: "/blog/wholesale-profit-margins", label: "Realistic Amazon wholesale profit margins" },
];

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Free Amazon seller tools",
    url: absoluteUrl("/tools"),
    hasPart: TOOLS.map((tool) => ({ "@type": "WebApplication", name: tool.name, url: absoluteUrl(tool.href) })),
  };
  return (
    <div className="bg-white px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Free tools</p>
        <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-slate-900 lg:text-5xl">
          Free tools for Amazon FBA sellers
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-500">
          Check a product before you buy it. Both tools are free and the profit calculator needs no account at all.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-7 transition-all hover:border-blue-300 hover:shadow-[0_20px_50px_-24px_rgba(37,99,235,0.35)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <tool.icon size={20} />
              </span>
              <h2 className="mt-5 text-xl font-black tracking-tight text-slate-900">{tool.name}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{tool.body}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-blue-600 group-hover:gap-3 transition-all">
                {tool.cta} <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>

        {/* The Chrome extension is the Apex University graduation gift: the
          install link lives inside the course, so this page explains how to earn
          it rather than linking to the store. */}
        <section id="chrome-extension" className="mt-6 scroll-mt-28 rounded-3xl border border-slate-200 p-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Chrome size={20} />
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-black tracking-tight text-slate-900">Apex for Amazon Sellers, the Chrome extension</h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Free for Apex University graduates</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Your profit, ROI, Amazon fees, monthly sales and eligibility right on every Amazon listing, a badge on every
                search result, and the Amazon match for every barcode on a supplier&apos;s price list.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                It isn&apos;t sold. Finish all nine lessons in Apex University, the course inside every Apex account, and the
                install link unlocks at the end of the course.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href="https://app.apexapplications.io/university"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                >
                  <GraduationCap size={16} /> Start Apex University
                </a>
                <Link href="/pricing" className="inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:gap-3 transition-all">
                  New to Apex? See plans <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-3xl bg-slate-50 p-8">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Guides that go with them</h2>
          <ul className="mt-5 space-y-3">
            {GUIDES.map((guide) => (
              <li key={guide.href}>
                <Link href={guide.href} className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                  {guide.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 rounded-[2rem] bg-slate-950 px-8 py-12 text-center text-white">
          <h2 className="text-3xl font-black tracking-tight">Checking one product at a time gets slow.</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Apex runs the same checks on a supplier&apos;s whole price list and builds the purchase order for the products that clear your target.
          </p>
          <Link
            href="/amazon-wholesale-software"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-black uppercase tracking-wide text-slate-950 transition-transform hover:scale-[1.03]"
          >
            See how Apex works <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </div>
  );
}
