"use client";

/**
 * /apex-scan: the second ad funnel, built on the structure of the best
 * performing software lander we studied (marketing-exports/funnels/
 * hyros-teardown.md, Stefano 2026-10-06). We took the order and the button
 * rhythm, never the words: promise, watch, act, the numbers, how it works,
 * act, see it, act, who it is for, act, objections.
 *
 * Every figure on it is real. The three result numbers are one actual
 * supplier catalog (PrimeWell, 1,175 lines) scanned in Apex, and say so. The
 * proof wall the original page has is deliberately absent until real,
 * permission-cleared customer quotes exist: an empty block is better than an
 * invented one.
 *
 * Every button goes to the same place, the Apex Pop qualifier, which starts
 * the $1 week. `from=apex-scan` and the stored landing attribution let the
 * Lead Desk tell this funnel apart from the Facebook and Reddit pages.
 */

import { type ReactNode, useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, Check, ChevronDown, Play } from "lucide-react";

import upcScanner from "../assets/upc-scanner.png.asset.json";
import { DOLLAR_WEEK } from "../config/offer";

const APPLY_HREF = "/apex-pop/start?from=apex-scan";

// One real scan: the PrimeWell catalog in Apex (see the PrimeWell catalog numbers memory).
const SCAN = { lines: 1175, profitable: 1081, share: 92, medianMargin: 17 };

/** Real days left in Q4 and to Black Friday, New York time. No invented deadline. */
function useDaysLeft() {
  const [days, setDays] = useState<{ q4: number; bf: number } | null>(null);
  useEffect(() => {
    const ny = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    const [y, m, d] = ny.split("-").map(Number);
    const today = Date.UTC(y, m - 1, d);
    const until = (mm: number, dd: number) => Math.max(0, Math.round((Date.UTC(y, mm - 1, dd) - today) / 86_400_000));
    setDays({ q4: until(12, 31) + 1, bf: until(11, 27) });
  }, []);
  return days;
}

