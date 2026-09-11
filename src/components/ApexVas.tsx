"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, BadgeCheck, CalendarClock, Clock3, ShieldCheck, Users } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
} as const;

import {
  CARD_FEE_RATE,
  DAYS_PER_WEEK,
  FULL_TIME_RATE,
  FULL_TIME_WEEKLY_HOURS,
  MIN_WEEKLY_HOURS,
  PART_TIME_RATE,
  QUARTERLY_DISCOUNT,
  VAS,
  WEEKS_PER_MONTH,
  computeVaQuote,
  hourLabel,
  type VaProfile
} from "../lib/vaPricing";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

function SkillBar({ label, score, delay }: { label: string; score: number; delay: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-xs font-bold text-slate-500 tabular-nums">{score}/10</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${score >= 9 ? "bg-indigo-600" : "bg-blue-500"}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${score * 10}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut", delay }}
        />
      </div>
    </div>
  );
}

function VaCard({ va }: { va: VaProfile }) {
  const minDaily = Math.ceil(MIN_WEEKLY_HOURS / DAYS_PER_WEEK);
  const latestStart = va.windowEnd - minDaily;

  const [startHour, setStartHour] = useState(va.windowStart);
  const [endHour, setEndHour] = useState(va.windowEnd);
  const [quarterly, setQuarterly] = useState(false);

  const startOptions = useMemo(() => {
    const out = [];
    for (let h = va.windowStart; h <= latestStart; h++) out.push(h);
    return out;
  }, [va.windowStart, latestStart]);

  // The block is picked as start + end, so the hours are consecutive by
  // construction; the end options just refuse anything under the minimum.
  const endOptions = useMemo(() => {
    const out = [];
    for (let h = startHour + minDaily; h <= va.windowEnd; h++) out.push(h);
    return out;
  }, [startHour, minDaily, va.windowEnd]);

  const safeEnd = Math.min(Math.max(endHour, startHour + minDaily), va.windowEnd);
  // The same module the checkout route prices from, so the screen and the
  // charge cannot drift apart.
  const priced = computeVaQuote({ vaName: va.name, startHour, endHour: safeEnd, quarterly });
  if (!priced.ok) return null;
  const { dailyHours, weeklyHours, rate, monthlyCost, quarterlyCost, quarterlySavings } = priced.quote;

  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const startCheckout = async () => {
    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/va-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaName: va.name, startHour, endHour: safeEnd, quarterly })
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout could not be started");
      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout could not be started");
      setCheckingOut(false);
    }
  };

  const questionsHref = useMemo(() => {
    const subject = `Apex VA question — ${va.name}`;
    return `mailto:support@apexapplications.io?subject=${encodeURIComponent(subject)}`;
  }, [va.name]);

  return (
    <motion.div
      {...fadeIn}
      className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden lg:grid lg:grid-cols-2"
    >
      {/* Profile + skills */}
      <div className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-black">
            {va.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black tracking-tight text-slate-900">{va.name}</h3>
              {va.available ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-2.5 py-1">
                  <BadgeCheck className="w-3.5 h-3.5" /> Available now
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-1">
                  Fully booked
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm font-medium">{va.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          {va.skills.map((skill, i) => (
            <SkillBar key={skill.label} label={skill.label} score={skill.score} delay={i * 0.08} />
          ))}
        </div>

        <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
          <Clock3 className="w-4 h-4 text-slate-400 shrink-0" />
          Works {hourLabel(va.windowStart)} – {hourLabel(va.windowEnd)}, Monday to Friday
        </div>
      </div>

      {/* Schedule builder */}
      <div className="p-8 lg:p-10 bg-slate-50/60">
        <h4 className="font-black text-slate-900 tracking-tight text-lg mb-1">Build {va.name}&apos;s schedule</h4>
        <p className="text-sm text-slate-500 mb-6">
          One consecutive block each day, minimum {MIN_WEEKLY_HOURS} hours a week.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Start</span>
            <select
              value={startHour}
              onChange={(e) => {
                const next = Number(e.target.value);
                setStartHour(next);
                setEndHour((prev) => Math.min(Math.max(prev, next + minDaily), va.windowEnd));
              }}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900"
            >
              {startOptions.map((h) => (
                <option key={h} value={h}>{hourLabel(h)}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Finish</span>
            <select
              value={safeEnd}
              onChange={(e) => setEndHour(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900"
            >
              {endOptions.map((h) => (
                <option key={h} value={h}>{hourLabel(h)}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-6">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm text-slate-500">
              {dailyHours} hrs/day × {DAYS_PER_WEEK} days
            </span>
            <span className="text-sm font-bold text-slate-900">{weeklyHours} hrs/week</span>
          </div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm text-slate-500">Card processing</span>
            <span className="text-sm text-slate-500">4%</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-slate-500">{money(rate)}/hour{quarterly ? " (5% off)" : ""}</span>
            <span className="text-2xl font-black text-slate-900 tabular-nums">{money(monthlyCost)}<span className="text-sm font-semibold text-slate-400">/mo</span></span>
          </div>
          <p className="text-xs text-slate-400 mt-1 text-right">
            {quarterly ? `billed ${money(quarterlyCost)} per quarter` : "billed monthly"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setQuarterly(false)}
            className={`rounded-2xl border px-4 py-3.5 text-left transition-all ${
              !quarterly
                ? "border-slate-400 bg-white ring-1 ring-slate-300"
                : "border-slate-200 bg-white/60 hover:border-slate-300"
            }`}
          >
            <span className="block text-sm font-bold text-slate-700">Monthly</span>
            <span className="block text-xs text-slate-400 mt-0.5">standard rate</span>
          </button>
          <button
            type="button"
            onClick={() => setQuarterly(true)}
            className={`relative rounded-2xl px-4 py-3.5 text-left transition-all ${
              quarterly
                ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-400"
                : "border border-indigo-200 bg-indigo-50/50 hover:border-indigo-400 hover:shadow-md"
            }`}
          >
            <span className={`absolute -top-2.5 right-3 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
              quarterly ? "bg-amber-400 text-amber-950" : "bg-indigo-600 text-white"
            }`}>
              Smart choice
            </span>
            <span className={`block text-sm font-bold ${quarterly ? "text-white" : "text-indigo-700"}`}>
              Quarterly
            </span>
            <span className={`block text-xs mt-0.5 font-semibold ${quarterly ? "text-indigo-100" : "text-indigo-500"}`}>
              keep {money(quarterlySavings)} every quarter
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={startCheckout}
          disabled={checkingOut}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-wait transition-colors text-white font-bold px-6 py-4"
        >
          {checkingOut ? "Opening secure checkout…" : <>Hire {va.name} — checkout <ArrowRight className="w-4 h-4" /></>}
        </button>
        {checkoutError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-3">
            {checkoutError}
          </p>
        )}
        <p className="text-xs text-slate-400 text-center mt-3">
          Secure payment by Stripe. {va.name} starts within one business day of your first invoice —{" "}
          <a href={questionsHref} className="underline hover:text-slate-600">questions first?</a>
        </p>
      </div>
    </motion.div>
  );
}

export default function ApexVas() {
  const [checkoutResult, setCheckoutResult] = useState<"success" | "cancelled" | null>(null);

  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get("checkout");
    if (result === "success" || result === "cancelled") setCheckoutResult(result);
  }, []);

  return (
    <main className="bg-white">
      {checkoutResult && (
        <div
          className={`max-w-5xl mx-auto px-6 pt-8 ${checkoutResult === "success" ? "" : ""}`}
        >
          <p
            className={`rounded-2xl border px-5 py-4 text-sm font-semibold ${
              checkoutResult === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            {checkoutResult === "success"
              ? "You're in — payment received. We'll email you within one business day to kick off your VA's first week."
              : "Checkout was cancelled — your schedule is still configured below whenever you're ready."}
          </p>
        </div>
      )}
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-14 text-center">
        <motion.p {...fadeIn} className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 mb-4">
          Apex VAs
        </motion.p>
        <motion.h1 {...fadeIn} className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-5">
          A trained Amazon VA, working inside your Apex account
        </motion.h1>
        <motion.p {...fadeIn} className="text-lg text-slate-500 max-w-2xl mx-auto">
          Our VAs are trained on the full Apex suite — repricing, catalog management, product research and
          account health — so they're productive on day one, in the same software you already run.
        </motion.p>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 pb-14">
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { title: "Part-Time", hours: "20+ hrs / week", rate: PART_TIME_RATE, icon: CalendarClock, savings: null },
            {
              title: "Full-Time",
              hours: "40 hrs / week",
              rate: FULL_TIME_RATE,
              icon: Users,
              // $1.50/hr under the part-time rate: at 40 hrs that is real money.
              savings: (PART_TIME_RATE - FULL_TIME_RATE) * FULL_TIME_WEEKLY_HOURS * WEEKS_PER_MONTH
            }
          ].map((tier, i) => (
            <motion.div
              // key first: after a spread, React 19's JSX transform no longer
              // reliably treats it as the reconciliation key, which is what
              // produced the missing-key warning here.
              key={tier.title}
              {...fadeIn}
              transition={{ ...fadeIn.transition, delay: i * 0.1 }}
              className="rounded-3xl border border-slate-200 p-8"
            >
              <tier.icon className="w-8 h-8 text-indigo-600 mb-4" />
              <h2 className="text-xl font-black tracking-tight text-slate-900">{tier.title}</h2>
              <p className="text-sm text-slate-500 mb-4">{tier.hours}, Monday to Friday</p>
              <p className="text-4xl font-black text-slate-900">
                {money(tier.rate)}<span className="text-base font-semibold text-slate-400">/hour</span>
              </p>
              <p className="text-sm text-emerald-600 font-semibold mt-2">
                {money(tier.rate * (1 - QUARTERLY_DISCOUNT))}/hour paid quarterly (5% off)
              </p>
              {tier.savings && (
                <p className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-bold text-emerald-700">
                  {money(PART_TIME_RATE - FULL_TIME_RATE)}/hour less than part-time — going full-time keeps{" "}
                  {money(tier.savings)} in your pocket every month
                </p>
              )}
            </motion.div>
          ))}
        </div>
        <div className="flex items-start gap-2 mt-6 text-sm text-slate-500">
          <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <p>
            Two scheduling rules keep it simple: at least {MIN_WEEKLY_HOURS}{" "}hours a week, and each day&apos;s
            hours are one consecutive block — no split shifts.
          </p>
        </div>
      </section>

      {/* Roster */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <motion.h2 {...fadeIn} className="text-2xl font-black tracking-tight text-slate-900 mb-2">
          Available now
        </motion.h2>
        <motion.p {...fadeIn} className="text-slate-500 mb-8">
          Every VA lists real, tested skill scores — pick the profile that matches the work you need done.
        </motion.p>
        <div className="space-y-8">
          {VAS.map((va) => (
            <VaCard key={va.name} va={va} />
          ))}
        </div>
      </section>
    </main>
  );
}
