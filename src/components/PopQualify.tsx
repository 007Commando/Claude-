"use client";

import {
  Check,
  Compass,
  DollarSign,
  HelpCircle,
  ListChecks,
  Pencil,
  Rocket,
  Search,
  Store,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { readStoredAttribution } from "./LeadAttribution";
import "./pop-qualify.css";

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
const TIMINGS = ["Today", "Tomorrow", "Next week"] as const;
type Timing = (typeof TIMINGS)[number];

type Card = { value: string; title: string; body: string; icon: LucideIcon };

const JOURNEY: { value: Sells; title: string; body: string; icon: LucideIcon }[] = [
  { value: "No", title: "I'm just getting started", body: "New to Amazon and ready to begin the right way.", icon: Rocket },
  { value: "Yes", title: "I already sell on Amazon", body: "Selling today and ready to grow faster.", icon: TrendingUp },
];

const SELLER_OBSTACLES: Card[] = [
  { value: "Find profitable products", title: "Find profitable products", body: "Too many catalogs, not enough margin.", icon: Search },
  { value: "Find more suppliers", title: "Find more suppliers", body: "Distributors who actually reply.", icon: Store },
  { value: "Scale operations", title: "Scale operations", body: "More orders without more chaos.", icon: TrendingUp },
  { value: "I don't know", title: "I don't know yet", body: "Let's figure it out on the call.", icon: HelpCircle },
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
          <span className="pq-card-meta">named contact · approves resellers</span>
        </motion.div>
      ))}
      <motion.div className="pq-card pq-card-ghost" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <span className="pq-card-name">+3 more next month</span>
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

function KitScene() {
  const items = ["Product research checklist", "First 10 suppliers to email", "Fee calculator", "Launch plan"];
  return (
    <div className="pq-kit">
      {items.map((it, i) => (
        <motion.div
          key={it}
          className="pq-kit-item"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.12, duration: 0.3, ease }}
        >
          <span className="pq-check">✓</span> {it}
        </motion.div>
      ))}
    </div>
  );
}

const ROAD_NEW = ["Three suppliers, day one", "Scan their catalog", "Pick what clears", "Build the order"];

function obstacleScene(obstacle: string) {
  switch (obstacle) {
    case "Find profitable products":
      return (
        <Scene title="We scan the whole catalog against real Amazon fees." body="Every line comes back with landed cost, fees, margin and how many sell a month. Most of a catalog does not work. This finds the part that does.">
          <ScanScene />
        </Scene>
      );
    case "Find more suppliers":
      return (
        <Scene title="Three vetted US distributors on sign-up. Three more every month." body="Each with the named contact who approves resellers, so you are not cold-emailing an inbox that never answers.">
          <SuppliersScene />
        </Scene>
      );
    case "Scale operations":
      return (
        <Scene title="Every order carries its own numbers." body="Landed cost, projected revenue, margin and ROI before you commit a cent, then what arrived against what you paid for.">
          <PoScene />
        </Scene>
      );
    case "I don't know":
      return (
        <Scene title="That is what the setup call is for." body="We look at where you are, pick the first supplier and the first catalog with you, and leave you with a shortlist you can actually order.">
          <RoadScene stops={["Setup call", "First supplier", "First scan", "First order"]} />
        </Scene>
      );
    case "Getting started":
      return (
        <Scene title="Starting is the hard part. We do it with you." body="Suppliers on day one, a catalog scanned for you, and the order built in the software while you watch.">
          <RoadScene stops={ROAD_NEW} />
        </Scene>
      );
    case "Knowing the right steps":
      return (
        <Scene title="There are four steps, and they are in the software." body="Suppliers, catalog scan, shortlist, purchase order. Apex walks them in that order, and the demo shows you each one on a real catalog.">
          <RoadScene stops={["Suppliers", "Catalog scan", "Shortlist", "Purchase order"]} />
        </Scene>
      );
    case STARTER_KIT:
      return (
        <Scene title="Start with the $29 kit, then come back for the suppliers." body="The starter kit gets you researching and emailing suppliers today. When you are ready to place an order, Apex is here.">
          <KitScene />
        </Scene>
      );
    default:
      return null;
  }
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
              <h2 className={`text-lg font-bold text-slate-900 sm:text-xl ${state === "active" ? "" : "truncate"}`}>{title}</h2>
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
      className={`relative w-full rounded-2xl border-2 p-4 text-left transition-all sm:p-5 ${selected ? "border-amber-700 bg-blue-50/40 shadow-md" : "border-slate-200 bg-white hover:border-slate-300"}`}
    >
      <span className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}>
        {selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
      </span>
      <span className={`flex ${compact ? "flex-col gap-3" : "items-start gap-4"}`}>
        <span className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ${selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="min-w-0 pr-6">
          <span className="block text-lg font-bold leading-snug text-slate-900">{card.title}</span>
          <span className="mt-1 block text-sm text-slate-500">{card.body}</span>
        </span>
      </span>
    </button>
  );
}

