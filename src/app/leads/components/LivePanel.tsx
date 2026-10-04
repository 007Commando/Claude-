"use client";

import { useEffect, useState } from "react";
import AppLiveView from "./AppLiveView";
import LiveView from "./LiveView";

/**
 * The Live tab's three views (Stefano, 2026-10-04): only the Facebook funnel,
 * the whole website, or signed-in users inside the app. The choice is kept
 * in the URL (?live=) so a refresh or a shared link opens the same view.
 */
type Mode = "funnel" | "site" | "app";
const MODES: { id: Mode; label: string }[] = [
  { id: "funnel", label: "Facebook funnel" },
  { id: "site", label: "Whole website" },
  { id: "app", label: "In the app" },
];

function readMode(): Mode {
  if (typeof window === "undefined") return "funnel";
  const value = new URLSearchParams(window.location.search).get("live");
  return value === "site" || value === "app" ? value : "funnel";
}

export default function LivePanel() {
  const [mode, setMode] = useState<Mode>("funnel");
  useEffect(() => setMode(readMode()), []);

  const choose = (next: Mode) => {
    setMode(next);
    const url = new URL(window.location.href);
    url.searchParams.set("live", next);
    window.history.replaceState(null, "", url.toString());
  };

  return (
    <div className="ld-live-panel">
      <div className="ld-live-switch" role="tablist" aria-label="Live View">
        {MODES.map((m) => (
          <button key={m.id} type="button" role="tab" aria-selected={mode === m.id} onClick={() => choose(m.id)}>
            {m.label}
          </button>
        ))}
      </div>
      {mode === "app" ? <AppLiveView /> : <LiveView key={mode} scope={mode} />}
    </div>
  );
}
