"use client";

import { trackReddit } from "../lib/redditPixel";
import {
  Check,
  Compass,
  DollarSign,
  Handshake,
  ListChecks,
  Pencil,
  Rocket,
  Search,
  ShoppingBag,
  Store,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { readStoredAttribution } from "./LeadAttribution";
import "./pop-qualify.css";
import { SIGNUP_PREFILL_KEY } from "../config/signupPrefill";
import { DOLLAR_WEEK } from "../config/offer";
import { DISTRIBUTOR_COUNT } from "../data/distributorStats";
import { liveIdentify, liveStep } from "../lib/live/client";

/**
 * The website arm of the Apex Pop A/B, in the PrimeWell application's shape:
 * numbered step cards, details first, then picture cards that qualify, each
 * finished step folding into a one-line summary with an Edit link.
 *
 * Details come first on purpose. A lead who types their email and then
 * leaves at question two is still a lead, landed in GoHighLevel the moment
 * they press Continue (tag `pop-web-started`); the answers and the branch
 * tag that start the follow-up are added when they finish. The questions are
 * the instant form's questions, word for word, so both arms of the A/B fill
 * the same four GHL fields.
 */
const ORIGIN = "https://www.apexapplications.io";

type Sells = "Yes" | "No";
const STARTER_KIT = "I have less than $1,000 for inventory";

type Card = { value: string; title: string; body: string; icon: LucideIcon };

const JOURNEY: { value: Sells; title: string; body: string; icon: LucideIcon }[] = [
  { value: "No", title: "I don't have an Amazon account set up", body: "Not selling yet, and I want to start the right way.", icon: Rocket },
  { value: "Yes", title: "I have an Amazon account ready", body: "My seller account is live and I want to grow.", icon: ShoppingBag },
];

const SELLER_OBSTACLES: Card[] = [
  { value: "Find profitable products", title: "Finding profitable products", body: "Too many catalogs, not enough margin.", icon: Search },
  { value: "Find more suppliers", title: "Finding more suppliers", body: "Distributors who actually reply.", icon: Store },
  { value: "Going brand direct", title: "Going brand direct", body: "Getting approved by the brand itself.", icon: Handshake },
  { value: "Scale operations", title: "Scale operations", body: "More orders without more chaos.", icon: TrendingUp },
];

const NEW_OBSTACLES: Card[] = [
  { value: "Getting started", title: "Getting started", body: "I need a first supplier and a first order.", icon: Compass },
  { value: "Knowing the right steps", title: "Knowing the right steps", body: "I want the order of operations.", icon: ListChecks },
  { value: STARTER_KIT, title: "Less than $1,000 to invest", body: "I want to start small.", icon: DollarSign },
];

const ease = [0.22, 1, 0.36, 1] as const;

/* ---------------- scenes: the picture each answer earns ---------------- */

function Scene({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease }}
      className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5"
    >
      <div className="pq-art !min-h-0 !bg-white">{children}</div>
      <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
    </motion.div>
  );
}

function ScanScene() {
  const rows = [38, 12, 27, 9, 31];
  return (
    <div className="pq-list">
      {rows.map((margin, i) => (
        <motion.div
          key={i}
          className="pq-row"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0, backgroundColor: margin >= 20 ? "#ecfdf3" : "#fff" }}
          transition={{ delay: 0.2 + i * 0.14, duration: 0.35, ease }}
        >
          <span className="pq-row-bar" style={{ width: `${40 + ((i * 13) % 35)}%` }} />
          <motion.span
            className="pq-row-tag"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.14, duration: 0.25 }}
            style={{ color: margin >= 20 ? "#027a48" : "#98a2b3" }}
          >
            {margin >= 20 ? `+${margin}%` : "skip"}
          </motion.span>
        </motion.div>
      ))}
      <motion.div
        className="pq-scanline"
        initial={{ top: 0, opacity: 0 }}
        animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
        transition={{ delay: 0.15, duration: 1.1, ease: "linear" }}
      />
    </div>
  );
}

