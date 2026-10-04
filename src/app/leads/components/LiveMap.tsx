"use client";

import { geoAlbersUsa, geoPath } from "d3-geo";
import { useEffect, useMemo, useState } from "react";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import nation from "us-atlas/nation-10m.json";
import type { LiveSession, LiveStage } from "./liveTypes";

/**
 * The United States as a field of small hexagons, Shopify Live View style,
 * with one pulsing dot per visitor on the site right now.
 *
 * The hex field is computed once: a grid over the map, kept where the cell's
 * centre falls inside the country. The test runs against a canvas path
 * (isPointInPath), which is a few milliseconds for the whole grid where
 * testing each point against the geometry would take most of a second.
 */

const W = 975;
const H = 610;
const STEP = 11;

export const STAGE_COLORS: Record<LiveStage, string> = {
  browsing: "#2563eb",
  form: "#f59e0b",
  signup: "#8b5cf6",
  checkout: "#f97316",
  paid: "#16a34a",
};

const projection = geoAlbersUsa().scale(1300).translate([W / 2, H / 2]);

function hexPath(cx: number, cy: number, r: number) {
  let d = "";
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    d += `${i ? "L" : "M"}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  }
  return `${d}Z`;
}

function buildHexField(): string {
  if (typeof document === "undefined") return "";
  const topo = nation as unknown as Topology<{ nation: GeometryCollection }>;
  const land = feature(topo, topo.objects.nation);
  const outline = geoPath(projection)(land);
  if (!outline) return "";
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return "";
  const shape = new Path2D(outline);
  const rowH = STEP * 0.866;
  let d = "";
  for (let row = 0; row * rowH < H; row++) {
    const y = row * rowH + rowH / 2;
    const offset = row % 2 ? STEP / 2 : 0;
    for (let x = offset + STEP / 2; x < W; x += STEP) {
      if (ctx.isPointInPath(shape, x, y)) d += hexPath(x, y, STEP * 0.42);
    }
  }
  return d;
}

export default function LiveMap({
  sessions,
  focusedSid,
  onFocus,
}: {
  sessions: LiveSession[];
  focusedSid: string | null;
  onFocus: (sid: string | null) => void;
}) {
  // After mount: the field needs a canvas, which the server render does not have.
  const [hexes, setHexes] = useState("");
  useEffect(() => setHexes(buildHexField()), []);

  const placed = useMemo(
    () =>
      sessions
        .map((s) => {
          if (typeof s.lat !== "number" || typeof s.lon !== "number") return null;
          const point = projection([s.lon, s.lat]);
          return point ? { s, x: point[0], y: point[1] } : null;
        })
        .filter((p): p is { s: LiveSession; x: number; y: number } => p !== null),
    [sessions],
  );
  const abroad = sessions.length - placed.length;

  return (
    <div className="ld-live-map">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${sessions.length} visitors on the map right now`}>
        <path d={hexes} className="ld-live-hex" />
        {placed.map(({ s, x, y }) => {
          const color = s.color ?? STAGE_COLORS[s.stage] ?? STAGE_COLORS.browsing;
          const focused = s.sid === focusedSid;
          return (
            <g
              key={s.sid}
              transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}
              className="ld-live-dot"
              onMouseEnter={() => onFocus(s.sid)}
              onMouseLeave={() => onFocus(null)}
            >
              <circle r={focused ? 26 : 18} fill={color} className="ld-live-pulse" />
              <circle r={focused ? 9 : 7} fill={color} stroke="#fff" strokeWidth={2.5} />
              <title>
                {[s.name || s.email || "Visitor", [s.city, s.region].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}
              </title>
            </g>
          );
        })}
      </svg>
      {abroad > 0 && <div className="ld-live-abroad">+{abroad} outside the US or unlocated</div>}
    </div>
  );
}
