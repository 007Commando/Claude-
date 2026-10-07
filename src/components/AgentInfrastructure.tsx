"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, X } from "lucide-react";

import CheckoutLink from "./CheckoutLink";
import HeroCta from "./HeroCta";
import ArchitectureDiagram from "./agent/ArchitectureDiagram";
import { TRIAL_CHECKOUT_URL, trialCta } from "../config/offer";
import { AI_CLIENTS, AI_CONNECTOR, COMPANY, VERIFIED_STATS } from "../config/product";

/**
 * /ai: connecting ChatGPT or Claude to a seller's Apex account.
 *
 * Rebuilt 2026-10-07 to lead with what a seller can ask, and to keep the
 * architecture below that for the people who want it. Every capability, plan
 * rule and limit comes from config/product.ts, which was checked against the
 * backend's MCP code that day; nothing on this page states a fact of its own.
 *
 * The rule for editing it: "Live" only if a seller can use it today, "Planned"
 * with no dates otherwise. Example answers are illustrative and say so.
 *
 * Deliberately calm: white page, a documentation layout, motion limited to a
 * slow dotted flow in the diagram and short fades. Stefano turned down a dark,
 * fast, animated version of this page as unprofessional.
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

function Block({ id, title, lead, children }: { id: string; title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-slate-200 py-14 first:border-t-0 first:pt-0">
      <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h2>
      {lead && <p className="mb-8 max-w-2xl text-[17px] leading-relaxed text-slate-600">{lead}</p>}
      {children}
    </section>
  );
}

const APP = COMPANY.appUrl;
const L = AI_CONNECTOR.limits;

/* ---------------------------------------------------------------- */
/* What a seller can ask                                             */
/* ---------------------------------------------------------------- */

interface Workflow {
  tab: string;
  ask: string;
  needs: string;
  apex: string;
  tools: string[];
  answer: string;
  next: string;
  limits: string;
  pro?: boolean;
}

const WORKFLOWS: Workflow[] = [
  {
    tab: "Reorders",
    ask: "Which profitable products should I reorder?",
    needs: "Your Amazon account connected to Apex, and your products in your Apex database with their costs.",
    apex: "Your profitable products that are lowest on stock, with days of stock left, sales velocity and Apex's recommended restock quantity.",
    tools: ["get_restock_recommendations", "get_inventory"],
    answer:
      "Three products you already sell are profitable and under two weeks of stock. Example product A has about 6 days left at roughly 20 sales a day, with a recommended restock of 120 units. Want me to put these on a draft purchase order?",
    next: "Ask it to draft the purchase order (Pro), or build the order yourself in Apex Blue.",
    limits: "Profit comes from the costs in your database, so a product without a cost cannot be ranked.",
  },
  {
    tab: "Low stock",
    ask: "Which products are running low on stock?",
    needs: "Your Amazon account connected to Apex.",
    apex: "Your FBA inventory by SKU: available, reserved and inbound units, days of stock left and a status of Out of Stock, Restock, Enough Stock or Overstock.",
    tools: ["get_inventory"],
    answer:
      "Four SKUs are marked Restock and one is out of stock. Example product B has 9 days left and 40 units inbound, so it should be covered. Example product C has 4 days left and nothing inbound.",
    next: "Open Inventory in Apex Blue to check the numbers, then plan the reorder.",
    limits: "This reads your FBA inventory as Apex last synced it from Amazon, not a live count from the warehouse.",
  },
  {
    tab: "Monthly results",
    ask: "How did my business perform this month?",
    needs: "Your Amazon account connected, product costs entered, and operating expenses entered in Opex if you want net profit.",
    apex: "Sales, units, refunds, Amazon fees, cost of goods and gross profit by month, or a statement over any range by day, week or month that also subtracts your operating expenses.",
    tools: ["get_profit_and_loss", "get_profit_and_loss_statement"],
    answer:
      "Sales were up on last month, but gross profit fell slightly because refunds and fees rose faster than sales. After the operating expenses you entered in Opex, net profit for the month is lower than September.",
    next: "Open the Profit and Loss statement in Apex Blue to see the same figures line by line.",
    limits: "Costs you have not entered are not in the figures. Operating expenses are counted for the whole store, not per product.",
  },
  {
    tab: "Supplier scan",
    ask: "Which products from this supplier scan meet my criteria?",
    needs: "A supplier price list you have already scanned in Apex Green.",
    apex: "The matches from that scan with Amazon price, profit, ROI, sales rank and seller counts, sortable by profit or ROI, with an option to show only products you do not have yet.",
    tools: ["list_catalog_scans", "get_catalog_scan_results"],
    answer:
      "Your latest scan for Example Supplier matched 412 products. 23 clear your 30% ROI target with fewer than 8 sellers, and 15 of those are not in your database yet. The best five by profit are below.",
    next: "Review them in the scan results in Apex Green, add the ones you want to your database, or ask for a draft order (Pro).",
    limits: "The assistant reads scans you have run. It cannot upload a price list or start a scan, and each request returns a capped page of results.",
  },
  {
    tab: "Draft purchase order",
    ask: "Can you prepare a draft purchase order for review?",
    needs: "A write link, which is part of the Pro plan, and the supplier, products and quantities you want.",
    apex: "A draft purchase order on your Open tab, built with the same code as the New purchase order button, and a link to review it.",
    tools: ["create_draft_purchase_order", "get_purchase_orders"],
    answer:
      "I created a draft purchase order for Example Supplier with 3 lines and 360 units. It is on your Open tab and has not been submitted. Review it in Apex before anything is sent.",
    next: "Open the draft in Apex Blue, check costs and quantities, and submit it yourself when it is right.",
    limits: `Draft only. Up to ${L.poLinesMax} lines per order and ${L.draftsPerDayPerAccount} drafts a day per account. ChatGPT and Claude ask you to approve each draft call.`,
    pro: true,
  },
];

