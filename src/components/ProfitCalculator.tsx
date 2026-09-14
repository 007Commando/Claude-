"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { fadeIn } from "./CompareShared";

/**
 * A profit calculator that works before you have an account.
 *
 * Two things it deliberately is not. It is not a lead form: nothing here is
 * captured, and the answer appears whether or not you ever click through. And
 * it does not pretend to know Amazon's fees — every fee is a field you fill in,
 * because a calculator that silently guesses a referral rate produces a number
 * a seller might place an order against.
 *
 * The model is simple on purpose and its limits are printed under the result
 * rather than buried: a proportional referral fee, no category minimums, no
 * returns, taxes or overhead unless you enter them as costs.
 */

/** The worked example from the spec: $8.50, 28.33%, 50%, $20.00 break-even. */
const DEFAULTS = {
  price: "30",
  cost: "12",
  referral: "15",
  fulfillment: "4",
  other: "1",
};

type Field = keyof typeof DEFAULTS;

const FIELDS: { key: Field; label: string; hint: string; prefix: string }[] = [
  { key: "price", label: "Selling price", hint: "What the listing sells for", prefix: "$" },
  { key: "cost", label: "Unit product cost", hint: "What you pay your supplier per unit", prefix: "$" },
  { key: "referral", label: "Referral fee", hint: "Amazon's percentage for the category", prefix: "%" },
  { key: "fulfillment", label: "Fulfillment fee", hint: "FBA fee per unit", prefix: "$" },
  { key: "other", label: "Other per-unit costs", hint: "Prep, inbound shipping, anything else", prefix: "$" },
];

type Result =
  | { ok: false; error: string }
  | {
      ok: true;
      profit: number;
      margin: number | null;
      roi: number | null;
      breakEven: number | null;
    };

/**
 * The arithmetic, kept separate from the rendering so the edge cases are
 * readable: every "undefined" below is a real division by zero, not a case
 * that got forgotten.
 */
export function calculate(input: Record<Field, string>): Result {
  const numbers = {} as Record<Field, number>;

  for (const { key, label } of FIELDS) {
    const raw = input[key].trim();
    if (raw === "") return { ok: false, error: `${label} is empty.` };

    const value = Number(raw);
    if (!Number.isFinite(value)) return { ok: false, error: `${label} is not a number.` };
    if (value < 0) return { ok: false, error: `${label} cannot be negative.` };
    numbers[key] = value;
  }

  // A referral fee of 100% or more leaves nothing to subtract costs from, and
  // the break-even formula divides by (1 − r).
  if (numbers.referral >= 100) {
    return { ok: false, error: "A referral fee of 100% or more leaves no revenue to work with." };
  }

  const rate = numbers.referral / 100;
  const costs = numbers.cost + numbers.fulfillment + numbers.other;
  const profit = numbers.price * (1 - rate) - costs;

  return {
    ok: true,
    profit,
    margin: numbers.price === 0 ? null : (profit / numbers.price) * 100,
    roi: costs === 0 ? null : (profit / costs) * 100,
    breakEven: costs / (1 - rate),
  };
}

const money = (value: number) =>
  `${value < 0 ? "−" : ""}$${Math.abs(value).toFixed(2)}`;

const percent = (value: number | null) =>
  value === null ? "—" : `${value < 0 ? "−" : ""}${Math.abs(value).toFixed(2)}%`;

function Figure({
  label,
  value,
  note,
  tone = "neutral",
}: {
  label: string;
  value: string;
  note: string;
  tone?: "neutral" | "good" | "bad";
}) {
  const colour =
    tone === "good" ? "text-emerald-600" : tone === "bad" ? "text-red-600" : "text-slate-900";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">{label}</p>
      <p className={`mt-1.5 text-3xl font-black tabular-nums tracking-tight ${colour}`}>{value}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{note}</p>
    </div>
  );
}

