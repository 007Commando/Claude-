/**
 * Putting a lead into Apex's own GoHighLevel location (GHL_LOCATION_ID), for
 * the routes that feed it: the /primewell sign-up form and the PrimeWell
 * application webhook.
 *
 * Upsert first, then add tags in their own call: GHL's upsert replaces the
 * contact's tag list with whatever it is given, which would strip a contact
 * who already exists of the tags they carry.
 */

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

export class GhlNotConfigured extends Error {}

export type GhlLocationName = "apex" | "primewell";

/**
 * Tags and notes are per-contact writes and a contact only ever lives in one
 * location, so callers that know which location (e.g. Lead Desk, matching a
 * lead's own `ghlLocation`) can pick the right token instead of always
 * writing against Apex's own GHL_LOCATION_ID.
 */
function tokenFor(location: GhlLocationName): string | undefined {
  return location === "primewell"
    ? process.env.GHL_PRIMEWELL_PRIVATE_INTEGRATION_TOKEN
    : process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
}

/** US numbers typed without a country code are the common case here. */
export function normalisePhone(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits.length >= 9 ? digits : null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

async function ghl(path: string, token: string, init: RequestInit): Promise<Response> {
  return fetch(`${GHL_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Version: GHL_VERSION,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
}

export interface UpsertedContact {
  id: string;
  /** The tags the contact carried before this call added any. */
  tags: string[];
}

export async function upsertGhlContact(fields: {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  source: string;
  /**
   * Custom fields by their key (the part after `contact.` in GHL), which is
   * how the Facebook lead-form mapping already names them. Written on the
   * upsert itself so a contact who exists gets the new answers too.
   */
  customFields?: { key: string; value: string }[];
}): Promise<UpsertedContact> {
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) throw new GhlNotConfigured("GHL is not configured");

  const res = await ghl("/contacts/upsert", token, {
    method: "POST",
    body: JSON.stringify({
      locationId,
      firstName: fields.firstName || undefined,
      lastName: fields.lastName || undefined,
      name: fields.name || undefined,
      email: fields.email || undefined,
      phone: fields.phone || undefined,
      source: fields.source,
      customFields: fields.customFields?.length
        ? fields.customFields.map((f) => ({ key: f.key, field_value: f.value }))
        : undefined,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GHL upsert failed: ${res.status} ${detail.slice(0, 300)}`);
  }
  const { contact } = (await res.json()) as { contact?: { id?: string; tags?: string[] } };
  if (!contact?.id) throw new Error("GHL upsert returned no contact");
  return { id: contact.id, tags: contact.tags ?? [] };
}

/**
 * Takes tags off one contact. Used only to undo a tag the same visitor set
 * seconds earlier (changing their answer on the qualifier), never to clean
 * up in bulk.
 */
export async function removeGhlTags(contactId: string, tags: string[]): Promise<void> {
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  if (!token) throw new GhlNotConfigured("GHL is not configured");
  const res = await ghl(`/contacts/${contactId}/tags`, token, {
    method: "DELETE",
    body: JSON.stringify({ tags }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GHL untag failed: ${res.status} ${detail.slice(0, 300)}`);
  }
}

export async function addGhlTags(contactId: string, tags: string[], location: GhlLocationName = "apex"): Promise<void> {
  const token = tokenFor(location);
  if (!token) throw new GhlNotConfigured("GHL is not configured");
  const res = await ghl(`/contacts/${contactId}/tags`, token, {
    method: "POST",
    body: JSON.stringify({ tags }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GHL tag failed: ${res.status} ${detail.slice(0, 300)}`);
  }
}

/** Best effort: a note that says where the contact came from. */
export async function addGhlNote(contactId: string, body: string, location: GhlLocationName = "apex"): Promise<void> {
  const token = tokenFor(location);
  if (!token) return;
  await ghl(`/contacts/${contactId}/notes`, token, {
    method: "POST",
    body: JSON.stringify({ body }),
  }).catch(() => undefined);
}
