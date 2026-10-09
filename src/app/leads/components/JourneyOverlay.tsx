"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import type { Lead } from "../../../lib/leads/model";
import { gap, journeySteps, stepDate, type JourneyStep } from "./journey";

/**
 * Click a card on the board and the board dims while a numbered path draws
 * across the columns this person went through, in the order they did it, each
 * step with its date and the time since the step before (Stefano, 2026-10-08).
 * Steps whose column is hidden still appear in the list at the bottom.
 */

interface Placed {
  step: JourneyStep;
  n: number;
  x: number;
  y: number;
}

export default function JourneyOverlay({
  lead,
  container,
  onClose,
  onOpenDetails,
}: {
  lead: Lead;
  /** The element the board lives in; columns inside it carry data-col-id. */
  container: HTMLElement | null;
  onClose: () => void;
  onOpenDetails: () => void;
}) {
  const steps = useMemo(() => journeySteps(lead), [lead]);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [active, setActive] = useState<number | null>(null);
  const svgRef = useRef<SVGPolylineElement>(null);

  const measure = useCallback(() => {
    if (!container) return;
    const box = container.getBoundingClientRect();
    setSize({ w: box.width, h: box.height });
    const out: Placed[] = [];
    steps.forEach((step, i) => {
      const col = container.querySelector<HTMLElement>(`[data-col-id="${CSS.escape(step.colId)}"]`);
      if (!col) return;
      const r = col.getBoundingClientRect();
      // Off-screen columns (scrolled sideways) are left off the drawing, not squeezed onto the edge.
      if (r.right < box.left || r.left > box.right) return;
      // Two rows, alternating, so neighbouring labels never sit on top of each other.
      const row = out.length % 2;
      out.push({ step, n: i + 1, x: r.left - box.left + r.width / 2, y: box.height * (row ? 0.56 : 0.34) });
    });
    setPlaced(out);
  }, [container, steps]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    if (!container) return;
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    const board = container.querySelector(".ld-board");
    board?.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      board?.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [container, measure]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Draw the line in, once per lead.
  useEffect(() => {
    const line = svgRef.current;
    if (!line || placed.length < 2) return;
    const length = line.getTotalLength();
    line.style.transition = "none";
    line.style.strokeDasharray = `${length}`;
    line.style.strokeDashoffset = `${length}`;
    requestAnimationFrame(() => {
      line.style.transition = "stroke-dashoffset 900ms ease-out";
      line.style.strokeDashoffset = "0";
    });
  }, [placed.length, lead.id]);

  const first = steps[0]?.at;
  const last = steps[steps.length - 1]?.at;
  const hidden = steps.filter((s) => !placed.some((p) => p.step === s));

  return (
    <div className="ld-journey-overlay" role="dialog" aria-label={`Journey of ${lead.name}`} onClick={onClose}>
      <svg className="ld-journey-svg" width={size.w} height={size.h} aria-hidden="true">
        {placed.length > 1 && (
          <polyline
            ref={svgRef}
            points={placed.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#ffffff"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
      </svg>

      {placed.map((p, i) => (
        <button
          key={p.step.colId}
          type="button"
          className="ld-journey-node"
          data-active={active === p.n}
          style={{ left: p.x, top: p.y, animationDelay: `${120 + i * 140}ms` }}
          onClick={(e) => {
            e.stopPropagation();
            setActive(active === p.n ? null : p.n);
          }}
        >
          <span className="ld-journey-num">{p.n}</span>
          <span className="ld-journey-label">
            <strong>{p.step.label}</strong>
            <small>{stepDate(p.step.at)}</small>
            {p.n > 1 && <small className="ld-journey-gap">+{gap(steps[p.n - 2].at, p.step.at)} after step {p.n - 1}</small>}
            {active === p.n && p.step.detail && <em>{p.step.detail}</em>}
          </span>
        </button>
      ))}

      <div className="ld-journey-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ld-journey-panel-head">
          <div>
            <strong>{lead.name || lead.email}</strong>
            <span>
              {steps.length} step{steps.length === 1 ? "" : "s"}
              {first && last && steps.length > 1 ? ` over ${gap(first, last)}, first seen ${stepDate(first)}` : ""}
            </span>
          </div>
          <button type="button" className="ld-btn" onClick={onOpenDetails}>
            Open details
          </button>
          <button type="button" className="ld-icon-btn" aria-label="Close journey" onClick={onClose}>
            <X size={14} />
          </button>
        </div>
        <ol className="ld-journey-list">
          {steps.map((s, i) => (
            <li key={s.colId} data-hidden={hidden.includes(s) || undefined}>
              <span className="ld-journey-num ld-journey-num-sm">{i + 1}</span>
              <span>
                {s.label}
                <small>
                  {stepDate(s.at)}
                  {i > 0 ? ` · +${gap(steps[i - 1].at, s.at)}` : ""}
                  {hidden.includes(s) ? " · column hidden" : ""}
                </small>
              </span>
            </li>
          ))}
          {steps.length === 0 && <li>No dated steps recorded for this person yet.</li>}
        </ol>
      </div>
    </div>
  );
}
