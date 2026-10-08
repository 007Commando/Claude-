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
    <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="type-display text-[32px] text-ink sm:text-[40px]">How {module} compares</h2>
        <p className="mt-3 text-[17px] text-quiet">
          Side-by-side with the tools sellers usually weigh it against, including where they are the better choice.
        </p>
        <ul className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                className="group flex items-center justify-between gap-3 border-t border-hairline py-4"
              >
                <span>
                  <span className="block text-[17px] font-medium text-ink group-hover:text-link">Apex vs {c.rival}</span>
                  <span className="block text-[13px] text-quiet">{c.category}</span>
                </span>
                <ArrowRight size={15} className="shrink-0 text-hairline group-hover:text-link" />
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/amazon-wholesale-software" className="mt-8 inline-flex items-center gap-1.5 text-[17px] font-medium text-link hover:underline underline-offset-4">
          What Amazon wholesale software needs to do <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
