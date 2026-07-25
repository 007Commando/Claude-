"use client";

import { motion } from "motion/react";
import { CheckCircle2, Users, CalendarDays, ArrowRight } from "lucide-react";

const COMMUNITY_URL = "https://community.amazonsuccesshub.com/c/start-here";
const CALENDLY_URL = "https://calendly.com/apexapplications-info/meeting";

const steps = [
  {
    icon: Users,
    title: "Join Our Exclusive Circle Community",
    body: "Connect with other sellers, ask questions, and get support from the Apex team and community as you get started.",
    cta: "Join the Community",
    href: COMMUNITY_URL,
  },
  {
    icon: CalendarDays,
    title: "Schedule Your 1-on-1 Onboarding Call",
    body: "Book time with our team to make sure everything is set up right and you have a clear plan to start growing aggressively.",
    cta: "Schedule Your Call",
    href: CALENDLY_URL,
  },
];

export default function FbaThankYou() {
  return (
    <div className="pt-28 sm:pt-32 pb-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-6">
            <CheckCircle2 size={32} className="text-emerald-600" strokeWidth={2} />
          </div>
          <h1 className="text-3xl lg:text-5xl font-black text-slate-900 mb-5 tracking-tight leading-[1.1]">
            You're In. Welcome to Apex.
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            Your Amazon FBA Starter Bundle access is on its way to your inbox. Take these two
            steps now to get plugged in and start growing as fast as possible.
          </p>
        </motion.section>

        <div className="grid sm:grid-cols-2 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col rounded-[28px] bg-slate-50/70 border border-slate-100 p-8"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center shrink-0 mb-5">
                <step.icon size={22} className="text-white" strokeWidth={1.75} />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">{step.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-1">{step.body}</p>
              <a
                href={step.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-brand text-white px-6 py-3.5 rounded-[16px] font-black text-sm shadow-[0_16px_32px_rgba(249,115,22,0.25)] hover:scale-[1.02] transition-all uppercase tracking-wide"
              >
                {step.cta} <ArrowRight size={16} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
