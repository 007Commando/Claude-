"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, RefreshCw, Search, UserPlus, X } from "lucide-react";
import type { LeadSource, SellerType } from "../../../lib/leads/model";
import { ALL_SELLER_TYPES, ALL_SOURCES, SELLER_TYPE_LABELS, SOURCE_LABELS } from "./shared";
import { DATE_PRESET_OPTIONS, DEFAULT_DATE_PRESET, type LeadFilters } from "./useLeadFilters";

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

const SCOPE_OPTIONS: { value: LeadFilters["scope"]; label: string }[] = [
  { value: "new", label: "New leads only" },
  { value: "activity", label: "All activity" },
];

function DateDropdown({ filters }: { filters: LeadFilters }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));
  const activeLabel = DATE_PRESET_OPTIONS.find((o) => o.value === filters.datePreset)?.label ?? "Today";

  return (
    <div className="ld-popover-anchor" ref={ref}>
      <button type="button" className="ld-dd-btn" data-active={filters.datePreset !== DEFAULT_DATE_PRESET} onClick={() => setOpen((o) => !o)}>
        {activeLabel}
        {filters.datePreset !== "all" && filters.scope === "activity" && <span className="ld-dd-sub"> · all activity</span>}
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
          <div className="ld-popover-divider" />
          {SCOPE_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className="ld-popover-option"
              data-active={filters.scope === opt.value}
              onClick={() => filters.setScope(opt.value)}
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

/** Lead Desk's own invite link — invitees still need their Google account added to LEAD_DESK_ALLOWED_EMAILS before they can sign in. */
const LEAD_DESK_URL = "https://www.apexapplications.io/leads";

function InvitePopover({ allowedEmails }: { allowedEmails: string[] }) {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));

  const inviteMessage = () => {
    const to = address.trim();
    return `You're invited to Apex's Lead Desk. Sign in with your Google account here: ${LEAD_DESK_URL}${
      to ? ` (as ${to})` : ""
    }. If it doesn't let you in, ask Stefano to add your Google email to the invite list first.`;
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can be unavailable (older browsers, non-HTTPS) — the mailto link below still works.
    }
  };

  const mailtoHref = `mailto:${encodeURIComponent(address.trim())}?subject=${encodeURIComponent(
    "Lead Desk access",
  )}&body=${encodeURIComponent(inviteMessage())}`;

  return (
    <div className="ld-popover-anchor" ref={ref}>
      <button type="button" className="ld-dd-btn" onClick={() => setOpen((o) => !o)}>
        <UserPlus size={12} />
        Invite
      </button>
      {open && (
        <div className="ld-popover ld-popover-right ld-invite-popover">
          <div className="ld-popover-section-title">Currently invited</div>
          <div className="ld-invite-list">
            {allowedEmails.map((email) => (
              <div key={email} className="ld-invite-list-item">
                {email}
              </div>
            ))}
          </div>
          <div className="ld-popover-divider" />
          <input
            type="email"
            className="ld-popover-input"
            placeholder="colleague@email.com"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="ld-invite-note" style={{ marginTop: 8 }}>
            Adding an address to the list is done in the site settings by Stefano.
          </div>
          <div className="ld-popover-footer">
            <a className="ld-btn" href={mailtoHref}>
              Email invite
            </a>
            <button type="button" className="ld-btn ld-btn-primary" onClick={copyInvite}>
              {copied ? "Copied" : "Copy invite email"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TopBar({
  filters,
  loggedInAs,
  isOwner,
  teamMode,
  teamMembers,
  viewAs,
  onViewAs,
  allowedEmails,
  loading,
  onRefresh,
  searchInputRef,
}: {
  filters: LeadFilters;
  loggedInAs: string | null;
  isOwner: boolean;
  /** True for a team member, or for the owner while previewing one. */
  teamMode: boolean;
  teamMembers: { email: string; name: string }[];
  viewAs: string | null;
  onViewAs: (email: string | null) => void;
  allowedEmails: string[];
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
        <button type="button" data-active={filters.view === "call-list"} onClick={() => filters.setView("call-list")}>
          Call list
        </button>
        {!teamMode && (
          <>
            <button type="button" data-active={filters.view === "funnels"} onClick={() => filters.setView("funnels")}>
              Funnels
            </button>
            <button type="button" data-active={filters.view === "ads"} onClick={() => filters.setView("ads")}>
              Facebook ads
            </button>
            <button type="button" data-active={filters.view === "emails"} onClick={() => filters.setView("emails")}>
              Emails
            </button>
          </>
        )}
        <button type="button" data-active={filters.view === "calls"} onClick={() => filters.setView("calls")}>
          Calls
        </button>
        {!teamMode && (
          <button type="button" data-active={filters.view === "live"} onClick={() => filters.setView("live")}>
            <span className="ld-live-tabdot" aria-hidden="true" />
            Live
          </button>
        )}
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

      {!teamMode && (
        <label className="ld-toggle-label">
          <span className="ld-switch" data-on={filters.ash} onClick={() => filters.setAsh(!filters.ash)} />
          Include Amazon Success Hub
        </label>
      )}

      <div className="ld-topbar-right">
        <button type="button" className={`ld-icon-btn ${loading ? "spinning" : ""}`} onClick={onRefresh} title="Refresh" disabled={loading}>
          <RefreshCw size={13} />
        </button>
        {loggedInAs && <span className="ld-signed-in">{loggedInAs}</span>}
        {loggedInAs && (
          <a href="/leads/sign-out" className="ld-signout-link">
            Sign out
          </a>
        )}
        {isOwner && teamMembers.length > 0 && (
          <select
            className="ld-viewas"
            aria-label="View as"
            value={viewAs ?? ""}
            onChange={(e) => onViewAs(e.target.value || null)}
          >
            <option value="">View as: me</option>
            {teamMembers.map((m) => (
              <option key={m.email} value={m.email}>
                View as: {m.name}
              </option>
            ))}
          </select>
        )}
        {isOwner && <InvitePopover allowedEmails={allowedEmails} />}
        {!teamMode && (
          <a href="/dashboard" className="ld-dd-btn">
            Dashboard
          </a>
        )}
      </div>
    </div>
  );
}
