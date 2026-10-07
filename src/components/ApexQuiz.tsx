"use client";

/**
 * /apex-quiz: the third ad funnel, and a different shape from the other two
 * (Stefano, 2026-10-07: "build the next funnel with a different style").
 * /apex-pop is a long page that sells a meeting, /apex-scan is a long page
 * built around a video. This one asks instead of tells: five one-tap
 * questions, one per screen, then the visitor's own result.
 *
 * Why a quiz for cold Meta traffic: answering costs nothing and feels like
 * progress, the result is about them rather than about Apex, and the answers
 * qualify the lead before anyone calls (they land in GHL as tags and a note).
 *
 * The result is unlocked with a name and an email, said plainly on the gate.
 * Every figure on the result screens is real: the Bilo Distributor scan in
 * the ads (12,203 lines, 2,860 profitable, 120 after one filter). Plan
 * mentions match the live pricing page.
 */

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Clock, Lock } from "lucide-react";

import { DOLLAR_WEEK, planById, formatPrice } from "../config/offer";
import { SIGNUP_PREFILL_KEY } from "../config/signupPrefill";
import { liveIdentify } from "../lib/live/client";
import { readStoredAttribution } from "./LeadAttribution";

const ORIGIN = "https://www.apexapplications.io";

type QuestionId = "stage" | "source" | "check" | "headache" | "budget";

const QUESTIONS: { id: QuestionId; title: string; options: string[] }[] = [
  {
    id: "stage",
    title: "Where are you on Amazon right now?",
    options: ["Not selling yet", "Selling, under $5k a month", "$5k to $50k a month", "Over $50k a month"],
  },
  {
    id: "source",
    title: "How do you find products to sell?",
    options: ["I haven't started sourcing", "Retail or online arbitrage", "Wholesale from distributors", "Private label"],
  },
  {
    id: "check",
    title: "How do you check a product is profitable before you buy?",
    options: ["Honestly, I mostly guess", "By hand, one product at a time", "A spreadsheet", "A tool like Keepa or SellerAmp"],
  },
  {
    id: "headache",
    title: "What's the biggest headache right now?",
    options: [
      "Finding suppliers who'll open an account",
      "Knowing what's actually profitable",
      "Restocking without running out",
      "Knowing my real profit",
    ],
  },
  {
    id: "budget",
    title: "How much do you have for inventory?",
    options: ["Under $1,000", "$1,000 to $5,000", "$5,000 to $25,000", "Over $25,000"],
  },
];

type ResultId = "starter" | "arbitrage" | "spreadsheet" | "scaler";

function resultFor(a: Partial<Record<QuestionId, string>>): ResultId {
  if (a.stage === QUESTIONS[0].options[0] || a.budget === QUESTIONS[4].options[0]) return "starter";
  const scaleHeadache = a.headache === QUESTIONS[3].options[2] || a.headache === QUESTIONS[3].options[3];
  if (a.stage === QUESTIONS[0].options[3] || (a.stage === QUESTIONS[0].options[2] && scaleHeadache)) return "scaler";
  if (a.source === QUESTIONS[1].options[1]) return "arbitrage";
  return "spreadsheet";
}

const RESULTS: Record<
  ResultId,
  { name: string; line: string; diagnosis: string; moves: string[]; proof: [string, string]; plan: string }
> = {
  starter: {
    name: "The Starter",
    line: "You're early, which is the best time to build it right.",
    diagnosis:
      "The fastest way to burn a first inventory budget is buying products that look good and don't make money after Amazon's fees. You need suppliers who will sell to you, and a way to see the profit before you order.",
    moves: [
      "Get 3 vetted U.S. wholesale suppliers, sent to you when you sign up",
      "Scan their price lists in Apex and see which products make money",
      "Build your first purchase order from the winners only",
    ],
    proof: ["2,860", "profitable products found in one supplier's price list"],
    plan: `Sellers under $5,000 a month usually start on Beginner, ${formatPrice(planById("beginner").monthly)} a month.`,
  },
  arbitrage: {
    name: "The Arbitrage Hunter",
    line: "You're good at finding deals. You're finding them one at a time.",
    diagnosis:
      "Arbitrage works, but every win has to be found again next week. Wholesale gives you the same winners to reorder every month, and one distributor's price list can hold thousands of products.",
    moves: [
      "Take one distributor's price list, the kind you'd never check by hand",
      "Let Apex check every line against Amazon's fees, Buy Box and monthly sales",
      "Keep the winners and reorder them every month",
    ],
    proof: ["12,203", "lines checked from one price list, 2,860 came back profitable"],
    plan: "Most sellers making the move to wholesale start on Starter or Plus.",
  },
  spreadsheet: {
    name: "The Spreadsheet Wholesaler",
    line: "Your sourcing works. Your spreadsheet is the bottleneck.",
    diagnosis:
      "You already buy wholesale, so the products are out there. The problem is time: checking lines by hand means you only ever look at a fraction of each catalog, and the winners hide in the rest.",
    moves: [
      "Drop in the price list you already have, no reformatting",
      "Filter by profit, ROI and sales rank in one step",
      "Turn the short list into a purchase order with your real costs",
    ],
    proof: ["12,203 → 120", "lines to a short list worth buying, with one filter"],
    plan: "Wholesalers at your size usually run Starter or Plus.",
  },
  scaler: {
    name: "The Scaler",
    line: "Sourcing isn't your problem. Leaks are.",
    diagnosis:
      "At your size the money goes missing in the gaps: products running out because restock came late, fees nobody added up, and prices that never move. You need one system where buying, restocking and profit read the same numbers.",
    moves: [
      "Restock flags before a winner runs out",
      "Profit and loss by product, after every Amazon fee",
      "The repricer on every listing, floored at your real break-even",
    ],
    proof: ["Every fee", "taken out, product by product, in your own P&L"],
    plan: `Sellers your size usually run Pro, ${formatPrice(planById("pro").monthly)} a month, which includes the repricer.`,
  },
};

