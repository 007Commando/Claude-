"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Search,
  Zap,
  MapPin,
  Star,
  Truck,
  Check,
  X as XIcon,
  Clock,
  DollarSign,
  Copy,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Mail,
  ExternalLink,
} from "lucide-react";
import { prepCenters, prepCenterCategories, projectToMapPercent, type PrepCenter } from "../data/prepCenters";

const dotTexture = {
  backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
  backgroundSize: "20px 20px",
};

const REGIONS = [
  { label: "West", from: 0, to: 33.3 },
  { label: "Central", from: 33.3, to: 66.6 },
  { label: "East", from: 66.6, to: 100 },
];

interface CityGroup {
  key: string;
  city: string;
  state: string;
  lat: number;
  long: number;
  centers: PrepCenter[];
}

function groupByCity(list: PrepCenter[]): CityGroup[] {
  const map = new Map<string, CityGroup>();
  for (const c of list) {
    const key = `${c.city}|${c.state}`;
    const existing = map.get(key);
    if (existing) {
      existing.centers.push(c);
    } else {
      map.set(key, { key, city: c.city, state: c.state, lat: c.lat, long: c.long, centers: [c] });
    }
  }
  return [...map.values()];
}

function TimeDonut({ sourcingPct, label, accent }: { sourcingPct: number; label: string; accent: string }) {
  const r = 50;
  const circumference = 2 * Math.PI * r;
  const arc = circumference * (sourcingPct / 100);
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx={60} cy={60} r={r} fill="none" stroke="#e2e8f0" strokeWidth={14} />
          <circle
            cx={60}
            cy={60}
            r={r}
            fill="none"
            stroke={accent}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${circumference}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black text-slate-900">{sourcingPct}%</span>
        </div>
      </div>
      <div className="mt-4 text-sm font-bold text-slate-900 text-center">{label}</div>
      <div className="text-xs text-slate-400">sourcing &amp; deals</div>
    </div>
  );
}

function CostBars() {
  const warehouse = 8400;
  const prep = 700;
  const max = warehouse;
  return (
    <div className="flex items-end justify-center gap-10 sm:gap-16 h-56">
      <div className="flex flex-col items-center gap-2">
        <div className="text-lg font-black text-slate-900">${warehouse.toLocaleString()}</div>
        <div
          className="w-16 sm:w-20 bg-slate-300 rounded-t-xl transition-all"
          style={{ height: `${(warehouse / max) * 170}px` }}
        />
        <div className="text-xs text-slate-500 font-bold text-center">Your Warehouse</div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="text-lg font-black text-brand">${prep.toLocaleString()}</div>
        <div
          className="w-16 sm:w-20 bg-brand rounded-t-xl transition-all"
          style={{ height: `${Math.max((prep / max) * 170, 10)}px` }}
        />
        <div className="text-xs text-slate-500 font-bold text-center">Prep Center</div>
      </div>
    </div>
  );
}

function BreakEvenChart() {
  return (
    <svg viewBox="0 0 400 180" className="w-full h-auto max-w-xl">
      <line x1="8" y1="55" x2="392" y2="55" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5 5" />
      <text x="8" y="42" fontSize="9" fill="#64748b" fontWeight="700">
        Warehouse (fixed cost)
      </text>
      <line x1="8" y1="165" x2="392" y2="15" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
      <text x="230" y="30" fontSize="9" fill="#2563eb" fontWeight="700">
        Prep Center (per-unit)
      </text>
      <circle cx="258" cy="58" r="5" fill="#0f172a" />
      <line x1="258" y1="58" x2="258" y2="178" stroke="#0f172a" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="200" y="176" fontSize="9" fill="#0f172a" fontWeight="700">
        ~13,000 units/mo
      </text>
    </svg>
  );
}

const emailTemplate = `Subject: Apex Referral - Prep Center Onboarding

Hi [Prep Center Team],

My name is [Your Name], and I am an Amazon wholesale seller currently working with Apex. I was referred to you by the Apex Network.

I'm looking to open wholesale accounts in [state] and would love to learn more about receiving, prep, and any shipping-related requirements you offer.

I currently operate wholesale accounts with [list any wholesale accounts, requirements, and availability].

Please let me know the next steps to get set up.

Thank you,
[Your name]
[Your email address]
[Your business name]`;

