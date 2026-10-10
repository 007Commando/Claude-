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
import type { SalesCall } from "../../../lib/leads/calls";
import ColumnChooser from "./ColumnChooser";

// v3: the default order changed (Stefano, 2026-10-10), so every browser starts from it once.
const COLUMNS_KEY = "leadDesk.boardColumns.v3";
const PREVIOUS_COLUMNS_KEY = "leadDesk.boardColumns.v2";

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
  // Paying customers leave First scan (Stefano, 2026-10-10): the column is for people still to convert.
  { id: "act:scan", title: "First scan", color: "#16a34a", stages: ["registered", "trial"], test: (l, since) => onOrAfter(l.activation.firstScanAt, since) },
  { id: "act:database", title: "Database", color: "#2563eb", stages: ["registered"], test: (l) => l.activation.databaseProducts > 0 },
  // Customers leave this one too (Stefano, 2026-10-10).
  { id: "act:amazon", title: "Amazon connected", color: "#f97316", stages: ["registered", "trial"], test: (l, since) => onOrAfter(l.activation.amazonConnectedAt, since) },
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
 * PrimeWell's whole job is getting people into Apex (Stefano, 2026-10-08). The "Signed up" switch
 * counts an Apex account only; joining an Apex funnel without an account doesn't count yet.
 */
const reachedApex = (l: Lead) => l.stage !== "lead";

/**
 * Greyed out in the PrimeWell column: only applicants who already created an Apex account, so the
 * team knows not to call them about making one (Stefano, 2026-10-09). Being copied into Apex's GHL
 * location doesn't grey a card any more; nearly every applicant is, and those without an account
 * are exactly the people to call. (Was "anyone with an Apex GHL contact", 2026-10-08.)
 */
const primewellMuted = (l: Lead) => (reachedApex(l) ? "Has Apex account" : null);

type PrimewellView = "all" | "signed" | "not";
const PRIMEWELL_VIEW_KEY = "leadDesk.primewellView.v1";
const PRIMEWELL_VIEWS: { value: PrimewellView; label: string }[] = [
  { value: "all", label: "All" },
  { value: "signed", label: "Signed up" },
  { value: "not", label: "Not yet" },
];

/**
 * Customers by when they became one (Stefano, 2026-10-10): last 3, 7 or 30 days, or all time.
 * Counts from customerSince, the day the first paid period started.
 */
type CustomerView = "3" | "7" | "30" | "all";
const CUSTOMER_VIEW_KEY = "leadDesk.customerView.v1";
const CUSTOMER_VIEWS: { value: CustomerView; label: string }[] = [
  { value: "3", label: "3d" },
  { value: "7", label: "7d" },
  { value: "30", label: "30d" },
  { value: "all", label: "All" },
];
const becameCustomerWithin = (l: Lead, view: CustomerView) => {
  if (view === "all") return true;
  if (!l.customerSince) return false;
  return Date.now() - new Date(l.customerSince).getTime() <= Number(view) * 86_400_000;
};

const ACTIVATION_IDS = ACTIVATION_COLUMNS.map((c) => c.id);
/**
 * Left to right is the path a lead walks (Stefano, 2026-10-10): PrimeWell, the Apex CRM, an
 * account, Amazon connected, trialing, first scan. The milestones he rarely watches follow, then
 * the paying and churned columns.
 */
