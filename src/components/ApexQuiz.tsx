"use client";

/**
 * /apex-quiz: the third ad funnel, and a different shape from the other two
 * (Stefano, 2026-10-07: "build the next funnel with a different style").
 * /apex-pop is a long page that sells a meeting, /apex-scan is a long page
 * built around a video. This one asks instead of tells: four one-tap
 * questions, one per screen, then the visitor's own result. The questions
 * and the tags they become live in lib/quizQuestions.ts.
 *
 * Why a quiz for cold Meta traffic: answering costs nothing and feels like
 * progress, the result is about them rather than about Apex, and the answers
 * qualify the lead before anyone calls (they land in GHL as tags and a note).
 *
 * The result is unlocked with a name and an email, said plainly on the gate.
 * Every figure on the result screens is real: one supplier catalog we scanned
 * (the Bilo Distributor scan in the ads: 12,203 lines, 2,860 profitable, 120
 * after one filter), a different example catalog from /apex-scan's. Plan
 * mentions match the live pricing page.
 */

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Clock, Lock } from "lucide-react";

import { DOLLAR_WEEK } from "../config/offer";
import { QUIZ_RESULTS as RESULTS, type QuizResultId as ResultId } from "../lib/quizResults";
import { LANDING_PREF_KEY, QUIZ_QUESTIONS, slugsFor, type QuizQuestionId } from "../lib/quizQuestions";
import { SIGNUP_PREFILL_KEY } from "../config/signupPrefill";
import { liveIdentify } from "../lib/live/client";
import { readStoredAttribution } from "./LeadAttribution";

const ORIGIN = "https://www.apexapplications.io";

type QuestionId = QuizQuestionId;

/**
 * Four questions, and the second depends on the first (Stefano, 2026-10-08).
 * Someone not selling yet skips the method question and is offered Apex
 * University instead: say yes and the course is the first thing they see
 * once their account is made. Everyone else says how they sell. The last
 * question sizes their inventory money, which matches them to suppliers with
 * the right minimum orders and marks the high-intent ones: $10,000 or more
 * makes a hot lead (a red star in Lead Desk, `hot-lead` in GHL).
 */
const flowFor = (a: Partial<Record<QuestionId, string>>): QuestionId[] =>
  a.stage === QUIZ_QUESTIONS.stage.options[0].label
    ? ["stage", "university", "headache", "budget"]
    : ["stage", "method", "headache", "budget"];

const QUESTION_COUNT = 4;

