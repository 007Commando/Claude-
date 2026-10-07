# URL and search-intent map (October 2026)

Every important URL has one job. Target terms are **hypotheses from product fit**, not measured
search volumes: no keyword tool was connected, and nothing here should be read as a volume or a
difficulty score. The one real data source is Search Console (3 months to 2026-09-29: 108 clicks,
4.58K impressions, average position 33; the largest page by impressions was
`/blog/amazon-fba-fees-explained` with about 1,249). Re-rank these hypotheses against the Search
Console query report after 4 to 6 weeks.

| URL | Job | Primary audience | Target terms (hypotheses) | Next action on the page |
|---|---|---|---|---|
| `/` | Introduce Apex and its commercial value | Wholesale sellers comparing tools | amazon wholesale software; apex applications | Start the 7-day trial; see plans |
| `/amazon-wholesale-software` | Buyer's guide: what wholesale software must do at each step, how to evaluate | Sellers evaluating tools | wholesale software for amazon sellers; best amazon wholesale tools (evaluation) | Compare plans; trial |
| `/pricing` | Plans, limits, trial terms | Ready-to-buy | apex applications pricing | Pick a plan |
| `/ai` | What ChatGPT/Claude can do with Apex data; plan rules; read vs draft | Sellers who use AI assistants | chatgpt for amazon sellers; claude amazon seller data; amazon seller mcp | See requirements; connect an existing account |
| `/integrations/claude` | Claude setup guide | Apex users | connect claude to amazon seller data | Make a link in Apex (noindex until walked through) |
| `/integrations/chatgpt` | ChatGPT setup guide | Apex users | chatgpt amazon seller integration | Make a link in Apex (noindex until walked through) |
| `/docs/mcp` | Technical MCP reference | Developers, technical sellers | amazon seller mcp server; apex mcp | Read the reference; connect |
| `/features/green` | Product sourcing and UPC scanner | Sellers working supplier price lists | upc scanner amazon wholesale; supplier price list analysis; upc to asin | Scan a list (trial) |
| `/features/blue` | Purchase orders, landed cost, P&L, restock | Sellers buying from several suppliers | amazon purchase order software; amazon wholesale profit tracking | Trial |
| `/features/gold` | Repricer with cost-based floors (beta, Pro) | Pro sellers sharing the Buy Box | amazon repricer with break even floor | See Pro |
| `/features/red` | Prep and shipment management (beta, by invitation) | Sellers using prep centers; prep centers | prep center software amazon | Request access |
| `/features/black` | Dashboard, Review Booster, Apex University | Every account | amazon seller dashboard | Trial |
| `/amazon-inventory-management-software` | Inputs behind restock decisions; not a forecast | Sellers restocking | amazon inventory management software wholesale; amazon restock planning | Trial |
| `/review-booster` | The Review Booster product page | Sellers who forget to ask for reviews | amazon request a review automation tool | Switch it on (free until Oct 31, 2026) |
| `/amazon-review-automation` | Explainer: what automated Request a Review may and may not do | Sellers asking if it is allowed | is it allowed to automate amazon review requests | Read; then Review Booster |
| `/ungating-guide` | Beginner primer on category and brand approval, Grocery walkthrough | New sellers | amazon ungating guide; how to get ungated in grocery | Supplier access; trial |
| `/blog/amazon-ungating-guide` | Deep dive on the invoice | Sellers preparing an application | amazon ungating invoice requirements | Ungating guide; trial |
| `/tools/fba-calculator` | Free ASIN lookup with fees and profit (3 free lookups) | Anyone checking a product | amazon fba calculator; fba fee calculator 2026 | Look up an ASIN; then scan a whole list |
| `/tools/amazon-profit-calculator` | Manual profit, margin, ROI, break-even | Anyone pricing a product | amazon profit calculator; amazon roi calculator | Try the FBA calculator; trial |
| `/compare/*` (18) | One honest comparison each | Sellers choosing between two tools | apex vs <tool>; <tool> alternative for wholesale | Trial |
| `/blog/amazon-fba-fees-explained` | Fee explainer (largest organic page) | Sellers learning fees | amazon fba fees 2026 | FBA calculator |

## Overlap review (decisions)

No pages were merged, redirected or canonicalized. Each pair below serves a different need, so the
fix was to sharpen each page's job and link them to each other:

- **Review pages:** `/review-booster` is the product; `/amazon-review-automation` is the rules
  explainer; `/features/black` was retitled away from "review automation" to dashboard, reviews and
  training, so it no longer competes with the other two for the same query.
- **Ungating pages:** `/ungating-guide` is the beginner primer; `/blog/amazon-ungating-guide` is the
  invoice deep dive. They now link to each other. The unsourced 70% figure was removed from both.
- **Courses:** `/free-course` (free) and `/zero-to-hero` (course plus trial) stay separate; both are
  now linked from the footer.

## URLs with weak internal discovery

- `/zero-to-hero`: active course page; now linked from the footer.
- `/premium-membership` ($5,999 one-time membership) and `/GroceryCommerce` (demo-only enterprise
  offer): left unlinked on purpose pending a decision. They look like offers sold on calls. Either
  link them from a "Programs" area or drop them from the sitemap; both are reasonable.