const DEFAULT_ORDER = [
  "primewell",
  "lead",
  "registered",
  "act:amazon",
  "trial",
  "act:scan",
  "act:database",
  "act:vendor",
  "customer",
  "churned",
];
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
    // First visit since the order changed: start from the new order, keep which columns were hidden.
    const previous = JSON.parse(window.localStorage.getItem(PREVIOUS_COLUMNS_KEY) ?? "null") as Partial<ColumnLayout> | null;
    if (previous?.hidden) return { order: DEFAULT_ORDER, hidden: previous.hidden.filter((id) => DEFAULT_ORDER.includes(id)) };
    return fallback;
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
      colId={id}
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
  changedIds,
  callsByContact,
}: {
  leadsByStage: Record<Stage, Lead[]>;
  filters: LeadFilters;
  /** Start of today when the Today range is on: activation columns then only count today's milestones. */
  todaySince: string | null;
  selectedLeadId: string | null;
  onSelectLead: (lead: Lead) => void;
  changedIds?: Set<string>;
  /** Sales calls by GHL contact id, for the last-call tag on each card. */
  callsByContact?: Record<string, SalesCall[]>;
}) {
  const [layout, setLayout] = useState<ColumnLayout>({ order: DEFAULT_ORDER, hidden: [] });
  const [primewellView, setPrimewellView] = useState<PrimewellView>("all");
  const [customerView, setCustomerView] = useState<CustomerView>("all");

  useEffect(() => {
    setLayout(loadLayout());
    try {
      const saved = window.localStorage.getItem(PRIMEWELL_VIEW_KEY);
      if (saved === "signed" || saved === "not") setPrimewellView(saved);
      const savedCustomers = window.localStorage.getItem(CUSTOMER_VIEW_KEY);
      if (savedCustomers === "3" || savedCustomers === "7" || savedCustomers === "30") setCustomerView(savedCustomers);
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

  const chooseCustomerView = (v: CustomerView) => {
    setCustomerView(v);
    try {
      window.localStorage.setItem(CUSTOMER_VIEW_KEY, v);
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

  // Every column's cards, worked out once so a person's furthest column can be found.
  const columnLeads = useMemo(() => {
    const out: Record<string, Lead[]> = {};
    for (const id of DEFAULT_ORDER) {
      if (id === "primewell") {
        out[id] = sortBoardColumn(
          STAGES.flatMap((st) => leadsByStage[st] ?? []).filter(
            (l) =>
              (l.inPrimewell || isPrimewellDirect(l)) &&
              (primewellView === "all" || (primewellView === "signed") === reachedApex(l)),
          ),
          "lead",
          filters.boardSort.lead,
        );
        continue;
      }
      const activation = ACTIVATION_COLUMNS.find((c) => c.id === id);
      if (activation) {
        out[id] = sortBoardColumn(
          activation.stages.flatMap((st) => leadsByStage[st] ?? []).filter((l) => activation.test(l, todaySince)),
          "lead",
          filters.boardSort.registered,
        );
        continue;
      }
      const stage = id as Stage;
      out[id] =
        stage === "lead"
          ? sortedByStage.lead.filter((l) => !isPrimewellDirect(l))
          : stage === "customer"
            ? sortedByStage.customer.filter((l) => becameCustomerWithin(l, customerView))
            : sortedByStage[stage];
    }
    return out;
  }, [leadsByStage, sortedByStage, filters.boardSort, primewellView, customerView, todaySince]);

  /**
   * A person can sit in several columns (Robert McKay: Amazon connected, Trialing, First scan).
   * Only the furthest one along the visible order shows them in white; everywhere else they stay,
   * so the counts still add up, but greyed out (Stefano, 2026-10-10). PrimeWell keeps its own
   * greying, "Has Apex account".
   */
  const furthestColumn = useMemo(() => {
    const out = new Map<string, string>();
    for (const id of visibleOrder) {
      if (id === "primewell") continue;
      for (const l of columnLeads[id] ?? []) out.set(l.id, id);
    }
    return out;
  }, [visibleOrder, columnLeads]);
  const movedOn = (colId: string) => (l: Lead) => {
    const at = furthestColumn.get(l.id);
    return at && at !== colId ? `Now in ${COLUMN_LABELS[at] ?? at}` : null;
  };

  const common = { onSetSort: filters.setBoardSort, selectedLeadId, onSelectLead, changedIds, callsByContact };

  const renderColumn = (id: string) => {
    if (id === "primewell") {
      return (
        <SortableBoardColumn
          key={id}
          id={id}
          stage="lead"
          title={COLUMN_LABELS.primewell}
          titleColor={PRIMEWELL_COLOR}
          leads={columnLeads.primewell}
          mutedFor={primewellMuted}
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
          leads={columnLeads[id]}
          mutedFor={movedOn(id)}
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
        leads={columnLeads[id]}
        mutedFor={movedOn(id)}
        sortKey={filters.boardSort[stage]}
        {...common}
        subHeader={
          stage === "customer" ? (
            <div className="ld-view-switch ld-col-switch" role="tablist" aria-label="Became a customer">
              {CUSTOMER_VIEWS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  role="tab"
                  aria-selected={customerView === v.value}
                  data-active={customerView === v.value}
                  title={v.value === "all" ? "Every customer" : `Became a customer in the last ${v.value} days`}
                  onClick={() => chooseCustomerView(v.value)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          ) : undefined
        }
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
