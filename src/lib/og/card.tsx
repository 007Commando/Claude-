import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

/**
 * The social card every shared link shows (1200 x 630).
 *
 * The site's only card used to be a near-blank screenshot of an old preview
 * build, hosted on someone else's bucket, and it sat on every page. This draws
 * one from the page's own words instead, so a shared blog post shows its
 * headline and a shared tool shows what it does.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/** Inter (OFL), bundled so the cards are drawn in the site's own typeface at real weights. */
const fonts = () =>
  Promise.all(
    (["500", "800"] as const).map(async (weight) => ({
      name: "Inter",
      data: await readFile(path.join(process.cwd(), "src/lib/og", `Inter-${weight}.ttf`)),
      weight: Number(weight) as 500 | 800,
      style: "normal" as const,
    })),
  );

export async function ogCard({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  const long = title.length > 60;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 55%, #eff6ff 100%)",
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#2563eb",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            A
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800, color: "#0f172a", letterSpacing: -0.5 }}>
            APEX
            <span style={{ fontSize: 16, color: "#2563eb", marginLeft: 6, marginTop: 2, fontWeight: 800 }}>APPLICATIONS</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 800,
              color: "#2563eb",
              textTransform: "uppercase",
              letterSpacing: 3,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: long ? 56 : 68,
              fontWeight: 800,
              color: "#020617",
              lineHeight: 1.08,
              letterSpacing: -1.5,
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ display: "flex", fontSize: 28, color: "#475569", lineHeight: 1.35, maxWidth: 980 }}>{subtitle}</div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 22, color: "#64748b", fontWeight: 700 }}>www.apexapplications.io</div>
          <div style={{ display: "flex", height: 10, width: 260, borderRadius: 999, background: "linear-gradient(90deg, #2563eb, #22d3ee)" }} />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
