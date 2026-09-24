"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { CheckCircle2, CalendarDays, ArrowRight } from "lucide-react";

declare global {
  interface Window {
    // Meta pixel, initialized in layout.tsx
    fbq?: (...args: unknown[]) => void;
  }
}

const CALENDLY_URL = "https://calendly.com/apexapplications-info/meeting";

export default function FbaThankYou() {
  useEffect(() => {
    // Stripe's payment link redirects here with ?session_id={CHECKOUT_SESSION_ID}.
    // Only a real checkout carries one, so a visit or a bookmark does not count
    // as a sale, and the session id doubles as the event id so a reload of the
    // same page is deduplicated by Meta (and skipped here as well).
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) return;
    const firedKey = `fba-purchase-${sessionId}`;
    try {
      if (window.localStorage.getItem(firedKey)) return;
    } catch {
      // storage blocked; Meta still deduplicates on the event id
    }
    // The pixel loads afterInteractive, so it can arrive after this effect.
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (!window.fbq) {
        if (tries >= 40) window.clearInterval(timer); // give up after ~10s
        return;
      }
      window.clearInterval(timer);
      window.fbq(
        "track",
        "Purchase",
        {
          value: 29,
          currency: "USD",
          content_name: "Amazon FBA Starter Bundle",
        },
        { eventID: sessionId },
      );
      try {
        window.localStorage.setItem(firedKey, "1");
      } catch {
        // ignore
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="pt-28 sm:pt-32 pb-24 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-6">
            <CheckCircle2 size={32} className="text-emerald-600" strokeWidth={2} />
          </div>
          <h1 className="text-3xl lg:text-5xl font-black text-slate-900 mb-5 tracking-tight leading-[1.1]">
            You're In. Welcome to Apex.
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            Your Amazon FBA Starter Bundle access is on its way to your inbox. Take the step below
            now to get plugged in and start growing as fast as possible.
          </p>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center rounded-[28px] bg-slate-50/70 border border-slate-100 p-8 sm:p-10"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center shrink-0 mb-5">
            <CalendarDays size={26} className="text-white" strokeWidth={1.75} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
            Schedule Your 1-on-1 Onboarding Call
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-6 max-w-md">
            Receive free roadmap assistance to implement all the tactics, suppliers, and systems
            you need to begin scaling.
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-brand text-white px-8 py-4 rounded-[16px] font-black text-lg shadow-[0_16px_32px_rgba(249,115,22,0.25)] hover:scale-[1.02] transition-all uppercase tracking-wide mb-4"
          >
            Schedule Your Call <ArrowRight size={18} />
          </a>
          <p className="text-xs text-slate-400 max-w-sm">
            Please only schedule if you have real intent to grow. We're more than happy to
            accommodate serious sellers.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
