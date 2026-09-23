#!/usr/bin/env python3
"""
Generates the Google Ads Editor import files for the Apex paid-search programme.

Why a generator rather than hand-written CSVs: the conquest campaigns are the
same seven question shapes asked about nineteen rivals. Typed by hand that is
nine hundred rows where a single missed bracket silently turns an exact-match
keyword into a broad one and empties the budget. Here the shapes are declared
once, the rivals are declared once, and the cross product is a loop.

It also validates. Every headline is checked against Google's 30-character
limit, every description against 90, every path against 15, and every piece of
customer-facing copy against the house rule that forbids dash punctuation. A
rejected ad is a disclosure; a truncated one is not, so the build fails loudly
instead of shipping copy Google will silently clip.

Run:  python3 build.py
Out:  ./import/*.csv
"""

import csv
import os
import re
import sys

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "import")

SITE = "https://www.apexapplications.io"

# Google's limits. Headlines and descriptions are hard caps; over them the ad
# is rejected, not shortened.
MAX_HEADLINE = 30
MAX_DESCRIPTION = 90
MAX_PATH = 15

# ---------------------------------------------------------------------------
# Campaigns
# ---------------------------------------------------------------------------
# Daily budgets are the phase-one split of $100/day described in 01-strategy.md.
# Max CPCs are opening bids for the manual-CPC learning phase, not forecasts:
# they exist to stop a single expensive click emptying a $6 budget on day one,
# and they are replaced by Smart Bidding once the conversion counter moves.

CAMPAIGNS = [
    {
        "name": "S01 | Brand Defence",
        "budget": 5.00,
        "bid_strategy": "Manual CPC",
        "networks": "Google search",
        "notes": "Search partners off. Target impression share absolute top later.",
    },
    {
        "name": "S02 | Conquest | Repricers",
        "budget": 12.00,
        "bid_strategy": "Manual CPC",
        "networks": "Google search",
        "notes": "Exact and phrase only. No broad, ever. No DKI.",
    },
    {
        "name": "S03 | Conquest | Sourcing & Ops",
        "budget": 12.00,
        "bid_strategy": "Manual CPC",
        "networks": "Google search",
        "notes": "Exact and phrase only. No broad, ever. No DKI.",
    },
    {
        "name": "S04 | Conquest | Analytics & Research",
        "budget": 11.00,
        "bid_strategy": "Manual CPC",
        "networks": "Google search",
        "notes": "Exact and phrase only. No broad, ever. No DKI.",
    },
    {
        "name": "S05 | Category | Repricing",
        "budget": 14.00,
        "bid_strategy": "Manual CPC",
        "networks": "Google search",
        "notes": "Highest commercial intent non-brand set. Expect the highest CPCs.",
    },
    {
        "name": "S06 | Category | Wholesale Scanning",
        "budget": 12.00,
        "bid_strategy": "Manual CPC",
        "networks": "Google search",
        "notes": "Closest match to what Apex actually is.",
    },
    {
        "name": "S07 | Category | Profit & Analytics",
        "budget": 9.00,
        "bid_strategy": "Manual CPC",
        "networks": "Google search",
        "notes": "Crowded and cheap-looking. Watch for accounting-software drift.",
    },
    {
        "name": "S08 | Category | Suppliers & Ungating",
        "budget": 10.00,
        "bid_strategy": "Manual CPC",
        "networks": "Google search",
        "notes": "Top of funnel. Free account, not the trial. Judge on signups.",
    },
    {
        "name": "S10 | DSA | Comparisons & Blog",
        "budget": 5.00,
        "bid_strategy": "Manual CPC",
        "networks": "Google search",
        "notes": "Targets /compare and /blog only. A query miner, not a scale lever.",
    },
]

# ---------------------------------------------------------------------------
# Rivals
# ---------------------------------------------------------------------------
# `stems` are every spelling a seller actually types. One-word stems that are
# also ordinary English (aura, informed, repricer) never appear alone: they are
# only ever used inside a longer phrase, which is why `brand_ok` gates them.
#
# `url` is the comparison page the click lands on. A conquest click that lands
# on the homepage is a wasted conquest click: the visitor asked a comparative
# question and the homepage does not answer it.

