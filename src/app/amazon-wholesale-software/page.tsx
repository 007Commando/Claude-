import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { pageMetadata } from "../../lib/seo";
import { absoluteUrl } from "../../config/site";
import { COMPARISONS } from "../../data/comparisons";
import { HAND_BUILT, COMPARISON_COUNT } from "../../data/compareIndexCards";

/**
 * The page that owns "Amazon wholesale software".
 *
 * Nothing on the site targeted the phrase: the homepage never said it, and the
 * comparison pages each answered one rival. This page explains what wholesale
 * software has to do, maps each job to the Apex module that does it, and links
 * every comparison, so it is also the hub that gets those pages crawled.
 * Every capability named here is described on the module's own page; nothing
 * is claimed that the product page does not already say.
 */

export const metadata: Metadata = pageMetadata({
  title: "Amazon Wholesale Software: What You Need | Apex",
  description:
    "What Amazon wholesale software has to do, from scanning supplier price lists to purchase orders, repricing and profit, and how Apex covers each step.",
  path: "/amazon-wholesale-software",
});

const JOBS = [
  {
    job: "Find profitable products in a supplier's price list",
    body: "Wholesale starts with a spreadsheet from a distributor, often thousands of rows. Software has to match each UPC to its Amazon listing and show price, sales rank, fees and profit for every row, so you only look closely at the ones that work.",
    module: "Apex Green",
    href: "/features/green",
    points: ["Upload a whole price list and match every UPC to its ASIN", "Profit, ROI and sales rank per row", "Up to 100,000 UPCs an hour, with suppliers merged into one master catalog"],
  },
  {
    job: "Turn the shortlist into purchase orders",
    body: "Once you know what to buy, the order has to go to the supplier, the costs have to land in your books, and what arrives has to match what you paid for.",
    module: "Apex Blue",
    href: "/features/blue",
    points: ["Purchase orders built from the products you approved", "Supplier records and an inventory database", "Landed cost carried through to profit"],
  },
  {
    job: "Price to win the Buy Box without selling at a loss",
    body: "Wholesale listings are shared, so price moves constantly. A repricer for wholesale needs a floor worked out from your real cost and Amazon's fees, not a guess.",
    module: "Apex Gold",
    href: "/features/gold",
    points: ["Break-even floors from your real FBA fees", "Floors set by ROI, margin or dollar profit", "Dry-run previews and a full activity log"],
  },
  {
    job: "Know what you actually made",
    body: "Seller Central shows sales. A wholesale business needs profit after product cost, fees, freight and overhead, by day, week or month.",
    module: "Apex Blue",
    href: "/features/blue",
    points: ["A P&L statement by day, week or month", "Amazon fees deducted automatically", "Operating expenses recorded alongside"],
  },
  {
    job: "Get stock prepped and shipped to Amazon",
    body: "Most wholesale sellers use a prep center. The shipments, warehouses and prep bills belong in the same system as the orders that created them.",
    module: "Apex Red (beta)",
    href: "/features/red",
    points: ["Shipments, warehouses and inventory in one place", "Prep center coordination and billing", "Access to Apex's prep center network"],
  },
  {
    job: "Ask every buyer for a review",
    body: "Amazon's own Request a Review button is the safe way to ask for reviews. Doing it by hand on every order is the part nobody keeps up with.",
    module: "Apex Black",
    href: "/features/black",
    points: ["Amazon's review request sent on every eligible order, on a schedule", "A log of what was sent", "The seller dashboard and Apex University course"],
  },
];

