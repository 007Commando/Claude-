"use client";

/**
 * /zero-to-hero — the Amazon wholesale course, as the way into a Starter trial.
 *
 * The design came from Lovable; the offer did not. The mockup sold "$29 today,
 * then $149 after 14 days", and no such product exists: there is no $29 price
 * in Stripe, and the $149 figure belongs to Plus, which the pricing page
 * deliberately withholds because that amount was never reconciled against the
 * live Stripe price (see PLANS_SHOWN in config/offer.ts). So the layout is the
 * mockup's and every number is read from offer.ts, which is the one place that
 * tracks what checkout actually charges.
 *
 * The free course did not go away — it moved to /free-course, and is still the
 * only page pointing at the plan-less signup path in Auth.tsx.
 */
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  CirclePlay,
  GraduationCap,
  ScanLine,
  ShieldCheck,
  Star,
  Truck,
  X,
  Zap,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { readStoredAttribution } from "./LeadAttribution";
import { TRIAL_DAYS, planById, trialTerms } from "../config/offer";
import "./zero-to-hero.css";

const ORIGIN = "https://www.apexapplications.io";

/**
 * Every CTA lands here.
 *
 * Starter monthly, because that is the plan whose price on this site has been
 * reconciled with the live Stripe price. `period=monthly` is explicit: the
 * terms quoted beside the button are the monthly ones.
 */
const START_HREF = "/auth?mode=signup&plan=starter&period=monthly";
const STARTER = planById("starter");

/** Written once; the sentence under every button is the same sentence. */
const TERMS = trialTerms("starter");

const priceLabel = `$${STARTER.monthly % 1 === 0 ? STARTER.monthly : STARTER.monthly.toFixed(2)}`;

/**
 * The people in the avatar row.
 *
 * Real photographs, supplied by Apex. The stock faces the mockup shipped with
 * were dropped rather than captioned as customers.
 */
const customers = [1, 2, 3, 4, 5].map((n) => ({
  src: `/images/zero-to-hero/avatars/customer-${n}.webp`,
  alt: `Apex customer ${n}`,
}));

/**
 * Lights the sheen once, the moment the element is properly on screen.
 *
 * Returns the class rather than animating directly so the animation stays in
 * CSS, where `prefers-reduced-motion` can switch it off in one rule.
 */
function useSheen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, margin: "-25% 0px -25% 0px" });
  const [lit, setLit] = useState(false);
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setLit(true), 120);
    return () => clearTimeout(t);
  }, [inView]);
  return { ref, className: lit ? "cta-shine is-lit" : "cta-shine" };
}

/**
 * The line that threads the four modules together, drawn as you scroll.
 *
 * Same idea as the How It Works page: the path's `pathLength` is tied to the
 * section's progress through the viewport, so the route appears to be drawn
 * ahead of the reader rather than animating on a timer of its own.
 */
function CurriculumTrail({ target }: { target: React.RefObject<HTMLDivElement | null> }) {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start 78%", "end 62%"],
  });
  const length = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
      <svg className="h-full w-full" viewBox="0 0 100 1000" preserveAspectRatio="none">
        <path
          d={TRAIL}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <motion.path
          d={TRAIL}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: reduced ? 1 : length }}
        />
      </svg>
    </div>
  );
}

const TRAIL =
  "M62 40 C62 170, 38 170, 38 280 C38 400, 62 400, 62 520 C62 640, 38 640, 38 760 C38 880, 62 880, 62 960";

const highlights = [
  ["9 videos", "Four focused modules you can follow in order"],
  ["Zero to first order", "Learn suppliers, research and purchasing"],
  ["Ungating Roadmap", "A clear path toward gated category approval"],
];