RIVALS = [
    # --- Repricers -------------------------------------------------------
    {
        "key": "aura",
        "name": "Aura",
        "campaign": "S02 | Conquest | Repricers",
        "tier": "A",
        "url": "/compare/aura",
        "stems": ["goaura", "go aura", "aura repricer", "aura repricing", "aura amazon repricer"],
        "brand_ok": ["goaura", "go aura", "aura repricer"],
    },
    {
        "key": "sellersnap",
        "name": "SellerSnap",
        "campaign": "S02 | Conquest | Repricers",
        "tier": "A",
        "url": "/compare/sellersnap",
        "stems": ["sellersnap", "seller snap", "sellersnap repricer"],
        "brand_ok": ["sellersnap", "seller snap"],
    },
    {
        "key": "bqool",
        "name": "BQool",
        "campaign": "S02 | Conquest | Repricers",
        "tier": "B",
        "url": "/compare/bqool",
        "stems": ["bqool", "bqool repricer", "bqool repricing central"],
        "brand_ok": ["bqool"],
    },
    {
        "key": "informed",
        "name": "Informed Repricer",
        "campaign": "S02 | Conquest | Repricers",
        "tier": "B",
        "url": "/compare/informed-repricer",
        "stems": ["informed repricer", "informed co repricer", "informed.co repricer", "informed repricing"],
        "brand_ok": ["informed repricer", "informed.co repricer"],
    },
    {
        "key": "repricer-com",
        "name": "Repricer.com",
        "campaign": "S02 | Conquest | Repricers",
        "tier": "B",
        "url": "/compare/repricer",
        "stems": ["repricer.com", "repricer com", "repricer.com amazon"],
        "brand_ok": ["repricer.com", "repricer com"],
    },
    # --- Sourcing, scanning and ops --------------------------------------
    {
        "key": "selleramp",
        "name": "SellerAmp",
        "campaign": "S03 | Conquest | Sourcing & Ops",
        "tier": "A",
        "url": "/compare/selleramp",
        "stems": ["selleramp", "seller amp", "selleramp sas", "seller amp sas"],
        "brand_ok": ["selleramp", "seller amp", "selleramp sas"],
    },
    {
        "key": "third-party-profits",
        "name": "Third Party Profits",
        "campaign": "S03 | Conquest | Sourcing & Ops",
        "tier": "A",
        "url": "/compare/third-party-profits",
        "stems": ["third party profits", "thirdpartyprofits", "3rd party profits", "third party profits amazon"],
        "brand_ok": ["third party profits", "thirdpartyprofits", "3rd party profits"],
    },
    {
        "key": "scan-unlimited",
        "name": "Scan Unlimited",
        "campaign": "S03 | Conquest | Sourcing & Ops",
        "tier": "B",
        "url": "/compare/scan-unlimited",
        "stems": ["scan unlimited", "scanunlimited", "scan unlimited amazon"],
        "brand_ok": ["scan unlimited", "scanunlimited"],
    },
    {
        "key": "rocket-source",
        "name": "Rocket Source",
        "campaign": "S03 | Conquest | Sourcing & Ops",
        "tier": "B",
        "url": "/compare/rocket-source",
        "stems": ["rocket source", "rocketsource", "rocket source amazon"],
        "brand_ok": ["rocket source", "rocketsource"],
    },
    {
        "key": "seller-assistant",
        "name": "Seller Assistant",
        "campaign": "S03 | Conquest | Sourcing & Ops",
        "tier": "B",
        "url": "/compare/seller-assistant",
        "stems": ["seller assistant app", "sellerassistant", "seller assistant amazon", "seller assistant extension"],
        "brand_ok": ["seller assistant app", "sellerassistant"],
    },
    {
        "key": "tactical-arbitrage",
        "name": "Tactical Arbitrage",
        "campaign": "S03 | Conquest | Sourcing & Ops",
        "tier": "A",
        "url": "/compare/tactical-arbitrage",
        "stems": ["tactical arbitrage", "tacticalarbitrage"],
        "brand_ok": ["tactical arbitrage", "tacticalarbitrage"],
    },
    {
        "key": "boxem",
        "name": "Boxem",
        "campaign": "S03 | Conquest | Sourcing & Ops",
        "tier": "B",
        "url": "/compare/boxem",
        "stems": ["boxem", "boxem amazon"],
        "brand_ok": ["boxem"],
    },
    {
        "key": "2d-workflow",
        "name": "2D Workflow",
        "campaign": "S03 | Conquest | Sourcing & Ops",
        "tier": "B",
        "url": "/compare/2d-workflow",
        "stems": ["2d workflow", "2dworkflow", "two d workflow"],
        "brand_ok": ["2d workflow", "2dworkflow"],
    },
    # --- Analytics and research ------------------------------------------
    {
        "key": "sellerboard",
        "name": "sellerboard",
        "campaign": "S04 | Conquest | Analytics & Research",
        "tier": "A",
        "url": "/compare/sellerboard",
        "stems": ["sellerboard", "seller board", "sellerboard amazon"],
        "brand_ok": ["sellerboard", "seller board"],
    },
    {
        "key": "smartscout",
        "name": "SmartScout",
        "campaign": "S04 | Conquest | Analytics & Research",
        "tier": "A",
        "url": "/compare/smartscout",
        "stems": ["smartscout", "smart scout", "smartscout amazon"],
        "brand_ok": ["smartscout", "smart scout"],
    },
    {
        "key": "helium10",
        "name": "Helium 10",
        "campaign": "S04 | Conquest | Analytics & Research",
        "tier": "A",
        "url": "/compare/helium10",
        "stems": ["helium 10", "helium10"],
        "brand_ok": ["helium 10", "helium10"],
    },
    {
        "key": "junglescout",
        "name": "Jungle Scout",
        "campaign": "S04 | Conquest | Analytics & Research",
        "tier": "A",
        "url": "/compare/junglescout",
        "stems": ["jungle scout", "junglescout"],
        "brand_ok": ["jungle scout", "junglescout"],
    },
    {
        "key": "inventorylab",
        "name": "InventoryLab",
        "campaign": "S04 | Conquest | Analytics & Research",
        "tier": "B",
        "url": "/compare/inventorylab",
        "stems": ["inventorylab", "inventory lab", "seller 365", "seller365"],
        "brand_ok": ["inventorylab", "inventory lab", "seller 365"],
    },
]

# The comparative questions a switcher asks, in the order they ask them.
# Tier A rivals get all of them; tier B gets the first block only, because a
# long tail of zero-volume exact keywords is noise in a report, not coverage.
SWITCH_CORE = [
    "{s} alternative",
    "{s} alternatives",
    "alternative to {s}",
    "{s} competitors",
    "{s} vs",
    "{s} review",
    "{s} pricing",
]
SWITCH_EXTRA = [
    "{s} reviews",
    "{s} cost",
    "{s} price",
    "{s} comparison",
    "{s} compared to",
    "is {s} worth it",
    "{s} free trial",
    "better than {s}",
    "{s} competitor",
    "similar to {s}",
    "apex vs {s}",
    "{s} vs apex",
]

