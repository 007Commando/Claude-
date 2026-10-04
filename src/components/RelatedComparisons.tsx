import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COMPARISONS } from "../data/comparisons";
import { HAND_BUILT } from "../data/compareIndexCards";

/**
 * "How this module compares", under a feature page.
 *
 * The comparison pages linked to the feature pages, but nothing linked back,
 * and eleven of them were reachable only from the /compare index (Search
 * Console listed most as discovered but not indexed). Each feature page now
 * links the comparisons that are about its job.
 */
const ALL = [
  ...HAND_BUILT.map((c) => ({ href: c.href, rival: c.rival, category: c.category })),
  ...COMPARISONS.map((c) => ({ href: `/compare/${c.slug}`, rival: c.rival, category: c.category })),
];

export default function RelatedComparisons({ module, slugs }: { module: string; slugs: string[] }) {
  const items = slugs
    .map((slug) => ALL.find((c) => c.href === `/compare/${slug}`))
    .filter((c): c is (typeof ALL)[number] => Boolean(c));
  if (!items.length) return null;
  return (
    <section className="bg-white px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 p-8">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">How {module} compares</h2>
        <p className="mt-2 text-sm text-slate-500">
          Side-by-side with the tools sellers usually weigh it against, including where they are the better choice.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3 transition-colors hover:border-blue-300 hover:bg-slate-50"
              >
                <span>
                  <span className="block text-sm font-black text-slate-900">Apex vs {c.rival}</span>
                  <span className="block text-xs text-slate-500">{c.category}</span>
                </span>
                <ArrowRight size={15} className="shrink-0 text-slate-300" />
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/amazon-wholesale-software" className="mt-6 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:gap-3 transition-all">
          What Amazon wholesale software needs to do <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
