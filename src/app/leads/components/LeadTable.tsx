"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown, ChevronUp, Download, ListFilter, Phone } from "lucide-react";
import {
  getCoreRowModel,
  legacyCreateColumnHelper,
  useLegacyTable,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy";
import type { Lead } from "../../../lib/leads/model";
import { STAGE_RANK, activationTier } from "../../../lib/leads/model";
import { downloadCsv } from "../../../lib/dashboard/csv";
import { ACTIVATION_COLORS, fmtDateShort, money, SELLER_TYPE_LABELS, SOURCE_LABELS, STAGE_LABELS } from "./shared";
import type { TableSort } from "./useLeadFilters";
import ColumnChooser from "./ColumnChooser";

const ROW_HEIGHT = 32;
import { accountToTrialMs, fmtDuration, leadAgeMs, leadToAccountMs, leadToPaidMs, trialToPaidMs } from "./shared";

const STORAGE_KEY = "leadDesk.tableColumns.v1";

type FilterKind = "text" | "select" | "date";

interface ColumnSpec {
  id: string;
  label: string;
  kind: FilterKind;
  width: number;
  lowPriority?: boolean;
  text: (l: Lead) => string;
  sortValue: (l: Lead) => string | number;
  selectValue?: (l: Lead) => string;
  dateValue?: (l: Lead) => string | null;
  render?: (l: Lead) => React.ReactNode;
}

const NameCell = ({ l }: { l: Lead }) => (
  <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>
    {l.name}
    {l.ghlUrl && <span style={{ color: "var(--ld-text-faint)" }}> ↗</span>}
  </span>
);

const COLUMNS: ColumnSpec[] = [
  {
    id: "name",
    label: "Name",
    kind: "text",
    width: 160,
    text: (l) => l.name,
    sortValue: (l) => l.name.toLowerCase(),
    render: (l) =>
      l.ghlUrl ? (
        <a href={l.ghlUrl} target="_blank" rel="noreferrer" style={{ fontWeight: 600 }} title="Open in GHL">
          {l.name}
        </a>
      ) : (
        <NameCell l={l} />
      ),
  },
  { id: "email", label: "Email", kind: "text", width: 190, text: (l) => l.email ?? "—", sortValue: (l) => (l.email ?? "").toLowerCase() },
  {
    id: "phone",
    label: "Phone",
    kind: "text",
    width: 120,
    lowPriority: true,
    text: (l) => l.phone ?? "—",
    sortValue: (l) => l.phone ?? "",
  },
  {
    id: "source",
    label: "Source",
    kind: "select",
    width: 110,
    text: (l) => SOURCE_LABELS[l.source],
    sortValue: (l) => SOURCE_LABELS[l.source],
    selectValue: (l) => SOURCE_LABELS[l.source],
  },
  {
    id: "firstSource",
    label: "First source",
    kind: "select",
    width: 110,
    text: (l) => SOURCE_LABELS[l.firstSource],
    sortValue: (l) => SOURCE_LABELS[l.firstSource],
    selectValue: (l) => SOURCE_LABELS[l.firstSource],
  },
  {
    id: "convertedVia",
    label: "Converted via",
    kind: "select",
    width: 120,
    text: (l) => (l.convertedVia ? SOURCE_LABELS[l.convertedVia] : "—"),
    sortValue: (l) => (l.convertedVia ? SOURCE_LABELS[l.convertedVia] : ""),
    selectValue: (l) => (l.convertedVia ? SOURCE_LABELS[l.convertedVia] : "—"),
  },
  {
    id: "sellerType",
    label: "Seller type",
    kind: "select",
    width: 100,
    text: (l) => SELLER_TYPE_LABELS[l.sellerType],
    sortValue: (l) => SELLER_TYPE_LABELS[l.sellerType],
    selectValue: (l) => SELLER_TYPE_LABELS[l.sellerType],
  },
  {
    id: "stage",
    label: "Stage",
    kind: "select",
    width: 150,
    text: (l) => STAGE_LABELS[l.stage],
    sortValue: (l) => STAGE_RANK[l.stage],
    selectValue: (l) => STAGE_LABELS[l.stage],
    render: (l) => (
      <span className="ld-status-tag" data-stage={l.stage}>
        {STAGE_LABELS[l.stage]}
      </span>
    ),
  },
  {
    id: "leadAt",
    label: "Lead date",
    kind: "date",
    width: 100,
    text: (l) => fmtDateShort(l.leadAt),
    sortValue: (l) => l.leadAt,
    dateValue: (l) => l.leadAt,
  },
  {
    id: "registeredAt",
    label: "Account date",
    kind: "date",
    width: 100,
    text: (l) => fmtDateShort(l.registeredAt),
    sortValue: (l) => l.registeredAt ?? "",
    dateValue: (l) => l.registeredAt,
  },
  {
    id: "trialStartedAt",
    label: "Trial start",
    kind: "date",
    width: 100,
    text: (l) => fmtDateShort(l.trialStartedAt),
    sortValue: (l) => l.trialStartedAt ?? "",
    dateValue: (l) => l.trialStartedAt,
  },
  {
    id: "trialEndsAt",
    label: "Trial end",
    kind: "date",
    width: 100,
    text: (l) => fmtDateShort(l.trialEndsAt),
    sortValue: (l) => l.trialEndsAt ?? "",
    dateValue: (l) => l.trialEndsAt,
  },
  {
    id: "customerSince",
    label: "Customer since",
    kind: "date",
    width: 110,
    text: (l) => fmtDateShort(l.customerSince),
    sortValue: (l) => l.customerSince ?? "",
    dateValue: (l) => l.customerSince,
  },
  {
    id: "churnedAt",
    label: "Churned",
    kind: "date",
    width: 100,
    text: (l) => fmtDateShort(l.churnedAt),
    sortValue: (l) => l.churnedAt ?? "",
    dateValue: (l) => l.churnedAt,
  },
  {
    id: "planName",
    label: "Plan",
    kind: "select",
    width: 90,
    text: (l) => l.planName ?? "—",
    sortValue: (l) => l.planName ?? "",
    selectValue: (l) => l.planName ?? "—",
  },
  {
    id: "mrr",
    label: "MRR",
    kind: "text",
    width: 80,
    text: (l) => (l.mrr > 0 ? money(l.mrr) : "—"),
    sortValue: (l) => l.mrr,
  },
  {
    id: "leadAge",
    label: "Lead age",
    kind: "text",
    width: 80,
    text: (l) => { const v = leadAgeMs(l); return v == null ? "—" : fmtDuration(v); },
    sortValue: (l) => leadAgeMs(l) ?? -1,
  },
  {
    id: "leadToAccount",
    label: "Lead → account",
    kind: "text",
    width: 100,
    text: (l) => { const v = leadToAccountMs(l); return v == null ? "—" : fmtDuration(v); },
    sortValue: (l) => leadToAccountMs(l) ?? -1,
  },
  {
    id: "accountToTrial",
    label: "Account → trial",
    kind: "text",
    width: 100,
    text: (l) => { const v = accountToTrialMs(l); return v == null ? "—" : fmtDuration(v); },
    sortValue: (l) => accountToTrialMs(l) ?? -1,
  },
  {
    id: "trialToPaid",
    label: "Trial → paid",
    kind: "text",
    width: 90,
    text: (l) => { const v = trialToPaidMs(l); return v == null ? "—" : fmtDuration(v); },
    sortValue: (l) => trialToPaidMs(l) ?? -1,
  },
  {
    id: "leadToPaid",
    label: "Lead → paid",
    kind: "text",
    width: 90,
    text: (l) => { const v = leadToPaidMs(l); return v == null ? "—" : fmtDuration(v); },
    sortValue: (l) => leadToPaidMs(l) ?? -1,
  },
  {
    id: "lastOutreachAt",
    label: "Last outreach",
    kind: "date",
    width: 110,
    text: (l) => fmtDateShort(l.lastOutreachAt),
    sortValue: (l) => l.lastOutreachAt ?? "",
    dateValue: (l) => l.lastOutreachAt,
  },
  {
    id: "outreachCount",
    label: "Outreach count",
    kind: "text",
    width: 90,
    lowPriority: true,
    text: (l) => String(l.outreachCount),
    sortValue: (l) => l.outreachCount,
  },
  {
    id: "tags",
    label: "Tags",
    kind: "text",
    width: 170,
    lowPriority: true,
    text: (l) => l.tags.join(", "),
    sortValue: (l) => l.tags.length,
  },
  {
    id: "obstacle",
    label: "Obstacle",
    kind: "text",
    width: 150,
    lowPriority: true,
    text: (l) => l.obstacle ?? "—",
    sortValue: (l) => l.obstacle ?? "",
  },
  {
    id: "demoTiming",
    label: "Demo timing",
    kind: "text",
    width: 120,
    lowPriority: true,
    text: (l) => l.demoTiming ?? "—",
    sortValue: (l) => l.demoTiming ?? "",
  },
  {
    id: "activationVendorEmail",
    label: "Vendor email",
    kind: "select",
    width: 110,
    lowPriority: true,
    text: (l) => (l.activation.vendorEmailSent ? "Sent" : l.activation.vendorEmailRequested ? "Requested" : "No"),
    sortValue: (l) => (l.activation.vendorEmailSent ? 2 : l.activation.vendorEmailRequested ? 1 : 0),
    selectValue: (l) => (l.activation.vendorEmailSent ? "Sent" : l.activation.vendorEmailRequested ? "Requested" : "No"),
  },
  {
    id: "activationFirstScan",
    label: "First scan",
    kind: "select",
    width: 110,
    text: (l) => (l.activation.firstScanAt ? fmtDateShort(l.activation.firstScanAt) : "No"),
    sortValue: (l) => l.activation.firstScanAt ?? "",
    selectValue: (l) => (l.activation.firstScanAt ? "Yes" : "No"),
  },
  {
    id: "activationDatabaseProducts",
    label: "Database products",
    kind: "select",
    width: 130,
    lowPriority: true,
    text: (l) => (l.activation.databaseProducts > 0 ? String(l.activation.databaseProducts) : "No"),
    sortValue: (l) => l.activation.databaseProducts,
    selectValue: (l) => (l.activation.databaseProducts > 0 ? "Yes" : "No"),
  },
  {
    id: "activationAmazonConnected",
    label: "Seller Central",
    kind: "select",
    width: 110,
    text: (l) => (l.activation.amazonConnectedAt ? fmtDateShort(l.activation.amazonConnectedAt) : "No"),
    sortValue: (l) => l.activation.amazonConnectedAt ?? "",
    selectValue: (l) => (l.activation.amazonConnectedAt ? "Yes" : "No"),
  },
];

const COLUMNS_BY_ID: Record<string, ColumnSpec> = Object.fromEntries(COLUMNS.map((c) => [c.id, c]));
const DEFAULT_DATA_ORDER = COLUMNS.map((c) => c.id);
/** New columns hidden until someone explicitly shows them — see loadLayout(). */
const DEFAULT_HIDDEN_COLUMNS = ["activationVendorEmail", "activationDatabaseProducts"];

type ColumnFilterValue = { kind: "text"; value: string } | { kind: "select"; values: string[] } | { kind: "date"; from: string; to: string };

function loadLayout(): { order: string[]; hidden: string[] } {
  if (typeof window === "undefined") return { order: DEFAULT_DATA_ORDER, hidden: DEFAULT_HIDDEN_COLUMNS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { order: DEFAULT_DATA_ORDER, hidden: DEFAULT_HIDDEN_COLUMNS };
    const parsed = JSON.parse(raw) as { order?: string[]; hidden?: string[] };
    const order = (parsed.order ?? []).filter((id) => DEFAULT_DATA_ORDER.includes(id));
    const missing = DEFAULT_DATA_ORDER.filter((id) => !order.includes(id));
    // A column that's new to this browser (never in its saved order) starts
    // out at its own default visibility rather than always-shown — that's
    // how activationVendorEmail/activationDatabaseProducts stay hidden for
    // existing Lead Desk users, not just first-time ones.
    const hidden = new Set(parsed.hidden ?? []);
    for (const id of missing) {
      if (DEFAULT_HIDDEN_COLUMNS.includes(id)) hidden.add(id);
    }
    return { order: [...order, ...missing], hidden: [...hidden] };
  } catch {
    return { order: DEFAULT_DATA_ORDER, hidden: DEFAULT_HIDDEN_COLUMNS };
  }
}

function distinctValues(leads: Lead[], getter: (l: Lead) => string): string[] {
  return [...new Set(leads.map(getter))].sort((a, b) => a.localeCompare(b));
}

function applyColumnFilters(leads: Lead[], filters: Record<string, ColumnFilterValue>): Lead[] {
  const specs = Object.entries(filters);
  if (specs.length === 0) return leads;
  return leads.filter((lead) =>
    specs.every(([id, f]) => {
      const spec = COLUMNS_BY_ID[id];
      if (!spec) return true;
      if (f.kind === "text") return !f.value.trim() || spec.text(lead).toLowerCase().includes(f.value.trim().toLowerCase());
      if (f.kind === "select") return f.values.length === 0 || (spec.selectValue && f.values.includes(spec.selectValue(lead)));
      if (f.kind === "date") {
        const v = spec.dateValue?.(lead) ?? null;
        if (f.from && (!v || v < f.from)) return false;
        if (f.to && (!v || v > `${f.to}T23:59:59.999`)) return false;
        return true;
      }
      return true;
    }),
  );
}

function sortRows(leads: Lead[], sort: TableSort | null): Lead[] {
  const effective = sort ?? { columnId: "leadAt", dir: "desc" as const };
  const spec = COLUMNS_BY_ID[effective.columnId];
  if (!spec) return leads;
  const dir = effective.dir === "asc" ? 1 : -1;
  return [...leads].sort((a, b) => {
    const av = spec.sortValue(a);
    const bv = spec.sortValue(b);
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

function exportCsv(leads: Lead[]) {
  downloadCsv(
    `leads-${new Date().toISOString().slice(0, 10)}.csv`,
    [
      "Name",
      "Email",
      "Phone",
      "Source",
      "Source Detail",
      "Seller Type",
      "Stage",
      "Lead Date",
      "Account Date",
      "Trial Start",
      "Trial End",
      "Customer Since",
      "Churned",
      "Churn Reason",
      "Plan",
      "MRR",
      "Last Outreach",
      "Outreach Count",
      "Tags",
      "Obstacle",
      "Demo Timing",
      "Vendor Email Sent",
      "Vendor Email Requested",
      "First Scan",
      "Scans",
      "Database Products",
      "Database Updated",
      "Amazon Connected",
      "GHL URL",
    ],
    leads.map((l) => [
      l.name,
      l.email ?? "",
      l.phone ?? "",
      SOURCE_LABELS[l.source],
      l.sourceDetail ?? "",
      SELLER_TYPE_LABELS[l.sellerType],
      STAGE_LABELS[l.stage],
      l.leadAt,
      l.registeredAt ?? "",
      l.trialStartedAt ?? "",
      l.trialEndsAt ?? "",
      l.customerSince ?? "",
      l.churnedAt ?? "",
      l.churnReason ?? "",
      l.planName ?? "",
      l.mrr.toFixed(2),
      l.lastOutreachAt ?? "",
      String(l.outreachCount),
      l.tags.join("; "),
      l.obstacle ?? "",
      l.demoTiming ?? "",
      l.activation.vendorEmailSent ? "Yes" : "No",
      l.activation.vendorEmailRequested ? "Yes" : "No",
      l.activation.firstScanAt ?? "",
      String(l.activation.scans),
      String(l.activation.databaseProducts),
      l.activation.databaseUpdatedAt ?? "",
      l.activation.amazonConnectedAt ?? "",
      l.ghlUrl ?? "",
    ]),
  );
}

function makeUpdater<T>(setter: (updater: (prev: T) => T) => void) {
  return (updater: T | ((old: T) => T)) => {
    setter((prev) => (typeof updater === "function" ? (updater as (old: T) => T)(prev) : updater));
  };
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

function HeaderMenu({
  spec,
  sort,
  onSetSort,
  filterValue,
  onSetFilter,
  onHide,
  distinctOptions,
}: {
  spec: ColumnSpec;
  sort: TableSort | null;
  onSetSort: (sort: TableSort | null) => void;
  filterValue: ColumnFilterValue | undefined;
  onSetFilter: (value: ColumnFilterValue | undefined) => void;
  onHide: () => void;
  distinctOptions: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));
  const isSorted = sort?.columnId === spec.id;

  return (
    <div className="ld-popover-anchor" ref={ref} style={{ width: "100%" }}>
      <div
        className="ld-th-inner"
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") setOpen((o) => !o);
        }}
      >
        <span className="ld-th-label">{spec.label}</span>
        {isSorted && (sort?.dir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
        {filterValue && <span className="ld-th-filter-dot" />}
      </div>
      {open && (
        <div className="ld-popover" onClick={(e) => e.stopPropagation()}>
          <div
            className="ld-popover-option"
            data-active={isSorted && sort?.dir === "asc"}
            onClick={() => {
              onSetSort({ columnId: spec.id, dir: "asc" });
              setOpen(false);
            }}
          >
            Sort ascending
          </div>
          <div
            className="ld-popover-option"
            data-active={isSorted && sort?.dir === "desc"}
            onClick={() => {
              onSetSort({ columnId: spec.id, dir: "desc" });
              setOpen(false);
            }}
          >
            Sort descending
          </div>
          {isSorted && (
            <div className="ld-popover-option" onClick={() => onSetSort(null)}>
              Clear sort
            </div>
          )}
          <div className="ld-popover-divider" />
          {spec.kind === "text" && (
            <input
              autoFocus
              className="ld-popover-input"
              placeholder={`Filter ${spec.label.toLowerCase()}…`}
              value={filterValue?.kind === "text" ? filterValue.value : ""}
              onChange={(e) => onSetFilter(e.target.value ? { kind: "text", value: e.target.value } : undefined)}
            />
          )}
          {spec.kind === "select" && (
            <div className="ld-colchooser-list" style={{ maxHeight: 180 }}>
              {distinctOptions.map((opt) => {
                const selected = filterValue?.kind === "select" ? filterValue.values : [];
                const checked = selected.includes(opt);
                return (
                  <label key={opt} className="ld-popover-option" style={{ cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      className="ld-checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked ? selected.filter((v) => v !== opt) : [...selected, opt];
                        onSetFilter(next.length ? { kind: "select", values: next } : undefined);
                      }}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          )}
          {spec.kind === "date" && (
            <div className="ld-popover-row">
              <input
                type="date"
                className="ld-popover-input"
                value={filterValue?.kind === "date" ? filterValue.from : ""}
                onChange={(e) => {
                  const to = filterValue?.kind === "date" ? filterValue.to : "";
                  const from = e.target.value;
                  onSetFilter(from || to ? { kind: "date", from, to } : undefined);
                }}
              />
              <span style={{ color: "var(--ld-text-faint)" }}>to</span>
              <input
                type="date"
                className="ld-popover-input"
                value={filterValue?.kind === "date" ? filterValue.to : ""}
                onChange={(e) => {
                  const from = filterValue?.kind === "date" ? filterValue.from : "";
                  const to = e.target.value;
                  onSetFilter(from || to ? { kind: "date", from, to } : undefined);
                }}
              />
            </div>
          )}
          {filterValue && (
            <div
              className="ld-popover-option"
              style={{ marginTop: 4 }}
              onClick={() => {
                onSetFilter(undefined);
              }}
            >
              Clear filter
            </div>
          )}
          <div className="ld-popover-divider" />
          <div
            className="ld-popover-option"
            onClick={() => {
              onHide();
              setOpen(false);
            }}
          >
            Hide column
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeadTable({
  leads,
  tableSort,
  onSetTableSort,
  onSelectLead,
  selectedLeadId,
  onBulkMarkContacted,
  bulkPending,
}: {
  leads: Lead[];
  tableSort: TableSort | null;
  onSetTableSort: (sort: TableSort | null) => void;
  onSelectLead: (lead: Lead) => void;
  selectedLeadId: string | null;
  onBulkMarkContacted: (leads: Lead[]) => Promise<void>;
  bulkPending: boolean;
}) {
  const [columnOrder, setColumnOrderState] = useState<string[]>(() => ["select", ...DEFAULT_DATA_ORDER]);
  const [columnVisibility, setColumnVisibilityState] = useState<Record<string, boolean>>({});
  const [columnSizing, setColumnSizingState] = useState<Record<string, number>>({});
  const [rowSelection, setRowSelectionState] = useState<Record<string, true>>({});
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilterValue>>({});
  const [isNarrow, setIsNarrow] = useState(false);
  // Guards the persist effect below until the load effect has actually run —
  // without it, that effect's first pass (in the same commit, before the
  // load effect's setState takes hold) would persist the pre-load default
  // (nothing hidden) and permanently stomp on DEFAULT_HIDDEN_COLUMNS for
  // every visitor's very first load, since the "corrected" state never gets
  // written back afterward.
  const [layoutLoaded, setLayoutLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layout = loadLayout();
    setColumnOrderState(["select", ...layout.order]);
    setColumnVisibilityState(Object.fromEntries(layout.hidden.map((id) => [id, false])));
    setLayoutLoaded(true);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 899px)");
    const update = () => setIsNarrow(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!layoutLoaded) return;
    try {
      const order = columnOrder.filter((id) => id !== "select");
      const hidden = Object.entries(columnVisibility)
        .filter(([, visible]) => visible === false)
        .map(([id]) => id);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ order, hidden }));
    } catch {
      // localStorage unavailable — layout just won't persist across reloads.
    }
  }, [columnOrder, columnVisibility, layoutLoaded]);

  const tanstackColumns = useMemo(() => {
    const helper = legacyCreateColumnHelper<Lead>();
    const cols: LegacyColumnDef<Lead>[] = [
      helper.display({ id: "select", size: 32, minSize: 32, maxSize: 32, enableResizing: false, header: () => null, cell: () => null }),
      ...COLUMNS.map((spec) =>
        helper.display({ id: spec.id, size: spec.width, minSize: 70, maxSize: 420, header: () => null, cell: () => null }),
      ),
    ];
    return cols;
  }, []);

  const filteredRows = useMemo(() => applyColumnFilters(leads, columnFilters), [leads, columnFilters]);
  const sortedRows = useMemo(() => sortRows(filteredRows, tableSort), [filteredRows, tableSort]);

  const table = useLegacyTable({
    data: sortedRows,
    columns: tanstackColumns,
    state: { columnOrder, columnVisibility, columnSizing, rowSelection },
    onColumnOrderChange: makeUpdater(setColumnOrderState),
    onColumnVisibilityChange: makeUpdater(setColumnVisibilityState),
    onColumnSizingChange: makeUpdater(setColumnSizingState),
    onRowSelectionChange: makeUpdater(setRowSelectionState),
    columnResizeMode: "onChange",
    enableRowSelection: true,
    getRowId: (row: Lead) => row.id,
    getCoreRowModel: getCoreRowModel(),
  });

  const headerGroup = table.getHeaderGroups()[0];
  const visibleHeaders = useMemo(
    () => headerGroup.headers.filter((h) => h.id === "select" || !(isNarrow && COLUMNS_BY_ID[h.id]?.lowPriority)),
    [headerGroup, isNarrow],
  );
  const gridTemplateColumns = visibleHeaders.map((h) => `${h.getSize()}px`).join(" ");
  const totalWidth = visibleHeaders.reduce((sum, h) => sum + h.getSize(), 0);

  const rows = table.getRowModel().rows;
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 14,
  });

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;
  const allSelected = table.getIsAllRowsSelected();
  const someSelected = table.getIsSomeRowsSelected();
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerCheckboxRef.current) headerCheckboxRef.current.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);

  const chooserColumns = useMemo(
    () => columnOrder.filter((id) => id !== "select").map((id) => ({ id, label: COLUMNS_BY_ID[id]?.label ?? id })),
    [columnOrder],
  );
  const hiddenSet = useMemo(() => new Set(Object.entries(columnVisibility).filter(([, v]) => v === false).map(([k]) => k)), [
    columnVisibility,
  ]);

  const selectedLeads = useMemo(() => rows.filter((r) => rowSelection[r.id]).map((r) => r.original), [rows, rowSelection]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="ld-table-toolbar">
        <span className="ld-table-toolbar-count">
          {selectedCount > 0 ? `${selectedCount} selected` : `${sortedRows.length} leads`}
        </span>
        {selectedCount > 0 && (
          <button
            type="button"
            className="ld-btn"
            disabled={bulkPending}
            onClick={() => onBulkMarkContacted(selectedLeads.filter((l) => l.ghlContactId))}
          >
            <Phone size={12} /> {bulkPending ? "Saving…" : "Mark contacted"}
          </button>
        )}
        <button type="button" className="ld-btn" onClick={() => exportCsv(selectedCount > 0 ? selectedLeads : sortedRows)}>
          <Download size={12} /> Export CSV
        </button>
        {Object.keys(columnFilters).length > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--ld-text-muted)" }}>
            <ListFilter size={12} /> {Object.keys(columnFilters).length} column filter(s)
            <button type="button" className="ld-btn ld-btn-ghost" onClick={() => setColumnFilters({})}>
              Clear
            </button>
          </span>
        )}
        <div style={{ flex: 1 }} />
        <ColumnChooser
          columns={chooserColumns}
          hiddenColumns={hiddenSet}
          onToggleVisibility={(id) => table.getColumn(id)?.toggleVisibility()}
          onReorder={(order) => setColumnOrderState(["select", ...order])}
        />
      </div>

      <div className="ld-table-wrap" ref={scrollRef} role="table" aria-label="Leads">
        <div className="ld-grid-table" style={{ width: totalWidth }}>
          <div className="ld-grid-head" style={{ gridTemplateColumns }} role="row">
            {visibleHeaders.map((header) => {
              const spec = COLUMNS_BY_ID[header.id];
              if (header.id === "select") {
                return (
                  <div key={header.id} className="ld-th-cell" role="columnheader" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <input
                      ref={headerCheckboxRef}
                      type="checkbox"
                      className="ld-checkbox"
                      checked={allSelected}
                      onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                  </div>
                );
              }
              if (!spec) return null;
              return (
                <div key={header.id} className="ld-th-cell" role="columnheader">
                  <HeaderMenu
                    spec={spec}
                    sort={tableSort}
                    onSetSort={onSetTableSort}
                    filterValue={columnFilters[spec.id]}
                    onSetFilter={(value) =>
                      setColumnFilters((prev) => {
                        const next = { ...prev };
                        if (value) next[spec.id] = value;
                        else delete next[spec.id];
                        return next;
                      })
                    }
                    onHide={() => table.getColumn(spec.id)?.toggleVisibility(false)}
                    distinctOptions={spec.selectValue ? distinctValues(leads, spec.selectValue) : []}
                  />
                  {header.column.getCanResize() && (
                    <div
                      className="ld-col-resizer"
                      data-resizing={header.column.getIsResizing()}
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ position: "relative", height: rowVirtualizer.getTotalSize() }}>
            {rowVirtualizer.getVirtualItems().map((vr) => {
              const row = rows[vr.index];
              const lead = row.original;
              const tier = activationTier(lead.activation);
              return (
                <div
                  key={row.id}
                  className="ld-grid-row ld-grid-row-abs"
                  role="row"
                  data-selected={row.getIsSelected() || lead.id === selectedLeadId}
                  style={{
                    gridTemplateColumns,
                    transform: `translateY(${vr.start}px)`,
                    height: vr.size,
                    ...(tier ? { boxShadow: `inset 3px 0 0 0 ${ACTIVATION_COLORS[tier]}` } : {}),
                  }}
                >
                  {visibleHeaders.map((header) => {
                    if (header.id === "select") {
                      return (
                        <div
                          key="select"
                          className="ld-td-cell"
                          role="cell"
                          style={{ justifyContent: "center" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="ld-checkbox"
                            checked={row.getIsSelected()}
                            onChange={row.getToggleSelectedHandler()}
                          />
                        </div>
                      );
                    }
                    const spec = COLUMNS_BY_ID[header.id];
                    if (!spec) return null;
                    return (
                      <div
                        key={header.id}
                        className={`ld-td-cell ${spec.kind !== "select" ? "ld-table-cell-muted" : ""}`}
                        role="cell"
                        onClick={() => onSelectLead(lead)}
                      >
                        {spec.render ? spec.render(lead) : spec.text(lead)}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
