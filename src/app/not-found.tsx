import Link from "next/link";

/**
 * A real "not found" page.
 *
 * This used to redirect to the homepage, so someone following a broken link
 * landed on the homepage with no idea why, and Google's snapshot of every 404
 * was a blank page. It still answers 404 (Next sets the status); now it says so
 * and offers the pages people usually want.
 */
const LINKS = [
  { href: "/", label: "Home", note: "What Apex does for Amazon wholesale sellers" },
  { href: "/tools/fba-calculator", label: "Free FBA Calculator", note: "Fees, price history and profit for any ASIN" },
  { href: "/pricing", label: "Pricing", note: "Plans and the 7-day free trial" },
  { href: "/blog", label: "Blog", note: "Guides on sourcing, fees, ungating and more" },
  { href: "/compare", label: "Comparisons", note: "Apex next to the tools you may be using" },
  { href: "/contact-us", label: "Contact us", note: "Tell us what you were looking for" },
];

export default function NotFound() {
  return (
    <div className="bg-white px-4 pb-24 pt-36 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-brand">404</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">That page doesn&apos;t exist</h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          The link may be old or mistyped. Here are the pages people usually come for.
        </p>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-2xl border border-slate-200 p-5 transition-colors hover:border-brand/40 hover:bg-slate-50"
              >
                <span className="block font-black text-slate-900">{link.label}</span>
                <span className="mt-1 block text-sm text-slate-500">{link.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
