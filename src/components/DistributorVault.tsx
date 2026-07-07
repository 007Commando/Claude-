"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Search, Lock, Mail, ExternalLink, ShieldCheck } from "lucide-react";
import { useSession } from "../hooks/useSession";
import { distributors, categories } from "../data/distributors";

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

export default function DistributorVault() {
  const router = useRouter();
  const { session } = useSession();
  const unlocked = isAnnualMember(session);

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 text-brand text-xs font-black rounded-full uppercase tracking-[0.2em] mb-6">
            <ShieldCheck size={14} />
            Annual Members Only
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-slate-900 mb-5 sm:mb-6 tracking-tight leading-tight">
            The Distributor <span className="text-brand">Vault</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
            {distributors.length}+ vetted wholesale distributors across {categories.length} categories —
            names, websites, and direct contact emails, ready to reach out to today.
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
                <div className="mt-auto space-y-1.5 text-sm">
                  <a
                    href={d.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-slate-500 hover:text-brand transition-colors truncate"
                  >
                    <ExternalLink size={13} className="shrink-0" />
                    <span className="truncate">{d.website.replace(/^https?:\/\//, "")}</span>
                  </a>
                  {d.emails.map((email) => (
                    <a
                      key={email}
                      href={`mailto:${email}`}
                      className="flex items-center gap-1.5 text-slate-500 hover:text-brand transition-colors truncate"
                    >
                      <Mail size={13} className="shrink-0" />
                      <span className="truncate">{email}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Gate overlay */}
          {!unlocked && (
            <div className="absolute inset-0 flex items-start sm:items-center justify-center pt-16 sm:pt-0">
              <div className="bg-white border border-slate-200 shadow-2xl rounded-[28px] p-8 sm:p-10 max-w-md mx-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-6">
                  <Lock size={22} className="text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 tracking-tight">
                  Unlock the Distributor Vault
                </h2>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed mb-7">
                  Every distributor's website and direct contact email is reserved for Apex Annual
                  members. Go annual to unlock the full vault.
                </p>
                <button
                  onClick={() => router.push("/pricing")}
                  className="w-full bg-brand text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-lg"
                >
                  Go Annual
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