# Phrase match is added only where the tail genuinely varies (people write
# "sellerboard alternative for wholesale"). Everywhere else exact alone keeps
# the query report readable.
PHRASE_SHAPES = {"{s} alternative", "{s} alternatives", "alternative to {s}", "{s} competitors", "{s} vs"}

BID_BRAND = 2.50
BID_SWITCH = 4.00

# ---------------------------------------------------------------------------
# Non-brand keyword sets
# ---------------------------------------------------------------------------

CATEGORY = {
    "S05 | Category | Repricing": {
        "path": ("repricer", "amazon"),
        "groups": {
            "Repricer | Core": {
                "url": "/features/gold",
                "bid": 9.00,
                "kw": [
                    "amazon repricer", "amazon repricing software", "amazon repricing tool",
                    "best amazon repricer", "automatic repricer amazon", "fba repricer",
                    "amazon seller repricer", "repricing software for amazon sellers",
                    "amazon price automation software", "amazon repricer software",
                    "repricer for amazon fba", "automated repricing amazon",
                ],
            },
            "Repricer | Buy Box": {
                "url": "/features/gold",
                "bid": 9.00,
                "kw": [
                    "amazon buy box software", "win the buy box amazon", "buy box automation amazon",
                    "how to win the buy box", "amazon buy box tool", "buy box win rate software",
                    "amazon buy box repricer",
                ],
            },
            "Repricer | Profit Floors": {
                "url": "/features/gold",
                "bid": 7.50,
                "kw": [
                    "repricer with profit floor", "repricer minimum price calculator",
                    "amazon repricer roi floor", "repricer landed cost", "break even repricer amazon",
                    "repricer that uses cost of goods", "amazon repricer margin rules",
                ],
            },
            "Repricer | Wholesale": {
                "url": "/features/gold",
                "bid": 7.50,
                "kw": [
                    "wholesale repricer amazon", "repricer for wholesale sellers",
                    "amazon wholesale repricing", "repricer for resellers amazon",
                ],
            },
        },
    },
    "S06 | Category | Wholesale Scanning": {
        "path": ("scanner", "wholesale"),
        "groups": {
            "Scanner | Price Lists": {
                "url": "/features/green",
                "bid": 7.00,
                "kw": [
                    "supplier price list scanner", "wholesale price list analysis amazon",
                    "scan supplier catalog amazon", "amazon wholesale scanner",
                    "bulk price list scanner amazon", "supplier list scanning tool",
                    "amazon wholesale list analysis", "price list to amazon asin",
                ],
            },
            "Scanner | Bulk Lookup": {
                "url": "/features/green",
                "bid": 6.00,
                "kw": [
                    "bulk asin scanner", "bulk upc lookup amazon", "upc to asin bulk",
                    "amazon bulk product scanner", "bulk asin lookup tool",
                    "upc scanner for amazon sellers", "bulk product matching amazon",
                ],
            },
            "Scanner | Wholesale Software": {
                "url": "/features/green",
                "bid": 7.00,
                "kw": [
                    "amazon wholesale software", "wholesale fba software",
                    "amazon wholesale sourcing software", "software for amazon wholesale sellers",
                    "amazon wholesale automation software", "wholesale sourcing tool amazon",
                ],
            },
            "Scanner | Ungating": {
                "url": "/features/green",
                "bid": 5.00,
                "kw": [
                    "amazon ungating checker", "check amazon selling eligibility bulk",
                    "bulk gated brand check amazon", "amazon approval checker tool",
                    "check if i can sell on amazon tool",
                ],
            },
        },
    },
    "S07 | Category | Profit & Analytics": {
        "path": ("profit", "amazon"),
        "groups": {
            "Profit | Tracker": {
                "url": "/features/blue",
                "bid": 6.50,
                "kw": [
                    "amazon seller profit tracker", "amazon fba profit tracker",
                    "amazon profit analytics", "amazon seller dashboard software",
                    "fba profit dashboard", "amazon profit tracking software",
                    "amazon seller p&l software",
                ],
            },
            "Profit | True Cost": {
                "url": "/features/blue",
                "bid": 6.00,
                "kw": [
                    "amazon cogs tracking software", "landed cost calculator amazon fba",
                    "amazon fba true profit", "track cost of goods amazon seller",
                    "amazon fee and freight calculator",
                ],
            },
            "Profit | Restock": {
                "url": "/amazon-inventory-management-software",
                "bid": 6.00,
                "kw": [
                    "amazon restock software", "amazon inventory management software",
                    "fba restock planner", "amazon inventory forecasting tool",
                    "restock recommendations amazon", "amazon reorder software",
                ],
            },
            "Profit | Review Requests": {
                "url": "/amazon-review-automation",
                "bid": 5.00,
                "kw": [
                    "amazon review request automation", "automate request a review amazon",
                    "amazon review automation software", "amazon feedback automation tool",
                ],
            },
        },
    },
    "S08 | Category | Suppliers & Ungating": {
        "path": ("suppliers", "wholesale"),
        "groups": {
            "Suppliers | Distributors": {
                "url": "/amazon-wholesale-suppliers",
                "bid": 5.00,
                "kw": [
                    "amazon wholesale suppliers", "wholesale distributors for amazon sellers",
                    "us wholesale distributors amazon fba", "find wholesale suppliers for amazon",
                    "amazon fba supplier list", "wholesale supplier list for amazon",
                    "legitimate wholesale distributors usa",
                ],
            },
            "Suppliers | Ungating": {
                "url": "/ungating-guide",
                "bid": 4.50,
                "kw": [
                    "how to get ungated on amazon", "amazon ungating service",
                    "get approved to sell a brand on amazon", "amazon brand approval process",
                    "amazon category ungating", "ungate amazon grocery",
                ],
            },
            "Suppliers | Prep Centers": {
                "url": "/prep-center-network",
                "bid": 4.00,
                "kw": [
                    "amazon fba prep center", "fba prep center near me",
                    "amazon prep center list", "best fba prep centers",
                    "prep center for amazon sellers",
                ],
            },
            "Suppliers | First Order": {
                "url": "/purchase-order-program",
                "bid": 5.00,
                "kw": [
                    "how to start amazon wholesale", "first wholesale purchase order amazon",
                    "amazon wholesale for beginners", "how to buy wholesale for amazon fba",
                ],
            },
        },
    },
}

