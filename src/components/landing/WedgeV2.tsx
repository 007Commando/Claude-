import Link from "next/link";
import { ArrowRight, Store, Truck, Wrench } from "lucide-react";

/**
 * The argument the page has to win.
 *
 * Helium 10 and Jungle Scout are research tools built for private label. Neither
 * opens a distributor account for you, and no amount of keyword data does. This
 * section names that gap plainly rather than listing features and hoping the
 * visitor infers the difference.
 */
const PILLARS = [
  {
    icon: Wrench,
    eyebrow: "The software",
    title: "One workspace, not six tabs",
    body:
      "Scan a supplier catalogue, see what is profitable, build the purchase order, track the profit when it sells. Sourcing, purchasing and analytics connected — because in wholesale they are the same job.",
    href: "/features",
    cta: "Explore the suite",
  },
  {
    icon: Store,
    eyebrow: "The distributors",
    title: "389 accounts you can actually open",
    body:
      "Names, websites and the direct contact who approves resellers — not a scraped list. Three unlock the day your trial starts and three more every month you stay, so your catalogue keeps widening.",
    href: "/distributor-vault",
    cta: "See the vault",
  },
  {
    icon: Truck,
    eyebrow: "The logistics",
    title: "21 prep centres, member pricing",
    body:
      "Receive, inspect, label and ship into FBA without leasing a warehouse. Negotiated Apex rates and a copy-ready outreach email for every partner in the network.",
    href: "/prep-center-network",
    cta: "See the network",
  },
];

export default function WedgeV2() {
  return (
    <section className="bg-[#F7F9FC] px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2387ba]">
          Why wholesale sellers stall
        </p>
        <h2 className="mt-3 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0B1B2B] sm:text-4xl">
          A research tool cannot open a supplier account.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
          Most Amazon software is built for private label — find a keyword,
          launch a product. Wholesale is a different business: you need brands
          that will sell to you, somewhere to send the pallets, and honest
          numbers per unit. Apex is built for that, and ships all three.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-3">
        {PILLARS.map(({ icon: Icon, eyebrow, title, body, href, cta }) => (
          <div
            key={title}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 lg:p-7"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-[#EAF4FA] text-[#2387ba]">
              <Icon className="size-5" />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              {eyebrow}
            </p>
            <h3 className="mt-1.5 text-lg font-bold leading-snug text-[#0B1B2B]">
              {title}
            </h3>
            <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-600">
              {body}
            </p>
            <Link
              href={href}
              className="mt-5 inline-flex items-center gap-x-1.5 text-sm font-semibold text-[#2387ba] hover:gap-x-2.5"
            >
              {cta}
              <ArrowRight className="size-4 transition-all" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
