#!/usr/bin/env python3
"""
Build GoHighLevel Email Builder templates for the 48 Nurture v2 emails.

Reads 01-brief.md (copy) and cta-map.json (per-email CTA target / ship flag /
proof quotes), applies the copy transformations described in the build
request, renders each email to a small HTML fragment, and either:

  --dry-run   writes out/<EMAIL_ID>.html for all 48 emails and prints a
              report table, WITHOUT calling the GHL API.
  --push      creates/updates the 47 shippable templates in GoHighLevel
              (matching existing templates by name, never duplicating) and
              writes templates.json.

Run dry-run first, spot check a few of the generated HTML files, then push.
"""

import argparse
import html as html_lib
import json
import os
import re
import sys
import time
import urllib.request

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BRIEF_PATH = os.path.join(BASE_DIR, "01-brief.md")
CTA_MAP_PATH = os.path.join(BASE_DIR, "cta-map.json")
OUT_DIR = os.path.join(BASE_DIR, "out")
TEMPLATES_JSON_PATH = os.path.join(BASE_DIR, "templates.json")

GHL_HELPER_DIR = "/private/tmp/claude-501/ghl"

ROUTER_BASE = "https://www.apexapplications.io/go"
LINK_COLOR = "#1d4ed8"

TEMPLATE_NAME_PREFIX = "Nurture v2 | "

# ---------------------------------------------------------------------------
# Parsing patterns
# ---------------------------------------------------------------------------

TRACK_A_HEADING = "# TRACK A — CURRENT AMAZON SELLERS"
TRACK_B_HEADING = "# TRACK B — NOT SELLING ON AMAZON YET"
TRACK_B_END_HEADING = "# VISUAL ASSET PLAN"

HEADING_RE = re.compile(r"^## (\d+)\. DAY \d+ — .+$")
SUBJECT_RE = re.compile(r"^\*\*Subject:\*\*\s*(.+)$")
CTA_RE = re.compile(r"^\*\*CTA:\s*(.+?)\*\*\s*$")

DROP_EXACT_LINES = {
    "**USE ONLY WITH A VERIFIED CUSTOMER RESULT.**",
    "**ONLY RUN WHEN TRUE. REPLACE SEASONALLY.**",
    "**ONLY RUN WHEN SEASONALLY TRUE.**",
}
ALT_SEASONAL_RE = re.compile(r"^\*\*Alternative seasonal versions:\*\*")

PLACEHOLDER_RE = re.compile(
    r"^\*\*\[(GIF|IMAGE|SCREENSHOT|VISUAL|TRUSTPILOT|REAL|VERIFIED)[^\]]*\]\*\*$",
    re.IGNORECASE,
)

SIGNOFF_RE = re.compile(r"^—\s*Stefano\s*$")

# A fully-bold, all-caps-ish line that isn't one of the known drop patterns,
# the alt-seasonal line, a placeholder, or the BEGINNER_07 process line —
# flagged in the report so a human can look at it instead of silently
# dropping or silently keeping something unexpected.
FULLY_BOLD_LINE_RE = re.compile(r"^\*\*[^*]+\*\*$")
KNOWN_PROCESS_LINE = (
    "**SUPPLIER → CATALOG → RESEARCH → RESTRICTIONS → PO → INVENTORY → SALE → RESTOCK**"
)

WORD_RE = re.compile(r"\b[\w'’]+\b", re.UNICODE)
TAG_RE = re.compile(r"<[^>]+>")
BOLD_MD_RE = re.compile(r"\*\*(.+?)\*\*")

unclassified_lines = []  # (email_id, line) for the report


# ---------------------------------------------------------------------------
# Loading
# ---------------------------------------------------------------------------

def load_brief_lines():
    with open(BRIEF_PATH, encoding="utf-8") as f:
        return f.read().split("\n")