function SuppliersScene() {
  return (
    <div className="pq-cards">
      {["Distributor A", "Distributor B", "Distributor C"].map((n, i) => (
        <motion.div
          key={n}
          className="pq-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.16, duration: 0.35, ease }}
        >
          <span className="pq-card-dot" />
          <span className="pq-card-name">{n}</span>
          <span className="pq-card-meta">contact details in your account</span>
        </motion.div>
      ))}
      <motion.div className="pq-card pq-card-ghost" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <span className="pq-card-name">+3 every month</span>
      </motion.div>
    </div>
  );
}

function PoScene() {
  const lines = [["Units", "1,200"], ["Landed cost", "$8,640"], ["Projected revenue", "$14,388"], ["ROI", "37%"]];
  return (
    <div className="pq-po">
      {lines.map(([k, v], i) => (
        <motion.div
          key={k}
          className="pq-po-line"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.14, duration: 0.3, ease }}
        >
          <span>{k}</span>
          <strong style={k === "ROI" ? { color: "#027a48" } : undefined}>{v}</strong>
        </motion.div>
      ))}
    </div>
  );
}

function RoadScene({ stops }: { stops: string[] }) {
  return (
    <div className="pq-road">
      {stops.map((s, i) => (
        <motion.div
          key={s}
          className="pq-stop"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.16, duration: 0.3, ease }}
        >
          <span className="pq-stop-num">{i + 1}</span>
          <span>{s}</span>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * What the free account and the trial hand over, listed plainly. The new
 * seller answers and the under-$1,000 answer show this instead of a picture:
 * Stefano wants those visitors to see the goods before they are asked to
 * make an account.
 */
function OfferScene({ heading, items, body }: { heading: string; items: string[]; body: string }) {
  return (
    <motion.div
      key={heading}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease }}
      className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5"
    >
      <h3 className="text-base font-bold text-slate-900">{heading}</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((it, i) => (
          <motion.li
            key={it}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.3, ease }}
            className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900"
          >
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-3 w-3" aria-hidden="true" />
            </span>
            {it}
          </motion.li>
        ))}
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">{body}</p>
    </motion.div>
  );
}

const TODAY_ITEMS = ["3 Suppliers + Practice Catalog", "3 Playbooks", "Software Demo", "9 Core Videos", "Ungating Roadmap"];
const TODAY_BODY =
  "Start the trial and explore all of our resources, and join our community where you can ask questions. Demos open up after you enable the free trial.";
const TRIAL_ITEMS = ["Apex University, all modules", "Ungating Roadmap", "First Suppliers", "Keepa Playbook"];
const TRIAL_BODY = "All of it opens the moment you start the trial. Nothing to pay today, and the community is there for your questions.";

/**
 * The same two panels while the $1 week is on. "Free trial" and "nothing to
 * pay today" one screen before a step that asks for $1 is the contradiction
 * the funnel map flagged, so the copy follows the offer.
 */
const TODAY_BODY_DOLLAR = `Start your $${DOLLAR_WEEK.price} week and explore all of our resources, and join our community where you can ask questions. Your demo opens up as soon as your week starts.`;
const TRIAL_BODY_DOLLAR = `All of it opens the moment your $${DOLLAR_WEEK.price} week starts, and the community is there for your questions.`;

/**
 * Step 3 opens by naming what they said they need most and telling them the
 * solution is on the other side of the account. Stefano: "making them feel
 * they are in the right steps".
 */
