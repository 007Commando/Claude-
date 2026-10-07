"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle2, Clock, EyeOff, ClipboardList, ExternalLink } from "lucide-react";
import reviewBoosterImage from "../assets/review-booster.png.asset.json";
import bullBlack from "../assets/bull-black.png.asset.json";
import ViewAppButton from "./ViewAppButton";
import { REVIEW_BOOSTER } from "../config/product";
import { PLAN_LIMITS, limitLabel, planById, trialTerms } from "../config/offer";

// Accuracy pass 2026-10-07: this page used to say Review Booster collects
// "more positive reviews", wins the Buy Box, lets you charge more and is
// "free" with no end. None of that is true. It sends Amazon's own Request a
// Review on eligible Amazon.com orders, after a wait the seller sets. Facts
// below match REVIEW_BOOSTER, MODULE_FACTS.black and PLAN_LIMITS.

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const benefits = [
  {
    icon: CheckCircle2,
    title: "Amazon's own request, sent for you",
    body: "Review Booster presses Amazon's Request a Review button for you. The buyer gets Amazon's standard message in Amazon's wording, so there is nothing to write and nothing to forget."
  },
  {
    icon: Clock,
    title: "You choose the wait",
    body: "Amazon does not give sellers a delivery date, so Review Booster counts days from the order date. You pick how many days to wait before the request goes out."
  },
  {
    icon: EyeOff,
    title: "Leave out any listing",
    body: "If a product should not be asked about, leave that listing out and no order containing it is requested. It works per listing, never per buyer."
  },
  {
    icon: ClipboardList,
    title: "A log of every request",
    body: "Each request is recorded against its Amazon order, with the result Amazon returned, so you can see what was sent and when."
  }
];

const beginnerCap = limitLabel(PLAN_LIMITS.beginner.reviewRequestsPerMonth);

export default function ReviewBooster() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero. initial={false}: the H1 is the LCP element and must render visible on the server. */}
        <motion.section
          initial={false}
          animate="animate"
          variants={fadeIn}
          className="grid lg:grid-cols-2 gap-12 items-center mb-32"
        >
          <div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 mb-8 tracking-tighter leading-[1.05]">
              Review Booster: Amazon&apos;s review request, sent on every eligible order
            </h1>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              Amazon has a Request a Review button in Seller Central, and almost nobody clicks it on every order. Review Booster clicks it for you on eligible {REVIEW_BOOSTER.marketplace} orders, a set number of days after the order. It is part of Apex Black.
            </p>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              It is free to switch on, with no card, until {REVIEW_BOOSTER.freeUntilLabel}. After that it needs an Apex plan or the trial. A request is not a review, and nothing here promises one.
            </p>
            <ViewAppButton className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold inline-flex items-center gap-2 hover:bg-slate-800 transition-all">
              Switch it on in Apex <ExternalLink size={18} />
            </ViewAppButton>
          </div>
          <div className="rounded-[32px] overflow-hidden">
            <img
              src={reviewBoosterImage.url}
              alt="Review Booster, Amazon Review Automation dashboard"
              className="w-full h-auto block"
            />
          </div>
        </motion.section>

        {/* Benefits grid */}
        <section className="grid md:grid-cols-2 gap-6 mb-32">
          {benefits.map(({ icon: Icon, title, body }, i) => (
            <div
              key={i}
              className="p-10 border border-slate-200 rounded-[28px] bg-white hover:shadow-lg transition-shadow"
            >
              <Icon size={36} className="text-slate-900 mb-6" strokeWidth={1.5} />
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
              <p className="text-slate-600 leading-relaxed">{body}</p>
            </div>
          ))}
        </section>

        {/* How to switch it on */}
        <section className="grid lg:grid-cols-2 gap-12 items-start mb-32">
          <div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tighter leading-[1.05]">
              How to switch it on
            </h2>
            <ol className="space-y-4 text-lg text-slate-600 leading-relaxed list-decimal pl-6">
              <li>Connect your Amazon account to Apex.</li>
              <li>Open Review Booster in Apex Black and switch it on.</li>
              <li>Choose how many days to wait after an order, and leave out any listings you do not want asked about.</li>
            </ol>
          </div>
          <div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tighter leading-[1.05]">
              Who it covers, and its limits
            </h2>
            <ul className="space-y-3 text-lg text-slate-600 leading-relaxed list-disc pl-6">
              <li>{REVIEW_BOOSTER.marketplace} orders only, and Amazon decides which orders are eligible.</li>
              <li>It sends Amazon&apos;s standard message. It cannot write reviews, customise the message, choose which buyers are asked or ask only happy buyers.</li>
              <li>It does not guarantee a review, a rating or a Buy Box win.</li>
              <li>{planById("beginner").name} plan: {beginnerCap} requests a month. Starter, Plus and Pro: unlimited.</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-6">
              For what automated review requests are and are not allowed to do under Amazon&apos;s rules, read{" "}
              <Link href="/amazon-review-automation" className="underline font-semibold text-slate-900">
                how review request automation works
              </Link>
              .
            </p>
          </div>
        </section>

        {/* CTA strip */}
        <section className="text-center mb-32">
          <div className="flex justify-center mb-8">
            <img src={bullBlack.url} alt="Apex Applications" className="h-20 w-auto opacity-80" />
          </div>
          <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tighter">
            Free to switch on until {REVIEW_BOOSTER.freeUntilLabel}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Boosters switched on during the offer keep running. After {REVIEW_BOOSTER.freeUntilLabel}, switching one on needs a plan or the trial. {trialTerms("starter")}
          </p>
          <ViewAppButton className="bg-slate-900 text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all inline-flex items-center gap-2">
            Switch it on in Apex <ExternalLink size={18} />
          </ViewAppButton>
        </section>

        {/* Hands-free section 1 */}
        <section className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="rounded-[32px] overflow-hidden border border-slate-200 bg-white">
            <img
              src={reviewBoosterImage.url}
              alt="Hands-free review requests"
              className="w-full h-auto block"
            />
          </div>
          <div>
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter leading-[1.05]">
              Skip the clicking in Seller Central.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Instead of opening each order and pressing Request a Review yourself, Review Booster does it for every eligible order that is not on a listing you left out. You keep working on sourcing and buying.
            </p>
          </div>
        </section>

        {/* Hands-free section 2 */}
        <section className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter leading-[1.05]">
              Set it once.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Once it is on, Review Booster runs in the background on the wait you chose. It will not ask twice about the same order.
            </p>
          </div>
          <div className="order-1 lg:order-2 rounded-[32px] overflow-hidden border border-slate-200 bg-white">
            <img
              src={reviewBoosterImage.url}
              alt="Review Booster settings"
              className="w-full h-auto block"
            />
          </div>
        </section>

      </div>
    </div>
  );
}
