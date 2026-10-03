"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { ArrowRight, Check, Clock3, Copy } from "lucide-react";

import CheckoutLink from "./CheckoutLink";
import AgentBus, { BUS_NODES } from "./agent/AgentBus";
import { CLAUDE_PATH, CURSOR_PATH, GEMINI_PATH, OPENAI_PATH, PERPLEXITY_PATH } from "./agent/logos";
import { TRIAL_CHECKOUT_URL, trialCta } from "../config/offer";

/**
 * /ai: Apex as the layer an AI agent connects through.
 *
 * Every statement was checked against the code and the live endpoint (see
 * marketing-exports/agent-infrastructure-landing/PLAN.md). The rule for editing
 * it: a thing is "Live" only if a seller can use it today. Anything else is
 * "Planned", with no dates. Flip a badge when the tool ships, not before.
 *
 * Figures in DATA are rounded down from production counts and carry no date
 * stamp. They are catalog scale, not price freshness, and the footnote says so.
 *
 * The logos are shown to say "speaks standard MCP", not "partner". Only Claude
 * is what the connector was built for; the rest are described as untested.
 */

type Status = "live" | "beta" | "planned";

const BADGE: Record<Status, string> = {
  live: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
  beta: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  planned: "bg-slate-400/10 text-slate-300 border-slate-400/30",
};
const BADGE_LABEL: Record<Status, string> = { live: "Live", beta: "Beta", planned: "Planned" };

