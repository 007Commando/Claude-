"""
Convert the Google Ads Editor import files in import/ into the format the
Google Ads web UI's Bulk uploads (Tools > Bulk actions > Uploads) accepts.

Editor and the web uploader do not share a format. Editor takes the files
build.py writes; the web uploader wants its own per-entity templates (Row
Type / Action / *status columns, "Type" as "Exact match", "EU political ads"
as Yes/No, "Language" not "Languages", and so on). Downloaded 2026-09-27 from
the uploader's "Download templates" panel, the templates are the source of
truth for the headers used here. It has no template for sitelinks, callouts or
structured snippets; those three files stay Editor-only and go in through the
UI.

Two deliberate differences from the Editor files:

- Only the CAMPAIGN is paused. Ad groups, keywords and ads are Enabled, so
  switching a campaign on is one click rather than a bulk unpause of 1,338
  keywords. Spend is gated by the campaign status either way.
- Targeting and the tracking template are set here, because the web uploader
  can carry them and the Editor files could not: United States only, English,
  and the campaign-level template from 05-tracking.md with the campaign's
  slug as utm_campaign.

build.py stays the source of truth. Run it first, then this:

    python3 build.py && python3 web_upload.py

Output: import/web/*.csv, uploaded one at a time in numeric order.
"""

import csv
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "import")
OUT = os.path.join(SRC, "web")

TRACKING = (
    "{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign=%s"
    "&utm_content={adgroupid}&utm_term={keyword}&matchtype={matchtype}&device={device}"
)


def slug(name: str) -> str:
    """'S01 | Brand Defence' -> 's01-brand-defence', safe inside a URL."""
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def read(name):
    with open(os.path.join(SRC, name), newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def write(name, header, rows):
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=header, extrasaction="raise")
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in header})
    print(f"  {name:38} {len(rows):5} rows")


def bare(keyword: str) -> str:
    """Editor renders match type into the text ([exact], "phrase"); the web
    uploader wants the bare words and a Type column."""
    return keyword.strip().strip("[]").strip('"').strip()


MATCH = {"Exact": "Exact match", "Phrase": "Phrase match", "Broad": "Broad match"}


def campaigns():
    header = ["Row Type", "Action", "Campaign status", "Campaign", "Campaign type",
              "Networks", "Budget", "Budget type", "Bid strategy type", "Language",
              "Location", "Tracking template", "EU political ads"]
    rows = []
    for c in read("01-campaigns.csv"):
        rows.append({
            "Row Type": "Campaign", "Action": "Add", "Campaign status": "Paused",
            "Campaign": c["Campaign"], "Campaign type": "Search",
            "Networks": "Google search", "Budget": c["Budget"], "Budget type": "Daily",
            "Bid strategy type": c["Bid Strategy Type"], "Language": "en",
            "Location": "United States",
            "Tracking template": TRACKING % slug(c["Campaign"]),
            "EU political ads": "No",
        })
    write("01-campaigns.csv", header, rows)


def ad_groups():
    header = ["Row Type", "Action", "Ad group status", "Campaign", "Ad group",
              "Ad group type", "Ad rotation", "Default max. CPC"]
    rows = []
    for g in read("02-ad-groups.csv"):
        dynamic = g["Campaign"].startswith("S10 ")
        rows.append({
            "Row Type": "Ad group", "Action": "Add", "Ad group status": "Enabled",
            "Campaign": g["Campaign"], "Ad group": g["Ad Group"],
            "Ad group type": "Dynamic" if dynamic else "Standard",
            "Ad rotation": "Optimize", "Default max. CPC": g["Max CPC"],
        })
    write("02-ad-groups.csv", header, rows)


def keywords():
    header = ["Row Type", "Action", "Keyword status", "Campaign", "Ad group",
              "Keyword", "Type", "Default max. CPC", "Final URL"]
    rows = []
    for k in read("03-keywords.csv"):
        rows.append({
            "Row Type": "Keyword", "Action": "Add", "Keyword status": "Enabled",
            "Campaign": k["Campaign"], "Ad group": k["Ad Group"],
            "Keyword": bare(k["Keyword"]), "Type": MATCH[k["Criterion Type"]],
            "Default max. CPC": k["Max CPC"], "Final URL": k["Final URL"],
        })
    write("03-keywords.csv", header, rows)


def negatives():
    header = ["Row Type", "Action", "Keyword status", "Level", "Campaign", "Ad group",
              "Negative keyword", "Type"]
    rows = []
    for n in read("04-negative-keywords.csv"):
        level = "Ad group" if n["Ad Group"] else "Campaign"
        match = "Exact match" if "Exact" in n["Criterion Type"] else "Phrase match"
        rows.append({
            "Row Type": "Negative keyword", "Action": "Add", "Keyword status": "Enabled",
            "Level": level, "Campaign": n["Campaign"], "Ad group": n["Ad Group"],
            "Negative keyword": bare(n["Keyword"]), "Type": match,
        })
    write("04-negative-keywords.csv", header, rows)


def rsas():
    heads = [f"Headline {i}" for i in range(1, 16)]
    descs = [f"Description {i}" for i in range(1, 5)]
    header = (["Row Type", "Action", "Ad status", "Campaign", "Ad group", "Ad type"]
              + heads + descs + ["Path 1", "Path 2", "Final URL"])
    rows = []
    for a in read("05-responsive-search-ads.csv"):
        row = {"Row Type": "Ad", "Action": "Add", "Ad status": "Enabled",
               "Campaign": a["Campaign"], "Ad group": a["Ad Group"],
               "Ad type": "Responsive search ad", "Path 1": a["Path 1"],
               "Path 2": a["Path 2"], "Final URL": a["Final URL"]}
        for h in heads + descs:
            row[h] = a.get(h, "")
        rows.append(row)
    write("05-responsive-search-ads.csv", header, rows)


if __name__ == "__main__":
    print("Building web Bulk uploads files")
    campaigns()
    ad_groups()
    keywords()
    negatives()
    rsas()
    print("Not converted (no web template): sitelinks, callouts, structured snippets, DSA targets.")
