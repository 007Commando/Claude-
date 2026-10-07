#!/usr/bin/env python3
"""
Apex Google Search, version 2: high intent only, one landing page per theme.

Why a v2 rather than editing build.py: v1 (S01..S10) was written on 2026-09-23
from facts that turned out wrong. It sold "Repricer in every plan" and "$149
for the whole suite" (the repricer is Pro, $299, in beta, and moves prices only
when the seller presses Run), and a third of its ad groups landed on reading
pages with no way to start a trial above the fold. Its first ten days: about
90 impressions, 4 clicks, no trial. v1 stays in the account, paused, for its
history; v2 replaces it.

The rules v2 enforces, and fails the build on:

  1. Every Final URL is on LANDING_PAGES: pages whose headline matches the
     search and whose primary call to action ("Start my 7-day trial") is
     visible without scrolling on desktop and phone. With --check-live (or
     CHECK_BASE=http://localhost:3020 for an unreleased site) each URL is
     fetched and must answer 200 and contain that button.
  2. Exact and phrase match only. No broad. No dynamic keyword insertion.
  3. Competitor campaigns bid on "alternative / vs / like" searches, never on
     a bare competitor name: a bare name is someone looking for that tool's
     login, and they do not switch.
  4. No competitor's name in any ad (trademark policy), checked against every
     stem.
  5. Copy limits (30 / 90 / 15), no dash punctuation, no claim the product
     does not support (FORBIDDEN), and a price only on an ad whose landing page
     shows that price (PRICE_PAGES).

Out: import/v2/*.csv in the format the Google Ads web Bulk uploads accepts
(same headers as web_upload.py). Campaigns are created PAUSED; ad groups,
keywords and ads are Enabled, so launch is one click per campaign.

Run:  python3 build_v2.py               (validate + write)
      python3 build_v2.py --check-live  (also fetch every landing page)
"""

import csv
import importlib.util
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "import", "v2")
SITE = "https://www.apexapplications.io"

MAX_HEADLINE, MAX_DESCRIPTION, MAX_PATH = 30, 90, 15

# v1's rival list is still right about stems and comparison URLs; reuse it.
_spec = importlib.util.spec_from_file_location("v1", os.path.join(HERE, "build.py"))
v1 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(v1)
RIVALS = {r["key"]: r for r in v1.RIVALS}

TRACKING = (
    "{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign=%s"
    "&utm_content={adgroupid}&utm_term={keyword}&matchtype={matchtype}&device={device}"
)

# ---------------------------------------------------------------------------
# Landing pages: the only URLs an ad may send someone to.
# Audited 2026-10-07 at 1440x900 and 390x844: each shows "Start my 7-day trial"
# above the fold (the comparison, guide and /ai pages since site commit 57f2f63).
# ---------------------------------------------------------------------------
LANDING_PAGES = {
    "/": "Homepage. H1 'Amazon Wholesale Software for Sourcing, Purchasing, and Profit'; plan cards with prices.",
    "/pricing": "Pricing. Every plan and price; trial buttons in the sticky header.",
    "/features/green": "Product Sourcing & UPC Scanner. Real scanner screenshot in the hero.",
    "/features/blue": "Purchase Orders & Profit Analytics. Purchase order screenshot in the hero.",
    "/amazon-inventory-management-software": "Restock inputs explained; trial button under the intro.",
    "/ai": "ChatGPT and Claude with Apex data; trial button first.",
}
# Comparison pages are allowed for the rivals targeted below.
COMPARE_PREFIX = "/compare/"

# A price may appear only in ads whose landing page prints it.
PRICE_PAGES = {"/", "/pricing"}
PRICE_PATTERN = re.compile(r"\$\d")

# Claims the product does not support today (2026-10-07). Lower-case match.
FORBIDDEN = [
    "every plan", "whole suite", "all-in-one", "all in one", "repricer included",
    "real time", "real-time", "guarantee", "ai-powered", "ai powered", "free forever",
    "no card", "automatic repricing", "win the buy box", "ungated", "100,000",
]

CTA_MARKERS = ("start my 7-day trial", "start a 7-day pro trial")

