"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check, Copy } from "lucide-react";

import CheckoutLink from "./CheckoutLink";
import ArchitectureDiagram from "./agent/ArchitectureDiagram";
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
 * Client logos say "speaks standard MCP", not "partner". Only Claude is what
 * the connector was built for; the rest are described as untested.
 *
 * Deliberately calm: white page, a documentation layout, motion limited to a
 * slow dotted flow in the diagram and short fades. Nothing here should draw the
 * eye away from the words.
 */

type Status = "live" | "beta" | "planned";

const BADGE: Record<Status, string> = {
  live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  beta: "bg-amber-50 text-amber-700 border-amber-200",
  planned: "bg-slate-100 text-slate-500 border-slate-200",
};
const BADGE_LABEL: Record<Status, string> = { live: "Live", beta: "Beta", planned: "Planned" };

function Badge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${BADGE[status]}`}>
      {BADGE_LABEL[status]}
    </span>
  );
}

const fade = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5, ease: "easeOut" },
} as const;

function Block({ id, title, lead, children }: { id: string; title: string; lead?: string; children: React.ReactNode }) {
  return (
    <motion.section id={id} {...fade} className="scroll-mt-28 border-t border-slate-200 py-14 first:border-t-0 first:pt-0">
      <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h2>
      {lead && <p className="mb-8 max-w-2xl text-[17px] leading-relaxed text-slate-600">{lead}</p>}
      {children}
    </motion.section>
  );
}

/* ---------------------------------------------------------------- */
/* Content                                                           */
/* ---------------------------------------------------------------- */

const STEPS: { t: string; d: string; status: Status }[] = [
  { t: "The agent asks", d: "A standard MCP request, carrying your connector key.", status: "live" },
  { t: "Key check", d: "The key resolves to one account and one user. It is stored hashed and can be revoked at any time.", status: "live" },
  { t: "Permission check", d: "The same subscription and permission rules as the matching page in the app.", status: "live" },
  { t: "Read-only tool", d: "The app's own query runs. Nothing in this step can change your account.", status: "live" },
  { t: "Trimmed answer", d: "Rows are capped and shaped so the result fits a model's context.", status: "live" },
  { t: "Approval gate", d: "For future actions: the agent proposes, you approve, then it happens.", status: "planned" },
  { t: "Audit log", d: "Every call recorded with the key, the tool and the time, viewable in Settings.", status: "planned" },
];

const EXAMPLE = `> tools/call get_restock_recommendations

  key         apx_••••••••3f9a    account resolved
  permission  same rules as the page    passed
  mode        read-only

  { "items": [
      { "title": "Example product A",
        "daysOfInventory": 6,
        "recommendedQty": 120 } ] }`;

const CAPABILITIES: { group: string; tools: [string, string][]; status: Status }[] = [
  {
    group: "Business overview",
    status: "live",
    tools: [
      ["get_business_snapshot", "Counts for the account: products, how many are profitable, suppliers, plan."],
      ["get_growth_gaps", "Structural gaps holding growth back."],
    ],
  },
  {
    group: "Sourcing",
    status: "live",
    tools: [
      ["get_profitable_opportunities", "Profitable ASINs in your database that you are not selling yet."],
      ["search_products", "Your product database with cost, price, profit, ROI, stock and rank."],
      ["list_catalog_scans", "Supplier catalog scans you have run."],
      ["get_catalog_scan_results", "Products found in one scan, sortable by profit or ROI."],
    ],
  },
  {
    group: "Profit and loss",
    status: "live",
    tools: [
      ["get_profit_and_loss", "Monthly sales, fees, cost of goods and gross profit."],
      ["get_profit_and_loss_statement", "P&L over a date range by day, week or month."],
    ],
  },
  {
    group: "Inventory",
    status: "live",
    tools: [
      ["get_restock_recommendations", "Profitable products you sell that are lowest on stock."],
      ["get_inventory", "FBA inventory, velocity, days left and restock status."],
    ],
  },
  {
    group: "Repricing",
    status: "beta",
    tools: [
      ["get_repricer_listings", "Live listings as the repricer sees them."],
      ["get_repricer_impact", "What repricing has been worth."],
      ["get_map_compliance", "MAP status by brand."],
    ],
  },
];

interface Flow { tab: string; status: Status; ask: string; answer: string; tools: string[]; note?: string }

const FLOWS: Flow[] = [
  { tab: "Restock analysis", status: "live", ask: "What should I reorder this week?",
    answer: "Lists the profitable products you already sell that are lowest on stock, with days of inventory left and a recommended quantity, so you can go straight to the purchase order.",
    tools: ["get_restock_recommendations", "get_inventory"] },
  { tab: "Catalog analysis", status: "live", ask: "Which items in my latest supplier list are worth buying?",
    answer: "Reads the scan you already ran on that supplier's catalog and ranks the matches by profit or ROI, with Amazon price, rank and seller counts beside each.",
    tools: ["list_catalog_scans", "get_catalog_scan_results"] },
  { tab: "Market intel", status: "live", ask: "What profitable products am I missing?",
    answer: "Finds profitable ASINs in your product database that you are not selling yet, best profit first, and points out structural gaps such as too few suppliers.",
    tools: ["get_profitable_opportunities", "get_growth_gaps", "search_products"],
    note: "Works from the products and suppliers in your account, not an open market search." },
  { tab: "Repricing review", status: "beta", ask: "What has the repricer earned me, and where is MAP a risk?",
    answer: "Shows what repricing changed and what it was worth, and which brands have listings under MAP risk. Reading is available now. Letting an agent change prices is planned, with your approval.",
    tools: ["get_repricer_listings", "get_repricer_impact", "get_map_compliance"],
    note: "The repricer itself is in Beta." },
  { tab: "Purchase orders", status: "planned", ask: "Draft a PO for those three reorders.",
    answer: "Planned. The agent will prepare a draft purchase order and show it to you. Nothing is created or sent to a supplier until you approve it.",
    tools: [], note: "No tool exists for this yet." },
];

const CONTROLS: { name: string; detail: string; status: Status }[] = [
  { name: "Per-seller connector keys", detail: "One account and one user each, stored hashed, shown once, up to 10 live keys.", status: "live" },
  { name: "Instant revoke", detail: "Turn a key off from Settings. A key also stops working if its user loses access to the account.", status: "live" },
  { name: "Permissions carried through", detail: "A key sees what its user sees in the app, and no more.", status: "live" },
  { name: "Read-only tools", detail: "Nothing an agent calls today can change a price, an order or a setting.", status: "live" },
  { name: "Per-tool scopes", detail: "Choose which areas a key can read, such as P&L or catalog only.", status: "planned" },
  { name: "Audit log", detail: "Every agent call listed in Settings.", status: "planned" },
  { name: "Human approval for changes", detail: "Agents propose, you approve, then it happens.", status: "planned" },
  { name: "Rate limits per key", detail: "A ceiling on calls so a runaway agent cannot flood your account.", status: "planned" },
  { name: "Sign in with OAuth", detail: "Connect without pasting a key.", status: "planned" },
];

const DATA: [string, string][] = [
  ["120M+", "ASINs in the Apex catalog"],
  ["98M+", "identifiers for UPC matching"],
  ["1.8M+", "seller orders synced"],
  ["290k+", "seller products tracked"],
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

const NAV: [string, string][] = [
  ["how", "How it works"],
  ["capabilities", "Capabilities"],
  ["flows", "Example flows"],
  ["security", "Security and control"],
  ["data", "Data"],
  ["developers", "Developers"],
];

/* ---------------------------------------------------------------- */
/* Pieces                                                            */
/* ---------------------------------------------------------------- */

function Flows() {
  const [i, setI] = useState(0);
  const f = FLOWS[i];
  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {FLOWS.map((x, k) => (
          <button
            key={x.tab}
            onClick={() => setI(k)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${i === k ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}
          >
            {x.tab}
          </button>
        ))}
      </div>
      <motion.div key={f.tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Example conversation</span>
          <Badge status={f.status} />
        </div>
        <div className="mb-3 ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white sm:max-w-[65%]">{f.ask}</div>
        <div className="mb-4 max-w-[95%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 sm:max-w-[80%]">{f.answer}</div>
        {f.note && <p className="mb-3 text-xs text-slate-500">{f.note}</p>}
        {f.tools.length ? (
          <div className="flex flex-wrap gap-2">
            {f.tools.map((t) => <code key={t} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700">{t}</code>)}
          </div>
        ) : (
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tool not built yet</p>
        )}
        <p className="mt-4 text-[11px] text-slate-400">Illustrative, not real seller data.</p>
      </motion.div>
    </div>
  );
}

function Developers() {
  const [i, setI] = useState(0);
  const [copied, setCopied] = useState(false);
  const s = SNIPPETS[i];
  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
        <div className="flex items-center gap-1 border-b border-white/10 px-3 py-2">
          {SNIPPETS.map((x, k) => (
            <button key={x.tab} onClick={() => setI(k)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${i === k ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200"}`}>{x.tab}</button>
          ))}
          <button
            onClick={() => { navigator.clipboard?.writeText(s.code); setCopied(true); setTimeout(() => setCopied(false), 1300); }}
            className="ml-auto inline-flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="p-5">
          <div className="mb-2 text-xs text-slate-500">{s.label}</div>
          <pre className="overflow-x-auto text-[13px] leading-relaxed text-sky-100"><code>{s.code}</code></pre>
          {s.note && <p className="mt-3 text-xs text-slate-500">{s.note}</p>}
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">
        Create a key in Apex under Settings, then Claude connector. Treat it like a password. Without a key the endpoint answers 401; without the plan or permission a tool needs, it refuses in plain words.
      </p>
      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <Badge status="planned" /> Public REST API, OpenAPI spec, webhooks, and tools that change things.
        </div>
        <Link href="/contact-us" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700">
          Tell us what you would build <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function SideNav() {
  const [active, setActive] = useState("how");
  useEffect(() => {
    const els = NAV.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <nav className="sticky top-28 hidden self-start lg:block" aria-label="On this page">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">On this page</p>
      <ul className="space-y-1 border-l border-slate-200">
        {NAV.map(([id, label]) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm transition ${active === id ? "border-blue-600 font-semibold text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"}`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-3 text-sm font-semibold text-slate-900">Ready to connect?</p>
        <CheckoutLink href={TRIAL_CHECKOUT_URL} className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-blue-700">
          {trialCta}
        </CheckoutLink>
      </div>
    </nav>
  );
}

/* ---------------------------------------------------------------- */
/* Page                                                              */
/* ---------------------------------------------------------------- */

export default function AgentInfrastructure() {
  return (
    <div className="bg-white text-slate-900">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white pb-16 pt-28 md:pt-32">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1fr_1.05fr]">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Apex for AI agents
            </p>
            <h1 className="mb-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 md:text-5xl">
              The Amazon layer your AI agents plug into.
            </h1>
            <p className="mb-8 max-w-lg text-lg leading-relaxed text-slate-600">
              Connect Claude or any MCP-compatible agent to your wholesale business. Your catalog, costs, profit and repricing data, with your permissions on every call.
            </p>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
              <a href="#developers" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                Connect your agent <ArrowRight size={15} />
              </a>
              <CheckoutLink href={TRIAL_CHECKOUT_URL} className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400">
                {trialCta}
              </CheckoutLink>
            </div>
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Check size={15} className="shrink-0 text-emerald-600" /> Read-only today. Actions with your approval are coming.
            </p>
            <p className="mt-6 max-w-lg text-[11px] leading-relaxed text-slate-400">
              Logos show MCP compatibility. Claude, ChatGPT, Gemini and Cursor are trademarks of their owners; Apex is independent and not affiliated with them.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
            <ArchitectureDiagram />
          </motion.div>
        </div>
      </section>

      {/* Documentation body */}
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[200px_1fr]">
        <SideNav />
        <div className="min-w-0 max-w-3xl">
          <Block id="how" title="How it works" lead="Before an agent sees a single row, Apex checks who is asking and what they may see. Then it runs the same read-only query the app itself would.">
            <ol className="mb-8 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200">
              {STEPS.map((s, i) => (
                <li key={s.t} className={`flex items-start gap-4 p-4 ${s.status === "planned" ? "bg-slate-50/60" : "bg-white"}`}>
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${s.status === "planned" ? "border border-dashed border-slate-300 text-slate-400" : "bg-blue-50 text-blue-700"}`}>{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-bold ${s.status === "planned" ? "text-slate-500" : "text-slate-900"}`}>{s.t}</div>
                    <div className="text-sm text-slate-500">{s.d}</div>
                  </div>
                  <Badge status={s.status} />
                </li>
              ))}
            </ol>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-[11px] text-slate-500">
                <span>apex mcp session</span><span>example output, illustrative values</span>
              </div>
              <pre className="overflow-x-auto p-5 text-[12.5px] leading-6 text-slate-200"><code>{EXAMPLE}</code></pre>
            </div>
          </Block>

          <Block id="capabilities" title="Capabilities" lead="Thirteen read-only tools across five areas. Lists are capped so results fit a model's context. Two kinds of action are planned, both behind approval.">
            <div className="space-y-6">
              {CAPABILITIES.map((g) => (
                <div key={g.group} className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5">
                    <span className="text-sm font-bold text-slate-900">{g.group}</span>
                    <Badge status={g.status} />
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {g.tools.map(([name, desc]) => (
                      <li key={name} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-6">
                        <code className="shrink-0 text-[12.5px] font-semibold text-blue-700 sm:w-[250px]">{name}</code>
                        <span className="text-sm text-slate-600">{desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="overflow-hidden rounded-2xl border border-dashed border-slate-300">
                <div className="flex items-center justify-between bg-slate-50/60 px-4 py-2.5">
                  <span className="text-sm font-bold text-slate-500">Actions</span>
                  <Badge status="planned" />
                </div>
                <ul className="divide-y divide-slate-100 text-sm text-slate-500">
                  <li className="px-4 py-3">Draft a purchase order, shown to you before anything is created.</li>
                  <li className="px-4 py-3">Propose repricer settings, applied only after you approve.</li>
                </ul>
              </div>
            </div>
          </Block>

          <Block id="flows" title="Example flows" lead="Four work today. One is planned and says so.">
            <Flows />
          </Block>

          <Block id="security" title="Security and control" lead="What is in place now, and what is next. A planned control is never presented as live.">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              {CONTROLS.map((c, i) => (
                <div key={c.name} className={`flex items-start justify-between gap-4 px-4 py-3.5 ${i ? "border-t border-slate-100" : ""} ${c.status === "planned" ? "bg-slate-50/60" : ""}`}>
                  <div>
                    <div className={`text-sm font-bold ${c.status === "planned" ? "text-slate-500" : "text-slate-900"}`}>{c.name}</div>
                    <div className="text-sm text-slate-500">{c.detail}</div>
                  </div>
                  <Badge status={c.status} />
                </div>
              ))}
            </div>
          </Block>

          <Block id="data" title="Data" lead="A catalog built for matching supplier lists to Amazon, with your own account data kept private to you.">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
              {DATA.map(([v, l]) => (
                <div key={l} className="bg-white p-5">
                  <div className="text-3xl font-extrabold tracking-tight text-slate-900">{v}</div>
                  <div className="mt-1 text-sm text-slate-500">{l}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-500">
              These are catalog scale, not price freshness: prices and offers refresh for the listings Apex tracks, not for every ASIN at once. Other sellers never see your account data.
            </p>
          </Block>

          <Block id="developers" title="Developers" lead="Connect any MCP client with a key from Settings.">
            <Developers />
          </Block>
        </div>
      </div>

      {/* Close */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-14 md:flex-row md:items-center">
          <div>
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Give your agent something real to work with.</h2>
            <p className="text-slate-600">Start with Apex, then connect your agent in a few minutes.</p>
          </div>
          <CheckoutLink href={TRIAL_CHECKOUT_URL} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700">
            {trialCta} <ArrowRight size={15} />
          </CheckoutLink>
        </div>
      </section>
    </div>
  );
}
