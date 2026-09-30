import type { Lead, LeadSource } from "../../../lib/leads/model";
import SourceLogo from "./SourceLogo";

/**
 * Where a board column's people came from, at a glance (Stefano, 2026-09-30:
 * "what percentage of the trialing leads are from Facebook"). A thin stacked
 * bar plus the shares, grouped into PrimeWell, Facebook (form + web), Google
 * and everything else. Counts sit in the hover title.
 */
type Group = { key: string; label: string; color: string; logo: LeadSource | null; sources: LeadSource[] };

const GROUPS: Group[] = [
  { key: "primewell", label: "PrimeWell", color: "#1d4ed8", logo: "primewell", sources: ["primewell"] },
  { key: "facebook", label: "Facebook", color: "#5b21b6", logo: "facebook-form", sources: ["facebook-form", "facebook-web"] },
  { key: "google", label: "Google", color: "#ea4335", logo: "google", sources: ["google"] },
  { key: "other", label: "Other", color: "#cbd5e1", logo: null, sources: ["direct", "chatgpt", "other", "ash"] },
];

function pct(n: number, total: number): string {
  if (!total) return "0%";
  const p = (n / total) * 100;
  return p > 0 && p < 1 ? "<1%" : `${Math.round(p)}%`;
}

export default function SourceSplit({ leads }: { leads: Lead[] }) {
  const total = leads.length;
  const counts = GROUPS.map((g) => ({ ...g, n: leads.filter((l) => g.sources.includes(l.source)).length }));
  const shown = counts.filter((g) => g.n > 0);
  const title = total
    ? counts.map((g) => `${g.label}: ${g.n} (${pct(g.n, total)})`).join("\n")
    : "No leads";

  return (
    <div className="ld-split" title={title}>
      <div className="ld-split-bar" aria-hidden="true">
        {total === 0 ? (
          <span style={{ flex: 1, background: "var(--ld-border, #e5e7eb)" }} />
        ) : (
          shown.map((g) => <span key={g.key} style={{ flex: g.n, background: g.color }} />)
        )}
      </div>
      <div className="ld-split-legend">
        {total === 0 ? (
          <span className="ld-split-empty">No leads</span>
        ) : (
          shown.map((g) => (
            <span key={g.key} className="ld-split-item">
              {g.logo ? <SourceLogo source={g.logo} /> : <span className="ld-split-swatch" style={{ background: g.color }} />}
              <span className="ld-split-pct">{pct(g.n, total)}</span>
              {!g.logo && <span className="ld-split-name">{g.label}</span>}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
