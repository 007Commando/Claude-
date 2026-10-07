import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MODULES } from "../config/product";
import { TRIAL_DAYS, trialCta } from "../config/offer";

// Accuracy pass 2026-10-07: the line used to name four modules as "one suite"
// and left out Gold. It is now built from MODULES so beta modules are marked.
const liveNames = MODULES.filter((m) => m.status === "live").map((m) => m.name);
const betaNames = MODULES.filter((m) => m.status === "beta").map((m) => m.name);
const list = (names: string[]) =>
  names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0];

export default function BlogCta() {
  return (
    <div className="my-12 rounded-[28px] bg-brand p-8 sm:p-10 text-center">
      <div className="text-white/80 text-xs font-bold uppercase tracking-[0.2em] mb-3">
        Apex Applications
      </div>
      <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
        Ready to put this into practice?
      </h3>
      <p className="text-white/90 mb-7 max-w-lg mx-auto">
        {list(liveNames)} cover sourcing, purchasing, profit tracking and reviews. {list(betaNames)}{" "}
        are in beta, and Apex Red is by invitation. Start your {TRIAL_DAYS}-day trial: a card is required and nothing is charged
        until day {TRIAL_DAYS + 1}.
      </p>
      <Link
        href="/auth?mode=signup&plan=starter&period=monthly"
        className="inline-flex items-center justify-center gap-2 bg-white text-brand px-8 py-3.5 rounded-[16px] font-black text-sm shadow-lg hover:scale-[1.02] transition-all uppercase tracking-wide"
      >
        {trialCta} <ArrowRight size={16} />
      </Link>
    </div>
  );
}