# ---------------------------------------------------------------------------
# Campaigns
# ---------------------------------------------------------------------------
# Budgets total $32/day (about $970 a month), the Q4 Google test size. Manual
# CPC to start: there is no conversion history for Smart Bidding to learn from.
# Opening bids sit near Keyword Planner's top-of-page range where it had one
# (amazon inventory management software $7.67 to $41.91; sellerboard
# alternative $10.00 to $32.65; selleramp alternative $3.55 to $9.25), because
# v1's $7 to $9 bids on "amazon repricer" showed 46 times and won no click.
# Move to Maximize conversions on Trial Started after about 15 trials.

CAMPAIGNS = [
    {"name": "A1 | Brand", "budget": 3.00},
    {"name": "A2 | Wholesale Software", "budget": 10.00},
    {"name": "A3 | Purchasing & Profit", "budget": 8.00},
    {"name": "A4 | Competitor Alternatives", "budget": 8.00},
    {"name": "A5 | AI for Amazon Sellers", "budget": 3.00},
]

# ---------------------------------------------------------------------------
# Ad groups: theme -> keywords -> landing page
# ---------------------------------------------------------------------------
# kw entries are (keyword, match) with match in {"E", "P", "EP"}.

def kws(spec, words):
    return [(w, spec) for w in words]


GROUPS = [
    # --- A1 Brand -------------------------------------------------------------
    {
        "campaign": "A1 | Brand", "group": "Brand | Core", "url": "/", "bid": 2.00,
        "copy": "brand",
        "kw": kws("EP", ["apex applications", "apexapplications", "apex applications amazon",
                         "apex applications software", "apex amazon wholesale software",
                         "apex applications io"]),
    },
    {
        "campaign": "A1 | Brand", "group": "Brand | Pricing", "url": "/pricing", "bid": 2.00,
        "copy": "brand",
        "kw": kws("EP", ["apex applications pricing", "apex applications price",
                         "apex applications cost", "apex applications plans"]),
    },
    # --- A2 Wholesale Software -----------------------------------------------
    {
        "campaign": "A2 | Wholesale Software", "group": "Wholesale | Software", "url": "/", "bid": 6.00,
        "copy": "wholesale",
        "kw": kws("EP", ["amazon wholesale software", "amazon wholesale sourcing software",
                         "amazon wholesale product sourcing software", "software for amazon wholesale",
                         "wholesale fba software", "best amazon wholesale software",
                         "amazon wholesale tools", "amazon wholesale tool",
                         "amazon wholesale management software", "fba wholesale software",
                         "wholesale software for amazon sellers"]),
    },
    {
        "campaign": "A2 | Wholesale Software", "group": "Wholesale | Price List Scanner",
        "url": "/features/green", "bid": 4.50, "copy": "scanner",
        "kw": kws("EP", ["amazon wholesale scanner", "supplier price list scanner",
                         "scan supplier catalog amazon", "wholesale price list analysis amazon",
                         "amazon wholesale list analysis", "bulk upc lookup amazon", "upc to asin",
                         "upc to asin bulk", "upc to asin converter", "bulk asin lookup",
                         "upc scanner for amazon sellers", "price list to asin"]),
    },
    # --- A3 Purchasing & Profit ----------------------------------------------
    {
        "campaign": "A3 | Purchasing & Profit", "group": "Purchasing | Purchase Orders",
        "url": "/features/blue", "bid": 6.00, "copy": "purchasing",
        "kw": kws("EP", ["amazon purchase order software", "purchase order software for amazon sellers",
                         "amazon wholesale purchase order", "fba purchase order software",
                         "amazon po software", "purchase order tool for amazon sellers"]),
    },
    {
        "campaign": "A3 | Purchasing & Profit", "group": "Purchasing | Profit Tracking",
        "url": "/features/blue", "bid": 6.00, "copy": "profit",
        "kw": kws("EP", ["amazon seller profit tracker", "amazon fba profit tracker",
                         "amazon profit and loss software", "amazon seller p&l software",
                         "amazon cogs tracking software", "amazon fba profit dashboard",
                         "amazon wholesale profit tracking"]),
    },
    {
        "campaign": "A3 | Purchasing & Profit", "group": "Purchasing | Restock Planning",
        "url": "/amazon-inventory-management-software", "bid": 9.00, "copy": "restock",
        "kw": kws("E", ["amazon inventory management software", "amazon restock software",
                        "fba restock planner", "amazon reorder software", "amazon inventory planning software",
                        "amazon restock tool"]),
    },
    # --- A5 AI ----------------------------------------------------------------
    {
        "campaign": "A5 | AI for Amazon Sellers", "group": "AI | ChatGPT and Claude", "url": "/ai", "bid": 4.00,
        "copy": "ai",
        "kw": kws("EP", ["chatgpt for amazon sellers", "chatgpt for amazon fba", "claude for amazon sellers",
                         "ai for amazon wholesale", "ai tool for amazon wholesale", "amazon seller mcp",
                         "mcp server for amazon sellers", "ai assistant for amazon sellers",
                         "connect chatgpt to amazon seller data"]),
    },
]

