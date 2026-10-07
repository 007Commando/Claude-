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

import { useEffect, useState } from "react";
import { ArrowRight, Check, ChevronDown, Play } from "lucide-react";

import upcScanner from "../assets/upc-scanner.png.asset.json";
import { DOLLAR_WEEK } from "../config/offer";

const APPLY_HREF = "/apex-pop/start?from=apex-scan";
const VIDEO_ID = "EClM6RcJ628"; // Stand-in: the catalog-to-purchase-order Short, until Stef's VSL is shot.

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

function Apply({ dark = false, label = `Start for $${DOLLAR_WEEK.price}` }: { dark?: boolean; label?: string }) {
  return (
    <a
      href={APPLY_HREF}
      className={`group flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold transition ${
        dark ? "bg-white text-slate-950 hover:bg-slate-100" : "bg-[#3ddc84] text-slate-950 hover:bg-[#5ce69a]"
      }`}
    >
      {label}
      <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
    </a>
  );
}

/** The line under every button: the one fact that answers "is this real?" right at the click. */
function UnderButton() {
  return (
    <p className="mt-3 text-center text-sm text-slate-400">
      {SCAN.profitable.toLocaleString("en-US")} of {SCAN.lines.toLocaleString("en-US")} products came back profitable in
      one real supplier catalog.
    </p>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs tracking-wider text-[#3ddc84]">{children}</p>;
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
    <div className="min-h-screen bg-[#0d0f12] text-slate-100">
      {/* 0. Real urgency: days left in the quarter, not a fake timer. */}
      <a href={APPLY_HREF} className="block bg-[#3ddc84] px-4 py-2 text-center text-sm font-semibold text-slate-950">
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
          <Label>FOR AMAZON WHOLESALE SELLERS</Label>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
            Same suppliers. Same budget.
            <br />
            <span className="text-[#3ddc84]">More products that actually make money.</span>
          </h1>
          <p className="mt-5 text-lg text-slate-300">
            Apex checks every line of a supplier&rsquo;s price list against Amazon. ${DOLLAR_WEEK.price} for your first
            week, and the dollar comes back if you cancel inside it.
          </p>
        </section>

        {/* 2. The video, above the first button. */}
        <section className="mt-8">
          <p className="mb-2 text-center font-mono text-xs text-slate-400">
            <Play className="mr-1 inline size-3" aria-hidden />
            How it works. Press play for sound.
          </p>
          <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
            <iframe
              className="size-full"
              src={`https://www.youtube.com/embed/${VIDEO_ID}?rel=0&modestbranding=1&playsinline=1`}
              title="Apex: from a supplier's price list to a purchase order"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        {/* 3. Button #1, straight after the video. */}
        <section className="mt-6">
          <Apply />
          <UnderButton />
        </section>

        {/* 4 + 5. The numbers, from one real scan. */}
        <section className="mt-16 text-center">
          <Label>ONE REAL SUPPLIER CATALOG, SCANNED IN APEX</Label>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              [SCAN.lines.toLocaleString("en-US"), "lines checked against Amazon"],
              [`${SCAN.share}%`, "came back profitable"],
              [`${SCAN.medianMargin}%`, "median margin"],
            ].map(([n, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <p className="font-serif text-4xl text-[#3ddc84]">{n}</p>
                <p className="mt-2 text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-400">Your catalog will be different. Apex tells you how before you buy.</p>
        </section>

        {/* 6. How it works, in three steps. */}
        <section id="how" className="mt-16 scroll-mt-8">
          <Label>HOW IT WORKS</Label>
          <h2 className="mt-3 font-serif text-3xl">Three steps from price list to profit.</h2>
          <ol className="mt-6 space-y-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="font-mono text-xs text-slate-500">STEP {i + 1}</p>
                <p className="mt-1 text-lg font-semibold">{s.title}</p>
                <p className="mt-1 text-slate-400">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-4 rounded-2xl border border-[#3ddc84]/40 p-5">
            <p className="font-serif text-xl text-[#3ddc84]">The result:</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {RESULTS.map((r) => (
                <li key={r} className="flex gap-2 text-slate-300">
                  <Check className="mt-1 size-4 shrink-0 text-[#3ddc84]" aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Label>SET UP WITH YOU</Label>
            <p className="mt-2 text-slate-300">
              Want a hand? We&rsquo;ll set Apex up with you and run your first catalog together.
            </p>
          </div>
        </section>

        {/* 7. Button #2. */}
        <section className="mt-8">
          <Apply />
          <UnderButton />
        </section>

        {/* 8. See it: the product's key moment. */}
        <section className="mt-16">
          <Label>SEE IT</Label>
          <h2 className="mt-3 font-serif text-3xl">The list you have, turned into the list you should buy.</h2>
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white">
            <img src={upcScanner.url} alt="Apex scoring every line of a supplier catalog" className="w-full" />
          </div>
        </section>

        {/* 9. The offer and the promise we actually keep, then button #3. */}
        <section className="mt-16 rounded-2xl bg-[#3ddc84] p-8 text-center text-slate-950">
          <h2 className="font-serif text-3xl">Try it for ${DOLLAR_WEEK.price}. Not for you? Get the dollar back.</h2>
          <p className="mt-3">
            The full suite for {DOLLAR_WEEK.days} days, three vetted suppliers included. Cancel inside the week and we
            refund it.
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <Apply dark />
          </div>
        </section>

        {/* 10. Who it's for, by stage: the tabbed block, with real fits instead of invented case studies. */}
        <section className="mt-16">
          <Label>WHO IT&rsquo;S FOR</Label>
          <div className="mt-4 flex gap-2 overflow-x-auto" role="tablist">
            {FITS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={fit === f.id}
                onClick={() => setFit(f.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  fit === f.id ? "bg-white text-slate-950" : "border border-white/15 text-slate-300 hover:bg-white/5"
                }`}
              >
                {f.tab}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6" role="tabpanel">
            <h3 className="font-serif text-2xl">{active.title}</h3>
            <p className="mt-2 text-slate-300">{active.body}</p>
            <ul className="mt-4 space-y-2">
              {active.points.map((p) => (
                <li key={p} className="flex gap-2 text-slate-300">
                  <Check className="mt-1 size-4 shrink-0 text-[#3ddc84]" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 11. Button #4, with a way back to the explanation for the not-yet-sure. */}
        <section className="mt-12 space-y-3">
          <Apply />
          <a
            href="#how"
            className="flex w-full items-center justify-center rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5"
          >
            See how it works
          </a>
        </section>

        {/* 12. Objections. */}
        <section className="mt-16">
          <h2 className="font-serif text-3xl">Questions, answered.</h2>
          <div className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10">
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
                {open === i && <p className="px-5 pb-5 text-slate-400">{f.a}</p>}
              </div>
            ))}
          </div>
        </section>
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