/* ---------------- the form ---------------- */

export default function PopQualify() {
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sells, setSells] = useState<Sells | null>(null);
  const [obstacle, setObstacle] = useState<string | null>(null);
  const [timing, setTiming] = useState<Timing | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const utm = useMemo(
    () => ({
      utmSource: params.get("utm_source") ?? "facebook",
      utmMedium: params.get("utm_medium") ?? "website",
      utmCampaign: params.get("utm_campaign") ?? "apex-pop-promotion-web",
      from: params.get("from") ?? "apex-pop",
    }),
    [params],
  );

  const starterKit = obstacle === STARTER_KIT;
  const obstacles = sells === "No" ? NEW_OBSTACLES : SELLER_OBSTACLES;

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
      const data = await post({
        stage: "complete",
        sellsOnAmazon: sells,
        obstacle,
        demoTiming: starterKit ? undefined : (timing ?? "Today"),
      });
      window.fbq?.("track", "Lead", { content_name: "apex-pop-web" });
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
      window.location.href =
        data.next === "starter-kit" ? `${ORIGIN}/fba-starter-bundle?${q}` : `${ORIGIN}/auth?mode=signup&plan=free&${q}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  const stateOf = (n: number): "done" | "active" | "locked" => (n < step ? "done" : n === step ? "active" : "locked");
  const journeyTitle = JOURNEY.find((j) => j.value === sells)?.title;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-[81px]">
      <section className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">Apex POP</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">Your free demo and setup, built around you</h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-600">
            Three short steps so the setup fits where you are. Then a free Apex account, and we text you to book the demo.
          </p>
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
                <span className="mb-1.5 block text-sm font-semibold text-slate-700">Phone</span>
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
                    setTiming(null);
                  }}
                />
              ))}
            </div>

            <AnimatePresence>
              {sells && (
                <motion.div key={sells} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease }}>
                  <hr className="my-6 border-slate-100" />
                  <p className="text-base font-bold text-slate-900">{sells === "No" ? "What is stopping you from starting?" : "What is the biggest thing in your way?"}</p>
                  <p className="mb-4 text-sm text-slate-500">Select the one that costs you the most time. The demo is built around it.</p>
                  <div className={`grid gap-4 ${obstacles.length === 4 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
                    {obstacles.map((o) => (
                      <ChoiceCard key={o.value} card={o} selected={obstacle === o.value} onPick={() => setObstacle(o.value)} compact />
                    ))}
                  </div>
                  <AnimatePresence mode="wait">{obstacle && obstacleScene(obstacle)}</AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {error && step === 2 && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
            <div className="mt-6 flex justify-end">
              {starterKit ? (
                <button type="button" disabled={busy} onClick={finish} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                  {busy ? "One moment" : "Get the $29 Starter Kit"}
                </button>
              ) : (
                <button type="button" disabled={!sells || !obstacle} onClick={() => setStep(3)} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                  Continue
                </button>
              )}
            </div>
          </StepCard>

          {/* Step 3: when, then the free account. Not on the kit path. */}
          {!starterKit && (
            <StepCard number={3} title="How soon do you want your free demo and setup?" summary={timing ?? undefined} state={stateOf(3)}>
              <p className="mb-4 text-sm text-slate-500">We text you to set it up. The demo is a working session: your account, a real catalog, and an order built in it.</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {TIMINGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTiming(t)}
                    aria-pressed={timing === t}
                    className={`rounded-2xl border-2 px-4 py-5 text-center text-lg font-bold transition-all ${timing === t ? "border-amber-700 bg-blue-50/40 text-blue-700 shadow-md" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                {timing && (
                  <Scene key={timing} title={`${timing} it is.`} body="Your free account is next. Nothing to pay today; the software has a free state you can use while we set you up.">
                    <PoScene />
                  </Scene>
                )}
              </AnimatePresence>
              {error && step === 3 && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
              <div className="mt-6 flex justify-end">
                <button type="button" disabled={!timing || busy} onClick={finish} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                  {busy ? "One moment" : "Create my free account"}
                </button>
              </div>
            </StepCard>
          )}
        </div>
      </section>
    </div>
  );
}