# A4: one ad group per rival where Apex is a credible switch for a wholesale
# seller. Left out on purpose: Helium 10 and Jungle Scout (private label), the
# repricers (Gold is beta, Pro-only and runs when the seller presses Run) and
# 2D Workflow (Apex Red is invite-only).
ALT_RIVALS = {
    "third-party-profits": 7.00, "selleramp": 6.00, "seller-assistant": 5.00,
    "scan-unlimited": 5.00, "tactical-arbitrage": 5.00, "rocket-source": 5.00,
    "boxem": 4.00, "smartscout": 6.00, "sellerboard": 10.00, "inventorylab": 6.00,
}
ALT_SHAPES_EP = ["{s} alternative", "{s} alternatives", "alternative to {s}", "{s} competitors",
                 "{s} vs", "apps like {s}", "tools like {s}", "software like {s}"]
ALT_SHAPES_E = ["{s} competitor", "similar to {s}", "better than {s}", "cheaper than {s}",
                "{s} vs apex", "apex vs {s}", "replace {s}", "switch from {s}"]

for key, bid in ALT_RIVALS.items():
    r = RIVALS[key]
    stems = r["brand_ok"]
    words_ep = [shape.format(s=s) for s in stems for shape in ALT_SHAPES_EP]
    words_e = [shape.format(s=s) for s in stems for shape in ALT_SHAPES_E]
    GROUPS.append({
        "campaign": "A4 | Competitor Alternatives", "group": f"Alt | {r['name']}",
        "url": r["url"], "bid": bid, "copy": "alternatives", "rival": key,
        "kw": kws("EP", words_ep) + kws("E", words_e),
    })

# ---------------------------------------------------------------------------
# Negatives
# ---------------------------------------------------------------------------
UNIVERSAL_EXACT = list(v1.UNIVERSAL_NEGATIVES_EXACT)
UNIVERSAL_PHRASE = list(v1.UNIVERSAL_NEGATIVES_PHRASE) + [
    "near me", "ebay", "etsy", "walmart", "shopify", "tiktok shop", "dropshipping",
    "private label", "kdp", "merch by amazon", "amazon flex", "amazon associates",
]
CAMPAIGN_NEGATIVES = {
    "A1 | Brand": v1.CATEGORY_NEGATIVES_PHRASE["S01 | Brand Defence"] + ["login", "log in", "sign in"],
    "A2 | Wholesale Software": [
        "barcode scanner hardware", "barcode scanner gun", "amazon app", "amazon shopping app",
        "price check app", "scan to buy", "iphone", "android app", "wholesale clothing",
        "wholesale pallets", "liquidation", "alibaba", "aliexpress", "retail arbitrage app",
    ],
    "A3 | Purchasing & Profit": [
        "quickbooks", "xero", "bookkeeping", "accountant", "tax", "warehouse management system",
        "wms", "erp", "amazon stock", "amazon earnings", "amazon share price",
    ],
    "A4 | Competitor Alternatives": list(v1.CONQUEST_NEGATIVES_PHRASE) + [
        "login", "log in", "sign in", "download", "chrome extension", "coupon",
    ],
    "A5 | AI for Amazon Sellers": [
        "listing", "product description", "title generator", "keywords", "ppc", "prompt",
        "chatgpt login", "chatgpt free", "image", "logo", "course",
    ],
}

