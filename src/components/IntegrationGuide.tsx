import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { absoluteUrl } from "../config/site";
import { ORGANIZATION_ID } from "../config/product";

/**
 * The frame for the AI setup guides and the MCP reference.
 *
 * A server component on purpose: these are documentation pages, and every
 * word of them should be in the HTML a crawler or an assistant receives, with
 * no script needed to read it. The pages pass content; this only lays it out,
 * so the Claude and ChatGPT guides look alike while saying different things.
 */

export interface GuideSection {
  id: string;
  title: string;
  body: ReactNode;
}

export default function IntegrationGuide({
  eyebrow,
  h1,
  intro,
  facts,
  sections,
  checked,
  path,
  breadcrumb,
  related,
}: {
  eyebrow: string;
  h1: string;
  intro: ReactNode;
  /** The short answers a reader scans for first: plan, where, time. */
  facts: [string, ReactNode][];
  sections: GuideSection[];
  /** Plain-language note on when and how the instructions were last checked. */
  checked: { date: string; label: string; how: ReactNode };
  path: string;
  breadcrumb: { name: string; path: string }[];
  related: { label: string; href: string }[];
}) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: h1,
      url: absoluteUrl(path),
      dateModified: checked.date,
      publisher: { "@id": ORGANIZATION_ID },
      about: { "@type": "SoftwareApplication", name: "Apex Applications" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumb.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: absoluteUrl(b.path),
      })),
    },
  ];

  return (
    <div className="bg-white text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="border-b border-slate-200 bg-slate-50 pb-12 pt-28 md:pt-32">
        <div className="mx-auto max-w-5xl px-6">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
            <ol className="flex flex-wrap items-center gap-1.5">
              {breadcrumb.map((b, i) => (
                <li key={b.path} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {i < breadcrumb.length - 1 ? (
                    <Link href={b.path} className="hover:text-slate-900 hover:underline">{b.name}</Link>
                  ) : (
                    <span aria-current="page" className="text-slate-700">{b.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>
          <h1 className="mb-5 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight [text-wrap:balance] md:text-[2.75rem]">{h1}</h1>
          <div className="max-w-2xl text-lg leading-relaxed text-slate-600">{intro}</div>
          <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map(([k, v]) => (
              <div key={k} className="bg-white p-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{k}</dt>
                <dd className="mt-1 text-sm font-semibold leading-snug text-slate-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-12 px-6 py-14 lg:grid-cols-[190px_1fr]">
        <nav aria-label="On this page" className="hidden self-start lg:sticky lg:top-28 lg:block">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">On this page</p>
          <ul className="space-y-1 border-l border-slate-200">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-slate-500 hover:border-slate-300 hover:text-slate-900">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 max-w-3xl">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="guide-section scroll-mt-28 border-t border-slate-200 py-10 first:border-t-0 first:pt-0">
              <h2 className="mb-4 text-2xl font-bold tracking-tight text-slate-900">{s.title}</h2>
              <div className="space-y-4 text-[16px] leading-relaxed text-slate-600 [&_a]:font-semibold [&_a]:text-blue-700 [&_a:hover]:underline [&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-slate-100 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:text-[13px] [&_:not(pre)>code]:text-slate-800 [&_strong]:text-slate-900">
                {s.body}
              </div>
            </section>
          ))}

          <aside className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-600">
            <p className="mb-1 font-bold text-slate-900">Last checked {checked.label}</p>
            {checked.how}
          </aside>

          <div className="mt-10">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">Related</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-blue-300 hover:bg-blue-50/40">
                    {r.label} <ArrowRight size={14} className="text-slate-400" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/** A numbered procedure, for the setup steps. */
export function Steps({ items }: { items: { title: string; body: ReactNode }[] }) {
  return (
    <ol className="space-y-3">
      {items.map((it, i) => (
        <li key={it.title} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{i + 1}</span>
          <div className="min-w-0">
            <p className="font-bold text-slate-900">{it.title}</p>
            <div className="text-[15px] leading-relaxed text-slate-600">{it.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Problem and fix pairs. */
export function Troubleshooting({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
      {items.map(([q, a]) => (
        <div key={q} className="px-4 py-4">
          <dt className="font-bold text-slate-900">{q}</dt>
          <dd className="mt-1 text-[15px] leading-relaxed text-slate-600">{a}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A block of code or a URL, readable without a script. */
export function CodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
      {label && <figcaption className="border-b border-white/10 px-4 py-2 text-xs text-slate-400">{label}</figcaption>}
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-sky-100"><code>{children}</code></pre>
    </figure>
  );
}
