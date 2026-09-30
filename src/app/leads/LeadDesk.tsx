"use client";

/**
 * Lead Desk — Aliza's CRM for every lead Apex/PrimeWell touch. This file is
 * the thin shell: it owns data fetching, the optimistic "mark contacted"
 * mutation, the selected-lead drawer, and the board/table view switch.
 * Everything else lives in ./components — see useLeadFilters.tsx for the
 * URL-backed filter/view/sort state every child reads from.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Lead, Stage } from "../../lib/leads/model";
import type { LeadsTotals } from "../../lib/leads/build";
import TopBar from "./components/TopBar";
import KpiStrip from "./components/KpiStrip";
import Board from "./components/Board";
import LeadTable from "./components/LeadTable";
import LeadDrawer from "./components/LeadDrawer";
import { useLeadFilters, filterLeads } from "./components/useLeadFilters";
import { apiUrl, STAGES } from "./components/shared";
import "./leadDesk.css";

interface LeadsResponse {
  generatedAt: string;
  leads: Lead[];
  totals: LeadsTotals;
  warnings: string[];
  loggedInAs: string | null;
  goalTrials: number;
  goalMonth: string;
  allowedEmails: string[];
  isOwner: boolean;
}

function SkeletonBoard() {
  return (
    <div className="ld-skeleton-board">
      {STAGES.map((stage) => (
        <div key={stage} className="ld-skeleton-col">
          <div className="ld-skeleton-col-header" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="ld-skeleton-card">
              <div />
              <div />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function LeadDesk() {
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, { lastOutreachAt: string; outreachCount: number }>>({});
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const filters = useLeadFilters();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (fresh: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl(`/api/leads${fresh ? "?fresh=1" : ""}`), { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global keyboard shortcuts: "/" focuses search, Esc closes the drawer.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape" && selectedLeadId) {
        setSelectedLeadId(null);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedLeadId]);

  const effectiveLeads = useMemo(() => {
    if (!data) return [];
    return data.leads.map((l) => {
      const override = overrides[l.id];
      if (!override) return l;
      return { ...l, lastOutreachAt: override.lastOutreachAt, outreachCount: override.outreachCount };
    });
  }, [data, overrides]);

  const filteredLeads = useMemo(
    () => filterLeads(effectiveLeads, filters),
    // filters is a fresh object each render (derived from the URL) — its
    // primitive/array fields are the real dependencies here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      effectiveLeads,
      filters.q,
      filters.source.join(","),
      filters.sellerType.join(","),
      filters.datePreset,
      filters.from,
      filters.to,
      filters.ash,
    ],
  );

  const leadsByStage = useMemo(() => {
    const out = {} as Record<Stage, Lead[]>;
    for (const stage of STAGES) out[stage] = [];
    for (const lead of filteredLeads) out[lead.stage].push(lead);
    return out;
  }, [filteredLeads]);

  const selectedLead = useMemo(
    () => (selectedLeadId ? effectiveLeads.find((l) => l.id === selectedLeadId) ?? null : null),
    [effectiveLeads, selectedLeadId],
  );

  const markContacted = useCallback(
    async (lead: Lead, note: string) => {
      setActionError(null);
      setPendingIds((prev) => new Set(prev).add(lead.id));
      try {
        const res = await fetch(apiUrl("/api/leads/action"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId: lead.id, action: "contacted", note: note || undefined, by: data?.loggedInAs ?? "" }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `Request failed: ${res.status}`);
        setOverrides((prev) => ({
          ...prev,
          [lead.id]: { lastOutreachAt: json.outreachDate as string, outreachCount: lead.outreachCount + 1 },
        }));
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to mark contacted");
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(lead.id);
          return next;
        });
      }
    },
    [data?.loggedInAs],
  );

  const bulkPending = pendingIds.size > 0;
  const bulkMarkContacted = useCallback(
    async (leads: Lead[]) => {
      for (const lead of leads) {
        // Sequential on purpose — GHL's API rate-limits bursts, and this
        // reuses the same single-lead path (including its optimistic update).
        // eslint-disable-next-line no-await-in-loop
        await markContacted(lead, "");
      }
    },
    [markContacted],
  );

  return (
    <section className="lead-desk">
      <TopBar
        filters={filters}
        loggedInAs={data?.loggedInAs ?? null}
        isOwner={data?.isOwner ?? false}
        allowedEmails={data?.allowedEmails ?? []}
        loading={loading}
        onRefresh={() => load(true)}
        searchInputRef={searchInputRef}
      />

      {error && <div className="ld-banner ld-banner-error">{error}</div>}
      {actionError && <div className="ld-banner ld-banner-error">{actionError}</div>}
      {data && data.warnings.length > 0 && (
        <div className="ld-banner ld-banner-warning">{data.warnings.join(" · ")}</div>
      )}

      {data && <KpiStrip leads={filteredLeads} goalTrials={data.goalTrials} goalMonth={data.goalMonth} />}

      <div className="ld-main">
        {loading && !data ? (
          <SkeletonBoard />
        ) : data ? (
          filters.view === "board" ? (
            <Board leadsByStage={leadsByStage} filters={filters} selectedLeadId={selectedLeadId} onSelectLead={(l) => setSelectedLeadId(l.id)} />
          ) : (
            <LeadTable
              leads={filteredLeads}
              tableSort={filters.tableSort}
              onSetTableSort={filters.setTableSort}
              onSelectLead={(l) => setSelectedLeadId(l.id)}
              selectedLeadId={selectedLeadId}
              onBulkMarkContacted={bulkMarkContacted}
              bulkPending={bulkPending}
            />
          )
        ) : null}

        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLeadId(null)}
          onMarkContacted={markContacted}
          pending={selectedLead ? pendingIds.has(selectedLead.id) : false}
          error={actionError}
        />
      </div>
    </section>
  );
}