BRAND_GROUPS = {
    "Brand | Core": {
        "url": "/",
        "bid": 2.00,
        "kw": [
            "apex applications", "apexapplications", "apex applications amazon",
            "apex applications software", "apex applications io", "apex apps amazon",
            "apex amazon wholesale software", "apex applications login",
            "apex applications review", "apex applications pricing",
        ],
    },
    "Brand | Modules": {
        "url": "/features/gold",
        "bid": 2.00,
        "kw": [
            "apex gold repricer", "apex green scanner", "apex blue profit",
            "apex red fba", "apex black dashboard", "apex applications repricer",
        ],
    },
    "Brand | Programmes": {
        "url": "/purchase-order-program",
        "bid": 2.00,
        "kw": [
            "apex purchase order program", "apex pop amazon", "apex elite amazon",
            "primewell distribution", "primewell wholesale",
        ],
    },
}

# ---------------------------------------------------------------------------
# Negatives
# ---------------------------------------------------------------------------
# One shared list applied to every search campaign, plus per-campaign lists for
# the drift each one has of its own. The universal list is mostly people who
# will never pay: job seekers, pirates, and people already logged in somewhere.

UNIVERSAL_NEGATIVES_EXACT = [
    "free", "free software", "free tool", "free trial", "cracked", "crack", "torrent",
    "nulled", "keygen", "coupon", "coupon code", "promo code", "appsumo", "lifetime deal",
    "jobs", "job", "careers", "career", "salary", "hiring", "internship", "resume",
    "wikipedia", "glassdoor", "linkedin", "crunchbase", "stock price", "share price",
]
UNIVERSAL_NEGATIVES_PHRASE = [
    "log in", "login", "sign in", "sign up free", "customer service", "phone number",
    "for free", "free download", "apk", "mod apk", "open source", "github",
    "amazon seller support", "amazon customer service", "how to contact amazon",
    "is amazon fba dead", "amazon jobs", "work from home", "make money online",
    "scholarship", "for students", "course free", "free course",
]

# Words that turn a rival's name into something unrelated. "aura" is the sharp
# one: without these, a phrase-match drift can land on ring lights and crystals.
CONQUEST_NEGATIVES_PHRASE = [
    "aura frame", "aura frames", "aura ring", "aura photography", "aura reading",
    "aura color", "aura colour", "aura cleansing", "aura digital frame",
    "jungle scout bird", "scout bsa", "boy scouts",
    "seller central", "amazon seller central login",
    "reddit", "quora", "youtube", "tutorial", "how to use", "user guide", "manual",
    "refund", "cancel subscription", "unsubscribe", "customer support",
    "affiliate program", "affiliate link", "discount code",
]

CATEGORY_NEGATIVES_PHRASE = {
    "S05 | Category | Repricing": [
        "ebay repricer", "walmart repricer", "shopify repricer", "etsy repricer",
        "car pricing", "airline pricing", "hotel repricing", "dynamic pricing retail",
        "repricing strategy meaning", "what is repricing",
    ],
    "S06 | Category | Wholesale Scanning": [
        "barcode scanner hardware", "barcode scanner gun", "document scanner",
        "virus scanner", "network scanner", "port scanner", "body scanner",
        "retail arbitrage", "online arbitrage", "dropshipping", "alibaba",
        "private label", "wholesale clothing", "wholesale pallets", "liquidation pallets",
    ],
    "S07 | Category | Profit & Analytics": [
        "quickbooks", "xero", "bookkeeping service", "accountant near me", "tax filing",
        "amazon stock", "amazon share price", "amazon profit 2026", "amazon earnings",
        "profit margin definition", "what is gross profit",
    ],
    "S08 | Category | Suppliers & Ungating": [
        "dropshipping suppliers", "aliexpress", "alibaba", "wholesale clothing vendors",
        "wholesale pallets", "liquidation", "china suppliers", "print on demand",
        "start a business", "business plan", "grant", "loan",
    ],
    "S01 | Brand Defence": [
        "apex legends", "apex racing", "apex tool group", "apex trader funding",
        "apex predator", "apex gaming", "apex hosting", "apex oracle", "apex learning",
        "apex clean energy", "apex systems", "apex fitness", "apex bikes",
    ],
}

