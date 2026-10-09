import type { SalesCall } from "./calls";

/**
 * Server-side reader for the backend's sales-call endpoints, written like
 * apexFetch in ../dashboard/apex.ts (same base URL, same apiKey query
 * param). Those endpoints answer 404 until the backend job is deployed, so a
 * missing endpoint is "no calls yet", never an error: callers get an empty
 * list and one console.warn.
 */

const BASE_URL = process.env.APEX_API_URL ?? "https://app.apexapplications.io/api";
const TIMEOUT_MS = 20_000;

function withKey(path: string): string {
  const key = process.env.APEX_INTERNAL_API_KEY ?? "";
  const separator = path.includes("?") ? "&" : "?";
  return `${BASE_URL}${path}${separator}apiKey=${encodeURIComponent(key)}`;
}

async function readCalls(path: string): Promise<SalesCall[]> {
  if (!process.env.APEX_INTERNAL_API_KEY) {
    console.warn("[sales-calls] APEX_INTERNAL_API_KEY is not set");
    return [];
  }
  try {
    const res = await fetch(withKey(path), {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.warn(`[sales-calls] ${path.split("?")[0]} answered ${res.status}`);
      return [];
    }
    const json = (await res.json()) as { calls?: SalesCall[] };
    return Array.isArray(json.calls) ? json.calls : [];
  } catch (error) {
    console.warn(`[sales-calls] ${path.split("?")[0]} failed: ${String(error)}`);
    return [];
  }
}

/** Calls started in the last `days` days, newest first, without transcripts. */
export function getSalesCalls(days: number): Promise<SalesCall[]> {
  const until = new Date();
  const since = new Date(until.getTime() - days * 86_400_000);
  return readCalls(`/internal/sales-calls?since=${encodeURIComponent(since.toISOString())}&until=${encodeURIComponent(until.toISOString())}`);
}

/** Every call with one contact, with transcripts. */
export function getContactCalls(contactId: string): Promise<SalesCall[]> {
  return readCalls(`/internal/sales-calls/contact/${encodeURIComponent(contactId)}`);
}

/** The recording's audio as the backend serves it, or null when there is none. Range is forwarded so the player can seek. */
export async function getRecording(messageId: string, range: string | null): Promise<Response | null> {
  if (!process.env.APEX_INTERNAL_API_KEY) return null;
  try {
    const res = await fetch(withKey(`/internal/sales-calls/${encodeURIComponent(messageId)}/recording`), {
      headers: range ? { Range: range } : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok && res.status !== 206) {
      if (res.status !== 404) console.warn(`[sales-calls] recording answered ${res.status}`);
      return null;
    }
    return res;
  } catch (error) {
    console.warn(`[sales-calls] recording failed: ${String(error)}`);
    return null;
  }
}
