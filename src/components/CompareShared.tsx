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
