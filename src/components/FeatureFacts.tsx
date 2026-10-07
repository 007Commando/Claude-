import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { isBeta } from "../config/features";
import { MODULE_FACTS, moduleByKey, type ModuleKey } from "../config/product";

/**
 * The plain-language block every feature page carries, under its hero.
 *
 * The feature pages were written as showcases: big claims, concept art, a
 * button. What a buyer actually checks before a trial (what problem it
 * solves, what it needs from me, what comes out, which plan, what it does not
 * do) was missing or scattered, and in places contradicted the pricing page.
 * This reads all of it from MODULE_FACTS in config/product.ts, so the five
 * pages answer the same questions in the same place and cannot disagree with
 * the plan table.
 *
 * No hooks and no motion: it renders identically on the server and in the
 * client components that host it, and it is fully visible before any script.
 */
export default function FeatureFacts({ module }: { module: ModuleKey }) {
  const m = moduleByKey(module);
  const f = MODULE_FACTS[module];
  const beta = isBeta(module);

  return (
    <section aria-labelledby={`${module}-facts`} className="border-y border-slate-200 bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            {m.name}{beta ? " · Beta" : ""}
          </p>
          <h2 id={`${module}-facts`} className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 [text-wrap:balance]">
            {m.label}: at a glance
          </h2>
          <p className="text-lg leading-relaxed text-slate-600">{f.problem}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">Who it is for</h3>
            <p className="mb-5 text-slate-700">{f.forWho}</p>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">What you need</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-slate-700">
              {f.needs.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">How it works</h3>
            <ol className="list-decimal space-y-1.5 pl-5 text-slate-700">
              {f.steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">What you get</h3>
            <p className="text-slate-700">{f.gets}</p>
            {f.syncedVsEntered && (
              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="font-bold text-slate-900">From Amazon, automatically</dt>
                  <dd className="text-slate-600">{f.syncedVsEntered.synced}</dd>
                </div>
                <div>
                  <dt className="font-bold text-slate-900">From you</dt>
                  <dd className="text-slate-600">{f.syncedVsEntered.entered}</dd>
                </div>
              </dl>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">Plans</h3>
            <ul className="space-y-1.5 text-slate-700">
              {f.plans.map((p) => <li key={p}>{p}</li>)}
            </ul>
            <Link href="/pricing" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:underline">
              Compare plans <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">Good to know</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-slate-700">
              {f.limits.map((l) => <li key={l}>{l}</li>)}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">With ChatGPT or Claude</h3>
            {f.ai ? (
              <>
                <p className="mb-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800">&ldquo;{f.ai.ask}&rdquo;</p>
                <p className="text-sm text-slate-600">{f.ai.note}</p>
                <Link href="/ai" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:underline">
                  AI integrations <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </>
            ) : (
              <p className="text-sm text-slate-600">Assistants cannot read or act on this module yet.</p>
            )}
          </div>
        </div>

        <nav aria-label={`Related to ${m.label}`} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <span className="font-semibold text-slate-500">Related:</span>
          {f.related.map((r) => (
            <Link key={r.href} href={r.href} className="font-semibold text-slate-900 underline-offset-4 hover:underline">
              {r.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
