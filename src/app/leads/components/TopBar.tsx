"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, RefreshCw, Search, X } from "lucide-react";
import type { LeadSource, SellerType } from "../../../lib/leads/model";
import { ALL_SELLER_TYPES, ALL_SOURCES, SELLER_TYPE_LABELS, SOURCE_LABELS } from "./shared";
import { DATE_PRESET_OPTIONS, type LeadFilters } from "./useLeadFilters";

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

function MultiSelectDropdown<T extends string>({
  label,
  options,
  labels,
  selected,
  onChange,
}: {
  label: string;
  options: T[];
  labels: Record<T, string>;
  selected: T[];
  onChange: (values: T[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));
  const toggle = (v: T) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

  return (
    <div className="ld-popover-anchor" ref={ref}>
      <button type="button" className="ld-dd-btn" data-active={selected.length > 0} onClick={() => setOpen((o) => !o)}>
        {label}
        {selected.length > 0 && <span className="ld-dd-count">{selected.length}</span>}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="ld-popover">
          {options.map((opt) => (
            <label key={opt} className="ld-popover-option" style={{ cursor: "pointer" }}>
              <input type="checkbox" className="ld-checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
              {labels[opt]}
            </label>
          ))}
          {selected.length > 0 && (
            <>
              <div className="ld-popover-divider" />
              <div className="ld-popover-option" onClick={() => onChange([])}>
                Clear
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DateDropdown({ filters }: { filters: LeadFilters }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));
  const activeLabel = DATE_PRESET_OPTIONS.find((o) => o.value === filters.datePreset)?.label ?? "All time";

  return (
    <div className="ld-popover-anchor" ref={ref}>
      <button type="button" className="ld-dd-btn" data-active={filters.datePreset !== "all"} onClick={() => setOpen((o) => !o)}>
        {activeLabel}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="ld-popover">
          {DATE_PRESET_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className="ld-popover-option"
              data-active={filters.datePreset === opt.value}
              onClick={() => {
                filters.setDatePreset(opt.value);
                if (opt.value !== "custom") setOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
          {filters.datePreset === "custom" && (
            <>
              <div className="ld-popover-divider" />
              <div className="ld-popover-row">
                <input
                  type="date"
                  className="ld-popover-input"
                  value={filters.from}
                  onChange={(e) => filters.setCustomRange(e.target.value, filters.to)}
                />
                <span style={{ color: "var(--ld-text-faint)" }}>to</span>
                <input
                  type="date"
                  className="ld-popover-input"
                  value={filters.to}
                  onChange={(e) => filters.setCustomRange(filters.from, e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function TopBar({
  filters,
  loggedInAs,
  loading,
  onRefresh,
  searchInputRef,
}: {
  filters: LeadFilters;
  loggedInAs: string | null;
  loading: boolean;
  onRefresh: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="ld-topbar">
      <span className="ld-topbar-title">Lead Desk</span>

      <div className="ld-view-switch">
        <button type="button" data-active={filters.view === "board"} onClick={() => filters.setView("board")}>
          Board
        </button>
        <button type="button" data-active={filters.view === "table"} onClick={() => filters.setView("table")}>
          Table
        </button>
      </div>

      <div className="ld-search">
        <Search size={13} />
        <input
          ref={searchInputRef}
          type="text"
          value={filters.q}
          onChange={(e) => filters.setQuery(e.target.value)}
          placeholder="Search name, email, phone…  (/)"
        />
        {filters.q && (
          <span className="ld-search-clear" onClick={() => filters.setQuery("")}>
            <X size={13} />
          </span>
        )}
      </div>

      <MultiSelectDropdown<LeadSource>
        label="Source"
        options={ALL_SOURCES}
        labels={SOURCE_LABELS}
        selected={filters.source}
        onChange={filters.setSource}
      />
      <MultiSelectDropdown<SellerType>
        label="Seller type"
        options={ALL_SELLER_TYPES}
        labels={SELLER_TYPE_LABELS}
        selected={filters.sellerType}
        onChange={filters.setSellerType}
      />
      <DateDropdown filters={filters} />

      <label className="ld-toggle-label">
        <span className="ld-switch" data-on={filters.ash} onClick={() => filters.setAsh(!filters.ash)} />
        Include Amazon Success Hub
      </label>

      <div className="ld-topbar-right">
        <button type="button" className={`ld-icon-btn ${loading ? "spinning" : ""}`} onClick={onRefresh} title="Refresh" disabled={loading}>
          <RefreshCw size={13} />
        </button>
        {loggedInAs && <span className="ld-signed-in">{loggedInAs}</span>}
        <a href="/dashboard" className="ld-dd-btn">
          Dashboard
        </a>
      </div>
    </div>
  );
}
