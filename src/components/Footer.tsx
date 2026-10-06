"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import apexBullLogo from "../assets/apex-bull-logo.png.asset.json";
import amazonPartnerBadge from "../assets/amazon-partner-badge.png.asset.json";

export default function Footer() {
  const pathname = usePathname();

  /**
   * Internal tools (the ops dashboard, Lead Desk) are gated behind Basic Auth
   * and noindexed — they're screens Stefano and Aliza work in, not pages a
   * visitor lands on, so the public site footer (four columns of marketing
   * links) has no business under them.
   */
  const isInternalToolPage = pathname.startsWith("/dashboard") || pathname.startsWith("/leads");
  if (isInternalToolPage) return null;

  const isMinimalFooterPage =
    pathname === "/apex-elite" ||
    pathname === "/premium-membership" ||
    pathname === "/proposal" ||
    pathname === "/checkout" ||
    /**
     * The PrimeWell applicant page: logo, the Amazon Software Partner badge,
     * terms and privacy. No columns of links to wander off into.
     */
    pathname === "/apex-pop-primewell" ||
    pathname === "/primewell" ||
    /**
     * The VA promotional page exists to get one meeting booked. Four columns
     * of links under it are four more offers competing with the only action
     * the page is for. The hire page keeps the full footer: somebody there is
     * already deciding, and hiding the way back out of a checkout is a
     * different and worse thing.
     */
    pathname === "/virtual-assistants" ||
    /**
     * The sign-up form had the whole site footer under it — four columns of
     * links, on a phone, below a form. Terms and privacy still belong there,
     * and nothing else does.
     */
    pathname === "/auth";

  /**
   * Pages that ship a complete footer of their own, including the Meta and
   * Amazon disclaimers a paid landing page has to carry. Rendering the site
   * footer under one of those gives the page two footers and two copyright
   * lines.
   */
  const hasOwnFooter =
    pathname === "/apex-pop" ||
    pathname === "/purchase-order-program" ||
    pathname === "/how-apex-works" ||
    pathname === "/first-order-roadmap" ||
    pathname === "/zero-to-hero" ||
    pathname === "/free-course" ||
    pathname === "/wholesale-course";
  if (hasOwnFooter) return null;

  /**
   * The website A/B arm of Apex Pop: the Facebook page and the qualifier
   * after it. Stefano asked for no links at all on this journey, so that a
   * stray tap cannot leave the form. Logo (not linked), the partner badge
   * and the copyright line; privacy is linked from the form's own consent
   * text, where it opens in a new tab.
   */
  const isNoLinksFooterPage =
    pathname === "/apex-pop-facebook" || pathname === "/apex-pop-reddit" || pathname === "/apex-pop/start";
  if (isNoLinksFooterPage) {
    return (
      <footer className="bg-white text-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8">
            <img
              src={apexBullLogo.url}
              alt="Apex Applications"
              className="h-16 w-auto object-contain"
            />
            <img
              src={amazonPartnerBadge.url}
              alt="Amazon Selling Partner Appstore Software Partner"
              className="h-24 w-auto object-contain"
            />
            <div className="w-full pt-8 border-t border-slate-200 text-center text-slate-500 text-sm">
              © 2026 Apex Applications. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    );
  }

  if (isMinimalFooterPage) {
    return (
      <footer className="bg-white text-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8">
            <Link href="/" className="inline-block">
              <img
                src={apexBullLogo.url}
                alt="Apex Applications"
                className="h-16 w-auto object-contain"
              />
            </Link>
            <img
              src={amazonPartnerBadge.url}
              alt="Amazon Selling Partner Appstore Software Partner"
              className="h-24 w-auto object-contain"
            />
            <div className="w-full pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-center items-center gap-4">
              <div className="flex gap-8 text-slate-600 text-sm">
                <Link
                  href="/terms"
                  className="hover:text-brand transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/privacy"
                  className="hover:text-brand transition-colors"
                >
                  Privacy Policy
                </Link>
              </div>
              <div className="text-slate-500 text-sm">
                © 2026 Apex Applications. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white text-slate-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Logo */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block">
              <img
                src={apexBullLogo.url}
                alt="Apex Applications"
                className="h-16 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <p className="font-semibold text-slate-900 mb-5">Company</p>
            <ul className="space-y-3 text-slate-600">
              <li>
                <Link href="/" className="hover:text-brand transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/review-booster"
                  className="hover:text-brand transition-colors"
                >
                  Review Booster
                </Link>
              </li>
              <li>
                {/*
                  Points at /virtual-assistants, not /apex-vas.

                  This was the site's only link to the VA service, and it went
                  to the twin that is noindex, nofollow. So the one sitewide
                  signal we had walked a crawler into a dead end and left the
                  indexable page with no internal links at all. The quote
                  builder is one click on from here.
                */}
                <Link
                  href="/virtual-assistants"
                  className="hover:text-brand transition-colors"
                >
                  Apex VAs
                </Link>
              </li>
              <li>
                <Link href="/distributor-vault" className="hover:text-brand transition-colors">
                  Distributor Vault
                </Link>
              </li>
              <li>
                <Link href="/prep-center-network" className="hover:text-brand transition-colors">
                  Prep Center Network
                </Link>
              </li>
              <li>
                <Link href="/rewards-benefits" className="hover:text-brand transition-colors">
                  Rewards &amp; Benefits
                </Link>
              </li>
              <li>
                <Link href="/ai" className="hover:text-brand transition-colors">
                  Connect AI Agents
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="hover:text-brand transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="md:col-span-2">
            <p className="font-semibold text-slate-900 mb-5">Features</p>
            <ul className="space-y-3 text-slate-600">
              <li>
                <Link
                  href="/features/black"
                  className="hover:text-brand transition-colors"
                >
                  Apex Black
                </Link>
              </li>
              <li>
                <Link
                  href="/features/blue"
                  className="hover:text-brand transition-colors"
                >
                  Apex Blue
                </Link>
              </li>
              <li>
                <Link
                  href="/features/green"
                  className="hover:text-brand transition-colors"
                >
                  Apex Green
                </Link>
              </li>
              <li>
                <Link
                  href="/features/red"
                  className="hover:text-brand transition-colors"
                >
                  Apex Red
                </Link>
              </li>
              <li>
                <Link
                  href="/features/gold"
                  className="hover:text-brand transition-colors"
                >
                  Apex Gold
                </Link>
              </li>
            </ul>
            {/* Free tools get their own heading so the calculator is easy to find. */}
            <p className="font-semibold text-slate-900 mb-5 mt-8">Free Tools</p>
            <ul className="space-y-3 text-slate-600">
              <li>
                <Link
                  href="/tools/fba-calculator"
                  className="inline-flex items-center gap-2 font-semibold text-brand hover:text-brand-dark transition-colors"
                >
                  Free FBA Fee Calculator
                  <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                    Free
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/amazon-profit-calculator"
                  className="hover:text-brand transition-colors"
                >
                  Profit &amp; ROI Calculator
                </Link>
              </li>
              <li>
                <Link href="/tools#chrome-extension" className="hover:text-brand transition-colors">
                  Chrome Extension
                  <span className="block text-xs text-slate-400">Free when you finish Apex University</span>
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-brand transition-colors">
                  All Free Tools
                </Link>
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="md:col-span-2">
            <p className="font-semibold text-slate-900 mb-5">Pricing</p>
            <ul className="space-y-3 text-slate-600">
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-brand transition-colors"
                >
                  Plans
                </Link>
              </li>
            </ul>
            <p className="font-semibold text-slate-900 mb-5 mt-8">Compare</p>
            <ul className="space-y-3 text-slate-600">
              <li>
                <Link
                  href="/compare/helium10"
                  className="hover:text-brand transition-colors"
                >
                  vs Helium 10
                </Link>
              </li>
              <li>
                <Link
                  href="/compare/junglescout"
                  className="hover:text-brand transition-colors"
                >
                  vs Jungle Scout
                </Link>
              </li>
              <li>
                <Link
                  href="/compare/smartscout"
                  className="hover:text-brand transition-colors"
                >
                  vs SmartScout
                </Link>
              </li>
              <li>
                <Link
                  href="/compare/sellersnap"
                  className="hover:text-brand transition-colors"
                >
                  vs Seller Snap
                </Link>
              </li>
              <li>
                <Link
                  href="/compare"
                  className="hover:text-brand transition-colors"
                >
                  All comparisons
                </Link>
              </li>
            </ul>
          </div>

          {/* How Amazon Wholesale Works */}
          <div className="md:col-span-2">
            <p className="font-semibold text-slate-900 mb-5">
              How Amazon Wholesale Works
            </p>
            <ul className="space-y-3 text-slate-600">
              <li>
                <Link
                  href="/how-it-works"
                  className="hover:text-brand transition-colors"
                >
                  The Roadmap
                </Link>
              </li>
              <li>
                <Link
                  href="/ungating-guide"
                  className="hover:text-brand transition-colors"
                >
                  Ungating Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-brand transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/amazon-wholesale-software" className="hover:text-brand transition-colors">
                  Amazon Wholesale Software
                </Link>
              </li>
              <li>
                <Link href="/free-course" className="hover:text-brand transition-colors">
                  Free Wholesale Course
                </Link>
              </li>
              <li>
                <Link
                  href="/amazon-inventory-management-software"
                  className="hover:text-brand transition-colors"
                >
                  Inventory &amp; Restock Planning
                </Link>
              </li>
              <li>
                <Link
                  href="/amazon-wholesale-suppliers"
                  className="hover:text-brand transition-colors"
                >
                  Vetting Wholesale Suppliers
                </Link>
              </li>
              <li>
                <Link
                  href="/amazon-fba-prep-centers"
                  className="hover:text-brand transition-colors"
                >
                  Choosing a Prep Center
                </Link>
              </li>
              <li>
                <Link
                  href="/amazon-review-automation"
                  className="hover:text-brand transition-colors"
                >
                  Review Request Automation
                </Link>
              </li>
            </ul>
          </div>

          {/* Software Partner badge */}
          <div className="md:col-span-2 flex md:justify-end items-start">
            <img
              src={amazonPartnerBadge.url}
              alt="Amazon Selling Partner Appstore Software Partner"
              className="h-28 w-auto object-contain"
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-8 text-slate-600 text-sm">
            <Link href="/terms" className="hover:text-brand transition-colors">
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="hover:text-brand transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
          <div className="text-slate-500 text-sm">
            © 2026 Apex Applications. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
