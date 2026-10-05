"use client";

import { motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  LEVEL_NAMES,
  extremesAhead,
  nextPeak,
  seasonWindow,
  type SeasonDay,
  type SeasonWindow,
} from "../../lib/fba/seasonality";
import { Panel, whole } from "./parts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY = 86_400_000;

/** Light to dark Apex blue: the darker the square, the faster the sales. */
const SHADES = ["#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8", "#0f1f5c"];

/**
 * Hatching for the year ahead, shared by the chart and its legend swatch. The red line works like a radar
 * sweep: what it has crossed is clear, and what it has not reached yet sits behind the screen.
 */
const AHEAD_SCREEN = "repeating-linear-gradient(135deg, rgba(100,116,139,0.10) 0 5px, transparent 5px 10px)";

const GAP = 2;
/** Narrowest column, in pixels, before the chart scrolls sideways instead of shrinking. */
const MIN_PITCH = 9;
const CARD_WIDTH = 248;
/** Days either side of the hovered day that the card's line covers. */
const SPARK_DAYS = 45;

const fullDate = (time: number) => {
  const d = new Date(time);
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
};

const shortDate = (time: number) => {
  const d = new Date(time);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
};

/** Short enough to sit under a month name. The hover card always shows the full number. */
const compactRank = (rank: number) =>
  rank < 1000
    ? `#${rank}`
    : rank < 10_000
      ? `#${(rank / 1000).toFixed(1)}k`
      : rank < 1_000_000
        ? `#${Math.round(rank / 1000)}k`
        : `#${(rank / 1_000_000).toFixed(1)}M`;

const relative = (days: number) => (days === 0 ? "Today" : days > 0 ? `In ${days} days` : `${-days} days ago`);

/** The same calendar date a year earlier (29 February falls back to the 28th). */
const yearEarlier = (time: number) => {
  const d = new Date(time);
  const year = d.getUTCFullYear() - 1;
  const month = d.getUTCMonth();
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Date.UTC(year, month, Math.min(d.getUTCDate(), last));
};

