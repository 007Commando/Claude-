"use client";

import { motion } from "motion/react";
import { CheckCircle2, Trophy, DollarSign, Flag, ExternalLink } from "lucide-react";
import reviewBoosterImage from "../assets/review-booster.png.asset.json";
import bullBlack from "../assets/bull-black.png.asset.json";
import ViewAppButton from "./ViewAppButton";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const benefits = [
  {
    icon: CheckCircle2,
    title: "Effortless Automation",
    body: "Stop manually requesting reviews. Our tool streamlines the process, ensuring every order gets a timely review request, maximizing your positive feedback."
  },
  {
    icon: Trophy,
    title: "Win More Buy Box Placements",
    body: "A higher feedback score signals to Amazon that you're a reliable seller, increasing your chances of being featured in the Buy Box. More visibility = more sales!"
  },
  {
    icon: DollarSign,
    title: "Charge More & Stay Competitive",
    body: "With a strong reputation, customers are more willing to buy from you, even at slightly higher prices, giving you greater pricing flexibility."
  },
  {
    icon: Flag,
    title: "Stay Ahead of the Competition",
    body: "While factors like price, shipping speed, and fulfillment method still matter, great feedback gives you an undeniable edge over other sellers."
  }
];

export default function ReviewBooster() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <motion.section
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="grid lg:grid-cols-2 gap-12 items-center mb-32"
        >
          <div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 mb-8 tracking-tighter leading-[1.05]">
              Boost Your Amazon Sales with Automated Review Requests
            </h1>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Winning the Buy Box is critical for increasing sales on Amazon—and a strong feedback score is one of the key factors that help you secure it. Our Free Review Automation Tool helps you effortlessly collect more positive reviews, building trust and boosting your chances of standing out.
            </p>
            <ViewAppButton className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold inline-flex items-center gap-2 hover:bg-slate-800 transition-all">
              Join Now <ExternalLink size={18} />
            </ViewAppButton>
          </div>
          <div className="rounded-[32px] overflow-hidden">
            <img
              src={reviewBoosterImage.url}
              alt="Review Booster — Amazon Review Automation dashboard"
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

        {/* CTA strip */}
        <section className="text-center mb-32">
          <div className="flex justify-center mb-8">
            <img src={bullBlack.url} alt="Apex Applications" className="h-20 w-auto opacity-80" />
          </div>
          <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-10 tracking-tighter">
            Start Using It for Free Today!
          </h2>
          <ViewAppButton className="bg-slate-900 text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all inline-flex items-center gap-2">
            Get Started for Free <ExternalLink size={18} />
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
              Hands-free review requests!
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Skip the hassle of manually requesting reviews on Seller Central and focus on growing your business. With Review Automation, all eligible orders receive automatic review requests, saving you time and effort.
            </p>
          </div>
        </section>

        {/* Hands-free section 2 */}
        <section className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter leading-[1.05]">
              Set it and forget it.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Once activated, Review Automation runs quietly in the background — sending review requests at the optimal time so you can stay focused on sourcing, negotiating, and scaling your wholesale business.
            </p>
          </div>
          <div className="order-1 lg:order-2 rounded-[32px] overflow-hidden border border-slate-200 bg-white">
            <img
              src={reviewBoosterImage.url}
              alt="Review automation set and forget"
              className="w-full h-auto block"
            />
          </div>
        </section>

      </div>
    </div>
  );
}
