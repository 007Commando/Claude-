import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { COMPANY, MODULES } from "../../config/product";
import { pageMetadata } from "../../lib/seo";

/**
 * About Apex: a DRAFT, switched off.
 *
 * Written 2026-10-07 from what is already public on the site and in the
 * product. It stays a 404 until Stefano confirms the lines marked CONFIRM
 * below: his own background, the company's founding year and location, and
 * whether PrimeWell is mentioned. Nothing here may be published on a guess,
 * so the page ships off rather than ships approximate.
 *
 * To publish: fill the CONFIRM lines, set ABOUT_READY to true, add "/about"
 * to the sitemap and a footer link.
 */
const ABOUT_READY = false;

export const metadata: Metadata = pageMetadata({
  title: "About Apex Applications | Amazon Wholesale Software",
  description:
    "Who runs Apex Applications, why it was built, and who it is for: Amazon sellers who buy from wholesale suppliers and want one place for sourcing, purchasing and profit.",
  path: "/about",
  extra: ABOUT_READY ? undefined : { robots: { index: false, follow: false } },
});

export default function Page() {
  if (!ABOUT_READY) notFound();

  return (
    <div className="bg-white pt-28 md:pt-32">
      <article className="mx-auto max-w-3xl px-6 pb-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand">About Apex</p>
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 [text-wrap:balance] md:text-5xl">
          Software built by people who buy from wholesale suppliers
        </h1>

        <div className="space-y-5 text-lg leading-relaxed text-slate-600">
          <p>
            Apex Applications makes software for Amazon sellers who buy existing brands from wholesale suppliers and
            resell them. It is run by its founder, Stefano {/* CONFIRM: surname to print */}, and a small team
            {/* CONFIRM: team size or roles, e.g. support and virtual assistants */}.
          </p>
          <p>
            {/* CONFIRM: Stefano's own selling history in one or two sentences: when he started on Amazon, what model,
                and roughly what scale, in words he is happy to have quoted. */}
            [Founder background to confirm.]
          </p>
          <h2 className="pt-4 text-2xl font-bold text-slate-900">Why Apex exists</h2>
          <p>
            Apex started as software for prep centers and warehouses, the businesses that receive a seller&rsquo;s
            stock and send it on to Amazon. Working with their sellers showed the same problem again and again: the
            supplier price list lived in one spreadsheet, the purchase order in another, profit in a third tool and
            restocking in somebody&rsquo;s head. Apex grew into one place for all of it, sharing one set of products,
            suppliers and costs.
          </p>
          <h2 className="pt-4 text-2xl font-bold text-slate-900">What it does today</h2>
          <ul className="list-disc space-y-2 pl-6">
            {MODULES.map((m) => (
              <li key={m.key}>
                <Link href={m.path} className="font-semibold text-slate-900 hover:text-brand">{m.label}</Link> ({m.name}
                {m.status === "beta" ? ", in beta" : ""}): {m.summary}
              </li>
            ))}
            <li>
              <Link href="/ai" className="font-semibold text-slate-900 hover:text-brand">AI integrations</Link>: connect
              ChatGPT or Claude to your own Apex data.
            </li>
          </ul>
          <h2 className="pt-4 text-2xl font-bold text-slate-900">Who it is for, and who it is not</h2>
          <p>
            Apex fits sellers working through supplier price lists, placing purchase orders and restocking what sells,
            from a first supplier to a team running several. It is not built for private label keyword research, PPC
            management or retail arbitrage scanning in stores.
          </p>
          <h2 className="pt-4 text-2xl font-bold text-slate-900">Contact</h2>
          <p>
            Email <a href={`mailto:${COMPANY.supportEmail}`} className="font-semibold text-brand hover:underline">{COMPANY.supportEmail}</a>{" "}
            or use the <Link href="/contact-us" className="font-semibold text-brand hover:underline">contact page</Link>.{" "}
            {/* CONFIRM: registered business name and location to print, if any. */}
          </p>
          <p>
            Elsewhere:{" "}
            <a href={COMPANY.sameAs[0]} className="font-semibold text-brand hover:underline" rel="noopener" target="_blank">Trustpilot</a>
            {" · "}
            <a href={COMPANY.sameAs[1]} className="font-semibold text-brand hover:underline" rel="noopener" target="_blank">Apex for Chrome on the Chrome Web Store</a>
          </p>
        </div>
      </article>
    </div>
  );
}