/** Six weeks either side of a day, this year against the year before. Lower rank sits higher. */
function Spark({ current, prior }: { current: number[]; prior: number[] }) {
  const W = CARD_WIDTH - 28;
  const H = 46;
  const all = [...current, ...prior];
  const lo = Math.min(...all);
  const span = Math.max(...all) - lo || 1;
  const x = (i: number) => (i / (current.length - 1)) * W;
  const y = (rank: number) => 5 + ((rank - lo) / span) * (H - 10);
  const line = (series: number[]) =>
    series.map((rank, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(rank).toFixed(1)}`).join("");
  const mid = (current.length - 1) / 2;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mt-3 block overflow-visible">
      <defs>
        <linearGradient id="season-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#67e8f9" stopOpacity="0.28" />
          <stop offset="1" stopColor="#67e8f9" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={x(mid)} x2={x(mid)} y1={0} y2={H} stroke="rgba(148,163,184,0.35)" strokeDasharray="2 3" />
      <path d={`${line(current)}L${W},${H}L0,${H}Z`} fill="url(#season-spark-fill)" />
      <path d={line(prior)} fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" strokeLinecap="round" />
      <path d={line(current)} fill="none" stroke="#67e8f9" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(mid)} cy={y(prior[mid])} r={2.5} fill="#94a3b8" />
      <circle cx={x(mid)} cy={y(current[mid])} r={4} fill="#67e8f9" stroke="#020617" strokeWidth={2} />
    </svg>
  );
}

interface Hover {
  day: SeasonDay;
  /** Centre of the square and its top edge, relative to the chart wrapper. */
  x: number;
  y: number;
  width: number;
}

function HoverCard({ hover, win, todayTime }: { hover: Hover; win: SeasonWindow; todayTime: number }) {
  const { day } = hover;
  const left = Math.min(Math.max(hover.x - CARD_WIDTH / 2, 0), Math.max(hover.width - CARD_WIDTH, 0));
  const daysAway = Math.round((day.time - todayTime) / DAY);

  const prior = yearEarlier(day.time);
  const priorRank = win.rankOn(prior);
  const current: number[] = [];
  const before: number[] = [];
  if (day.rank !== null && priorRank !== null) {
    // A 7-day average, so the line shows the season rather than the weekday rhythm.
    const smooth = (centre: number) => {
      let sum = 0;
      for (let j = -3; j <= 3; j++) sum += win.rankOn(centre + j * DAY) as number;
      return sum / 7;
    };
    for (let k = -SPARK_DAYS; k <= SPARK_DAYS; k += 3) {
      current.push(smooth(day.time + k * DAY));
      before.push(smooth(prior + k * DAY));
    }
  }
  const change = day.rank !== null && priorRank !== null ? (priorRank - day.rank) / priorRank : null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-20 rounded-2xl bg-slate-950 p-3.5 text-white shadow-[0_20px_50px_-12px_rgba(2,6,23,0.55)] ring-1 ring-white/10"
      style={{ left, top: hover.y - 12, width: CARD_WIDTH, transform: "translateY(-100%)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-black">{fullDate(day.time)}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
            day.past ? "bg-white/10 text-slate-300" : "bg-cyan-400/15 text-cyan-300"
          }`}
        >
          {day.past ? "Past year" : daysAway === 0 ? "Today" : "Year ahead"}
        </span>
      </div>
      <div className="mt-0.5 text-[11px] text-slate-400">
        {relative(daysAway)} / {day.label}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        {day.rank !== null ? (
          <span className="text-2xl font-black tabular-nums tracking-tight text-cyan-300">#{whole(day.rank)}</span>
        ) : (
          <span className="text-lg font-black">{LEVEL_NAMES[day.level]} sales</span>
        )}
        {day.rank !== null && <span className="text-[11px] font-bold text-slate-400">{LEVEL_NAMES[day.level]} sales</span>}
      </div>

      {current.length > 0 && priorRank !== null && (
        <>
          <Spark current={current} prior={before} />
          <div className="mt-1 flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-500">
            <span>{shortDate(day.time - SPARK_DAYS * DAY)}</span>
            <span>Higher = faster</span>
            <span>{shortDate(day.time + SPARK_DAYS * DAY)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] tabular-nums">
            <span className="flex items-center gap-1.5 text-slate-200">
              <span className="h-0.5 w-3.5 rounded-full bg-cyan-300" />
              {day.year} <b className="font-black">#{whole(day.rank as number)}</b>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3.5 border-t-[1.5px] border-dashed border-slate-400" />
              {new Date(prior).getUTCFullYear()} <b className="font-black text-slate-300">#{whole(priorRank)}</b>
            </span>
          </div>
          {change !== null && (
            <div className="mt-1.5 text-[10px] text-slate-400">
              {Math.abs(change) < 0.03
                ? `About the same as ${shortDate(prior)}, ${new Date(prior).getUTCFullYear()}`
                : `Rank ${Math.round(Math.abs(change) * 100)}% ${change > 0 ? "better" : "worse"} than ${shortDate(prior)}, ${new Date(prior).getUTCFullYear()}`}
            </div>
          )}
        </>
      )}

      {/* The pointer, kept over the square even when the card is pushed in from an edge. */}
      <span
        className="absolute -bottom-1 h-2.5 w-2.5 rotate-45 bg-slate-950"
        style={{ left: Math.min(Math.max(hover.x - left - 5, 14), CARD_WIDTH - 24) }}
      />
    </div>
  );
}

function Stat({ label, value, sub, shade }: { label: string; value: string; sub: string; shade: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: shade }} />
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</span>
      </div>
      <div className="mt-1.5 text-2xl font-black tabular-nums tracking-tight text-slate-950">{value}</div>
      <div className="mt-0.5 text-xs text-slate-500">{sub}</div>
    </div>
  );
}

