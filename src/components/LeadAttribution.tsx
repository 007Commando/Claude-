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
  /**
   * The Google click identifier, if this visitor arrived on a paid Google
   * click. Held separately from `source` because the two answer different
   * questions and have different lifetimes: `source` is first-touch and
   * decides which walkthrough the account gets, while the click id is
   * last-touch and is the only key Google will accept when we upload the
   * conversion back to it weeks later.
   */
  clickId?: string;
  /** Which parameter the click id came from: gclid, wbraid or gbraid. */
  clickSource?: string;
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

/**
 * Google auto-tagging appends exactly one of these. `gclid` is the ordinary
 * case; `wbraid` and `gbraid` appear when the click crossed an iOS privacy
 * boundary or came from an app surface, and Google's conversion import accepts
 * all three. Checked in this order because only one is ever present.
 */
const CLICK_PARAMS = ["gclid", "wbraid", "gbraid"] as const;

function AttributionCapture() {
  const params = useSearchParams();

  useEffect(() => {
    const visitorId = params.get("pw_vid") ?? undefined;
    const utmSource = params.get("utm_source") ?? undefined;
    const utmMedium = params.get("utm_medium") ?? undefined;
    const utmCampaign = params.get("utm_campaign") ?? undefined;
    const referrer = document.referrer || undefined;

    const clickSource = CLICK_PARAMS.find((name) => params.get(name));
    const clickId = clickSource ? params.get(clickSource) ?? undefined : undefined;

    const existing = readStoredAttribution();

    // Explicit UTM/click-id params always win (a deliberate campaign click).
    // Otherwise, first-touch: keep whatever attribution we already captured.
    //
    // A Google click is the one case where those two rules disagree. Auto-
    // tagging adds gclid whether or not a tracking template adds utm_source,
    // so a paid click can arrive with a click id and nothing else. When that
    // happens to a visitor who already has stored attribution — a PrimeWell
    // applicant who later clicks an ad — the first-touch source is kept,
    // because it is what decides their walkthrough, and only the click id is
    // refreshed. Losing the click id would cost us the conversion upload;
    // overwriting the source would cost them the right onboarding.
    if (!utmSource && !visitorId && existing) {
      if (clickId && existing.clickId !== clickId) {
        try {
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ ...existing, clickId, clickSource }),
          );
        } catch {
          // localStorage unavailable; nothing else to do here.
        }
      }
      return;
    }

    const resolvedSource = utmSource ?? sourceFromReferrer(referrer ?? "") ?? "direct";
    const attribution: StoredAttribution = {
      source: resolvedSource,
      visitorId,
      utmSource,
      utmMedium,
      utmCampaign,
      clickId,
      clickSource,
    };
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
        clickId,
        clickSource,
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
