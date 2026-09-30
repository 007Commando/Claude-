"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDownUp, ChevronDown, GripVertical } from "lucide-react";
import type { Lead, Stage } from "../../../lib/leads/model";
import { BOARD_SORT_OPTIONS, type BoardSortKey } from "./useLeadFilters";
import { STAGE_SHORT_LABELS, stageColorVar } from "./shared";
import LeadCard from "./LeadCard";
import SourceSplit from "./SourceSplit";

const CARD_HEIGHT = 52;

interface BoardColumnProps {
  stage: Stage;
  leads: Lead[];
  sortKey: BoardSortKey | undefined;
  onSetSort: (stage: Stage, key: BoardSortKey | null) => void;
  selectedLeadId: string | null;
  onSelectLead: (lead: Lead) => void;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
  dragAttributes?: React.HTMLAttributes<HTMLElement>;
  dragListeners?: Record<string, unknown>;
}

function useOutsideClose(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [onClose]);
  return ref;
}

function SortMenu({ stage, sortKey, onSetSort }: { stage: Stage; sortKey: BoardSortKey | undefined; onSetSort: BoardColumnProps["onSetSort"] }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));

  return (
    <div className="ld-popover-anchor" ref={ref}>
      <button
        type="button"
        className="ld-icon-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        title="Sort"
        aria-label="Sort column"
      >
        <ArrowDownUp size={13} />
      </button>
      {open && (
        <div className="ld-popover ld-popover-right" onClick={(e) => e.stopPropagation()}>
          <div className="ld-popover-section-title">Sort by</div>
          {BOARD_SORT_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className="ld-popover-option"
              data-active={sortKey === opt.value}
              onClick={() => {
                onSetSort(stage, opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
          {sortKey && (
            <>
              <div className="ld-popover-divider" />
              <div
                className="ld-popover-option"
                onClick={() => {
                  onSetSort(stage, null);
                  setOpen(false);
                }}
              >
                Reset to default
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ReasonsMenu({ leads }: { leads: Lead[] }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of leads) {
      const reason = l.churnReason ?? "Unknown";
      map.set(reason, (map.get(reason) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [leads]);

  return (
    <div className="ld-popover-anchor" ref={ref}>
      <button
        type="button"
        className="ld-btn ld-btn-ghost"
        style={{ fontSize: 10.5, height: 22, padding: "0 6px" }}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        Reasons
      </button>
      {open && (
        <div className="ld-popover ld-popover-right" style={{ minWidth: 180 }} onClick={(e) => e.stopPropagation()}>
          <div className="ld-popover-section-title">Cancellation reasons</div>
          {counts.length === 0 && <div className="ld-popover-option">No reasons recorded</div>}
          {counts.map(([reason, count]) => (
            <div key={reason} className="ld-popover-row" style={{ padding: "4px 6px", fontSize: 12 }}>
              <span style={{ flex: 1 }}>{reason}</span>
              <span style={{ fontWeight: 700, color: "var(--ld-text-muted)" }}>{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BoardColumn({
  stage,
  leads,
  sortKey,
  onSetSort,
  selectedLeadId,
  onSelectLead,
  setNodeRef,
  style,
  dragAttributes,
  dragListeners,
}: BoardColumnProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const virtualizer = useVirtualizer({
    count: leads.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => CARD_HEIGHT,
    overscan: 8,
  });

  useEffect(() => {
    if (focusedIndex == null) return;
    let attempts = 0;
    let raf = 0;
    const tryFocus = () => {
      const el = cardRefs.current.get(focusedIndex);
      if (el) {
        el.focus();
        return;
      }
      attempts += 1;
      if (attempts < 4) raf = requestAnimationFrame(tryFocus);
    };
    raf = requestAnimationFrame(tryFocus);
    return () => cancelAnimationFrame(raf);
  }, [focusedIndex]);

  const moveFocus = (delta: number) => {
    if (leads.length === 0) return;
    setFocusedIndex((prev) => {
      const base = prev ?? 0;
      const next = Math.min(leads.length - 1, Math.max(0, base + delta));
      virtualizer.scrollToIndex(next, { align: "auto" });
      return next;
    });
  };

  return (
    <div className="ld-board-col" ref={setNodeRef} style={style}>
      <div className="ld-board-col-header" {...dragAttributes} {...dragListeners}>
        <GripVertical size={12} style={{ color: "var(--ld-text-faint)", flex: "none" }} />
        <span className="ld-board-col-dot" style={{ background: stageColorVar(stage) }} />
        <span className="ld-board-col-name">{STAGE_SHORT_LABELS[stage]}</span>
        <span className="ld-board-col-count">{leads.length}</span>
        <div className="ld-board-col-header-actions">
          {stage === "churned" && <ReasonsMenu leads={leads} />}
          <SortMenu stage={stage} sortKey={sortKey} onSetSort={onSetSort} />
        </div>
      </div>
      <SourceSplit leads={leads} />

      <div
        className="ld-board-list"
        ref={scrollRef}
        tabIndex={leads.length > 0 ? -1 : undefined}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            moveFocus(1);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            moveFocus(-1);
          }
        }}
      >
        {leads.length === 0 ? (
          <div className="ld-board-empty">Nobody's waiting here.</div>
        ) : (
          <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
            {virtualizer.getVirtualItems().map((item) => {
              const lead = leads[item.index];
              return (
                <LeadCard
                  key={lead.id}
                  ref={(el) => {
                    if (el) cardRefs.current.set(item.index, el);
                    else cardRefs.current.delete(item.index);
                  }}
                  lead={lead}
                  selected={lead.id === selectedLeadId}
                  tabIndex={item.index === (focusedIndex ?? 0) ? 0 : -1}
                  onFocus={() => setFocusedIndex(item.index)}
                  onSelect={onSelectLead}
                  style={{ transform: `translateY(${item.start}px)`, height: item.size }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export { CARD_HEIGHT };
