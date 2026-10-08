"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Lead, Stage } from "../../../lib/leads/model";
import { STAGES, STAGE_SHORT_LABELS } from "./shared";
import { sortBoardColumn, type BoardSortKey, type LeadFilters } from "./useLeadFilters";
import BoardColumn from "./BoardColumn";
import ColumnChooser from "./ColumnChooser";

const COLUMNS_KEY = "leadDesk.boardColumns.v2";
const LEGACY_ORDER_KEY = "leadDesk.boardColumnOrder.v1";
const LEGACY_EXPANDED_KEY = "leadDesk.accountExpanded.v1";

/**
 * Activation milestones as their own columns (Stefano, 2026-09-30). A lead sits in every
 * milestone it has reached, so the same person can appear in several. On "Today" a dated
 * milestone only counts if it happened today.
 */
const ACTIVATION_COLUMNS: {
  id: string;
  title: string;
  color: string;
  /** Which board stages feed the column. The vendor email usually goes out before sign-up, so it also takes Leads. */
  stages: Stage[];
  test: (l: Lead, since: string | null) => boolean;
}[] = [
  { id: "act:vendor", title: "Vendor email", color: "#eab308", stages: ["lead", "registered"], test: (l) => l.activation.vendorEmailSent },
  { id: "act:scan", title: "First scan", color: "#16a34a", stages: ["registered", "trial", "customer"], test: (l, since) => onOrAfter(l.activation.firstScanAt, since) },
  { id: "act:database", title: "Database", color: "#2563eb", stages: ["registered"], test: (l) => l.activation.databaseProducts > 0 },
  { id: "act:amazon", title: "Amazon connected", color: "#f97316", stages: ["registered", "trial", "customer"], test: (l, since) => onOrAfter(l.activation.amazonConnectedAt, since) },
];

function onOrAfter(iso: string | null, since: string | null): boolean {
  return Boolean(iso) && (!since || (iso as string) >= since);
}

/**
 * Leads arrive two ways (Stefano, 2026-10-08). "Apex CRM Leads" is everyone in Apex's own GHL
 * location. "PrimeWell GHL Leads" is the direct PrimeWell flow: applicants in PrimeWell's own GHL
 * location who were never copied into Apex's, so they sit beside the CRM column, not inside it.
 */
const isPrimewellDirect = (l: Lead) => l.ghlLocation === "primewell";
const PRIMEWELL_COLOR = "#1d4ed8";

/**
 * PrimeWell's whole job is getting people into Apex (Stefano, 2026-10-08). So the PrimeWell column
 * keeps every PrimeWell contact, and anyone who has since come into Apex's CRM or opened an account
 * gets a light green outline: mission accomplished.
 */
const reachedApex = (l: Lead) => l.ghlLocation === "apex" || l.stage !== "lead";
const REACHED_APEX_RING = "#86efac";
const primewellRing = (l: Lead) => (reachedApex(l) ? REACHED_APEX_RING : null);

type PrimewellView = "all" | "signed" | "not";
const PRIMEWELL_VIEW_KEY = "leadDesk.primewellView.v1";
const PRIMEWELL_VIEWS: { value: PrimewellView; label: string }[] = [
  { value: "all", label: "All" },
  { value: "signed", label: "Signed up" },
  { value: "not", label: "Not yet" },
];

const ACTIVATION_IDS = ACTIVATION_COLUMNS.map((c) => c.id);
const DEFAULT_ORDER = ["lead", "primewell", "registered", ...ACTIVATION_IDS, "trial", "customer", "churned"];
const COLUMN_LABELS: Record<string, string> = {
  lead: "Apex CRM Leads",
  primewell: "PrimeWell GHL Leads",
  registered: STAGE_SHORT_LABELS.registered,
  trial: STAGE_SHORT_LABELS.trial,
  customer: STAGE_SHORT_LABELS.customer,
  churned: STAGE_SHORT_LABELS.churned,
  ...Object.fromEntries(ACTIVATION_COLUMNS.map((c) => [c.id, c.title])),
};

interface ColumnLayout {
  order: string[];
  hidden: string[];
}

/** Any column can be moved or hidden (Stefano, 2026-10-08); the layout lives in this browser. */
function loadLayout(): ColumnLayout {
  const fallback: ColumnLayout = { order: DEFAULT_ORDER, hidden: ["act:vendor", "act:database"] };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(COLUMNS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ColumnLayout>;
      const order = (parsed.order ?? []).filter((id) => DEFAULT_ORDER.includes(id));
      const missing = DEFAULT_ORDER.filter((id) => !order.includes(id));
      return { order: [...order, ...missing], hidden: (parsed.hidden ?? []).filter((id) => DEFAULT_ORDER.includes(id)) };
    }
    // First visit since columns became free: carry over the old stage order and the activation toggle.
    const legacy = JSON.parse(window.localStorage.getItem(LEGACY_ORDER_KEY) ?? "null") as string[] | null;
    const expanded = window.localStorage.getItem(LEGACY_EXPANDED_KEY) === "1";
    const order = legacy
      ? legacy.flatMap((id) => (id === "lead" ? ["lead", "primewell"] : id === "registered" ? ["registered", ...ACTIVATION_IDS] : [id]))
      : DEFAULT_ORDER;
    const valid = order.filter((id) => DEFAULT_ORDER.includes(id));
    return { order: [...valid, ...DEFAULT_ORDER.filter((id) => !valid.includes(id))], hidden: expanded ? [] : fallback.hidden };
  } catch {
    return fallback;
  }
}

function saveLayout(layout: ColumnLayout) {
  try {
    window.localStorage.setItem(COLUMNS_KEY, JSON.stringify(layout));
  } catch {
    // localStorage unavailable: the layout just won't persist across reloads.
  }
}

