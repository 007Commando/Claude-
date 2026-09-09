"use client";

import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The landing page's own patterns, lifted verbatim so the offer pages are the
 * same site rather than a lookalike: max-w-7xl rails, black display type, the
 * rounded-[40px] product frame with blur orbs, and the bold/supporting
 * checkmark list.
 */

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function Rail({ children }: { children: ReactNode }) {
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>;
}

export function Eyebrow({
  children,
  icon,
  tone = "brand",
}: {
  children: ReactNode;
  icon?: ReactNode;
  tone?: "brand" | "purple";
}) {
  const tones = {
    brand: "bg-brand/10 text-brand",
    purple: "bg-purple-100 text-purple-600",
  };
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 ${tones[tone]} text-[10px] font-bold rounded-full mb-6 uppercase tracking-wider`}
    >
      {icon}
      {children}
    </div>
  );
}

export function CheckList({ items }: { items: [string, string][] }) {
  return (
    <ul className="space-y-4">
      {items.map(([title, detail]) => (
        <li key={title} className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <CheckCircle2 className="text-brand w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-800 font-bold block text-sm mb-0.5">
              {title}
            </span>
            <span className="text-slate-600 text-sm">{detail}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ProductFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative">
      <div className="relative bg-white rounded-[40px] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto rounded-[34px] border border-slate-100 scale-[1.02] hover:scale-[1.04] transition-transform duration-500"
        />
      </div>
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-purple-500/15 blur-[60px] rounded-full" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand/15 blur-[60px] rounded-full" />
    </div>
  );
}

/** Hero matching the landing page: black display type, grey italic second line. */
export function OfferHero({
  eyebrow,
  titleTop,
  titleAccent,
  lede,
  actions,
  note,
  art,
}: {
  eyebrow: ReactNode;
  titleTop: string;
  titleAccent: string;
  lede: string;
  actions: ReactNode;
  note?: string;
  art: ReactNode;
}) {
  return (
    <section className="pt-32 pb-16 lg:pt-48 lg:pb-32 overflow-hidden">
      <Rail>
        <div className="lg:grid lg:grid-cols-[1fr_1.2fr] lg:gap-16 items-center">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="max-w-2xl"
          >
            {eyebrow}
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] mb-10 tracking-tight">
              {titleTop} <br />
              <span className="text-slate-300 italic">{titleAccent}</span>
            </h1>
            <p className="text-2xl text-slate-500 mb-12 leading-relaxed font-medium">
              {lede}
            </p>
            <div className="flex flex-col sm:flex-row gap-5">{actions}</div>
            {note && <p className="mt-6 text-sm text-slate-500">{note}</p>}
          </motion.div>
          <div className="mt-24 lg:mt-0">{art}</div>
        </div>
      </Rail>
    </section>
  );
}

/** Alternating feature row, as used for "Sourcing: Speed is Precision". */
export function OfferRow({
  eyebrow,
  title,
  body,
  items,
  art,
  flip,
  below,
}: {
  eyebrow: ReactNode;
  title: string;
  body: string;
  items: [string, string][];
  art: ReactNode;
  flip?: boolean;
  below?: ReactNode;
}) {
  return (
    <section className="py-24 bg-white border-b border-slate-200">
      <Rail>
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={flip ? "lg:order-2" : undefined}
          >
            {eyebrow}
            <h3 className="text-4xl font-extrabold text-slate-900 mb-6">
              {title}
            </h3>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">{body}</p>
            <CheckList items={items} />
            {below}
          </motion.div>
          <div className={flip ? "lg:order-1" : undefined}>{art}</div>
        </div>
      </Rail>
    </section>
  );
}

export const ctaPrimary =
  "bg-brand text-white px-10 py-5 rounded-2xl text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(35,135,186,0.3)] flex items-center justify-center gap-3 uppercase tracking-widest";
export const ctaSecondary =
  "bg-slate-50 text-slate-900 border border-slate-200 px-10 py-5 rounded-2xl text-sm font-black hover:bg-white hover:shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest";
