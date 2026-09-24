"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ClipboardList,
  Clock3,
  UserCheck,
} from "lucide-react";

import {
  Eyebrow,
  OfferRow,
  ProductFrame,
  Rail,
  ctaPrimary,
} from "./landing/OfferKit";
import VaComparison, {
  SatisfactionGuarantee,
} from "./landing/VaComparison";
import {
  rateRangeLabel,
  VA_TRIAL_DAYS,
  VA_TRIAL_DAYS_LABEL,
  VA_TRIAL_DAYS_WORD,
} from "../lib/vaPricing";

import resourceLibrary from "../assets/resource-library.png.asset.json";
import inventoryRestocking from "../assets/inventory-restocking.png.asset.json";

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
 *
 * The argument under the hero is the sales page this URL used to carry, kept
 * because it does work the hero cannot: the trial headline sells the price,
 * and these sections sell the difference between a trained assistant and an
 * hourly freelancer, which is the objection the reader actually arrives with.
 * Every call to action in them books the same meeting, so the page still asks
 * for one thing however far down somebody reads.
 */

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
} as const;

/** The same calendar the rest of the site books onto. */
const BOOK_HREF =
  "https://calendly.com/apexapplications-info/new-meeting?utm_term=virtual-assistants";

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

const PLANS = [
  {
    name: "Part time",
    hours: "20 hours a week",
    body: "Sourcing support, catalogue upkeep and supplier follow-ups alongside you.",
  },
  {
    name: "Full time",
    hours: "40 hours a week",
    body: "Owns the day-to-day so you can work on the business instead of in it.",
  },
];

function BookButton({ children }: { children: React.ReactNode }) {
  return (
    <a
      href={BOOK_HREF}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-brand px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-dark"
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
          className="text-xs font-bold uppercase tracking-[0.2em] text-brand mb-4"
        >
          New offer
        </motion.p>
        <motion.h1
          {...fadeIn}
          className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-5"
        >
          {VA_TRIAL_DAYS_LABEL} free. Put a professional Amazon VA to work in your business
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
              <BadgeCheck className="w-4 h-4 text-brand mt-0.5 shrink-0" />
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
        The objection, before the price comparison rather than after it. A
        reader who has not yet been told why a trained assistant is a different
        purchase reads the table as two hourly rates side by side, and ours is
        the higher one.
      */}
      <OfferRow
        flip
        eyebrow={<Eyebrow icon={<ClipboardList size={14} />}>What they take off you</Eyebrow>}
        title="The work that quietly eats your week."
        body="Catalogue scanning, supplier follow-ups, restock checks and purchase orders keep an owner in the weeds. They are also the easiest work to hand over once the process is written down."
        items={[
          ["Sourcing and shortlisting", "Scans catalogues and surfaces what clears margin."],
          ["Supplier follow-up", "Chases distributor replies so accounts actually open."],
          ["Restock and purchase orders", "Keeps stock moving before the Buy Box is lost."],
        ]}
        art={<ProductFrame src={inventoryRestocking.url} alt="Restock dashboard" />}
      />

      <OfferRow
        eyebrow={
          <Eyebrow icon={<UserCheck size={14} />}>
            The difference
          </Eyebrow>
        }
        title="A freelancer does tasks. A trained assistant builds a process."
        body="The problem with hourly marketplaces is not the price; it is that nothing accumulates. Every hire starts from zero, and when they leave the knowledge leaves with them. Ours arrive knowing Amazon wholesale and write down how your business runs as they work."
        items={[
          ["Trained before day one", "Sourcing, ungating, purchase orders and prep, not general admin."],
          ["SOPs installed as they go", "Your process gets documented, so it outlasts any one person."],
          ["Works inside your Apex account", "Same catalogue, same numbers, with the permissions you set."],
        ]}
        art={<ProductFrame src={resourceLibrary.url} alt="SOP and resource library" />}
      />

      {/*
        Against the marketplaces, using the comparison the other VA page
        already carries rather than a second set of competitor figures. Their
        rates are one claim we have to be able to stand behind, and two copies
        of it would eventually disagree.
      */}
      <VaComparison />

      <SatisfactionGuarantee />

      <section id="plans" className="py-12 sm:py-16 lg:py-20 bg-white">
        <Rail>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h3 className="text-[1.75rem] sm:text-4xl font-extrabold text-slate-900 mb-4 sm:mb-5 leading-tight">
              Part time or full time.
            </h3>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Both start with {VA_TRIAL_DAYS_LABEL} free, so you can judge the work
              before you pay for it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className="bg-white rounded-[28px] sm:rounded-[32px] border border-slate-200 p-7 sm:p-10 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.15)]"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand mb-3">
                  {plan.name}
                </p>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
                  {plan.hours}
                </p>
                <p className="text-slate-600 mb-8 leading-relaxed">{plan.body}</p>
                {/*
                  The same meeting as the hero, not a second destination. The
                  schedule is the first thing the call settles, so a button
                  that named a plan and then skipped the conversation would be
                  selling something nobody has been quoted for yet.
                */}
                <a
                  href={BOOK_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${ctaPrimary} w-full`}
                >
                  Start {VA_TRIAL_DAYS} Days Free <ArrowRight size={18} />
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500 mt-10 max-w-xl mx-auto">
            Both are billed at the same fixed {rateRangeLabel()} an hour. No platform
            fee, no agency retainer, no charge for the first {VA_TRIAL_DAYS_WORD} days.
          </p>
        </Rail>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20">
        <motion.div
          {...fadeIn}
          className="rounded-3xl border border-slate-200 bg-slate-50 px-8 py-12 text-center"
        >
          <CalendarCheck className="w-8 h-8 text-brand mx-auto mb-4" />
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
              className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
            >
              See who is available and hire from {rateRangeLabel().split(" to ")[0]}/hour
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
}