const modules = [
  {
    icon: GraduationCap,
    label: "Module 01",
    title: "The Game",
    lead: "What the business actually is.",
    body: "A walkthrough of Apex, how wholesale works, and the checklist of what to have in place before you spend anything.",
    videos: "3 videos",
  },
  {
    icon: Truck,
    label: "Module 02",
    title: "Suppliers",
    lead: "How to be taken seriously.",
    body: "Setting yourself up so distributors open an account for you, and where to look for suppliers worth contacting in the first place.",
    videos: "2 videos",
  },
  {
    icon: ScanLine,
    label: "Module 03",
    title: "Product Research",
    lead: "Deciding what is worth buying.",
    body: "Running a supplier's catalogue through the UPC Scanner, and working backwards from a brand to the products behind it.",
    videos: "2 videos",
  },
  {
    icon: BookOpen,
    label: "Module 04",
    title: "Purchasing",
    lead: "Placing and repeating the order.",
    body: "Turning research into a purchase order, and restocking what sells without starting the process over.",
    videos: "2 videos",
  },
];

const included = [
  {
    icon: CirclePlay,
    eyebrow: "Apex University",
    title: "Amazon Wholesale Course",
    body: "Nine videos across four modules covering suppliers, product research and purchasing. Watchable in an evening, in the order you need them.",
    img: "/images/zero-to-hero/university-modules.webp",
    alt: "The Apex University module list, showing the course videos inside the app",
  },
  {
    icon: ScanLine,
    eyebrow: "The Software",
    title: "The whole Apex suite, free for your trial",
    body: "Sourcing, analytics, purchase orders and logistics in one connected workspace — Apex Black, Blue and Green, open for the length of your trial.",
    img: "/images/zero-to-hero/software-suite.webp",
    alt: "The Apex dashboard showing analytics and the tools menu",
  },
  {
    icon: Truck,
    eyebrow: "The Suppliers",
    title: "3 vetted suppliers to start with",
    body: "Three vetted wholesale suppliers so you can launch, load real catalogues into the software and begin finding products to sell.",
    img: "/images/zero-to-hero/suppliers.webp",
    alt: "Three wholesale supplier catalogues and their products",
  },
];

/** The scroll reveal used throughout, in one place so the page moves as a set. */
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

function trackStart() {
  const attribution = readStoredAttribution();
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: attribution?.source ?? "direct",
      event: "zero_to_hero_cta",
      visitorId: attribution?.visitorId,
      utmSource: attribution?.utmSource,
      utmMedium: attribution?.utmMedium,
      utmCampaign: attribution?.utmCampaign,
    }),
    keepalive: true,
  }).catch(() => {});
}

function StartButton({
  children,
  className = "",
  terms = true,
}: {
  children: React.ReactNode;
  className?: string;
  terms?: boolean;
}) {
  const sheen = useSheen<HTMLAnchorElement>();
  return (
    <a
      ref={sheen.ref}
      href={START_HREF}
      onClick={trackStart}
      className={`group inline-block rounded-md bg-primary px-10 py-4 text-center text-primary-foreground transition-transform hover:-translate-y-0.5 ${sheen.className} ${className}`}
      style={{ boxShadow: "0 6px 0 0 hsl(var(--primary) / 0.45)" }}
    >
      <span className="flex items-center justify-center gap-4 text-lg font-bold">
        {children}
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </span>
      {terms && <span className="mt-1 block text-xs font-medium opacity-90">{TERMS}</span>}
    </a>
  );
}