# ---------------------------------------------------------------------------
# Ad copy: one responsive search ad per ad group
# ---------------------------------------------------------------------------
TRIAL_D = "Start a 7-day trial. A card is required and nothing is charged until day 8."

COPY = {
    "brand": {
        "path": ("apex", "official"),
        "h": ["Apex Applications", "Apex Applications Official", "Amazon Wholesale Software",
              "Scan Supplier Price Lists", "Purchase Orders Built In", "Real Profit After Amazon Fees",
              "Start Your 7-Day Trial", "Plans From $49.99 a Month", "Nothing Charged for 7 Days",
              "Built for Wholesale Sellers", "Ask ChatGPT About Your Data", "122M+ Amazon Products Matched",
              "See Plans and Pricing", "Restock What Actually Sells", "One Place for Wholesale"],
        "d": ["Scan supplier price lists, build purchase orders and track real profit in one place.",
              TRIAL_D,
              "Match every UPC to Amazon, see profit and ROI, then turn the best buys into an order.",
              "Connect ChatGPT or Claude to your own Apex data and ask about stock, profit and orders."],
    },
    "wholesale": {
        "path": ("wholesale", "software"),
        "h": ["Amazon Wholesale Software", "Software for Amazon Wholesale", "Scan Supplier Price Lists",
              "Find Profitable Wholesale Buys", "UPC to ASIN in One Upload", "Purchase Orders Built In",
              "Real Profit After Amazon Fees", "Start Your 7-Day Trial", "Plans From $49.99 a Month",
              "Nothing Charged for 7 Days", "122M+ Amazon Products Matched", "Built for Wholesale Sellers",
              "Restock What Actually Sells", "Price Lists to Purchase Orders", "Ask ChatGPT About Your Data"],
        "d": ["Scan supplier price lists, build purchase orders and track real profit in one place.",
              "Match every UPC to Amazon, see profit and ROI, then turn the best buys into an order.",
              TRIAL_D,
              "Made for sellers who buy from wholesale suppliers. Plans start at $49.99 a month."],
    },
    "scanner": {
        "path": ("upc", "scanner"),
        "h": ["Supplier Price List Scanner", "UPC to ASIN in One Upload", "Bulk UPC Lookup for Amazon",
              "Amazon Wholesale Scanner", "Scan a Whole Wholesale List", "Profit and ROI on Every Row",
              "Hide Products You Already Sell", "See Who Holds the Buy Box", "Hazmat and Meltable Flags",
              "Turn the Best Buys Into a PO", "Start Your 7-Day Trial", "Nothing Charged for 7 Days",
              "122M+ Amazon Products Matched", "Built for Wholesale Sellers", "Match Every UPC to Amazon"],
        "d": ["Upload your supplier's price list. Apex matches every UPC to Amazon and shows profit.",
              "Filter by ROI, rank, sellers and Amazon on the listing, then send the best to an order.",
              TRIAL_D,
              "Landed cost, Amazon fees, profit at the Buy Box and ROI for every matched product."],
    },
    "purchasing": {
        "path": ("purchase", "orders"),
        "h": ["Amazon Purchase Order Software", "Build POs From Your Database", "Landed Cost on Every Order",
              "Projected Profit Per Order", "Suppliers, Costs and POs", "Purchase Orders for Wholesale",
              "Track Every Order to Amazon", "Real Profit After Your Costs", "Start Your 7-Day Trial",
              "Nothing Charged for 7 Days", "Built for Wholesale Sellers", "From Price List to PO",
              "Ask AI to Draft Your PO", "See ROI Before You Buy", "One Place for Purchasing"],
        "d": ["Keep suppliers and costs together, build purchase orders and see profit before you buy.",
              "Submitted orders fill in your cost of goods, so profit reflects what you paid.",
              TRIAL_D,
              "On Pro, ChatGPT or Claude can prepare a draft order for you to review and submit."],
    },
    "profit": {
        "path": ("profit", "tracker"),
        "h": ["Amazon Profit and Loss", "Amazon FBA Profit Tracker", "Real Profit After Your Costs",
              "Fees Synced From Amazon", "Profit by Day, Week or Month", "Track Operating Expenses",
              "Gross and Net Profit", "Cost of Goods From Your POs", "Start Your 7-Day Trial",
              "Nothing Charged for 7 Days", "Built for Wholesale Sellers", "Profit for Every Product",
              "Ask ChatGPT About Your P&L", "See Where Margin Goes", "One Place for Your Numbers"],
        "d": ["Sales and Amazon fees sync every few minutes. Profit uses the costs you enter.",
              "See gross profit by product, then net profit after the operating expenses you add.",
              TRIAL_D,
              "Built for wholesale: purchase order costs flow into your profit and loss for you."],
    },
    "restock": {
        "path": ("restock", "planning"),
        "h": ["Amazon Restock Planning", "Know What to Reorder", "Days of Stock Left per SKU",
              "Restock What Is Running Low", "Profit and Stock Side by Side", "Inbound Units Counted",
              "Reorder Before You Run Out", "Build the PO From the List", "Start Your 7-Day Trial",
              "Nothing Charged for 7 Days", "Built for Wholesale Sellers", "FBA Inventory Synced",
              "Ask AI What to Reorder", "Restock by Sales Velocity", "Plan Your Next Order"],
        "d": ["See days of stock left and what needs restocking, from your own sales velocity.",
              "Restock suggestions use your stock, sales, lead time and the cover you set.",
              TRIAL_D,
              "Put the products you need straight onto a purchase order and track it to Amazon."],
    },
    "alternatives": {
        "path": ("compare", "tools"),
        "h": ["Looking for an Alternative?", "Compare Before You Switch", "An Honest Side by Side",
              "Built for Amazon Wholesale", "Scan Supplier Price Lists", "Purchase Orders Built In",
              "Real Profit After Amazon Fees", "Where Each Tool Fits Best", "See What You Would Gain",
              "Start Your 7-Day Trial", "Nothing Charged for 7 Days", "Price Lists to Purchase Orders",
              "One Place for Wholesale", "We Say Where They Win Too", "Plans for Every Stage"],
        "d": ["Read an honest comparison, including where the other tool is the better choice.",
              "Apex scans supplier price lists, builds purchase orders and tracks real profit.",
              TRIAL_D,
              "Comparing tools for wholesale? See the workflow side by side before you decide."],
    },
    "ai": {
        "path": ("ai", "chatgpt"),
        "h": ["ChatGPT for Amazon Sellers", "Connect Claude to Your Data", "Ask AI About Your Profit",
              "AI That Reads Your Apex Data", "Draft POs With AI on Pro", "Works With ChatGPT and Claude",
              "Read Only by Default", "Never Submits or Spends", "Built for Amazon Wholesale",
              "Start Your 7-Day Trial", "Nothing Charged for 7 Days", "Which Products to Reorder?",
              "Your Stock, Profit and POs", "Set Up in a Few Minutes", "Amazon Seller AI Assistant"],
        "d": ["Connect Claude or ChatGPT to Apex and ask about profit, stock, scans and orders.",
              "Reading works on every paid plan. Draft purchase orders need the Pro plan.",
              "It cannot submit orders, spend money or change a live price. You stay in control.",
              TRIAL_D],
    },
}

# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
ERRORS = []


def err(msg):
    ERRORS.append(msg)


def check_text(text, limit, where):
    if len(text) > limit:
        err(f"{where}: {len(text)} > {limit}: {text!r}")
    if re.search(r"[–—]| - ", text):
        err(f"{where}: dash punctuation: {text!r}")
    low = text.lower()
    for bad in FORBIDDEN:
        if bad in low:
            err(f"{where}: unsupported claim {bad!r}: {text!r}")


def rival_terms():
    terms = set()
    for r in v1.RIVALS:
        terms.add(r["name"].lower())
        for s in r["stems"]:
            terms.add(s.lower())
    return terms


def validate():
    names = {c["name"] for c in CAMPAIGNS}
    rivals = rival_terms()
    seen = set()
    for g in GROUPS:
        where = f"{g['campaign']} / {g['group']}"
        if g["campaign"] not in names:
            err(f"{where}: unknown campaign")
        url = g["url"]
        if url not in LANDING_PAGES and not (url.startswith(COMPARE_PREFIX) and g.get("rival")):
            err(f"{where}: landing page {url} is not on the approved list")
        copy = COPY[g["copy"]]
        if len(copy["h"]) != 15 or len(copy["d"]) != 4:
            err(f"{where}: need 15 headlines and 4 descriptions")
        if len(set(h.lower() for h in copy["h"])) != len(copy["h"]):
            err(f"{where}: duplicate headline")
        for i, h in enumerate(copy["h"], 1):
            check_text(h, MAX_HEADLINE, f"{where} H{i}")
        for i, d in enumerate(copy["d"], 1):
            check_text(d, MAX_DESCRIPTION, f"{where} D{i}")
        for p in copy["path"]:
            check_text(p, MAX_PATH, f"{where} path")
        priced = any(PRICE_PATTERN.search(t) for t in copy["h"] + copy["d"])
        if priced and url not in PRICE_PAGES:
            err(f"{where}: quotes a price but lands on {url}, which does not show it")
        if g["copy"] == "alternatives":
            for t in copy["h"] + copy["d"]:
                low = t.lower()
                for term in rivals:
                    if re.search(r"\b" + re.escape(term) + r"\b", low):
                        err(f"{where}: competitor name {term!r} in ad text: {t!r}")
        for word, _ in g["kw"]:
            key = (g["campaign"], g["group"], word)
            if key in seen:
                err(f"{where}: duplicate keyword {word!r}")
            seen.add(key)
            if g["copy"] == "alternatives":
                bare = word.lower()
                if bare in {s.lower() for r in v1.RIVALS for s in r["stems"]}:
                    err(f"{where}: bare competitor name {word!r} (navigational, not switching)")


