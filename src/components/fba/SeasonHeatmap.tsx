"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { LEVEL_NAMES, nextPeak, seasonYear, type SeasonDay } from "../../lib/fba/seasonality";
import { Panel, whole } from "./parts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Light to dark Apex blue: the darker the square, the faster the sales. */
const SHADES = ["#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8", "#0f1f5c"];

const GAP = 3;

const readDate = (day: SeasonDay) => `${WEEKDAYS[day.weekday]}, ${MONTHS[day.month]} ${day.day}`;

/** Short enough to sit under a month name: #2,318, then 12.3k, then 123k. */
const compactRank = (rank: number) =>
  rank < 10_000 ? `#${whole(rank)}` : rank < 100_000 ? `#${(rank / 1000).toFixed(1)}k` : `#${Math.round(rank / 1000)}k`;

interface Hover {
  day: SeasonDay;
  /** Position of the square inside the chart, in pixels. */
  left: number;
  top: number;
  size: number;
  column: number;
  row: number;
}

export default function SeasonHeatmap({ category, rank }: { category: string | null; rank: number | null }) {
  // The calendar is built on the visitor's own clock, so "today" is theirs.
  const calendar = useMemo(() => seasonYear(category, new Date(), rank), [category, rank]);
  const [hover, setHover] = useState<Hover | null>(null);

  const today = calendar.days[calendar.todayIndex];
  const peak = nextPeak(calendar);
  const shown = hover?.day ?? today;
  const hasRank = today.rank !== null;

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
        .season-cell { animation: season-pop 0.55s cubic-bezier(0.16, 1, 0.3, 1) backwards; transition: transform 0.12s ease; }
        .season-cell:hover { transform: scale(1.35); position: relative; z-index: 2; }
        @media (prefers-reduced-motion: reduce) { .season-cell { animation: none; } }
      `}</style>

      <p className="-mt-2 mb-5 max-w-2xl text-sm leading-relaxed text-slate-500">
        Every square is one day of {calendar.year}. The darker the square, the faster sales tend to run, which is when sales rank
        drops lowest.{" "}
        {hasRank && "Hover a square for its projected rank, and read each month's average rank under its name. "}The red line is today,
        so you can see what is coming.
      </p>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[680px]">
          <div className="grid grid-cols-[2rem_1fr] gap-x-2">
            <div />
            {/* Month names and average rank sit over the column each month starts in. */}
            <div className={`relative mb-2 ${hasRank ? "h-9" : "h-4"}`}>
              {calendar.monthColumns.map((column, month) => (
                <span
                  key={MONTHS[month]}
                  className="absolute flex flex-col leading-tight"
                  style={{ left: `${(column / calendar.columns) * 100}%` }}
                >
                  <span className="text-[11px] font-bold text-slate-400">{MONTHS[month]}</span>
                  {hasRank && calendar.monthRanks[month] !== null && (
                    <span className="text-[10px] font-black tabular-nums text-slate-700">{compactRank(calendar.monthRanks[month] as number)}</span>
                  )}
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
                {slots.map((day, index) => {
                  if (!day) return <div key={`blank-${index}`} aria-hidden />;
                  const select = (el: HTMLElement) =>
                    setHover({
                      day,
                      left: el.offsetLeft,
                      top: el.offsetTop,
                      size: el.offsetWidth,
                      column: Math.floor(index / 7),
                      row: index % 7,
                    });
                  return (
                    <div
                      key={day.time}
                      className="season-cell rounded-[4px]"
                      onMouseEnter={(event) => select(event.currentTarget)}
                      onClick={(event) => select(event.currentTarget)}
                      style={{
                        aspectRatio: "1 / 1",
                        background: SHADES[day.level],
                        animationDelay: `${Math.floor(index / 7) * 14}ms`,
                        cursor: "default",
                        outline: day.time === today.time ? "2px solid #ef4444" : undefined,
                        outlineOffset: 1,
                      }}
                    />
                  );
                })}
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

              {/* Hover card: opens below the top rows so it is never clipped, above the rest. */}
              {hover && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute z-10 whitespace-nowrap rounded-xl bg-slate-950 px-3 py-2 text-xs text-white shadow-xl"
                  style={{
                    left: hover.left + hover.size / 2,
                    top: hover.row < 3 ? hover.top + hover.size + 8 : hover.top - 8,
                    transform: `translate(${hover.column < 6 ? "-12%" : hover.column > calendar.columns - 7 ? "-88%" : "-50%"}, ${
                      hover.row < 3 ? "0" : "-100%"
                    })`,
                  }}
                >
                  <div className="font-black">{readDate(hover.day)}</div>
                  {hover.day.rank !== null && (
                    <div className="mt-0.5 text-sm font-black tabular-nums text-cyan-300">Rank #{whole(hover.day.rank)}</div>
                  )}
                  <div className="mt-0.5 text-slate-300">
                    {hover.day.label} / {LEVEL_NAMES[hover.day.level]} sales
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p className="min-h-5 text-sm text-slate-600" aria-live="polite">
          <b className="font-black text-slate-900">{readDate(shown)}</b>
          {shown.rank !== null && (
            <>
              <span className="mx-2 text-slate-300">/</span>
              <b className="font-black tabular-nums text-slate-900">Rank #{whole(shown.rank)}</b>
            </>
          )}
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
            The next fastest stretch is <b className="text-slate-900">{peak.label}</b>, {peak.daysAway} days away. Stock takes weeks to ship
            and check in, so send it well before the red line reaches it.
          </>
        ) : (
          <>The fastest stretch of the year has passed, so plan ahead for the next one.</>
        )}{" "}
        <span className="text-slate-400">
          {hasRank
            ? `Ranks are projected from this product's recent rank and the typical shopping seasons for ${category ?? "this category"}. They are not recorded history.`
            : `Modelled from typical shopping seasons for ${category ?? "this category"}, not this product's own daily history.`}
        </span>
      </p>
    </Panel>
  );
}
