import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const SIGNUP = "/auth?mode=signup&plan=starter&period=monthly";

/**
 * $149.99 is a real objection, so the page answers it rather than hiding the
 * number in a footnote. The prep-centre saving is the site's own published
 * figure; the arithmetic below is stated as a comparison, not a promise of
 * earnings.
 */
const INCLUDED = [
  "All five tools — sourcing, suppliers, purchasing, analytics, learning",
  "3 distributor accounts on day one, 3 more every month you stay",
  "Prep centre network at negotiated member pricing",
  "Apex University and the wholesale playbooks",
  "AI Concierge that reads your own inventory and pricing",
];

export default function PricingV2() {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2387ba]">
          Pricing
        </p>
        <h2 className="mt-3 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0B1B2B] sm:text-4xl">
          One membership. Everything in it.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
          No per-seat pricing, no add-on tiers for the parts that matter.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_48px_-20px_rgba(11,27,43,0.25)]">
        <div className="bg-[#0B1B2B] px-7 py-8 text-center text-white">
          <p className="text-sm font-medium text-white/70">Apex membership</p>
          <p className="mt-2">
            <span className="text-5xl font-bold tracking-tight">$149.99</span>
            <span className="ml-1 text-white/60">/month</span>
          </p>
          <p className="mt-2 text-sm text-white/60">
            7 days free · no card required to start
          </p>
        </div>

        <div className="px-7 py-7">
          <ul className="space-y-3">
            {INCLUDED.map((item) => (
              <li key={item} className="flex gap-x-2.5 text-sm text-slate-700">
                <Check className="mt-0.5 size-4 shrink-0 text-[#2387ba]" />
                {item}
              </li>
            ))}
          </ul>

          <Link
            href={SIGNUP}
            className="mt-7 flex items-center justify-center gap-x-2 rounded-xl bg-[#FFD34E] px-6 py-3.5 text-base font-semibold text-[#0B1B2B] transition-transform hover:-translate-y-0.5"
          >
            Start free trial
            <ArrowRight className="size-5" />
          </Link>

          <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
            Members report saving $4,800–6,000 a year on prep alone. Individual
            results vary — this is a comparison of published rates, not a
            forecast of your business.
          </p>
        </div>
      </div>
    </section>
  );
}