export default function ApexQuiz() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(-1); // -1 intro, 0..4 questions, 5 gate, 6 result
  const [answers, setAnswers] = useState<Partial<Record<QuestionId, string>>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const result = resultFor(answers);
  const R = RESULTS[result];

  const utm = useMemo(() => {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    const landing = readStoredAttribution();
    return {
      utmSource: landing?.utmSource ?? params.get("utm_source") ?? landing?.source ?? "direct",
      utmMedium: params.get("utm_medium") ?? landing?.utmMedium ?? "website",
      utmCampaign: landing?.utmCampaign ?? params.get("utm_campaign") ?? "",
      utmContent: landing?.utmContent ?? params.get("utm_content") ?? "",
      utmTerm: landing?.utmTerm ?? params.get("utm_term") ?? "",
    };
  }, []);

  // Keyboard: 1-4 or A-D picks an option on a question screen.
  useEffect(() => {
    if (step < 0 || step > 4) return;
    const onKey = (e: KeyboardEvent) => {
      const i = "1234".indexOf(e.key) >= 0 ? "1234".indexOf(e.key) : "abcd".indexOf(e.key.toLowerCase());
      if (i >= 0 && !(e.target instanceof HTMLInputElement)) pick(QUESTIONS[step].options[i]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const pick = (option: string) => {
    const q = QUESTIONS[step];
    setAnswers((a) => ({ ...a, [q.id]: option }));
    // A beat so the tap registers before the screen moves on.
    window.setTimeout(() => setStep((s) => s + 1), reduce ? 0 : 260);
  };

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/quiz-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          result,
          selling: answers.stage !== QUESTIONS[0].options[0],
          answers: Object.fromEntries(QUESTIONS.map((q) => [q.title, answers[q.id] ?? ""])),
          ...utm,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      liveIdentify(email, name);
      (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.("track", "Lead", { content_name: "apex-quiz" });
      setStep(6);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const start = () => {
    try {
      sessionStorage.setItem(SIGNUP_PREFILL_KEY, JSON.stringify({ name, email }));
    } catch {}
    const u = utm as Record<string, string>;
    const q = `utm_source=${encodeURIComponent(u.utmSource ?? "")}&utm_medium=${encodeURIComponent(u.utmMedium ?? "")}&utm_campaign=${encodeURIComponent(u.utmCampaign ?? "")}`;
    window.location.href = `${ORIGIN}/auth?mode=signup&plan=${DOLLAR_WEEK.plan}&period=${DOLLAR_WEEK.period}&offer=${DOLLAR_WEEK.offer}&from=apex-quiz&${q}`;
  };

  const progress = step < 0 ? 0 : Math.min(1, (step + 1) / 6);
  const slide = reduce
    ? {}
    : { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 }, transition: { duration: 0.28 } };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-5">
        <img src="/assets/bull.png" alt="Apex Applications" width={40} height={31} />
        <span className="font-bold">Apex</span>
        {step >= 0 && step < 6 && (
          <div className="ml-auto flex w-40 items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <motion.div className="h-full rounded-full bg-blue-600" animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.4 }} />
            </div>
            <span className="text-xs tabular-nums text-slate-500">{Math.min(step + 1, 5)}/5</span>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-20">
        <AnimatePresence mode="wait">
          {step === -1 && (
            <motion.section key="intro" {...slide} className="pt-10 text-center sm:pt-16">
              <p className="text-sm font-semibold text-blue-600">60-second quiz for Amazon sellers</p>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                What kind of Amazon seller are you?
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-lg text-slate-600">
                Five quick questions. You get the one thing to fix first, and the plan sellers like you use.
              </p>
              <button
                onClick={() => setStep(0)}
                className="mt-9 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
              >
                Start the quiz <ArrowRight className="size-5" aria-hidden />
              </button>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-slate-500">
                <Clock className="size-4" aria-hidden /> Takes about a minute. No card needed for your result.
              </p>
              <div className="mx-auto mt-14 grid max-w-xl grid-cols-3 gap-3 text-left">
                {[
                  ["4", "seller types"],
                  ["12,203", "lines in the real scan we use as proof"],
                  ["$1", "to try what your result recommends"],
                ].map(([n, l]) => (
                  <div key={l} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-2xl font-extrabold text-blue-600">{n}</p>
                    <p className="mt-1 text-xs text-slate-500">{l}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {step >= 0 && step <= 4 && (
            <motion.section key={`q${step}`} {...slide} className="pt-8 sm:pt-14">
              <p className="text-sm font-semibold text-blue-600">Question {step + 1} of 5</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{QUESTIONS[step].title}</h2>
              <div className="mt-8 grid gap-3">
                {QUESTIONS[step].options.map((o, i) => {
                  const chosen = answers[QUESTIONS[step].id] === o;
                  return (
                    <motion.button
                      key={o}
                      onClick={() => pick(o)}
                      whileTap={reduce ? undefined : { scale: 0.98 }}
                      className={`flex items-center gap-4 rounded-2xl border-2 p-5 text-left text-lg font-semibold transition ${
                        chosen ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                          chosen ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {chosen ? <Check className="size-4" aria-hidden /> : "ABCD"[i]}
                      </span>
                      {o}
                    </motion.button>
                  );
                })}
              </div>
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="mt-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
                  <ArrowLeft className="size-4" aria-hidden /> Back
                </button>
              )}
            </motion.section>
          )}

          {step === 5 && (
            <motion.section key="gate" {...slide} className="pt-8 sm:pt-14">
              <p className="text-sm font-semibold text-blue-600">Your result is ready</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Where should we send your plan?</h2>
              <p className="mt-3 text-slate-600">
                Your result shows on the next screen, and we keep it on file so we can help you act on it. No card, no spam.
              </p>
              <form onSubmit={unlock} className="mt-8 grid gap-3">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className="rounded-2xl border-2 border-slate-200 px-5 py-4 text-lg outline-none focus:border-blue-600"
                />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  className="rounded-2xl border-2 border-slate-200 px-5 py-4 text-lg outline-none focus:border-blue-600"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone (optional, if you'd like a text)"
                  autoComplete="tel"
                  className="rounded-2xl border-2 border-slate-200 px-5 py-4 text-lg outline-none focus:border-blue-600"
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  disabled={busy}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-60"
                >
                  <Lock className="size-4" aria-hidden /> {busy ? "Unlocking…" : "Show my result"}
                </button>
                <p className="text-center text-xs text-slate-400">
                  By continuing you agree to our{" "}
                  <a href="/privacy" target="_blank" rel="noreferrer" className="underline">
                    privacy policy
                  </a>
                  .
                </p>
              </form>
            </motion.section>
          )}

          {step === 6 && (
            <motion.section key="result" {...slide} className="pt-8 sm:pt-12">
              <p className="text-sm font-semibold text-blue-600">Your result{name ? `, ${name.split(" ")[0]}` : ""}</p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{R.name}</h2>
              <p className="mt-3 text-xl font-semibold text-slate-700">{R.line}</p>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">{R.diagnosis}</p>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-semibold text-blue-600">What to fix first</p>
                <ol className="mt-4 space-y-3">
                  {R.moves.map((m, i) => (
                    <motion.li
                      key={m}
                      initial={reduce ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.12 }}
                      className="flex gap-3 text-lg"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        {i + 1}
                      </span>
                      {m}
                    </motion.li>
                  ))}
                </ol>
              </div>

              <div className="mt-4 flex items-center gap-5 rounded-2xl border border-blue-200 bg-blue-50/60 p-6">
                <p className="shrink-0 text-3xl font-extrabold text-blue-600">{R.proof[0]}</p>
                <p className="text-slate-600">
                  {R.proof[1]}. <span className="text-slate-400">One real catalog; yours will differ.</span>
                </p>
              </div>

              <p className="mt-6 text-slate-600">{R.plan}</p>

              <button
                onClick={start}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-5 text-lg font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
              >
                Try it for ${DOLLAR_WEEK.price} this week <ArrowRight className="size-5" aria-hidden />
              </button>
              <p className="mt-3 text-center text-sm text-slate-500">
                The full suite for {DOLLAR_WEEK.days} days. Cancel inside the week and we refund the dollar. Three vetted
                U.S. suppliers included.
              </p>

              <div className="mx-auto mt-12 max-w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-black">
                <video
                  className="aspect-[9/16] w-full"
                  src="/videos/apex-scan-vsl.mp4"
                  poster="/videos/apex-scan-vsl-poster.jpg"
                  controls
                  playsInline
                  preload="none"
                />
              </div>
              <p className="mt-3 text-center text-sm text-slate-500">See Apex scan a real price list, in 90 seconds.</p>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer className="mx-auto max-w-2xl px-4 pb-10 text-center text-xs text-slate-400">
        Results depend on your suppliers, your costs and Amazon. Supplier accounts and selling approvals are decided by
        the supplier and by Amazon. · © {new Date().getFullYear()} Apex Applications
      </footer>
    </div>
  );
}