const onboardingSteps = [
  {
    step: "1",
    title: "Select Your State",
    body: "Pick the prep center location closest to your wholesale sourcing (typically California, Texas, Florida, New Jersey, or Illinois). Shipping from close by cuts down transit time and freight costs.",
  },
  {
    step: "2",
    title: "Send Onboarding Email",
    body: "Copy the pre-written email template below. Fill in your name, business info, and any relevant details, then send it directly to the prep center.",
  },
  {
    step: "3",
    title: "Complete Onboarding",
    body: "Fill out any additional intake forms, share invoicing preferences, and confirm receiving procedures. Most centers respond within 24-48 hours.",
  },
  {
    step: "4",
    title: "Open Wholesale Accounts",
    body: "Once receiving is confirmed, contact wholesale accounts to open a business account using the prep center's commercial address. Most require proof of receiving before approving.",
  },
  {
    step: "5",
    title: "Ship Inventory",
    body: "Once accounts are approved, direct your suppliers to ship directly to the prep center — they'll receive, inspect, prep, and forward to Amazon FBA.",
  },
];

const whyReasons = [
  {
    n: "01",
    title: "Distributors Need a Commercial Address",
    summary:
      "Many high-quality distributors and manufacturers won't ship to residential addresses. They require a warehouse with a business address on file — preventing many hopeful sellers from even placing their first orders.",
    eyebrow: "The Receiving Problem",
    headline: "Freight trucks can't deliver to your house",
    body: "Most distributors ship via LTL freight. Those loads need a loading dock and forklift to offload — something a residential address simply doesn't have. Without a commercial receiving address, you won't even open an account with them.",
  },
  {
    n: "02",
    title: "Focus on What Grows Revenue",
    summary:
      "To scale, you have to stop doing everything yourself. A prep center handles receiving, inspecting, labeling, prepping, and shipping — so you're free to spend your time on the parts of the business that actually move revenue: sourcing, listings, and building relationships.",
    eyebrow: "Reclaim Your Time",
    headline: "Spend your hours on deals, not boxes",
    body: "Every hour spent scanning, labeling, and packing is an hour you aren't sourcing inventory or closing supplier deals. Handing fulfillment to a prep center flips your time toward the work that actually compounds your revenue.",
  },
  {
    n: "03",
    title: "The True Cost of Your Own Warehouse",
    summary:
      "Unless you're running serious volume, a private warehouse costs a lot of money and delivers little protection. For most sellers, a prep center is far cheaper, more flexible, and instantly scalable.",
    eyebrow: "Run the Numbers",
    headline: "What a warehouse really costs you every month",
    body: "Most sellers underestimate the overhead of running their own space. Here's a realistic monthly breakdown for a small operation versus outsourcing to a prep center.",
  },
];

const costRows = [
  { label: "Facility lease", warehouse: "$3,500", prep: "$0" },
  { label: "Staff / labor", warehouse: "$2,800", prep: "$0" },
  { label: "Insurance", warehouse: "$450", prep: "$0" },
  { label: "Supplies & equipment", warehouse: "$600", prep: "$0" },
  { label: "Utilities", warehouse: "$350", prep: "$0" },
];

