"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Search, Lock, Mail, ExternalLink, ShieldCheck, X, UserPlus } from "lucide-react";
import { useSession } from "../hooks/useSession";
import { DISTRIBUTOR_CATEGORIES as categories, DISTRIBUTOR_COUNT } from "../data/distributorStats";
import { SUPPLIER_ACCESS } from "../config/product";

/** What the public page may know about a distributor: never its contacts. */
export type PublicDistributor = { name: string; category: string; contacts: number };

/**
 * TODO: `isAnnualMember` is a placeholder. The ApexAuth session object's shape
 * isn't known from this app (auth is entirely handled by the external
 * app.apexapplications.io script), so this defaults to `false` for everyone
 * until the real plan/subscription field is confirmed. Swap the body of this
 * function for the real check once that's known — e.g.
 * `return (session as { plan?: string } | null)?.plan === "annual";`
 */
function isAnnualMember(session: unknown): boolean {
  void session;
  return false;
}

export default function DistributorVault({ distributors }: { distributors: PublicDistributor[] }) {
  const router = useRouter();
  const { session, loading } = useSession();
  const unlocked = isAnnualMember(session);
  const loggedIn = session !== null;

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [gateDismissed, setGateDismissed] = useState(false);

  useEffect(() => {
    setGateDismissed(false);
  }, [unlocked]);

  const showGateModal = !loading && !unlocked && !gateDismissed;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return distributors.filter((d) => {
      const matchesCategory = activeCategory === "All" || d.category === activeCategory;
      const matchesQuery = !q || d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <div className="pt-28 sm:pt-32 pb-16 sm:pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.section
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 text-brand text-xs font-black rounded-full uppercase tracking-[0.2em] mb-6">
            <ShieldCheck size={14} />
            Members Only
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-slate-900 mb-5 sm:mb-6 tracking-tight leading-tight">
            The Distributor <span className="text-brand">Vault</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
            {DISTRIBUTOR_COUNT} US wholesale distributors across {categories.length} categories, with
            names, websites, and contact emails. {SUPPLIER_ACCESS}
            {/* Accuracy pass 2026-10-07: "Annual Members Only" and "vetted" removed; the access rule is SUPPLIER_ACCESS, stated once in config/product.ts. */}
          </p>
        </motion.section>

        {/* Search + Filters */}
        <div className="mb-8 sm:mb-10 space-y-4">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or category…"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-slate-900 text-sm sm:text-base"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0">
            {["All", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-slate-400">
            {filtered.length} {filtered.length === 1 ? "distributor" : "distributors"} found
          </p>
        </div>

        {/* Results */}
        <div className="relative">
          <div
            className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 ${
              unlocked ? "" : "blur-md select-none pointer-events-none"
            }`}
            aria-hidden={!unlocked}
          >
            {filtered.map((d, i) => (
              <div
                key={i}
                className="bg-slate-50/70 border border-slate-100 rounded-2xl p-5 flex flex-col"
              >
                <div className="text-[10px] font-black text-brand uppercase tracking-widest mb-2">
                  {d.category}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-3 leading-snug">{d.name}</h3>
                {/* Websites and emails stay on the server: this page only knows
                    how many contacts there are, so nothing is in the HTML. */}
                <div className="mt-auto space-y-1.5 text-sm" aria-label="Contact details for members">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <ExternalLink size={13} className="shrink-0" />
                    <span className="truncate">website for members</span>
                  </span>
                  {Array.from({ length: d.contacts }, (_, n) => (
                    <span key={n} className="flex items-center gap-1.5 text-slate-400">
                      <Mail size={13} className="shrink-0" />
                      <span className="truncate">contact email for members</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Gate overlay */}
          {!loading && !unlocked && (
            <div className="absolute inset-0 flex items-start sm:items-center justify-center pt-16 sm:pt-0">
              <div className="bg-white border border-slate-200 shadow-2xl rounded-[28px] p-8 sm:p-10 max-w-md mx-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-6">
                  <Lock size={22} className="text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 tracking-tight">
                  {loggedIn ? "Unlock the Distributor Vault" : "Log In to View the Vault"}
                </h2>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed mb-7">
                  {loggedIn
                    ? "Distributors open in your account on your plan's schedule. An annual plan opens the whole Vault at once."
                    : "Distributors open in your account when you subscribe. Log in or create an account to continue."}
                </p>
                <button
                  onClick={() => router.push(loggedIn ? "/pricing" : "/auth?mode=signup&plan=starter&period=monthly")}
                  className="w-full bg-brand text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-lg"
                >
                  {loggedIn ? "See Plans" : "Log In / Sign Up"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Login / upgrade popup shown on entry */}
      <AnimatePresence>
        {showGateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setGateDismissed(true)}
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative bg-white border border-slate-200 shadow-2xl rounded-[28px] p-8 sm:p-10 max-w-md w-full mx-4 text-center"
            >
              <button
                onClick={() => setGateDismissed(true)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-6">
                {loggedIn ? <Lock size={22} className="text-white" /> : <UserPlus size={22} className="text-white" />}
              </div>

              {!loggedIn ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 tracking-tight">
                    Log In to Access the Vault
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed mb-7">
                    The Distributor Vault opens in your Apex account. Log in or create an account to
                    continue.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push("/auth?mode=login")}
                      className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all shadow-lg"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => router.push("/auth?mode=signup&plan=starter&period=monthly")}
                      className="w-full border border-slate-200 text-slate-900 px-6 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-slate-50 transition-all"
                    >
                      Create Account
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 tracking-tight">
                    Open the Vault
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed mb-7">
                    {SUPPLIER_ACCESS}
                  </p>
                  <button
                    onClick={() => router.push("/pricing")}
                    className="w-full bg-brand text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-lg"
                  >
                    See Plans
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