export default function SeasonHeatmap({ category, rank }: { category: string | null; rank: number | null }) {
  // Built on the visitor's own clock, so "today" is theirs.
  const win = useMemo(() => seasonWindow(category, new Date(), rank), [category, rank]);
  const [hover, setHover] = useState<Hover | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const today = win.days[win.todayIndex];
  const hasRank = today.rank !== null;
  const peak = nextPeak(win);
  const { fastest, slowest } = extremesAhead(win);
  const linePercent = ((win.todayColumn + 0.5) / win.columns) * 100;

  // On a narrow screen the chart scrolls; open it with today in the middle.
  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    const mark = scroller?.querySelector<HTMLElement>("[data-today]");
    if (!scroller || !mark || scroller.scrollWidth <= scroller.clientWidth) return;
    const offset = mark.getBoundingClientRect().left - scroller.getBoundingClientRect().left + scroller.scrollLeft;
    scroller.scrollLeft = offset - scroller.clientWidth / 2;
  }, [win]);

  const point = (day: SeasonDay, el: HTMLElement) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const box = wrap.getBoundingClientRect();
    const cell = el.getBoundingClientRect();
    setHover({ day, x: cell.left + cell.width / 2 - box.left, y: cell.top - box.top, width: wrap.clientWidth });
  };

  const daysTo = (day: SeasonDay) => Math.round((day.time - today.time) / DAY);

  return (
    <Panel eyebrow="Seasonality" title="Two years of selling rhythm">
      <style>{`
        @keyframes season-pop { from { opacity: 0; transform: scale(0.3); } }
        .season-cell {
          aspect-ratio: 1 / 1;
          border-radius: 2.5px;
          opacity: var(--o, 1);
          animation: season-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards;
          transition: transform 0.14s ease, opacity 0.14s ease, box-shadow 0.14s ease;
        }
        .season-cell:hover, .season-cell[data-active] {
          transform: scale(1.7);
          opacity: 1;
          position: relative;
          z-index: 3;
          box-shadow: 0 0 0 1.5px #fff, 0 3px 10px rgba(15, 23, 42, 0.35);
        }
        @media (prefers-reduced-motion: reduce) { .season-cell { animation: none; transition: none; } }
      `}</style>

      <p className="-mt-2 mb-6 max-w-2xl text-sm leading-relaxed text-slate-500">
        Every square is one day, from a year ago to a year from now. The darker the square, the faster sales tend to run and
        the lower the rank. The red line is today and sweeps forward like a radar: the days behind it are clear, and the shaded side ahead of it is the
        year it has not reached yet.{" "}
        {hasRank
          ? "Hover or tap any day to see its projected rank against the same day a year earlier."
          : "Hover or tap any day to see how fast it tends to sell."}
      </p>

      <div ref={wrapRef} className="relative">
        <div ref={scrollRef} onScroll={() => setHover(null)} className="overflow-x-auto pb-3 [scrollbar-width:thin]">
          <div className="grid grid-cols-[2rem_1fr] gap-x-2" style={{ minWidth: win.columns * MIN_PITCH + 40 }}>
            {/* The two halves, with today between them */}
            <div />
            <div className="relative mb-2 h-6">
              {/* Either side of the pill, so both stay in view when the chart scrolls to today. */}
              <span
                className="absolute top-1 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.14em] text-slate-400"
                style={{ right: `calc(${100 - linePercent}% + 64px)` }}
              >
                &larr; Past 12 months
              </span>
              <span
                className="absolute top-1 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.14em] text-blue-600"
                style={{ left: `calc(${linePercent}% + 64px)` }}
              >
                Next 12 months &rarr;
              </span>
              <motion.span
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.45 }}
                className="absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-[0_6px_16px_-4px_rgba(239,68,68,0.6)]"
                style={{ left: `${linePercent}%` }}
              >
                Today / {shortDate(today.time)}
              </motion.span>
            </div>

            {/* Month names, each with its average rank */}
            <div />
            <div className={`relative mb-2 ${hasRank ? "h-8" : "h-4"}`}>
              {win.months.map((m, i) => (
                <span
                  key={`${m.year}-${m.month}`}
                  className="absolute flex flex-col leading-tight"
                  style={{ left: `${(m.column / win.columns) * 100}%` }}
                >
                  <span className={`text-[10.5px] font-bold ${m.month === 0 || i === 0 ? "text-slate-600" : "text-slate-400"}`}>
                    {MONTHS[m.month]}
                    {(m.month === 0 || i === 0) && <span className="font-black">{` '${String(m.year).slice(2)}`}</span>}
                  </span>
                  {m.rank !== null && (
                    <span className="text-[10px] font-black tabular-nums text-slate-800">{compactRank(m.rank)}</span>
                  )}
                </span>
              ))}
            </div>

            {/* Laid over the row, so the squares alone set its height. */}
            <div className="relative">
              <div className="absolute inset-0 grid grid-rows-7 text-[9.5px] font-bold leading-none text-slate-300" style={{ rowGap: GAP }}>
                {WEEKDAYS.map((name, index) => (
                  <span key={name} className="flex items-center" style={{ visibility: index % 2 === 1 ? "visible" : "hidden" }}>
                    {name}
                  </span>
                ))}
              </div>
            </div>

            <div
              className="relative"
              role="img"
              aria-label={`Sales speed by day from ${fullDate(win.days[0].time)} to ${fullDate(
                win.days[win.days.length - 1].time,
              )}. Today is in ${today.label}, a ${LEVEL_NAMES[today.level].toLowerCase()} stretch.`}
            >
              {/* The year ahead, screened: the line has not reached it yet */}
              <div
                aria-hidden
                className="absolute -bottom-1.5 -right-1.5 -top-1.5 rounded-r-xl border border-l-0 border-slate-200/80 bg-slate-50"
                style={{ width: `calc(${100 - linePercent}% + 6px)`, backgroundImage: AHEAD_SCREEN }}
              />

              <div
                className="relative grid"
                style={{
                  gridTemplateColumns: `repeat(${win.columns}, minmax(0, 1fr))`,
                  gridTemplateRows: "repeat(7, auto)",
                  gridAutoFlow: "column",
                  gap: GAP,
                }}
                onMouseLeave={() => setHover(null)}
              >
                {win.days.map((day, index) => {
                  const isToday = index === win.todayIndex;
                  const column = Math.floor(index / 7);
                  return (
                    <div
                      key={day.time}
                      className="season-cell"
                      data-today={isToday ? "" : undefined}
                      data-active={hover?.day.time === day.time ? "" : undefined}
                      onMouseEnter={(event) => point(day, event.currentTarget)}
                      onClick={(event) => point(day, event.currentTarget)}
                      style={
                        {
                          background: SHADES[day.level],
                          "--o": day.past ? 1 : 0.7,
                          // A ripple outward from today.
                          animationDelay: `${Math.abs(column - win.todayColumn) * 11}ms`,
                          outline: isToday ? "2px solid #ef4444" : undefined,
                          outlineOffset: 1,
                        } as CSSProperties
                      }
                    />
                  );
                })}
              </div>

              {/* Today */}
              <motion.div
                aria-hidden
                initial={reduce ? false : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ left: `${linePercent}%`, originY: 0 }}
                className="pointer-events-none absolute -bottom-2.5 -top-4 w-0.5 -translate-x-1/2 rounded-full bg-red-500 shadow-[0_0_0_1.5px_rgba(255,255,255,0.95),0_0_16px_rgba(239,68,68,0.55)]"
              />
            </div>
          </div>
        </div>

        {hover && <HoverCard hover={hover} win={win} todayTime={today.time} />}
      </div>

      <p className="sr-only" aria-live="polite">
        {hover
          ? `${fullDate(hover.day.time)}${hover.day.rank !== null ? `, projected rank ${whole(hover.day.rank)}` : ""}, ${
              hover.day.label
            }, ${LEVEL_NAMES[hover.day.level].toLowerCase()} sales.`
          : ""}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-xs font-bold text-slate-400">
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-5 rounded-[4px] border border-slate-200 bg-slate-50" style={{ backgroundImage: AHEAD_SCREEN }} />
          Not reached yet
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-0.5 rounded-full bg-red-500" />
          Today
        </span>
        <span className="flex items-center gap-1.5">
          Slower
          {SHADES.map((shade) => (
            <span key={shade} className="h-3.5 w-3.5 rounded-[4px]" style={{ background: shade }} />
          ))}
          Faster
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Today"
          shade={SHADES[today.level]}
          value={today.rank !== null ? `#${whole(today.rank)}` : `${LEVEL_NAMES[today.level]}`}
          sub={`${today.label} / ${LEVEL_NAMES[today.level]} sales`}
        />
        <Stat
          label="Fastest day ahead"
          shade={SHADES[fastest.level]}
          value={fastest.rank !== null ? `#${whole(fastest.rank)}` : `${LEVEL_NAMES[fastest.level]}`}
          sub={`${fastest.label} / ${shortDate(fastest.time)}, in ${daysTo(fastest)} days`}
        />
        <Stat
          label="Slowest day ahead"
          shade={SHADES[slowest.level]}
          value={slowest.rank !== null ? `#${whole(slowest.rank)}` : `${LEVEL_NAMES[slowest.level]}`}
          sub={`${slowest.label} / ${shortDate(slowest.time)}, in ${daysTo(slowest)} days`}
        />
      </div>

      <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
        Today falls in a <b className="text-slate-900">{LEVEL_NAMES[today.level].toLowerCase()}</b> stretch.{" "}
        {peak ? (
          <>
            The next fastest stretch is <b className="text-slate-900">{peak.label}</b>, {peak.daysAway} days away. Stock takes weeks to
            ship and check in, so send it well before the red line reaches it.
          </>
        ) : (
          <>Plan ahead for the next busy season.</>
        )}{" "}
        <span className="text-slate-400">
          {hasRank
            ? `Ranks for both years are projected from this product's recent rank and the typical shopping seasons for ${
                category ?? "this category"
              }. Neither year is recorded history.`
            : `Modelled from the typical shopping seasons for ${category ?? "this category"}, not this product's own history.`}
        </span>
      </p>
    </Panel>
  );
}
