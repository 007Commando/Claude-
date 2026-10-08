import Link from "next/link";
import type { ReactNode } from "react";

import { Band, Heading, MoreLink, ProductFrame, TrialButton, TrialNote } from "./ui";
import { MODULE_CONTENT, type ModuleContent } from "./modules";
import { isBeta } from "../../config/features";
import { MODULE_FACTS, moduleByKey, type ModuleKey } from "../../config/product";

import bullBlack from "../../assets/bull-black.png.asset.json";
import bullBlue from "../../assets/bull-blue.png.asset.json";
import bullGold from "../../assets/bull-gold.png.asset.json";
import bullGreen from "../../assets/bull-green.png.asset.json";
import bullRed from "../../assets/bull-red.png.asset.json";

/**
 * A module page, design v2 (October 2026).
 *
 * Every module opens the same way: its name beside its bull, one line with
 * power, the real product in a window, then the proof. The facts block at the
 * bottom reads MODULE_FACTS, so these pages still cannot disagree with the
 * pricing table, however the top of the page is worded.
 */

const BULL: Record<ModuleKey, string> = {
  black: bullBlack.url, blue: bullBlue.url, gold: bullGold.url, green: bullGreen.url, red: bullRed.url,
};

/** The module's own colour, for its name and its sub-nav mark only. */
const ACCENT: Record<ModuleKey, string> = {
  green: "text-mod-green", blue: "text-mod-blue", gold: "text-mod-gold", red: "text-mod-red", black: "text-ink",
};

function PrimaryCta({ c, cta, tone = "light", size = "lg" }: { c: ModuleContent; cta: string; tone?: "light" | "dark"; size?: "sm" | "md" | "lg" }) {
  return <TrialButton tone={tone} size={size} cta={cta} label={c.cta.label} href={c.cta.href} />;
}

function Note({ c, tone = "light" }: { c: ModuleContent; tone?: "light" | "dark" }) {
  if (c.cta.note) {
    return <p className={`mt-4 text-[13px] leading-relaxed ${tone === "light" ? "text-quiet" : "text-white/60"}`}>{c.cta.note}</p>;
  }
  return <TrialNote tone={tone} plan={c.cta.plan} />;
}

function Spec({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-hairline pt-6">
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      <div className="mt-3 text-[15px] leading-relaxed text-quiet">{children}</div>
    </div>
  );
}