# ---------------------------------------------------------------------------
# Ad copy
# ---------------------------------------------------------------------------
# One responsive search ad per ad group, built from a campaign pool.
#
# Conquest ad copy deliberately never names the rival. Google's trademark
# policy lets you bid on a competitor's mark but not print it in the ad text,
# and the informational-site exception has to be granted before you rely on it.
# The differentiation therefore lives in the landing page, which is why every
# conquest ad group points at that rival's own comparison page. Same ad, right
# answer waiting on the other side of the click.
#
# Prices here are the live ones: Starter $149/mo, seven free days, card taken
# up front. If NEW_PRICING_LIVE flips in src/config/offer.ts, every headline
# quoting $149 changes with it or the ads misprice the landing page.

COPY = {
    "S01 | Brand Defence": {
        "path": ("apex", "official"),
        "headlines": [
            "Apex Applications", "Apex Applications Official", "The Official Apex Site",
            "Amazon Wholesale Suite", "Scan, Buy, Price, Restock", "Repricer In Every Plan",
            "$149/mo For The Whole Suite", "7 Days Free, No Charge Yet", "Apex Green Scanner",
            "Apex Gold Repricer", "Apex Blue Profit Tracker", "See Pricing And Plans",
            "Start Your Free Trial", "Built For Wholesale Sellers", "Book A Walkthrough",
        ],
        "descriptions": [
            "The official home of Apex Applications. Scanning, purchase orders, repricing, P&L.",
            "Start a seven day trial. Card up front, nothing charged until the trial ends.",
            "One suite for Amazon wholesale: find the deal, buy it, price it, restock it.",
            "Prefer a walkthrough first? Book a session and we will go through your catalogue.",
        ],
    },
    "S02 | Conquest | Repricers": {
        "path": ("compare", "repricers"),
        "headlines": [
            "Repricer Alternatives", "Repricing Is One Step", "Repricer Plus The Whole Loop",
            "Price Floors From Real Cost", "Win The Buy Box Safely", "Repricer In Every Plan",
            "$149/mo For The Whole Suite", "7 Days Free, No Charge Yet", "Built For Wholesale Sellers",
            "Scan, Buy, Price, Restock", "An Honest Side By Side", "See Where We Win And Lose",
            "Your Floor Is Your Real Cost", "Stop Paying Per Listing", "One Login, Not Four Tabs",
        ],
        "descriptions": [
            "Repricing, scanning, purchase orders and profit in one place. Seven days free.",
            "Your price floor comes from your real landed cost, not a number you keep by hand.",
            "An honest comparison, including where the other tool wins. Real pricing, no spin.",
            "Card up front, nothing charged for seven days. Cancel before it ends, pay nothing.",
        ],
    },
    "S03 | Conquest | Sourcing & Ops": {
        "path": ("compare", "sourcing"),
        "headlines": [
            "Scanner Alternatives", "Scan The Whole Price List", "From Price List To PO",
            "Stop Scanning One By One", "Bulk Supplier Catalog Scans", "Sourcing That Ends In A PO",
            "Repricer In Every Plan", "$149/mo For The Whole Suite", "7 Days Free, No Charge Yet",
            "Built For Wholesale Sellers", "An Honest Side By Side", "See Where We Win And Lose",
            "Ungating Checked In Bulk", "One Login, Not Four Tabs", "Scan, Buy, Price, Restock",
        ],
        "descriptions": [
            "Upload a supplier price list and get every profitable match, ready to order.",
            "Scanning, purchase orders, repricing and profit live in one place. Seven days free.",
            "An honest comparison, including where the other tool wins. Real pricing, no spin.",
            "Check what you are ungated for across thousands of ASINs, one probe per brand.",
        ],
    },
    "S04 | Conquest | Analytics & Research": {
        "path": ("compare", "profit"),
        "headlines": [
            "Profit Tool Alternatives", "See Profit And Act On It", "More Than A Dashboard",
            "Numbers You Can Buy From", "P&L, POs And Repricing", "Repricer In Every Plan",
            "$149/mo For The Whole Suite", "7 Days Free, No Charge Yet", "Built For Wholesale Sellers",
            "An Honest Side By Side", "See Where We Win And Lose", "Research, Then Actually Buy",
            "One Login, Not Four Tabs", "Scan, Buy, Price, Restock", "True Cost, Fees And Freight",
        ],
        "descriptions": [
            "A profit view that leads somewhere: build the purchase order from the same numbers.",
            "Landed cost, Amazon fees and freight in the margin before you commit to an order.",
            "An honest comparison, including where the other tool wins. Real pricing, no spin.",
            "Scanning, purchase orders, repricing and profit in one place. Seven days free.",
        ],
    },
    "S05 | Category | Repricing": {
        "path": ("repricer", "amazon"),
        "headlines": [
            "Amazon Repricer", "Amazon Repricing Software", "Win The Buy Box Safely",
            "Price Floors From Real Cost", "ROI Floor On Every Listing", "Never Price Below Cost",
            "Rules You Can Actually Read", "Repricer In Every Plan", "$149/mo For The Whole Suite",
            "7 Days Free, No Charge Yet", "Built For Wholesale Sellers", "Scan, Buy, Price, Restock",
            "Hold The Price Per Listing", "Stop Racing To The Bottom", "Set Up In An Afternoon",
        ],
        "descriptions": [
            "Your floor comes from landed cost, Amazon fees and prep, so you never sell at a loss.",
            "Win the Buy Box on listings worth winning and hold the price on the ones that are not.",
            "Repricing, scanning, purchase orders and profit in one place. Seven days free.",
            "Card up front, nothing charged for seven days. Cancel before it ends, pay nothing.",
        ],
    },
    "S06 | Category | Wholesale Scanning": {
        "path": ("scanner", "wholesale"),
        "headlines": [
            "Amazon Wholesale Scanner", "Scan Supplier Price Lists", "Bulk ASIN And UPC Scans",
            "Find What You Do Not Own", "From Price List To PO", "Rescan For New Winners",
            "Always Load Your Database", "Repricer In Every Plan", "$149/mo For The Whole Suite",
            "7 Days Free, No Charge Yet", "Built For Wholesale Sellers", "Ungating Checked In Bulk",
            "3 Distributors On Sign Up", "One Login, Not Four Tabs", "Scan, Buy, Price, Restock",
        ],
        "descriptions": [
            "Upload a supplier price list and get every profitable match, ready to order.",
            "A rescan tells you what the catalogue gained that you do not already own.",
            "Every account gets three vetted US distributors on sign up, three more each month.",
            "Scanning, purchase orders, repricing and profit in one place. Seven days free.",
        ],
    },
    "S07 | Category | Profit & Analytics": {
        "path": ("profit", "amazon"),
        "headlines": [
            "Amazon Profit Tracker", "Real P&L By Day Or Month", "Fees, Freight And Prep In",
            "Know Your True Landed Cost", "Profit You Can Buy From", "Restock What Actually Sells",
            "Repricer In Every Plan", "$149/mo For The Whole Suite", "7 Days Free, No Charge Yet",
            "Built For Wholesale Sellers", "One Login, Not Four Tabs", "Scan, Buy, Price, Restock",
            "Costs From Your Real POs", "See Every SKU's Margin", "Set Up In An Afternoon",
        ],
        "descriptions": [
            "A statement by day, week or month, built from your real orders, fees and costs.",
            "Purchase order costs flow straight into the P&L, so your margin is not a guess.",
            "Scanning, purchase orders, repricing and profit in one place. Seven days free.",
            "Card up front, nothing charged for seven days. Cancel before it ends, pay nothing.",
        ],
    },
    "S08 | Category | Suppliers & Ungating": {
        "path": ("wholesale", "suppliers"),
        "headlines": [
            "Amazon Wholesale Suppliers", "3 Distributors On Sign Up", "3 More Every Month",
            "Get Ungated, Brand By Brand", "Check What You Can Sell", "Find A Prep Center",
            "Your First Purchase Order", "Free Account To Start", "Built For Wholesale Sellers",
            "Scan, Buy, Price, Restock", "Stop Guessing At Suppliers", "Real Distributors, Vetted",
            "We Will Help You Start", "One Login, Not Four Tabs", "Ungating Checked In Bulk",
        ],
        "descriptions": [
            "Open a free account and we will send you three vetted US distributors to start with.",
            "Three more wholesale distributors land in your account every month, at no extra cost.",
            "Check which brands you are already approved for before you spend a dollar on stock.",
            "Want help with your first order? We will work out the margin and true cost with you.",
        ],
    },
}