def load_cta_map():
    with open(CTA_MAP_PATH, encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Block extraction
# ---------------------------------------------------------------------------

def find_line(lines, text, start=0):
    for i in range(start, len(lines)):
        if lines[i].strip() == text:
            return i
    raise ValueError(f"could not find line: {text!r}")


def track_blocks(lines, track_start, track_end, id_prefix):
    """Return list of (email_id, subject_line_idx, cta_line_idx, block_end_idx)."""
    heading_idxs = [
        i for i in range(track_start, track_end) if HEADING_RE.match(lines[i].strip())
    ]
    blocks = []
    for n, h_idx in enumerate(heading_idxs):
        block_end = heading_idxs[n + 1] if n + 1 < len(heading_idxs) else track_end
        email_id = f"{id_prefix}_{n + 1:02d}"

        subject_idx = None
        for i in range(h_idx, block_end):
            if SUBJECT_RE.match(lines[i].strip()):
                subject_idx = i
                break
        if subject_idx is None:
            raise ValueError(f"{email_id}: no Subject line found in its block")

        cta_idx = None
        for i in range(subject_idx + 1, block_end):
            if CTA_RE.match(lines[i].strip()):
                cta_idx = i
                break
        if cta_idx is None:
            raise ValueError(f"{email_id}: no CTA line found in its block")

        blocks.append((email_id, subject_idx, cta_idx, block_end))
    return blocks


def group_paragraphs(raw_lines):
    """Split a list of lines into paragraphs (lists of lines) on blank lines."""
    paragraphs = []
    current = []
    for l in raw_lines:
        if l.strip() == "":
            if current:
                paragraphs.append(current)
                current = []
        else:
            current.append(l.strip())
    if current:
        paragraphs.append(current)
    return paragraphs


# ---------------------------------------------------------------------------
# Text transforms
# ---------------------------------------------------------------------------

def fix_dashes_and_slang(line, email_id):
    """Rule 4 (minus the sign-off handling, done separately): replace any
    mid-sentence em/en dash, and soften 'repetitive shit'. Arrows (→) are
    left untouched."""
    line = re.sub(r"repetitive shit", "repetitive work", line, flags=re.IGNORECASE)
    if "—" in line or "–" in line:
        # No mid-sentence dashes are expected in the source copy (verified
        # while building this script) — if one shows up, fall back to a
        # comma and flag it so a human confirms the choice reads correctly.
        unclassified_lines.append(
            (email_id, f"[dash fallback -> comma] {line}")
        )
        line = line.replace(" — ", ", ").replace(" – ", ", ")
        line = line.replace("—", ",").replace("–", ",")
    return line


def md_line_to_html(line):
    """Escape HTML, then convert **bold** to <strong>. {{contact.first_name}}
    passes through untouched (braces aren't escaped)."""
    escaped = html_lib.escape(line, quote=False)
    return BOLD_MD_RE.sub(r"<strong>\1</strong>", escaped)


def paragraph_to_html(lines):
    return "<p>" + "<br>".join(md_line_to_html(l) for l in lines) + "</p>"


def strip_md_and_tags(text):
    text = text.replace("**", "")
    text = TAG_RE.sub("", text)
    return text.strip()


def render_quote_blockquote(q, profile_url):
    quote_text = html_lib.escape(q["quote"], quote=False)
    name = html_lib.escape(q["name"], quote=False)
    country = html_lib.escape(q["country"], quote=False)
    date = html_lib.escape(q["date"], quote=False)
    url = html_lib.escape(profile_url, quote=True)
    return (
        '<blockquote style="margin:0 0 16px 0; padding:0 0 0 12px; '
        'border-left:3px solid #d1d5db; color:#374151;">'
        f"“{quote_text}”<br>"
        f'{name}, {country}, {date}, on <a href="{url}" style="color:{LINK_COLOR};">Trustpilot</a>'
        "</blockquote>"
    )


def render_cta(label, target, email_id):
    url = html_lib.escape(f"{ROUTER_BASE}/{target}?e={email_id}", quote=True)
    label_html = html_lib.escape(label, quote=False)
    return f'<p><a href="{url}" style="color:{LINK_COLOR};">{label_html}</a></p>'


SIGNOFF_HTML = "<p>Stefano<br>Apex Applications</p>"


# ---------------------------------------------------------------------------
# Per-email build
# ---------------------------------------------------------------------------

def build_email(email_id, subject, raw_body_lines, cta_label, cta_meta, proof_data):
    paragraphs = group_paragraphs(raw_body_lines)

    is_proof = "proof" in cta_meta
    proof_quotes = []
    profile_url = None
    if is_proof:
        proof_quotes = proof_data[cta_meta["proof"]]
        profile_url = proof_data["profile_url"]

    body_parts = []
    found_signoff = False
    proof_inserted = False
    placeholder_dropped = False

    for para_lines in paragraphs:
        # Every paragraph here (verified against the source) is a single line.
        joined = " ".join(para_lines).strip()

        if joined in DROP_EXACT_LINES or ALT_SEASONAL_RE.match(joined):
            continue

        if PLACEHOLDER_RE.match(joined):
            placeholder_dropped = True
            if is_proof:
                if not proof_inserted:
                    for q in proof_quotes:
                        body_parts.append(render_quote_blockquote(q, profile_url))
                    proof_inserted = True
                # else: additional placeholder in the same run, already covered
            # non-proof placeholders are simply dropped
            continue

        if len(para_lines) == 1 and SIGNOFF_RE.match(para_lines[0]):
            found_signoff = True
            continue

        if (
            len(para_lines) == 1
            and FULLY_BOLD_LINE_RE.match(para_lines[0])
            and para_lines[0] != KNOWN_PROCESS_LINE
            and para_lines[0].upper() == para_lines[0]
            and para_lines[0] not in DROP_EXACT_LINES
        ):
            # Fully bold, all-caps line we don't recognize — flag, but keep
            # it in the copy rather than silently eating content.
            unclassified_lines.append((email_id, para_lines[0]))

        processed_lines = [fix_dashes_and_slang(l, email_id) for l in para_lines]
        body_parts.append(paragraph_to_html(processed_lines))

    if is_proof and not proof_inserted:
        unclassified_lines.append(
            (email_id, "[proof email but no placeholder line found to replace with quotes]")
        )

    cta_html = render_cta(cta_label, cta_meta["target"], email_id)

    if found_signoff:
        content_parts = body_parts + [cta_html, SIGNOFF_HTML]
    else:
        content_parts = body_parts + [cta_html]

    inner_html = "".join(content_parts)
    full_html = (
        '<div style="font-family: -apple-system, Helvetica, Arial, sans-serif; '
        'font-size: 16px; line-height: 1.5; color: #111827; max-width: 560px;">'
        f"{inner_html}</div>"
    )

    # Preview text = first line of the body, plain text.
    if body_parts:
        preview_text = strip_md_and_tags(body_parts[0])
    else:
        preview_text = subject

    word_count = len(WORD_RE.findall(strip_md_and_tags(inner_html)))

    flags = []
    if not cta_meta.get("ship", True):
        flags.append("skipped")
    if is_proof:
        flags.append("proof")
    if "seasonal" in cta_meta:
        flags.append(f"seasonal:{cta_meta['seasonal']}")
    if found_signoff:
        flags.append("founder")
    if placeholder_dropped and not is_proof:
        flags.append("placeholder_removed")

    return {
        "id": email_id,
        "subject": subject,
        "cta_label": cta_label,
        "cta_target": cta_meta["target"],
        "html": full_html,
        "word_count": word_count,
        "flags": flags,
        "ship": cta_meta.get("ship", True),
        "preview_text": preview_text[:150],
        "name": f"{TEMPLATE_NAME_PREFIX}{email_id} | {subject}",
    }


def parse_all():
    lines = load_brief_lines()
    cta_map = load_cta_map()
    proof_data = cta_map["_proof"]

    track_a_start = find_line(lines, TRACK_A_HEADING)
    track_b_start = find_line(lines, TRACK_B_HEADING, start=track_a_start + 1)
    track_b_end = find_line(lines, TRACK_B_END_HEADING, start=track_b_start + 1)

    blocks_a = track_blocks(lines, track_a_start, track_b_start, "SELLER")
    blocks_b = track_blocks(lines, track_b_start, track_b_end, "BEGINNER")

    results = []
    for email_id, subject_idx, cta_idx, block_end in blocks_a + blocks_b:
        subject = SUBJECT_RE.match(lines[subject_idx].strip()).group(1).strip()
        cta_label = CTA_RE.match(lines[cta_idx].strip()).group(1).strip()
        raw_body_lines = lines[subject_idx + 1 : cta_idx]

        if email_id not in cta_map:
            raise ValueError(f"{email_id} missing from cta-map.json")
        cta_meta = cta_map[email_id]

        result = build_email(
            email_id, subject, raw_body_lines, cta_label, cta_meta, proof_data
        )
        results.append(result)

    return results


# ---------------------------------------------------------------------------
# Reporting
# ---------------------------------------------------------------------------

def print_report_table(results):
    header = f"{'EMAIL_ID':<14}{'SUBJECT':<52}{'CTA TARGET':<14}{'WORDS':<7}FLAGS"
    print(header)
    print("-" * len(header))
    for r in results:
        subj = r["subject"] if len(r["subject"]) <= 48 else r["subject"][:45] + "..."
        flags = ",".join(r["flags"]) if r["flags"] else "-"
        print(f"{r['id']:<14}{subj:<52}{r['cta_target']:<14}{r['word_count']:<7}{flags}")


def print_unclassified():
    if not unclassified_lines:
        print("\nNo unclassified lines — every line in the brief matched a known pattern.")
        return
    print("\nLines the parser could not classify:")
    for email_id, line in unclassified_lines:
        print(f"  [{email_id}] {line}")


# ---------------------------------------------------------------------------
# Dry run
# ---------------------------------------------------------------------------

def run_dry_run(results):
    os.makedirs(OUT_DIR, exist_ok=True)
    for r in results:
        path = os.path.join(OUT_DIR, f"{r['id']}.html")
        with open(path, "w", encoding="utf-8") as f:
            f.write(r["html"])
    print(f"Wrote {len(results)} files to {OUT_DIR}\n")
    print_report_table(results)
    print_unclassified()


# ---------------------------------------------------------------------------
# Push
# ---------------------------------------------------------------------------

def fetch_existing_builders():
    sys.path.insert(0, GHL_HELPER_DIR)
    from g import req, LOC  # noqa: local import, only needed for --push

    by_name = {}
    offset = 0
    limit = 100
    for _ in range(50):  # hard safety cap (5000 templates)
        resp = req(
            "GET",
            "/emails/builder",
            params={"locationId": LOC, "limit": limit, "offset": offset},
        )
        builders = resp.get("builders", [])
        if not builders:
            break
        for b in builders:
            by_name[b.get("name")] = b.get("id")
        if len(builders) < limit:
            break
        offset += limit
    return by_name


def push_all(results):
    sys.path.insert(0, GHL_HELPER_DIR)
    from g import req, LOC  # noqa: local import

    existing_by_name = fetch_existing_builders()

    created, updated, skipped, failed = [], [], [], []
    templates = {}

    for r in results:
        if not r["ship"]:
            skipped.append(r["id"])
            continue

        name = r["name"]
        try:
            if name in existing_by_name:
                template_id = existing_by_name[name]
                action = "updated"
            else:
                create_resp = req(
                    "POST",
                    "/emails/builder",
                    {
                        "locationId": LOC,
                        "type": "html",
                        "title": name,
                        "isPlainText": True,
                    },
                )
                template_id = create_resp["id"]
                action = "created"

            data_resp = req(
                "POST",
                "/emails/builder/data",
                {
                    "locationId": LOC,
                    "templateId": template_id,
                    "updatedBy": "Claude",
                    "html": r["html"],
                    "editorType": "html",
                    "isPlainText": True,
                    "previewText": r["preview_text"],
                },
            )
            preview_url = data_resp.get("previewUrl")

            templates[r["id"]] = {
                "templateId": template_id,
                "name": name,
                "subject": r["subject"],
                "previewUrl": preview_url,
            }
            if action == "created":
                created.append(r["id"])
            else:
                updated.append(r["id"])

            time.sleep(0.2)
        except Exception as e:  # noqa: broad, we want to record and continue
            failed.append((r["id"], str(e)))

    with open(TEMPLATES_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(templates, f, indent=2)

    print(f"Created: {len(created)} {created}")
    print(f"Updated: {len(updated)} {updated}")
    print(f"Skipped (ship:false): {len(skipped)} {skipped}")
    print(f"Failed: {len(failed)}")
    for email_id, err in failed:
        print(f"  [{email_id}] {err}")
    print(f"\nWrote {TEMPLATES_JSON_PATH}")

    # Verify one previewUrl
    verify_one_preview(templates)

    return created, updated, skipped, failed


def verify_one_preview(templates):
    for email_id, t in templates.items():
        url = t.get("previewUrl")
        if not url:
            continue
        try:
            req_obj = urllib.request.Request(
                url, headers={"User-Agent": "Mozilla/5.0"}
            )
            with urllib.request.urlopen(req_obj, timeout=15) as resp:
                body_text = resp.read().decode("utf-8", errors="replace")
            found = "yes" if len(body_text) > 200 else "no (short response)"
            print(
                f"\nVerified previewUrl for {email_id} ({url}): "
                f"fetched {len(body_text)} chars, body present: {found}"
            )
        except Exception as e:
            print(f"\nCould not verify previewUrl for {email_id}: {e}")
        return


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--dry-run", action="store_true")
    group.add_argument("--push", action="store_true")
    args = parser.parse_args()

    results = parse_all()
    assert len(results) == 48, f"expected 48 emails, parsed {len(results)}"

    if args.dry_run:
        run_dry_run(results)
    else:
        push_all(results)


if __name__ == "__main__":
    main()