def check_live(base):
    """Fetch every landing page and require 200 plus the trial button."""
    urls = sorted({g["url"] for g in GROUPS})
    for path in urls:
        url = base.rstrip("/") + path
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "apex-ads-landing-check"})
            with urllib.request.urlopen(req, timeout=240) as resp:
                status, body = resp.status, resp.read().decode("utf-8", "ignore").lower()
            # React splits interpolated text with <!-- --> markers ("Start my <!-- -->7<!-- -->-day trial").
            body = body.replace("<!-- -->", "")
        except Exception as e:  # noqa: BLE001
            err(f"landing {url}: {e}")
            continue
        if status != 200:
            err(f"landing {url}: HTTP {status}")
        elif not any(m in body for m in CTA_MARKERS):
            err(f"landing {url}: no 'Start my 7-day trial' button in the page")
        else:
            print(f"  ok  {url}")


# ---------------------------------------------------------------------------
# Output (web Bulk uploads format, same headers as web_upload.py)
# ---------------------------------------------------------------------------
def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def write(name, header, rows):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, name), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=header, extrasaction="raise")
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in header})
    print(f"  {name:34} {len(rows):5} rows")


def build():
    write("01-campaigns.csv",
          ["Row Type", "Action", "Campaign status", "Campaign", "Campaign type", "Networks", "Budget",
           "Budget type", "Bid strategy type", "Language", "Location", "Tracking template", "EU political ads"],
          [{"Row Type": "Campaign", "Action": "Add", "Campaign status": "Paused", "Campaign": c["name"],
            "Campaign type": "Search", "Networks": "Google search", "Budget": f"{c['budget']:.2f}",
            "Budget type": "Daily", "Bid strategy type": "Manual CPC", "Language": "en",
            "Location": "United States", "Tracking template": TRACKING % slug(c["name"]),
            "EU political ads": "No"} for c in CAMPAIGNS])

    write("02-ad-groups.csv",
          ["Row Type", "Action", "Ad group status", "Campaign", "Ad group", "Ad group type", "Ad rotation",
           "Default max. CPC"],
          [{"Row Type": "Ad group", "Action": "Add", "Ad group status": "Enabled", "Campaign": g["campaign"],
            "Ad group": g["group"], "Ad group type": "Standard", "Ad rotation": "Optimize",
            "Default max. CPC": f"{g['bid']:.2f}"} for g in GROUPS])

    kw_rows = []
    for g in GROUPS:
        for word, spec in g["kw"]:
            for m in spec:
                kw_rows.append({"Row Type": "Keyword", "Action": "Add", "Keyword status": "Enabled",
                                "Campaign": g["campaign"], "Ad group": g["group"], "Keyword": word,
                                "Type": "Exact match" if m == "E" else "Phrase match",
                                "Default max. CPC": f"{g['bid']:.2f}", "Final URL": SITE + g["url"]})
    write("03-keywords.csv",
          ["Row Type", "Action", "Keyword status", "Campaign", "Ad group", "Keyword", "Type",
           "Default max. CPC", "Final URL"], kw_rows)

    neg_rows = []
    for c in CAMPAIGNS:
        for w in UNIVERSAL_EXACT:
            neg_rows.append((c["name"], w, "Exact match"))
        for w in UNIVERSAL_PHRASE + CAMPAIGN_NEGATIVES.get(c["name"], []):
            neg_rows.append((c["name"], w, "Phrase match"))
    # A brand-name keyword must never be blocked by its own campaign's negatives.
    dedup = sorted(set(neg_rows))
    write("04-negative-keywords.csv",
          ["Row Type", "Action", "Keyword status", "Level", "Campaign", "Ad group", "Negative keyword", "Type"],
          [{"Row Type": "Negative keyword", "Action": "Add", "Keyword status": "Enabled", "Level": "Campaign",
            "Campaign": camp, "Ad group": "", "Negative keyword": w, "Type": t} for camp, w, t in dedup])

    heads = [f"Headline {i}" for i in range(1, 16)]
    descs = [f"Description {i}" for i in range(1, 5)]
    ad_rows = []
    for g in GROUPS:
        copy = COPY[g["copy"]]
        row = {"Row Type": "Ad", "Action": "Add", "Ad status": "Enabled", "Campaign": g["campaign"],
               "Ad group": g["group"], "Ad type": "Responsive search ad", "Path 1": copy["path"][0],
               "Path 2": copy["path"][1], "Final URL": SITE + g["url"]}
        for i, h in enumerate(copy["h"]):
            row[heads[i]] = h
        for i, d in enumerate(copy["d"]):
            row[descs[i]] = d
        ad_rows.append(row)
    write("05-responsive-search-ads.csv",
          ["Row Type", "Action", "Ad status", "Campaign", "Ad group", "Ad type"] + heads + descs
          + ["Path 1", "Path 2", "Final URL"], ad_rows)


