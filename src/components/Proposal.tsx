"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, GraduationCap, Rocket, Search, ShoppingCart, TrendingUp } from "lucide-react";

const CALENDLY_URL = "https://calendly.com/apexapplications-info/new-meeting";

type Slide = {
  eyebrow: string;
  headline: React.ReactNode;
  body?: string;
  hint?: string;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "The Apex System",
    headline: (
      <>
        Turn distributor price lists into{" "}
        <span className="bg-brand text-white px-2">predictable Amazon profit.</span>
      </>
    ),
    hint: "Press the arrow to see how it works →",
  },
  {
    eyebrow: "The Problem",
    headline: "Most wholesale sellers still source one UPC at a time.",
    body:
      "Copy a code, paste it, check the fees, check the Buy Box, repeat 4,000 times. The catalog wins by exhaustion — and the profitable items stay buried.",
  },
  {
    eyebrow: "Step 1 — Scan",
    headline: (
      <>
        Upload the whole catalog. Apex scans every line against{" "}
        <span className="bg-brand text-white px-2">122M+ Amazon products.</span>
      </>
    ),
    body:
      "ROI, fees, sales rank and Buy Box data on every match — the winners float to the top instead of hiding in row 3,817.",
  },
  {
    eyebrow: "Step 2 — Buy",
    headline: "Purchase orders, landed costs and cashflow in the same place you sourced.",
    body:
      "Every PO shows gross profit, ROI and profit per sale before you commit a dollar — and your P&L tracks it after.",
  },
  {
    eyebrow: "Step 3 — Sell",
    headline: (
      <>
        The Apex Gold repricer bids the Buy Box for you —{" "}
        <span className="bg-brand text-white px-2">with a floor you set.</span>
      </>
    ),
    body: "Win the rotation without racing to the bottom.",
  },
  {
    eyebrow: "Step 4 — People",
    headline: "You're not handed a login and left alone.",
    body:
      "White-glove onboarding gets the system installed around your business — and when you want hands, our virtual assistants with 9+ years of Amazon experience run the daily work inside it.",
  },
  {
    eyebrow: "The Call",
    headline: "20 minutes. We look at how you source today and show you exactly what Apex changes.",
    body: "If it's not a fit, we'll tell you that too. Book below ↓",
  },
];

type Segment = "beginner" | "established";
type Problem = "learn-the-business" | "find-suppliers" | "place-first-order";

const PROBLEMS: { id: Problem; label: string; icon: typeof GraduationCap }[] = [
  { id: "learn-the-business", label: "Learn the Business", icon: GraduationCap },
  { id: "find-suppliers", label: "Find Suppliers", icon: Search },
  { id: "place-first-order", label: "Place Your First Order", icon: ShoppingCart },
];

/**
 * The booked call must carry both the ad that paid for the click and the
 * quiz answers, so forward the page's utm_* params to Calendly untouched
 * and pack the qualification into utm_term (the one slot ads don't use).
 */
function buildCalendlyUrl(segment: Segment, problem: Problem | null) {
  const url = new URL(CALENDLY_URL);
  const incoming = new URLSearchParams(window.location.search);
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
    const value = incoming.get(key);
    if (value) url.searchParams.set(key, value);
  }
  url.searchParams.set("utm_term", problem ? `${segment}-${problem}` : segment);
  return url.toString();
}

