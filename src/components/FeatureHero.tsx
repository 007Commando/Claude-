import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import bullBlack from "../assets/bull-black.png.asset.json";
import bullBlue from "../assets/bull-blue.png.asset.json";
import bullGold from "../assets/bull-gold.png.asset.json";
import bullGreen from "../assets/bull-green.png.asset.json";
import bullRed from "../assets/bull-red.png.asset.json";
import { isBeta } from "../config/features";
import { moduleByKey, type ModuleKey } from "../config/product";

const BULL: Record<ModuleKey, string> = {
  black: bullBlack.url,
  blue: bullBlue.url,
  gold: bullGold.url,
  green: bullGreen.url,
  red: bullRed.url,
};

/** The module's own colour, used for its name only; the page styles its own button. */
const ACCENT: Record<ModuleKey, { text: string }> = {
  black: { text: "text-slate-900" },
  blue: { text: "text-blue-700" },
  gold: { text: "text-amber-700" },
  green: { text: "text-green-700" },
  red: { text: "text-red-700" },
};

/**
 * The top of a module page.
 *
 * Replaced 2026-10-07: each page opened on a centred slogan in giant italic
 * capitals ("HUNTING ALGORITHMS.", "PRICING REFLEXES.", "OPERATIONAL
 * DOMINANCE.") with the real heading shrunk to a tracked label above it. The
 * slogan told a visitor nothing, and the label that did was the smallest
 * thing on the screen. Now the plain name of the job is the headline, the
 * brand sits beside its bull, and a real screenshot of the app takes the
 * other half where the page has one.
 *
 * A server component with no animation, so the headline is the first thing
 * painted.
 */
export default function FeatureHero({
  module,
  intro,
  primary,
  image,
  note,
}: {
  module: ModuleKey;
  intro: ReactNode;
  /** The page's main button, already styled, usually its ViewAppButton. */
  primary: ReactNode;
  /** A real screenshot of the app. Leave it out rather than use concept art. */
  image?: { url: string; alt: string };
  /** One short line under the buttons, e.g. trial terms or a plan rule. */
  note?: ReactNode;
}) {
  const m = moduleByKey(module);
  const beta = isBeta(module);

  return (
    <section className="pb-16 pt-32 lg:pt-40">
      <div className={`mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:px-8 ${image ? "lg:grid-cols-[1fr_1.1fr]" : ""}`}>
        <div className={image ? "max-w-xl" : "max-w-3xl"}>
          <div className="mb-6 flex items-center gap-3">
            <img src={BULL[module]} alt="" className="h-8 w-auto" />
            <span className={`text-base font-bold ${ACCENT[module].text}`}>{m.name}</span>
            {beta && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                {module === "red" ? "Beta, by invitation" : "Beta"}
              </span>
            )}
          </div>
          <h1 className="mb-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 [text-wrap:balance] sm:text-5xl">
            {m.label}
          </h1>
          <div className="mb-8 text-lg leading-relaxed text-slate-600 sm:text-xl">{intro}</div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {primary}
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-bold text-slate-900 transition hover:border-slate-400"
            >
              See plans <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          {note && <p className="mt-4 text-sm text-slate-500">{note}</p>}
        </div>
        {image && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-24px_rgba(15,23,42,0.25)]">
            <img src={image.url} alt={image.alt} className="block h-auto w-full" fetchPriority="high" />
          </div>
        )}
      </div>
    </section>
  );
}
