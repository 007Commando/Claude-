"use client";

import { useEffect, useMemo, useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Lead, Stage } from "../../../lib/leads/model";
import { STAGES } from "./shared";
import { sortBoardColumn, type BoardSortKey, type LeadFilters } from "./useLeadFilters";
import BoardColumn from "./BoardColumn";

const COLUMN_ORDER_KEY = "leadDesk.boardColumnOrder.v1";

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

  useEffect(() => {
    setColumnOrder(loadColumnOrder());
  }, []);

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
            <SortableBoardColumn
              key={stage}
              stage={stage}
              leads={sortedByStage[stage]}
              sortKey={filters.boardSort[stage]}
              onSetSort={filters.setBoardSort}
              selectedLeadId={selectedLeadId}
              onSelectLead={onSelectLead}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
