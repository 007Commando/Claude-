"use client";

import { motion } from "motion/react";
import { ArrowRight, Check, Minus } from "lucide-react";
import Link from "next/link";

export const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: "easeOut" }
} as const;

export type CompareCell = string | boolean;

export function CellValue({ value }: { value: CompareCell }) {
  if (value === true) return <Check size={18} className="text-emerald-600 mx-auto" strokeWidth={3} />;
  if (value === false) return <Minus size={16} className="text-slate-300 mx-auto" strokeWidth={3} />;
  return <span className="text-sm text-slate-600">{value}</span>;
}

/**
 * The comparison table both pages share. Truthfulness is the strategy: rows
 * state facts either product's site confirms, and the rival's wins render
 * exactly as prominently as ours -- an answer engine cites the page that
 * reads like a reference, not a pamphlet.
 */
export function CompareTable({
  rivalName,
  rows,
}: {
  rivalName: string;
  rows: { label: string; apex: CompareCell; rival: CompareCell }[];
}) {
  return (
    <motion.div {...fadeIn} className="overflow-x-auto rounded-3xl border border-slate-200">
      <table className="w-full min-w-[38rem] border-collapse bg-white text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/70">
            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400 w-2/5"> </th>
            <th className="px-6 py-4 text-sm font-black text-slate-900 text-center bg-blue-50/40">Apex Applications</th>
            <th className="px-6 py-4 text-sm font-black text-slate-900 text-center">{rivalName}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-slate-100 last:border-b-0">
              <td className="px-6 py-4 text-sm font-bold text-slate-700">{row.label}</td>
              <td className="px-6 py-4 text-center bg-blue-50/40"><CellValue value={row.apex} /></td>
              <td className="px-6 py-4 text-center"><CellValue value={row.rival} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}

export function HonestVerdict({
  rivalName,
  chooseRival,
  chooseApex,
}: {
  rivalName: string;
  chooseRival: string[];
  chooseApex: string[];
}) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <motion.div {...fadeIn} className="rounded-3xl border border-slate-200 bg-white p-8">
        <h3 className="text-lg font-black tracking-tight text-slate-900 mb-4">Choose {rivalName} if…</h3>
        <ul className="space-y-3">
          {chooseRival.map((reason) => (
            <li key={reason} className="flex gap-3 items-start text-sm text-slate-600 leading-relaxed">
              <Check size={16} className="text-slate-400 shrink-0 mt-0.5" strokeWidth={3} />
              {reason}
            </li>
          ))}
        </ul>
      </motion.div>
      <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.1 }} className="rounded-3xl border-2 border-blue-200 bg-blue-50/30 p-8">
        <h3 className="text-lg font-black tracking-tight text-slate-900 mb-4">Choose Apex if…</h3>
        <ul className="space-y-3">
          {chooseApex.map((reason) => (
            <li key={reason} className="flex gap-3 items-start text-sm text-slate-700 leading-relaxed">
              <Check size={16} className="text-blue-600 shrink-0 mt-0.5" strokeWidth={3} />
              {reason}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

export function CompareCta({ line }: { line: string }) {
  return (
    <motion.div {...fadeIn} className="text-center rounded-[32px] border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-8 py-14">
      <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-3">Try the whole suite free</h2>
      <p className="text-slate-500 max-w-xl mx-auto mb-8">{line}</p>
      <Link
        href="/auth?mode=signup"
        className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 text-white px-10 py-4 font-black uppercase tracking-wide hover:scale-[1.03] transition-all"
      >
        Start the 7-day free trial <ArrowRight size={18} />
      </Link>
      <p className="text-xs text-slate-400 mt-4">Starter $149.99/mo · Pro $299/mo · repricer included in both</p>
    </motion.div>
  );
}

export function FactsFootnote({ rivalName, sources }: { rivalName: string; sources: { label: string; href: string }[] }) {
  return (
    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mx-auto text-center">
      {rivalName} details verified September 2026 against public pricing pages and independent
      reviews ({sources.map((source, i) => (
        <span key={source.href}>
          {i > 0 && ", "}
          <a href={source.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">{source.label}</a>
        </span>
      ))}). Their features and prices change on their schedule, not ours — check their site for
      current terms. {rivalName} is a trademark of its owner; no affiliation.
    </p>
  );
}

/**
 * The workflow-coverage chart: the whole suite-vs-point-tool argument in one
 * drawing. Five stages of a reseller's week; a filled cell means the tool
 * does that job, a hatched cell means partially (with the honest caveat
 * printed inside), an empty cell means you are buying another tool.
 */
export type Coverage = { state: "full" | "partial" | "none"; note?: string };

const STAGES = ["Research", "Buy & PO", "Price", "Fulfill", "Books"];

function CoverageCell({ cell, tone }: { cell: Coverage; tone: "apex" | "rival" }) {
  const base = "h-14 rounded-lg border flex items-center justify-center px-2 text-center";
  if (cell.state === "none") {
    return <div className={`${base} border-dashed border-slate-200 bg-slate-50/40`}><span className="text-[10px] font-bold text-slate-300">—</span></div>;
  }
  const full = cell.state === "full";
  const palette = tone === "apex"
    ? full ? "bg-blue-600 border-blue-600" : "bg-blue-100 border-blue-200"
    : full ? "bg-slate-700 border-slate-700" : "bg-slate-200 border-slate-300";
  const text = full ? "text-white" : tone === "apex" ? "text-blue-700" : "text-slate-600";
  return (
    <motion.div
      initial={{ scaleY: 0.4, opacity: 0 }}
      whileInView={{ scaleY: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className={`${base} ${palette}`}
    >
      <span className={`text-[10px] font-black leading-tight ${text}`}>
        {cell.note || (full ? "✓" : "partial")}
      </span>
    </motion.div>
  );
}

export function WorkflowCoverage({ rivalName, rival }: { rivalName: string; rival: Coverage[] }) {
  const apex: Coverage[] = [
    { state: "full", note: "122M products" },
    { state: "full", note: "POs + restock" },
    { state: "full", note: "break-even floors" },
    { state: "full", note: "prep network" },
    { state: "full", note: "P&L + cashflow" },
  ];
  return (
    <motion.div {...fadeIn} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 overflow-x-auto">
      <h3 className="text-sm font-black uppercase tracking-[0.15em] text-slate-400 mb-6 text-center">
        A reseller&apos;s week, and who covers it
      </h3>
      <div className="min-w-[34rem]">
        <div className="grid grid-cols-[6.5rem_repeat(5,1fr)] gap-2 items-center mb-2">
          <span />
          {STAGES.map((stage) => (
            <span key={stage} className="text-[11px] font-black uppercase tracking-wide text-slate-500 text-center">{stage}</span>
          ))}
        </div>
        <div className="grid grid-cols-[6.5rem_repeat(5,1fr)] gap-2 items-center mb-2">
          <span className="text-sm font-black text-slate-900">Apex</span>
          {apex.map((cell, i) => <CoverageCell key={i} cell={cell} tone="apex" />)}
        </div>
        <div className="grid grid-cols-[6.5rem_repeat(5,1fr)] gap-2 items-center">
          <span className="text-sm font-black text-slate-500">{rivalName}</span>
          {rival.map((cell, i) => <CoverageCell key={i} cell={cell} tone="rival" />)}
        </div>
      </div>
      <p className="text-[11px] text-slate-400 mt-5 text-center">
        Filled = does the job · labeled light cells = partially, with the caveat shown · dash = you buy another tool
      </p>
    </motion.div>
  );
}

/**
 * Entry-price bars, drawn from the same cited numbers as the table. Widths
 * scale to dollars so the eye gets what the table says.
 */
export function PriceBars({ items }: { items: { label: string; price: number; caption: string; apex?: boolean }[] }) {
  const max = Math.max(...items.map((item) => item.price));
  return (
    <motion.div {...fadeIn} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
      <h3 className="text-sm font-black uppercase tracking-[0.15em] text-slate-400 mb-6 text-center">
        Monthly price, side by side
      </h3>
      <div className="space-y-4 max-w-2xl mx-auto">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-baseline justify-between mb-1">
              <span className={`text-[13px] font-black ${item.apex ? "text-blue-700" : "text-slate-700"}`}>{item.label}</span>
              <span className="text-sm font-black tabular-nums text-slate-900">${item.price}</span>
            </div>
            <div className="h-6 rounded-md bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(item.price / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`h-full rounded-md ${item.apex ? "bg-blue-600" : "bg-slate-400"}`}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{item.caption}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/** The actual product, in a browser frame — an argument no drawing can make. */
export function SuiteShot({ caption }: { caption: string }) {
  return (
    <motion.div {...fadeIn} className="max-w-3xl mx-auto">
      <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] bg-white">
        <div className="flex items-center gap-1.5 bg-slate-100 px-3.5 py-2.5 border-b border-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2.5 text-[11px] text-slate-400 font-medium tracking-wide truncate">app.apexapplications.io</span>
        </div>
        <img src="/images/fba-starter-bundle/apex-suite-overview.png" alt="The Apex suite dashboard with the Tools menu open" className="w-full h-auto block" />
      </div>
      <p className="text-center text-sm text-slate-500 mt-4">{caption}</p>
    </motion.div>
  );
}