const FAQ = [
  {
    question: "What is Amazon wholesale software?",
    answer:
      "Software that runs the wholesale loop: analysing supplier price lists to find profitable products, building purchase orders, repricing shared listings, tracking profit after every cost, and managing prep and shipments to FBA. Most sellers stitch several tools together; Apex puts the loop in one place.",
  },
  {
    question: "What is the best software for Amazon wholesale?",
    answer:
      "It depends on what you already use. If you only need one job done, a dedicated tool may suit you, and our comparison pages say where each rival is the better choice. If you want sourcing, purchase orders, repricing and profit in one system, that is what Apex is built for.",
  },
  {
    question: "How much does Apex cost?",
    answer: "The Starter plan is $149 a month and the Pro plan is $299 a month, and both start with a 7-day free trial.",
  },
  {
    question: "Can I check a product before signing up?",
    answer: "Yes. The free Amazon FBA calculator looks up any ASIN for fees, price history and profit, and the profit calculator works with no account at all.",
  },
];

export default function Page() {
  const comparisons = [
    ...HAND_BUILT.map((card) => ({ href: card.href, rival: card.rival, category: card.category })),
    ...COMPARISONS.map((c) => ({ href: `/compare/${c.slug}`, rival: c.rival, category: c.category })),
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Amazon wholesale software", item: absoluteUrl("/amazon-wholesale-software") },
    ],
  };

  return (
    <div className="bg-white px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Amazon wholesale software</p>
        <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-slate-900 lg:text-5xl">
          What Amazon wholesale software needs to do
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-600">
          Amazon wholesale is a loop: find products in a supplier&apos;s price list, buy them, price them, ship them to Amazon,
          and see what you made. Each step can be its own subscription, and most sellers end up copying numbers between them.
          Here is what software for wholesale has to handle, and how Apex does each part.
        </p>

        <div className="mt-14 space-y-6">
          {JOBS.map((item, index) => (
            <section key={item.job} className="rounded-3xl border border-slate-200 p-7">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Step {index + 1}</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">{item.job}</h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">{item.body}</p>
              <ul className="mt-5 space-y-2">
                {item.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                    <Check size={15} className="mt-0.5 shrink-0 text-blue-600" strokeWidth={3} />
                    {point}
                  </li>
                ))}
              </ul>
              <Link href={item.href} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:gap-3 transition-all">
                How {item.module} does it <ArrowRight size={15} />
              </Link>
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-3xl bg-slate-50 p-7">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Suppliers to start with</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Software does not help without someone to buy from. Every Apex trial comes with three authorized US distributors from
            the Distributor Vault, with three more each full month you stay.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold">
            <Link href="/distributor-vault" className="text-blue-600 hover:underline">The Distributor Vault</Link>
            <Link href="/amazon-wholesale-suppliers" className="text-blue-600 hover:underline">How to vet a wholesale supplier</Link>
            <Link href="/ungating-guide" className="text-blue-600 hover:underline">Getting ungated</Link>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">How Apex compares</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
            {COMPARISON_COUNT} side-by-side comparisons with the tools wholesale sellers use most. Each one says where the other
            tool is the better choice.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {comparisons.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-5 py-4 transition-colors hover:border-blue-300 hover:bg-slate-50"
                >
                  <span>
                    <span className="block font-black text-slate-900">Apex vs {c.rival}</span>
                    <span className="block text-xs text-slate-500">{c.category}</span>
                  </span>
                  <ArrowRight size={16} className="shrink-0 text-slate-300" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Questions sellers ask</h2>
          <div className="mt-6 space-y-4">
            {FAQ.map((item) => (
              <div key={item.question} className="rounded-2xl border border-slate-200 p-5">
                <h3 className="text-base font-black text-slate-900">{item.question}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] bg-slate-950 px-8 py-12 text-center text-white">
          <h2 className="text-3xl font-black tracking-tight">Try the whole loop free for 7 days.</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Bring a supplier price list and see which products are worth buying before you spend anything.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-black uppercase tracking-wide text-slate-950 transition-transform hover:scale-[1.03]"
            >
              See plans <ArrowRight size={16} />
            </Link>
            <Link href="/tools/fba-calculator" className="text-sm font-black text-slate-300 hover:text-white">
              Or try the free FBA calculator
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
