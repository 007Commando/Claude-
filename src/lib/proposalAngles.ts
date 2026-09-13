/**
 * The three message angles under test on /proposal. Shared by the server
 * page (which resolves the variant from the URL) and the client component
 * (which renders it) — deliberately not a "use client" module so the
 * server can call resolveAngle.
 */
export const ANGLE_TAGS = ["first_order_roadmap", "wholesale_suppliers", "better_buying"] as const;

export type Angle = (typeof ANGLE_TAGS)[number];

export const DEFAULT_ANGLE: Angle = "first_order_roadmap";

/** ?angle= wins, utm_content may carry it, anything else falls back. */
export function resolveAngle(...candidates: (string | undefined)[]): Angle {
  for (const candidate of candidates) {
    if (candidate && (ANGLE_TAGS as readonly string[]).includes(candidate)) {
      return candidate as Angle;
    }
  }
  return DEFAULT_ANGLE;
}
