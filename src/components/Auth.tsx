"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { Mail, Lock, Zap, ShieldCheck, CheckCircle2, User } from "lucide-react";
import michaelRAsset from "../assets/michael-r-avatar.png.asset.json";

// Global ApexAuth from https://app.apexapplications.io/apex-auth.js
declare global {
  interface Window {
    ApexAuth?: {
      signIn: (email: string, password: string) => Promise<unknown>;
      signUp: (opts: {
        name: string;
        email: string;
        password: string;
        initialAccountType: "seller" | "prep";
        product?: "starter" | "plus" | "pro" | "enterprise";
        plan?: "monthly" | "yearly";
      }) => Promise<unknown>;
      sendPasswordResetEmail: (email: string) => Promise<unknown>;
      signOut: () => Promise<unknown> | void;
      redirectToApp: (path?: string) => void;
      onAuthStateChanged: (cb: (user: unknown) => void) => (() => void) | void;
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

const PRODUCTS = ["starter", "plus", "pro", "enterprise"] as const;
const PLANS = ["monthly", "yearly"] as const;
const PRODUCT_LABELS: Record<(typeof PRODUCTS)[number], string> = {
  starter: "Starter",
  plus: "Plus",
  pro: "Pro",
  enterprise: "Enterprise",
};

export default function Auth() {
  const params = useSearchParams();
  const router = useRouter();
  const mode: Mode =
    params.get("mode") === "signup" ? "signup" : params.get("mode") === "forgot" ? "forgot" : "login";

  const productParam = params.get("product");
  const product = PRODUCTS.find((p) => p === productParam);
  const planParam = params.get("plan");
  const plan = PLANS.find((p) => p === planParam);

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
      .then((auth) => {
        if (cancelled) return;
        unsub = auth.onAuthStateChanged((user) => {
          if (user) {
            const redirect = new URL(window.location.href).searchParams.get("redirect_uri");
            if (!redirect) auth.redirectToApp("/dashboard");
          }
        });
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
    const next = new URLSearchParams(params.toString());
    if (m === "login") next.delete("mode");
    else next.set("mode", m);
    const qs = next.toString();
    router.replace(qs ? `/auth?${qs}` : "/auth");
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
        await auth.signUp({
          name: parsed.data.name,
          email: parsed.data.email,
          password: parsed.data.password,
          initialAccountType: "seller",
          ...(product ? { product } : {}),
          ...(plan ? { plan } : {}),
        });
        setInfo("Check your email to confirm your account.");
      } else if (mode === "forgot") {
        const parsed = z.string().trim().email("Enter a valid email").safeParse(email);
        if (!parsed.success) throw new Error(parsed.error.issues[0].message);
        await auth.sendPasswordResetEmail(parsed.data);
        setInfo("Password reset email sent. Check your inbox.");
      } else {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) throw new Error(parsed.error.issues[0].message);
        await auth.signIn(parsed.data.email, parsed.data.password);
        // Auto-redirects on success
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
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
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-[0_40px_100px_-30px_rgba(15,23,42,0.18)] p-8 sm:p-10 max-w-md mx-auto lg:ml-auto lg:mr-0 w-full">
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

              {mode === "signup" && product && (
                <div className="mb-6 text-center text-xs font-bold text-brand bg-brand/5 border border-brand/10 rounded-xl px-4 py-2.5">
                  Signing up for the {PRODUCT_LABELS[product]} plan
                  {plan ? ` — ${plan === "yearly" ? "Annual" : "Monthly"} billing` : ""}
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
                  <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
