import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import CheckoutLink from "../CheckoutLink";
import { TRIAL_CHECKOUT_URL, trialCta, trialTerms } from "../../config/offer";

/**
 * Design v2 building blocks (October 2026).
 *
 * The brief, in Stefano's words: "a sleek Apple-like finish, like our
 * applications just came out of a Tesla factory". So: ink and paper, big tight
 * type, real product screenshots in quiet window frames, one black pill per
 * section and blue text links for everything secondary. No glows, gradients
 * or uppercase pill eyebrows (rejected 2026-10-04 as "AI slop").
 */

type Tone = "light" | "dark";

/**
 * The one primary action: a black pill on light, a white pill on dark.
 *
 * The label stays "Start my 7-day trial": the Google Ads build (build_v2.py
 * --check-live) requires that text on every paid landing page.
 */
export function TrialButton({
  tone = "light",
  cta,
  label = trialCta,
  href,
  size = "md",
}: {
  tone?: Tone;
  cta: string;
  label?: string;
  /** Leave empty for the card-first Starter trial; pass a path for other plans. */
  href?: string;
  size?: "sm" | "md" | "lg";
}) {
  const cls = `inline-flex items-center justify-center rounded-full font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${
    size === "lg" ? "px-8 py-4 text-[17px]" : size === "sm" ? "px-4 py-1.5 text-[13px]" : "px-6 py-3 text-[15px]"
  } ${
    tone === "light"
      ? "bg-ink text-white hover:bg-graphite focus-visible:outline-ink"
      : "bg-white text-ink hover:bg-mist focus-visible:outline-white"
  }`;
  if (href) {
    return (
      <Link href={href} className={cls} data-cta={cta}>
        {label}
      </Link>
    );
  }
  return (
    <CheckoutLink href={TRIAL_CHECKOUT_URL} className={cls}>
      <span data-cta={cta}>{label}</span>
    </CheckoutLink>
  );
}

/** "Learn more >", Apple's secondary action. */
export function MoreLink({ href, children, tone = "light" }: { href: string; children: ReactNode; tone?: Tone }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-0.5 text-[17px] font-medium hover:underline underline-offset-4 ${
        tone === "light" ? "text-link" : "text-[#2997ff]"
      }`}
    >
      {children}
      <ChevronRight size={18} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

/** Small print under a trial button, always the real terms. */
export function TrialNote({ tone = "light", plan = "starter" }: { tone?: Tone; plan?: "starter" | "pro" }) {
  return (
    <p className={`mt-4 text-[13px] leading-relaxed ${tone === "light" ? "text-quiet" : "text-white/60"}`}>
      {trialTerms(plan)}
    </p>
  );
}

/** A real screenshot of the app in a quiet window frame. */
export function ProductFrame({
  src,
  alt,
  tone = "light",
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  tone?: Tone;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={`overflow-hidden rounded-[22px] ${
        tone === "light"
          ? "border border-hairline bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04),0_30px_60px_-30px_rgba(0,0,0,0.25)]"
          : "border border-white/10 bg-graphite shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
      } ${className}`}
    >
      <div className={`flex items-center gap-1.5 px-4 py-3 ${tone === "light" ? "border-b border-hairline/70 bg-mist/60" : "border-b border-white/10"}`} aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </div>
      <img
        src={src}
        alt={alt}
        className="block h-auto w-full"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        {...(priority ? { fetchPriority: "high" as const } : {})}
      />
    </figure>
  );
}

/** A full-width band. */
export function Band({
  tone = "white",
  children,
  className = "",
  id,
}: {
  tone?: "white" | "mist" | "ink";
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const bg = tone === "ink" ? "bg-ink text-white" : tone === "mist" ? "bg-mist text-graphite" : "bg-white text-graphite";
  return (
    <section id={id} className={`${bg} scroll-mt-24 px-4 py-24 sm:px-6 md:py-32 ${className}`}>
      <div className="mx-auto max-w-[1100px]">{children}</div>
    </section>
  );
}

/** Section heading pair: a small label and a large line. */
export function Heading({
  label,
  title,
  sub,
  tone = "light",
  align = "center",
  as: As = "h2",
}: {
  label?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  tone?: Tone;
  align?: "center" | "left";
  as?: "h1" | "h2";
}) {
  const center = align === "center";
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-[820px]`}>
      {label && <p className={`mb-3 text-[17px] font-semibold ${tone === "light" ? "text-quiet" : "text-white/60"}`}>{label}</p>}
      <As className={`type-display text-[40px] sm:text-[56px] ${tone === "light" ? "text-ink" : "text-white"}`}>{title}</As>
      {sub && (
        <p className={`mt-5 text-[19px] leading-relaxed sm:text-[21px] ${tone === "light" ? "text-quiet" : "text-white/70"} ${center ? "mx-auto max-w-[680px]" : "max-w-[620px]"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}
