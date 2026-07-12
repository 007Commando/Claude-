"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { z } from "zod";
import { Mail, Lock, Zap, ShieldCheck, CheckCircle2, User } from "lucide-react";
import michaelRAsset from "../assets/michael-r-avatar.png.asset.json";
import { readStoredAttribution } from "./LeadAttribution";

// Global ApexAuth from https://app.apexapplications.io/apex-auth.js
declare global {
  interface Window {
    ApexAuth?: {
      signIn: (email: string, password: string, opts?: { redirect?: boolean }) => Promise<unknown>;
      signUp: (opts: {
        name: string;
        email: string;
        password: string;
        plan?: "starter" | "plus" | "pro" | "enterprise";
        period?: "monthly" | "yearly";
      }) => Promise<unknown>;
      sendPasswordResetEmail: (email: string) => Promise<unknown>;
      signOut: () => Promise<unknown> | void;
      redirectToApp: (path?: string) => void;
      getCurrentUser: () => Promise<unknown>;
      onAuthStateChanged: (cb: (user: unknown) => void) => (() => void) | void | Promise<(() => void) | void>;
    };
  }
}

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(1, "Enter a password"),
});

const signupSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(1, "Enter a password"),
});

type Mode = "login" | "signup" | "forgot";

function getFriendlyAuthError(message: string): string {
  if (/is not a function/i.test(message)) {
    return "The login service didn't finish loading in time. Please try again.";
  }

  const codeMatch = message.match(/\(auth\/([a-z-]+)\)/);
  if (!codeMatch) return message;

  switch (codeMatch[1]) {
    case "invalid-credential":
    case "wrong-password":
    case "user-not-found":
      return "Incorrect email or password. Please try again.";
    case "invalid-email":
      return "Enter a valid email address.";
    case "user-disabled":
      return "This account has been disabled. Contact support for help.";
    case "too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "email-already-in-use":
      return "An account with this email already exists. Try logging in instead.";
    case "weak-password":
      return "Choose a stronger password (at least 6 characters).";
    case "network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// If ApexAuth's own internal setup (e.g. its Firebase init) hasn't finished
// by the time we call into it, calls fail with a raw "X is not a function"
// TypeError. window.ApexAuth existing doesn't guarantee that setup is done,
// so retry once after a short delay before giving up.
async function withAuthRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (!/is not a function/i.test(msg)) throw err;
    await new Promise((resolve) => setTimeout(resolve, 700));
    return fn();
  }
}

function waitForApexAuth(timeoutMs = 8000): Promise<NonNullable<Window["ApexAuth"]>> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (window.ApexAuth) return resolve(window.ApexAuth);
      if (Date.now() - start > timeoutMs) return reject(new Error("Auth service unavailable. Please refresh."));
      setTimeout(tick, 100);
    };
    tick();
  });
}

const PLAN_TIERS = ["starter", "plus", "pro", "enterprise"] as const;
const PERIODS = ["monthly", "yearly"] as const;
const PLAN_TIER_LABELS: Record<(typeof PLAN_TIERS)[number], string> = {
  starter: "Starter",
  plus: "Plus",
  pro: "Pro",
  enterprise: "Enterprise",
};

