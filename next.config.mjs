/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    return Object.entries(oldToNewBlogSlugs).map(([oldSlug, newSlug]) => ({
      source: `/blog/${oldSlug}`,
      destination: `/blog/${newSlug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
