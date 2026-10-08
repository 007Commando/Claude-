"use client";

import apexBullLogo from "../assets/apex-bull-logo.png.asset.json";
import { DOLLAR_WEEK } from "../config/offer";
import { moduleByKey } from "../config/product";
import { isBeta } from "../config/features";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart,
  Barcode,
  BookOpen,
  BookText,
  ChevronDown,
  CreditCard,
  Database,
  FileText,
  Gauge,
  Globe,
  GraduationCap,
  Layers,
  LayoutGrid,
  Menu,
  MessageSquare,
  Package,
  Receipt,
  School,
  Sliders,
  Star,
  Truck,
  Warehouse,
  X,
  Zap,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const apexBlackLogo = "/images/nav-logos/apex-black-logo.png";
const apexBlueLogo = "/images/nav-logos/apex-blue-logo.png";
const apexGreenLogo = "/images/nav-logos/apex-green-logo.png";
const apexRedLogo = "/images/nav-logos/apex-red-logo.png";
const apexGoldLogo = "/images/nav-logos/apex-gold-logo.png";

/** The Features menu, in the order a seller meets the modules. */
const MENU: {
  key: "green" | "blue" | "gold" | "red" | "black";
  logo: string;
  accent: string;
  items: { title: string; hash: string; free?: boolean }[];
}[] = [
  {
    key: "green",
    logo: apexGreenLogo,
    accent: "text-mod-green",
    items: [
      { title: "UPC Scanner", hash: "upc-scanner" },
      { title: "Master Catalog", hash: "master-catalog" },
      { title: "Brands", hash: "brands" },
      { title: "Products", hash: "products" },
    ],
  },
  {
    key: "blue",
    logo: apexBlueLogo,
    accent: "text-mod-blue",
    items: [
      { title: "Purchase Orders", hash: "purchase-orders" },
      { title: "Profit & Loss", hash: "analytics" },
      { title: "Vendors", hash: "vendors" },
      { title: "Databases", hash: "databases" },
      { title: "Opex", hash: "opex" },
    ],
  },
  {
    key: "gold",
    logo: apexGoldLogo,
    accent: "text-mod-gold",
    items: [
      { title: "Listings", hash: "repricer" },
      { title: "Strategies", hash: "strategies" },
      { title: "Break-even Floors", hash: "floor-goals" },
    ],
  },
  {
    key: "red",
    logo: apexRedLogo,
    accent: "text-mod-red",
    items: [
      { title: "Shipments", hash: "shipments" },
      { title: "Warehouses", hash: "warehouses" },
      { title: "Inventory", hash: "inventory" },
      { title: "Prep Chat", hash: "prep-chat" },
      { title: "Prep Billing", hash: "prep-billing" },
    ],
  },
  {
    key: "black",
    logo: apexBlackLogo,
    accent: "text-ink",
    items: [
      { title: "Dashboard", hash: "dashboard" },
      { title: "Review Booster", hash: "review-booster", free: true },
      { title: "Apex University", hash: "apex-university", free: true },
      { title: "Books & Resources", hash: "resource-library" },
    ],
  },
];

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const featuresTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const featuresToggleRef = useRef<HTMLButtonElement>(null);

  const isFeatureActive = [
    "/features/black",
    "/features/blue",
    "/features/green",
    "/features/red",
    "/features/gold",
  ].includes(pathname);
  const isPricingActive = pathname === "/pricing";
  const isRewardsActive = pathname === "/rewards-benefits";
  const isCalculatorActive = pathname === "/tools/fba-calculator";
  const isAiActive =
    pathname === "/ai" ||
    pathname.startsWith("/integrations") ||
    pathname.startsWith("/docs/mcp");
  /**
   * Internal tools (the ops dashboard, Lead Desk) are gated behind Basic Auth
   * and noindexed — not pages a visitor lands on — so the public nav (Home /
   * Features / Pricing / Log in / Sign up) has no business on top of them.
   */
  const isInternalToolPage = pathname.startsWith("/dashboard") || pathname.startsWith("/leads");
  /**
   * Pages that ship a complete header of their own.
   *
   * isDistractionFreePage below still renders a bar — a centred logo — so a
   * page with its own header needs this branch instead, or it gets two.
   */
  const hasOwnHeader =
    pathname === "/apex-pop" ||
    pathname === "/apex-scan" ||
    pathname === "/apex-quiz" ||
    pathname === "/purchase-order-program" ||
    pathname === "/how-apex-works";

  /**
   * The PrimeWell applicant page: no menu at all, only the logo and the way
   * into the free account. Home, Features, Pricing and Rewards are exits
   * from the one thing the page asks for.
   */
  const isLeanHeaderPage =
    pathname === "/apex-pop-primewell" ||
    pathname === "/apex-pop-facebook" ||
    pathname === "/apex-pop-reddit" ||
    pathname === "/primewell";
  /**
   * The Facebook page is the top of the website A/B arm, and the qualifier
   * on /apex-pop/start is the only way through it. A header button straight
   * to /auth was a leak past the questions, and LOG IN on that page was a
   * misclick waiting to happen for someone who has no account yet.
   */
  const isPopWebJourney = pathname === "/apex-pop-facebook" || pathname === "/apex-pop-reddit";
  const leanSignupHref =
    pathname === "/apex-pop-facebook"
      ? "/apex-pop/start?from=apex-pop-facebook&utm_source=facebook&utm_medium=website&utm_campaign=apex-pop-promotion-web"
      : pathname === "/apex-pop-reddit"
        ? "/apex-pop/start?from=apex-pop-reddit"
        : pathname === "/primewell"
        ? "/auth?mode=signup&plan=free&utm_source=primewell&utm_medium=funnel&utm_campaign=primewell-form"
        : "/auth?mode=signup&plan=free&utm_source=primewell&utm_medium=funnel&utm_campaign=apex-pop-primewell";

  const isDistractionFreePage =
    pathname === "/fba-starter-bundle" ||
    /**
     * The Apex Pop qualifier: three steps and nothing else to click. The
     * centred logo is not a link either; the way out is the browser's.
     */
    pathname === "/apex-pop/start" ||
    pathname === "/apex-elite" ||
    pathname === "/premium-membership" ||
    pathname === "/proposal" ||
    pathname === "/checkout" ||
    pathname === "/first-order-roadmap" ||
    pathname === "/zero-to-hero" ||
    pathname === "/free-course" ||
    pathname === "/wholesale-course" ||
    /**
     * The VA promotional page asks for one thing, a booked meeting, and the
     * footer under it has already been cut to terms and privacy for the same
     * reason. Leaving seven menu links across the top would have made that
     * pointless: the top bar is the easier exit of the two.
     *
     * /apex-vas/hire keeps the full nav. Somebody choosing a person and a
     * schedule is mid-decision, not mid-funnel, and they should be able to
     * go and check the pricing page before they commit.
     */
    pathname === "/virtual-assistants" ||
    /**
     * Someone on the sign-up form has already chosen. A full menu there is a
     * row of exits from the one thing the page is for, and on a phone it is
     * a hamburger sitting above a form that has not even come into view yet.
     * The centred logo still gets them home.
     */
    pathname === "/auth";
  // apex-elite renders its own countdown bar fixed above this nav, so the nav
  // itself has to sit lower to avoid overlapping it.
  const isApexElitePage = pathname === "/apex-elite";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsFeaturesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenus = () => {
    setIsFeaturesOpen(false);
    setIsMenuOpen(false);
  };

  if (hasOwnHeader || isInternalToolPage) return null;
  // The Facebook ad page has no bar at all (Stefano, 2026-10-03): the hero
  // opens the screen and its own button is the way in.
  if (isPopWebJourney) return null;

  if (isLeanHeaderPage) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-hairline/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2">
              <img
                src={apexBullLogo.url}
                alt=""
                className="h-12 sm:h-18 w-auto object-contain"
              />
              <span className="text-xl font-bold tracking-tight text-slate-900">
                APEX{" "}
                <span className="text-brand text-[10px] align-top ml-0.5 font-black uppercase tracking-tighter">
                  Applications
                </span>
              </span>
            </Link>
            <div className="flex items-center gap-4 sm:gap-6 text-[14px]">
              {!isPopWebJourney && (
                <Link
                  href="/auth"
                  className="font-medium text-graphite transition-colors hover:text-ink"
                >
                  Log in
                </Link>
              )}
              <Link
                href={leanSignupHref}
                className="rounded-full bg-ink px-5 py-2.5 font-medium text-white transition hover:bg-graphite"
              >
                {/* The Facebook page sells the $1 week once it is on; "free" beside it is the mismatch. */}
                {isPopWebJourney && DOLLAR_WEEK.live ? `START FOR $${DOLLAR_WEEK.price}` : "Start my trial"}
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (isDistractionFreePage) {
    return (
      <nav
        className={`fixed left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-hairline/70 ${
          isApexElitePage ? "top-10" : "top-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-20">
            <div className="flex items-center gap-2">
              <img
                src={apexBullLogo.url}
                alt=""
                className="h-12 sm:h-18 w-auto object-contain"
              />
              <span className="text-xl font-bold tracking-tight text-slate-900">
                APEX{" "}
                <span className="text-brand text-[10px] align-top ml-0.5 font-black uppercase tracking-tighter">
                  Applications
                </span>
              </span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-hairline/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          <Link href="/" className="flex items-center gap-2">
            <img
              src={apexBullLogo.url}
              alt=""
              className="h-12 sm:h-18 w-auto object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              APEX{" "}
              <span className="text-brand text-[10px] align-top ml-0.5 font-black uppercase tracking-tighter">
                Applications
              </span>
            </span>
          </Link>

          {/* Desktop Nav — centered */}
          {/* Centred in the space between the logo and the buttons at every width.
              It used to be absolutely centred on the page from 1280px, which ran
              "AI Integrations" into the logo's wordmark at 1440px once the row
              grew. Flex keeps it clear of both sides. */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-6 xl:gap-9 whitespace-nowrap px-6 text-[14px] font-medium text-graphite/80">
            <Link
              href="/ai"
              className={`hover:text-ink transition-colors ${FOCUS} ${isAiActive ? "text-ink" : ""}`}
            >
              {/* Short below 1280px, where the full row pushed LOG IN onto two lines. */}
              <span className="xl:hidden">AI</span>
              <span className="hidden xl:inline">AI Integrations</span>
            </Link>

            <div
              className="relative"
              ref={menuRef}
              onKeyDown={(event) => {
                if (event.key === "Escape" && isFeaturesOpen) {
                  setIsFeaturesOpen(false);
                  featuresToggleRef.current?.focus();
                }
              }}
              onMouseEnter={() => {
                if (featuresTimeoutRef.current)
                  clearTimeout(featuresTimeoutRef.current);
                setIsFeaturesOpen(true);
              }}
              onMouseLeave={() => {
                featuresTimeoutRef.current = setTimeout(
                  () => setIsFeaturesOpen(false),
                  200,
                );
              }}
            >
              <button
                ref={featuresToggleRef}
                type="button"
                aria-expanded={isFeaturesOpen}
                aria-controls="features-menu"
                aria-haspopup="true"
                onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                className={`flex items-center gap-1.5 transition-colors ${FOCUS} ${isFeaturesOpen || isFeatureActive ? "text-ink" : "hover:text-ink"}`}
              >
                Features{" "}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${isFeaturesOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isFeaturesOpen && (
                  <motion.div
                    id="features-menu"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="fixed left-0 right-0 top-20 whitespace-normal"
                    onMouseEnter={() => {
                      if (featuresTimeoutRef.current)
                        clearTimeout(featuresTimeoutRef.current);
                      setIsFeaturesOpen(true);
                    }}
                    onMouseLeave={() => {
                      featuresTimeoutRef.current = setTimeout(
                        () => setIsFeaturesOpen(false),
                        200,
                      );
                    }}
                  >
                    <div className="border-b border-hairline bg-white shadow-[0_24px_48px_-24px_rgba(0,0,0,0.18)]">
                      <div className="mx-auto grid max-w-[1100px] grid-cols-5 gap-8 px-6 pb-10 pt-8">
                        {MENU.map((col) => {
                          const m = moduleByKey(col.key);
                          return (
                            <div key={col.key}>
                              <Link
                                href={m.path}
                                onClick={closeMenus}
                                className={`group block rounded-lg ${FOCUS}`}
                              >
                                <img src={col.logo} alt="" className="h-7 w-auto object-contain mix-blend-multiply" />
                                <span className={`mt-3 block text-[15px] font-semibold ${col.accent}`}>
                                  {m.name}
                                  {isBeta(col.key) && (
                                    <span className="ml-1.5 text-[12px] font-medium text-quiet">
                                      {col.key === "red" ? "Beta, invite" : "Beta"}
                                    </span>
                                  )}
                                </span>
                                <span className="mt-0.5 block text-[12px] leading-snug text-quiet">{m.label}</span>
                              </Link>
                              <ul className="mt-5 space-y-2.5">
                                {col.items.map((item) => (
                                  <li key={item.title}>
                                    <Link
                                      href={`${m.path}#${item.hash}`}
                                      onClick={closeMenus}
                                      className={`text-[14px] font-medium text-graphite transition-colors hover:text-ink ${FOCUS}`}
                                    >
                                      {item.title}
                                      {item.free && <span className="ml-1.5 text-[12px] font-medium text-mod-green">Free</span>}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                      <div className="border-t border-hairline/70">
                        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
                          <Link
                            href="/pricing"
                            onClick={closeMenus}
                            className="text-[14px] font-medium text-link hover:underline underline-offset-4"
                          >
                            Compare plans ›
                          </Link>
                          <Link
                            href="/auth?mode=signup&plan=starter&period=monthly"
                            onClick={closeMenus}
                            className="rounded-full bg-ink px-5 py-2 text-[13px] font-medium text-white transition hover:bg-graphite"
                          >
                            Start my trial
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link
              href="/pricing"
              className={`hover:text-ink transition-colors ${FOCUS} ${isPricingActive ? "text-ink" : ""}`}
            >
              Pricing
            </Link>
            <Link
              href="/tools/fba-calculator"
              className={`hover:text-ink transition-colors ${FOCUS} ${isCalculatorActive ? "text-ink" : ""}`}
            >
              FBA Calculator
            </Link>
            <Link
              href="/rewards-benefits"
              className={`hover:text-ink transition-colors ${FOCUS} ${isRewardsActive ? "text-ink" : ""}`}
            >
              <span className="xl:hidden">Rewards</span>
              <span className="hidden xl:inline">Rewards & Benefits</span>
            </Link>
          </div>

          {/* Right-side auth */}
          <div className="hidden lg:flex items-center gap-6 whitespace-nowrap text-[14px]">
            <Link
              href="/auth"
              className="font-medium text-graphite transition-colors hover:text-ink"
            >
              Log in
            </Link>
            <Link
              href="/auth?mode=signup&plan=starter&period=monthly"
              className="rounded-full bg-ink px-5 py-2.5 font-medium text-white transition hover:bg-graphite"
            >
              Start my trial
            </Link>
          </div>

          {/* Mobile Nav Toggle */}
          <div className="lg:hidden flex items-center gap-4">
            <Link href="/auth" className="whitespace-nowrap text-sm font-medium text-graphite">
              Log in
            </Link>
            <button
              type="button"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-100 bg-slate-900 rounded-lg shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {isMenuOpen ? (
                <X size={20} className="text-white" />
              ) : (
                <Menu size={20} className="text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-slate-200 py-6 px-4 space-y-6 overflow-hidden"
          >
            <div className="space-y-4">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="block text-slate-900 font-bold text-lg w-full text-left"
              >
                Home
              </Link>
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                  Features
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {/* Gold was in the desktop mega-menu and missing here once, so
                      the repricer was unreachable from the menu on a phone. */}
                  {(
                    [
                      { key: "green", name: "Apex Green", logo: apexGreenLogo },
                      { key: "blue", name: "Apex Blue", logo: apexBlueLogo },
                      { key: "gold", name: "Apex Gold", logo: apexGoldLogo },
                      { key: "red", name: "Apex Red", logo: apexRedLogo },
                      { key: "black", name: "Apex Black", logo: apexBlackLogo },
                    ] as const
                  ).map((mod) => (
                    <Link
                      key={mod.key}
                      href={moduleByKey(mod.key).path}
                      onClick={closeMenus}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      <img
                        src={mod.logo}
                        alt={mod.name}
                        className="h-7 w-auto object-contain"
                      />
                      <span className="flex flex-col min-w-0">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="font-medium text-slate-800">
                            {moduleByKey(mod.key).label}
                          </span>
                          {isBeta(mod.key) && (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                              Beta
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-slate-500">{mod.name}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                href="/ai"
                onClick={closeMenus}
                className="block text-slate-900 font-bold text-lg w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                AI Integrations
              </Link>
              {/* Pricing had no mobile entry at all — the page a buyer looks
                  for first was reachable only by typing the URL. */}
              <Link
                href="/pricing"
                onClick={() => setIsMenuOpen(false)}
                className="block text-slate-900 font-bold text-lg w-full text-left"
              >
                Pricing
              </Link>
              <Link
                href="/tools/fba-calculator"
                onClick={() => setIsMenuOpen(false)}
                className="block text-slate-900 font-bold text-lg w-full text-left"
              >
                Free FBA Calculator
              </Link>
              <Link
                href="/rewards-benefits"
                onClick={() => setIsMenuOpen(false)}
                className="block text-slate-900 font-bold text-lg w-full text-left"
              >
                Rewards & Benefits
              </Link>
              <Link
                href="/features/black#resource-library"
                onClick={closeMenus}
                className="block text-slate-900 font-bold text-lg w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Resources
              </Link>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <Link
                href="/auth?mode=signup&plan=starter&period=monthly"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center bg-brand text-white px-5 py-4 rounded-2xl font-bold shadow-lg shadow-brand/20"
              >
                Start my trial
              </Link>
              <Link
                href="/features/black#apex-university"
                onClick={closeMenus}
                className="block w-full text-center border border-brand/20 text-brand px-5 py-4 rounded-2xl font-bold hover:bg-brand/5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                FREE AMAZON COURSE
              </Link>
              <Link
                href="/contact-us"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center bg-slate-50 text-slate-900 px-5 py-4 rounded-2xl font-bold"
              >
                Contact Support
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
