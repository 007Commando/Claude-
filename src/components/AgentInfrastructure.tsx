"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useScroll, useSpring } from "motion/react";
import { ArrowRight, Check, Copy } from "lucide-react";

import CheckoutLink from "./CheckoutLink";
import AgentBus, { BUS_NODES } from "./agent/AgentBus";
import { TRIAL_CHECKOUT_URL, trialCta } from "../config/offer";

/**
 * /ai: Apex as the layer an AI agent connects through.
 *
 * Every statement was checked against the code and the live endpoint (see
 * marketing-exports/agent-infrastructure-landing/PLAN.md). The rule for editing
 * it: a thing is "Live" only if a seller can use it today. Anything else is
 * "Planned", with no dates. Flip a badge when the tool ships, not before.
 *
 * Figures carry no date stamp and are rounded down from production counts.
 * They are catalog scale, not price freshness, and the footnote says so.
 *
 * Client logos in the diagram say "speaks standard MCP", not "partner". Only
 * Claude is what the connector was built for; the rest are described as untested.
 */

type Status = "live" | "beta" | "planned";

const BADGE: Record<Status, string> = {
  live: "bg-emerald-400/10 text-emerald-300 border-emerald-400/25",
  beta: "bg-amber-400/10 text-amber-300 border-amber-400/25",
  planned: "bg-slate-400/10 text-slate-400 border-slate-400/25",
};
const BADGE_LABEL: Record<Status, string> = { live: "Live", beta: "Beta", planned: "Planned" };