# Dynamic search ads carry descriptions only: Google writes the headline from
# the page. Two descriptions, both true of every comparison page.
DSA_DESCRIPTIONS = [
    "An honest comparison, including where the other tool wins. Real pricing, no spin.",
    "Scanning, purchase orders, repricing and profit in one place. Seven days free.",
]

# ---------------------------------------------------------------------------
# Assets
# ---------------------------------------------------------------------------

SITELINKS = [
    ("Compare The Tools", "Sixteen honest comparisons.", "Including where we lose.", "/compare"),
    ("See Pricing", "Starter $149/mo, Pro $299.", "Seven days free to try.", "/pricing"),
    ("The Repricer", "Floors from your real cost.", "Included in every plan.", "/features/gold"),
    ("The Scanner", "Whole price lists at once.", "Ends in a purchase order.", "/features/green"),
    ("Profit And P&L", "Real costs, fees and freight.", "By day, week or month.", "/features/blue"),
    ("Wholesale Suppliers", "Three vetted US distributors.", "Three more every month.", "/amazon-wholesale-suppliers"),
    ("Get Ungated", "Check brands before you buy.", "Thousands of ASINs at once.", "/ungating-guide"),
    ("Book A Walkthrough", "We will look at your catalogue.", "Thirty minutes, no pitch.", "/purchase-order-program"),
]

CALLOUTS = [
    "Repricer in every plan",
    "Seven day free trial",
    "No charge for seven days",
    "3 distributors on sign up",
    "3 more every month",
    "Bulk ungating checks",
    "Purchase orders built in",
    "Real landed cost margins",
    "Built for wholesale",
    "Cancel any time",
]

SNIPPETS = [
    ("Features", ["Catalog scanning", "Bulk ungating", "Purchase orders", "Repricing", "Profit and P&L", "Restock planning", "Review requests"]),
    ("Service catalog", ["Wholesale sourcing", "Supplier price lists", "Buy Box repricing", "Inventory restock", "Prep centre network"]),
]

# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

DASH = re.compile(r"[—–]|&mdash;|&ndash;")
problems = []


def check(text, limit, where):
    """House rules for anything a customer reads."""
    if len(text) > limit:
        problems.append(f"{where}: {len(text)} chars, limit {limit} -> {text!r}")
    if DASH.search(text):
        problems.append(f"{where}: dash punctuation is banned in customer copy -> {text!r}")
    return text