export default function ZeroToHero() {
  const curriculum = useRef<HTMLDivElement>(null);
  const playbookSheen = useSheen<HTMLAnchorElement>();
  const closingSheen = useSheen<HTMLAnchorElement>();

  return (
    <div className="zth min-h-screen overflow-x-hidden bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mesh-bg absolute inset-0" />
        <div className="container relative mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 text-xs font-bold uppercase tracking-[0.25em] text-primary">
              Apex University · {TRIAL_DAYS} days free
            </div>
            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
              <span className="block">From zero to</span>
              <span className="mt-3 inline-block -rotate-[1.5deg] bg-primary px-5 py-2 text-primary-foreground md:px-7 md:py-3">
                Amazon hero.
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground md:text-xl">
              The wholesale business, taught in nine videos.{" "}
              <br className="hidden sm:block" />
              Free for {TRIAL_DAYS} days with the software it is taught in.
            </p>

            <div className="mt-10 flex justify-center">
              <StartButton>Start my {TRIAL_DAYS}-day trial</StartButton>
            </div>

            <div className="mx-auto mt-6 flex max-w-md flex-col items-center gap-2.5 text-center">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {customers.map((c) => (
                    <img
                      key={c.src}
                      src={c.src}
                      alt={c.alt}
                      width={36}
                      height={36}
                      loading="lazy"
                      className="h-9 w-9 rounded-full border-2 border-background object-cover shadow-sm"
                    />
                  ))}
                </div>
                <div className="flex gap-0.5 text-accent">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-3 w-3 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  loved by <span className="font-bold text-foreground">2,400+ customers</span>
                </p>
              </div>
              <p className="w-full text-[11px] text-muted-foreground">
                We respect your privacy. Your information will never be shared.
              </p>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-3">
              {highlights.map(([title, body], i) => (
                <motion.div
                  key={title}
                  {...reveal}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="glow-edge group relative overflow-hidden rounded-lg border bg-card p-5 text-left"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                    {`0${i + 1}`}
                  </span>
                  <div className="mt-5 text-xl font-extrabold leading-tight">{title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</div>
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-8 -right-4 text-8xl font-black text-primary/5"
                  >
                    {`0${i + 1}`}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              The Curriculum
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-5xl">
              Four modules.
              <span className="mt-1 block text-primary">Zero to your first order.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">In the order you need them.</p>
          </div>

          <div className="relative mx-auto mt-16 max-w-5xl" ref={curriculum}>
            <CurriculumTrail target={curriculum} />
            <div className="relative space-y-10 md:space-y-16">
              {modules.map((m, i) => {
                const Icon = m.icon;
                const right = i % 2 === 1;
                return (
                  <div key={m.title} className="relative md:grid md:grid-cols-2 md:gap-16">
                    <div className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-bold text-primary shadow-sm">
                        {i + 1}
                      </span>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: right ? 40 : -40, y: 20 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.5 }}
                      className={right ? "md:col-start-2" : "md:col-start-1"}
                    >
                      <div
                        className="h-full rounded-lg border border-border bg-card p-7 text-card-foreground transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
                        style={{ boxShadow: "var(--shadow-card)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                            {m.label}
                          </span>
                        </div>
                        <h3 className="mt-5 text-2xl font-extrabold tracking-tight">{m.title}</h3>
                        <p className="mt-2 font-semibold">{m.lead}</p>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {m.body}
                        </p>
                        <div className="mt-6 border-t border-border pt-4 text-sm font-medium text-primary">
                          {m.videos}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">
            A fifth module, Getting Started, is being filmed and is empty in your account until it
            lands. Supplier acceptance and terms vary, and Amazon decides selling approvals.
          </p>
        </div>
      </section>

      {/* What you get */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              What You Get
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-5xl">
              Three things, one trial.
              <span className="mt-1 block text-primary">Nothing charged for {TRIAL_DAYS} days.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              The wholesale course, the software it is taught in, and three suppliers to use it on.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-6xl gap-8 md:grid-cols-3">
            {included.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  {...reveal}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <div
                    className="glow-edge group h-full overflow-hidden rounded-lg border bg-card text-card-foreground transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
                  >
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img
                        src={item.img}
                        alt={item.alt}
                        loading="lazy"
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                          {item.eyebrow}
                        </span>
                      </div>
                      <h3 className="mt-4 text-xl font-extrabold tracking-tight">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <StartButton>Start my {TRIAL_DAYS}-day trial</StartButton>
          </div>
        </div>
      </section>

      {/* After the course */}
      <section className="py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <motion.div {...reveal} className="text-center">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              From Zero to Hero
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              What your Amazon business looks like after the course.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              Follow the modules in order, and the work you do in the software is the business.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mx-auto mt-10 w-full max-w-4xl"
          >
            <img
              src="/images/zero-to-hero/seller-app-growth.webp"
              alt="The Amazon Seller app before and after: from no sales to a running business"
              className="mx-auto block w-full rounded-xl border border-border"
              style={{ boxShadow: "var(--shadow-card)" }}
            />
          </motion.div>
        </div>
      </section>

      {/* The playbook */}
      <section className="py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <motion.div {...reveal} className="text-center">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              The Apex Keepa Playbook
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              Everything you need to start, in one bundle.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mx-auto mt-10 w-full max-w-4xl"
          >
            <img
              src="/images/zero-to-hero/keepa-playbook-bundle.webp"
              alt="The Apex Keepa Playbook beside its data, supplier and wholesale roadmap worksheets"
              className="mx-auto block w-full rounded-xl border border-border"
              style={{ boxShadow: "var(--shadow-card)" }}
            />
          </motion.div>

          <motion.div {...reveal} className="mx-auto mt-8 w-full max-w-4xl">
            <a
              ref={playbookSheen.ref}
              href={START_HREF}
              onClick={trackStart}
              className={`group block w-full rounded-xl bg-primary px-6 py-6 text-center text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 ${playbookSheen.className}`}
              style={{ boxShadow: "0 10px 30px -8px hsl(var(--primary) / 0.55)" }}
            >
              <span className="block text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
                Start my {TRIAL_DAYS}-day trial
              </span>
            </a>
            <p className="mt-3 text-center text-sm text-muted-foreground">{TERMS}</p>
          </motion.div>
        </div>
      </section>

      {/* Free course escape hatch */}
      <section className="px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        <motion.div
          {...reveal}
          className="glow-edge-strong relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border bg-card p-10 sm:p-14"
        >
          <div className="relative z-10 flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                <GraduationCap className="h-3.5 w-3.5" />
                Apex University
              </span>
              <h2 className="mt-6 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                Not ready for the software?
                <span className="mt-1 block italic text-muted-foreground/50">
                  Take the course free.
                </span>
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                The same nine videos are free inside Apex University with a free account — no card,
                no plan, nothing to cancel. The trial is for the software the course is taught in.
              </p>
            </div>
            <a
              href="/free-course"
              className="group inline-flex shrink-0 items-center gap-2 rounded-2xl border border-primary/30 px-8 py-4 text-sm font-bold uppercase tracking-[0.14em] text-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/5"
            >
              See the free course
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden bg-primary px-4 py-20 text-center sm:py-24">
        <div className="mesh-bg pointer-events-none absolute inset-0 opacity-20" />
        <motion.div {...reveal} className="relative z-10 mx-auto max-w-3xl">
          <h2 className="text-4xl font-black tracking-tight text-primary-foreground sm:text-5xl">
            Ready to place your first order?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/80">
            Start the course and the software together. {TRIAL_DAYS} days free, then {priceLabel} a
            month if you keep it.
          </p>
          <a
            ref={closingSheen.ref}
            href={START_HREF}
            onClick={trackStart}
            className={`mt-9 inline-block rounded-2xl bg-background px-10 py-4 text-base font-bold text-primary shadow-[0_20px_45px_-15px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 cta-shine-invert ${closingSheen.className}`}
          >
            Start my {TRIAL_DAYS}-day trial
          </a>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-primary-foreground/80">
            {[
              [Zap, "Instant access"],
              [ShieldCheck, "Secure checkout"],
              [X, "Cancel any time"],
            ].map(([Icon, label]) => {
              const Badge = Icon as typeof Zap;
              return (
                <span key={label as string} className="inline-flex items-center gap-1.5">
                  <Badge className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
                  {label as string}
                </span>
              );
            })}
          </div>
        </motion.div>
      </section>

      <footer className="bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-10 md:flex-row md:items-start">
            <a href={ORIGIN} className="inline-block">
              <img
                src="/images/zero-to-hero/apex-logo.webp"
                alt="Apex Applications"
                className="h-16 w-auto object-contain"
              />
            </a>
            <img
              src="/images/zero-to-hero/amazon-appstore-partner.webp"
              alt="Amazon Selling Partner Appstore software partner"
              className="h-28 w-auto object-contain"
            />
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href={`${ORIGIN}/terms`} className="transition-colors hover:text-primary">
                Terms of Service
              </a>
              <a href={`${ORIGIN}/privacy`} className="transition-colors hover:text-primary">
                Privacy Policy
              </a>
            </div>
            <div className="text-sm text-muted-foreground/80">
              © 2026 Apex Applications. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
