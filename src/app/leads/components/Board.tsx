"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Lead, Stage } from "../../../lib/leads/model";
import { STAGES } from "./shared";
import { sortBoardColumn, type BoardSortKey, type LeadFilters } from "./useLeadFilters";
import BoardColumn from "./BoardColumn";

const COLUMN_ORDER_KEY = "leadDesk.boardColumnOrder.v1";
const EXPANDED_KEY = "leadDesk.accountExpanded.v1";

/**
 * Activation milestones shown as extra columns next to "Account, no trial"
 * when it is expanded (Stefano, 2026-09-30). A lead sits in every milestone
 * it has reached, so the same person can appear in several columns.
 */
const ACTIVATION_SUBCOLUMNS: {
  key: string;
  title: string;
  color: string;
  /** Which board stages feed the column. The vendor email usually goes out before sign-up, so it also takes Leads. */
  stages: Stage[];
  test: (l: Lead) => boolean;
}[] = [
  { key: "vendor", title: "Vendor email", color: "#eab308", stages: ["lead", "registered"], test: (l) => l.activation.vendorEmailSent },
  { key: "scan", title: "First scan", color: "#16a34a", stages: ["registered"], test: (l) => Boolean(l.activation.firstScanAt) },
  { key: "database", title: "Database", color: "#2563eb", stages: ["registered"], test: (l) => l.activation.databaseProducts > 0 },
];

/**
 * Leads arrive two ways (Stefano, 2026-10-08). "Apex CRM Leads" is everyone in Apex's own GHL
 * location. "PrimeWell GHL Leads" is the direct PrimeWell flow: applicants in PrimeWell's own GHL
 * location who were never copied into Apex's, so they sit beside the CRM column, not inside it.
 */
const isPrimewellDirect = (l: Lead) => l.ghlLocation === "primewell";
const PRIMEWELL_COLOR = "#1d4ed8";

function loadColumnOrder(): Stage[] {
  if (typeof window === "undefined") return STAGES;
  try {
    const raw = window.localStorage.getItem(COLUMN_ORDER_KEY);
    if (!raw) return STAGES;
    const parsed = JSON.parse(raw) as string[];
    const valid = parsed.filter((s): s is Stage => (STAGES as string[]).includes(s));
    const missing = STAGES.filter((s) => !valid.includes(s));
    return [...valid, ...missing];
  } catch {
    return STAGES;
  }
}

function SortableBoardColumn(props: {
  stage: Stage;
  leads: Lead[];
  sortKey: BoardSortKey | undefined;
  onSetSort: (stage: Stage, key: BoardSortKey | null) => void;
  selectedLeadId: string | null;
  onSelectLead: (lead: Lead) => void;
  headerExtra?: React.ReactNode;
  title?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.stage });
  return (
    <BoardColumn
      {...props}
      setNodeRef={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      dragAttributes={attributes}
      dragListeners={listeners}
    />
  );
}

export default function Board({
  leadsByStage,
  filters,
  selectedLeadId,
  onSelectLead,
}: {
  leadsByStage: Record<Stage, Lead[]>;
  filters: LeadFilters;
  selectedLeadId: string | null;
  onSelectLead: (lead: Lead) => void;
}) {
  const [columnOrder, setColumnOrder] = useState<Stage[]>(STAGES);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setColumnOrder(loadColumnOrder());
    try {
      setExpanded(window.localStorage.getItem(EXPANDED_KEY) === "1");
    } catch {
      // localStorage unavailable: starts collapsed.
    }
  }, []);

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(EXPANDED_KEY, next ? "1" : "0");
      } catch {
        // not persisted
      }
      return next;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const sortedByStage = useMemo(() => {
    const out = {} as Record<Stage, Lead[]>;
    for (const stage of STAGES) out[stage] = sortBoardColumn(leadsByStage[stage] ?? [], stage, filters.boardSort[stage]);
    return out;
  }, [leadsByStage, filters.boardSort]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setColumnOrder((prev) => {
      const oldIndex = prev.indexOf(active.id as Stage);
      const newIndex = prev.indexOf(over.id as Stage);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const next = arrayMove(prev, oldIndex, newIndex);
      try {
        window.localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(next));
      } catch {
        // localStorage unavailable — column order just won't persist across reloads.
      }
      return next;
    });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
        <div className="ld-board">
          {columnOrder.map((stage) => (
            <Fragment key={stage}>
              <SortableBoardColumn
                stage={stage}
                title={stage === "lead" ? "Apex CRM Leads" : undefined}
                leads={stage === "lead" ? sortedByStage.lead.filter((l) => !isPrimewellDirect(l)) : sortedByStage[stage]}
                sortKey={filters.boardSort[stage]}
                onSetSort={filters.setBoardSort}
                selectedLeadId={selectedLeadId}
                onSelectLead={onSelectLead}
                headerExtra={
                  stage === "registered" ? (
                    <button
                      type="button"
                      className="ld-icon-btn ld-expand-btn"
                      data-active={expanded}
                      title={expanded ? "Hide activation" : "Show activation"}
                      aria-label={expanded ? "Hide activation columns" : "Show activation columns"}
                      aria-expanded={expanded}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={toggleExpanded}
                    >
                      {expanded ? <ChevronsLeft size={13} /> : <ChevronsRight size={13} />}
                    </button>
                  ) : undefined
                }
              />
              {stage === "lead" && (
                <BoardColumn
                  stage="lead"
                  title="PrimeWell GHL Leads"
                  titleColor={PRIMEWELL_COLOR}
                  leads={sortedByStage.lead.filter(isPrimewellDirect)}
                  sortKey={filters.boardSort.lead}
                  onSetSort={filters.setBoardSort}
                  selectedLeadId={selectedLeadId}
                  onSelectLead={onSelectLead}
                />
              )}
              {stage === "registered" &&
                expanded &&
                ACTIVATION_SUBCOLUMNS.map((sub) => (
                  <BoardColumn
                    key={sub.key}
                    stage="registered"
                    subTitle={sub.title}
                    subColor={sub.color}
                    leads={sortBoardColumn(
                      sub.stages.flatMap((st) => leadsByStage[st] ?? []).filter(sub.test),
                      "lead",
                      filters.boardSort.registered,
                    )}
                    sortKey={filters.boardSort.registered}
                    onSetSort={filters.setBoardSort}
                    selectedLeadId={selectedLeadId}
                    onSelectLead={onSelectLead}
                  />
                ))}
            </Fragment>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
