import type { LeadSource } from "../../../lib/leads/model";
import { SOURCE_ABBR, SOURCE_LABELS } from "./shared";

/**
 * Small brand mark for a lead's source on the board cards (Stefano,
 * 2026-09-29: "the small logo of facebook and primewell" instead of text).
 * Sources without a recognisable mark keep the short text tag.
 */
export default function SourceLogo({ source }: { source: LeadSource }) {
  const label = SOURCE_LABELS[source];
  if (source === "primewell") {
    return (
      <span className="ld-source-logo" title={label}>
        <img src="/logos/primewell.png" alt={label} width={16} height={16} />
      </span>
    );
  }
  if (source === "facebook-form" || source === "facebook-web") {
    return (
      <span className="ld-source-logo" title={label}>
        <svg viewBox="0 0 24 24" width={16} height={16} aria-label={label} role="img">
          <circle cx="12" cy="12" r="12" fill="#1877F2" />
          <path
            fill="#fff"
            d="M13.4 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.7v3h2.6V21h3.1z"
          />
        </svg>
        {source === "facebook-web" && <span className="ld-source-sub">web</span>}
      </span>
    );
  }
  if (source === "google") {
    return (
      <span className="ld-source-logo" title={label}>
        <svg viewBox="0 0 48 48" width={16} height={16} aria-label={label} role="img">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.2 13.6 17.6 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h12.7c-.3 2.1-1.7 5.3-4.8 7.4l7.4 5.7c4.4-4.1 7.2-10 7.2-16.8z" />
          <path fill="#FBBC05" d="M10.4 28.7A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.8-6.1z" />
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2 1.4-4.7 2.4-8.5 2.4-6.4 0-11.8-4.1-13.6-9.9l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
        </svg>
      </span>
    );
  }
  return <span className="ld-tag">{SOURCE_ABBR[source]}</span>;
}