function Workflows() {
  const [i, setI] = useState(0);
  const w = WORKFLOWS[i];
  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Seller questions">
        {WORKFLOWS.map((x, k) => (
          <button
            key={x.tab}
            id={`wf-tab-${k}`}
            role="tab"
            aria-selected={i === k}
            aria-controls="wf-panel"
            onClick={() => setI(k)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${i === k ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}
          >
            {x.tab}
          </button>
        ))}
      </div>
      <div id="wf-panel" role="tabpanel" aria-labelledby={`wf-tab-${i}`} className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">You ask</span>
            {w.pro ? (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">Pro write link</span>
            ) : (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Read only</span>
            )}
          </div>
          <p className="text-lg font-semibold text-slate-900">&ldquo;{w.ask}&rdquo;</p>
        </div>
        <dl className="divide-y divide-slate-100">
          <div className="grid gap-1 px-6 py-4 sm:grid-cols-[170px_1fr] sm:gap-6">
            <dt className="text-sm font-bold text-slate-900">What you need first</dt>
            <dd className="text-sm leading-relaxed text-slate-600">{w.needs}</dd>
          </div>
          <div className="grid gap-1 px-6 py-4 sm:grid-cols-[170px_1fr] sm:gap-6">
            <dt className="text-sm font-bold text-slate-900">What Apex gives the assistant</dt>
            <dd className="text-sm leading-relaxed text-slate-600">
              {w.apex}
              <span className="mt-2 flex flex-wrap gap-2">
                {w.tools.map((t) => <code key={t} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700">{t}</code>)}
              </span>
            </dd>
          </div>
          <div className="grid gap-1 px-6 py-4 sm:grid-cols-[170px_1fr] sm:gap-6">
            <dt className="text-sm font-bold text-slate-900">A typical answer</dt>
            <dd>
              <p className="rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">{w.answer}</p>
              <p className="mt-2 text-xs text-slate-500">Illustrative example with made-up products and numbers, not a real seller&rsquo;s data.</p>
            </dd>
          </div>
          <div className="grid gap-1 px-6 py-4 sm:grid-cols-[170px_1fr] sm:gap-6">
            <dt className="text-sm font-bold text-slate-900">What you do next</dt>
            <dd className="text-sm leading-relaxed text-slate-600">{w.next}</dd>
          </div>
          <div className="grid gap-1 px-6 py-4 sm:grid-cols-[170px_1fr] sm:gap-6">
            <dt className="text-sm font-bold text-slate-900">Good to know</dt>
            <dd className="text-sm leading-relaxed text-slate-600">{w.limits}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Technical detail, below the seller explanation                    */
/* ---------------------------------------------------------------- */

const STEPS: { t: string; d: string }[] = [
  { t: "The assistant asks", d: "A standard MCP request, carrying your connector link or key." },
  { t: "Key check", d: "The key resolves to one Apex account and one user. It is stored hashed and can be turned off at any time." },
  { t: "Permission check", d: "The same plan and permission rules as the matching page in the app." },
  { t: "The app's own code runs", d: "A read link runs the app's own query and can only read. A write link can only make drafts." },
  { t: "Trimmed answer", d: "Rows are capped and shaped so the result fits in the assistant's context." },
  { t: "You review drafts in Apex", d: "A draft waits in Apex. ChatGPT and Claude also ask you to approve each draft call. Nothing is submitted or sent unless you do it in Apex." },
  { t: "Audit log", d: "Every call through a write link is recorded with the link, the tool and the result, successful or refused." },
];

const EXAMPLE = `> tools/call get_restock_recommendations

  key         apx_••••••••3f9a    account resolved
  permission  same rules as the page    passed
  mode        read-only

  { "items": [
      { "title": "Example product A",
        "daysOfInventory": 6,
        "recommendedQty": 120 } ] }`;

const SNIPPETS: { tab: string; label: string; code: string; note?: string }[] = [
  {
    tab: "Claude Code",
    label: "Add Apex as an MCP server",
    code: `claude mcp add --transport http apex \\
  ${AI_CONNECTOR.endpoint} \\
  --header "Authorization: Bearer apx_YOUR_KEY"`,
  },
  {
    tab: "curl",
    label: "List the tools",
    code: `curl -s ${AI_CONNECTOR.endpoint} \\
  -H "Authorization: Bearer apx_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`,
  },
  {
    tab: "Connector URL",
    label: "For Claude custom connectors and ChatGPT custom MCP servers",
    code: `${AI_CONNECTOR.endpoint}/apx_YOUR_KEY`,
    note: "These take a URL, so the key goes in the path. Treat the whole link like a password and turn off any link you shared by mistake.",
  },
];

const NAV: [string, string][] = [
  ["ask", "What you can ask"],
  ["assistants", "ChatGPT and Claude"],
  ["access", "Plans and access"],
  ["connect", "Connect and disconnect"],
  ["limits", "Limits"],
  ["later", "Not available yet"],
  ["how", "How it works"],
  ["developers", "Developers"],
];

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
          <div className="mb-2 text-xs text-slate-400">{s.label}</div>
          <pre className="overflow-x-auto text-[13px] leading-relaxed text-sky-100"><code>{s.code}</code></pre>
          {s.note && <p className="mt-3 text-xs text-slate-400">{s.note}</p>}
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        The full reference, with every tool, its inputs, limits and error behavior, is in the{" "}
        <Link href="/docs/mcp" className="font-semibold text-blue-700 underline-offset-2 hover:underline">Apex MCP documentation</Link>.
      </p>
    </div>
  );
}

function SideNav() {
  const [active, setActive] = useState("ask");
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
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">On this page</p>
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
        <p className="mb-1 text-sm font-semibold text-slate-900">Already on Apex?</p>
        <p className="mb-3 text-xs leading-relaxed text-slate-500">Make your link under Connect your AI in your account menu.</p>
        <a href={`${APP}/settings/claude`} className="mb-2 block text-xs font-semibold text-blue-700 hover:underline">Connect Claude</a>
        <a href={`${APP}/settings/chatgpt`} className="block text-xs font-semibold text-blue-700 hover:underline">Connect ChatGPT</a>
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
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">AI integrations for Amazon sellers</p>
            <h1 className="mb-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 [text-wrap:balance] md:text-5xl">
              Connect ChatGPT and Claude to your Amazon business through Apex
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-slate-600">
              Ask about your profit, stock, supplier scans and purchase orders in plain English, and get answers from your own Apex data. On the Pro plan your assistant can also prepare drafts for you to review. It can never submit an order, spend money or change a live price.
            </p>
            {/* Trial first for new visitors (paid search lands here); existing users connect from the side panel or the link below. */}
            <div className="mb-6">
              <HeroCta cta="ai-hero" align="left" secondary={{ label: "See what you need", href: "#access" }} />
              <p className="mt-3 text-sm text-slate-600">
                Already on Apex? <a href={`${APP}/settings/claude`} className="font-semibold text-blue-700 hover:underline">Connect your account</a>.
              </p>
            </div>
            <p className="max-w-lg text-[12px] leading-relaxed text-slate-500">
              Claude and ChatGPT are trademarks of their owners. Apex is independent and not affiliated with Anthropic or OpenAI.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <p className="mb-4 text-sm font-bold text-slate-900">At a glance</p>
            <dl className="divide-y divide-slate-100 text-sm">
              <div className="flex justify-between gap-4 py-2.5"><dt className="text-slate-500">Works with</dt><dd className="text-right font-semibold text-slate-900">Claude and ChatGPT</dd></div>
              <div className="flex justify-between gap-4 py-2.5"><dt className="text-slate-500">Reading your data</dt><dd className="text-right font-semibold text-slate-900">Every paid plan, trial included</dd></div>
              <div className="flex justify-between gap-4 py-2.5"><dt className="text-slate-500">Making drafts</dt><dd className="text-right font-semibold text-slate-900">Pro plan, separate write link</dd></div>
              <div className="flex justify-between gap-4 py-2.5"><dt className="text-slate-500">What it sees</dt><dd className="text-right font-semibold text-slate-900">What you see in Apex, no more</dd></div>
              <div className="flex justify-between gap-4 py-2.5"><dt className="text-slate-500">Turn it off</dt><dd className="text-right font-semibold text-slate-900">One click, any time</dd></div>
            </dl>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Link href="/integrations/claude" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-blue-300 hover:bg-blue-50/40">Claude setup guide</Link>
              <Link href="/integrations/chatgpt" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-blue-300 hover:bg-blue-50/40">ChatGPT setup guide</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Documentation body */}
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[200px_1fr]">
        <SideNav />
        <div className="min-w-0 max-w-3xl">
          <Block id="ask" title="What you can ask" lead="Five questions sellers ask most, and what happens behind each one. Pick a question to see what you need in place first, what Apex hands your assistant, and where it stops.">
            <Workflows />
          </Block>

          <Block id="assistants" title="ChatGPT and Claude" lead="Both connect to the same Apex link and get the same tools. Where you add it, and which plan you need on their side, differs.">
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[560px] text-left text-sm">
                <caption className="sr-only">How Claude and ChatGPT connect to Apex</caption>
                <thead className="bg-slate-50 text-slate-900">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-bold"></th>
                    <th scope="col" className="px-4 py-3 font-bold">Claude</th>
                    <th scope="col" className="px-4 py-3 font-bold">ChatGPT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <th scope="row" className="px-4 py-3 font-semibold text-slate-900">Where it works</th>
                    <td className="px-4 py-3">{AI_CLIENTS.claude.surfaces}</td>
                    <td className="px-4 py-3">{AI_CLIENTS.chatgpt.surfaces}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="px-4 py-3 font-semibold text-slate-900">Their plan</th>
                    <td className="px-4 py-3">{AI_CLIENTS.claude.plans}</td>
                    <td className="px-4 py-3">{AI_CLIENTS.chatgpt.plans}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="px-4 py-3 font-semibold text-slate-900">Where you add Apex</th>
                    <td className="px-4 py-3">{AI_CLIENTS.claude.menuPath}</td>
                    <td className="px-4 py-3">{AI_CLIENTS.chatgpt.menuPath}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="px-4 py-3 font-semibold text-slate-900">Drafts</th>
                    <td className="px-4 py-3">Claude asks before running a tool that makes a draft, unless you have told it to always allow that tool.</td>
                    <td className="px-4 py-3">ChatGPT asks you to confirm each draft call by default.</td>
                  </tr>
                  <tr>
                    <th scope="row" className="px-4 py-3 font-semibold text-slate-900">Setup guide</th>
                    <td className="px-4 py-3"><Link href="/integrations/claude" className="font-semibold text-blue-700 hover:underline">Connect Claude to Apex</Link></td>
                    <td className="px-4 py-3"><Link href="/integrations/chatgpt" className="font-semibold text-blue-700 hover:underline">Connect ChatGPT to Apex</Link></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Other assistants that support remote MCP servers can use the same link, but we have only tested Claude and ChatGPT.
            </p>
          </Block>

          <Block id="access" title="Plans and access" lead="Reading your data works on every paid Apex plan, including the seven-day trial. Drafts need the Pro plan and a separate write link. Either way, the assistant sees exactly what the person who made the link can see in Apex.">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Reads</h3>
                  <span className="text-xs font-semibold text-slate-500">{AI_CONNECTOR.readPlan}</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>Profit and loss, by month or any date range</li>
                  <li>Inventory, restock status and reorder suggestions</li>
                  <li>Purchase orders and their projected profit</li>
                  <li>Supplier catalog scan results</li>
                  <li>Your product database, brands and product research</li>
                  <li>Repricer listings, results and MAP status</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-blue-50/30 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Drafts</h3>
                  <span className="text-xs font-semibold text-blue-700">{AI_CONNECTOR.writePlan} plan</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  {AI_CONNECTOR.writeTools.map((t) => <li key={t.name}>{t.does}</li>)}
                </ul>
                <p className="mt-3 text-xs text-slate-500">The person making the link needs edit access to purchase orders, products and vendors in Apex.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-5">
                <h3 className="mb-3 text-base font-bold text-slate-900">Never</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  {AI_CONNECTOR.never.map((n) => (
                    <li key={n} className="flex gap-2"><X size={15} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" /><span>It cannot {n}.</span></li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-5 text-sm text-slate-600">
              New to Apex? Every paid plan starts with a seven-day trial, and reading works during it. <Link href="/pricing" className="font-semibold text-blue-700 hover:underline">Compare plans</Link>.
            </p>
          </Block>

          <Block id="connect" title="Connect and disconnect" lead="It takes a couple of minutes, and you can switch it off just as fast.">
            <ol className="space-y-4">
              {[
                ["Make a link in Apex", "Open your account menu, then Connect your AI, and choose Claude or ChatGPT. Apex shows your link once. Make a separate write link there too if you are on Pro and want drafts."],
                ["Add it to your assistant", "In Claude: Customize, Connectors, Add custom connector. In ChatGPT on the web: Plugins, the plus button, Add custom MCP server, with No authentication. The guides below walk through each screen."],
                ["Ask a first question", "Try “What made me the most money last month?” If the assistant does not reach for Apex, switch Apex on in that chat."],
                ["Turn it off when you want", "Turn the link off under Connect your AI in Apex and it stops working at once. You can also remove Apex from your assistant's connector list. A link also stops working if its user loses access to the account."],
              ].map(([t, d], k) => (
                <li key={t} className="flex gap-4 rounded-xl border border-slate-200 p-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{k + 1}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t}</p>
                    <p className="text-sm leading-relaxed text-slate-600">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/integrations/claude" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline">Claude setup guide <ArrowRight size={14} /></Link>
              <Link href="/integrations/chatgpt" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline">ChatGPT setup guide <ArrowRight size={14} /></Link>
            </div>
          </Block>

          <Block id="limits" title="Limits" lead="Limits exist so one runaway assistant cannot slow Apex down for everyone. Hitting one returns a plain message your assistant can read back to you.">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              {[
                ["Calls", `${L.callsPerMinutePerKey} a minute per link, and ${L.callsInFlightPerAccount} at once per account`],
                ["Drafts", `${L.writeCallsPerMinutePerKey} draft calls a minute per write link, and ${L.draftsPerDayPerAccount} drafts a day per account (resets at midnight UTC)`],
                ["Links", `Up to ${L.liveKeysPerAccount} live links per account, of which up to ${L.writeKeysPerAccount} can be write links`],
                ["Results", "Lists come back in capped pages so they fit in the assistant's context. Ask for the next page or narrow the question."],
                ["Brand searches", "Naming a brand uses your plan's monthly brand searches, the same as searching in Apex."],
              ].map(([k, v], idx) => (
                <div key={k} className={`grid gap-1 px-4 py-3.5 sm:grid-cols-[150px_1fr] sm:gap-6 ${idx ? "border-t border-slate-100" : ""}`}>
                  <div className="text-sm font-bold text-slate-900">{k}</div>
                  <div className="text-sm text-slate-600">{v}</div>
                </div>
              ))}
            </div>
          </Block>

          <Block id="later" title="Not available yet" lead="These are planned. They are not live, and we do not give dates.">
            <ul className="overflow-hidden rounded-2xl border border-dashed border-slate-300">
              {AI_CONNECTOR.planned.map((p, idx) => (
                <li key={p} className={`flex items-center justify-between gap-4 px-4 py-3.5 text-sm text-slate-600 ${idx ? "border-t border-slate-100" : ""}`}>
                  <span>{p}</span>
                  <Badge status="planned" />
                </li>
              ))}
            </ul>
          </Block>

          <Block id="how" title="How it works" lead="For the technically curious. Before an assistant sees a single row, Apex checks who is asking and what they may see, then runs the same code the app itself would.">
            <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
              <ArchitectureDiagram />
            </div>
            <ol className="mb-8 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200">
              {STEPS.map((s, i) => (
                <li key={s.t} className="flex items-start gap-4 bg-white p-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900">{s.t}</div>
                    <div className="text-sm text-slate-600">{s.d}</div>
                  </div>
                  <Badge status="live" />
                </li>
              ))}
            </ol>
            <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 text-[11px] text-slate-400">
                <span>apex mcp session</span><span>example output, illustrative values</span>
              </div>
              <pre className="overflow-x-auto p-5 text-[12.5px] leading-6 text-slate-200"><code>{EXAMPLE}</code></pre>
            </div>
            <h3 className="mb-3 text-lg font-bold text-slate-900">The tools</h3>
            <p className="mb-4 text-sm text-slate-600">
              {AI_CONNECTOR.readTools.length} tools that read, and {AI_CONNECTOR.writeTools.length} that make drafts behind a write link on the Pro plan.
            </p>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <ul className="divide-y divide-slate-100">
                {[...AI_CONNECTOR.readTools.map((t) => ({ ...t, draft: false })), ...AI_CONNECTOR.writeTools.map((t) => ({ ...t, draft: true }))].map((t) => (
                  <li key={t.name} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-6">
                    <code className="shrink-0 text-[12.5px] font-semibold text-blue-700 sm:w-[250px]">{t.name}</code>
                    <span className="text-sm text-slate-600">{t.does}{t.draft && <span className="ml-1 font-semibold text-slate-900">Pro write link.</span>}</span>
                  </li>
                ))}
              </ul>
            </div>
            <h3 className="mb-3 mt-10 text-lg font-bold text-slate-900">The data behind it</h3>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
              {Object.values(VERIFIED_STATS).map((s) => (
                <div key={s.what} className="bg-white p-5">
                  <div className="text-3xl font-extrabold tracking-tight text-slate-900">{s.value}</div>
                  <div className="mt-1 text-sm text-slate-500">{s.what}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-500">
              These describe the size of the catalog, not how fresh every price is: prices and offers refresh for the listings Apex tracks, not for every product at once. Other sellers never see your account data.
            </p>
          </Block>

          <Block id="developers" title="Developers" lead="Any MCP client that can call a remote server over HTTP with a bearer token can use the same endpoint.">
            <Developers />
          </Block>
        </div>
      </div>

      {/* Close */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-14 md:flex-row md:items-center">
          <div>
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Give your assistant your real numbers.</h2>
            <p className="text-slate-600">Start a trial, connect Amazon, then connect Claude or ChatGPT in a few minutes.</p>
          </div>
          <CheckoutLink href={TRIAL_CHECKOUT_URL} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700">
            {trialCta} <ArrowRight size={15} />
          </CheckoutLink>
        </div>
      </section>
    </div>
  );
}