const SOLUTIONS: Record<string, { headline: string; sub: string }> = {
  "Find profitable products": {
    headline: "Finding profitable products is the right place to start.",
    sub: "Your account opens with the catalog scanner: every line checked against real Amazon fees, so the products that clear margin stand out. The solution is one login away.",
  },
  "Find more suppliers": {
    headline: "Finding more suppliers is what Apex does best.",
    // Accuracy pass 2026-10-07: "proven", "verified" and "vetted for 2026" removed; the count comes from distributorStats and the
    // schedule is the one in SUPPLIER_ACCESS (3 open when the subscription starts, 3 more each month).
    sub: `Your directory of ${DISTRIBUTOR_COUNT} US wholesale distributors comes with your software. Three open when your subscription starts and three more each month, and you get outreach prep to help your application.`,
  },
  "Going brand direct": {
    headline: "Going brand direct is the right move, and you are about to get the map.",
    sub: "Gating checks before you write, every brand contact in one place, and the first order built in the software once you are approved.",
  },
  "Scale operations": {
    headline: "Scaling operations is exactly what the platform was built for.",
    sub: "Purchase orders that carry their own numbers, restocking, COGS and profit tracking, all in one place instead of spreadsheets.",
  },
  "Getting started": {
    headline: "Getting started is the hardest part, and you are past it.",
    sub: "Three suppliers, a practice catalog, the playbooks and the core videos are waiting inside your account, with the demo built around your first order.",
  },
  "Knowing the right steps": {
    headline: "Knowing the right steps is about to stop being a problem.",
    sub: "The steps are in the software, in order: suppliers, catalog scan, shortlist, purchase order. Apex University walks you through each one.",
  },
  [STARTER_KIT]: {
    headline: "Starting with less than $1,000 is possible, and you are in the right place.",
    sub: "Apex University, the ungating roadmap, your first suppliers and the Keepa playbook open with the trial. Nothing to pay today.",
  },
};

function obstacleScene(obstacle: string, dollarWeek: boolean) {
  switch (obstacle) {
    case "Find profitable products":
      return (
        <Scene
          title="We give you suppliers' catalogs + the best system to find every profitable opportunity."
          body="Every line is checked against real Amazon fees and comes back with landed cost, margin and how many sell a month. Most of a catalog does not work. Apex finds the part that does."
        >
          <ScanScene />
        </Scene>
      );
    case "Find more suppliers":
      return (
        <Scene
          title={`A directory of ${DISTRIBUTOR_COUNT} US wholesale distributors.`}
          body="Three open when your subscription starts and three more each month, along with how to prepare your outreach."
        >
          <SuppliersScene />
        </Scene>
      );
    case "Scale operations":
      return (
        <Scene title="Every order carries its own numbers." body="Landed cost, projected revenue, margin and ROI before you commit a cent, then what arrived against what you paid for.">
          <PoScene />
        </Scene>
      );
    case "Going brand direct":
      return (
        <Scene title="Brand direct starts with knowing who can say yes." body="Check whether the brand is gated before you write, keep every brand contact and reply in one place, and build the first order in the software once you are approved.">
          <RoadScene stops={["Check the gating", "Reach the brand", "Get approved", "First order"]} />
        </Scene>
      );
    case "Getting started":
    case "Knowing the right steps":
      return <OfferScene heading="What we give you today" items={TODAY_ITEMS} body={dollarWeek ? TODAY_BODY_DOLLAR : TODAY_BODY} />;
    case STARTER_KIT:
      return (
        <OfferScene
          heading={dollarWeek ? `What opens with your $${DOLLAR_WEEK.price} week` : "What you get just for starting the trial"}
          items={TRIAL_ITEMS}
          body={dollarWeek ? TRIAL_BODY_DOLLAR : TRIAL_BODY}
        />
      );
    default:
      return null;
  }
}

/* ---------------- the progress line under the header ---------------- */

/**
 * A thin blue line fixed right under the site header, filling as the steps
 * are completed, with a percentage and a time estimate. Stefano wants the
 * form to feel like a game: every tap moves the line, not only Continue.
 */
