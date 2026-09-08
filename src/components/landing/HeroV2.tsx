import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";

const SIGNUP = "/auth?mode=signup&plan=starter&period=monthly";

/**
 * One promise, stated once.
 *
 * The live hero rotates through "Profit Analytics" / "Supplier Management" /
 * "APEX University", which means a visitor reads a different pitch depending on
 * when they land — and none of them says what Apex has that no competitor does.
 * Wholesale sellers do not fail for lack of a dashboard; they fail because they
 * cannot get supplier accounts. That is the wedge, so it is the headline.
 */
export default function HeroV2() {
  return (
    <section className="relative overflow-hidden bg-[#0B1B2B] px-5 pb-16 pt-28 text-white sm:px-8 lg:pb-24 lg:pt-36">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 size-[38rem] rounded-full bg-[#2387ba] opacity-25 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-x-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white/80 sm:text-sm">
          <ShieldCheck className="size-4" />
          Amazon Software Partner
        </span>

        <h1 className="mt-6 text-[2.25rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.75rem]">
          Everyone sells you the software.
          <span className="mt-2 block bg-gradient-to-r from-[#7CC6EE] to-[#2387ba] bg-clip-text text-transparent">
            We get you the suppliers.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
          Apex is the only platform built for Amazon <strong className="font-semibold text-white">wholesale</strong> —
          sourcing, purchasing and profit tracking in one workspace, plus the
          distributor accounts and prep centres you actually need to trade.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={SIGNUP}
            className="flex w-full items-center justify-center gap-x-2 rounded-xl bg-[#FFD34E] px-6 py-3.5 text-base font-semibold text-[#0B1B2B] transition-transform hover:-translate-y-0.5 sm:w-auto"
          >
            Start your 7-day free trial
            <ArrowRight className="size-5" />
          </Link>
          <Link
            href="/how-it-works"
            className="flex w-full items-center justify-center rounded-xl border border-white/20 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            See how it works
          </Link>
        </div>

        <ul className="mx-auto mt-7 flex max-w-lg flex-col items-center gap-2 text-sm text-white/60 sm:flex-row sm:justify-center sm:gap-x-5">
          {["3 distributor accounts free", "No card for the trial", "Cancel anytime"].map(
            (item) => (
              <li key={item} className="flex items-center gap-x-1.5">
                <Check className="size-4 text-[#7CC6EE]" />
                {item}
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  );
}