function Badge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${BADGE[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "live" ? "bg-emerald-400 ai-pulse" : status === "beta" ? "bg-amber-400" : "bg-slate-500"}`} />
      {BADGE_LABEL[status]}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Primitives                                                        */
/* ---------------------------------------------------------------- */

function Count({ to, suffix, decimals = 0 }: { to: number; suffix: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1500);
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
      className={`ai-spot relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] ${className}`}
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

const rise = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: "easeOut" },
} as const;

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
      <motion.div {...rise} className="mb-8 flex flex-col gap-2 md:mb-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-sky-400">{eyebrow}</p>
        <h2 className="max-w-3xl text-3xl font-black tracking-tight text-white md:text-5xl">{title}</h2>
      </motion.div>
      {children}
    </section>
  );
}

function Words({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom" aria-hidden="true">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Hero diagram                                                      */
/* ---------------------------------------------------------------- */

function HeroBus() {
  const [mode, setMode] = useState<"today" | "planned">("planned");
  const [hovered, setHovered] = useState<string | null>(null);
  const node = BUS_NODES.find((n) => n.id === hovered);
  const nodeBadge: Status | null = node && node.status !== "client" ? node.status : null;

  return (
    <div className="relative mx-auto max-w-7xl px-3 sm:px-6">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.14),transparent_70%)]">
        <AgentBus mode={mode} hovered={hovered} onHover={setHovered} />
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-between px-6 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 sm:px-12">
          <span>Your AI agent</span>
          <span className="hidden sm:inline">Apex layer</span>
          <span>Your Amazon business</span>
        </div>
        <div className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 sm:block">
          <div className="inline-flex rounded-full border border-white/15 bg-slate-950/70 p-0.5 text-xs font-semibold backdrop-blur">
            {(["today", "planned"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`rounded-full px-4 py-1.5 transition ${mode === m ? "bg-white text-slate-950" : "text-slate-300 hover:text-white"}`}>
                {m === "today" ? "Today" : "Today and planned"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center sm:hidden">
        <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-0.5 text-xs font-semibold">
          {(["today", "planned"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`rounded-full px-4 py-1.5 ${mode === m ? "bg-white text-slate-950" : "text-slate-300"}`}>
              {m === "today" ? "Today" : "Today and planned"}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-3 min-h-[76px] max-w-3xl rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center">
        {node ? (
          <>
            <div className="mb-1 flex items-center justify-center gap-3">
              <span className="font-extrabold text-white">{node.title}</span>
              {nodeBadge ? <Badge status={nodeBadge} /> : <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">MCP client</span>}
            </div>
            <p className="text-[13px] leading-relaxed text-slate-400">{node.caption}</p>
          </>
        ) : (
          <p className="text-[13px] leading-relaxed text-slate-400">
            Hover or tap a node. Blue packets are requests, green packets are answers. Every read passes a key check and a permission check inside Apex first. Logos show MCP compatibility; Apex is independent of those companies.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* How a call works                                                  */
/* ---------------------------------------------------------------- */

const STEPS: { t: string; d: string; status: Status }[] = [
  { t: "Agent asks", d: "Standard MCP request with your key", status: "live" },
  { t: "Key check", d: "One account, one user", status: "live" },
  { t: "Permission check", d: "The page's own rules", status: "live" },
  { t: "Read-only tool", d: "The app's own query", status: "live" },
  { t: "Trimmed answer", d: "Shaped to fit a model", status: "live" },
];

const TERMINAL: { c: string; t: string }[] = [
  { c: "text-sky-300", t: "> tools/call get_restock_recommendations" },
  { c: "text-slate-500", t: "  key        apx_••••••••3f9a" },
  { c: "text-emerald-300", t: "  key check  account resolved" },
  { c: "text-emerald-300", t: "  permission same rules as the page: passed" },
  { c: "text-emerald-300", t: "  mode       read-only" },
  { c: "text-slate-300", t: '  { "items": [ { "title": "Example product A",' },
  { c: "text-slate-300", t: '      "daysOfInventory": 6, "recommendedQty": 120 } ] }' },
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
      if (c > total + 80) c = 0;
      setChars(Math.min(c, total));
    }, 30);
    return () => clearInterval(id);
  }, [inView, total]);

  let left = chars;
  return (
    <div ref={ref} className="overflow-hidden rounded-xl border border-white/10 bg-black/60 shadow-[0_24px_80px_rgba(37,99,235,0.2)]">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" /><span className="h-2.5 w-2.5 rounded-full bg-white/20" /><span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="ml-3 text-[11px] text-slate-500">apex mcp session</span>
        <span className="ml-auto text-[10px] text-slate-600">example output, illustrative values</span>
      </div>
      <div className="min-h-[196px] whitespace-pre-wrap break-words p-5 font-mono text-[12px] leading-6">
        {TERMINAL.map((l, i) => {
          const shown = Math.max(0, Math.min(l.t.length, left));
          left -= l.t.length + 1;
          return <div key={i} className={l.c}>{l.t.slice(0, shown)}{shown > 0 && shown < l.t.length ? <span className="ai-caret">▍</span> : null}</div>;
        })}
      </div>
    </div>
  );
}

function Pipeline() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <div>
      <div className="relative grid gap-2 sm:grid-cols-5">
        <div className="pointer-events-none absolute left-0 right-0 top-[26px] hidden h-px bg-white/10 sm:block">
          <div className="ai-travel absolute top-[-2px] h-[5px] w-16 rounded-full bg-gradient-to-r from-transparent via-sky-400 to-transparent" />
        </div>
        {STEPS.map((s, i) => (
          <div key={s.t} className="relative text-center">
            <div className={`relative z-10 mx-auto mb-3 flex h-[52px] w-[52px] items-center justify-center rounded-2xl border font-mono text-sm font-bold transition-all duration-500 ${active === i ? "scale-110 border-sky-400 bg-sky-400 text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.55)]" : active > i ? "border-sky-400/40 bg-sky-400/10 text-sky-300" : "border-white/15 bg-slate-950 text-slate-500"}`}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="text-sm font-extrabold text-white">{s.t}</div>
            <div className="text-xs text-slate-500">{s.d}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {[["Approval gate", "You confirm any change before it happens"], ["Audit log", "Every agent call recorded and viewable"]].map(([t, d]) => (
          <div key={t} className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-white/15 px-4 py-3">
            <div><div className="text-sm font-bold text-slate-300">{t}</div><div className="text-xs text-slate-500">{d}</div></div>
            <Badge status="planned" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Flows                                                             */
/* ---------------------------------------------------------------- */

interface Flow { tab: string; title: string; status: Status; ask: string; answer: string; tools: string[]; note?: string }

const FLOWS: Flow[] = [
  { tab: "Restock", title: "Restock analysis", status: "live", ask: "What should I reorder this week?",
    answer: "Lists the profitable products you already sell that are lowest on stock, with days of inventory left and a recommended quantity, so you can go straight to the purchase order.",
    tools: ["get_restock_recommendations", "get_inventory"] },
  { tab: "Catalog", title: "Catalog analysis", status: "live", ask: "Which items in my latest supplier list are worth buying?",
    answer: "Reads the scan you already ran on that supplier's catalog and ranks the matches by profit or ROI, with Amazon price, rank and seller counts beside each.",
    tools: ["list_catalog_scans", "get_catalog_scan_results"] },
  { tab: "Market intel", title: "Market intel from your own database", status: "live", ask: "What profitable products am I missing?",
    answer: "Finds profitable ASINs in your product database that you are not selling yet, best profit first, and points out structural gaps such as too few suppliers.",
    tools: ["get_profitable_opportunities", "get_growth_gaps", "search_products"],
    note: "Works from the products and suppliers in your account, not an open market search." },
  { tab: "Repricing", title: "Repricing review", status: "beta", ask: "What has the repricer earned me, and where is MAP a risk?",
    answer: "Shows what repricing changed and what it was worth, and which brands have listings under MAP risk. Reading is available now. Letting an agent change prices is planned, with your approval.",
    tools: ["get_repricer_listings", "get_repricer_impact", "get_map_compliance"],
    note: "The repricer itself is in Beta." },
  { tab: "PO creation", title: "Purchase order creation", status: "planned", ask: "Draft a PO for those three reorders.",
    answer: "Planned. The agent will prepare a draft purchase order and show it to you. Nothing is created or sent to a supplier until you approve it.",
    tools: [], note: "No tool exists for this yet." },
];

function Flows() {
  const [i, setI] = useState(0);
  const f = FLOWS[i];
  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {FLOWS.map((x, k) => (
          <button
            key={x.tab}
            onClick={() => setI(k)}
            className={`relative flex shrink-0 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${i === k ? "border-sky-400/50 bg-sky-400/10 text-white" : "border-white/10 text-slate-400 hover:border-white/25 hover:text-white"}`}
          >
            {x.tab}
            <span className={`h-1.5 w-1.5 rounded-full ${x.status === "live" ? "bg-emerald-400" : x.status === "beta" ? "bg-amber-400" : "bg-slate-500"}`} />
          </button>
        ))}
      </div>
      <Spotlight className="min-h-[300px] p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div key={f.tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-lg font-extrabold text-white">{f.title}</h3>
              <Badge status={f.status} />
            </div>
            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="mb-3 ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-sky-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_10px_30px_rgba(14,165,233,0.3)] sm:max-w-[70%]">
              {f.ask}
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55, duration: 0.45 }} className="mb-4 max-w-[95%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-relaxed text-slate-300 sm:max-w-[85%]">
              {f.answer}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
              {f.note && <p className="mb-3 text-xs text-slate-500">{f.note}</p>}
              {f.tools.length ? (
                <div className="flex flex-wrap gap-2">{f.tools.map((t) => <code key={t} className="rounded-md border border-white/10 bg-black/50 px-2 py-1 text-[11px] text-sky-200">{t}</code>)}</div>
              ) : (
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tool not built yet</p>
              )}
              <p className="mt-4 text-[11px] text-slate-600">Illustrative conversation, not real seller data.</p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </Spotlight>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Data and control                                                  */
/* ---------------------------------------------------------------- */

const DATA: { to: number; suffix: string; decimals?: number; label: string }[] = [
  { to: 120, suffix: "M+", label: "ASINs in the Apex catalog" },
  { to: 98, suffix: "M+", label: "identifiers for UPC matching" },
  { to: 1.8, suffix: "M+", decimals: 1, label: "seller orders synced" },
  { to: 290, suffix: "k+", label: "seller products tracked" },
];

const CONTROLS: { name: string; status: Status }[] = [
  { name: "Per-seller keys, hashed, shown once", status: "live" },
  { name: "Instant revoke from Settings", status: "live" },
  { name: "Permissions carried through", status: "live" },
  { name: "Read-only tools", status: "live" },
  { name: "Per-tool scopes", status: "planned" },
  { name: "Audit log", status: "planned" },
  { name: "Human approval for changes", status: "planned" },
  { name: "Rate limits per key", status: "planned" },
  { name: "Sign in with OAuth", status: "planned" },
];

/* ---------------------------------------------------------------- */
/* Developers                                                        */
/* ---------------------------------------------------------------- */

const TOOL_NAMES = [
  "get_business_snapshot", "get_profitable_opportunities", "get_restock_recommendations", "get_growth_gaps",
  "get_profit_and_loss", "get_profit_and_loss_statement", "search_products", "list_catalog_scans",
  "get_catalog_scan_results", "get_repricer_listings", "get_repricer_impact", "get_map_compliance", "get_inventory",
];

const SNIPPETS: { tab: string; label: string; code: string; note?: string }[] = [
  {
    tab: "Claude Code",
    label: "Add Apex as an MCP server",
    code: `claude mcp add --transport http apex \\
  https://app.apexapplications.io/api/mcp \\
  --header "Authorization: Bearer apx_YOUR_KEY"`,
  },
  {
    tab: "curl",
    label: "List the tools",
    code: `curl -s https://app.apexapplications.io/api/mcp \\
  -H "Authorization: Bearer apx_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`,
  },
  {
    tab: "Claude.ai",
    label: "Custom connector URL",
    code: `https://app.apexapplications.io/api/mcp/apx_YOUR_KEY`,
    note: "Claude.ai connectors only accept a URL, so the key goes in the path. A URL can end up in logs, so revoke test keys.",
  },
];