function ProgressLine({ fraction, label }: { fraction: number; label: string }) {
  const pct = Math.round(fraction * 100);
  return (
    <div className="fixed left-0 right-0 top-20 z-40" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Sign-up progress">
      <div className="h-1.5 w-full bg-slate-100">
        <motion.div
          className="h-full rounded-r-full bg-blue-600"
          initial={false}
          animate={{ width: `${Math.max(3, pct)}%` }}
          transition={{ duration: 0.6, ease }}
        />
      </div>
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 sm:px-6">
        <div className="rounded-b-lg bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-600 shadow-sm backdrop-blur">
          {pct}% complete
        </div>
        <div className="rounded-b-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-500 shadow-sm backdrop-blur">{label}</div>
      </div>
    </div>
  );
}

/* ---------------- the step shell, as the PrimeWell page draws it ---------------- */

function StepCard({
  number,
  title,
  summary,
  state,
  onEdit,
  children,
}: {
  number: number;
  title: string;
  summary?: string;
  state: "done" | "active" | "locked";
  onEdit?: () => void;
  children?: ReactNode;
}) {
  return (
    <motion.div
      layout
      className={`overflow-hidden rounded-2xl border-2 bg-white shadow-sm ${state === "active" ? "border-blue-200" : "border-slate-200"} ${state === "locked" ? "opacity-60" : ""}`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${state === "locked" ? "bg-slate-100 text-slate-400" : "bg-blue-600 text-white"}`}>
              {state === "done" ? <Check className="h-4 w-4" aria-hidden="true" /> : number}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">Step {number}</span>
                {state === "done" && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    <Check className="h-3 w-3" aria-hidden="true" /> Completed
                  </span>
                )}
              </div>
              <h2 className={`text-lg font-bold text-slate-900 sm:text-xl ${state === "active" ? "" : "truncate"} ${state === "locked" ? "select-none blur-[3px]" : ""}`} aria-hidden={state === "locked" || undefined}>{title}</h2>
              {state === "done" && summary && <p className="truncate text-sm text-slate-500">{summary}</p>}
            </div>
          </div>
          {state === "done" && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
            </button>
          )}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {state === "active" && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
          >
            <div className="border-t border-slate-100 p-5 sm:p-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ChoiceCard({ card, selected, onPick, compact = false }: { card: Card; selected: boolean; onPick: () => void; compact?: boolean }) {
  const Icon = card.icon;
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      className={`relative w-full rounded-2xl border-2 text-left transition-all ${compact ? "px-3.5 py-3 sm:p-4" : "p-4 sm:p-5"} ${selected ? "border-amber-700 bg-blue-50/40 shadow-md" : "border-slate-200 bg-white hover:border-slate-300"}`}
    >
      <span className={`absolute right-4 ${compact ? "top-1/2 -translate-y-1/2" : "top-4"} flex h-6 w-6 items-center justify-center rounded-full border-2 ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}>
        {selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
      </span>
      {/* Compact: icon beside the text, so four answers fit on a phone screen. */}
      <span className={`flex ${compact ? "items-center gap-3" : "items-start gap-4"}`}>
        <span className={`flex ${compact ? "h-10 w-10" : "h-14 w-14"} flex-shrink-0 items-center justify-center rounded-xl ${selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
          <Icon className={compact ? "h-5 w-5" : "h-6 w-6"} aria-hidden="true" />
        </span>
        <span className="min-w-0 pr-6">
          <span className={`block font-bold leading-snug text-slate-900 ${compact ? "text-base" : "text-lg"}`}>{card.title}</span>
          <span className={`block text-slate-500 ${compact ? "mt-0.5 text-[13px]" : "mt-1 text-sm"}`}>{card.body}</span>
        </span>
      </span>
    </button>
  );
}

/* ---------------- the form ---------------- */

export default function PopQualify() {
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  useEffect(() => liveStep(step), [step]);
  /**
   * Bring Continue into view after an answer is tapped. The scene or panel
   * opens under the cards and pushed the button 1,000 to 1,300px below a
   * phone screen, with nothing to say it was there. Scroll the least that
   * shows the button, but never past the top of the scene.
   */
  const sceneRef = useRef<HTMLDivElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const [scrollNonce, setScrollNonce] = useState(0);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (!scrollNonce) return;
    // After the previous scene's exit and this one's entrance have settled.
    const t = setTimeout(() => {
      const scene = sceneRef.current;
      const button = continueRef.current;
      if (!scene || !button) return;
      const sceneTop = scene.getBoundingClientRect().top + window.scrollY;
      const buttonBottom = button.getBoundingClientRect().bottom + window.scrollY;
      const target = Math.min(sceneTop - 130, buttonBottom - window.innerHeight + 24);
      if (target > window.scrollY + 8) window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
    }, 450);
    return () => clearTimeout(t);
  }, [scrollNonce, reduceMotion]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sells, setSells] = useState<Sells | null>(null);
  const [obstacle, setObstacle] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Where this lead came from. The landing record wins for the campaign, ad
   * and ad set, because our own links to this page carry fixed UTMs that say
   * nothing about the ad clicked; the URL still decides the arm (medium). A
   * visit with no UTMs anywhere is "direct", not Facebook.
   */
  const utm = useMemo(() => {
    const landing = readStoredAttribution();
    return {
      utmSource: landing?.utmSource ?? params.get("utm_source") ?? landing?.source ?? "direct",
      utmMedium: params.get("utm_medium") ?? landing?.utmMedium ?? "website",
      utmCampaign: landing?.utmCampaign ?? params.get("utm_campaign") ?? "",
      utmContent: landing?.utmContent ?? params.get("utm_content") ?? "",
      utmTerm: landing?.utmTerm ?? params.get("utm_term") ?? "",
      from: params.get("from") ?? "apex-pop",
    };
  }, [params]);

  const obstacles = sells === "No" ? NEW_OBSTACLES : SELLER_OBSTACLES;

  /**
   * The $1 week: live when DOLLAR_WEEK.live flips (with the live Stripe
   * price), and previewable before that with ?dollarweek=1.
   */
  const dollarWeek = DOLLAR_WEEK.live || params.get("dollarweek") === "1";

  const post = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/pop-qualify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, ...utm, ...body }),
    });
    const data = (await res.json().catch(() => ({}))) as { next?: string; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
    return data;
  };

  const saveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await post({ stage: "details" });
      // Lead Desk's Live tab: this visitor now has a name and an email.
      liveIdentify(email, name);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    if (!sells || !obstacle) return;
    setBusy(true);
    setError(null);
    const attribution = readStoredAttribution();
    try {
      await post({
        stage: "complete",
        sellsOnAmazon: sells,
        obstacle,
        ...(dollarWeek ? { offer: "dollar-week" } : {}),
      });
      window.fbq?.("track", "Lead", { content_name: "apex-pop-web" });
      trackReddit("Lead");
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: attribution?.source ?? utm.utmSource,
          event: "pop_qualify",
          email,
          visitorId: attribution?.visitorId,
          utmSource: utm.utmSource,
          utmMedium: utm.utmMedium,
          utmCampaign: utm.utmCampaign,
          clickId: attribution?.clickId,
          clickSource: attribution?.clickSource,
        }),
        keepalive: true,
      }).catch(() => {});
      const q = `utm_source=${encodeURIComponent(utm.utmSource)}&utm_medium=${encodeURIComponent(utm.utmMedium)}&utm_campaign=${encodeURIComponent(utm.utmCampaign)}`;
      /**
       * The signup form reads this and fills name and email, so the visitor
       * only has to choose a password. Session storage rather than the URL:
       * the address stays out of analytics, referrers and shared links.
       */
      try {
        sessionStorage.setItem(SIGNUP_PREFILL_KEY, JSON.stringify({ name, email }));
      } catch {}
      window.location.href = dollarWeek
        ? `${ORIGIN}/auth?mode=signup&plan=${DOLLAR_WEEK.plan}&period=${DOLLAR_WEEK.period}&offer=${DOLLAR_WEEK.offer}&${q}`
        : `${ORIGIN}/auth?mode=signup&plan=free&${q}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  const stateOf = (n: number): "done" | "active" | "locked" => (n < step ? "done" : n === step ? "active" : "locked");
  const journeyTitle = JOURNEY.find((j) => j.value === sells)?.title;

  /**
   * How far along the line is. Typing counts a little, each answer counts
   * more, and the last stretch is the account itself, so the line never
   * reads 100% on this page: that happens when the account exists.
   */
  const typed = [name, email, phone].filter((v) => v.trim().length > 1).length;
  const progress = busy && step === 3 ? 0.95 : step === 1 ? 0.1 + typed * 0.05 : step === 2 ? 0.3 + (sells ? 0.15 : 0) + (obstacle ? 0.15 : 0) : 0.8;
  const progressLabel =
    progress < 0.3 ? "About 2 minutes" : progress < 0.6 ? "About 1 minute" : progress < 0.8 ? "Under a minute" : "Almost there";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-[81px]">
      <ProgressLine fraction={progress} label={progressLabel} />
      <section className="mx-auto w-full max-w-3xl px-4 pb-16 pt-7 sm:px-6 sm:pt-12">
        {/*
          One line and the $1 tag, so the fields and Continue make a phone's
          first screen. It used to spend that screen on a headline, two
          lines of explanation and the $1 small print the landing page had
          just shown; the full terms are on step 3, sign-up and checkout.
        */}
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-bold leading-tight text-slate-900 [text-wrap:balance] sm:text-3xl">
            3 quick questions, then your suppliers
          </h1>
          {dollarWeek ? (
            <p className="mt-2.5 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[13px] font-semibold text-emerald-800">
              <b className="font-extrabold text-emerald-900">${DOLLAR_WEEK.price} trial.</b> 100% refund if you&rsquo;re not satisfied within {DOLLAR_WEEK.days} days.
            </p>
          ) : (
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">Then a free Apex account, and we text you to book the demo.</p>
          )}
        </div>

        <div className="space-y-5">
          {/* Step 1: details first, as the PrimeWell application does it. */}
          <StepCard number={1} title="Your details" summary={[name, email].filter(Boolean).join(" · ")} state={stateOf(1)} onEdit={() => setStep(1)}>
            <form onSubmit={saveDetails} className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Full name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required minLength={2} className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-blue-500" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-blue-500" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Mobile <span className="font-normal text-slate-500">(we text you to set up your demo)</span>
                </span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" required minLength={7} className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-base outline-none focus:border-blue-500" />
              </label>
              {error && step === 1 && <p className="text-sm font-medium text-red-600 sm:col-span-2">{error}</p>}
              <div className="flex items-center justify-between gap-4 sm:col-span-2">
                <p className="text-xs text-slate-500">
                  We text you to set up the demo. One reply opts you out. <a className="underline" href={`${ORIGIN}/privacy`} target="_blank" rel="noreferrer">Privacy</a>
                </p>
                <button type="submit" disabled={busy} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                  {busy ? "One moment" : "Continue"}
                </button>
              </div>
            </form>
          </StepCard>

          {/* Step 2: where they are, then what is in the way. */}
          <StepCard
            number={2}
            title="Where are you in your Amazon journey?"
            summary={[journeyTitle, obstacle].filter(Boolean).join(" · ")}
            state={stateOf(2)}
            onEdit={() => setStep(2)}
          >
            <p className="mb-4 text-sm text-slate-500">Tap the card that fits you best.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {JOURNEY.map((j) => (
                <ChoiceCard
                  key={j.value}
                  card={j}
                  selected={sells === j.value}
                  onPick={() => {
                    setSells(j.value);
                    setObstacle(null);
                    // Tag the contact now, so a seller who stops here is still sorted.
                    post({ stage: "journey", sellsOnAmazon: j.value }).catch(() => {});
                  }}
                />
              ))}
            </div>

            <AnimatePresence>
              {sells && (
                <motion.div key={sells} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease }}>
                  <hr className="my-6 border-slate-100" />
                  <p className="text-base font-bold text-slate-900">{sells === "No" ? "What is stopping you from starting?" : "What is your biggest obstacle?"}</p>
                  <p className="mb-4 text-sm text-slate-500">Select the one that costs you the most time. The demo is built around it.</p>
                  <div className={`grid gap-4 ${obstacles.length === 4 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
                    {obstacles.map((o) => (
                      <ChoiceCard
                        key={o.value}
                        card={o}
                        selected={obstacle === o.value}
                        onPick={() => {
                          setObstacle(o.value);
                          setScrollNonce((n) => n + 1);
                          // Field and tag land now, so the follow-up can speak to this obstacle.
                          post({ stage: "obstacle", sellsOnAmazon: sells, obstacle: o.value }).catch(() => {});
                        }}
                        compact
                      />
                    ))}
                  </div>
                  <div ref={sceneRef}>
                    <AnimatePresence mode="wait">{obstacle && obstacleScene(obstacle, dollarWeek)}</AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && step === 2 && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
            <div className="mt-6 flex justify-end">
              <button ref={continueRef} type="button" disabled={!sells || !obstacle} onClick={() => setStep(3)} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                Continue
              </button>
            </div>
          </StepCard>

          {/* Step 3: what happens next, and the one button. */}
          <StepCard number={3} title={dollarWeek ? `Start your first week for $${DOLLAR_WEEK.price}` : "Your Apex account is next"} state={stateOf(3)}>
            {obstacle && SOLUTIONS[obstacle] && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease }}
                className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-5"
              >
                {!dollarWeek && (
                  <>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">What you need help with most</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{obstacles.find((o) => o.value === obstacle)?.title ?? obstacle}</p>
                  </>
                )}
                <h3 className={`${dollarWeek ? "" : "mt-3 "}text-lg font-bold leading-snug text-slate-900 sm:text-xl`}>{SOLUTIONS[obstacle].headline}</h3>
                {!dollarWeek && <p className="mt-2 text-sm leading-relaxed text-slate-600">{SOLUTIONS[obstacle].sub}</p>}
              </motion.div>
            )}
            {dollarWeek && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
                <p className="text-5xl font-black tracking-tight text-slate-900">${DOLLAR_WEEK.price}</p>
                <p className="mt-1 text-base font-semibold text-slate-700">
                  {DOLLAR_WEEK.days} days of Apex {DOLLAR_WEEK.planLabel}
                </p>
                <p className="mt-3 text-sm text-slate-500">
                  Then ${DOLLAR_WEEK.thenPrice}/month. Not happy? Cancel by day {DOLLAR_WEEK.days} and get your ${DOLLAR_WEEK.price} back.
                </p>
              </div>
            )}
            {!dollarWeek && (
            <>
            <p className="text-base font-semibold leading-relaxed text-slate-900">
              We will send you into our platform, where you can watch how Apex grows Amazon businesses and book your demo from there.
            </p>
            <ul className="mt-4 space-y-2.5">
              {[
                ["📱", "Reply to our text when it arrives. That is how we set up your demo."],
                ["📧", "Keep an eye on your inbox. The emails we send activate your account."],
                ["💻", "Catalogs are analyzed on a computer, so open Apex on a laptop or desktop when it is time to scan."],
              ].map(([emoji, line]) => (
                <li key={line} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
                  <span className="text-xl leading-none" aria-hidden="true">
                    {emoji}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            </>
            )}
            {error && step === 3 && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
            <div className="mt-6">
              <button type="button" disabled={busy} onClick={finish} className="w-full rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                {busy ? "One moment" : dollarWeek ? `Start my $${DOLLAR_WEEK.price} week` : "Create my Apex account"}
              </button>
              {dollarWeek && <p className="mt-2 text-center text-xs text-slate-500">Your account, then a quick checkout. We text you to set up your demo.</p>}
            </div>
          </StepCard>
        </div>
      </section>
    </div>
  );
}