def validate_copy():
    for campaign, block in COPY.items():
        for h in block["headlines"]:
            check(h, MAX_HEADLINE, f"{campaign} headline")
        if len(block["headlines"]) != 15:
            problems.append(f"{campaign}: {len(block['headlines'])} headlines, want 15")
        for d in block["descriptions"]:
            check(d, MAX_DESCRIPTION, f"{campaign} description")
        if len(block["descriptions"]) != 4:
            problems.append(f"{campaign}: {len(block['descriptions'])} descriptions, want 4")
        for p in block["path"]:
            check(p, MAX_PATH, f"{campaign} path")
    for d in DSA_DESCRIPTIONS:
        check(d, MAX_DESCRIPTION, "DSA description")
    for text, d1, d2, _ in SITELINKS:
        check(text, 25, "sitelink text")
        check(d1, 35, "sitelink description 1")
        check(d2, 35, "sitelink description 2")
    for c in CALLOUTS:
        check(c, 25, "callout")
    for header, values in SNIPPETS:
        for v in values:
            check(v, 25, f"snippet {header}")


def guard_conquest_copy():
    """No rival's name may appear in any conquest ad.

    Google will take the ad down and the rival can file a complaint against the
    account, not just the ad. Cheaper to fail the build.
    """
    names = set()
    for r in RIVALS:
        names.add(r["name"].lower())
        for s in r["stems"]:
            names.add(s.lower())
    for campaign, block in COPY.items():
        if "Conquest" not in campaign:
            continue
        for line in block["headlines"] + list(block["descriptions"]):
            low = line.lower()
            for n in names:
                if len(n) < 5:
                    continue
                if n in low:
                    problems.append(f"{campaign}: ad text names a rival ({n!r}) -> {line!r}")


# ---------------------------------------------------------------------------
# Emit
# ---------------------------------------------------------------------------


def write(name, header, rows):
    path = os.path.join(OUT, name)
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(header)
        w.writerows(rows)
    print(f"  {name:<34} {len(rows):>4} rows")


def rival_groups(r):
    """Ad groups for one rival: brand and switch for tier A, one for tier B."""
    if r["tier"] == "A":
        return [(f"{r['name']} | Brand", "brand"), (f"{r['name']} | Switch", "switch")]
    return [(f"{r['name']}", "both")]