function Developers() {
  const [i, setI] = useState(0);
  const [copied, setCopied] = useState(false);
  const s = SNIPPETS[i];
  const strip = [...TOOL_NAMES, ...TOOL_NAMES];
  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/50">
        <div className="flex items-center gap-1 border-b border-white/10 px-3 py-2">
          {SNIPPETS.map((x, k) => (
            <button key={x.tab} onClick={() => setI(k)} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${i === k ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-200"}`}>{x.tab}</button>
          ))}
          <button
            onClick={() => { navigator.clipboard?.writeText(s.code); setCopied(true); setTimeout(() => setCopied(false), 1300); }}
            className="ml-auto inline-flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={s.tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="p-5">
            <div className="mb-2 text-xs font-semibold text-slate-500">{s.label}</div>
            <pre className="overflow-x-auto text-[13px] leading-relaxed text-sky-100"><code>{s.code}</code></pre>
            {s.note && <p className="mt-3 text-xs text-slate-500">{s.note}</p>}
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Create a key under Settings, then Claude connector. Without a key the endpoint answers 401. Without the plan or permission a tool needs, it refuses in plain words.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <span className="text-sm font-bold text-white">13 tools</span><Badge status="live" /><span className="text-xs text-slate-500">All read-only. Lists are capped to fit a model.</span>
      </div>
      <div className="mt-3 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="ai-marquee gap-2 pr-2" style={{ animationDuration: "60s" }}>
          {strip.map((n, k) => <code key={`${n}-${k}`} className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-sky-200">{n}</code>)}
        </div>
      </div>
      <div className="mt-2 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="ai-marquee gap-2 pr-2" style={{ animationDuration: "75s", animationDirection: "reverse" }}>
          {[...strip].reverse().map((n, k) => <code key={`${n}-r${k}`} className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-sky-200">{n}</code>)}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-2 rounded-xl border border-dashed border-white/15 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Badge status="planned" /> Public REST API, OpenAPI spec, webhooks, and tools that change things.
        </div>
        <Link href="/contact-us" className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-400 hover:text-sky-300">
          Tell us what you would build <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Page                                                              */
/* ---------------------------------------------------------------- */

const CSS = `
.ai-page{background:#04060f;color:#fff}
.ai-aurora{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.ai-aurora i{position:absolute;border-radius:9999px;filter:blur(120px);opacity:.5;animation:ai-drift 18s ease-in-out infinite alternate}
@keyframes ai-drift{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(80px,60px,0) scale(1.15)}}
.ai-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(96,165,250,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(96,165,250,.06) 1px,transparent 1px);background-size:64px 64px;mask-image:radial-gradient(ellipse at 50% 20%,#000 20%,transparent 75%);animation:ai-grid 20s linear infinite}
@keyframes ai-grid{to{background-position:64px 64px}}
.ai-spot::before{content:"";position:absolute;inset:0;background:radial-gradient(420px circle at var(--mx,50%) var(--my,-20%),rgba(56,189,248,.14),transparent 60%);opacity:0;transition:opacity .3s;pointer-events:none}
.ai-spot:hover::before{opacity:1}
.ai-pulse{animation:ai-pulse 1.8s ease-in-out infinite}
@keyframes ai-pulse{0%,100%{box-shadow:0 0 0 0 rgba(52,211,153,.6)}50%{box-shadow:0 0 0 5px rgba(52,211,153,0)}}
.ai-caret{animation:ai-blink 1s steps(2) infinite;color:#7dd3fc}
@keyframes ai-blink{50%{opacity:0}}
.ai-marquee{display:flex;width:max-content;animation:ai-scroll 40s linear infinite}
.ai-marquee:hover{animation-play-state:paused}
@keyframes ai-scroll{to{transform:translateX(-50%)}}
.ai-travel{animation:ai-travel 2.8s cubic-bezier(.4,0,.2,1) infinite}
@keyframes ai-travel{from{left:-4rem}to{left:100%}}
.ai-glow-text{background:linear-gradient(100deg,#7dd3fc,#60a5fa 35%,#a78bfa 65%,#7dd3fc);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:ai-shimmer 6s linear infinite}
@keyframes ai-shimmer{to{background-position:200% 0}}
.ai-border{position:relative}
.ai-border::before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1px;background:conic-gradient(from var(--a,0deg),transparent 0 70%,#38bdf8,#a78bfa,transparent);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:ai-spin 5s linear infinite;pointer-events:none}
@property --a{syntax:"<angle>";inherits:false;initial-value:0deg}
@keyframes ai-spin{to{--a:360deg}}
@media (prefers-reduced-motion:reduce){.ai-aurora i,.ai-marquee,.ai-pulse,.ai-border::before,.ai-grid,.ai-glow-text,.ai-travel{animation:none}}
`;

export default function AgentInfrastructure() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <main className="ai-page">
      <style>{CSS}</style>
      <motion.div className="fixed left-0 right-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500" style={{ scaleX: progress }} />

      {/* Hero: headline, one line, diagram */}
      <section className="relative overflow-hidden pb-10 pt-24 md:pt-28">
        <div className="ai-aurora">
          <i className="-left-40 -top-40 h-[560px] w-[560px] bg-blue-600" />
          <i className="-right-40 top-20 h-[460px] w-[460px] bg-violet-600" style={{ animationDelay: "-6s" }} />
        </div>
        <div className="ai-grid" />
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-sky-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 ai-pulse" /> MCP server live
          </motion.p>
          <h1 className="mx-auto mb-4 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
            <Words text="The Amazon layer your" delay={0.1} />
            <Words text="AI agents plug into." className="ai-glow-text" delay={0.35} />
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mx-auto mb-6 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg"
          >
            Connect Claude or any MCP agent to your wholesale business. Your catalog, costs, profit and repricing data, with your permissions on every call.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <a href="#developers" className="ai-border inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[0_16px_50px_rgba(14,165,233,0.4)] transition hover:bg-sky-400">
              Connect your agent <ArrowRight size={14} />
            </a>
            <CheckoutLink href={TRIAL_CHECKOUT_URL} className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/10">
              {trialCta}
            </CheckoutLink>
          </motion.div>
        </div>
        <motion.div className="relative" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.5 }}>
          <HeroBus />
        </motion.div>
        <p className="relative mt-5 flex items-center justify-center gap-2 px-6 text-center text-xs text-slate-500">
          <Check size={14} className="shrink-0 text-emerald-400" /> Read-only today. Actions with your approval are coming.
        </p>
      </section>

      <Section id="how" eyebrow="How a call works" title="Every request passes the gate first.">
        <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_1fr]">
          <Pipeline />
          <motion.div {...rise}><Terminal /></motion.div>
        </div>
      </Section>

      <Section id="flows" eyebrow="What you can ask" title="Four flows work today. One is planned.">
        <motion.div {...rise}><Flows /></motion.div>
      </Section>

      <Section id="trust" eyebrow="Data and control" title="Real data. You hold the keys.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DATA.map((d, i) => (
            <motion.div key={d.label} {...rise} transition={{ ...rise.transition, delay: i * 0.06 }}>
              <Spotlight className="p-5">
                <div className="ai-glow-text text-4xl font-black tracking-tight"><Count to={d.to} suffix={d.suffix} decimals={d.decimals} /></div>
                <div className="mt-1 text-sm text-slate-400">{d.label}</div>
              </Spotlight>
            </motion.div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">Catalog scale, not price freshness: prices and offers refresh for the listings Apex tracks. Your account data is yours alone.</p>
        <motion.div {...rise} className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CONTROLS.map((c) => (
            <div key={c.name} className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${c.status === "planned" ? "border-dashed border-white/15" : "border-white/10 bg-white/[0.03]"}`}>
              <span className={`text-sm font-semibold ${c.status === "planned" ? "text-slate-400" : "text-white"}`}>{c.name}</span>
              <Badge status={c.status} />
            </div>
          ))}
        </motion.div>
      </Section>

      <Section id="developers" eyebrow="Developers" title="Connect over MCP in a minute.">
        <motion.div {...rise}><Developers /></motion.div>
      </Section>

      <section className="relative overflow-hidden border-t border-white/10">
        <div className="ai-aurora">
          <i className="left-1/4 top-0 h-[360px] w-[360px] bg-blue-600" />
          <i className="bottom-0 right-1/4 h-[320px] w-[320px] bg-violet-600" style={{ animationDelay: "-8s" }} />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="mb-5 text-3xl font-black tracking-tight md:text-5xl">Give your agent <span className="ai-glow-text">something real</span> to work with.</h2>
          <CheckoutLink href={TRIAL_CHECKOUT_URL} className="ai-border inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-[0_16px_50px_rgba(14,165,233,0.4)] transition hover:bg-sky-400">
            {trialCta} <ArrowRight size={14} />
          </CheckoutLink>
          <p className="mt-6 text-[11px] text-slate-600">Claude, ChatGPT, Gemini and Cursor are trademarks of their owners. Apex is independent and not affiliated with them.</p>
        </div>
      </section>
    </main>
  );
}
