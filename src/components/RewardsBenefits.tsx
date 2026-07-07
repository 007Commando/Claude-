"use client";

import { motion } from "motion/react";
import { Package, ShieldCheck, Users, Star, ArrowRight, Headphones } from "lucide-react";
import apexBullLogo from "../assets/apex-bull-logo.png.asset.json";
import { useRouter } from "next/navigation";

const prepCenterPhoto = "/images/rewards-prep-center.png";
const distributionPhoto = "/images/rewards-distribution.png";
const videoCallsPhoto = "/images/rewards-video-calls.png";

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const benefits = [
  {
    icon: Package,
    iconBg: "bg-blue-600",
    photo: prepCenterPhoto,
    title: "Prep Center Network",
    body: "Work with the best prep centers in the US at lower prices and with product insurance built in."
  },
  {
    icon: ShieldCheck,
    iconBg: "bg-blue-600",
    photo: distributionPhoto,
    title: "Distribution List",
    body: "Source items from trusted vendors in our network ready to un-gate you and help you scale.",
    href: "/distributor-vault"
  },
  {
    icon: Users,
    iconBg: "bg-indigo-700",
    photo: videoCallsPhoto,
    title: "Exclusive Video Calls",
    body: "Learn from 7-figure Amazon sellers the new strategies and sourcing tips to scale your business."
  }
];

const growthPerks = [
  {
    icon: null,
    arcFraction: 0.5,
    title: "20% Software Savings",
    body: "Save more every month when you go annual."
  },
  {
    icon: Headphones,
    arcFraction: 0.6,
    title: "Advanced Amazon Support",
    body: "Get help from people who know the business."
  },
  {
    icon: ShieldCheck,
    arcFraction: 0.7,
    title: "No Contracts or Hidden Fees Ever",
    body: "We keep it simple with a smooth, transparent experience."
  }
];

function GrowthRing({ arcFraction }: { arcFraction: number }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const arcLength = circumference * arcFraction;
  return (
    <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full -rotate-90">
      <circle cx={60} cy={60} r={r} fill="none" stroke="#dbeafe" strokeWidth={4} strokeDasharray="1 7" strokeLinecap="round" />
      <circle
        cx={60}
        cy={60}
        r={r}
        fill="none"
        stroke="#2563eb"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={`${arcLength} ${circumference}`}
      />
    </svg>
  );
}

export default function RewardsBenefits() {
  const router = useRouter();

  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <motion.section
          initial="initial"
          animate="animate"
          variants={fadeIn}
          className="text-center mb-16"
        >
          <div className="text-brand text-sm font-black uppercase tracking-[0.2em] mb-4">
            Apex Rewards & Benefits
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
            Grow Faster. Save More. <span className="text-brand">Scale Smarter.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Your Apex membership goes beyond software. Unlock exclusive resources, discounts, and access that help you build and scale your Amazon business with confidence.
          </p>
        </motion.section>

        {/* Benefit Cards */}
        <section className="grid md:grid-cols-3 gap-8 mb-12">
          {benefits.map(({ icon: Icon, iconBg, photo, title, body, href }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm mb-6">
                <img src={photo} alt={title} className="w-full h-auto block" />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
                  <Icon size={20} className="text-white" strokeWidth={1.75} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
              </div>
              <p className="text-slate-500 leading-relaxed mb-3">{body}</p>
              {href ? (
                <button
                  onClick={() => router.push(href)}
                  className="inline-flex items-center gap-2 text-brand font-bold text-sm hover:gap-3 transition-all"
                >
                  Explore the Vault <ArrowRight size={16} />
                </button>
              ) : (
                <div className="h-0.5 w-8 bg-brand rounded-full" />
              )}
            </motion.div>
          ))}
        </section>

        {/* Built For Your Growth */}
        <section className="mb-16 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <div className="text-brand text-sm font-black uppercase tracking-[0.2em] mb-4">
              Built for Your Growth
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              More Value. More Freedom. More Growth.
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              As an Apex member, you get exclusive advantages designed to help you save, scale, and succeed faster.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-10">
            {growthPerks.map(({ icon: Icon, arcFraction, title, body }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-2 rounded-full bg-white shadow-[0_10px_30px_-10px_rgba(15,23,42,0.15)]" />
                  <GrowthRing arcFraction={arcFraction} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img src={apexBullLogo.url} alt="" className="w-12 h-auto object-contain" aria-hidden />
                  </div>
                  {Icon && (
                    <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-brand flex items-center justify-center shadow-md">
                      <Icon size={16} className="text-white" strokeWidth={2} />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">{title}</h3>
                <div className="h-0.5 w-8 bg-brand rounded-full mx-auto mb-3" />
                <p className="text-slate-500 leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bottom Bar */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-slate-50 border border-slate-100 rounded-2xl px-8 py-6 flex flex-col lg:flex-row items-center gap-4 lg:gap-6"
        >
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full border-2 border-brand flex items-center justify-center">
              <Star size={16} className="text-brand" fill="currentColor" />
            </div>
            <span className="font-bold text-slate-900 whitespace-nowrap">New Benefits, Regularly.</span>
          </div>
          <div className="hidden lg:block h-8 w-px bg-slate-200" />
          <p className="text-slate-500 text-sm lg:text-base flex-1">
            New benefits are added regularly to help you stay ahead of the competition.
          </p>
          <button
            onClick={() => router.push("/pricing")}
            className="inline-flex items-center gap-2 text-brand font-bold hover:gap-3 transition-all whitespace-nowrap"
          >
            Become a Member <ArrowRight size={18} />
          </button>
        </motion.section>

      </div>
    </div>
  );
}
