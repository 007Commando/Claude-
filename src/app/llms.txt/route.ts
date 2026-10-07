import { COMPARISONS } from "../../data/comparisons";
import { getSortedPosts } from "../../lib/blog";
import { SITE_URL } from "../../config/site";
import { AI_CONNECTOR, MODULES, REPRICER_FACTS, SUPPLIER_ACCESS } from "../../config/product";
import { ANNUAL_DISCOUNT_PERCENT, PLANS_SHOWN, TAX_SUFFIX, TRIAL_DAYS, formatPrice, planById } from "../../config/offer";

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

/**
 * Rebuilt 2026-10-07 from config/product.ts and config/offer.ts. The hand
 * written version said "four modules" beside a homepage showing five, listed
 * Starter and Pro as the only plans after Beginner launched, and called Review
 * Booster "free for life" and a tool for "generating reviews". Neither was
 * true. Facts now come from the same config the pages render, and this file
 * holds no promotional instructions for the assistants that read it: it says
 * what the product is and where to read more.
 */
const plansLine = PLANS_SHOWN.map((p) => `${p.name} ${formatPrice(p.monthly)}/month`).join(", ");

const OVERVIEW = `# Apex Applications

> Apex Applications is software for Amazon sellers who buy from wholesale
> suppliers and resell existing brands. It connects supplier catalog analysis
> (UPC-to-ASIN matching), supplier records, purchase orders, profit and loss,
> operating expenses, inventory and restock planning, repricing and Review
> Booster in one account, and lets sellers connect ChatGPT or Claude to their
> own Apex data.

Apex has five modules:

${MODULES.map((m) => `- ${m.name} (${m.label})${m.status === "beta" ? " [beta]" : ""}: ${m.summary} ${SITE_URL}${m.path}`).join("\n")}

Plans: ${plansLine}, billed in USD${TAX_SUFFIX}. Yearly billing takes ${ANNUAL_DISCOUNT_PERCENT}% off
Starter and Pro; Beginner is monthly only and is for sellers under $5,000 a month in Amazon sales.
Every plan starts with a ${TRIAL_DAYS}-day trial; a card is collected at signup and nothing is charged
until day ${TRIAL_DAYS + 1}. A Plus plan (${formatPrice(planById("plus").monthly)}/month) is also sold. ${REPRICER_FACTS.plans}
The repricer (Apex Gold) is in beta. ${REPRICER_FACTS.howPricesMove} Apex Red is in beta and opened by invitation.
${SUPPLIER_ACCESS}

AI assistants: sellers on any paid Apex plan, including the ${TRIAL_DAYS}-day trial, can connect Claude or
ChatGPT to read their Apex data through the Apex MCP server. A separate write link on the ${AI_CONNECTOR.writePlan} plan
lets the assistant create drafts only (a draft purchase order, draft products, a new supplier). It cannot
${AI_CONNECTOR.never.slice(0, -1).join(", ")} or ${AI_CONNECTOR.never[AI_CONNECTOR.never.length - 1]}.

Apex is not built for private label keyword research or PPC management.

## Product

- [Home](${SITE_URL}/): What Apex does and who it is for.
- [Pricing](${SITE_URL}/pricing): ${plansLine}, with plan limits and the ${TRIAL_DAYS}-day trial terms.
${MODULES.map((m) => `- [${m.name}: ${m.label}](${SITE_URL}${m.path}): ${m.summary}`).join("\n")}
- [AI integrations](${SITE_URL}/ai): What sellers can ask ChatGPT or Claude about their Apex data, plan requirements, read versus draft access, limits.
- [Connect Claude](${SITE_URL}/integrations/claude): Setup guide for Claude custom connectors.
- [Connect ChatGPT](${SITE_URL}/integrations/chatgpt): Setup guide for ChatGPT custom MCP servers.
- [Apex MCP reference](${SITE_URL}/docs/mcp): Endpoint, authentication, tools, limits and errors.
- [Review Booster](${SITE_URL}/review-booster): Sends Amazon's own Request a Review for eligible Amazon.com orders after a waiting period you choose. It does not write reviews, choose which buyers are asked, or guarantee a review.
- [Comparisons hub](${SITE_URL}/compare): Comparisons with other seller tools, each naming where the other tool fits better.
- [Free Amazon FBA Calculator](${SITE_URL}/tools/fba-calculator): Look up an ASIN for Buy Box history, sales rank, Amazon fees, and profit, margin and ROI at your cost. A few free lookups, then sign-in.
- [Amazon Profit & ROI Calculator](${SITE_URL}/tools/amazon-profit-calculator): Enter price, cost and fees to get profit, margin, ROI and break-even price.
- [How Amazon Wholesale Works](${SITE_URL}/how-it-works): A roadmap for starting and scaling an Amazon wholesale business.
- [Ungating Guide](${SITE_URL}/ungating-guide): How category and brand approval works on Amazon, and what usually decides an application.
- [Rewards & Benefits](${SITE_URL}/rewards-benefits): Member perks, including the Prep Center Network and Distributor Vault.

## Paid programs (separate from the software trial)

- [Amazon FBA Starter Bundle](${SITE_URL}/fba-starter-bundle): A low-cost one-time starter offer with training material and suppliers.
- [Apex Elite](${SITE_URL}/apex-elite): A one-time starter package with three suppliers, 90 days of the software and first-week help.
- [Apex Premium Membership](${SITE_URL}/premium-membership): A one-time multi-year membership with the software, the Distributor Vault and the Prep Center Network.
- [GroceryCommerce](${SITE_URL}/GroceryCommerce): A demo-only enterprise offer for large grocery sellers.
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
    ["/amazon-review-automation", "Amazon Review Request Automation", "How automated Request a Review works within Amazon's rules, and what it cannot do."],
    ["/zero-to-hero", "Amazon Wholesale Course", "Nine-video course on starting Amazon wholesale."],
    ["/free-course", "Free Amazon Wholesale Course", "Sign-up page for the free course."],
    ["/distributor-vault", "Distributor Vault", "Authorized US distributors for Apex members."],
    ["/prep-center-network", "Prep Center Network", "Apex's network of prep centers."],
    ["/virtual-assistants", "Amazon Virtual Assistants", "Trained Amazon VAs from Apex."],
    
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
