"use client";

import { ReactNode } from "react";
import { CheckCircle2, LucideIcon } from "lucide-react";

/**
 * One feature on a module page: words on one side, a real app screenshot on
 * the other.
 *
 * Polished 2026-10-07. The label was "02. UPC SCANNER" in tracked capitals on
 * a solid accent tile, the house style Stefano called AI slop on 2026-10-04,
 * and the numbers encoded nothing (the sections are not steps). It is now a
 * sentence-case label beside a quiet tile. The section no longer fades in
 * from opacity 0: it is visible on first paint, with or without scripts.
 */
interface FeatureSectionProps {
  id: string;
  /** Kept so existing call sites compile; not shown. */
  number?: string;
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  description: string;
  bullets?: string[];
  /** Full Tailwind text-color class for this page's brand accent, e.g. "text-blue-600" */
  accentText: string;
  /** Kept so existing call sites compile; the tile is neutral now. */
  accentBg?: string;
  image: { url: string; alt: string };
  imageSide: "left" | "right";
  cta: ReactNode;
}

export default function FeatureSection({
  id,
  eyebrow,
  icon: Icon,
  title,
  description,
  bullets,
  accentText,
  image,
  imageSide,
  cta,
}: FeatureSectionProps) {
  const imageFirst = imageSide === "left";

  return (
    <section
      id={id}
      className="relative grid lg:grid-cols-2 gap-12 lg:gap-16 items-center scroll-mt-28"
    >
      <div className={imageFirst ? "lg:order-2" : "lg:order-1"}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center shrink-0">
            <Icon size={16} className={accentText} strokeWidth={2} aria-hidden="true" />
          </div>
          <div className="text-sm font-semibold text-slate-600">{eyebrow}</div>
        </div>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-5 tracking-tight leading-tight [text-wrap:balance]">
          {title}
        </h2>
        <p className="text-lg text-slate-600 mb-8 leading-relaxed">{description}</p>
        {bullets && (
          <div className="space-y-4 mb-8">
            {bullets.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <CheckCircle2 size={20} className={`${accentText} shrink-0 mt-0.5`} />
                <span className="font-medium text-slate-700 text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        )}
        {cta}
      </div>
      <div
        data-feature-image
        className={`rounded-2xl overflow-hidden border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] bg-white ${
          imageFirst ? "lg:order-1" : "lg:order-2"
        }`}
      >
        <img src={image.url} alt={image.alt} loading="lazy" decoding="async" className="w-full h-auto block" />
      </div>
    </section>
  );
}