function Badge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${BADGE[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "live" ? "bg-emerald-400 ai-pulse" : status === "beta" ? "bg-amber-400" : "bg-slate-400"}`} />
      {BADGE_LABEL[status]}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Small pieces                                                      */
/* ---------------------------------------------------------------- */

function Count({ to, suffix, decimals = 0 }: { to: number; suffix: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1600);
      setV(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref}>{v.toFixed(decimals)}{suffix}</span>;
}

function Spotlight({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`ai-spot relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur ${className}`}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </div>
  );
}

function CopyCode({ label, code }: { label: string; code: string }) {
  const [done, setDone] = useState(false);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">{label}</h3>
        <button
          onClick={() => { navigator.clipboard?.writeText(code); setDone(true); setTimeout(() => setDone(false), 1400); }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-white"
        >
          {done ? <Check size={13} /> : <Copy size={13} />} {done ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-black/50 p-5 text-[13px] leading-relaxed text-sky-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Logo({ d, name }: { d: string; name: string }) {
  return (
    <div className="flex items-center gap-3 text-slate-300">
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true"><path d={d} /></svg>
      <span className="text-lg font-bold tracking-tight">{name}</span>
    </div>
  );
}

const fade = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
  transition: { duration: 0.6, ease: "easeOut" },
} as const;

function Section({ id, eyebrow, title, intro, children }: { id: string; eyebrow: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="relative mx-auto max-w-6xl px-6 py-24">
      <motion.div {...fade}>
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-sky-400">{eyebrow}</p>
        <h2 className="mb-5 max-w-3xl text-4xl font-black tracking-tight text-white md:text-6xl">{title}</h2>
        {intro && <p className="mb-12 max-w-2xl text-lg leading-relaxed text-slate-400">{intro}</p>}
        {children}
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* Hero diagram                                                      */
/* ---------------------------------------------------------------- */

function HeroBus() {
  const [mode, setMode] = useState<"today" | "planned">("planned");
  const [hovered, setHovered] = useState<string | null>(null);
  const node = BUS_NODES.find((n) => n.id === hovered);
  const nodeBadge: Status | null = node ? (node.status === "client" ? null : node.status) : null;

  return (
    <div className="relative mx-auto max-w-7xl px-3 sm:px-6">
      <div className="mb-4 flex items-center justify-center gap-3">
        <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1 text-sm font-semibold backdrop-blur">
          {(["today", "planned"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full px-5 py-2 transition ${mode === m ? "bg-white text-slate-950" : "text-slate-300 hover:text-white"}`}
            >
              {m === "today" ? "Today" : "Today and planned"}
            </button>
          ))}
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.14),transparent_70%)]">
        <AgentBus mode={mode} hovered={hovered} onHover={setHovered} />
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-between px-6 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 sm:px-12">
          <span>Your AI agent</span>
          <span className="hidden sm:inline">Apex layer</span>
          <span>Your Amazon business</span>
        </div>
      </div>
      <div className="mx-auto mt-4 min-h-[88px] max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center backdrop-blur">
        {node ? (
          <>
            <div className="mb-1 flex items-center justify-center gap-3">
              <span className="text-lg font-extrabold text-white">{node.title}</span>
              {nodeBadge ? <Badge status={nodeBadge} /> : <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-sky-300">MCP client</span>}
            </div>
            <p className="text-sm leading-relaxed text-slate-400">{node.caption}</p>
          </>
        ) : (
          <p className="text-sm leading-relaxed text-slate-400">
            Hover or tap any node. Blue packets are requests, green packets are answers. Everything an agent reads passes a key check and a permission check inside Apex first.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Anatomy of a call                                                 */
/* ---------------------------------------------------------------- */

const STEPS: { n: string; t: string; d: string; status: Status }[] = [
  { n: "01", t: "Agent asks", d: "A standard MCP request, with your key.", status: "live" },
  { n: "02", t: "Key check", d: "Key resolved to one account and user.", status: "live" },
  { n: "03", t: "Permission check", d: "The page's own subscription and permission rules.", status: "live" },
  { n: "04", t: "Read-only tool", d: "Runs the app's own query. Changes nothing.", status: "live" },
  { n: "05", t: "Trimmed answer", d: "Capped and shaped to fit a model's context.", status: "live" },
];

const TERMINAL: { c: string; t: string }[] = [
  { c: "text-sky-300", t: "> tools/call get_restock_recommendations" },
  { c: "text-slate-500", t: "  key        apx_••••••••3f9a" },
  { c: "text-emerald-300", t: "  key check  account resolved" },
  { c: "text-emerald-300", t: "  permission same rules as the page: passed" },
  { c: "text-emerald-300", t: "  mode       read-only" },
  { c: "text-slate-300", t: '  { "items": [ { "title": "Example product A", "daysOfInventory": 6,' },
  { c: "text-slate-300", t: '                 "recommendedQty": 120 }, ... ] }' },
];

function Terminal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-60px" });
  const [chars, setChars] = useState(0);
  const total = TERMINAL.reduce((n, l) => n + l.t.length + 1, 0);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setChars(total); return; }
    let c = 0;
    const id = setInterval(() => {
      c += 2;
      if (c > total + 70) c = 0;
      setChars(Math.min(c, total));
    }, 32);
    return () => clearInterval(id);
  }, [inView, total]);

  let left = chars;
  return (
    <div ref={ref} className="overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-[0_30px_100px_rgba(37,99,235,0.25)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400/70" /><span className="h-3 w-3 rounded-full bg-amber-400/70" /><span className="h-3 w-3 rounded-full bg-emerald-400/70" />
        <span className="ml-3 text-xs text-slate-500">apex mcp session</span>
      </div>
      <div className="min-h-[250px] whitespace-pre-wrap break-words p-5 font-mono text-[12.5px] leading-6">
        {TERMINAL.map((l, i) => {
          const shown = Math.max(0, Math.min(l.t.length, left));
          left -= l.t.length + 1;
          return <div key={i} className={l.c}>{l.t.slice(0, shown)}{shown > 0 && shown < l.t.length ? <span className="ai-caret">▍</span> : null}</div>;
        })}
      </div>
      <div className="border-t border-white/10 px-5 py-3 text-[11px] text-slate-500">Example output with illustrative values.</div>
    </div>
  );
}

