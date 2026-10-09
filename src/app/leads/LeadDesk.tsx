"use client";

/**
 * Lead Desk — Aliza's CRM for every lead Apex/PrimeWell touch. This file is
 * the thin shell: it owns data fetching, the optimistic "mark contacted"
 * mutation, the selected-lead drawer, and the board/table view switch.
 * Everything else lives in ./components — see useLeadFilters.tsx for the
 * URL-backed filter/view/sort state every child reads from.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { qualifiedScore } from "../../lib/leads/model";
import { indexCallsByContact, type SalesCall } from "../../lib/leads/calls";
import type { Lead, LeadGrade, Stage } from "../../lib/leads/model";
import type { LeadsTotals } from "../../lib/leads/build";
import TopBar from "./components/TopBar";
import KpiStrip from "./components/KpiStrip";
import Board from "./components/Board";
import LeadTable from "./components/LeadTable";
import { STAGE_LABELS } from "./components/shared";
import LivePanel from "./components/LivePanel";
import AdsView from "./components/AdsView";
import FunnelView from "./components/FunnelView";
import CallsView from "./components/CallsView";
import CallListView from "./components/CallListView";
import LeadDrawer from "./components/LeadDrawer";
import JourneyOverlay from "./components/JourneyOverlay";
import ChangesBanner, { changedIds as idsOf, takeChanges, type Changes } from "./components/ChangesBanner";
import { useLeadFilters, filterLeads, todayStartIso, TEAM_VIEWS } from "./components/useLeadFilters";
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
  // A grade set this session, shown before GHL confirms it. null means cleared.
  const [gradeOverrides, setGradeOverrides] = useState<Record<string, LeadGrade | null>>({});
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  // Board clicks open the journey path; the drawer opens from there or from the table.
  const [journeyLeadId, setJourneyLeadId] = useState<string | null>(null);
  // Sales calls from the last 90 days. Empty (never an error) until the backend job that stores them is deployed.
  const [calls, setCalls] = useState<SalesCall[]>([]);
  const [callsLoading, setCallsLoading] = useState(false);
  const [changes, setChanges] = useState<Changes | null>(null);
  const [changesShown, setChangesShown] = useState(true);
  const mainRef = useRef<HTMLDivElement>(null);

  const filters = useLeadFilters();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const loadCalls = useCallback(async () => {
    setCallsLoading(true);
    try {
      const res = await fetch(apiUrl("/api/leads/calls?days=90"), { cache: "no-store" });
      if (!res.ok) {
        console.warn(`[sales-calls] list answered ${res.status}`);
        setCalls([]);
        return;
      }
      const json = (await res.json()) as { calls?: SalesCall[] };
      setCalls(Array.isArray(json.calls) ? json.calls : []);
    } catch (err) {
      console.warn("[sales-calls] could not load calls", err);
      setCalls([]);
    } finally {
      setCallsLoading(false);
    }
  }, []);

  const load = useCallback(async (fresh: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl(`/api/leads${fresh ? "?fresh=1" : ""}`), { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      setData(json);
      // What moved since this browser last loaded the desk, then remember today's picture.
      setChanges(takeChanges(json.leads ?? []));
      setChangesShown(true);
      void loadCalls();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [loadCalls]);

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
      let out = override ? { ...l, lastOutreachAt: override.lastOutreachAt, outreachCount: override.outreachCount } : l;
      if (l.id in gradeOverrides) {
        const grade = gradeOverrides[l.id];
        const withGrade = { ...out, grade, tags: [...out.tags.filter((t) => !/^grade:[abc]$/.test(t)), ...(grade ? [`grade:${grade.toLowerCase()}`] : [])] };
        out = { ...withGrade, score: qualifiedScore(withGrade) };
      }
      return out;
    });
  }, [data, overrides, gradeOverrides]);

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
      filters.stage,
      filters.scope,
    ],
  );

  // The monthly goal counts the whole month whatever range is picked.
  const goalLeads = useMemo(() => effectiveLeads.filter((l) => !l.internal), [effectiveLeads]);

  const leadsByStage = useMemo(() => {
    const out = {} as Record<Stage, Lead[]>;
    for (const stage of STAGES) out[stage] = [];
    for (const lead of filteredLeads) out[lead.stage].push(lead);
    return out;
  }, [filteredLeads]);

  const journeyLead = useMemo(
    () => (journeyLeadId ? effectiveLeads.find((l) => l.id === journeyLeadId) ?? null : null),
    [effectiveLeads, journeyLeadId],
  );
  const changed = useMemo(() => idsOf(changes), [changes]);
  // Calls by GHL contact id; the board, table and drawer look a lead up through callsForLead.
  const callsByContact = useMemo(() => indexCallsByContact(calls), [calls]);

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

  const setGrade = useCallback(
    async (lead: Lead, grade: LeadGrade | null) => {
      setActionError(null);
      const hadOverride = lead.id in gradeOverrides;
      const previous = gradeOverrides[lead.id];
      setGradeOverrides((prev) => ({ ...prev, [lead.id]: grade }));
      try {
        const res = await fetch(apiUrl("/api/leads/action"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId: lead.id, action: "grade", grade, by: data?.loggedInAs ?? "" }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `Request failed: ${res.status}`);
      } catch (err) {
        setGradeOverrides((prev) => {
          const next = { ...prev };
          if (hadOverride) next[lead.id] = previous;
          else delete next[lead.id];
          return next;
        });
        setActionError(err instanceof Error ? err.message : "Failed to set grade");
      }
    },
    [data?.loggedInAs, gradeOverrides],
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

      {changes && changesShown && (
        <ChangesBanner
          changes={changes}
          onOpenLead={(l) => {
            if (filters.view !== "board") filters.setView("board");
            setJourneyLeadId(l.id);
          }}
          onDismiss={() => setChangesShown(false)}
        />
      )}

      {data?.isOwner && (
        <KpiStrip
          leads={filteredLeads}
          goalLeads={goalLeads}
          todaySince={filters.datePreset === "today" && filters.scope === "activity" ? todayStartIso() : null}
          goalTrials={data.goalTrials}
          goalMonth={data.goalMonth}
        />
      )}

      <div className="ld-main" ref={mainRef}>
        {loading && !data ? (
          <SkeletonBoard />
        ) : data ? (
          // A team member who opens an owner-only view (an old link, a typed
          // ?view=) gets the board instead.
          (filters.view === "board" || (!data.isOwner && !TEAM_VIEWS.includes(filters.view))) ? (
            <Board leadsByStage={leadsByStage} filters={filters} todaySince={filters.datePreset === "today" && filters.scope === "activity" ? todayStartIso() : null} selectedLeadId={selectedLeadId} onSelectLead={(l) => setJourneyLeadId(l.id)} changedIds={changed} callsByContact={callsByContact} />
          ) : filters.view === "call-list" ? (
            <CallListView leads={effectiveLeads} callsByContact={callsByContact} onOpenLead={(l) => setSelectedLeadId(l.id)} />
          ) : filters.view === "funnels" ? (
            <FunnelView leads={effectiveLeads} filters={filters} />
          ) : filters.view === "live" ? (
            <LivePanel />
          ) : filters.view === "ads" ? (
            <AdsView leads={effectiveLeads} />
          ) : filters.view === "calls" ? (
            <CallsView calls={calls} loading={callsLoading} leads={effectiveLeads} onOpenLead={(l) => setSelectedLeadId(l.id)} showCommissions={data.isOwner} />
          ) : (
            <>
            {filters.stage && (
              <div className="ld-stage-note">
                Showing only <strong>{STAGE_LABELS[filters.stage]}</strong>
                <button type="button" onClick={() => filters.setStage(null)}>
                  Show all stages
                </button>
              </div>
            )}
            <LeadTable
              leads={filteredLeads}
              tableSort={filters.tableSort}
              onSetTableSort={filters.setTableSort}
              onSelectLead={(l) => setSelectedLeadId(l.id)}
              selectedLeadId={selectedLeadId}
              onBulkMarkContacted={bulkMarkContacted}
              bulkPending={bulkPending}
              callsByContact={callsByContact}
            />
            </>
          )
        ) : null}

        {journeyLead && filters.view === "board" && (
          <JourneyOverlay
            lead={journeyLead}
            container={mainRef.current}
            onClose={() => setJourneyLeadId(null)}
            onOpenDetails={() => {
              setSelectedLeadId(journeyLead.id);
              setJourneyLeadId(null);
            }}
          />
        )}

        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLeadId(null)}
          onMarkContacted={markContacted}
          onSetGrade={setGrade}
          repName={data?.loggedInAs && !data.loggedInAs.includes("@") ? data.loggedInAs : ""}
          pending={selectedLead ? pendingIds.has(selectedLead.id) : false}
          error={actionError}
          callsByContact={callsByContact}
        />
      </div>
    </section>
  );
}
