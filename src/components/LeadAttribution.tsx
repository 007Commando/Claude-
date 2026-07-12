"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "apex_attribution";

export interface StoredAttribution {
  source: string;
  visitorId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export function readStoredAttribution(): StoredAttribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAttribution) : null;
  } catch {
    return null;
  }
}

function sourceFromReferrer(referrer: string): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host.includes("google.")) return "google";
    if (host.includes("bing.")) return "bing";
    if (host.includes("facebook.") || host.includes("fb.")) return "facebook";
    if (host.includes("instagram.")) return "instagram";
    if (host.includes("primewell")) return "primewell";
    return host;
  } catch {
    return null;
  }
}

function AttributionCapture() {
  const params = useSearchParams();

  useEffect(() => {
    const visitorId = params.get("pw_vid") ?? undefined;
    const utmSource = params.get("utm_source") ?? undefined;
    const utmMedium = params.get("utm_medium") ?? undefined;
    const utmCampaign = params.get("utm_campaign") ?? undefined;
    const referrer = document.referrer || undefined;

    const existing = readStoredAttribution();
    // Explicit UTM/click-id params always win (a deliberate campaign click).
    // Otherwise, first-touch: keep whatever attribution we already captured.
    if (!utmSource && !visitorId && existing) return;

    const resolvedSource = utmSource ?? sourceFromReferrer(referrer ?? "") ?? "direct";
    const attribution: StoredAttribution = { source: resolvedSource, visitorId, utmSource, utmMedium, utmCampaign };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    } catch {
      // localStorage unavailable (private mode, etc.) — still fire the event below
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: resolvedSource,
        event: "apex_landing",
        visitorId,
        url: window.location.href,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign,
      }),
      keepalive: true,
    }).catch(() => {});
    // Runs once per full page load (this layout doesn't remount on client
    // navigation), which is the right cadence for a first-touch landing event.
  }, [params]);

  return null;
}

export default function LeadAttribution() {
  return (
    <Suspense fallback={null}>
      <AttributionCapture />
    </Suspense>
  );
}