export default function Proposal() {
  const [index, setIndex] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);
  const [segment, setSegment] = useState<Segment | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const quizRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const last = SLIDES.length - 1;

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => Math.min(last, Math.max(0, i + delta)));
    },
    [last],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Right") go(1);
      if (e.key === "ArrowLeft" || e.key === "Left") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const openQuiz = () => {
    setQuizOpen(true);
    requestAnimationFrame(() => quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const pickSegment = (s: Segment) => {
    setSegment(s);
    if (s === "established") setProblem(null);
    requestAnimationFrame(() => bookRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  const readyToBook = segment === "established" || (segment === "beginner" && problem !== null);

  const trackSchedule = () => {
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
    fbq?.("track", "Schedule");
  };

  const slide = SLIDES[index];

  return (
    <div className="pt-20 bg-white">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-brand">
          Only for Amazon sellers doing $10k+/month.
        </h1>
        <p className="mt-4 text-lg text-slate-700 font-medium">
          Click through the slides below to see how the Apex system works:
        </p>

        {/* Slide deck */}
        <div className="mt-8 border-4 border-slate-900 rounded-md overflow-hidden text-left shadow-[8px_8px_0_0_rgba(15,23,42,0.15)]">
          <div className="relative bg-white min-h-[340px] sm:min-h-[380px] flex flex-col justify-center px-6 sm:px-12 py-12">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand mb-4">
              {slide.eyebrow}
            </p>
            <h2 className="text-2xl sm:text-[1.9rem] leading-snug font-extrabold text-slate-900 [&>span]:box-decoration-clone">
              {slide.headline}
            </h2>
            {slide.body && <p className="mt-5 text-base sm:text-lg text-slate-600">{slide.body}</p>}
            {slide.hint && <p className="mt-8 text-sm text-slate-400 font-medium">{slide.hint}</p>}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={index === 0}
                aria-label="Previous slide"
                className="w-9 h-9 rounded flex items-center justify-center text-xl font-bold hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                ‹
              </button>
              <span className="text-sm font-bold tabular-nums">
                {index + 1} / {SLIDES.length}
              </span>
              <button
                type="button"
                onClick={() => go(1)}
                disabled={index === last}
                aria-label="Next slide"
                className="w-9 h-9 rounded flex items-center justify-center text-xl font-bold hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                ›
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              {SLIDES.map((s, i) => (
                <button
                  key={s.eyebrow}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="mt-10 text-lg sm:text-xl text-slate-800 font-semibold">
          If you sell on Amazon and want more consistent, scalable wholesale profit, click the
          button below and book a call on the next page:
        </p>

        {!quizOpen && (
          <button
            type="button"
            onClick={openQuiz}
            className="mt-8 inline-block w-full sm:w-auto bg-brand text-white text-lg sm:text-xl font-black uppercase tracking-wide px-12 py-5 rounded-md shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all"
          >
            Schedule a Call Here
          </button>
        )}

        {/* Qualifier — expands in place of the button */}
        {quizOpen && (
          <div ref={quizRef} className="mt-10 text-left scroll-mt-28">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Are you currently selling, or getting started?
            </h3>
            <p className="mt-1 text-slate-500">Tap the card that fits you best.</p>

            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => pickSegment("beginner")}
                className={`relative flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
                  segment === "beginner"
                    ? "border-brand bg-brand/5 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span
                  className={`flex w-12 h-12 shrink-0 items-center justify-center rounded-xl ${
                    segment === "beginner" ? "bg-brand text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Rocket className="w-6 h-6" />
                </span>
                <span className="pr-8">
                  <span className="block text-lg font-extrabold text-slate-900">
                    I&apos;m a complete beginner
                  </span>
                  <span className="mt-1 block text-slate-500">
                    New to Amazon and ready to begin the right way.
                  </span>
                </span>
                <span
                  className={`absolute top-4 right-4 flex w-6 h-6 items-center justify-center rounded-full border-2 ${
                    segment === "beginner" ? "border-brand bg-brand text-white" : "border-slate-300"
                  }`}
                >
                  {segment === "beginner" && <Check className="w-4 h-4" strokeWidth={3} />}
                </span>
              </button>

              <button
                type="button"
                onClick={() => pickSegment("established")}
                className={`relative flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
                  segment === "established"
                    ? "border-brand bg-brand/5 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span
                  className={`flex w-12 h-12 shrink-0 items-center justify-center rounded-xl ${
                    segment === "established" ? "bg-brand text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <TrendingUp className="w-6 h-6" />
                </span>
                <span className="pr-8">
                  <span className="block text-lg font-extrabold text-slate-900">
                    I&apos;m doing $10k+ per month
                  </span>
                  <span className="mt-1 block text-slate-500">
                    Established and ready to scale faster.
                  </span>
                </span>
                <span
                  className={`absolute top-4 right-4 flex w-6 h-6 items-center justify-center rounded-full border-2 ${
                    segment === "established" ? "border-brand bg-brand text-white" : "border-slate-300"
                  }`}
                >
                  {segment === "established" && <Check className="w-4 h-4" strokeWidth={3} />}
                </span>
              </button>
            </div>

            {/* Beginner branch */}
            {segment === "beginner" && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  What would you say your biggest problems are?
                </h3>
                <p className="mt-1 text-slate-500">
                  Pick the one that fits best, we&apos;ll tailor your next steps.
                </p>

                <div className="mt-5 grid sm:grid-cols-3 gap-4">
                  {PROBLEMS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setProblem(id);
                        requestAnimationFrame(() =>
                          bookRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
                        );
                      }}
                      className={`relative rounded-2xl border-2 p-5 text-left transition-all ${
                        problem === id
                          ? "border-brand bg-brand/5 shadow-md"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`flex w-12 h-12 items-center justify-center rounded-xl ${
                          problem === id ? "bg-brand text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </span>
                      <span className="mt-6 block text-base font-extrabold text-slate-900">{label}</span>
                      <span
                        className={`absolute top-4 right-4 flex w-6 h-6 items-center justify-center rounded-full border-2 ${
                          problem === id ? "border-brand bg-brand text-white" : "border-slate-300"
                        }`}
                      >
                        {problem === id && <Check className="w-4 h-4" strokeWidth={3} />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Handoff to Calendly once qualified */}
            <div ref={bookRef} className="mt-10 text-center scroll-mt-28">
              {readyToBook && (
                <a
                  href={buildCalendlyUrl(segment as Segment, problem)}
                  onClick={trackSchedule}
                  className="inline-block w-full sm:w-auto bg-brand text-white text-lg sm:text-xl font-black uppercase tracking-wide px-12 py-5 rounded-md shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all"
                >
                  Continue — Book Your Call
                </a>
              )}
            </div>
          </div>
        )}

        <p className="mt-14 text-[11px] leading-relaxed text-slate-400 max-w-2xl mx-auto">
          This site is not a part of the Facebook™ website or Facebook™ Inc. Additionally, this
          site is NOT endorsed by Facebook™ in any way. FACEBOOK™ is a trademark of FACEBOOK™,
          Inc.
        </p>
      </section>
    </div>
  );
}