function Anatomy() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 1500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
      <div>
        <div className="relative space-y-3">
          <div className="absolute bottom-6 left-[27px] top-6 w-px bg-gradient-to-b from-sky-400/60 via-sky-400/20 to-transparent" />
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className={`relative flex items-center gap-5 rounded-2xl border p-4 transition-all duration-500 ${active === i ? "border-sky-400/60 bg-sky-400/10 shadow-[0_0_40px_rgba(56,189,248,0.2)]" : "border-white/10 bg-white/[0.03]"}`}
            >
              <div className={`z-10 flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold transition-colors duration-500 ${active === i ? "bg-sky-400 text-slate-950" : "bg-slate-900 text-slate-400"}`}>{s.n}</div>
              <div>
                <div className="font-extrabold text-white">{s.t}</div>
                <div className="text-sm text-slate-400">{s.d}</div>
              </div>
              <div className="ml-auto hidden sm:block"><Badge status={s.status} /></div>
            </div>
          ))}
          <div className="grid gap-3 pt-3 sm:grid-cols-2">
            {[["Approval gate", "You confirm any change before it happens."], ["Audit log", "Every call recorded and viewable."]].map(([t, d]) => (
              <div key={t} className="rounded-2xl border border-dashed border-white/20 p-4">
                <div className="mb-1 flex items-center justify-between gap-2"><span className="font-extrabold text-slate-200">{t}</span><Badge status="planned" /></div>
                <div className="text-sm text-slate-500">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Terminal />
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Flows, data, controls, tools                                      */
/* ---------------------------------------------------------------- */

interface Flow { title: string; status: Status; ask: string; answer: string; tools: string[]; note?: string }

const FLOWS: Flow[] = [
  { title: "Restock analysis", status: "live", ask: "What should I reorder this week?",
    answer: "Lists the profitable products you already sell that are lowest on stock, with days of inventory left and a recommended quantity, so you can go straight to the purchase order.",
    tools: ["get_restock_recommendations", "get_inventory"] },
  { title: "Catalog analysis", status: "live", ask: "Which items in my latest supplier list are worth buying?",
    answer: "Reads the scan you already ran on that supplier's catalog and ranks the matches by profit or ROI, with Amazon price, rank and seller counts beside each.",
    tools: ["list_catalog_scans", "get_catalog_scan_results"] },
  { title: "Market intel from your own database", status: "live", ask: "What profitable products am I missing?",
    answer: "Finds profitable ASINs in your product database that you are not selling yet, best profit first, and points out structural gaps such as too few suppliers.",
    tools: ["get_profitable_opportunities", "get_growth_gaps", "search_products"],
    note: "Works from the products and suppliers in your account, not an open market search." },
  { title: "Repricing review", status: "beta", ask: "What has the repricer actually earned me, and where is MAP a risk?",
    answer: "Shows what repricing changed and what it was worth, and which brands have listings under MAP risk. Reading is available now. Letting an agent change prices is planned, with your approval.",
    tools: ["get_repricer_listings", "get_repricer_impact", "get_map_compliance"],
    note: "The repricer itself is in Beta." },
  { title: "Purchase order creation", status: "planned", ask: "Draft a PO for those three reorders.",
    answer: "Planned. The agent will prepare a draft purchase order and show it to you. Nothing is created or sent to a supplier until you approve it.",
    tools: [], note: "No tool exists for this yet." },
];

function Flows() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {FLOWS.map((f, i) => (
        <motion.div key={f.title} {...fade} transition={{ ...fade.transition, delay: (i % 2) * 0.08 }} className={i === 4 ? "md:col-span-2" : ""}>
          <Spotlight className="flex h-full flex-col p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <h3 className="text-xl font-extrabold text-white">{f.title}</h3>
              <Badge status={f.status} />
            </div>
            <div className="mb-3 self-end max-w-[90%] rounded-2xl rounded-br-md bg-sky-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_10px_30px_rgba(14,165,233,0.35)]">{f.ask}</div>
            <div className="mb-4 max-w-[95%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-relaxed text-slate-300">{f.answer}</div>
            {f.note && <p className="mb-3 text-xs text-slate-500">{f.note}</p>}
            <div className="mt-auto">
              {f.tools.length ? (
                <div className="flex flex-wrap gap-2">{f.tools.map((t) => <code key={t} className="rounded-md border border-white/10 bg-black/50 px-2 py-1 text-[11px] text-sky-200">{t}</code>)}</div>
              ) : (
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tool not built yet</p>
              )}
            </div>
          </Spotlight>
        </motion.div>
      ))}
      <p className="text-xs text-slate-500 md:col-span-2">Conversations illustrate what each flow does. They are not real seller data.</p>
    </div>
  );
}

const DATA: { to: number; suffix: string; decimals?: number; label: string }[] = [
  { to: 120, suffix: "M+", label: "ASINs in the Apex catalog" },
  { to: 90, suffix: "M+", label: "with the brand attached" },
  { to: 65, suffix: "M+", label: "with a sales rank" },
  { to: 98, suffix: "M+", label: "product identifiers for UPC matching" },
  { to: 1.7, suffix: "M+", decimals: 1, label: "brand names" },
  { to: 1.8, suffix: "M+", decimals: 1, label: "seller orders synced" },
  { to: 290, suffix: "k+", label: "seller products tracked" },
  { to: 1, suffix: "M+", label: "offer snapshots for repricing" },
];

const CONTROLS: { name: string; detail: string; status: Status }[] = [
  { name: "Per-seller connector keys", detail: "Tied to one account and user, stored hashed, shown once, up to 10 live keys.", status: "live" },
  { name: "Revoke a key instantly", detail: "Turn a key off from Settings. A key also dies if its user loses access to the account.", status: "live" },
  { name: "Permissions carried through", detail: "A key sees what its user sees in the app, and no more.", status: "live" },
  { name: "Read-only tools", detail: "Today nothing an agent calls can change a price, an order or a setting.", status: "live" },
  { name: "Per-tool scopes", detail: "Choose which areas a key can read, such as P&L or catalog only.", status: "planned" },
  { name: "Audit log", detail: "Every agent call listed in Settings with the key, tool and time.", status: "planned" },
  { name: "Human approval for changes", detail: "Agents propose, you approve, then it happens.", status: "planned" },
  { name: "Rate limits per key", detail: "A ceiling on calls so a runaway agent cannot flood your account.", status: "planned" },
  { name: "Sign in with OAuth", detail: "Connect without pasting a key.", status: "planned" },
];

const TOOLS: [string, string][] = [
  ["get_business_snapshot", "Counts for the account: products, how many are profitable, suppliers, plan."],
  ["get_profitable_opportunities", "Profitable ASINs in your database that you are not selling yet."],
  ["get_restock_recommendations", "Profitable products you sell that are lowest on stock."],
  ["get_growth_gaps", "Structural gaps holding growth back."],
  ["get_profit_and_loss", "Monthly sales, fees, cost of goods and gross profit."],
  ["get_profit_and_loss_statement", "P&L over a date range by day, week or month."],
  ["search_products", "Your product database with cost, price, profit, ROI, stock and rank."],
  ["list_catalog_scans", "Supplier catalog scans you have run."],
  ["get_catalog_scan_results", "Products found in one scan, sortable by profit or ROI."],
  ["get_repricer_listings", "Live listings as the repricer sees them."],
  ["get_repricer_impact", "What repricing has been worth."],
  ["get_map_compliance", "MAP status by brand."],
  ["get_inventory", "FBA inventory, velocity, days left and restock status."],
];

const CURL = `curl -s https://app.apexapplications.io/api/mcp \\
  -H "Authorization: Bearer apx_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`;

const CLAUDE_CODE = `claude mcp add --transport http apex \\
  https://app.apexapplications.io/api/mcp \\
  --header "Authorization: Bearer apx_YOUR_KEY"`;

/* ---------------------------------------------------------------- */
/* Page                                                              */
/* ---------------------------------------------------------------- */

const CSS = `
.ai-page{background:#04060f;color:#fff}
.ai-aurora{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.ai-aurora i{position:absolute;border-radius:9999px;filter:blur(120px);opacity:.5;animation:ai-drift 18s ease-in-out infinite alternate}
@keyframes ai-drift{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(80px,60px,0) scale(1.15)}}
.ai-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(96,165,250,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(96,165,250,.06) 1px,transparent 1px);background-size:64px 64px;mask-image:radial-gradient(ellipse at 50% 30%,#000 20%,transparent 75%)}
.ai-spot::before{content:"";position:absolute;inset:0;background:radial-gradient(420px circle at var(--mx,50%) var(--my,-20%),rgba(56,189,248,.16),transparent 60%);opacity:0;transition:opacity .3s;pointer-events:none}
.ai-spot:hover::before{opacity:1}
.ai-pulse{animation:ai-pulse 1.8s ease-in-out infinite}
@keyframes ai-pulse{0%,100%{box-shadow:0 0 0 0 rgba(52,211,153,.6)}50%{box-shadow:0 0 0 5px rgba(52,211,153,0)}}
.ai-caret{animation:ai-blink 1s steps(2) infinite;color:#7dd3fc}
@keyframes ai-blink{50%{opacity:0}}
.ai-marquee{display:flex;width:max-content;animation:ai-scroll 38s linear infinite}
.ai-marquee:hover{animation-play-state:paused}
@keyframes ai-scroll{to{transform:translateX(-50%)}}
.ai-glow-text{background:linear-gradient(100deg,#7dd3fc,#60a5fa 40%,#a78bfa);-webkit-background-clip:text;background-clip:text;color:transparent}
.ai-border{position:relative}
.ai-border::before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1px;background:conic-gradient(from var(--a,0deg),transparent 0 70%,#38bdf8,#a78bfa,transparent);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:ai-spin 5s linear infinite}
@property --a{syntax:"<angle>";inherits:false;initial-value:0deg}
@keyframes ai-spin{to{--a:360deg}}
@media (prefers-reduced-motion:reduce){.ai-aurora i,.ai-marquee,.ai-pulse,.ai-border::before{animation:none}}
`;

export default function AgentInfrastructure() {
  const clients: [string, string][] = [["Claude", CLAUDE_PATH], ["ChatGPT", OPENAI_PATH], ["Gemini", GEMINI_PATH], ["Cursor", CURSOR_PATH], ["Perplexity", PERPLEXITY_PATH]];
  const marquee = [...clients, ...clients, ...clients, ...clients];
  const toolStrip = [...TOOLS, ...TOOLS];

  return (
    <main className="ai-page">
      <style>{CSS}</style>

      {/* Hero */}
      <section className="relative overflow-hidden pb-16 pt-28 md:pt-36">
        <div className="ai-aurora">
          <i className="-left-40 -top-40 h-[620px] w-[620px] bg-blue-600" />
          <i className="-right-40 top-40 h-[520px] w-[520px] bg-violet-600" style={{ animationDelay: "-6s" }} />
          <i className="left-1/3 top-[55%] h-[420px] w-[420px] bg-sky-500" style={{ animationDelay: "-11s", opacity: 0.3 }} />
        </div>
        <div className="ai-grid" />
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-sky-300 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 ai-pulse" /> MCP server live
            </p>
            <h1 className="mx-auto mb-7 max-w-5xl text-5xl font-black leading-[1.02] tracking-tight md:text-8xl">
              The Amazon layer your <span className="ai-glow-text">AI agents</span> plug into.
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">
              Connect Claude or any MCP-compatible agent to your Amazon wholesale business through Apex: your catalog, costs, profit and repricing data, with your permissions on every call.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href="#developers" className="ai-border inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[0_20px_60px_rgba(14,165,233,0.45)] transition hover:bg-sky-400">
                Connect your agent <ArrowRight size={16} />
              </a>
              <CheckoutLink href={TRIAL_CHECKOUT_URL} className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-black uppercase tracking-widest text-white backdrop-blur transition hover:bg-white/10">
                {trialCta}
              </CheckoutLink>
            </div>
          </motion.div>
        </div>
        <motion.div className="relative mt-14" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}>
          <HeroBus />
        </motion.div>
        <p className="relative mt-6 flex items-center justify-center gap-2 px-6 text-center text-sm text-slate-400">
          <Check size={16} className="shrink-0 text-emerald-400" /> Today it is read-only. Actions with your approval are coming.
        </p>
      </section>

      {/* Clients */}
      <section className="relative border-y border-white/10 bg-white/[0.02] py-8">
        <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Speaks standard MCP</p>
        <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
          <div className="ai-marquee gap-16 pr-16">
            {marquee.map(([name, d], i) => (
              <Logo key={`${name}-${i}`} d={d} name={name} />
            ))}
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-3xl px-6 text-center text-[11px] leading-relaxed text-slate-600">
          Apex's connector is built for Claude. Other clients that support remote MCP servers should work and are not individually tested. Logos are trademarks of their owners, shown only to indicate MCP compatibility. Apex is independent and not affiliated with them.
        </p>
      </section>

      <Section id="how" eyebrow="Anatomy of a call" title="Every request passes the gate first." intro="Before an agent sees a single row, Apex checks who is asking and what they may see, then runs the same read-only query the app itself would.">
        <Anatomy />
      </Section>

      <Section id="flows" eyebrow="What you can ask" title="Five flows, with the truth about each." intro="Four work today. The fifth is planned and says so.">
        <Flows />
      </Section>

      <section id="data" className="relative overflow-hidden border-y border-white/10 bg-gradient-to-b from-transparent via-sky-950/30 to-transparent">
        <div className="ai-grid opacity-60" />
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <motion.div {...fade}>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-sky-400">Data underneath</p>
            <h2 className="mb-12 max-w-3xl text-4xl font-black tracking-tight text-white md:text-6xl">A catalog built for matching suppliers to Amazon.</h2>
          </motion.div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {DATA.map((d, i) => (
              <motion.div key={d.label} {...fade} transition={{ ...fade.transition, delay: i * 0.05 }}>
                <Spotlight className="p-6">
                  <div className="ai-glow-text text-5xl font-black tracking-tight"><Count to={d.to} suffix={d.suffix} decimals={d.decimals} /></div>
                  <div className="mt-2 text-sm text-slate-400">{d.label}</div>
                </Spotlight>
              </motion.div>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm text-slate-500">
            This is catalog scale. Prices and offers are refreshed continuously for the listings Apex tracks, not for every ASIN at once. Your own account data is yours alone: other sellers never see it.
          </p>
        </div>
      </section>

      <Section id="why" eyebrow="The difference" title="Built as infrastructure, not another dashboard.">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["Your data in, not just public data out", "Answers come from your own costs, fees, orders and suppliers as well as the catalog."],
            ["The same rules as the app", "Every tool runs the page's own permission checks, so an agent cannot see more than the person who connected it."],
            ["Read first, act later", "Nothing an agent does today can change your account. Changes will wait for your approval."],
          ].map(([t, d], i) => (
            <motion.div key={t} {...fade} transition={{ ...fade.transition, delay: i * 0.08 }}>
              <Spotlight className="h-full p-7">
                <div className="mb-4 font-mono text-sm font-bold text-sky-400">0{i + 1}</div>
                <h3 className="mb-3 text-xl font-extrabold text-white">{t}</h3>
                <p className="leading-relaxed text-slate-400">{d}</p>
              </Spotlight>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section id="security" eyebrow="Security and control" title="You decide what an agent can do." intro="What is in place now, and what we are building next.">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          {CONTROLS.map((c, i) => (
            <div key={c.name} className={`flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between ${i ? "border-t border-white/10" : ""} ${c.status === "planned" ? "opacity-70" : ""}`}>
              <div>
                <div className="font-extrabold text-white">{c.name}</div>
                <div className="text-sm text-slate-400">{c.detail}</div>
              </div>
              <div className="shrink-0"><Badge status={c.status} /></div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="developers" eyebrow="Developers" title="Connect over MCP." intro="Create a key in Apex under Settings, then Claude connector. Treat it like a password and revoke it when you are done testing.">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <CopyCode label="Claude Code" code={CLAUDE_CODE} />
            <CopyCode label="List the tools" code={CURL} />
            <div>
              <h3 className="mb-2 text-sm font-bold text-white">Claude.ai custom connector</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                Claude.ai connectors only accept a URL, so Apex also accepts the key as the last part of the path:{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-[12px] text-sky-200">https://app.apexapplications.io/api/mcp/apx_YOUR_KEY</code>. A URL can end up in logs, which is another reason to revoke test keys.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">Without a key the endpoint answers 401. Without the plan or permission a tool needs, it refuses in plain words rather than returning partial data.</p>
            </div>
          </div>
          <div>
            <h3 className="mb-3 flex items-center gap-3 text-sm font-bold text-white">13 tools <Badge status="live" /></h3>
            <div className="max-h-[540px] overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.03]">
              {TOOLS.map(([name, desc], i) => (
                <div key={name} className={`p-4 ${i ? "border-t border-white/10" : ""}`}>
                  <code className="text-[13px] font-bold text-sky-300">{name}</code>
                  <div className="text-sm text-slate-400">{desc}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">All read-only. Lists are capped to keep results short enough for a model.</p>
          </div>
        </div>

        <div className="mt-12 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          <div className="ai-marquee gap-3 pr-3" style={{ animationDuration: "55s" }}>
            {toolStrip.map(([name], i) => (
              <code key={`${name}-${i}`} className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-sky-200">{name}</code>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-dashed border-white/20 bg-white/[0.02] p-7">
          <div className="mb-3 flex items-center gap-3">
            <Clock3 size={18} className="text-slate-400" />
            <h3 className="text-lg font-extrabold text-white">Not available yet</h3>
            <Badge status="planned" />
          </div>
          <p className="max-w-3xl leading-relaxed text-slate-400">A public REST API, an OpenAPI spec, webhooks, and tools that change things. If there is something you would build with them, tell us.</p>
          <Link href="/contact-us" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-sky-400 hover:text-sky-300">
            Tell us what you would build <ArrowRight size={14} />
          </Link>
        </div>
      </Section>

      <section className="relative overflow-hidden border-t border-white/10">
        <div className="ai-aurora">
          <i className="left-1/4 top-0 h-[480px] w-[480px] bg-blue-600" />
          <i className="right-1/4 bottom-0 h-[420px] w-[420px] bg-violet-600" style={{ animationDelay: "-8s" }} />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center">
          <h2 className="mb-6 text-4xl font-black tracking-tight md:text-7xl">Give your agent <span className="ai-glow-text">something real</span> to work with.</h2>
          <p className="mb-10 text-lg text-slate-300">Start with Apex, then connect your agent in a few minutes.</p>
          <CheckoutLink href={TRIAL_CHECKOUT_URL} className="ai-border inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-10 py-5 text-sm font-black uppercase tracking-widest text-white shadow-[0_20px_60px_rgba(14,165,233,0.45)] transition hover:bg-sky-400">
            {trialCta} <ArrowRight size={16} />
          </CheckoutLink>
        </div>
      </section>
    </main>
  );
}
