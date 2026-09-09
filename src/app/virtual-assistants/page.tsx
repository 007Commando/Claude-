import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardList, Clock, UserCheck, Users } from "lucide-react";

import {
  CheckList,
  Eyebrow,
  ProductFrame,
  Shell,
} from "../../components/landing/OfferKit";

import resourceLibrary from "../../assets/resource-library.png.asset.json";
import inventoryRestocking from "../../assets/inventory-restocking.png.asset.json";

export const metadata: Metadata = {
  title: "Apex Virtual Assistants — trained Amazon staff, not freelancers",
  description:
    "Professional Amazon-trained assistants, part time or full time, who install SOPs into your business. First 7 days free.",
  robots: { index: false, follow: false },
};

const CONTACT = "/contact-us";

const PLANS = [
  {
    name: "Part time",
    hours: "20 hours a week",
    best: "Sourcing support, catalogue upkeep, supplier follow-ups",
    points: [
      "Scans supplier catalogues and shortlists what clears margin",
      "Keeps your product database and costs current",
      "Chases distributor replies so accounts actually open",
    ],
  },
  {
    name: "Full time",
    hours: "40 hours a week",
    best: "Running the day-to-day so you work on the business",
    points: [
      "Owns sourcing, purchase orders and restock cycles end to end",
      "Manages prep centre and supplier communication",
      "Builds and maintains the SOPs your business runs on",
    ],
  },
];

export default function VirtualAssistantsPage() {
  return (
    <>
      <main className="bg-white">
        {/* ---------------- hero ---------------- */}
        <section className="overflow-hidden pb-16 pt-32 lg:pb-28 lg:pt-48">
          <Shell>
            <div className="items-center lg:grid lg:grid-cols-[1fr_1.2fr] lg:gap-16">
              <div className="max-w-2xl">
                <Eyebrow tone="emerald" icon={<Users size={14} />}>
                  New — Apex Virtual Assistants
                </Eyebrow>

                <h1 className="mb-8 text-5xl font-black leading-[1.05] tracking-tight text-slate-900 lg:text-6xl">
                  Stop gambling on freelancers.
                  <span className="block text-brand">
                    Hire Amazon professionals.
                  </span>
                </h1>

                <p className="mb-10 text-2xl font-medium leading-relaxed text-slate-500">
                  Upwork and Fiverr sell you hours. We place trained Amazon
                  wholesale staff who install the SOPs your business runs on —
                  so the process survives whoever is doing it.
                </p>

                <div className="flex flex-col gap-5 sm:flex-row">
                  <Link
                    href={CONTACT}
                    className="flex items-center justify-center gap-3 rounded-2xl bg-brand px-10 py-5 text-sm font-black uppercase tracking-widest text-white shadow-[0_20px_40px_rgba(35,135,186,0.3)] transition-all hover:scale-105 active:scale-95"
                  >
                    Start 7 days free <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="#plans"
                    className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-10 py-5 text-sm font-black uppercase tracking-widest text-slate-900 transition-all hover:bg-white hover:shadow-xl"
                  >
                    Compare plans
                  </Link>
                </div>

                <p className="mt-6 text-sm text-slate-500">
                  First 7 days free · Part time or full time · Competitive rates
                </p>
              </div>

              <div className="mt-24 lg:mt-0">
                <ProductFrame
                  src={inventoryRestocking.url}
                  alt="Restock dashboard an Apex assistant works from"
                />
              </div>
            </div>
          </Shell>
        </section>

        {/* ---------------- why not a freelancer ---------------- */}
        <section className="border-y border-slate-200 bg-white py-24">
          <Shell>
            <div className="items-center gap-20 lg:grid lg:grid-cols-[1fr_1.4fr]">
              <div>
                <Eyebrow tone="purple" icon={<UserCheck size={14} />}>
                  The difference
                </Eyebrow>
                <h2 className="mb-6 text-4xl font-extrabold text-slate-900">
                  A freelancer does tasks. A trained assistant builds a process.
                </h2>
                <p className="mb-8 text-lg leading-relaxed text-slate-600">
                  The problem with hourly marketplaces is not the price — it is
                  that nothing accumulates. Every hire starts from zero, and
                  when they leave, the knowledge leaves too. Our assistants
                  arrive knowing Amazon wholesale and write down how your
                  business runs as they go.
                </p>
                <CheckList
                  items={[
                    {
                      title: "Trained on Amazon wholesale before day one",
                      detail:
                        "Sourcing, ungating, purchase orders and prep — not general admin.",
                    },
                    {
                      title: "SOPs installed as they work",
                      detail:
                        "Your process gets documented, so it outlasts any single person.",
                    },
                    {
                      title: "Works inside your Apex account",
                      detail:
                        "Same catalogue, same numbers, with the permissions you set.",
                    },
                    {
                      title: "Competitive professional rates",
                      detail:
                        "Priced against the value of the work, not a bidding war.",
                    },
                  ]}
                />
              </div>
              <div className="mt-16 lg:mt-0">
                <ProductFrame
                  src={resourceLibrary.url}
                  alt="SOP and resource library"
                />
              </div>
            </div>
          </Shell>
        </section>

        {/* ---------------- plans ---------------- */}
        <section id="plans" className="bg-slate-50 py-24">
          <Shell>
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <Eyebrow tone="brand" icon={<Clock size={14} />}>
                Two ways to hire
              </Eyebrow>
              <h2 className="text-4xl font-extrabold text-slate-900">
                Part time or full time.
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Both start with 7 days free, so you can judge the work before
                you pay for it.
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.18)]"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-brand">
                    {plan.name}
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    {plan.hours}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{plan.best}</p>

                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.points.map((point) => (
                      <li key={point} className="flex gap-x-2.5 text-sm text-slate-700">
                        <ClipboardList className="mt-0.5 size-4 shrink-0 text-brand" />
                        {point}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={CONTACT}
                    className="mt-7 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02]"
                  >
                    Start 7 days free
                  </Link>
                </div>
              ))}
            </div>

            <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-slate-500">
              Rates are quoted on a short call once we know what you need
              covered.
            </p>
          </Shell>
        </section>

        {/* ---------------- close ---------------- */}
        <section className="bg-slate-900 py-24">
          <Shell>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-extrabold leading-tight text-white lg:text-5xl">
                Your first week costs nothing.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
                Tell us what is eating your week. We will place someone who
                already knows how to do it.
              </p>
              <Link
                href={CONTACT}
                className="mt-10 inline-flex items-center justify-center gap-3 rounded-2xl bg-brand px-10 py-5 text-sm font-black uppercase tracking-widest text-white shadow-[0_20px_40px_rgba(35,135,186,0.35)] transition-all hover:scale-105 active:scale-95"
              >
                Start 7 days free <ArrowRight size={18} />
              </Link>
            </div>
          </Shell>
        </section>
      </main>
    </>
  );
}
