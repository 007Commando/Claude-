"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { readStoredAttribution } from "./LeadAttribution";
import { SIGNUP_PREFILL_KEY } from "../config/signupPrefill";
import { liveState, onLiveChange } from "../lib/live/client";

/**
 * The heartbeat behind Lead Desk's Live tab.
 *
 * Every fifteen seconds while the tab is visible, and at once on a page
 * change, it tells /api/live/beat which page this visitor is on and how far
 * into the funnel that is. A hidden or closed tab sends one last beat marked
 * `left`, so the dot comes off the map instead of lingering for the window.
 *
 * Silent on internal pages (Lead Desk, the dashboard), for automated
 * browsers, and on any failure: this must never cost a visitor anything.
 */

const SID_KEY = "apex_live_sid";
const VID_KEY = "apex_live_vid";
const BEAT_MS = 15_000;

function randomId() {
  try {
    return crypto.randomUUID().replace(/-/g, "");
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

function sessionIds(): { sid: string; vid: string; returning: boolean } | null {
  try {
    let sid = sessionStorage.getItem(SID_KEY);
    if (!sid) {
      sid = randomId();
      sessionStorage.setItem(SID_KEY, sid);
    }
    let vid = localStorage.getItem(VID_KEY);
    const returning = Boolean(vid);
    if (!vid) {
      vid = randomId();
      localStorage.setItem(VID_KEY, vid);
    }
    return { sid, vid, returning };
  } catch {
    return null;
  }
}

function stageFor(pathname: string, step?: number) {
  if (pathname.startsWith("/checkout")) return "checkout";
  if (pathname.startsWith("/auth")) return "signup";
  if (pathname.startsWith("/apex-pop/start") && step) return "form";
  return "browsing";
}

/** The email and name the qualifier or the PrimeWell form already left in this tab. */
function storedIdentity(): { email?: string; name?: string } {
  for (const key of [SIGNUP_PREFILL_KEY, "apex_pw_prefill"]) {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { email?: string; name?: string };
      if (parsed.email) return { email: parsed.email, name: parsed.name };
    } catch {
      // not ours to fix
    }
  }
  return {};
}

function isInternal(pathname: string) {
  return pathname.startsWith("/leads") || pathname.startsWith("/dashboard") || pathname.startsWith("/api");
}

export default function LiveBeacon() {
  const pathname = usePathname() || "/";
  const ids = useRef<ReturnType<typeof sessionIds>>(null);
  const firstReturning = useRef<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || isInternal(pathname)) return;
    if (navigator.webdriver) return;
    // Only the real site: a dev server or a preview deploy must not put dots on the live map.
    if (!/(^|\.)apexapplications\.io$/.test(window.location.hostname)) return;
    if (!ids.current) {
      ids.current = sessionIds();
      firstReturning.current = ids.current?.returning ?? false;
    }
    const current = ids.current;
    if (!current) return;

    const payload = (left = false) => {
      // The URL first: on the landing beat the attribution component may not
      // have stored this visit's UTMs yet, and a Facebook click would read as direct.
      const params = new URLSearchParams(window.location.search);
      const attribution = readStoredAttribution();
      const live = liveState();
      const stored = storedIdentity();
      const step = pathname.startsWith("/apex-pop/start") ? live.step ?? 1 : undefined;
      return JSON.stringify({
        sid: current.sid,
        vid: current.vid,
        returning: firstReturning.current ?? false,
        path: pathname,
        stage: stageFor(pathname, step),
        step,
        email: live.email ?? stored.email,
        name: live.name ?? stored.name,
        source: params.get("utm_source") || attribution?.utmSource || attribution?.source,
        medium: params.get("utm_medium") || attribution?.utmMedium,
        campaign: params.get("utm_campaign") || attribution?.utmCampaign,
        referrer: document.referrer || undefined,
        left,
      });
    };

    const beat = () => {
      if (document.visibilityState !== "visible") return;
      fetch("/api/live/beat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload(),
        keepalive: true,
      }).catch(() => {});
    };
    const leave = () => {
      try {
        navigator.sendBeacon("/api/live/beat", new Blob([payload(true)], { type: "application/json" }));
      } catch {
        // nothing to do
      }
    };

    beat();
    const timer = window.setInterval(beat, BEAT_MS);
    const onVisibility = () => (document.visibilityState === "visible" ? beat() : leave());
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", leave);
    const unsubscribe = onLiveChange(beat);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", leave);
      unsubscribe();
    };
  }, [pathname]);

  return null;
}
