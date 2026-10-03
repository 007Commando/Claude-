"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check, Clock3 } from "lucide-react";

import CheckoutLink from "./CheckoutLink";
import { TRIAL_CHECKOUT_URL, trialCta } from "../config/offer";

/**
 * /ai: Apex as the layer an AI agent connects through.
 *
 * Every statement here was checked against the code and the live endpoint
 * (see marketing-exports/agent-infrastructure-landing/PLAN.md). The rule for
 * editing it: a thing is "Live" only if a seller can use it today. Anything
 * else is "Planned", with no dates. Flip a badge when the tool ships, not
 * before.
 *
 * Figures in DATA are rounded down from production counts and carry no date
 * stamp. They are catalog scale, not price freshness, and the footnote says so.
 */

type Status = "live" | "beta" | "planned";

const STATUS_STYLE: Record<Status, string> = {
  live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  beta: "bg-amber-50 text-amber-700 border-amber-200",
  planned: "bg-slate-100 text-slate-500 border-slate-200",
};
const STATUS_LABEL: Record<Status, string> = { live: "Live", beta: "Beta", planned: "Planned" };

function Badge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram                                                             */
/* ------------------------------------------------------------------ */

interface DiagramNode {
  id: string;
  col: 0 | 1 | 2 | 3;
  row: number; // 0..3 within its column
  rows: number; // how many nodes share the column
  title: string;
  sub: string;
  status: Status;
  caption: string;
}

const NODES: DiagramNode[] = [
  { id: "seller", col: 0, row: 0, rows: 1, title: "You", sub: "Ask in plain English", status: "live",
    caption: "You ask a question in your own words. You stay the owner of the account and the one who decides what an agent may see." },
  { id: "agent", col: 1, row: 0, rows: 1, title: "AI agent", sub: "Claude or any MCP client", status: "live",
    caption: "Any client that speaks the Model Context Protocol can connect with a key you create in Apex. The agent never talks to Amazon directly." },
  { id: "key", col: 2, row: 0, rows: 4, title: "Key check", sub: "Your key, your account", status: "live",
    caption: "Each connector key is tied to one account and one user, stored hashed, shown once, and revocable. The account always comes from the key, never from the prompt." },
  { id: "perm", col: 2, row: 1, rows: 4, title: "Permission check", sub: "Same rules as the app", status: "live",
    caption: "Each tool runs the same subscription and permission checks as the page it mirrors. An assistant who cannot open Analytics in the app cannot ask for the P&L either." },
  { id: "approve", col: 2, row: 2, rows: 4, title: "Approval gate", sub: "You confirm any change", status: "planned",
    caption: "Planned. When actions arrive, an agent will only be able to propose a change. A signed-in person approves it before anything happens." },
  { id: "audit", col: 2, row: 3, rows: 4, title: "Audit log", sub: "Every call recorded", status: "planned",
    caption: "Planned. A log of every agent call, viewable in Settings, with the key, the tool and the time." },
  { id: "amazon", col: 3, row: 0, rows: 3, title: "Your Amazon data", sub: "Orders, inventory, fees", status: "live",
    caption: "Apex syncs your own Amazon account's orders, inventory and fees every few minutes. Agents read that synced data, not Amazon itself." },
  { id: "data", col: 3, row: 1, rows: 3, title: "Catalog and brands", sub: "Products, scans, offers", status: "live",
    caption: "Your product database, supplier catalog scans and repricer offer history, backed by Apex's Amazon catalog." },
  { id: "tools", col: 3, row: 2, rows: 3, title: "Apex tools", sub: "P&L, restock, repricer, POs", status: "live",
    caption: "Reading P&L, restock, repricer and scan results works today. Creating purchase orders or changing prices from an agent is planned, behind the approval gate." },
];

