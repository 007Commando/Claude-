"use client";

import { useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { readStoredAttribution } from "./LeadAttribution";
import "./apex-surface.css";
import "./apex-pop.css";
import "./pop-qualify.css";

/**
 * The website arm of the Apex Pop A/B: three questions, then the contact
 * details, then the free account.
 *
 * The instant form on Facebook asks the same questions; this asks them on a
 * page of our own so that every answer can be met with a picture of the
 * seller's own situation before they are asked for anything. Somebody who
 * says "I can't find suppliers" sees three suppliers arrive; somebody who
 * says "not yet" sees the road from nothing to a first order. The answers go
 * to GoHighLevel on the same four fields the instant form fills, tagged
 * `pop-web-lead`, so the two arms are compared on one report.
 */
const ORIGIN = "https://www.apexapplications.io";

type Sells = "Yes" | "No";
const SELLER_OBSTACLES = [
  "Find profitable products",
  "Find more suppliers",
  "Scale operations",
  "I don't know",
] as const;
const NEW_OBSTACLES = [
  "Getting started",
  "Knowing the right steps",
  "I have less than $1,000 for inventory",
] as const;
const TIMINGS = ["Today", "Tomorrow", "Next week"] as const;
const STARTER_KIT = "I have less than $1,000 for inventory";

type Obstacle = (typeof SELLER_OBSTACLES)[number] | (typeof NEW_OBSTACLES)[number];
type Timing = (typeof TIMINGS)[number];

/* ------------------------------------------------------------------ */
/* The pictures. Each one is a small scene drawn with motion, not an   */
/* illustration file, so it can say the seller's own answer back.      */
/* ------------------------------------------------------------------ */

const ease = [0.22, 1, 0.36, 1] as const;

function Scene({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease }}
      className="pq-scene"
    >
      <div className="pq-art">{children}</div>
      <h3 className="pq-scene-title">{title}</h3>
      <p className="pq-scene-body">{body}</p>
    </motion.div>
  );
}

/** A catalog being scanned: rows light up green as the margin is found. */
function ScanScene() {
  const rows = [38, 12, 27, 9, 31, 19];
  return (
    <div className="pq-list">
      {rows.map((margin, i) => (
        <motion.div
          key={i}
          className="pq-row"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0, backgroundColor: margin >= 20 ? "#ecfdf3" : "#fff" }}
          transition={{ delay: 0.25 + i * 0.14, duration: 0.35, ease }}
        >
          <span className="pq-row-bar" style={{ width: `${40 + (i * 13) % 35}%` }} />
          <motion.span
            className="pq-row-tag"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 + i * 0.14, duration: 0.25 }}
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
        transition={{ delay: 0.15, duration: 1.2, ease: "linear" }}
      />
    </div>
  );
}

/** Three supplier cards arriving, then a fourth marked "next month". */
function SuppliersScene() {
  const names = ["Distributor A", "Distributor B", "Distributor C"];
  return (
    <div className="pq-cards">
      {names.map((n, i) => (
        <motion.div
          key={n}
          className="pq-card"
          initial={{ opacity: 0, y: 18, rotate: -2 + i }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.2 + i * 0.18, duration: 0.4, ease }}
        >
          <span className="pq-card-dot" />
          <span className="pq-card-name">{n}</span>
          <span className="pq-card-meta">named contact · approves resellers</span>
        </motion.div>
      ))}
      <motion.div
        className="pq-card pq-card-ghost"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.95, duration: 0.4 }}
      >
        <span className="pq-card-name">+3 more next month</span>
      </motion.div>
    </div>
  );
}

/** A purchase order filling itself in: units, landed cost, ROI. */
function PoScene() {
  const lines = [
    ["Units", "1,200"],
    ["Landed cost", "$8,640"],
    ["Projected revenue", "$14,388"],
    ["ROI", "37%"],
  ];
  return (
    <div className="pq-po">
      {lines.map(([k, v], i) => (
        <motion.div
          key={k}
          className="pq-po-line"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.16, duration: 0.35, ease }}
        >
          <span>{k}</span>
          <strong style={k === "ROI" ? { color: "#027a48" } : undefined}>{v}</strong>
        </motion.div>
      ))}
    </div>
  );
}

/** The road from nothing to a first order, in four stops. */
function RoadScene({ stops }: { stops: string[] }) {
  return (
    <div className="pq-road">
      {stops.map((s, i) => (
        <motion.div
          key={s}
          className="pq-stop"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.2, duration: 0.35, ease }}
        >
          <motion.span
            className="pq-stop-num"
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.25 + i * 0.2, duration: 0.3, ease }}
          >
            {i + 1}
          </motion.span>
          <span>{s}</span>
        </motion.div>
      ))}
    </div>
  );
}

/** A small kit box for the under-$1,000 answer. */
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
          transition={{ delay: 0.2 + i * 0.14, duration: 0.3, ease }}
        >
          <span className="pq-check">✓</span> {it}
        </motion.div>
      ))}
    </div>
  );
}

