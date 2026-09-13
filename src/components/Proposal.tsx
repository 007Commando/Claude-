"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, GraduationCap, Rocket, Search, ShoppingCart, TrendingUp, Building2, Sparkles } from "lucide-react";

const CALENDLY_URL = "https://calendly.com/apexapplications-info/new-meeting";

/**
 * Three complete messages over one held-constant offer (Apex software and
 * coaching, the "Sell the Right Way" strategy, 389+ vetted suppliers, the
 * selling-approval roadmap, buying/restock tools). Ads pick the variant via
 * ?angle=<tag>; the tag rides into Calendly's utm_term and the pixel's
 * Schedule event so every booking and sale reports back to its angle.
 * Structure, quiz, CTA and offer stay identical across angles — only the
 * message is under test.
 */
type Angle = "first_order_roadmap" | "wholesale_suppliers" | "better_buying";

const DEFAULT_ANGLE: Angle = "first_order_roadmap";

type Slide = {
  eyebrow: string;
  headline: React.ReactNode;
  body?: string;
  finePrint?: string;
  hint?: string;
};

type AngleContent = {
  headline: string;
  subline: string;
  slides: Slide[];
};

const ANGLES: Record<Angle, AngleContent> = {
  first_order_roadmap: {
    headline: "New to Amazon? Know what to do before your first order.",
    subline:
      "Find suppliers. Learn the approval steps. Check the numbers with Apex software and coaching.",
    slides: [
      {
        eyebrow: "Your first Amazon order",
        headline: (
          <>
            A clear plan <span className="bg-brand text-white px-2">before your first order</span>
          </>
        ),
        body: "Apex software and coaching help you learn what to check before you buy.",
        hint: "Press the arrow to continue →",
      },
      {
        eyebrow: "The sticking point",
        headline: "You want to start. But what should you buy?",
        body: "Which supplier can I use?\nCan I sell this product?\nWill the numbers work?",
      },
      {
        eyebrow: "The roadmap",
        headline: "A path you can follow",
        body: "Find suppliers. Work through the approval steps. Check products before you order.",
      },
      {
        eyebrow: "Suppliers and approvals",
        headline: (
          <>
            A place to <span className="bg-brand text-white px-2">start your search</span>
          </>
        ),
        body: "389+ vetted Amazon FBA suppliers, plus a roadmap for selling approvals.",
        finePrint: "Each supplier has its own terms. Amazon decides selling approvals.",
      },
      {
        eyebrow: "The product check",
        headline: "The price tag is only part of the cost",
        body: "Use Apex to check product costs and fees, then build your purchase order.",
      },
      {
        eyebrow: "The support",
        headline: "Tools to do the work. Coaching to learn how.",
        body: "Learn the “Sell the Right Way” strategy, then use Apex to put it into practice.",
      },
      {
        eyebrow: "Your next step",
        headline: "What is holding up your first order?",
        body: "Book a free strategy call below. Tell us where you are stuck.",
      },
    ],
  },
  wholesale_suppliers: {
    headline: "For Amazon wholesale FBA sellers tired of hunting for suppliers.",
    subline:
      "Get 389+ vetted suppliers, a selling-approval roadmap, and Apex tools to help check what is worth buying.",
    slides: [
      {
        eyebrow: "For Amazon wholesale FBA sellers",
        headline: (
          <>
            Still <span className="bg-brand text-white px-2">hunting for suppliers?</span>
          </>
        ),
        body: "Get a place to start and a plan for checking what to buy.",
        hint: "Press the arrow to continue →",
      },
      {
        eyebrow: "The next hurdle",
        headline: "A supplier list leads to more questions",
        body: "Will they open an account?\nCan I sell their products?\nWhich items are worth a closer look?",
      },
      {
        eyebrow: "The supplier list",
        headline: (
          <>
            <span className="bg-brand text-white px-2">389+ vetted</span> Amazon FBA suppliers
          </>
        ),
        body: "Find suppliers to contact. Ask about their terms and request their product lists.",
        finePrint: "Account acceptance, stock and order sizes vary by supplier.",
      },
      {
        eyebrow: "Selling approvals",
        headline: "A roadmap for getting approved",
        body: "Learn the steps for selling approvals before you plan an order.",
        finePrint: "Amazon decides selling approvals.",
      },
      {
        eyebrow: "The catalog check",
        headline: "A product list you can work through",
        body: "Use Apex to check product costs and fees, then build your purchase order.",
      },
      {
        eyebrow: "The full offer",
        headline: "A plan after you find a supplier",
        body: "The “Sell the Right Way” strategy brings coaching and Apex software into your buying process.",
      },
      {
        eyebrow: "Your next step",
        headline: "Where does your sourcing get stuck?",
        body: "Book a free strategy call below. Let’s talk about your next step.",
      },
    ],
  },
  better_buying: {
    headline: "Already selling on Amazon? Know what to check before your next order.",
    subline:
      "Use Apex software and coaching to check your costs, plan orders, and understand what to buy again.",
    slides: [
      {
        eyebrow: "For sellers already placing orders",
        headline: (
          <>
            Your next order <span className="bg-brand text-white px-2">deserves a clear plan</span>
          </>
        ),
        body: "Apex software and coaching help you check the numbers behind what you buy.",
        hint: "Press the arrow to continue →",
      },
      {
        eyebrow: "The buying decision",
        headline: "More choices. The same budget.",
        body: "Which products should you buy?\nHow much should you order?\nWhat should you buy again?",
      },
      {
        eyebrow: "The cost check",
        headline: "What is left after costs?",
        body: "Apex helps you check product costs and fees as you plan an order.",
      },
      {
        eyebrow: "The purchase order",
        headline: "A clearer way to plan your order",
        body: "Use the Purchase Order Builder to organize the products you choose to buy.",
      },
      {
        eyebrow: "The next order",
        headline: "A closer look at what to buy again",
        body: "Use restock tools and profit reports to help guide your next buying decision.",
      },
      {
        eyebrow: "The support behind it",
        headline: "A buying process you can keep using",
        body: "Apex software and coaching, plus 389+ vetted suppliers and a selling-approval roadmap.",
        finePrint: "Supplier terms vary. Amazon decides selling approvals.",
      },
      {
        eyebrow: "Your next step",
        headline: "What would help you plan your next order?",
        body: "Book a free strategy call below. Tell us how you buy today.",
      },
    ],
  },
};