function SortableBoardColumn(props: React.ComponentProps<typeof BoardColumn> & { id: string }) {
  const { id, ...rest } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <BoardColumn
      {...rest}
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
  todaySince,
  selectedLeadId,
  onSelectLead,
}: {
  leadsByStage: Record<Stage, Lead[]>;
  filters: LeadFilters;
  /** Start of today when the Today range is on: activation columns then only count today's milestones. */
  todaySince: string | null;
  selectedLeadId: string | null;
  onSelectLead: (lead: Lead) => void;
}) {
  const [layout, setLayout] = useState<ColumnLayout>({ order: DEFAULT_ORDER, hidden: [] });
  const [primewellView, setPrimewellView] = useState<PrimewellView>("all");

  useEffect(() => {
    setLayout(loadLayout());
    try {
      const saved = window.localStorage.getItem(PRIMEWELL_VIEW_KEY);
      if (saved === "signed" || saved === "not") setPrimewellView(saved);
    } catch {
      // localStorage unavailable: starts on All.
    }
  }, []);

  const choosePrimewellView = (v: PrimewellView) => {
    setPrimewellView(v);
    try {
      window.localStorage.setItem(PRIMEWELL_VIEW_KEY, v);
    } catch {
      // not persisted
    }
  };

  const updateLayout = (next: ColumnLayout) => {
    setLayout(next);
    saveLayout(next);
  };

  const hidden = useMemo(() => new Set(layout.hidden), [layout.hidden]);
  const visibleOrder = layout.order.filter((id) => !hidden.has(id));
  const activationShown = ACTIVATION_IDS.some((id) => !hidden.has(id));

  const toggleColumn = (id: string) =>
    updateLayout({ ...layout, hidden: hidden.has(id) ? layout.hidden.filter((h) => h !== id) : [...layout.hidden, id] });

  // The chevron on "Account, no trial" still shows or hides every activation column at once.
  const toggleActivation = () =>
    updateLayout({
      ...layout,
      hidden: activationShown ? [...new Set([...layout.hidden, ...ACTIVATION_IDS])] : layout.hidden.filter((h) => !ACTIVATION_IDS.includes(h)),
    });

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
    const oldIndex = layout.order.indexOf(String(active.id));
    const newIndex = layout.order.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    updateLayout({ ...layout, order: arrayMove(layout.order, oldIndex, newIndex) });
  };

  const common = { onSetSort: filters.setBoardSort, selectedLeadId, onSelectLead };

  const renderColumn = (id: string) => {
    if (id === "primewell") {
      return (
        <SortableBoardColumn
          key={id}
          id={id}
          stage="lead"
          title={COLUMN_LABELS.primewell}
          titleColor={PRIMEWELL_COLOR}
          leads={sortBoardColumn(
            STAGES.flatMap((st) => leadsByStage[st] ?? []).filter(
              (l) =>
                (l.inPrimewell || isPrimewellDirect(l)) &&
                (primewellView === "all" || (primewellView === "signed") === reachedApex(l)),
            ),
            "lead",
            filters.boardSort.lead,
          )}
          ringFor={primewellRing}
          subHeader={
            <div className="ld-view-switch ld-col-switch" role="tablist" aria-label="PrimeWell leads">
              {PRIMEWELL_VIEWS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  role="tab"
                  aria-selected={primewellView === v.value}
                  data-active={primewellView === v.value}
                  onClick={() => choosePrimewellView(v.value)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          }
          sortKey={filters.boardSort.lead}
          {...common}
        />
      );
    }
    const activation = ACTIVATION_COLUMNS.find((c) => c.id === id);
    if (activation) {
      return (
        <SortableBoardColumn
          key={id}
          id={id}
          stage="registered"
          subTitle={activation.title}
          subColor={activation.color}
          leads={sortBoardColumn(
            activation.stages.flatMap((st) => leadsByStage[st] ?? []).filter((l) => activation.test(l, todaySince)),
            "lead",
            filters.boardSort.registered,
          )}
          sortKey={filters.boardSort.registered}
          {...common}
        />
      );
    }
    const stage = id as Stage;
    return (
      <SortableBoardColumn
        key={id}
        id={id}
        stage={stage}
        title={stage === "lead" ? COLUMN_LABELS.lead : undefined}
        leads={stage === "lead" ? sortedByStage.lead.filter((l) => !isPrimewellDirect(l)) : sortedByStage[stage]}
        sortKey={filters.boardSort[stage]}
        {...common}
        headerExtra={
          stage === "registered" ? (
            <button
              type="button"
              className="ld-icon-btn ld-expand-btn"
              data-active={activationShown}
              title={activationShown ? "Hide activation" : "Show activation"}
              aria-label={activationShown ? "Hide activation columns" : "Show activation columns"}
              aria-expanded={activationShown}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={toggleActivation}
            >
              {activationShown ? <ChevronsLeft size={13} /> : <ChevronsRight size={13} />}
            </button>
          ) : undefined
        }
      />
    );
  };

  return (
    <>
      <div className="ld-table-toolbar">
        <span className="ld-table-toolbar-count">
          {todaySince ? "Today, plus everyone trialing or paying right now" : "This range, plus everyone trialing or paying right now"}
        </span>
        <div style={{ flex: 1 }} />
        <ColumnChooser
          columns={layout.order.map((id) => ({ id, label: COLUMN_LABELS[id] ?? id }))}
          hiddenColumns={hidden}
          onToggleVisibility={toggleColumn}
          onReorder={(order) => updateLayout({ ...layout, order })}
        />
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visibleOrder} strategy={horizontalListSortingStrategy}>
          <div className="ld-board">{visibleOrder.map(renderColumn)}</div>
        </SortableContext>
      </DndContext>
    </>
  );
}
