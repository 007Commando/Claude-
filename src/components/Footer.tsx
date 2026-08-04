"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import apexBullLogo from "../assets/apex-bull-logo.png.asset.json";
import amazonPartnerBadge from "../assets/amazon-partner-badge.png.asset.json";

export default function Footer() {
  const pathname = usePathname();
  const isMinimalFooterPage = pathname === "/apex-elite" || pathname === "/premium-membership";

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
                <Link href="/terms" className="hover:text-brand transition-colors">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="hover:text-brand transition-colors">
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
            <h4 className="font-semibold text-slate-900 mb-5">Company</h4>
            <ul className="space-y-3 text-slate-600">
              <li>
                <Link href="/" className="hover:text-brand transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/features/black#review-booster" className="hover:text-brand transition-colors">
                  Review Booster
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-brand transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-slate-900 mb-5">Features</h4>
            <ul className="space-y-3 text-slate-600">
              <li>
                <Link href="/features/black" className="hover:text-brand transition-colors">
                  Apex Black
                </Link>
              </li>
              <li>
                <Link href="/features/blue" className="hover:text-brand transition-colors">
                  Apex Blue
                </Link>
              </li>
              <li>
                <Link href="/features/green" className="hover:text-brand transition-colors">
                  Apex Green
                </Link>
              </li>
              <li>
                <Link href="/features/red" className="hover:text-brand transition-colors">
                  Apex Red
                </Link>
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-slate-900 mb-5">Pricing</h4>
            <ul className="space-y-3 text-slate-600">
              <li>
                <Link href="/pricing" className="hover:text-brand transition-colors">
                  Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* How Amazon Wholesale Works */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-slate-900 mb-5">How Amazon Wholesale Works</h4>
            <ul className="space-y-3 text-slate-600">
              <li>
                <Link href="/how-it-works" className="hover:text-brand transition-colors">
                  The Roadmap
                </Link>
              </li>
              <li>
                <Link href="/ungating-guide" className="hover:text-brand transition-colors">
                  Ungating Guide
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-brand transition-colors">
                  Blog
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
            <Link href="/privacy" className="hover:text-brand transition-colors">
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