export default function ProfitCalculator() {
  const [input, setInput] = useState<Record<Field, string>>({ ...DEFAULTS });

  const result = useMemo(() => calculate(input), [input]);

  const set = (key: Field, value: string) =>
    setInput((previous) => ({ ...previous, [key]: value }));

  return (
    <main className="pt-32 pb-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <motion.header {...fadeIn} className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-5">
            Free tool · no account needed
          </p>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.05] mb-6">
            Check the economics before you place the order.
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            Enter your price, product cost and fee assumptions to estimate contribution profit,
            margin, ROI and the price you break even at. Every number below is one you control —
            this does not look up Amazon&apos;s live fees, and it never asks who you are.
          </p>
        </motion.header>

        <motion.div {...fadeIn} className="grid gap-8 lg:grid-cols-[22rem_1fr] items-start">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6 space-y-4">
            <p className="text-sm font-black text-slate-900">Your assumptions</p>

            {FIELDS.map(({ key, label, hint, prefix }) => (
              <label key={key} className="block">
                <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                  {label}
                </span>
                <span className="mt-1.5 flex items-center rounded-xl border border-slate-200 bg-white focus-within:border-blue-400">
                  <span className="pl-3 text-sm font-bold text-slate-400">{prefix}</span>
                  <input
                    // Typed rather than spun: a number input's scroll wheel
                    // silently changes a figure somebody is about to buy on.
                    type="text"
                    inputMode="decimal"
                    value={input[key]}
                    onChange={(event) => set(key, event.target.value)}
                    onFocus={(event) => event.target.select()}
                    className="w-full bg-transparent px-2 py-2.5 text-sm font-bold tabular-nums text-slate-900 outline-none"
                    aria-label={label}
                  />
                </span>
                <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>
              </label>
            ))}

            <button
              type="button"
              onClick={() => setInput({ ...DEFAULTS })}
              className="text-xs font-black uppercase tracking-wide text-blue-600 hover:text-blue-700"
            >
              Reset to the example
            </button>
          </div>

          <div className="space-y-4">
            {result.ok ? (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Figure
                    label="Contribution profit"
                    value={money(result.profit)}
                    note="Per unit, after the fees and costs you entered."
                    tone={result.profit > 0 ? "good" : result.profit < 0 ? "bad" : "neutral"}
                  />
                  <Figure
                    label="Contribution margin"
                    value={percent(result.margin)}
                    note={
                      result.margin === null
                        ? "Undefined at a selling price of zero."
                        : "Profit as a share of the selling price."
                    }
                  />
                  <Figure
                    label="Cost-based ROI"
                    value={percent(result.roi)}
                    note={
                      result.roi === null
                        ? "Undefined when product, fulfillment and other costs are all zero."
                        : "Profit divided by product + fulfillment + other costs. ROI conventions differ; this is the denominator used here."
                    }
                  />
                  <Figure
                    label="Break-even price"
                    value={result.breakEven === null ? "—" : money(result.breakEven)}
                    note="The selling price at which contribution profit reaches zero."
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3">
                    The formulas, in full
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-500 font-mono">
                    <li>profit = price × (1 − referral) − cost − fulfillment − other</li>
                    <li>margin = profit ÷ price</li>
                    <li>ROI = profit ÷ (cost + fulfillment + other)</li>
                    <li>break-even = (cost + fulfillment + other) ÷ (1 − referral)</li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
                <p className="text-sm font-bold text-amber-900">{result.error}</p>
                <p className="mt-1.5 text-xs text-amber-800/80">
                  Correct that field and the figures come back.
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">
                What this leaves out
              </p>
              <p className="text-xs leading-relaxed text-slate-500">
                These are not live Amazon fees — the model uses the assumptions you typed, and a
                proportional referral fee. It omits category minimum fees, non-linear fees,
                returns, storage, advertising, taxes and business overhead unless you fold them
                into &ldquo;other per-unit costs&rdquo;. A positive contribution profit does not
                mean the business is profitable. Check the current applicable fees before you buy.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          {...fadeIn}
          className="text-center rounded-[32px] border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-8 py-14"
        >
          <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-3">
            Stop typing the assumptions in
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto mb-8">
            Inside Apex these numbers come from your own account — your landed costs, your prep and
            shipping, the fees on your real listings — and they run across a whole supplier catalog
            instead of one product at a time.
          </p>
          <Link
            href="/auth?mode=signup"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 text-white px-10 py-4 font-black uppercase tracking-wide hover:scale-[1.03] transition-all"
          >
            Track these numbers in Apex <ArrowRight size={18} />
          </Link>
          <p className="text-xs text-slate-400 mt-6">
            See{" "}
            <Link href="/features/blue" className="underline hover:text-slate-600">
              Apex Blue
            </Link>{" "}
            for connected profit reporting,{" "}
            <Link href="/features/green" className="underline hover:text-slate-600">
              Apex Green
            </Link>{" "}
            for catalog analysis, or{" "}
            <Link href="/pricing" className="underline hover:text-slate-600">
              what a plan costs
            </Link>
            .
          </p>
        </motion.div>

        <motion.div {...fadeIn} className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 text-center">
            Questions people ask about this
          </h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-black text-slate-900 mb-1.5">Are these live Amazon fees?</p>
              <p className="text-sm leading-relaxed text-slate-500">
                No. This version calculates from the assumptions you enter. Check the current
                applicable fees for your category and product size before buying.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-black text-slate-900 mb-1.5">
                Does positive contribution mean my business is profitable?
              </p>
              <p className="text-sm leading-relaxed text-slate-500">
                No. Contribution profit is per unit and before the costs of running a business.
                Include overhead, returns, taxes, advertising and storage in your wider analysis.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-black text-slate-900 mb-1.5">Why is my ROI different elsewhere?</p>
              <p className="text-sm leading-relaxed text-slate-500">
                ROI conventions differ. This divides profit by product cost plus fulfillment plus
                other per-unit costs, and the denominator is printed beside the figure so you can
                compare like with like.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
