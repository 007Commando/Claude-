"use client";

import { motion } from "motion/react";
import Link from "next/link";
import HeroCta from "./HeroCta";
import type { Comparison } from "../data/comparisons";
import {
  CompareTable,
  CompareCta,
  HonestVerdict,
  FactsFootnote,
  fadeIn,
  WorkflowCoverage,
  PriceBars,
  SuiteShot,
} from "./CompareShared";

/**
 * One layout for every comparison written after the first four.
 *
 * The original pages are hand-built components and stay that way — there is no
 * gain in rewriting working pages. What this avoids is the opposite failure:
 * twelve more copies of the same JSX, drifting apart as each is edited, until
 * the table on one page renders differently from the table on another and
 * nobody can say which is right. The content is individual; only the frame is
 * shared.
 */
export default function ComparePage({ data }: { data: Comparison }) {
  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* initial={false}: the hero is the LCP element and must render visible on the server, not at opacity 0. */}
        <motion.header {...fadeIn} initial={false} className="text-center max-w-3xl mx-auto flex flex-col">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-5">
            Honest comparison
          </p>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.05] mb-6">
            {data.h1}
          </h1>
          <p className="order-3 sm:order-none text-lg text-slate-500 leading-relaxed">{data.intro}</p>
          <p className="order-4 sm:order-none mt-5 text-sm text-slate-500">
            Read more about{" "}
            <Link href={data.moduleHref} className="text-blue-600 underline hover:text-blue-700">
              {data.moduleLabel}
            </Link>
            , or see{" "}
            <Link href="/pricing" className="text-blue-600 underline hover:text-blue-700">
              what a plan includes
            </Link>
            .
          </p>
          {/* On phones the button sits under the headline: some honest intros run 800 characters. */}
          <div className="order-2 sm:order-none mb-6 sm:mb-0">
            <HeroCta cta={`compare-${data.slug}-hero`} />
          </div>
        </motion.header>

        <WorkflowCoverage rivalName={data.rival} rival={data.coverage} />

        <CompareTable rivalName={data.rival} rows={data.rows} />

        {/*
          Only drawn when the intervals are comparable. A bar is a claim about
          relative size, and an annual-equivalent figure beside monthly ones
          makes that claim falsely — so those records simply carry no bars and
          say the same thing in the table, where the caveat fits.
        */}
        {data.priceBars && <PriceBars items={data.priceBars} />}

        <SuiteShot caption={data.shotCaption} />

        <HonestVerdict
          rivalName={data.rival}
          chooseRival={data.chooseRival}
          chooseApex={data.chooseApex}
        />

        <CompareCta line={data.ctaLine} />

        <motion.p {...fadeIn} className="text-center text-sm text-slate-500">
          More comparisons on the{" "}
          <Link href="/compare" className="text-blue-600 underline hover:text-blue-700">
            comparison index
          </Link>
          .
        </motion.p>

        <FactsFootnote rivalName={data.rival} sources={data.sources} />
      </div>
    </div>
  );
}
