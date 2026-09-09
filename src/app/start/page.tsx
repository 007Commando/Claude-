import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, PackageCheck, Search, Store } from "lucide-react";

import {
  CheckList,
  Eyebrow,
  ProductFrame,
  Shell,
} from "../../components/landing/OfferKit";

import purchaseOrders from "../../assets/purchase-orders.png.asset.json";
import vendorsDashboard from "../../assets/vendors-dashboard.png.asset.json";
import marketDatabase from "../../assets/market-database.png.asset.json";

export const metadata: Metadata = {
  title: "Start your Amazon wholesale business for $1 — Apex Applications",
  description:
    "Three authorized supplier accounts, the full Apex software suite, and an AI mentor that builds your first purchase order. Your first week for $1.",
  robots: { index: false, follow: false },
};

const SIGNUP = "/auth?mode=signup&plan=starter&period=monthly";

export default function StartPage() {
  return (
    <>
      <main className="bg-white">
        {/* ---------------- hero ---------------- */}
        <section className="overflow-hidden pb-16 pt-32 lg:pb-28 lg:pt-48">
          <Shell>
            <div className="items-center lg:grid lg:grid-cols-[1fr_1.2fr] lg:gap-16">
              <div className="max-w-2xl">
                <Eyebrow icon={<PackageCheck size={14} />}>
                  The $1 starter offer
                </Eyebrow>

                <h1 className="mb-8 text-5xl font-black leading-[1.05] tracking-tight text-slate-900 lg:text-6xl">
                  Three suppliers, the software, and your first PO written for
                  you. <span className="text-brand">For $1.</span>
                </h1>

                <p className="mb-10 text-2xl font-medium leading-relaxed text-slate-500">
                  Most people never place their first wholesale order because
                  they cannot get a supplier to reply. Start with three accounts
                  already open, and an AI mentor that turns them into a purchase
                  order.
                </p>

                <div className="flex flex-col gap-5 sm:flex-row">
                  <Link
                    href={SIGNUP}
                    className="flex items-center justify-center gap-3 rounded-2xl bg-brand px-10 py-5 text-sm font-black uppercase tracking-widest text-white shadow-[0_20px_40px_rgba(35,135,186,0.3)] transition-all hover:scale-105 active:scale-95"
                  >
                    Start for $1 <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-10 py-5 text-sm font-black uppercase tracking-widest text-slate-900 transition-all hover:bg-white hover:shadow-xl"
                  >
                    See how it works
                  </Link>
                </div>

                <p className="mt-6 text-sm text-slate-500">
                  Cancel any time during the trial. No long contract.
                </p>
              </div>

              <div className="mt-24 lg:mt-0">
                <ProductFrame
                  src={purchaseOrders.url}
                  alt="Purchase order with projected revenue, margin and ROI"
                />
              </div>
            </div>
          </Shell>
        </section>

        {/* ---------------- what the $1 buys ---------------- */}
        <section className="border-y border-slate-200 bg-white py-24">
          <Shell>
            <div className="items-center gap-20 lg:grid lg:grid-cols-[1fr_1.4fr]">
              <div>
                <Eyebrow tone="purple" icon={<Store size={14} />}>
                  What the dollar actually buys
                </Eyebrow>
                <h2 className="mb-6 text-4xl font-extrabold text-slate-900">
                  The part nobody else gives you: suppliers.
                </h2>
                <p className="mb-8 text-lg leading-relaxed text-slate-600">
                  Research tools tell you what to sell. None of them get a
                  distributor to open an account for you. Your first week
                  includes three authorized accounts with the direct contact who
                  approves resellers.
                </p>
                <CheckList
                  items={[
                    {
                      title: "3 authorized supplier accounts",
                      detail:
                        "Named contacts who approve resellers — not a scraped list of websites.",
                    },
                    {
                      title: "The full software suite",
                      detail:
                        "Sourcing, catalogue, purchase orders and profit analytics, all connected.",
                    },
                    {
                      title: "An AI mentor that writes the PO",
                      detail:
                        "It reads your catalogue and costs, then drafts the order for you to send.",
                    },
                    {
                      title: "Three more suppliers every month",
                      detail:
                        "Your catalogue keeps widening for as long as you stay.",
                    },
                  ]}
                />
              </div>
              <div className="mt-16 lg:mt-0">
                <ProductFrame
                  src={vendorsDashboard.url}
                  alt="Supplier management inside Apex"
                />
              </div>
            </div>
          </Shell>
        </section>

        {/* ---------------- the AI mentor ---------------- */}
        <section className="bg-slate-50 py-24">
          <Shell>
            <div className="items-center gap-20 lg:grid lg:grid-cols-[1.4fr_1fr]">
              <div className="order-2 mt-16 lg:order-1 lg:mt-0">
                <ProductFrame
                  src={marketDatabase.url}
                  alt="Product database showing profit and ROI per ASIN"
                />
              </div>
              <div className="order-1 lg:order-2">
                <Eyebrow tone="emerald" icon={<Bot size={14} />}>
                  Your first purchase order
                </Eyebrow>
                <h2 className="mb-6 text-4xl font-extrabold text-slate-900">
                  It does not just answer questions. It tells you what to buy.
                </h2>
                <p className="mb-8 text-lg leading-relaxed text-slate-600">
                  The mentor reads your own catalogue, costs and stock, then
                  hands you the next move with the numbers behind it — which
                  products clear margin, how many units, and which supplier to
                  send it to.
                </p>
                <CheckList
                  items={[
                    {
                      title: "Reads your real data",
                      detail:
                        "Your catalogue, your costs, your inventory — not generic advice.",
                    },
                    {
                      title: "Shows the working",
                      detail:
                        "Every recommendation carries the profit and ROI that justified it.",
                    },
                    {
                      title: "Ends in a purchase order",
                      detail:
                        "Step-by-step to a sent order, not a chat transcript.",
                    },
                  ]}
                />
              </div>
            </div>
          </Shell>
        </section>

        {/* ---------------- close ---------------- */}
        <section className="bg-slate-900 py-24">
          <Shell>
            <div className="mx-auto max-w-3xl text-center">
              <Eyebrow tone="brand" icon={<Search size={14} />}>
                Start today
              </Eyebrow>
              <h2 className="text-4xl font-extrabold leading-tight text-white lg:text-5xl">
                One dollar to find out whether wholesale works for you.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
                Suppliers, software and a mentor that writes the first order.
                Cancel before the week is out and that is all you pay.
              </p>
              <Link
                href={SIGNUP}
                className="mt-10 inline-flex items-center justify-center gap-3 rounded-2xl bg-brand px-10 py-5 text-sm font-black uppercase tracking-widest text-white shadow-[0_20px_40px_rgba(35,135,186,0.35)] transition-all hover:scale-105 active:scale-95"
              >
                Start for $1 <ArrowRight size={18} />
              </Link>
            </div>
          </Shell>
        </section>
      </main>
    </>
  );
}
