"use client";

/**
 * One funnel's SVG: four trapezoid stages on a fixed silhouette (see EDGES),
 * coloured on a gradient from the source's strong colour down to a light
 * tint. A small pill between stages shows
 * the step-over-step conversion %. Clicking a stage hands it off to the
 * caller, which sends the user to the Table view pre-filtered to it.
 */

import type { FunnelCounts, FunnelSourceOption, FunnelStep } from "../../../lib/leads/funnel";
import { FUNNEL_STEPS, stepConversions } from "../../../lib/leads/funnel";
import { fmtInt } from "./shared";

const VIEW_W = 360;
const CX = VIEW_W / 2;
const STAGE_H = 68;
const GAP_H = 14;
/**
 * Fixed silhouette (Stefano's mockup): every stage is a trapezoid a set step
 * narrower than the one above, regardless of the counts, so the numbers carry
 * the story and a zero never collapses the shape. Top edge of each stage, as
 * a share of the view width; the last value is the bottom edge of the tip.
 */
const EDGES = [1, 0.84, 0.68, 0.53, 0.4];
const STEP_COUNT = FUNNEL_STEPS.length;
export const FUNNEL_GRAPHIC_VIEW_H = STEP_COUNT * STAGE_H + (STEP_COUNT - 1) * GAP_H;

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixRgb(a: string, b: string, t: number): [number, number, number] {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return [ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Flat fill for one stage (interpolated t=0..1 down the funnel) plus a readable text colour for it. */
function stageFill(option: FunnelSourceOption, t: number): { css: string; textColor: string } {
  const rgb = mixRgb(option.color, option.tint, t);
  const css = `rgb(${rgb.map((v) => Math.round(v)).join(", ")})`;
  const textColor = relativeLuminance(rgb) > 0.55 ? "#0f1728" : "#ffffff";
  return { css, textColor };
}

export default function FunnelGraphic({
  option,
  counts,
  onStageClick,
}: {
  option: FunnelSourceOption;
  counts: FunnelCounts;
  onStageClick: (step: FunnelStep) => void;
}) {
  const conversions = stepConversions(counts);
  const countValues = [counts.lead, counts.registered, counts.trial, counts.customer];

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${FUNNEL_GRAPHIC_VIEW_H}`} className="ld-funnel-svg" role="img" aria-label={`${option.label} funnel`}>
      {FUNNEL_STEPS.map((step, i) => {
        const y0 = i * (STAGE_H + GAP_H);
        const y1 = y0 + STAGE_H;
        const topHalf = (EDGES[i] * VIEW_W) / 2;
        const bottomHalf = (EDGES[i + 1] * VIEW_W) / 2;
        const t = i / (STEP_COUNT - 1);
        const { css: fill, textColor } = stageFill(option, t);
        const points = `${CX - topHalf},${y0} ${CX + topHalf},${y0} ${CX + bottomHalf},${y1} ${CX - bottomHalf},${y1}`;
        const conversion = i < conversions.length ? conversions[i] : null;

        return (
          <g key={step.key}>
            <g
              className="ld-funnel-stage"
              onClick={() => onStageClick(step)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onStageClick(step);
              }}
            >
              <title>{`${step.label}: ${fmtInt(countValues[i])}`}</title>
              <polygon points={points} fill={fill} />
              <text x={CX} y={y0 + STAGE_H / 2 - 3} textAnchor="middle" className="ld-funnel-stage-value" fill={textColor}>
                {fmtInt(countValues[i])}
              </text>
              <text x={CX} y={y0 + STAGE_H / 2 + 14} textAnchor="middle" className="ld-funnel-stage-label" fill={textColor}>
                {step.label}
              </text>
            </g>
            {i < conversions.length && (
              <g transform={`translate(${CX}, ${y1 + GAP_H / 2})`}>
                <rect x={-34} y={-11} width={68} height={22} rx={11} className="ld-funnel-pill-bg" />
                <text x={0} y={4.5} textAnchor="middle" className="ld-funnel-pill-text">
                  {conversion == null ? "—" : `↓ ${conversion.toFixed(1)}%`}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