def self_block_check():
    """No keyword may contain one of its own campaign's negative phrases."""
    for g in GROUPS:
        negs = UNIVERSAL_PHRASE + CAMPAIGN_NEGATIVES.get(g["campaign"], [])
        for word, _ in g["kw"]:
            for n in negs:
                if re.search(r"\b" + re.escape(n.lower()) + r"\b", word.lower()):
                    err(f"{g['campaign']} / {g['group']}: keyword {word!r} is blocked by negative {n!r}")
            if word.lower() in {w.lower() for w in UNIVERSAL_EXACT}:
                err(f"{g['campaign']} / {g['group']}: keyword {word!r} equals an exact negative")


if __name__ == "__main__":
    validate()
    self_block_check()
    base = os.environ.get("CHECK_BASE") or (SITE if "--check-live" in sys.argv else None)
    if base:
        print(f"Checking landing pages on {base}")
        check_live(base)
    if ERRORS:
        print(f"\n{len(ERRORS)} problem(s); nothing written:")
        for e in ERRORS:
            print("  -", e)
        sys.exit(1)
    print("Building import/v2 (web Bulk uploads format)")
    build()
    total_kw = sum(len(g["kw"]) for g in GROUPS)
    print(f"{len(CAMPAIGNS)} campaigns, {len(GROUPS)} ad groups, {total_kw} keyword phrases, "
          f"${sum(c['budget'] for c in CAMPAIGNS):.2f}/day")
