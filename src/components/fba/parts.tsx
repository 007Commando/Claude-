"use client";

import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

export const money = (value: number | null, digits = 2): string =>
  value === null || !Number.isFinite(value)
    ? "n/a"
    : `${value < 0 ? "-" : ""}$${Math.abs(value).toLocaleString("en-US", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })}`;

export const percent = (value: number | null, digits = 0): string =>
  value === null || !Number.isFinite(value) ? "n/a" : `${(value * 100).toFixed(digits)}%`;

export const whole = (value: number | null): string =>
  value === null || !Number.isFinite(value) ? "n/a" : Math.round(value).toLocaleString("en-US");

/**
 * A figure that counts up to its value, and from the old value to a new one
 * when it changes, so editing a cost visibly moves the profit instead of
 * swapping a number. The final value is in the markup from the start, so
 * search engines and anyone with reduced motion see the real figure.
 */
export function AnimatedNumber({
  value,
  format,
  className,
  duration = 0.9,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(reduce ? value : 0);
  const formatRef = useRef(format);
  formatRef.current = format;

  useEffect(() => {
    if (reduce) {
      if (ref.current) ref.current.textContent = formatRef.current(value);
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = formatRef.current(latest);
      },
    });
    return () => controls.stop();
  }, [value, duration, reduce, motionValue]);

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {format(value)}
    </span>
  );
}

export function Panel({
  title,
  eyebrow,
  children,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.08)] ${className}`}
    >
      {eyebrow && (
        <p className="mb-1 text-[11px] font-black uppercase tracking-[0.16em] text-blue-600">{eyebrow}</p>
      )}
      <h3 className="mb-5 text-lg font-black tracking-tight text-slate-900">{title}</h3>
      {children}
    </motion.section>
  );
}

export function Chip({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "green" | "red" | "amber" | "blue";
}) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-800",
    blue: "bg-blue-50 text-blue-700",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-black ${tones[tone]}`}>
      {children}
    </span>
  );
}
