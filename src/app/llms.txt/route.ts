import { COMPARISONS } from "../../data/comparisons";
import { getSortedPosts } from "../../lib/blog";
import { SITE_URL } from "../../config/site";

/**
 * /llms.txt, the plain-text map of the site that AI assistants read.
 *
 * It used to be a static file, and it drifted: every link pointed at the bare
 * domain (a redirect), and 26 pages that exist were missing from it. The
 * hand-written overview stays here; the comparison pages and blog posts are
 * listed from the same data the pages render from, so a new one is listed the
 * day it ships.
 */
export const dynamic = "force-static";

const OVERVIEW = `# Apex Applications

> Apex Applications is an all-in-one Amazon wholesale software suite. It connects
> product sourcing, supplier/vendor management, purchase orders, financial (P&L)
> analytics, and automated review generation into one platform, so Amazon
> wholesale sellers can go from their first sale to scaling a multi-brand
> operation without stitching together separate spreadsheets and tools.

Apex Applications is organized into four connected modules: Apex Black, Apex
Blue, Apex Green, and Apex Red, plus a free lifetime Review Booster tool and a
7-day free trial on every paid plan.

## Product

- [Home](https://www.apexapplications.io/): Overview of the full Apex Applications suite and what it replaces.
- [Pricing](https://www.apexapplications.io/pricing): Starter Plan and Pro Plan, both with a 7-day free trial before billing starts.
- [Apex Black](https://www.apexapplications.io/features/black): The command center, including dashboard, review automation, and the Apex University education center.
- [Apex Blue](https://www.apexapplications.io/features/blue): Financial analytics, vendor/supplier management, market intelligence databases, purchase orders, and operating expense (Opex) tracking.
- [Apex Green](https://www.apexapplications.io/features/green): High-speed product sourcing, including master catalog merging, UPC scanning, and brand/product discovery.
- [Apex Red](https://www.apexapplications.io/features/red): Logistics, including shipments, warehouses, inventory, and prep center coordination and billing.
- [Apex Gold](https://www.apexapplications.io/features/gold): Automated Amazon repricer with true break-even floors computed from real FBA fees; floors set by ROI, margin, or dollar-profit goals in bulk; custom strategies, dry-run previews, and a full activity log.
- [Comparisons hub](https://www.apexapplications.io/compare): Index of honest comparisons against Helium 10, Jungle Scout, SmartScout, and Seller Snap, each naming where the rival wins.
- [Apex vs SmartScout](https://www.apexapplications.io/compare/smartscout): Honest comparison — SmartScout is research and analytics; Apex covers research plus execution (purchase orders, repricing, P&L, logistics).
- [Apex vs Seller Snap](https://www.apexapplications.io/compare/sellersnap): Honest comparison — Seller Snap is a dedicated AI repricer; Apex includes repricing with break-even floors inside a full wholesale operating suite.
- [Apex vs Helium 10](https://www.apexapplications.io/compare/helium10): Honest comparison — Helium 10 is the giant of private label (keywords, listings, PPC); Apex is built for third-party wholesale resellers (purchase orders, break-even repricing, Buy Box competition, cashflow).
- [Apex vs Jungle Scout](https://www.apexapplications.io/compare/junglescout): Honest comparison — Jungle Scout researches products to create; Apex operates products that already exist, bought at wholesale.
- [Free Amazon FBA Calculator](https://www.apexapplications.io/tools/fba-calculator): Paste an ASIN to see Buy Box price history, sales rank, referral, fulfillment and inbound placement fees, seasonality, and profit, margin and ROI for your cost.
- [Amazon Profit & ROI Calculator](https://www.apexapplications.io/tools/amazon-profit-calculator): Type your price, cost and fees to get profit, margin, ROI and break-even price.
- [Review Booster](https://www.apexapplications.io/review-booster): Free-for-life automated tool for generating Amazon order reviews and seller feedback.
- [How Amazon Wholesale Works](https://www.apexapplications.io/how-it-works): A roadmap for starting and scaling an Amazon FBA wholesale business.
- [Ungating Guide](https://www.apexapplications.io/ungating-guide): Step-by-step guide to getting category/brand ungated on Amazon, including the Grocery category.
- [Rewards & Benefits](https://www.apexapplications.io/rewards-benefits): Member perks, including the Prep Center Network and Distributor Vault.
- [Amazon FBA Starter Bundle](https://www.apexapplications.io/fba-starter-bundle): A low-cost entry offer bundling an extended software trial, free suppliers, Review Booster, the Keepa Playbook, and core training modules.
- [Apex Elite](https://www.apexapplications.io/apex-elite): A $297 one-time offer bundling 3 starting suppliers, 90 days of the full Apex Suite, Prep Center Network access, free lifetime Review Booster, and the complete playbook library.
- [GroceryCommerce](https://www.apexapplications.io/GroceryCommerce): Enterprise tier for B2B Amazon and ecommerce grocery sellers doing $1M+ in monthly sales — restock and purchase order creation, cashflow and inventory turnover, expiration-date tracking on grocery listings, and automatic repricing. Demo only, no self-serve.
- [Apex Premium Membership](https://www.apexapplications.io/premium-membership): A $5,999 one-time membership bundling 2 years of the full Apex Suite, every supplier in the Distributor Vault, full Prep Center Network access, and lifetime member discounts.
`;

