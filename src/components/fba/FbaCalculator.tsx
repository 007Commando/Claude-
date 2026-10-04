"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Calculator,
  CheckCircle2,
  ChevronDown,
  Loader2,
  PackageSearch,
  Receipt,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { extractAsin } from "../../lib/fba/asin";
import { FBA_FAQ } from "../../lib/fba/faq";
import type { FbaProduct, LookupResult } from "../../lib/fba/types";
import ResultView from "./ResultView";

const SAMPLES: { asin: string; label: string }[] = [
  { asin: "B01M5H13WQ", label: "Duct tape" },
  { asin: "B08MBF61DH", label: "Highlighters" },
  { asin: "B0F14NHR3Q", label: "Batting gloves" },
  { asin: "B000WMI6NY", label: "Candy" },
];

const SIGNUP = "/auth?mode=signup&utm_source=apex-site&utm_medium=free-tool&utm_campaign=fba-calculator";

const STEPS = ["Finding the listing", "Reading price and rank history", "Pricing the Amazon fees"];

const MESSAGES: Record<Exclude<LookupResult["status"], "found">, string> = {
  "not-found":
    "We do not have this product in our database yet. Check the ASIN against the Amazon listing, or try another one. Apex Green can pull any product you scan.",
  invalid: "That does not look like an ASIN. An ASIN is ten letters and numbers, like B01M5H13WQ. You can also paste a full Amazon product link.",
  busy: "You are looking things up fast. Give it a minute and try again.",
  error: "Something went wrong on our side. Try again in a moment.",
};

