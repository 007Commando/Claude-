"use client";

import apexBullLogo from "../assets/apex-bull-logo.png.asset.json";
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
import { usePathname, useRouter } from "next/navigation";

const apexBlackLogo = "/images/nav-logos/apex-black-logo.png";
const apexBlueLogo = "/images/nav-logos/apex-blue-logo.png";
const apexGreenLogo = "/images/nav-logos/apex-green-logo.png";
const apexRedLogo = "/images/nav-logos/apex-red-logo.png";
const apexGoldLogo = "/images/nav-logos/apex-gold-logo.png";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const featuresTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isFeatureActive = [
    "/features/black",
    "/features/blue",
    "/features/green",
    "/features/red",
    "/features/gold",
  ].includes(pathname);
  const isHomeActive = pathname === "/";
  const isPricingActive = pathname === "/pricing";
  const isRewardsActive = pathname === "/rewards-benefits";
  /**
   * Pages that ship a complete header of their own.
   *
   * isDistractionFreePage below still renders a bar — a centred logo — so a
   * page with its own header needs this branch instead, or it gets two.
   */
  const hasOwnHeader =
    pathname === "/apex-pop" ||
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
    pathname === "/primewell";
  const leanSignupHref =
    pathname === "/apex-pop-facebook"
      ? "/auth?mode=signup&plan=free&utm_source=facebook&utm_medium=funnel&utm_campaign=apex-pop-promotion"
      : pathname === "/primewell"
        ? "/auth?mode=signup&plan=free&utm_source=primewell&utm_medium=funnel&utm_campaign=primewell-form"
        : "/auth?mode=signup&plan=free&utm_source=primewell&utm_medium=funnel&utm_campaign=apex-pop-primewell";

  const isDistractionFreePage =
    pathname === "/fba-starter-bundle" ||
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

  const handleFeatureClick = (path: string) => {
    router.push(path);
    setIsFeaturesOpen(false);
    setIsMenuOpen(false);
  };

  if (hasOwnHeader) return null;

  if (isLeanHeaderPage) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2">
              <img
                src={apexBullLogo.url}
                alt="Apex Applications"
                className="h-18 w-auto object-contain"
              />
              <span className="text-xl font-bold tracking-tight text-slate-900">
                APEX{" "}
                <span className="text-brand text-[10px] align-top ml-0.5 font-black uppercase tracking-tighter">
                  Applications
                </span>
              </span>
            </Link>
            <div className="flex items-center gap-4 sm:gap-6 uppercase tracking-wider text-[13px]">
              <Link
                href="/auth"
                className="text-slate-900 hover:text-brand transition-colors font-bold"
              >
                LOG IN
              </Link>
              <Link
                href={leanSignupHref}
                className="bg-brand text-white px-5 sm:px-7 py-3 rounded-xl hover:bg-brand-dark transition-all shadow-xl shadow-brand/20 font-bold"
              >
                SIGN UP FREE
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
        className={`fixed left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 ${
          isApexElitePage ? "top-10" : "top-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-20">
            <div className="flex items-center gap-2">
              <img
                src={apexBullLogo.url}
                alt="Apex Applications"
                className="h-18 w-auto object-contain"
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          <Link href="/" className="flex items-center gap-2">
            <img
              src={apexBullLogo.url}
              alt="Apex Applications"
              className="h-18 w-auto object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              APEX{" "}
              <span className="text-brand text-[10px] align-top ml-0.5 font-black uppercase tracking-tighter">
                Applications
              </span>
            </span>
          </Link>

          {/* Desktop Nav — centered */}
          <div className="hidden lg:flex items-center gap-10 text-[13px] font-bold text-slate-600 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/"
              className={`hover:text-brand transition-colors uppercase tracking-wider ${isHomeActive ? "text-brand" : ""}`}
            >
              HOME
            </Link>

            <div
              className="relative"
              ref={menuRef}
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
                onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                className={`flex items-center gap-1.5 transition-colors uppercase tracking-wider ${isFeaturesOpen || isFeatureActive ? "text-brand" : "hover:text-brand"}`}
              >
                FEATURES{" "}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${isFeaturesOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isFeaturesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[1080px] pt-3"
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
                    <div className="bg-white rounded-2xl shadow-[0_24px_60px_-12px_rgba(15,23,42,0.18)] border border-slate-200/70 overflow-hidden">
                      <div className="grid grid-cols-5 divide-x divide-slate-100">
                        {/* Column 1: Apex Black */}
                        <div className="p-6">
                          <button
                            onClick={() =>
                              handleFeatureClick("/features/black")
                            }
                            className="w-full flex items-center justify-center mb-4 p-3 rounded-xl border border-transparent transition-all duration-300 hover:border-slate-900/30 hover:bg-slate-900/5 hover:shadow-[0_0_28px_-2px_rgba(15,23,42,0.45)]"
                          >
                            <img
                              src={apexBlackLogo}
                              alt="Apex Black"
                              className="h-11 w-auto object-contain"
                            />
                          </button>
                          <div className="border-t border-slate-200 mb-3" />
                          <div className="space-y-1">
                            {[
                              {
                                title: "Dashboard",
                                desc: "Your Omnispective Amazon Dashboard",
                                icon: LayoutGrid,
                                hash: "dashboard",
                              },
                              {
                                title: "Review Booster",
                                desc: "Automate Your Order Reviews & Boost Seller Feedback",
                                icon: Star,
                                hash: "review-booster",
                                free: true,
                              },
                              {
                                title: "Apex University",
                                desc: "The Wholesale Blueprint Learning Center",
                                icon: School,
                                hash: "apex-university",
                                free: true,
                              },
                              {
                                title: "Books & Resources",
                                desc: "Recommended Reading & Resources",
                                icon: BookOpen,
                                hash: "resource-library",
                              },
                            ].map((item, i) => {
                              const Icon = item.icon;
                              return (
                                <button
                                  key={i}
                                  onClick={() =>
                                    handleFeatureClick(
                                      `/features/black#${item.hash}`,
                                    )
                                  }
                                  className="flex gap-3 items-start group text-left w-full p-2 rounded-lg transition-all hover:bg-orange-50/60"
                                >
                                  <div className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 shrink-0">
                                    <Icon
                                      className="text-slate-400 group-hover:text-orange-500 transition-colors"
                                      size={18}
                                      strokeWidth={1.5}
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <div className="text-slate-900 font-semibold text-[13px] leading-none tracking-tight">
                                        {item.title}
                                      </div>
                                      {item.free && (
                                        <span className="px-1.5 py-0.5 bg-slate-900 text-white text-[8px] font-bold rounded uppercase tracking-wider leading-none">
                                          Free
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-500 leading-snug">
                                      {item.desc}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Column 2: Apex Blue */}
                        <div className="p-6">
                          <button
                            onClick={() => handleFeatureClick("/features/blue")}
                            className="w-full flex items-center justify-center mb-4 p-3 rounded-xl border border-transparent transition-all duration-300 hover:border-blue-500/40 hover:bg-blue-500/5 hover:shadow-[0_0_28px_-2px_rgba(37,99,235,0.5)]"
                          >
                            <img
                              src={apexBlueLogo}
                              alt="Apex Blue"
                              className="h-11 w-auto object-contain"
                            />
                          </button>
                          <div className="border-t border-slate-200 mb-3" />
                          <div className="space-y-1">
                            {[
                              {
                                title: "Analytics",
                                desc: "Financial Analytics & Restock Management Dashboard",
                                icon: BarChart,
                                hash: "analytics",
                              },
                              {
                                title: "Vendors",
                                desc: "Add & Organize Your Suppliers",
                                icon: Globe,
                                hash: "vendors",
                              },
                              {
                                title: "Databases",
                                desc: "Market Intelligence For Your Listings",
                                icon: Database,
                                hash: "databases",
                              },
                              {
                                title: "Purchase Orders",
                                desc: "Create & Manage Your Purchasing",
                                icon: FileText,
                                hash: "purchase-orders",
                              },
                              {
                                title: "Opex",
                                desc: "View & Manage Operating Expenses",
                                icon: CreditCard,
                                hash: "opex",
                              },
                            ].map((item, i) => {
                              const Icon = item.icon;
                              return (
                                <button
                                  key={i}
                                  onClick={() =>
                                    handleFeatureClick(
                                      `/features/blue#${item.hash}`,
                                    )
                                  }
                                  className="flex gap-3 items-start group text-left w-full p-2 rounded-lg transition-all hover:bg-blue-50/60"
                                >
                                  <Icon
                                    className="text-slate-400 group-hover:text-blue-600 transition-colors mt-0.5 shrink-0"
                                    size={20}
                                    strokeWidth={1.5}
                                  />
                                  <div className="min-w-0">
                                    <div className="text-slate-900 font-semibold text-[13px] leading-none mb-1 tracking-tight">
                                      {item.title}
                                    </div>
                                    <div className="text-[11px] text-slate-500 leading-snug">
                                      {item.desc}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Column 3: Apex Green */}
                        <div className="p-6">
                          <button
                            onClick={() =>
                              handleFeatureClick("/features/green")
                            }
                            className="w-full flex items-center justify-center mb-4 p-3 rounded-xl border border-transparent transition-all duration-300 hover:border-green-500/40 hover:bg-green-500/5 hover:shadow-[0_0_28px_-2px_rgba(34,197,94,0.5)]"
                          >
                            <img
                              src={apexGreenLogo}
                              alt="Apex Green"
                              className="h-11 w-auto object-contain"
                            />
                          </button>
                          <div className="border-t border-slate-200 mb-3" />
                          <div className="space-y-1">
                            {[
                              {
                                title: "Master Catalog",
                                desc: "Merge and Manage Your Vendors Catalogs",
                                icon: Layers,
                                hash: "master-catalog",
                              },
                              {
                                title: "UPC Scanner",
                                desc: "Find Matching Listings to a UPC List",
                                icon: Barcode,
                                hash: "upc-scanner",
                              },
                              {
                                title: "Brands",
                                desc: "View Brands in the Amazon Platform",
                                icon: BookText,
                                hash: "brands",
                              },
                              {
                                title: "Products",
                                desc: "Discover New Listings and Opportunities",
                                icon: GraduationCap,
                                hash: "products",
                              },
                            ].map((item, i) => {
                              const Icon = item.icon;
                              return (
                                <button
                                  key={i}
                                  onClick={() =>
                                    handleFeatureClick(
                                      `/features/green#${item.hash}`,
                                    )
                                  }
                                  className="flex gap-3 items-start group text-left w-full p-2 rounded-lg transition-all hover:bg-green-50/60"
                                >
                                  <Icon
                                    className="text-slate-400 group-hover:text-green-600 transition-colors mt-0.5 shrink-0"
                                    size={20}
                                    strokeWidth={1.5}
                                  />
                                  <div className="min-w-0">
                                    <div className="text-slate-900 font-semibold text-[13px] leading-none mb-1 tracking-tight">
                                      {item.title}
                                    </div>
                                    <div className="text-[11px] text-slate-500 leading-snug">
                                      {item.desc}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Column 4: Apex Red */}
                        <div className="p-6">
                          <button
                            onClick={() => handleFeatureClick("/features/red")}
                            className="w-full flex items-center justify-center mb-4 p-3 rounded-xl border border-transparent transition-all duration-300 hover:border-red-500/40 hover:bg-red-500/5 hover:shadow-[0_0_28px_-2px_rgba(239,68,68,0.5)]"
                          >
                            <img
                              src={apexRedLogo}
                              alt="Apex Red"
                              className="h-11 w-auto object-contain"
                            />
                          </button>
                          <div className="border-t border-slate-200 mb-3" />
                          <div className="space-y-1">
                            {[
                              {
                                title: "Shipments",
                                desc: "View or Create New Shipments",
                                icon: Truck,
                                hash: "shipments",
                              },
                              {
                                title: "Warehouses",
                                desc: "Manage Your Ship From Address & Connect To Multiple Prep Centers",
                                icon: Warehouse,
                                hash: "warehouses",
                              },
                              {
                                title: "Inventory",
                                desc: "Manage Your Warehouse Inventory",
                                icon: Package,
                                hash: "inventory",
                              },
                              {
                                title: "Prep Chat",
                                desc: "Live Chat With Your Prep Centers",
                                icon: MessageSquare,
                                hash: "prep-chat",
                              },
                              {
                                title: "Prep Billing",
                                desc: "View & Manage Your Prep Center Bills",
                                icon: Receipt,
                                hash: "prep-billing",
                              },
                            ].map((item, i) => {
                              const Icon = item.icon;
                              return (
                                <button
                                  key={i}
                                  onClick={() =>
                                    handleFeatureClick(
                                      `/features/red#${item.hash}`,
                                    )
                                  }
                                  className="flex gap-3 items-start group text-left w-full p-2 rounded-lg transition-all hover:bg-red-50/60"
                                >
                                  <Icon
                                    className="text-slate-400 group-hover:text-red-600 transition-colors mt-0.5 shrink-0"
                                    size={20}
                                    strokeWidth={1.5}
                                  />
                                  <div className="min-w-0">
                                    <div className="text-slate-900 font-semibold text-[13px] leading-none mb-1 tracking-tight">
                                      {item.title}
                                    </div>
                                    <div className="text-[11px] text-slate-500 leading-snug">
                                      {item.desc}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Column 5: Apex Gold */}
                        <div className="p-6">
                          <button
                            onClick={() => handleFeatureClick("/features/gold")}
                            className="w-full flex items-center justify-center mb-4 p-3 rounded-xl border border-transparent transition-all duration-300 hover:border-amber-500/40 hover:bg-amber-500/5 hover:shadow-[0_0_28px_-2px_rgba(245,158,11,0.5)]"
                          >
                            <img
                              src={apexGoldLogo}
                              alt="Apex Gold"
                              className="h-11 w-auto object-contain"
                            />
                          </button>
                          <div className="border-t border-slate-200 mb-3" />
                          <div className="space-y-1">
                            {[
                              /*
                                Named as the app names them. These read
                                Repricer / Break-Even Floors / Strategies,
                                which are things the repricer does rather than
                                screens anyone can go and open.
                              */
                              {
                                title: "Listings",
                                desc: "Set Repricing Rules On Your Live Listings",
                                icon: Zap,
                                hash: "repricer",
                              },
                              {
                                title: "Strategy",
                                desc: "Manage & Create New Repricing Strategies",
                                icon: Sliders,
                                hash: "strategies",
                              },
                              {
                                title: "Price Activity",
                                desc: "Every Price Decision The Repricer Has Made",
                                icon: Gauge,
                                hash: "floor-goals",
                              },
                            ].map((item, i) => {
                              const Icon = item.icon;
                              return (
                                <button
                                  key={i}
                                  onClick={() =>
                                    handleFeatureClick(
                                      `/features/gold#${item.hash}`,
                                    )
                                  }
                                  className="flex gap-3 items-start group text-left w-full p-2 rounded-lg transition-all hover:bg-amber-50/60"
                                >
                                  <Icon
                                    className="text-slate-400 group-hover:text-amber-600 transition-colors mt-0.5 shrink-0"
                                    size={20}
                                    strokeWidth={1.5}
                                  />
                                  <div className="min-w-0">
                                    <div className="text-slate-900 font-semibold text-[13px] leading-none mb-1 tracking-tight">
                                      {item.title}
                                    </div>
                                    <div className="text-[11px] text-slate-500 leading-snug">
                                      {item.desc}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Auth CTA strip */}
                      <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-[12px] text-slate-500">
                          Ready to scale your Amazon business?
                        </div>
                        <div className="flex items-center gap-5">
                          <Link
                            href="/auth?mode=signup&plan=starter&period=monthly"
                            onClick={() => setIsFeaturesOpen(false)}
                            className="text-brand hover:text-brand-dark font-semibold text-[13px] transition-colors"
                          >
                            Create an Account
                          </Link>
                          <Link
                            href="/auth"
                            onClick={() => setIsFeaturesOpen(false)}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full font-semibold text-[13px] transition-all"
                          >
                            Sign In
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
              className={`hover:text-brand transition-colors uppercase tracking-wider ${isPricingActive ? "text-brand" : ""}`}
            >
              PRICING
            </Link>
            <Link
              href="/rewards-benefits"
              className={`hover:text-brand transition-colors uppercase tracking-wider ${isRewardsActive ? "text-brand" : ""}`}
            >
              REWARDS & BENEFITS
            </Link>
          </div>

          {/* Right-side auth */}
          <div className="hidden lg:flex items-center gap-6 uppercase tracking-wider text-[13px]">
            <Link
              href="/auth"
              className="text-slate-900 hover:text-brand transition-colors font-bold"
            >
              LOG IN
            </Link>
            <Link
              href="/auth?mode=signup&plan=starter&period=monthly"
              className="bg-brand text-white px-7 py-3 rounded-xl hover:bg-brand-dark transition-all shadow-xl shadow-brand/20 font-bold"
            >
              SIGN UP
            </Link>
          </div>

          {/* Mobile Nav Toggle */}
          <div className="lg:hidden flex items-center gap-4">
            <Link href="/auth" className="text-sm font-bold text-slate-900">
              LOG IN
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-100 bg-slate-900 rounded-lg shadow-lg"
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
                  <button
                    onClick={() => handleFeatureClick("/features/black")}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl w-full text-left"
                  >
                    <img
                      src={apexBlackLogo}
                      alt="Apex Black"
                      className="h-7 w-auto object-contain"
                    />
                    <span className="font-medium text-slate-700">
                      Apex Black
                    </span>
                  </button>
                  <button
                    onClick={() => handleFeatureClick("/features/blue")}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl w-full text-left"
                  >
                    <img
                      src={apexBlueLogo}
                      alt="Apex Blue"
                      className="h-7 w-auto object-contain"
                    />
                    <span className="font-medium text-slate-700">
                      Apex Blue
                    </span>
                  </button>
                  <button
                    onClick={() => handleFeatureClick("/features/green")}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl w-full text-left"
                  >
                    <img
                      src={apexGreenLogo}
                      alt="Apex Green"
                      className="h-7 w-auto object-contain"
                    />
                    <span className="font-medium text-slate-700">
                      Apex Green
                    </span>
                  </button>
                  <button
                    onClick={() => handleFeatureClick("/features/red")}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl w-full text-left"
                  >
                    <img
                      src={apexRedLogo}
                      alt="Apex Red"
                      className="h-7 w-auto object-contain"
                    />
                    <span className="font-medium text-slate-700">Apex Red</span>
                  </button>
                  {/*
                        Gold was in the desktop mega-menu and missing here, so
                        the repricer — the thing the paid search plan is built
                        around — was unreachable from the menu on a phone.
                      */}
                  <button
                    onClick={() => handleFeatureClick("/features/gold")}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl w-full text-left"
                  >
                    <img
                      src={apexGoldLogo}
                      alt="Apex Gold"
                      className="h-7 w-auto object-contain"
                    />
                    <span className="font-medium text-slate-700">
                      Apex Gold
                    </span>
                  </button>
                </div>
              </div>
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
                href="/rewards-benefits"
                onClick={() => setIsMenuOpen(false)}
                className="block text-slate-900 font-bold text-lg w-full text-left"
              >
                Rewards & Benefits
              </Link>
              <button
                onClick={() =>
                  handleFeatureClick("/features/black#resource-library")
                }
                className="block text-slate-900 font-bold text-lg w-full text-left"
              >
                Resources
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <Link
                href="/auth?mode=signup&plan=starter&period=monthly"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center bg-brand text-white px-5 py-4 rounded-2xl font-bold shadow-lg shadow-brand/20"
              >
                SIGN UP FREE
              </Link>
              <button
                onClick={() =>
                  handleFeatureClick("/features/black#apex-university")
                }
                className="w-full border border-brand/20 text-brand px-5 py-4 rounded-2xl font-bold hover:bg-brand/5 transition-all"
              >
                FREE AMAZON COURSE
              </button>
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
