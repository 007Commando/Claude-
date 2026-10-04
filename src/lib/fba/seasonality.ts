/**
 * A calendar of how fast a category tends to sell, day by day.
 *
 * Apex does not hold a year of daily rank for a single ASIN, so this is not
 * one product's history. It is the shape of the selling year for the
 * product's category: the shopping seasons that move Amazon demand (the holiday
 * rush, Black Friday to Cyber Monday, Prime events, back to school and so on)
 * plus the small weekday rhythm, weighted by how much each season matters to
 * that kind of product. The page says so under the chart, so nobody mistakes
 * it for measured sales.
 *
 * Dates are built in UTC so a visitor's timezone can never push a day into the
 * wrong cell.
 */

const DAY = 86_400_000;

export type SeasonLevel = 0 | 1 | 2 | 3 | 4;

export const LEVEL_NAMES = ["Slowest", "Slow", "Steady", "Fast", "Fastest"] as const;

type EventId =
  | "newyear"
  | "coldflu"
  | "valentines"
  | "spring"
  | "easter"
  | "mothers"
  | "fathers"
  | "summer"
  | "prime"
  | "bts"
  | "halloween"
  | "thanksgiving"
  | "bfcm"
  | "holiday"
  | "lull";

const LABELS: Record<EventId, string> = {
  newyear: "New Year resolutions",
  coldflu: "Cold and flu season",
  valentines: "Valentine's Day",
  spring: "Spring season",
  easter: "Easter",
  mothers: "Mother's Day",
  fathers: "Father's Day",
  summer: "Summer",
  prime: "Prime event season",
  bts: "Back to school",
  halloween: "Halloween",
  thanksgiving: "Thanksgiving",
  bfcm: "Black Friday to Cyber Monday",
  holiday: "Holiday shopping",
  lull: "After-holiday lull",
};

const utc = (year: number, month: number, day: number) => Date.UTC(year, month, day);

/** The nth weekday (0 = Sunday) of a month, as a UTC timestamp. */
const nthWeekday = (year: number, month: number, weekday: number, n: number) => {
  const first = new Date(utc(year, month, 1)).getUTCDay();
  return utc(year, month, 1 + ((weekday - first + 7) % 7) + (n - 1) * 7);
};

/** Easter Sunday by the anonymous Gregorian algorithm. */
const easter = (year: number) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utc(year, month, day);
};

/** Each season as one or more bumps: [centre, spread in days, strength]. */
const bumps = (year: number): Record<EventId, [number, number, number][]> => {
  const thanksgiving = nthWeekday(year, 10, 4, 4);
  return {
    newyear: [[utc(year, 0, 6), 9, 1]],
    coldflu: [[utc(year, 0, 22), 22, 1]],
    valentines: [[utc(year, 1, 9), 5, 1]],
    spring: [[utc(year, 3, 25), 24, 1]],
    easter: [[easter(year) - 8 * DAY, 6, 1]],
    mothers: [[nthWeekday(year, 4, 0, 2) - 5 * DAY, 6, 1]],
    fathers: [[nthWeekday(year, 5, 0, 3) - 5 * DAY, 5, 1]],
    summer: [[utc(year, 6, 1), 32, 1]],
    prime: [
      [utc(year, 6, 10), 3, 1],
      [utc(year, 9, 8), 3, 0.7],
    ],
    bts: [[utc(year, 7, 10), 13, 1]],
    halloween: [[utc(year, 9, 22), 8, 1]],
    thanksgiving: [[utc(year, 10, 22), 6, 1]],
    bfcm: [[thanksgiving + 2.5 * DAY, 2.5, 1]],
    holiday: [
      [utc(year, 11, 11), 9, 1],
      [utc(year, 10, 24), 16, 0.5],
    ],
    lull: [[utc(year, 11, 29), 3, 1]],
  };
};

type Weights = Partial<Record<EventId, number>>;