function isAngle(value: string): value is Angle {
  return value in ANGLES;
}

type Segment = "beginner" | "established";
type Problem = "learn-the-business" | "find-suppliers" | "place-first-order";
type Model = "wholesale-brand-direct" | "online-retail-arbitrage" | "private-label";

const PROBLEMS: { id: Problem; label: string; icon: typeof GraduationCap }[] = [
  { id: "learn-the-business", label: "Learn the Business", icon: GraduationCap },
  { id: "find-suppliers", label: "Find Suppliers", icon: Search },
  { id: "place-first-order", label: "Place Your First Order", icon: ShoppingCart },
];

const MODELS: { id: Model; label: string; icon: typeof Building2 }[] = [
  { id: "wholesale-brand-direct", label: "Wholesale & Brand Direct", icon: Building2 },
  { id: "online-retail-arbitrage", label: "Online Arbitrage & Retail Arbitrage", icon: ShoppingCart },
  { id: "private-label", label: "Private Label", icon: Sparkles },
];

/**
 * The booked call must name the ad that paid for the click, the angle under
 * test, and the quiz answers. The ad's utm_* params pass through untouched;
 * utm_term packs angle and qualification as `<angle>:<segment>-<detail>` so
 * the CRM can split performance by angle without touching campaign naming.
 */