export default function PrepCenterNetwork() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prepCenters.filter((c) => {
      const matchesCategory = activeCategory === "All" || c.services.includes(activeCategory);
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  const cityGroups = useMemo(() => groupByCity(filtered), [filtered]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emailTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="pt-28 sm:pt-32 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 text-brand text-xs font-black rounded-full uppercase tracking-[0.2em] mb-6">
            <Zap size={14} />
            {prepCenters.length} Vetted Prep Partners
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-slate-900 mb-5 sm:mb-6 tracking-tight leading-tight">
            The <span className="text-brand">Prep Center</span> Network
          </h1>
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
            The Apex Network. Click a pin on the map or open a card to reveal service details,
            location, and a copy-ready outreach email.
          </p>

          <div className="mt-6 inline-flex items-start sm:items-center gap-3 text-left sm:text-center bg-brand/5 border border-brand/10 rounded-2xl px-5 py-4 max-w-xl mx-auto">
            <Zap size={16} className="text-brand shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm text-slate-600 leading-relaxed">
              Apex members unlock instant discounts across our network — exclusive pricing sourced
              through our direct partnerships, passed straight to you.
            </p>
          </div>
        </motion.section>

        {/* Search + Filters */}
        <div className="mb-8 sm:mb-10 space-y-4">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, state, or city…"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none text-slate-900 text-sm sm:text-base"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0">
            {["All", ...prepCenterCategories].map((cat) => (
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
            Showing {filtered.length} of {prepCenters.length} prep centers
          </p>
        </div>

        {/* Map + Cards */}
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-6 mb-8">
          {/* Map */}
          <div className="relative rounded-3xl border border-slate-200 shadow-sm overflow-hidden aspect-[4/3] lg:aspect-auto lg:min-h-[520px] bg-gradient-to-b from-slate-50 to-white">
            <div
              className="absolute inset-0"
              style={{
                ...dotTexture,
                maskImage:
                  "radial-gradient(ellipse 75% 75% at 50% 50%, black 55%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 75% 75% at 50% 50%, black 55%, transparent 100%)",
              }}
            />

            {/* Region dividers */}
            {REGIONS.slice(0, -1).map((r) => (
              <div
                key={r.label}
                className="absolute top-0 bottom-0 border-r border-dashed border-slate-200"
                style={{ left: `${r.to}%` }}
              />
            ))}
            {REGIONS.map((r) => (
              <div
                key={`label-${r.label}`}
                className="absolute top-3 text-[10px] font-black text-slate-300 uppercase tracking-widest"
                style={{ left: `${(r.from + r.to) / 2}%`, transform: "translateX(-50%)" }}
              >
                {r.label}
              </div>
            ))}

            {cityGroups.map((g) => {
              const { x, y } = projectToMapPercent(g.lat, g.long);
              const isActive = activeCity === g.key;
              return (
                <button
                  key={g.key}
                  onClick={() => setActiveCity(isActive ? null : g.key)}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
                >
                  {isActive && (
                    <span className="absolute inset-0 -m-2.5 rounded-full bg-brand/30 animate-ping" />
                  )}
                  <span
                    className={`relative flex items-center justify-center w-5 h-5 rounded-full border-2 border-white shadow-lg transition-all ${
                      isActive ? "bg-brand scale-125" : "bg-slate-900 group-hover:bg-brand"
                    }`}
                  >
                    {g.centers.length > 1 && (
                      <span className="text-white text-[9px] font-black">{g.centers.length}</span>
                    )}
                  </span>
                  <span
                    className={`pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-opacity z-20 ${
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {g.city}, {g.state}
                    {g.centers.length > 1 ? ` — ${g.centers.length} partners` : ""}
                  </span>
                </button>
              );
            })}

            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] font-bold text-slate-400">
              {REGIONS.map((r) => {
                const count = cityGroups
                  .filter((g) => {
                    const { x } = projectToMapPercent(g.lat, g.long);
                    return x >= r.from && x < r.to;
                  })
                  .reduce((sum, g) => sum + g.centers.length, 0);
                return (
                  <span key={r.label} className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-900" />
                    {r.label} · {count}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-4 lg:max-h-[520px] lg:overflow-y-auto lg:pr-1 lg:-mr-1">
            {filtered.map((c) => {
              const cityKey = `${c.city}|${c.state}`;
              const isActive = activeCity === cityKey;
              return (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  onClick={() => setActiveCity(isActive ? null : cityKey)}
                  className={`bg-white border rounded-2xl p-5 cursor-pointer transition-all ${
                    isActive ? "border-brand shadow-lg" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    {c.approvedPartner ? (
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-brand uppercase tracking-widest">
                        <ShieldCheck size={12} />
                        Apex Approved Partner
                      </div>
                    ) : (
                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        Network Listing
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 shrink-0">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      {c.rating.toFixed(2).replace(/0$/, "").replace(/\.$/, "")} ({c.reviews})
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{c.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-3">{c.tagline}</p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {c.services.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-full px-2.5 py-1"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-bold text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={13} />
                      {c.city}, {c.state}
                    </span>
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 hover:text-brand transition-colors"
                    >
                      <ExternalLink size={13} />
                      Website
                    </a>
                    {c.email && (
                      <a
                        href={`mailto:${c.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 hover:text-brand transition-colors"
                      >
                        <Mail size={13} />
                        {c.email}
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center text-sm text-slate-400 py-12">No prep centers match your search.</div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-24"
        >
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-block bg-brand/10 text-brand text-xs font-black uppercase tracking-[0.2em] rounded-full px-4 py-1.5 mb-5">
              Exclusive Member Pricing
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Save Up to <span className="text-brand">30% OFF</span> Lifetime Prepping
            </h2>
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed">
              As an Apex member, you unlock exclusive lifetime discounts at selected prep centers in
              our network. The savings add up fast.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl border border-slate-200 p-6 text-center">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Average Market Rate
              </div>
              <div className="text-2xl font-black text-slate-900">$1.00–1.20</div>
              <div className="text-xs text-slate-400 mt-1">or higher at boutique centers</div>
            </div>
            <div className="rounded-2xl border-2 border-brand bg-brand/5 p-6 text-center">
              <div className="text-xs font-bold text-brand uppercase tracking-widest mb-2">
                Apex Member Price
              </div>
              <div className="text-2xl font-black text-brand">$0.60–0.70</div>
              <div className="text-xs text-slate-500 mt-1">per unit for member accounts</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 text-center">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Your Savings
              </div>
              <div className="text-2xl font-black text-emerald-600">$0.30–0.60</div>
              <div className="text-xs text-slate-400 mt-1">per unit on average</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                <DollarSign size={18} className="text-white" />
              </div>
              <div>
                <div className="text-lg font-black text-slate-900">$400–500 saved</div>
                <div className="text-xs text-slate-500">Per 1,000 units shipped</div>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                <Clock size={18} className="text-white" />
              </div>
              <div>
                <div className="text-lg font-black text-slate-900">$4,800–6,000+ saved</div>
                <div className="text-xs text-slate-500">Over 12 months</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 flex items-start gap-3">
            <ShieldCheck size={18} className="text-brand shrink-0 mt-0.5" />
            <p className="text-sm text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-900">Lifetime Discount, No Catch — </span>
              These rates are set by individual prep centers. Once you're in the Apex network, your
              discounted rate stays locked in for as long as you work with that partner — no
              expiration, no renegotiation needed.
            </p>
          </div>
        </motion.section>

        {/* Why use prep centers */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <div className="text-brand text-sm font-black uppercase tracking-[0.2em] mb-4">
              Why Smart Sellers Use Prep Centers
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              Stop Doing Everything Yourself
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Working with a prep center isn't just convenient — it's a strategic move that removes
              bottlenecks and protects your margins.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            {whyReasons.map((r) => (
              <motion.div
                key={r.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-slate-100 p-6"
              >
                <div className="text-3xl font-black text-slate-200 mb-3">{r.n}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">{r.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{r.summary}</p>
              </motion.div>
            ))}
          </div>

          {/* 01 detail */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-10 items-center mb-20"
          >
            <div>
              <div className="text-xs font-black text-brand uppercase tracking-widest mb-3">
                {whyReasons[0].eyebrow}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                {whyReasons[0].headline}
              </h3>
              <p className="text-slate-500 leading-relaxed">{whyReasons[0].body}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5">
                <div className="text-xs font-black text-red-500 uppercase tracking-widest mb-4">
                  Home Address
                </div>
                {["Accepting freight", "LTL access", "Wholesale-ready"].map((t) => (
                  <div key={t} className="flex items-center gap-2 mb-2 text-sm text-slate-600">
                    <XIcon size={14} className="text-red-400 shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4">
                  Prep Center
                </div>
                {["Docks + forklift", "LTL ready", "Wholesale-ready"].map((t) => (
                  <div key={t} className="flex items-center gap-2 mb-2 text-sm text-slate-600">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 02 detail */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-10 items-center mb-20"
          >
            <div className="order-2 lg:order-1">
              <div className="flex items-center justify-center gap-10 mb-6">
                <TimeDonut sourcingPct={20} label="Doing it yourself" accent="#94a3b8" />
                <TimeDonut sourcingPct={80} label="With a prep center" accent="#2563eb" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
                  <div className="text-xl font-black text-brand">5x</div>
                  <div className="text-xs text-slate-500">more time on sourcing &amp; deals</div>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
                  <div className="text-xl font-black text-slate-900">0 hrs</div>
                  <div className="text-xs text-slate-500">packing boxes at midnight</div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="text-xs font-black text-brand uppercase tracking-widest mb-3">
                {whyReasons[1].eyebrow}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                {whyReasons[1].headline}
              </h3>
              <p className="text-slate-500 leading-relaxed">{whyReasons[1].body}</p>
            </div>
          </motion.div>

          {/* 03 detail */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="text-xs font-black text-brand uppercase tracking-widest mb-3">
                {whyReasons[2].eyebrow}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                {whyReasons[2].headline}
              </h3>
              <p className="text-slate-500 leading-relaxed">{whyReasons[2].body}</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-100 p-6 flex flex-col items-center">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 self-start">
                  Monthly Operating Cost
                </div>
                <CostBars />
              </div>
              <div className="rounded-2xl border border-slate-100 p-6">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                  Cost Breakdown
                </div>
                <div className="space-y-2">
                  {costRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50">
                      <span className="text-slate-600">{row.label}</span>
                      <span className="font-bold text-slate-900">{row.warehouse}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 leading-relaxed">
                  You could be paying <span className="font-black text-slate-900">$8,400 every month</span>{" "}
                  ($100,800/yr) running your own warehouse — versus a flat, pay-per-unit rate with a
                  prep center.
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-slate-100 p-6 sm:p-8">
              <div className="text-xs font-black text-brand uppercase tracking-widest mb-2">
                The Break-Even Point
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-slate-900 mb-4 tracking-tight">
                When does a warehouse finally pay off?
              </h4>
              <BreakEvenChart />
              <p className="text-sm text-slate-500 leading-relaxed mt-4">
                A prep center costs per unit, while a warehouse is a fixed cost regardless of volume.
                The two lines only cross once you're shipping enough volume — that's your break-even
                point.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Onboarding */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-block bg-brand/10 text-brand text-xs font-black uppercase tracking-[0.2em] rounded-full px-4 py-1.5 mb-5">
              Apex Prep Center Onboarding Guide
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight">
              How to Onboard With an <span className="text-brand">Apex-Approved</span> Prep Center
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
            {onboardingSteps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

          {/* Approach method */}
          <div className="rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-6 sm:px-8 py-5 bg-slate-50 border-b border-slate-100">
              <div>
                <div className="text-sm font-bold text-slate-900">Approach Method</div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Copy, paste, and replace the highlighted fields. Mentioning Apex can help you get
                  priority handling or a better price.
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 inline-flex items-center gap-2 bg-brand text-white text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-brand-dark transition-all"
              >
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy Template"}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-slate-600 leading-relaxed p-6 sm:p-8 font-sans">
              {emailTemplate}
            </pre>
          </div>
        </motion.section>

        {/* Compliance notes */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 sm:p-8"
        >
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600 leading-relaxed space-y-2">
              <p>
                Apex is not a formal partner of the prep centers listed. Mentioning Apex as your
                referral source can help expedite processing and may qualify you for member pricing.
              </p>
              <p>Confirm receiving requirements directly with each prep center before shipping.</p>
              <p>
                Wholesale accounts opened using a prep center's address are subject to that account's
                own approval — not guaranteed by Apex.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 pt-4 border-t border-amber-200/60">
            <Truck size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-900">Compliance Reminder: </span>
              You are responsible for complying with Amazon and distributor terms of service. Confirm
              all fees and terms before signing any agreement with a prep center.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