/** Each block rises in once as it scrolls into view. Reduced motion: it is simply there. */
function Reveal({ children, className, id, delay = 0 }: { children: ReactNode; className?: string; id?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      id={id}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}

/** A figure that counts up from zero when it comes into view, keeping its commas and % sign. */
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const target = Number(value.replace(/[^0-9.]/g, ""));
  const suffix = value.replace(/[0-9.,]/g, "");
  const [shown, setShown] = useState(reduce ? target : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, target, { duration: 1.4, ease: "easeOut", onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, target]);
  return (
    <span ref={ref}>
      {shown.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

function Apply({ dark = false, label = `Start for $${DOLLAR_WEEK.price}` }: { dark?: boolean; label?: string }) {
  return (
    <a
      href={APPLY_HREF}
      className={`group relative flex w-full items-center overflow-hidden justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold transition ${
        dark ? "bg-white text-blue-700 hover:bg-blue-50" : "bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700"
      }`}
    >
      {!dark && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/25 motion-safe:animate-[scan-sheen_3.2s_ease-in-out_infinite]"
        />
      )}
      <span className="relative">{label}</span>
      <ArrowRight className="relative size-4 transition group-hover:translate-x-0.5" aria-hidden />
    </a>
  );
}

/** The line under every button: the one fact that answers "is this real?" right at the click. */
function UnderButton() {
  return (
    <p className="mt-3 text-center text-sm text-slate-500">
      {SCAN.profitable.toLocaleString("en-US")} of {SCAN.lines.toLocaleString("en-US")} products came back profitable in
      one real supplier catalog.
    </p>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold text-blue-600">{children}</p>;
}

const STEPS = [
  {
    title: "Drop in the price list you already have",
    body: "Any supplier's catalog, as a spreadsheet. No new suppliers, no reformatting row by row.",
  },
  {
    title: "Apex checks every line against Amazon",
    body: "The matching listing, Amazon's fees, who holds the Buy Box, how many sell a month, and your real profit at the supplier's cost.",
  },
  {
    title: "Buy the ones that make money",
    body: "Turn the winners into a purchase order, and every unit tracks through to your profit and loss.",
  },
];

const RESULTS = [
  "You stop buying products that lose money after fees",
  "A whole catalog in minutes, not a weekend in a spreadsheet",
  "Purchase orders built from the list, not from memory",
  "Your profit tracked from order to sale",
];

const FITS = [
  {
    id: "new",
    tab: "New sellers",
    title: "Your first profitable order",
    body: "You don't have suppliers yet, or you have one and don't know what to buy from it. Apex sends three vetted US wholesale distributors when you sign up, then shows you which of their products make money.",
    points: ["3 vetted US suppliers on sign-up", "Scan their catalogs line by line", "Build your first purchase order"],
  },
  {
    id: "wholesale",
    tab: "Wholesale sellers",
    title: "More winners from the same suppliers",
    body: "You already buy wholesale. Apex checks every line your suppliers send, not just the ones you had time to look at, and keeps your costs and orders in one place.",
    points: ["Whole-catalog scans", "Purchase orders and restock", "Profit and loss from your own store"],
  },
  {
    id: "team",
    tab: "Growing teams",
    title: "One system for buying, pricing and books",
    body: "Several suppliers, more than one person buying. Apex keeps the catalog scans, orders, repricing and profit in the same place, with seats for your team.",
    points: ["Authorised users for your team", "Repricer on every listing (Pro)", "Connect Apex to Claude or ChatGPT"],
  },
];

const FAQ = [
  {
    q: `What does the $${DOLLAR_WEEK.price} week include?`,
    a: `The full Apex suite for ${DOLLAR_WEEK.days} days for $${DOLLAR_WEEK.price}. Cancel inside the week and the dollar comes back. If you stay, it becomes the Plus plan at $${DOLLAR_WEEK.thenPrice} a month.`,
  },
  {
    q: "Do I need suppliers already?",
    a: "No. Three vetted US wholesale distributors are sent to you when you sign up, each with the person who approves new resellers.",
  },
  {
    q: "Is my Amazon account safe?",
    a: "Apex connects through Amazon's official Seller Central authorisation. It reads your data and never changes a listing unless you ask it to.",
  },
  {
    q: "How long does setup take?",
    a: "Minutes. Connect your Amazon account, drop in a price list, and the scan runs. We can also set it up with you on a call.",
  },
  {
    q: "Will every catalog be 92% profitable?",
    a: "No. That was one real supplier's catalog. Yours will differ, and that's the point: Apex tells you which lines are worth buying before you spend anything.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contract. Cancel from your account whenever you want.",
  },
];

export default function ApexScanFunnel() {
  const days = useDaysLeft();
  const [fit, setFit] = useState(FITS[0].id);
  const [open, setOpen] = useState<number | null>(0);
  const active = FITS.find((f) => f.id === fit) ?? FITS[0];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* 0. Real urgency: days left in the quarter, not a fake timer. */}
      <a href={APPLY_HREF} className="block bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white">
        {days ? (
          <>
            {days.q4} days left in Q4 · {days.bf > 0 ? `${days.bf} days to Black Friday` : "Black Friday is here"} · Start
            for ${DOLLAR_WEEK.price}
          </>
        ) : (
          <>Get your inventory in before the Q4 rush · Start for ${DOLLAR_WEEK.price}</>
        )}
      </a>

      <header className="mx-auto flex max-w-5xl items-center px-4 py-5">
        <img src="/assets/bull.png" alt="Apex Applications" width={44} height={34} />
        <span className="ml-2 text-lg font-bold">Apex</span>
      </header>

      <main className="mx-auto max-w-3xl px-4">
        {/* 1. Hero: the promise, the subline. */}
        <section className="pt-6 text-center">
          <Label>For Amazon wholesale sellers</Label>
          <h1 className="mt-4 font-extrabold tracking-tight text-4xl leading-tight sm:text-5xl">
            Same suppliers. Same budget.
            <br />
            <span className="relative inline-block text-blue-600">
              More products that actually make money.
              <motion.span
                aria-hidden
                className="absolute -bottom-1 left-0 h-1 w-full origin-left rounded-full bg-blue-200"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
          </h1>
          <p className="mt-5 text-lg text-slate-600">
            Apex checks every line of a supplier&rsquo;s price list against Amazon. ${DOLLAR_WEEK.price} for your first
            week, and the dollar comes back if you cancel inside it.
          </p>
        </section>

        {/* 2. The video, above the first button. */}
        <section className="mt-8">
          <p className="mb-2 text-center text-sm text-slate-500">
            <Play className="mr-1 inline size-3" aria-hidden />
            How it works. Press play for sound.
          </p>
          <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-xl shadow-blue-900/10">
            <video
              className="aspect-[9/16] w-full"
              src="/videos/apex-scan-vsl.mp4"
              poster="/videos/apex-scan-vsl-poster.jpg"
              controls
              playsInline
              preload="metadata"
            />
          </div>
        </section>

        {/* 3. Button #1, straight after the video. */}
        <Reveal className="mt-6">
          <Apply />
          <UnderButton />
        </Reveal>

        {/* 4 + 5. The numbers, from one real scan. */}
        <Reveal className="mt-16 text-center">
          <Label>One real supplier catalog, scanned in Apex</Label>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              [SCAN.lines.toLocaleString("en-US"), "lines checked against Amazon"],
              [`${SCAN.share}%`, "came back profitable"],
              [`${SCAN.medianMargin}%`, "median margin"],
            ].map(([n, label]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="font-extrabold tracking-tight text-4xl text-blue-600">
                  <CountUp value={n} />
                </p>
                <p className="mt-2 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-500">Your catalog will be different. Apex tells you how before you buy.</p>
        </Reveal>

        {/* 6. How it works, in three steps. */}
        <Reveal id="how" className="mt-16 scroll-mt-8">
          <Label>How it works</Label>
          <h2 className="mt-3 font-extrabold tracking-tight text-3xl">Three steps from price list to profit.</h2>
          <ol className="mt-6 space-y-3">
            {STEPS.map((s, i) => (
              <motion.li
                key={s.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <p className="text-sm font-semibold text-blue-600">Step {i + 1}</p>
                <p className="mt-1 text-lg font-semibold">{s.title}</p>
                <p className="mt-1 text-slate-500">{s.body}</p>
              </motion.li>
            ))}
          </ol>
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
            <p className="font-extrabold tracking-tight text-xl text-blue-600">The result:</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {RESULTS.map((r) => (
                <li key={r} className="flex gap-2 text-slate-600">
                  <Check className="mt-1 size-4 shrink-0 text-blue-600" aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <Label>Set up with you</Label>
            <p className="mt-2 text-slate-600">
              Want a hand? We&rsquo;ll set Apex up with you and run your first catalog together.
            </p>
          </div>
        </Reveal>

        {/* 7. Button #2. */}
        <Reveal className="mt-8">
          <Apply />
          <UnderButton />
        </Reveal>

        {/* 8. See it: the product's key moment. */}
        <Reveal className="mt-16">
          <Label>See it</Label>
          <h2 className="mt-3 font-extrabold tracking-tight text-3xl">The list you have, turned into the list you should buy.</h2>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <img src={upcScanner.url} alt="Apex scoring every line of a supplier catalog" className="w-full" />
          </div>
        </Reveal>

        {/* 9. The offer and the promise we actually keep, then button #3. */}
        <Reveal className="mt-16 rounded-2xl bg-blue-600 p-8 text-center text-white">
          <h2 className="font-extrabold tracking-tight text-3xl">Try it for ${DOLLAR_WEEK.price}. Not for you? Get the dollar back.</h2>
          <p className="mt-3">
            The full suite for {DOLLAR_WEEK.days} days, three vetted suppliers included. Cancel inside the week and we
            refund it.
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <Apply dark />
          </div>
        </Reveal>

        {/* 10. Who it's for, by stage: the tabbed block, with real fits instead of invented case studies. */}
        <Reveal className="mt-16">
          <Label>Who it&rsquo;s for</Label>
          <div className="mt-4 flex gap-2 overflow-x-auto" role="tablist">
            {FITS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={fit === f.id}
                onClick={() => setFit(f.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  fit === f.id ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f.tab}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-6" role="tabpanel">
            <h3 className="font-extrabold tracking-tight text-2xl">{active.title}</h3>
            <p className="mt-2 text-slate-600">{active.body}</p>
            <ul className="mt-4 space-y-2">
              {active.points.map((p) => (
                <li key={p} className="flex gap-2 text-slate-600">
                  <Check className="mt-1 size-4 shrink-0 text-blue-600" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* 11. Button #4, with a way back to the explanation for the not-yet-sure. */}
        <Reveal className="mt-12 space-y-3">
          <Apply />
          <a
            href="#how"
            className="flex w-full items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            See how it works
          </a>
        </Reveal>

        {/* 12. Objections. */}
        <Reveal className="mt-16">
          <h2 className="font-extrabold tracking-tight text-3xl">Questions, answered.</h2>
          <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200">
            {FAQ.map((f, i) => (
              <div key={f.q}>
                <button
                  className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  {f.q}
                  <ChevronDown className={`size-4 shrink-0 transition ${open === i ? "rotate-180" : ""}`} aria-hidden />
                </button>
                {open === i && <p className="px-5 pb-5 text-slate-500">{f.a}</p>}
              </div>
            ))}
          </div>
        </Reveal>
      </main>

      <footer className="mx-auto mt-20 max-w-3xl px-4 pb-12 text-center text-xs text-slate-500">
        <p>
          The scan figures are from one real supplier catalog and are not a forecast for yours. Results depend on your
          suppliers, your costs and Amazon. Supplier accounts and selling approvals are decided by the supplier and by
          Amazon.
        </p>
        <p className="mt-4">
          <a href="/privacy" className="underline" target="_blank" rel="noreferrer">
            Privacy
          </a>{" "}
          ·{" "}
          <a href="/terms" className="underline" target="_blank" rel="noreferrer">
            Terms
          </a>{" "}
          · © {new Date().getFullYear()} Apex Applications
        </p>
      </footer>
    </div>
  );
}