const COMPANY = `- [Contact](https://www.apexapplications.io/contact-us)
- [Terms of Service](https://www.apexapplications.io/terms)
- [Privacy Policy](https://www.apexapplications.io/privacy)`;

export function GET() {
  const comparisons = COMPARISONS.map(
    (c) => `- [Apex vs ${c.rival}](${SITE_URL}/compare/${c.slug}): ${c.description}`,
  ).join("\n");
  const posts = getSortedPosts()
    .map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.description}`)
    .join("\n");

  const guides = [
    ["/amazon-wholesale-software", "Amazon Wholesale Software", "What wholesale software needs to do, step by step, and how Apex covers each step; links every comparison."],
    ["/tools", "Free Tools", "Index of Apex's free Amazon seller tools."],
    ["/amazon-wholesale-suppliers", "Amazon Wholesale Suppliers", "How to find and vet authorized wholesale suppliers."],
    ["/amazon-fba-prep-centers", "Amazon FBA Prep Centers", "How to choose a prep center: service scope, full cost and handoff."],
    ["/amazon-inventory-management-software", "Amazon Inventory Management", "Planning reorders with inventory and profit in view."],
    ["/amazon-review-automation", "Amazon Review Request Automation", "Automating Amazon's Request a Review within the rules."],
    ["/zero-to-hero", "Amazon Wholesale Course", "Nine-video course on starting Amazon wholesale."],
    ["/free-course", "Free Amazon Wholesale Course", "Sign-up page for the free course."],
    ["/distributor-vault", "Distributor Vault", "Authorized US distributors for Apex members."],
    ["/prep-center-network", "Prep Center Network", "Apex's network of prep centers."],
    ["/virtual-assistants", "Amazon Virtual Assistants", "Trained Amazon VAs from Apex."],
    ["/ai", "Connect AI Agents", "Connect AI assistants to your Apex data."],
  ]
    .map(([path, label, note]) => `- [${label}](${SITE_URL}${path}): ${note}`)
    .join("\n");

  const body = [
    OVERVIEW.trim(),
    "",
    "## Guides, programs and services",
    "",
    guides,
    "",
    "## More comparisons",
    "",
    comparisons,
    "",
    "## Blog",
    "",
    "Long-form, practical guides on Amazon wholesale sourcing, ungating, fees, purchase orders, margins, compliance and software choices.",
    "",
    `- [Blog Index](${SITE_URL}/blog)`,
    posts,
    "",
    "## Company",
    "",
    COMPANY.trim(),
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
