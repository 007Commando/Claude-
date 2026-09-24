"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarCheck, Clock3 } from "lucide-react";

import VaComparison from "./landing/VaComparison";
import { rateRangeLabel } from "../lib/vaPricing";

/**
 * The VA offer, for somebody who has not decided yet.
 *
 * One job: get the meeting booked. Everything on the page argues for that one
 * action, and the part of the service that asks for a decision, which VA, how
 * many hours a week, a card, lives on /apex-vas/hire instead. A page that both
 * sells a trial and asks you to pick a schedule is two conversations at once,
 * and the reader has only had the first.
 *
 * Somebody who already knows what they want still gets out of here in one
 * click, at the bottom.
 */

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
} as const;

/** The same calendar the rest of the site books onto. */
const BOOK_HREF =
  "https://calendly.com/apexapplications-info/new-meeting?utm_term=apex-vas";

/** Named by the seller, in the order they think about the work. */
const SERVICES = [
  "Professional account audit",
  "Product research",
  "Supplier management",
  "Restocking",
  "Repricing",
  "Bundle creation",
  "Logistics and shipments",
  "Customer service",
];

function BookButton({ children }: { children: React.ReactNode }) {
  return (
    <a
      href={BOOK_HREF}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-indigo-700"
    >
      {children}
      <ArrowRight className="w-4 h-4" />
    </a>
  );
}

export default function ApexVasPromo() {
  return (
    <main className="bg-white">
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <motion.p
          {...fadeIn}
          className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 mb-4"
        >
          New offer
        </motion.p>
        <motion.h1
          {...fadeIn}
          className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-5"
        >
          14 days free. Put a professional Amazon VA to work in your business
        </motion.h1>
        <motion.p {...fadeIn} className="text-lg text-slate-500 max-w-2xl mx-auto">
          Not a general assistant you have to teach. Ours work inside your Apex
          account from day one, with more than 20 years of Amazon experience
          across the team behind them.
        </motion.p>

        <motion.div {...fadeIn} className="mt-8 flex flex-col items-center gap-3">
          <BookButton>Book your free trial call</BookButton>
          <p className="text-sm text-slate-400">
            Fifteen minutes. Tell us what you need done and we will match you to
            a VA. No card to start.
          </p>
        </motion.div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-14">
        <motion.h2
          {...fadeIn}
          className="text-2xl font-black tracking-tight text-slate-900 mb-2 text-center"
        >
          What your VA takes off your plate
        </motion.h2>
        <motion.p {...fadeIn} className="text-slate-500 mb-8 text-center">
          The work a wholesale business runs on, done in the software you
          already use.
        </motion.p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service}
              {...fadeIn}
              transition={{ ...fadeIn.transition, delay: Math.min(i, 4) * 0.05 }}
              className="flex items-start gap-2.5 rounded-2xl border border-slate-200 px-4 py-3.5"
            >
              <BadgeCheck className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <p className="text-sm font-semibold text-slate-700">{service}</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-slate-400">
          And the rest of it. If it happens in your Amazon account, they have
          done it before.
        </p>
      </section>

      {/*
        Against the marketplaces, using the comparison the other VA page
        already carries rather than a second set of competitor figures. Their
        rates are one claim we have to be able to stand behind, and two copies
        of it would eventually disagree.
      */}
      <VaComparison />

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          {...fadeIn}
          className="rounded-3xl border border-slate-200 bg-slate-50 px-8 py-12 text-center"
        >
          <CalendarCheck className="w-8 h-8 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Start with a conversation, not a contract
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500 leading-relaxed">
            We will look at your account, agree what the first two weeks should
            cover, and put the right VA on it. If it is not working, you walk
            away at the end of the trial having paid nothing.
          </p>
          <div className="mt-7 flex justify-center">
            <BookButton>Book your free trial call</BookButton>
          </div>

          {/*
            The way out for somebody who has already decided. They do not need
            the meeting, and making them sit through it to reach a checkout
            that exists would be the page getting in its own way.
          */}
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-slate-500">
            <Clock3 className="w-4 h-4 text-slate-400" />
            Know what you need already?
            <Link
              href="/apex-vas/hire"
              className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-700"
            >
              See who is available and hire from {rateRangeLabel().split(" to ")[0]}/hour
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
}