interface Edge { from: string; to: string; status: Status }
const EDGES: Edge[] = [
  { from: "seller", to: "agent", status: "live" },
  { from: "agent", to: "key", status: "live" },
  { from: "key", to: "perm", status: "live" },
  { from: "perm", to: "amazon", status: "live" },
  { from: "perm", to: "data", status: "live" },
  { from: "perm", to: "tools", status: "live" },
  { from: "perm", to: "approve", status: "planned" },
  { from: "approve", to: "tools", status: "planned" },
  { from: "perm", to: "audit", status: "planned" },
];

const W = 1000;
const H = 460;
const COL_X = [105, 350, 625, 895];
const NODE_W = 190;
const NODE_H = 78;

function pos(n: DiagramNode) {
  const gap = H / n.rows;
  return { x: COL_X[n.col], y: gap * n.row + gap / 2 };
}

function Diagram() {
  const [mode, setMode] = useState<"today" | "planned">("planned");
  const [selected, setSelected] = useState<string>("perm");
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  const active = byId[selected];
  const hidden = (s: Status) => mode === "today" && s === "planned";

  const connected = new Set<string>([selected]);
  EDGES.forEach((e) => {
    if (e.from === selected) connected.add(e.to);
    if (e.to === selected) connected.add(e.from);
  });

  return (
    <div>
      <div className="mb-6 inline-flex rounded-full border border-slate-200 bg-white p-1 text-sm font-semibold">
        {(["today", "planned"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full px-5 py-2 transition ${mode === m ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}
          >
            {m === "today" ? "Today" : "Today and planned"}
          </button>
        ))}
      </div>

      {/* Wide screens: connected diagram */}
      <div className="hidden md:block rounded-3xl border border-slate-200 bg-white p-4">
        <div className="mb-1 grid grid-cols-4 px-2 text-center text-[11px] font-bold uppercase tracking-widest text-slate-400">
          <span>Seller</span><span>AI</span><span>Apex</span><span>Amazon, data, tools</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Seller to AI agent to Apex to Amazon data and tools">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" fill="#94a3b8" />
            </marker>
          </defs>
          {EDGES.map((e) => {
            const a = pos(byId[e.from]);
            const b = pos(byId[e.to]);
            const x1 = a.x + NODE_W / 2;
            const x2 = b.x - NODE_W / 2;
            const vertical = byId[e.from].col === byId[e.to].col;
            const d = vertical
              ? `M ${a.x} ${a.y + NODE_H / 2} L ${b.x} ${b.y - NODE_H / 2}`
              : `M ${x1} ${a.y} C ${x1 + 40} ${a.y}, ${x2 - 40} ${b.y}, ${x2} ${b.y}`;
            const hot = e.from === selected || e.to === selected;
            return (
              <path
                key={`${e.from}-${e.to}`}
                d={d}
                fill="none"
                stroke={hot ? "#2563eb" : "#cbd5e1"}
                strokeWidth={hot ? 2.5 : 1.75}
                strokeDasharray={e.status === "planned" ? "6 6" : undefined}
                markerEnd="url(#arrow)"
                opacity={hidden(e.status) ? 0.1 : 1}
                style={{ transition: "opacity .25s, stroke .2s" }}
              />
            );
          })}
          {NODES.map((n) => {
            const p = pos(n);
            const isSel = n.id === selected;
            const dim = hidden(n.status) || !connected.has(n.id);
            const planned = n.status === "planned";
            return (
              <g
                key={n.id}
                transform={`translate(${p.x - NODE_W / 2} ${p.y - NODE_H / 2})`}
                onMouseEnter={() => setSelected(n.id)}
                onClick={() => setSelected(n.id)}
                style={{ cursor: "pointer", opacity: hidden(n.status) ? 0.12 : dim ? 0.7 : 1, transition: "opacity .25s" }}
                tabIndex={0}
                onFocus={() => setSelected(n.id)}
              >
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx={16}
                  fill={isSel ? "#eff6ff" : "#ffffff"}
                  stroke={isSel ? "#2563eb" : "#cbd5e1"}
                  strokeWidth={isSel ? 2.5 : 1.5}
                  strokeDasharray={planned ? "6 5" : undefined}
                />
                <text x={NODE_W / 2} y={33} textAnchor="middle" fontSize={17} fontWeight={800} fill="#0f172a">{n.title}</text>
                <text x={NODE_W / 2} y={56} textAnchor="middle" fontSize={12.5} fill="#64748b">{n.sub}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Phones: stacked list */}
      <div className="md:hidden space-y-2">
        {NODES.filter((n) => !hidden(n.status)).map((n) => (
          <button
            key={n.id}
            onClick={() => setSelected(n.id)}
            className={`w-full rounded-2xl border p-4 text-left ${selected === n.id ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white"} ${n.status === "planned" ? "border-dashed" : ""}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-extrabold text-slate-900">{n.title}</span>
              <Badge status={n.status} />
            </div>
            <div className="text-sm text-slate-500">{n.sub}</div>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-2 flex items-center gap-3">
          <h3 className="text-lg font-extrabold text-slate-900">{active.title}</h3>
          <Badge status={active.status} />
        </div>
        <p className="text-slate-600 leading-relaxed">{active.caption}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Flows                                                               */
/* ------------------------------------------------------------------ */

interface Flow {
  title: string;
  status: Status;
  ask: string;
  answer: string;
  tools: string[];
  note?: string;
}

const FLOWS: Flow[] = [
  {
    title: "Restock analysis",
    status: "live",
    ask: "What should I reorder this week?",
    answer:
      "Lists the profitable products you already sell that are lowest on stock, with days of inventory left and a recommended quantity, so you can go straight to the purchase order.",
    tools: ["get_restock_recommendations", "get_inventory"],
  },
  {
    title: "Catalog analysis",
    status: "live",
    ask: "Which items in my latest supplier list are worth buying?",
    answer:
      "Reads the scan you already ran on that supplier's catalog and ranks the matches by profit or ROI, with Amazon price, rank and seller counts beside each.",
    tools: ["list_catalog_scans", "get_catalog_scan_results"],
  },
  {
    title: "Market intel from your own database",
    status: "live",
    ask: "What profitable products am I missing?",
    answer:
      "Finds profitable ASINs in your product database that you are not selling yet, best profit first, and points out structural gaps such as too few suppliers.",
    tools: ["get_profitable_opportunities", "get_growth_gaps", "search_products"],
    note: "Works from the products and suppliers in your account, not an open market search.",
  },
  {
    title: "Repricing review",
    status: "beta",
    ask: "What has the repricer actually earned me, and where is MAP a risk?",
    answer:
      "Shows what repricing changed and what it was worth, and which brands have listings under MAP risk. Reading is available now. Letting an agent change prices is planned, with your approval.",
    tools: ["get_repricer_listings", "get_repricer_impact", "get_map_compliance"],
    note: "The repricer itself is in Beta.",
  },
  {
    title: "Purchase order creation",
    status: "planned",
    ask: "Draft a PO for those three reorders.",
    answer:
      "Planned. The agent will prepare a draft purchase order and show it to you. Nothing is created or sent to a supplier until you approve it.",
    tools: [],
    note: "No tool exists for this yet.",
  },
];

function Flows() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {FLOWS.map((f) => (
        <div key={f.title} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <h3 className="text-xl font-extrabold text-slate-900">{f.title}</h3>
            <Badge status={f.status} />
          </div>
          <div className="mb-3 self-end max-w-[90%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white">
            {f.ask}
          </div>
          <div className="mb-4 max-w-[95%] rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-700">
            {f.answer}
          </div>
          {f.note && <p className="mb-3 text-xs text-slate-500">{f.note}</p>}
          <div className="mt-auto">
            {f.tools.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {f.tools.map((t) => (
                  <code key={t} className="rounded-md bg-slate-900 px-2 py-1 text-[11px] text-slate-100">{t}</code>
                ))}
              </div>
            ) : (
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tool not built yet</p>
            )}
          </div>
        </div>
      ))}
      <p className="md:col-span-2 text-xs text-slate-400">
        Conversations are illustrations of what each flow does, not real seller data.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const DATA: { value: string; label: string }[] = [
  { value: "120M+", label: "ASINs in the Apex catalog" },
  { value: "90M+", label: "with the brand attached" },
  { value: "65M+", label: "with a sales rank" },
  { value: "98M+", label: "product identifiers for UPC matching" },
  { value: "1.7M+", label: "brand names" },
  { value: "1.8M+", label: "seller orders synced" },
  { value: "290k+", label: "seller products tracked" },
  { value: "1M+", label: "offer snapshots for repricing" },
];

/* ------------------------------------------------------------------ */
/* Security                                                            */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Developers                                                          */
/* ------------------------------------------------------------------ */

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

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-2xl bg-slate-900 p-5 text-[13px] leading-relaxed text-slate-100">
      <code>{children}</code>
    </pre>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: "easeOut" },
} as const;

function Section({ id, eyebrow, title, intro, children }: { id: string; eyebrow: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-20">
      <motion.div {...fade}>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-600">{eyebrow}</p>
        <h2 className="mb-4 max-w-3xl text-4xl font-black tracking-tight text-slate-900 md:text-5xl">{title}</h2>
        {intro && <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-500">{intro}</p>}
        {children}
      </motion.div>
    </section>
  );
}

export default function AgentInfrastructure() {
  return (
    <main className="bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="pointer-events-none absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-blue-600/40 blur-[140px]" />
        <div className="pointer-events-none absolute -bottom-52 -right-40 h-[520px] w-[520px] rounded-full bg-violet-600/30 blur-[140px]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-28 md:pt-36">
          <motion.div {...{ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } }}>
            <p className="mb-6 text-xs font-bold uppercase tracking-widest text-blue-300">Apex for AI agents</p>
            <h1 className="mb-8 max-w-4xl text-5xl font-black leading-[1.03] tracking-tight md:text-7xl">
              The Amazon layer your <span className="text-blue-400">AI agents</span> plug into.
            </h1>
            <p className="mb-10 max-w-2xl text-xl leading-relaxed text-slate-300">
              Connect Claude or any MCP-compatible agent to your Amazon wholesale business through Apex: your catalog, costs, profit and repricing data, with your permissions on every call.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <a href="#developers" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:bg-blue-500">
                Connect your agent <ArrowRight size={16} />
              </a>
              <CheckoutLink
                href={TRIAL_CHECKOUT_URL}
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:bg-white/10"
              >
                {trialCta}
              </CheckoutLink>
            </div>
            <p className="mt-8 flex items-center gap-2 text-sm text-slate-400">
              <Check size={16} className="text-emerald-400" /> Today it is read-only. Actions with your approval are coming.
            </p>
          </motion.div>
        </div>
      </section>

      <Section
        id="how"
        eyebrow="How it connects"
        title="Seller, AI, Apex, Amazon."
        intro="The agent never touches Amazon. It asks Apex, and Apex applies your keys and permissions before it answers. Select any step."
      >
        <Diagram />
      </Section>

      <Section
        id="flows"
        eyebrow="What you can ask"
        title="Five flows, with the truth about each."
        intro="Four work today. The fifth is planned and says so."
      >
        <Flows />
      </Section>

      <Section
        id="data"
        eyebrow="Data underneath"
        title="A catalog built for matching suppliers to Amazon."
        intro="The scale behind the answers your agent gets."
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {DATA.map((d) => (
            <div key={d.label} className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="text-4xl font-black tracking-tight text-slate-900">{d.value}</div>
              <div className="mt-2 text-sm text-slate-500">{d.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-sm text-slate-500">
          This is catalog scale. Prices and offers are refreshed continuously for the listings Apex tracks, not for every ASIN at once. Your own account data is yours alone: other sellers never see it.
        </p>
      </Section>

      <Section
        id="why"
        eyebrow="The difference"
        title="Built as infrastructure, not as another dashboard."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["Your data in, not just public data out", "Answers come from your own costs, fees, orders and suppliers as well as the catalog."],
            ["The same rules as the app", "Every tool runs the page's own permission checks, so an agent cannot see more than the person who connected it."],
            ["Read first, act later", "Nothing an agent does today can change your account. Changes will wait for your approval."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-3xl border border-slate-200 bg-white p-7">
              <h3 className="mb-3 text-xl font-extrabold text-slate-900">{t}</h3>
              <p className="leading-relaxed text-slate-500">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="security"
        eyebrow="Security and control"
        title="You decide what an agent can do."
        intro="What is in place now, and what we are building next."
      >
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          {CONTROLS.map((c, i) => (
            <div key={c.name} className={`flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between ${i ? "border-t border-slate-100" : ""}`}>
              <div>
                <div className="font-extrabold text-slate-900">{c.name}</div>
                <div className="text-sm text-slate-500">{c.detail}</div>
              </div>
              <div className="shrink-0"><Badge status={c.status} /></div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="developers"
        eyebrow="Developers"
        title="Connect over MCP."
        intro="Create a key in Apex under Settings, then Claude connector. Treat it like a password and revoke it when you are done testing."
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 font-extrabold text-slate-900">Claude Code</h3>
            <Code>{CLAUDE_CODE}</Code>
            <h3 className="mb-3 mt-6 font-extrabold text-slate-900">List the tools</h3>
            <Code>{CURL}</Code>
            <h3 className="mb-3 mt-6 font-extrabold text-slate-900">Claude.ai custom connector</h3>
            <p className="text-sm leading-relaxed text-slate-500">
              Claude.ai connectors only accept a URL, so Apex also accepts the key as the last part of the path:{" "}
              <code className="rounded bg-slate-200 px-1.5 py-0.5 text-[12px]">https://app.apexapplications.io/api/mcp/apx_YOUR_KEY</code>. A URL can end up in logs, which is another reason to revoke test keys.
            </p>
            <p className="mt-6 text-sm leading-relaxed text-slate-500">
              Without a key the endpoint answers 401. Without the plan or permission a tool needs, it refuses in plain words rather than returning partial data.
            </p>
          </div>
          <div>
            <h3 className="mb-3 flex items-center gap-3 font-extrabold text-slate-900">13 tools <Badge status="live" /></h3>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {TOOLS.map(([name, desc], i) => (
                <div key={name} className={`p-4 ${i ? "border-t border-slate-100" : ""}`}>
                  <code className="text-[13px] font-bold text-blue-700">{name}</code>
                  <div className="text-sm text-slate-500">{desc}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">All read-only. Lists are capped to keep results short enough for a model.</p>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-7">
          <div className="mb-3 flex items-center gap-3">
            <Clock3 size={18} className="text-slate-400" />
            <h3 className="text-lg font-extrabold text-slate-900">Not available yet</h3>
            <Badge status="planned" />
          </div>
          <p className="max-w-3xl leading-relaxed text-slate-500">
            A public REST API, an OpenAPI spec, webhooks, and tools that change things. If there is something you would build with them, tell us.
          </p>
          <Link href="/contact-us" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700">
            Tell us what you would build <ArrowRight size={14} />
          </Link>
        </div>
      </Section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="mb-5 text-4xl font-black tracking-tight md:text-5xl">Give your agent something real to work with.</h2>
          <p className="mb-8 text-lg text-slate-300">Start with Apex, then connect your agent in a few minutes.</p>
          <CheckoutLink
            href={TRIAL_CHECKOUT_URL}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-10 py-5 text-sm font-black uppercase tracking-widest text-white transition hover:bg-blue-500"
          >
            {trialCta} <ArrowRight size={16} />
          </CheckoutLink>
          <p className="mt-6 text-xs text-slate-500">Claude and MCP belong to their respective owners. Apex is an independent product.</p>
        </div>
      </section>
    </main>
  );
}
