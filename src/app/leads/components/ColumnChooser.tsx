"use client";

import { useEffect, useRef, useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Columns3, GripVertical } from "lucide-react";

export interface ColumnChooserEntry {
  id: string;
  label: string;
}

function Row({ entry, checked, onToggle }: { entry: ColumnChooserEntry; checked: boolean; onToggle: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id });
  return (
    <div
      ref={setNodeRef}
      className="ld-colchooser-row"
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
    >
      <span className="ld-colchooser-handle" {...attributes} {...listeners}>
        <GripVertical size={12} />
      </span>
      <input type="checkbox" className="ld-checkbox" checked={checked} onChange={() => onToggle(entry.id)} />
      <span className="ld-colchooser-label">{entry.label}</span>
    </div>
  );
}

export default function ColumnChooser({
  columns,
  hiddenColumns,
  onToggleVisibility,
  onReorder,
}: {
  columns: ColumnChooserEntry[];
  hiddenColumns: Set<string>;
  onToggleVisibility: (id: string) => void;
  onReorder: (order: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = columns.map((c) => c.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(ids, oldIndex, newIndex));
  };

  return (
    <div className="ld-popover-anchor" ref={ref}>
      <button type="button" className="ld-dd-btn" onClick={() => setOpen((o) => !o)}>
        <Columns3 size={13} />
        Columns
      </button>
      {open && (
        <div className="ld-popover ld-popover-right" style={{ minWidth: 220 }}>
          <div className="ld-popover-section-title">Show / reorder columns</div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={columns.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="ld-colchooser-list">
                {columns.map((c) => (
                  <Row key={c.id} entry={c} checked={!hiddenColumns.has(c.id)} onToggle={onToggleVisibility} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
