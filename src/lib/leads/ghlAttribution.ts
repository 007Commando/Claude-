/**
 * The Meta ad behind each Facebook instant-form lead.
 *
 * Instant-form leads reach GHL through its own Facebook integration, which
 * writes no utm_* custom fields, so 186 of the last 30 days' form leads had no
 * ad at all on Lead Desk (2026-10-08). GHL does keep the ad on the contact's
 * attributionSource: campaign, ad set and ad names and Meta ids. Only the
 * contact search endpoint returns that block (the list endpoint drops it), so
 * the Facebook-sourced contacts are read again here, a few pages at most.
 */

export interface AdAttribution {
  campaign: string | null;
  campaignId: string | null;
  adset: string | null;
  adsetId: string | null;
  ad: string | null;
  adId: string | null;
}

interface GhlAttributionBlock {
  campaign?: string | null;
  utmCampaign?: string | null;
  campaignId?: string | null;
  utmMedium?: string | null;
  adSetId?: string | null;
  utmContent?: string | null;
  adId?: string | null;
  adSource?: string | null;
  medium?: string | null;
}

interface SearchPage {
  contacts?: { id: string; attributionSource?: GhlAttributionBlock | null; searchAfter?: unknown[] }[];
  total?: number;
}

const PAGE = 100;
const MAX_PAGES = 30;
const clean = (v: string | null | undefined) => (v ?? "").trim() || null;

function fromBlock(a: GhlAttributionBlock | null | undefined): AdAttribution | null {
  if (!a) return null;
  const isFacebook = [a.adSource, a.medium].some((v) => (v ?? "").toLowerCase().includes("facebook"));
  if (!isFacebook && !a.adId && !a.campaignId) return null;
  const out: AdAttribution = {
    campaign: clean(a.campaign ?? a.utmCampaign),
    campaignId: clean(a.campaignId),
    // GHL's Facebook integration puts the ad set's name in utmMedium.
    adset: clean(a.utmMedium),
    adsetId: clean(a.adSetId),
    ad: clean(a.utmContent),
    adId: clean(a.adId),
  };
  return out.campaign || out.ad || out.adId ? out : null;
}

/** GHL contact id → the ad it came from, for Apex's own location. Never throws. */
export async function getFacebookAttribution(): Promise<{ byContact: Map<string, AdAttribution>; error?: string }> {
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  const byContact = new Map<string, AdAttribution>();
  if (!token || !locationId) return { byContact, error: "GHL not configured" };

  let searchAfter: unknown[] | undefined;
  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const res = await fetch("https://services.leadconnectorhq.com/contacts/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Version: "2021-07-28",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          locationId,
          pageLimit: PAGE,
          filters: [{ field: "source", operator: "eq", value: "Facebook" }],
          ...(searchAfter ? { searchAfter } : {}),
        }),
        cache: "no-store",
      });
      if (!res.ok) return { byContact, error: `GHL contact search failed: ${res.status}` };
      const json = (await res.json()) as SearchPage;
      const contacts = json.contacts ?? [];
      for (const c of contacts) {
        const a = fromBlock(c.attributionSource);
        if (a) byContact.set(c.id, a);
      }
      const last = contacts[contacts.length - 1];
      if (contacts.length < PAGE || !last?.searchAfter) break;
      searchAfter = last.searchAfter;
    }
    return { byContact };
  } catch (err) {
    return { byContact, error: err instanceof Error ? err.message : "GHL contact search failed" };
  }
}
