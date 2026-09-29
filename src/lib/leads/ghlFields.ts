/**
 * Resolves GHL custom field IDs to their field keys (e.g. "sells_on_amazon"),
 * so a contact's `customFields: [{id, value}]` array — which is all the
 * contacts list/detail endpoints return — can be read by the same keys the
 * lead forms write with (see src/app/api/pop-qualify/route.ts).
 *
 * Cached per location for the life of the server process: field definitions
 * essentially never change, and re-fetching them on every Lead Desk load
 * would be one more call per request for no benefit.
 */

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
const REQUEST_TIMEOUT_MS = 8000;

interface GhlCustomFieldDef {
  id: string;
  fieldKey?: string;
  key?: string;
}

const cache = new Map<string, Record<string, string>>();

export async function getCustomFieldKeyMap(token: string, locationId: string): Promise<Record<string, string>> {
  const cached = cache.get(locationId);
  if (cached) return cached;

  const map: Record<string, string> = {};
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(`${GHL_BASE_URL}/locations/${locationId}/customFields?model=contact`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Version: GHL_VERSION,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    if (!res.ok) return map;
    const data = (await res.json()) as { customFields?: GhlCustomFieldDef[] };
    for (const field of data.customFields ?? []) {
      // fieldKey looks like "contact.sells_on_amazon"; the part after the
      // last dot is what upsertGhlContact and pop-qualify's route write with.
      const raw = field.fieldKey ?? field.key;
      const key = raw?.includes(".") ? raw.slice(raw.lastIndexOf(".") + 1) : raw;
      if (key) map[field.id] = key;
    }
  } catch {
    // No custom field map — decodeCustomFields below will just return {},
    // which downstream code treats as "unknown seller type, no obstacle/timing".
  }

  cache.set(locationId, map);
  return map;
}

export function decodeCustomFields(
  raw: { id: string; value: unknown }[] | undefined,
  idToKey: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const field of raw ?? []) {
    const key = idToKey[field.id];
    if (key && field.value != null && field.value !== "") out[key] = String(field.value);
  }
  return out;
}