const PROFILES: { match: RegExp; weights: Weights }[] = [
  { match: /toy|game|baby|kids/, weights: { holiday: 0.9, bfcm: 0.8, easter: 0.2, halloween: 0.2, prime: 0.3, summer: 0.1 } },
  { match: /electronic|cell phone|computer|camera|video/, weights: { bfcm: 1, prime: 0.8, holiday: 0.8, bts: 0.25 } },
  { match: /grocery|gourmet|food/, weights: { holiday: 0.45, thanksgiving: 0.4, halloween: 0.3, easter: 0.25, summer: 0.15, bfcm: 0.15, newyear: 0.1, prime: 0.1 } },
  { match: /health|household|vitamin|personal care|wellness/, weights: { newyear: 0.5, coldflu: 0.35, bfcm: 0.3, prime: 0.3, holiday: 0.2 } },
  { match: /beauty/, weights: { holiday: 0.55, bfcm: 0.5, mothers: 0.3, valentines: 0.3, prime: 0.35, summer: 0.1 } },
  { match: /office|school|arts|craft|stationery/, weights: { bts: 0.9, newyear: 0.1, holiday: 0.15, bfcm: 0.2, prime: 0.2 } },
  { match: /patio|lawn|garden/, weights: { spring: 0.8, summer: 0.5, fathers: 0.2, bfcm: 0.15, prime: 0.3 } },
  { match: /sport|outdoor|fitness/, weights: { newyear: 0.5, summer: 0.35, holiday: 0.3, bfcm: 0.3, fathers: 0.3, spring: 0.2, prime: 0.3 } },
  { match: /pet/, weights: { holiday: 0.3, bfcm: 0.35, prime: 0.3, summer: 0.1 } },
  { match: /clothing|shoes|jewelry|fashion|apparel/, weights: { holiday: 0.5, bfcm: 0.5, spring: 0.25, bts: 0.3, valentines: 0.2, prime: 0.3 } },
  { match: /tool|industrial|automotive|improvement|scientific/, weights: { spring: 0.3, fathers: 0.35, holiday: 0.2, bfcm: 0.25, prime: 0.25 } },
  { match: /home|kitchen|furniture|appliance/, weights: { holiday: 0.35, bfcm: 0.6, prime: 0.5, mothers: 0.2, bts: 0.15, newyear: 0.1 } },
];

const FALLBACK: Weights = { holiday: 0.4, bfcm: 0.45, prime: 0.3, newyear: 0.1, summer: 0.05 };

/** Day-of-week rhythm, Sunday first. Mild on purpose. */
const WEEKDAY = [1, 1.06, 1.03, 1, 0.98, 0.93, 0.9];

const gauss = (distanceDays: number, spread: number) => Math.exp(-(distanceDays * distanceDays) / (2 * spread * spread));

export interface SeasonDay {
  /** UTC timestamp of the day. */
  time: number;
  month: number;
  day: number;
  weekday: number;
  level: SeasonLevel;
  label: string;
}

export interface SeasonYear {
  year: number;
  days: SeasonDay[];
  /** Weekday of 1 January, which sets the first column's offset. */
  offset: number;
  columns: number;
  /** First column of each month. */
  monthColumns: number[];
  /** Index of today in `days`. */
  todayIndex: number;
}

/** The year's calendar for a category, with today marked. */
export const seasonYear = (category: string | null, now: Date): SeasonYear => {
  const year = now.getFullYear();
  const todayTime = utc(year, now.getMonth(), now.getDate());
  const text = (category ?? "").toLowerCase();
  const weights = PROFILES.find((profile) => profile.match.test(text))?.weights ?? FALLBACK;
  const events = bumps(year);
  const lull = -0.35;

  const start = utc(year, 0, 1);
  const total = Math.round((utc(year + 1, 0, 1) - start) / DAY);

  const raw: { value: number; label: string }[] = [];
  for (let i = 0; i < total; i++) {
    const time = start + i * DAY;
    let value = 1;
    let best = 0;
    let label = "Everyday demand";
    (Object.keys(events) as EventId[]).forEach((id) => {
      const weight = id === "lull" ? lull : (weights[id] ?? 0);
      if (!weight) return;
      const lift = events[id].reduce((sum, [centre, spread, strength]) => sum + strength * gauss((time - centre) / DAY, spread), 0) * weight;
      value += lift;
      if (Math.abs(lift) > Math.abs(best) && Math.abs(lift) >= 0.1) {
        best = lift;
        label = LABELS[id];
      }
    });
    const weekday = new Date(time).getUTCDay();
    raw.push({ value: Math.max(0.3, value) * WEEKDAY[weekday], label });
  }

  const min = Math.min(...raw.map((r) => r.value));
  const max = Math.max(...raw.map((r) => r.value));
  const span = max - min || 1;

  const days: SeasonDay[] = raw.map((entry, i) => {
    const time = start + i * DAY;
    const date = new Date(time);
    return {
      time,
      month: date.getUTCMonth(),
      day: date.getUTCDate(),
      weekday: date.getUTCDay(),
      level: Math.min(4, Math.floor(((entry.value - min) / span) * 5)) as SeasonLevel,
      label: entry.label,
    };
  });

  const offset = new Date(start).getUTCDay();
  const monthColumns: number[] = [];
  days.forEach((d, i) => {
    if (d.day === 1) monthColumns[d.month] = Math.floor((offset + i) / 7);
  });

  return {
    year,
    days,
    offset,
    columns: Math.ceil((offset + total) / 7),
    monthColumns,
    todayIndex: Math.round((todayTime - start) / DAY),
  };
};

/** The next stretch of the fastest level after today, for the plain-English read. */
export const nextPeak = (calendar: SeasonYear): { label: string; daysAway: number } | null => {
  for (let i = calendar.todayIndex + 1; i < calendar.days.length; i++) {
    if (calendar.days[i].level === 4) return { label: calendar.days[i].label, daysAway: i - calendar.todayIndex };
  }
  return null;
};
