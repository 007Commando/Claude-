"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { fadeIn } from "./CompareShared";

/**
 * The frame the four editorial pages share.
 *
 * These pages exist to answer a question somebody typed into a search box, so
 * the shape is the same every time: say the thing, show the steps, admit what
 * is not covered, then offer the product once. The `caveat` block is not
 * optional decoration — every one of these topics has a line we are not
 * allowed to cross (Red is in beta, a supplier introduction is not approval, a
 * request is not a review), and giving it a fixed place means it cannot be
 * quietly dropped in a later edit.
 */

export type Section = {
  heading: string;
  body: string;
  /** Checklist items, where the section is a procedure rather than prose. */
  points?: string[];
};

export type Faq = { question: string; answer: string };

export default function ContentPage({
  eyebrow,
  h1,
  intro,
  sections,
  caveat,
  faqs,
  ctaHeading,
  ctaBody,
  ctaLabel,
  ctaHref = "/auth?mode=signup",
  related,
}: {
  eyebrow: string;
  h1: string;
  intro: string;
  sections: Section[];
  caveat: { heading: string; body: string };
  faqs: Faq[];
  ctaHeading: string;
  ctaBody: string;
  ctaLabel: string;
  ctaHref?: string;
  related: { label: string; href: string }[];
}) {
  return (
    <main className="pt-32 pb-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <motion.header {...fadeIn}>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-5">
            {eyebrow}
          </p>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.05] mb-6">
            {h1}
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">{intro}</p>
        </motion.header>

        <div className="space-y-12">
          {sections.map((section) => (
            <motion.section key={section.heading} {...fadeIn} className="space-y-4">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                {section.heading}
              </h2>
              <p className="text-base leading-relaxed text-slate-600">{section.body}</p>

              {section.points && (
                <ul className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-3 items-start text-sm text-slate-600 leading-relaxed">
                      <Check size={15} className="text-blue-600 shrink-0 mt-0.5" strokeWidth={3} />
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>
          ))}
        </div>

        {/* The line we do not cross on this topic, in a fixed place. */}
        <motion.aside
          {...fadeIn}
          className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6"
        >
          <p className="text-sm font-black text-amber-900 mb-1.5">{caveat.heading}</p>
          <p className="text-sm leading-relaxed text-amber-900/80">{caveat.body}</p>
        </motion.aside>

        <motion.div
          {...fadeIn}
          className="text-center rounded-[32px] border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-8 py-14"
        >
          <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-3">{ctaHeading}</h2>
          <p className="text-slate-500 max-w-xl mx-auto mb-8">{ctaBody}</p>
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 text-white px-10 py-4 font-black uppercase tracking-wide hover:scale-[1.03] transition-all"
          >
            {ctaLabel} <ArrowRight size={18} />
          </Link>
        </motion.div>

        <motion.section {...fadeIn} className="space-y-5">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Common questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-black text-slate-900 mb-1.5">{faq.question}</p>
                <p className="text-sm leading-relaxed text-slate-500">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.nav {...fadeIn} className="border-t border-slate-200 pt-8">
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3">
            Read next
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {related.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-bold text-blue-600 underline hover:text-blue-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.nav>
      </div>
    </main>
  );
}
