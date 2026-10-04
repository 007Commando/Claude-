/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /**
   * Static files were served with max-age=0, so every visit re-downloaded or
   * revalidated the hero video, logos and screenshots. /__l5e paths are named
   * by content id and never change, so they cache for a year; the rest for 30
   * days, revalidating in the background.
   */
  async headers() {
    return [
      {
        source: "/__l5e/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:dir(videos|images|assets|logos|ads)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
    ];
  },
  async redirects() {
    // Blog slugs were shortened shortly after launch. These keep any link or
    // crawler that already picked up the original URL from hitting a 404.
    const oldToNewBlogSlugs = {
      "how-to-start-amazon-wholesale-2026": "start-amazon-wholesale",
      "amazon-ungating-guide-2026": "amazon-ungating-guide",
      "reading-keepa-charts-wholesale": "reading-keepa-charts",
      "amazon-purchase-order-workflow": "purchase-order-workflow",
      "automating-amazon-review-requests": "automate-review-requests",
      "choosing-a-prep-center-amazon-fba": "choosing-a-prep-center",
      "amazon-wholesale-profit-margins-2026": "wholesale-profit-margins",
      "how-much-does-it-cost-to-start-amazon-wholesale-2026": "cost-to-start-wholesale",
      "amazon-wholesale-vs-private-label-vs-retail-arbitrage": "wholesale-vs-private-label",
      "real-cost-of-stacking-amazon-seller-software": "cost-of-seller-software",
      "why-we-built-apex-applications": "why-apex-applications",
    };
    // Addresses from the old site that Google still shows in results (seen in
    // Search Console, October 2026). Each one 404ed; now it lands on the page
    // that replaced it.
    const legacyPages = {
      "/privacy-policy": "/privacy",
      "/terms-of-service": "/terms",
      "/company-1": "/",
    };
    return [
      ...Object.entries(oldToNewBlogSlugs).map(([oldSlug, newSlug]) => ({
        source: `/blog/${oldSlug}`,
        destination: `/blog/${newSlug}`,
        permanent: true,
      })),
      ...Object.entries(legacyPages).map(([source, destination]) => ({ source, destination, permanent: true })),
    ];
  },
};

export default nextConfig;