def build():
    os.makedirs(OUT, exist_ok=True)
    print("Building Google Ads import files")

    # Campaigns -----------------------------------------------------------
    write(
        "01-campaigns.csv",
        ["Campaign", "Campaign Type", "Campaign Daily Budget", "Budget Type", "Status",
         "Networks", "Languages", "Bid Strategy Type", "Ad Rotation", "Notes"],
        [[c["name"], "Search", f"{c['budget']:.2f}", "Daily", "Paused", c["networks"],
          "en", c["bid_strategy"], "Optimize", c["notes"]] for c in CAMPAIGNS],
    )

    # Ad groups -----------------------------------------------------------
    ag_rows = []
    for name, groups in BRAND_GROUPS.items():
        ag_rows.append(["S01 | Brand Defence", name, "Paused", f"{groups['bid']:.2f}", "Standard"])
    for r in RIVALS:
        for ag, kind in rival_groups(r):
            bid = BID_BRAND if kind == "brand" else BID_SWITCH
            ag_rows.append([r["campaign"], ag, "Paused", f"{bid:.2f}", "Standard"])
    for campaign, block in CATEGORY.items():
        for ag, g in block["groups"].items():
            ag_rows.append([campaign, ag, "Paused", f"{g['bid']:.2f}", "Standard"])
    ag_rows.append(["S10 | DSA | Comparisons & Blog", "DSA | Comparison Pages", "Paused", "4.00", "Standard"])
    ag_rows.append(["S10 | DSA | Comparisons & Blog", "DSA | Blog", "Paused", "2.50", "Standard"])
    write("02-ad-groups.csv",
          ["Campaign", "Ad Group", "Status", "Max CPC", "Ad Group Type"], ag_rows)

    # Keywords ------------------------------------------------------------
    kw_rows = []
    seen = set()

    def add_kw(campaign, ag, text, match, bid, url):
        text = " ".join(text.split()).lower()
        key = (campaign, ag, text, match)
        if key in seen:
            return
        seen.add(key)
        rendered = {"Exact": f"[{text}]", "Phrase": f'"{text}"', "Broad": text}[match]
        kw_rows.append([campaign, ag, rendered, match, f"{bid:.2f}", SITE + url, "Paused"])

    for name, g in BRAND_GROUPS.items():
        for k in g["kw"]:
            add_kw("S01 | Brand Defence", name, k, "Exact", g["bid"], g["url"])
            add_kw("S01 | Brand Defence", name, k, "Phrase", g["bid"], g["url"])

    for r in RIVALS:
        groups = dict(rival_groups(r))
        brand_ag = next((ag for ag, kind in rival_groups(r) if kind in ("brand", "both")), None)
        switch_ag = next((ag for ag, kind in rival_groups(r) if kind in ("switch", "both")), None)
        shapes = SWITCH_CORE + (SWITCH_EXTRA if r["tier"] == "A" else [])

        for s in r.get("brand_ok", []):
            add_kw(r["campaign"], brand_ag, s, "Exact", BID_BRAND, r["url"])
            add_kw(r["campaign"], brand_ag, s, "Phrase", BID_BRAND, r["url"])
        for s in r["stems"]:
            for shape in shapes:
                text = shape.format(s=s)
                add_kw(r["campaign"], switch_ag, text, "Exact", BID_SWITCH, r["url"])
                if shape in PHRASE_SHAPES:
                    add_kw(r["campaign"], switch_ag, text, "Phrase", BID_SWITCH, r["url"])

    for campaign, block in CATEGORY.items():
        for ag, g in block["groups"].items():
            for k in g["kw"]:
                add_kw(campaign, ag, k, "Exact", g["bid"], g["url"])
                add_kw(campaign, ag, k, "Phrase", g["bid"], g["url"])

    write("03-keywords.csv",
          ["Campaign", "Ad Group", "Keyword", "Criterion Type", "Max CPC", "Final URL", "Status"],
          kw_rows)

    # Negatives -----------------------------------------------------------
    neg_rows = []
    for c in CAMPAIGNS:
        for n in UNIVERSAL_NEGATIVES_EXACT:
            neg_rows.append([c["name"], "", f"[{n}]", "Campaign Negative Exact"])
        for n in UNIVERSAL_NEGATIVES_PHRASE:
            neg_rows.append([c["name"], "", f'"{n}"', "Campaign Negative Phrase"])
        if "Conquest" in c["name"]:
            for n in CONQUEST_NEGATIVES_PHRASE:
                neg_rows.append([c["name"], "", f'"{n}"', "Campaign Negative Phrase"])
        for n in CATEGORY_NEGATIVES_PHRASE.get(c["name"], []):
            neg_rows.append([c["name"], "", f'"{n}"', "Campaign Negative Phrase"])

    # Cross-campaign routing: a non-brand campaign must never answer a query
    # that belongs to brand or conquest, or the cheap campaign steals the
    # expensive campaign's traffic and both reports become fiction.
    brand_terms = ["apex applications", "apexapplications", "apex app amazon"]
    for c in CAMPAIGNS:
        if c["name"] == "S01 | Brand Defence":
            continue
        for t in brand_terms:
            neg_rows.append([c["name"], "", f'"{t}"', "Campaign Negative Phrase"])
    rival_terms = sorted({s for r in RIVALS for s in r.get("brand_ok", [])})
    for c in CAMPAIGNS:
        if "Conquest" in c["name"] or c["name"] == "S10 | DSA | Comparisons & Blog":
            continue
        for t in rival_terms:
            neg_rows.append([c["name"], "", f'"{t}"', "Campaign Negative Phrase"])

    write("04-negative-keywords.csv",
          ["Campaign", "Ad Group", "Keyword", "Criterion Type"], neg_rows)

    # Responsive search ads ----------------------------------------------
    ad_header = (["Campaign", "Ad Group", "Ad type"]
                 + [f"Headline {i}" for i in range(1, 16)]
                 + [f"Description {i}" for i in range(1, 5)]
                 + ["Path 1", "Path 2", "Final URL", "Status"])
    ad_rows = []

    def add_ad(campaign, ag, url):
        block = COPY[campaign]
        ad_rows.append([campaign, ag, "Responsive search ad"]
                       + block["headlines"] + list(block["descriptions"])
                       + [block["path"][0], block["path"][1], SITE + url, "Paused"])

    for name, g in BRAND_GROUPS.items():
        add_ad("S01 | Brand Defence", name, g["url"])
    for r in RIVALS:
        for ag, _kind in rival_groups(r):
            add_ad(r["campaign"], ag, r["url"])
    for campaign, block in CATEGORY.items():
        for ag, g in block["groups"].items():
            add_ad(campaign, ag, g["url"])

    write("05-responsive-search-ads.csv", ad_header, ad_rows)

    # Dynamic search ads --------------------------------------------------
    write(
        "06-dynamic-search-ads.csv",
        ["Campaign", "Ad Group", "Ad type", "Description 1", "Description 2",
         "Dynamic ad target condition", "Dynamic ad target value", "Status"],
        [
            ["S10 | DSA | Comparisons & Blog", "DSA | Comparison Pages", "Dynamic search ad",
             DSA_DESCRIPTIONS[0], DSA_DESCRIPTIONS[1], "URL_CONTAINS", "/compare", "Paused"],
            ["S10 | DSA | Comparisons & Blog", "DSA | Blog", "Dynamic search ad",
             DSA_DESCRIPTIONS[1], DSA_DESCRIPTIONS[0], "URL_CONTAINS", "/blog", "Paused"],
        ],
    )

    # Assets --------------------------------------------------------------
    write(
        "07-sitelinks.csv",
        ["Campaign", "Sitelink Text", "Sitelink Description 1", "Sitelink Description 2", "Final URL"],
        [[c["name"], t, d1, d2, SITE + u] for c in CAMPAIGNS for (t, d1, d2, u) in SITELINKS],
    )
    write(
        "08-callouts.csv",
        ["Campaign", "Callout text"],
        [[c["name"], t] for c in CAMPAIGNS for t in CALLOUTS],
    )
    write(
        "09-structured-snippets.csv",
        ["Campaign", "Header", "Values"],
        [[c["name"], header, ";".join(values)] for c in CAMPAIGNS for (header, values) in SNIPPETS],
    )

    # Reference sheet -----------------------------------------------------
    write(
        "10-conquest-landing-pages.csv",
        ["Rival", "Tier", "Campaign", "Ad group prefix", "Landing page", "Page exists"],
        [[r["name"], r["tier"], r["campaign"], rival_groups(r)[0][0], SITE + r["url"], "yes"]
         for r in RIVALS],
    )


if __name__ == "__main__":
    validate_copy()
    guard_conquest_copy()
    if problems:
        print("Copy validation failed:\n")
        for p in problems:
            print("  " + p)
        sys.exit(1)
    build()
    print("\nAll copy inside Google's limits, no rival named in a conquest ad.")
