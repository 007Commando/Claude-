"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { LEVEL_NAMES, nextPeak, seasonYear, type SeasonDay } from "../../lib/fba/seasonality";
import { Panel } from "./parts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Light to dark Apex blue: the darker the square, the faster the sales. */
const SHADES = ["#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8", "#0f1f5c"];

const GAP = 3;

const readDate = (day: SeasonDay) => `${WEEKDAYS[day.weekday]}, ${MONTHS[day.month]} ${day.day}`;

export default function SeasonHeatmap({ category }: { category: string | null }) {
  // The calendar is built on the visitor's own clock, so "today" is theirs.
  const calendar = useMemo(() => seasonYear(category, new Date()), [category]);
  const [hover, setHover] = useState<SeasonDay | null>(null);

  const today = calendar.days[calendar.todayIndex];
  const peak = nextPeak(calendar);
  const shown = hover ?? today;

  // One slot per weekday row, so the grid can fill column by column.
  const slots = useMemo(() => {
    const out: (SeasonDay | null)[] = Array(calendar.offset).fill(null);
    calendar.days.forEach((day) => out.push(day));
    return out;
  }, [calendar]);

  const todayColumn = Math.floor((calendar.offset + calendar.todayIndex) / 7);
  const linePercent = ((todayColumn + 0.5) / calendar.columns) * 100;

  return (
    <Panel eyebrow="Seasonality" title="When this kind of product sells fastest">
      <style>{`
        @keyframes season-pop { from { opacity: 0; transform: scale(0.35); } to { opacity: 1; transform: scale(1); } }
        .season-cell { animation: season-pop 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) { .season-cell { animation: none; } }
      `}</style>

      <p className="-mt-2 mb-5 max-w-2xl text-sm leading-relaxed text-slate-500">
        Every square is one day of {calendar.year}. The darker the square, the faster sales tend to run, which is when sales rank
        drops lowest. The red line is today, so you can see what is coming.
      </p>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[680px]">
          <div className="grid grid-cols-[2rem_1fr] gap-x-2">
            <div />
            {/* Month labels sit over the column each month starts in. */}
            <div className="relative mb-2 h-4 text-[11px] font-bold text-slate-400">
              {calendar.monthColumns.map((column, month) => (
                <span key={MONTHS[month]} className="absolute" style={{ left: `${(column / calendar.columns) * 100}%` }}>
                  {MONTHS[month]}
                </span>
              ))}
            </div>

            <div className="grid grid-rows-7 text-[10px] font-bold text-slate-300" style={{ rowGap: GAP }}>
              {WEEKDAYS.map((name, index) => (
                <span key={name} className="flex items-center" style={{ visibility: index % 2 === 1 ? "visible" : "hidden" }}>
                  {name}
                </span>
              ))}
            </div>

            <div
              className="relative"
              role="img"
              aria-label={`Sales temperature by day for ${calendar.year}. Today is in ${today.label}, a ${LEVEL_NAMES[today.level].toLowerCase()} stretch.`}
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${calendar.columns}, minmax(0, 1fr))`,
                  gridTemplateRows: "repeat(7, auto)",
                  gridAutoFlow: "column",
                  gap: GAP,
                }}
                onMouseLeave={() => setHover(null)}
              >
                {slots.map((day, index) =>
                  day ? (
                    <div
                      key={day.time}
                      className="season-cell rounded-[4px]"
                      onMouseEnter={() => setHover(day)}
                      onClick={() => setHover(day)}
                      style={{
                        aspectRatio: "1 / 1",
                        background: SHADES[day.level],
                        animationDelay: `${Math.floor(index / 7) * 14}ms`,
                        cursor: "default",
                        outline: day.time === today.time ? "2px solid #ef4444" : undefined,
                        outlineOffset: 1,
                      }}
                    />
                  ) : (
                    <div key={`blank-${index}`} aria-hidden />
                  ),
                )}
              </div>

              {/* Today */}
              <motion.div
                aria-hidden
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ left: `${linePercent}%`, originY: 0 }}
                className="pointer-events-none absolute -top-1 bottom-[-4px] w-0.5 -translate-x-1/2 rounded-full bg-red-500 shadow-[0_0_0_1.5px_rgba(255,255,255,0.9),0_0_14px_rgba(239,68,68,0.55)]"
              >
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  Today
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p className="min-h-5 text-sm text-slate-600" aria-live="polite">
          <b className="font-black text-slate-900">{readDate(shown)}</b>
          <span className="mx-2 text-slate-300">/</span>
          {shown.label}
          <span className="mx-2 text-slate-300">/</span>
          <span className="font-bold">{LEVEL_NAMES[shown.level]} sales</span>
        </p>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          Slower
          {SHADES.map((shade) => (
            <span key={shade} className="h-3.5 w-3.5 rounded-[4px]" style={{ background: shade }} />
          ))}
          Faster
        </div>
      </div>

      <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
        Today falls in a <b className="text-slate-900">{LEVEL_NAMES[today.level].toLowerCase()}</b> stretch.{" "}
        {peak ? (
          <>
            The next fastest stretch is <b className="text-slate-900">{peak.label}</b>, {peak.daysAway} days away. Stock takes
            weeks to ship and check in, so send it well before the red line reaches it.
          </>
        ) : (
          <>The fastest stretch of the year has passed, so plan ahead for the next one.</>
        )}{" "}
        <span className="text-slate-400">
          Modelled from typical shopping seasons for {category ?? "this category"}, not this product&apos;s own daily history.
        </span>
      </p>
    </Panel>
  );
}