function resultFor(a: Partial<Record<QuestionId, string>>): ResultId {
  const s = slugsFor(a);
  if (s.stage === "not-selling" || s.budget === "under-1k") return "starter";
  const scaleHeadache = s.headache === "restocking" || s.headache === "real-profit";
  if (s.stage === "over-50k" || (s.stage === "5k-50k" && scaleHeadache) || s.method === "private-label") return "scaler";
  if (s.method === "arbitrage") return "arbitrage";
  return "spreadsheet";
}


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
  const flow = flowFor(answers);
  const Q = step >= 0 && step < QUESTION_COUNT ? QUIZ_QUESTIONS[flow[step]] : null;
  const wantsUniversity = slugsFor(answers).university === "yes";

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

  // Visitors from the Review Booster ads (Stefano, 2026-10-08) were promised free Review
  // Booster for answering, so the quiz says so; matched on the ad's campaign or ad name.
  const fromReviewBooster = useMemo(() => {
    const u = utm as Record<string, string>;
    const here = typeof window === "undefined" ? "" : decodeURIComponent(window.location.search);
    return /review.?booster|rbfree/i.test(`${u.utmCampaign ?? ""} ${u.utmContent ?? ""} ${here}`);
  }, [utm]);

  // Keyboard: 1-5 or A-E picks an option on a question screen.
  useEffect(() => {
    if (!Q) return;
    const onKey = (e: KeyboardEvent) => {
      const i = "12345".indexOf(e.key) >= 0 ? "12345".indexOf(e.key) : "abcde".indexOf(e.key.toLowerCase());
      const option = Q.options[i];
      if (i >= 0 && option && !(e.target instanceof HTMLInputElement)) pick(option.label);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const pick = (option: string) => {
    const id = flow[step];
    setAnswers((a) => {
      const next = { ...a, [id]: option };
      // Changing the first answer changes the route: drop the other branch's answer.
      if (id === "stage") delete next[next.stage === QUIZ_QUESTIONS.stage.options[0].label ? "method" : "university"];
      return next;
    });
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
          selling: slugsFor(answers).stage !== "not-selling",
          slugs: slugsFor(answers),
          answers: Object.fromEntries(flow.map((id) => [QUIZ_QUESTIONS[id].title, answers[id] ?? ""])),
          ...utm,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      liveIdentify(email, name);
      (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.("track", "Lead", { content_name: "apex-quiz" });
      setStep(QUESTION_COUNT + 1);
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
      // Read by sign-up and kept on the account; the app opens Apex University first.
      if (wantsUniversity) sessionStorage.setItem(LANDING_PREF_KEY, "university");
      else sessionStorage.removeItem(LANDING_PREF_KEY);
    } catch {}
    const u = utm as Record<string, string>;
    const q = `utm_source=${encodeURIComponent(u.utmSource ?? "")}&utm_medium=${encodeURIComponent(u.utmMedium ?? "")}&utm_campaign=${encodeURIComponent(u.utmCampaign ?? "")}`;
    window.location.href = `${ORIGIN}/auth?mode=signup&plan=${DOLLAR_WEEK.plan}&period=${DOLLAR_WEEK.period}&offer=${DOLLAR_WEEK.offer}&from=apex-quiz&${q}`;
  };

  const progress = step < 0 ? 0 : Math.min(1, (step + 1) / (QUESTION_COUNT + 1));
  const slide = reduce
    ? {}
    : { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 }, transition: { duration: 0.28 } };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-5">
        <img src="/assets/bull.png" alt="Apex Applications" width={40} height={31} />
        <span className="font-bold">Apex</span>
        {step >= 0 && step <= QUESTION_COUNT && (
          <div className="ml-auto flex w-40 items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <motion.div className="h-full rounded-full bg-blue-600" animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.4 }} />
            </div>
            <span className="text-xs tabular-nums text-slate-500">{Math.min(step + 1, QUESTION_COUNT)}/{QUESTION_COUNT}</span>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-20">
        <AnimatePresence mode="wait">
          {step === -1 && (
            <motion.section key="intro" {...slide} className="pt-10 text-center sm:pt-16">
              {fromReviewBooster && (
                <p className="mx-auto mb-6 max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-base font-semibold text-emerald-800">
                  Claim free Review Booster: 4 quick questions first.
                </p>
              )}
              <p className="text-sm font-semibold text-blue-600">60-second quiz for Amazon sellers</p>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                What kind of Amazon seller are you?
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-lg text-slate-600">
                Four quick questions. You get the one thing to fix first, and the plan we would suggest.
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
                  ["12,203", "lines in one supplier catalog we scanned"],
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

          {Q && (
            <motion.section key={`q${step}-${Q.id}`} {...slide} className="pt-8 sm:pt-14">
              <p className="text-sm font-semibold text-blue-600">Question {step + 1} of {QUESTION_COUNT}</p>
              {Q.note && <p className="mt-3 text-lg text-slate-600">{Q.note}</p>}
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{Q.title}</h2>
              <div className="mt-8 grid gap-3">
                {Q.options.map(({ label: o }, i) => {
                  const chosen = answers[Q.id] === o;
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
                        {chosen ? <Check className="size-4" aria-hidden /> : "ABCDE"[i]}
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

          {step === QUESTION_COUNT && (
            <motion.section key="gate" {...slide} className="pt-8 sm:pt-14">
              <p className="text-sm font-semibold text-blue-600">Your result is ready</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Where should we send your plan?</h2>
              <p className="mt-3 text-slate-600">
                Your result shows on the next screen, and we&rsquo;ll email you a copy with the steps. No card, no spam.
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

          {step === QUESTION_COUNT + 1 && (
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
                  {R.proof[1]}. <span className="text-slate-400">One supplier catalog we scanned (12,203 lines), an example and not a typical result; yours will differ.</span>
                </p>
              </div>

              {fromReviewBooster && (
                <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-slate-700">
                  <span className="font-semibold">Review Booster is free until October 31.</span> Once your account is
                  made and your Amazon store is connected, switch it on and every delivered order gets a review request.
                </p>
              )}

              {wantsUniversity && (
                <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-slate-700">
                  <span className="font-semibold">Apex University opens first.</span> Once your account is made, the free
                  Amazon wholesale course is the first thing you&rsquo;ll see.
                </p>
              )}

              <p className="mt-6 text-slate-600">{R.plan}</p>

              <button
                onClick={start}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-5 text-lg font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
              >
                Try it for ${DOLLAR_WEEK.price} this week <ArrowRight className="size-5" aria-hidden />
              </button>
              <p className="mt-3 text-center text-sm text-slate-500">
                The Plus plan for {DOLLAR_WEEK.days} days, with the repricer (beta) on 5 listings. Cancel inside the week
                and we refund the dollar. Three U.S. wholesale distributors from the Vault included.
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
              <p className="mt-3 text-center text-sm text-slate-500">Watch Apex scan a supplier price list.</p>
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
