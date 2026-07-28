export interface GhlAttribution {
  utmSource?: string;
  utmSessionSource?: string;
  referrer?: string;
  medium?: string;
  isFirst?: boolean;
}

// GHL's contact attributions array records every touch; the first one
// (isFirst: true) is where this lead actually originated, which is what
// "where did this lead come from" means — later touches are just re-visits.
function firstTouch(attributions: GhlAttribution[] | undefined): GhlAttribution | null {
  if (!attributions || attributions.length === 0) return null;
  return attributions.find((a) => a.isFirst) ?? attributions[0];
}

/**
 * Turns a contact's first-touch attribution into a human-readable traffic
 * source label (e.g. "Google", "ChatGPT", "Facebook Ads", "Imported").
 * Patterns are derived from real attribution data observed across the
 * PrimeWell/ASH/Facebook GHL accounts — extend the matchers below as new
 * sources show up rather than assuming this list is exhaustive.
 */
export function deriveTrafficSource(attributions: GhlAttribution[] | undefined): string {
  const first = firstTouch(attributions);
  if (!first) return "Direct";

  const utmSource = (first.utmSource ?? "").toLowerCase();
  const referrer = (first.referrer ?? "").toLowerCase();
  const medium = (first.medium ?? "").toLowerCase();
  const sessionSource = first.utmSessionSource ?? "";
  const haystack = `${utmSource} ${referrer}`;

  // Bulk-imported contacts (e.g. from a webinar registration list) never had
  // a real web session to attribute — "Direct" would misleadingly imply
  // organic traffic, so call this out separately.
  if (medium === "csv_import" || sessionSource === "CRM UI") return "Imported";

  if (haystack.includes("chatgpt")) return "ChatGPT";
  if (haystack.includes("google.com") || sessionSource === "Organic Search") return "Google";
  if (haystack.includes("bing.com")) return "Bing";
  if (haystack.includes("wholesalecentral") || haystack.includes("wholesale central")) return "Wholesale Central";
  if (
    utmSource === "fb" ||
    haystack.includes("facebook") ||
    medium === "facebook" ||
    sessionSource === "Paid Social" ||
    sessionSource === "Social media"
  ) {
    return "Facebook Ads";
  }
  if (haystack.includes("sellerassistant")) return "Seller Assistant";

  if (first.referrer) {
    try {
      const domain = new URL(first.referrer).hostname.replace(/^www\./, "");
      return `Referral: ${domain}`;
    } catch {
      // Malformed referrer URL — fall through to Direct.
    }
  }

  return "Direct";
}