/** A calendar strip with the chosen day lighting up. */
function CalendarScene({ picked }: { picked: Timing }) {
  const days = ["Today", "Tomorrow", "Next week"];
  return (
    <div className="pq-cal">
      {days.map((d, i) => (
        <motion.div
          key={d}
          className={`pq-day ${d === picked ? "pq-day-on" : ""}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, scale: d === picked ? 1.06 : 1 }}
          transition={{ delay: 0.15 + i * 0.12, duration: 0.3, ease }}
        >
          {d}
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function sceneFor(
  step: number,
  contactStep: number,
  sells: Sells | null,
  obstacle: Obstacle | null,
  timing: Timing | null,
) {
  if (step === contactStep) {
    if (obstacle === STARTER_KIT)
      return (
        <Scene
          title="Where to send the kit."
          body="The $29 Starter Kit lands in your inbox right after checkout. When you are ready to place a real order, Apex is here."
        >
          <KitScene />
        </Scene>
      );
    return (
      <Scene
        title="Last step: where to send your setup details."
        body="Your free account is next. Nothing to pay today; the software has a free state you can use while we set you up."
      >
        <PoScene />
      </Scene>
    );
  }
  if (step === 0) {
    if (sells === "Yes")
      return (
        <Scene
          title="Then you know the grind."
          body="Research tools that say what to sell, distributors who never reply, evenings in spreadsheets. Apex is built for exactly that seller."
        >
          <ScanScene />
        </Scene>
      );
    if (sells === "No")
      return (
        <Scene
          title="Most people never start because step one is unclear."
          body="We start you with three wholesale suppliers who already work with our sellers, and walk you to a first order in the software."
        >
          <RoadScene stops={["Three suppliers, day one", "Scan their catalog", "Pick what clears", "Build the order"]} />
        </Scene>
      );
    return (
      <Scene
        title="Your free demo and setup, built around you."
        body="Three questions so the setup fits where you are. Then a free Apex account, and we text you to book the demo."
      >
        <RoadScene stops={["Three quick questions", "Free account", "Demo and setup", "First order"]} />
      </Scene>
    );
  }
  if (step === 1) {
    switch (obstacle) {
      case "Find profitable products":
        return (
          <Scene
            title="We scan the whole catalog against real Amazon fees."
            body="Upload a supplier's price list and every line comes back with landed cost, fees, margin and how many sell a month. Most of a catalog does not work. This finds the part that does."
          >
            <ScanScene />
          </Scene>
        );
      case "Find more suppliers":
        return (
          <Scene
            title="Three vetted US distributors on sign-up. Three more every month."
            body="Each with the named contact who approves resellers, so you are not cold-emailing an inbox that never answers."
          >
            <SuppliersScene />
          </Scene>
        );
      case "Scale operations":
        return (
          <Scene
            title="Every order carries its own numbers."
            body="Landed cost, projected revenue, margin and ROI before you commit a cent, then what arrived against what you paid for."
          >
            <PoScene />
          </Scene>
        );
      case "I don't know":
        return (
          <Scene
            title="That is what the setup call is for."
            body="We look at where you are, pick the first supplier and the first catalog with you, and leave you with a shortlist you can actually order."
          >
            <RoadScene stops={["Setup call", "First supplier", "First scan", "First order"]} />
          </Scene>
        );
      case "Getting started":
        return (
          <Scene
            title="Starting is the hard part. We do it with you."
            body="Suppliers on day one, a catalog scanned for you, and the order built in the software while you watch."
          >
            <RoadScene stops={["Three suppliers, day one", "Scan their catalog", "Pick what clears", "Build the order"]} />
          </Scene>
        );
      case "Knowing the right steps":
        return (
          <Scene
            title="There are four steps, and they are in the software."
            body="Suppliers, catalog scan, shortlist, purchase order. Apex walks them in that order, and the demo shows you each one on a real catalog."
          >
            <RoadScene stops={["Suppliers", "Catalog scan", "Shortlist", "Purchase order"]} />
          </Scene>
        );
      case STARTER_KIT:
        return (
          <Scene
            title="Start with the $29 kit, then come back for the suppliers."
            body="The starter kit gets you researching and emailing suppliers today. When you are ready to place an order, Apex is here."
          >
            <KitScene />
          </Scene>
        );
      default:
        return (
          <Scene title="What is in your way?" body="Pick the one that costs you the most time. The demo is built around it.">
            <RoadScene stops={["Suppliers", "Products", "Capital", "Time"]} />
          </Scene>
        );
    }
  }
  if (step === 2) {
    return (
      <Scene
        title={timing ? `${timing} it is.` : "When do you want the demo?"}
        body="We text you to set it up. The demo is a working session: your account, a real catalog, and an order built in it."
      >
        <CalendarScene picked={timing ?? "Today"} />
      </Scene>
    );
  }
  return null;
}

/* ------------------------------------------------------------------ */

export default function PopQualify() {
  const params = useSearchParams();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [sells, setSells] = useState<Sells | null>(null);
  const [obstacle, setObstacle] = useState<Obstacle | null>(null);
  const [timing, setTiming] = useState<Timing | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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

  // The starter-kit answer skips the demo question: there is no demo on
  // that path, the same as the instant form's branch.
  const steps = starterKit ? 3 : 4;
  const stepLabels = starterKit ? ["Amazon", "Obstacle", "Details"] : ["Amazon", "Obstacle", "Demo", "Details"];
  const contactStep = starterKit ? 2 : 3;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [step, reduce]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sells || !obstacle) return;
    setBusy(true);
    setError(null);
    const attribution = readStoredAttribution();
    try {
      const res = await fetch("/api/pop-qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          sellsOnAmazon: sells,
          obstacle,
          demoTiming: starterKit ? undefined : (timing ?? "Today"),
          ...utm,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { next?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
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
        data.next === "starter-kit"
          ? `${ORIGIN}/fba-starter-bundle?${q}`
          : `${ORIGIN}/auth?mode=signup&plan=free&${q}`;
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  const choice = (label: string, selected: boolean, onPick: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onPick}
      className={`pq-choice ${selected ? "pq-choice-on" : ""}`}
    >
      {label}
    </button>
  );

  return (
    <div className="apex-surface pop-page pq-page">
      {/* The site's own nav is fixed above; this only carries the progress. */}
      <header className="pq-top">
        <ol className="pq-steps" aria-label="Progress">
          {stepLabels.map((l, i) => (
            <li key={l} className={i <= step ? "pq-step-on" : ""}>
              {l}
            </li>
          ))}
        </ol>
      </header>

      <main className="pq-main">
        <section className="pq-ask">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="q0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease }}>
                <p className="pop-label">Question 1 of {steps - 1}</p>
                <h1 className="pq-q">Do you sell on Amazon today?</h1>
                <div className="pq-choices">
                  {choice("Yes", sells === "Yes", () => { setSells("Yes"); setObstacle(null); })}
                  {choice("Not yet", sells === "No", () => { setSells("No"); setObstacle(null); })}
                </div>
                <button type="button" className="pop-cta pq-next" disabled={!sells} onClick={() => setStep(1)}>
                  Next
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="q1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease }}>
                <p className="pop-label">Question 2 of {steps - 1}</p>
                <h1 className="pq-q">
                  {sells === "No" ? "What is stopping you from starting?" : "What is the biggest thing in your way?"}
                </h1>
                <div className="pq-choices pq-choices-col">
                  {obstacles.map((o) =>
                    choice(o, obstacle === o, () => {
                      setObstacle(o);
                      // The kit path has no demo question, so no timing.
                      if (o === STARTER_KIT) setTiming(null);
                    }),
                  )}
                </div>
                <div className="pq-nav">
                  <button type="button" className="pq-back" onClick={() => setStep(0)}>Back</button>
                  <button type="button" className="pop-cta pq-next" disabled={!obstacle} onClick={() => setStep(2)}>
                    {starterKit ? "Get the $29 kit" : "Next"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && !starterKit && (
              <motion.div key="q2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease }}>
                <p className="pop-label">Question 3 of {steps - 1}</p>
                <h1 className="pq-q">How soon do you want your free demo and setup?</h1>
                <div className="pq-choices">
                  {TIMINGS.map((t) => choice(t, timing === t, () => setTiming(t)))}
                </div>
                <div className="pq-nav">
                  <button type="button" className="pq-back" onClick={() => setStep(1)}>Back</button>
                  <button type="button" className="pop-cta pq-next" disabled={!timing} onClick={() => setStep(3)}>
                    Next
                  </button>
                </div>
              </motion.div>
            )}

            {step === contactStep && (
              <motion.form key="contact" onSubmit={submit} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease }}>
                <p className="pop-label">{starterKit ? "Where to send the kit" : "Where to send your setup details"}</p>
                <h1 className="pq-q">{starterKit ? "Your details" : "Almost there."}</h1>
                <label className="pq-field">
                  <span>Full name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required minLength={2} />
                </label>
                <label className="pq-field">
                  <span>Email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                </label>
                <label className="pq-field">
                  <span>Phone</span>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" required minLength={7} />
                </label>
                {error && <p className="pq-error">{error}</p>}
                <div className="pq-nav">
                  <button type="button" className="pq-back" onClick={() => setStep(contactStep - 1)}>Back</button>
                  <button type="submit" className="pop-cta pq-next" disabled={busy}>
                    {busy ? "One moment" : starterKit ? "Get the $29 Starter Kit" : "Create my free account"}
                  </button>
                </div>
                <p className="pq-fine">
                  We text you to set up the demo. No spam, and you can opt out with one reply.{" "}
                  <a href={`${ORIGIN}/privacy`}>Privacy</a>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </section>

        <aside className="pq-show" aria-live="polite">
          <AnimatePresence mode="wait">{sceneFor(step, contactStep, sells, obstacle, timing)}</AnimatePresence>
        </aside>
      </main>

    </div>
  );
}