function buildCalendlyUrl(angle: Angle, segment: Segment, detail: Problem | Model | null) {
  const url = new URL(CALENDLY_URL);
  const incoming = new URLSearchParams(window.location.search);
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
    const value = incoming.get(key);
    if (value) url.searchParams.set(key, value);
  }
  url.searchParams.set("utm_term", `${angle}:${detail ? `${segment}-${detail}` : segment}`);
  return url.toString();
}

export default function Proposal() {
  const params = useSearchParams();
  const angleParam = params.get("angle") || params.get("utm_content") || "";
  const angle: Angle = isAngle(angleParam) ? angleParam : DEFAULT_ANGLE;
  const content = ANGLES[angle];

  const [index, setIndex] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);
  const [segment, setSegment] = useState<Segment | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [model, setModel] = useState<Model | null>(null);
  const quizRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const last = content.slides.length - 1;

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
    if (s === "beginner") setModel(null);
    requestAnimationFrame(() => bookRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  const readyToBook =
    (segment === "beginner" && problem !== null) || (segment === "established" && model !== null);

  const trackSchedule = () => {
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
    fbq?.("track", "Schedule", { content_category: angle });
  };

  const slide = content.slides[index];

  return (
    <div className="pt-20 bg-white">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-brand text-balance">
          {content.headline}
        </h1>
        <p className="mt-4 text-lg text-slate-700 font-medium">{content.subline}</p>

        <p className="mt-8 text-sm font-bold uppercase tracking-wider text-slate-500">
          Read these 7 short slides to see how Apex can help.
        </p>

        {/* Slide deck */}
        <div className="mt-4 border-4 border-slate-900 rounded-md overflow-hidden text-left shadow-[8px_8px_0_0_rgba(15,23,42,0.15)]">
          <div className="relative bg-white min-h-[340px] sm:min-h-[380px] flex flex-col justify-center px-6 sm:px-12 py-12">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand mb-4">
              {slide.eyebrow}
            </p>
            <h2 className="text-2xl sm:text-[1.9rem] leading-snug font-extrabold text-slate-900 [&>span]:box-decoration-clone">
              {slide.headline}
            </h2>
            {slide.body && (
              <p className="mt-5 text-base sm:text-lg text-slate-600 whitespace-pre-line">
                {slide.body}
              </p>
            )}
            {slide.finePrint && (
              <p className="mt-4 text-xs text-slate-400">{slide.finePrint}</p>
            )}
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
                {index + 1} / {content.slides.length}
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
              {content.slides.map((s, i) => (
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

        {!quizOpen && (
          <button
            type="button"
            onClick={openQuiz}
            className="mt-10 inline-block w-full sm:w-auto bg-brand text-white text-lg sm:text-xl font-black uppercase tracking-wide px-12 py-5 rounded-md shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all"
          >
            Book a Free Strategy Call
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

            {/* Established branch */}
            {segment === "established" && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Which business model are you following?
                </h3>
                <p className="mt-1 text-slate-500">
                  Select the model that best describes how you source products today.
                </p>

                <div className="mt-5 grid sm:grid-cols-3 gap-4">
                  {MODELS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setModel(id);
                        requestAnimationFrame(() =>
                          bookRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
                        );
                      }}
                      className={`relative rounded-2xl border-2 p-5 text-left transition-all ${
                        model === id
                          ? "border-brand bg-brand/5 shadow-md"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`flex w-12 h-12 items-center justify-center rounded-xl ${
                          model === id ? "bg-brand text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </span>
                      <span className="mt-6 block text-base font-extrabold text-slate-900">{label}</span>
                      <span
                        className={`absolute top-4 right-4 flex w-6 h-6 items-center justify-center rounded-full border-2 ${
                          model === id ? "border-brand bg-brand text-white" : "border-slate-300"
                        }`}
                      >
                        {model === id && <Check className="w-4 h-4" strokeWidth={3} />}
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
                  href={buildCalendlyUrl(angle, segment as Segment, problem ?? model)}
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