export default function ModulePage({ module }: { module: ModuleKey }) {
  const m = moduleByKey(module);
  const f = MODULE_FACTS[module];
  const c = MODULE_CONTENT[module];
  const beta = isBeta(module);

  return (
    <div className="bg-white pt-20 text-graphite">
      {/* Module bar: the name, and the one action, always in reach. */}
      <div className="sticky top-20 z-30 border-b border-hairline/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[1100px] items-center justify-between px-4 sm:px-6">
          <p className="flex items-center gap-2 text-[17px] font-semibold text-ink">
            <img src={BULL[module]} alt="" className="h-5 w-auto" />
            {m.name}
            {beta && <span className="text-[13px] font-medium text-quiet">{module === "red" ? "Beta, by invitation" : "Beta"}</span>}
          </p>
          <PrimaryCta c={c} cta={`v2-${module}-bar`} size="sm" />
        </div>
      </div>

      {/* Hero */}
      <section className="px-4 pb-20 pt-16 sm:px-6 md:pt-24">
        <div className="mx-auto max-w-[1100px] text-center">
          <h1 className={`text-[17px] font-semibold sm:text-[19px] ${ACCENT[module]}`}>
            {m.name}: {m.label}
          </h1>
          <p className="type-display mx-auto mt-3 max-w-[900px] text-[48px] text-ink sm:text-[72px] lg:text-[84px]">{c.display}</p>
          <p className="mx-auto mt-6 max-w-[660px] text-[19px] leading-relaxed text-quiet sm:text-[22px]">{c.intro}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
            <PrimaryCta c={c} cta={`v2-${module}-hero`} />
            <MoreLink href="/pricing">See plans</MoreLink>
          </div>
          <Note c={c} />
        </div>
        <div className="mx-auto mt-16 max-w-[1200px]">
          {c.hero.kind === "image" ? (
            <ProductFrame src={c.hero.src} alt={c.hero.alt} priority />
          ) : (
            c.hero.node
          )}
        </div>
      </section>

      {/* Highlights: three statements, large. */}
      <Band tone="ink">
        <Heading tone="dark" title={c.highlightsTitle} />
        <dl className="mt-16 grid gap-12 sm:grid-cols-3">
          {c.highlights.map((h) => (
            <div key={h.big}>
              <dt className="type-display text-[40px] text-white sm:text-[48px]">{h.big}</dt>
              <dd className="mt-3 text-[17px] leading-relaxed text-white/60">{h.small}</dd>
            </div>
          ))}
        </dl>
      </Band>

      {/* What it does, one screen at a time. */}
      {c.rows.map((row, i) => (
        <Band key={row.title} tone={i % 2 ? "white" : "mist"} id={row.id}>
          <div className="text-center">
            <p className="text-[17px] font-semibold text-quiet">{row.label}</p>
            <h2 className="type-display mx-auto mt-3 max-w-[820px] text-[36px] text-ink sm:text-[52px]">{row.title}</h2>
            <p className="mx-auto mt-5 max-w-[640px] text-[19px] leading-relaxed text-quiet">{row.body}</p>
          </div>
          {row.points && (
            <ul className="mx-auto mt-10 grid max-w-[900px] gap-x-10 gap-y-4 text-[17px] text-graphite sm:grid-cols-2">
              {row.points.map((p) => (
                <li key={p} className="border-t border-hairline pt-4">{p}</li>
              ))}
            </ul>
          )}
          {row.src && <ProductFrame src={row.src} alt={row.alt ?? row.title} className="mt-14" />}
          {row.node && <div className="mt-14">{row.node}</div>}
        </Band>
      ))}

      {/* The facts, Apple-spec style. */}
      <Band tone="white" id="at-a-glance">
        <Heading label="At a glance" title={`${m.name}, in plain terms.`} sub={f.problem} />
        <div className="mt-16 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          <Spec title="Who it is for">{f.forWho}</Spec>
          <Spec title="What you need">
            <ul className="space-y-1.5">{f.needs.map((n) => <li key={n}>{n}</li>)}</ul>
          </Spec>
          <Spec title="What you get">{f.gets}</Spec>
          <Spec title="How it works">
            <ol className="list-decimal space-y-1.5 pl-5">{f.steps.map((s) => <li key={s}>{s}</li>)}</ol>
          </Spec>
          {f.syncedVsEntered && (
            <Spec title="From Amazon, and from you">
              <p><span className="font-medium text-graphite">Synced:</span> {f.syncedVsEntered.synced}</p>
              <p className="mt-2"><span className="font-medium text-graphite">You add:</span> {f.syncedVsEntered.entered}</p>
            </Spec>
          )}
          <Spec title="Plans">
            <ul className="space-y-1.5">{f.plans.map((p) => <li key={p}>{p}</li>)}</ul>
            <div className="mt-3"><MoreLink href="/pricing">Compare plans</MoreLink></div>
          </Spec>
          <Spec title="Good to know">
            <ul className="space-y-1.5">{f.limits.map((l) => <li key={l}>{l}</li>)}</ul>
          </Spec>
          <Spec title="With ChatGPT or Claude">
            {f.ai ? (
              <>
                <p className="text-graphite">&ldquo;{f.ai.ask}&rdquo;</p>
                <p className="mt-2">{f.ai.note}</p>
                <div className="mt-3"><MoreLink href="/ai">AI integrations</MoreLink></div>
              </>
            ) : (
              <p>Assistants cannot read or act on this module yet.</p>
            )}
          </Spec>
        </div>
        <nav aria-label={`Related to ${m.label}`} className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-hairline pt-8">
          {f.related.map((r) => (
            <Link key={r.href} href={r.href} className="text-[15px] font-medium text-link underline-offset-4 hover:underline">
              {r.label}
            </Link>
          ))}
        </nav>
      </Band>

      {/* Close */}
      <section className="bg-mist px-4 py-28 text-center sm:px-6 md:py-36">
        <img src={BULL[module]} alt="" className="mx-auto h-12 w-auto mix-blend-multiply" />
        <p className="type-display mx-auto mt-8 max-w-[860px] text-[40px] text-ink sm:text-[60px]">{c.close}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
          <PrimaryCta c={c} cta={`v2-${module}-close`} />
          <MoreLink href="/pricing">See plans</MoreLink>
        </div>
        <Note c={c} />
      </section>
    </div>
  );
}