function Backdrop() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 78%)",
        }}
      />
      <motion.div
        animate={reduce ? undefined : { x: [0, 60, -20, 0], y: [0, 30, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"
      />
      <motion.div
        animate={reduce ? undefined : { x: [0, -50, 30, 0], y: [0, 40, 0, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-24 top-20 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl"
      />
      <motion.div
        animate={reduce ? undefined : { x: [0, 40, -30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/3 top-64 h-72 w-72 rounded-full bg-violet-400/15 blur-3xl"
      />
    </div>
  );
}

function Loading({ step }: { step: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.14)]"
      role="status"
      aria-live="polite"
    >
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <ul className="space-y-4">
        {STEPS.map((label, index) => {
          const done = index < step;
          const active = index === step;
          return (
            <li key={label} className="flex items-center gap-3 text-sm font-bold">
              {done ? (
                <CheckCircle2 size={18} className="text-emerald-500" />
              ) : active ? (
                <Loader2 size={18} className="animate-spin text-blue-600" />
              ) : (
                <span className="h-[18px] w-[18px] rounded-full border-2 border-slate-200" />
              )}
              <span className={done ? "text-slate-400" : active ? "text-slate-900" : "text-slate-300"}>{label}</span>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white">
      {FBA_FAQ.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="text-base font-black tracking-tight text-slate-900">{item.question}</span>
              <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {/* Always in the DOM so crawlers read every answer; collapsed by height only. */}
            <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-slate-600">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function FbaCalculator() {
  const [input, setInput] = useState("");
  const [state, setState] = useState<
    { kind: "idle" } | { kind: "loading"; asin: string } | { kind: "found"; product: FbaProduct } | { kind: "problem"; status: Exclude<LookupResult["status"], "found"> }
  >({ kind: "idle" });
  const [step, setStep] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const lookup = useCallback(async (raw: string) => {
    const asin = extractAsin(raw);
    if (!asin) {
      setState({ kind: "problem", status: "invalid" });
      return;
    }
    setInput(asin);
    setState({ kind: "loading", asin });
    setStep(0);
    clearTimers();
    timers.current = [setTimeout(() => setStep(1), 450), setTimeout(() => setStep(2), 1000)];

    // Hold the last step for a beat so a fast cached answer still reads as work done.
    const minimum = new Promise((resolve) => setTimeout(resolve, 1300));
    try {
      const [response] = await Promise.all([fetch(`/api/fba-calculator?asin=${asin}`), minimum]);
      const body = (await response.json().catch(() => ({}))) as { status?: string; product?: FbaProduct };
      clearTimers();
      if (response.ok && body.status === "found" && body.product) {
        setState({ kind: "found", product: body.product });
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      } else if (response.status === 404) setState({ kind: "problem", status: "not-found" });
      else if (response.status === 400) setState({ kind: "problem", status: "invalid" });
      else if (response.status === 429) setState({ kind: "problem", status: "busy" });
      else setState({ kind: "problem", status: "error" });
    } catch {
      clearTimers();
      setState({ kind: "problem", status: "error" });
    }
  }, []);

  // A shared link like /tools/fba-calculator?asin=B01M5H13WQ opens on that product.
  useEffect(() => {
    const asin = new URLSearchParams(window.location.search).get("asin");
    if (asin) void lookup(asin);
  }, [lookup]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void lookup(input);
  };

  const reset = () => {
    setState({ kind: "idle" });
    setInput("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const busy = state.kind === "loading";

  return (
    <main className="bg-white text-slate-900">
      {/* Hero and search */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white pb-16 pt-32 sm:pt-36">
        <Backdrop />
        <div className="relative mx-auto max-w-5xl px-5 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-blue-700"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
            </span>
            Free tool, no account needed
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.6 }}
            className="text-balance text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-6xl"
          >
            Free Amazon FBA Calculator
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.6 }}
            className="mx-auto mt-5 max-w-2xl text-balance text-lg leading-relaxed text-slate-600"
          >
            Paste an ASIN or an Amazon link. See the price history, sales rank, Amazon fees and what it costs to ship to FBA, then
            find out what you would actually keep.
          </motion.p>

          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.6 }}
            className="mx-auto mt-9 max-w-2xl"
          >
            <div className="flex flex-col gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-2.5 shadow-[0_24px_60px_-20px_rgba(37,99,235,0.35)] sm:flex-row">
              <label className="flex flex-1 items-center gap-3 px-4">
                <Search size={20} className="shrink-0 text-slate-400" />
                <span className="sr-only">ASIN or Amazon product link</span>
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Paste an ASIN or Amazon link"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full bg-transparent py-3.5 text-base font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-7 py-3.5 text-sm font-black uppercase tracking-wide text-white transition-all hover:bg-slate-800 disabled:opacity-60"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Calculator size={16} />}
                Calculate
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="font-bold text-slate-400">Try one:</span>
              {SAMPLES.map((sample) => (
                <button
                  key={sample.asin}
                  type="button"
                  disabled={busy}
                  onClick={() => void lookup(sample.asin)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-black text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </motion.form>

          {state.kind === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mx-auto mt-14 grid max-w-4xl gap-4 text-left sm:grid-cols-3"
            >
              {[
                { icon: <BarChart3 size={20} />, title: "Price and rank history", text: "Buy Box price against its 30, 60 and 90 day averages, and the sales rank trend." },
                { icon: <Receipt size={20} />, title: "Every Amazon fee", text: "Referral, FBA fulfillment and inbound placement, worked out for this exact product." },
                { icon: <Truck size={20} />, title: "Ship-to-FBA switch", text: "Compare East, Central and West and one, two or three warehouse splits." },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-white/80 p-5 backdrop-blur">
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">{item.icon}</span>
                  <p className="font-black tracking-tight text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.text}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Results */}
      <div ref={resultRef} className="scroll-mt-24">
        <AnimatePresence mode="wait">
          {state.kind === "loading" && (
            <div key="loading" className="mx-auto max-w-6xl px-5 py-12">
              <Loading step={step} />
            </div>
          )}
          {state.kind === "problem" && (
            <motion.div key="problem" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl px-5 py-12">
              <div className="mx-auto flex max-w-2xl items-start gap-4 rounded-3xl border border-amber-200 bg-amber-50/70 p-6">
                <PackageSearch className="mt-0.5 shrink-0 text-amber-600" size={22} />
                <div>
                  <p className="font-black text-slate-900">
                    {state.status === "not-found" ? "Product not found" : state.status === "invalid" ? "Check the ASIN" : "Could not look that up"}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{MESSAGES[state.status]}</p>
                  {state.status === "not-found" && (
                    <Link href={SIGNUP + "&utm_content=not-found"} className="mt-3 inline-flex items-center gap-1.5 text-sm font-black text-blue-600 hover:text-blue-700">
                      Open Apex free <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          {state.kind === "found" && (
            <div key={state.product.asin} className="mx-auto max-w-6xl px-5 py-12">
              <ResultView product={state.product} onReset={reset} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Sign-up band, directly under the research */}
      <section className="px-5 pb-20 pt-4">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-14 text-center text-white sm:px-12">
          <div aria-hidden className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-600/40 blur-3xl" />
          <div aria-hidden className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl" />
          <div className="relative">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-300">That was one product</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-balance text-3xl font-black tracking-tight sm:text-4xl">
              Now do it for your entire supplier catalog.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Upload a price list and Apex checks every product for profit, demand and competition, then builds the purchase order
              for the ones worth buying. Create a free account to start.
            </p>
            <Link
              href={SIGNUP + "&utm_content=band"}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-black uppercase tracking-wide text-slate-950 transition-transform hover:scale-[1.03]"
            >
              Create my free account <ArrowRight size={16} />
            </Link>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={14} /> Free to join. No card to look around.
            </p>
          </div>
        </div>
      </section>

      {/* SEO: what the fees are */}
      <section className="border-t border-slate-200 bg-slate-50 px-5 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-600">Understand your costs</p>
          <h2 className="mt-2 text-balance text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            How Amazon FBA fees work
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Amazon takes a few separate fees out of every FBA sale, and a product that looks profitable at the shelf price can lose
            money once they are added up. This is what each one is and what moves it.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {[
              {
                icon: <Receipt size={20} />,
                title: "Referral fee",
                text: "A percentage of the selling price that Amazon charges on every sale. Most categories are around 15 percent, some are lower or tiered by price, and most have a minimum of $0.30. It rises and falls with your price.",
              },
              {
                icon: <Boxes size={20} />,
                title: "FBA fulfillment fee",
                text: "Covers picking, packing and shipping the order to your customer. It is set by the product's size tier and shipping weight, and a lower fee applies to cheaper items, so the same product can cost different amounts at different prices.",
              },
              {
                icon: <Truck size={20} />,
                title: "Inbound placement fee",
                text: "Charged per unit when you send inventory to fewer Amazon warehouses than Amazon would choose. Letting Amazon split the shipment avoids it. Sending to one location is simpler but costs more, and the amount depends on size, weight and which region you ship to.",
              },
              {
                icon: <BarChart3 size={20} />,
                title: "Storage and other fees",
                text: "Monthly storage, long-term storage surcharges, returns processing and advertising come on top. This calculator leaves them out unless you add them as other costs, so build in a margin of safety.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">{item.icon}</span>
                <h3 className="text-lg font-black tracking-tight text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-16 text-balance text-3xl font-black tracking-tight text-slate-950">How to tell if a product is worth buying</h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-600">
            <p>
              Start with <b className="text-slate-900">profit after fees</b>, not the gap between your cost and the selling price. A
              healthy wholesale product usually clears at least 15 percent margin and a return on investment above 30 percent, because
              returns, storage and ads will take a share.
            </p>
            <p>
              Then check the <b className="text-slate-900">price history</b>. If today&apos;s Buy Box price sits well above its 90-day
              average, your profit may not last. If it sits well below, you may be looking at a temporary dip.
            </p>
            <p>
              Finally, read the <b className="text-slate-900">sales rank</b>. A lower rank means more sales. A rank that is improving
              across 30, 60 and 90 days means demand is growing, which is the best sign for a reorder.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-600">Questions</p>
          <h2 className="mb-8 mt-2 text-3xl font-black tracking-tight text-slate-950">Amazon FBA calculator FAQ</h2>
          <Faq />
          <p className="mt-8 text-center text-sm text-slate-500">
            Prefer to type every number yourself?{" "}
            <Link href="/tools/amazon-profit-calculator" className="font-black text-blue-600 hover:text-blue-700">
              Use the manual profit calculator
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