export default function Auth() {
  const params = useSearchParams();
  const router = useRouter();
  const modeFromParams: Mode =
    params.get("mode") === "signup" ? "signup" : params.get("mode") === "forgot" ? "forgot" : "login";
  // Tab clicks flip this immediately so the UI never waits on a router
  // round-trip; it's reconciled back to null once the URL catches up.
  const [modeOverride, setModeOverride] = useState<Mode | null>(null);
  const mode = modeOverride ?? modeFromParams;

  useEffect(() => {
    setModeOverride(null);
  }, [modeFromParams]);

  // Defaults ensure every signup carries a plan — even someone who lands on
  // a bare /auth (e.g. the header "Log In" link) and switches to Sign Up
  // from inside the page still triggers Stripe checkout, never a free
  // account with direct app access.
  const planParam = params.get("plan");
  const planTier = PLAN_TIERS.find((p) => p === planParam) ?? "plus";
  const periodParam = params.get("period");
  const period = PERIODS.find((p) => p === periodParam) ?? "monthly";

  const formCardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | void;
    waitForApexAuth()
      .then(async (auth) => {
        if (cancelled) return;
        const fn = await Promise.resolve(
          auth.onAuthStateChanged((user) => {
            if (user) {
              const redirect = new URL(window.location.href).searchParams.get("redirect_uri");
              if (!redirect) auth.redirectToApp("/dashboard");
            }
          })
        );
        if (cancelled) {
          if (typeof fn === "function") fn();
        } else {
          unsub = fn;
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const setMode = (m: Mode) => {
    setError(null);
    setInfo(null);
    setModeOverride(m);
    const next = new URLSearchParams(params.toString());
    if (m === "login") next.delete("mode");
    else next.set("mode", m);
    const qs = next.toString();
    // scroll: false — without it, Next.js resets scroll to top on navigate,
    // yanking the form off-screen (it sits below a tall hero) and making the
    // tab switch look broken even though the mode did change underneath.
    router.replace(qs ? `/auth?${qs}` : "/auth", { scroll: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const auth = await waitForApexAuth();
      if (mode === "signup") {
        const parsed = signupSchema.safeParse({ name, email, password });
        if (!parsed.success) throw new Error(parsed.error.issues[0].message);
        await withAuthRetry(() =>
          auth.signUp({
            name: parsed.data.name,
            email: parsed.data.email,
            password: parsed.data.password,
            plan: planTier,
            period,
          })
        );
        const attribution = readStoredAttribution();
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: attribution?.source ?? "direct",
            event: "apex_signup",
            email: parsed.data.email,
            visitorId: attribution?.visitorId,
            utmSource: attribution?.utmSource,
            utmMedium: attribution?.utmMedium,
            utmCampaign: attribution?.utmCampaign,
          }),
          keepalive: true,
        }).catch(() => {});
        // Auto-redirects: to Stripe checkout if a plan was selected, otherwise into the app
      } else if (mode === "forgot") {
        const parsed = z.string().trim().email("Enter a valid email").safeParse(email);
        if (!parsed.success) throw new Error(parsed.error.issues[0].message);
        try {
          await withAuthRetry(() => auth.sendPasswordResetEmail(parsed.data));
        } catch (err) {
          // The reset-email endpoint returns a non-JSON success body, which
          // ApexAuth's own response parsing chokes on even though the email
          // was actually sent — don't surface that as a failure.
          const msg = err instanceof Error ? err.message : "";
          if (!/not valid JSON/i.test(msg)) throw err;
        }
        setInfo("Email has been sent! Check your inbox.");
      } else {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) throw new Error(parsed.error.issues[0].message);
        await withAuthRetry(() => auth.signIn(parsed.data.email, parsed.data.password));
        // Auto-redirects on success
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(getFriendlyAuthError(msg));
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      title: "White-glove onboarding",
      desc: "Included with your account: 160 minutes of Amazon education plus full software installation and setup.",
    },
    {
      title: "Dedicated account manager",
      desc: "Get direct access to a real person who understands your workflow and answers fast.",
    },
    {
      title: "ROI results in 30 Days",
      desc: "Our average operator sees measurable returns in the first month of use.",
    },
  ];

  const heading =
    mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Welcome back";
  const sub =
    mode === "signup"
      ? "Start your free trial today"
      : mode === "forgot"
      ? "We'll email you a reset link"
      : "Log in to your Apex dashboard";
  const cta =
    mode === "signup" ? "Start free trial" : mode === "forgot" ? "Send reset link" : "Log in";

  return (
    <section className="relative min-h-screen bg-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-brand/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-slate-200/40 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div className="pt-4">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.05]">
              The #1 Amazon Wholesale Software <span className="text-brand">All-In-One Suite</span>
            </h1>
            <p className="mt-6 text-lg text-slate-500 max-w-xl leading-relaxed">
              Apex Black, Blue & Green connect sourcing, purchasing, and profit tracking into one
              streamlined platform — so you can scale with clarity and speed.
            </p>

            <ul className="mt-10 space-y-6 max-w-lg">
              {benefits.map((b) => (
                <li key={b.title} className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-brand flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <div>
                    <div className="text-base font-bold text-slate-900">{b.title}</div>
                    <div className="text-sm text-slate-500 mt-1">{b.desc}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-12 max-w-lg bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.15)]">
              <div className="flex items-center gap-3">
                <img
                  src={michaelRAsset.url}
                  alt="Michael R."
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900">Michael R.</div>
                  <div className="text-xs text-slate-500">New Seller • 3 Months In</div>
                </div>
              </div>
              <p className="mt-4 text-sm italic text-slate-600 leading-relaxed">
                "Apex replaced the scattered tools we were juggling and gave us one source of truth. The
                time savings alone paid for the subscription within the first month."
              </p>
            </div>
          </div>

          <div className="lg:pt-4">
            <motion.div
              ref={formCardRef}
              animate={{
                boxShadow: [
                  "0 40px 100px -30px rgba(15,23,42,0.18), 0 0 0 0 rgba(59,130,246,0)",
                  "0 40px 100px -30px rgba(15,23,42,0.18), 0 0 0 10px rgba(59,130,246,0.35)",
                  "0 40px 100px -30px rgba(15,23,42,0.18), 0 0 0 0 rgba(59,130,246,0)",
                ],
              }}
              transition={{ duration: 0.9, repeat: 2, ease: "easeInOut" }}
              className="bg-white rounded-[28px] border border-slate-200 p-8 sm:p-10 max-w-md mx-auto lg:ml-auto lg:mr-0 w-full"
            >
              <div className="flex bg-slate-100 rounded-2xl p-1 mb-8">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                    mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                    mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <h2 className="text-2xl font-black tracking-tight text-slate-900 text-center">{heading}</h2>
              <p className="text-sm text-slate-500 text-center mt-1 mb-8">{sub}</p>

              {mode === "signup" && (
                <div className="mb-6 text-center text-xs font-bold text-brand bg-brand/5 border border-brand/10 rounded-xl px-4 py-2.5">
                  Signing up for the {PLAN_TIER_LABELS[planTier]} plan — {period === "yearly" ? "Annual" : "Monthly"} billing
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === "signup" && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">
                      Full name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-slate-900"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-slate-900"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                {mode !== "forgot" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                        Password
                      </label>
                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => setMode("forgot")}
                          className="text-xs font-bold text-brand hover:underline"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="password"
                        type="password"
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-slate-900"
                        placeholder="Your password"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  Your data is secure and encrypted
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}
                {info && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {info}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white font-bold tracking-wide text-sm py-4 rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" fill="currentColor" />
                  {loading ? "Please wait…" : cta}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                {mode === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-brand font-bold hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                ) : mode === "forgot" ? (
                  <>
                    Remembered it?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-brand font-bold hover:underline"
                    >
                      Back to login
                    </button>
                  </>
                ) : (
                  <>
                    New to Apex?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="text-brand font-bold hover:underline"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </p>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                Cancel anytime
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
