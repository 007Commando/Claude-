"""
Q4 2026 trial push, sent through Mandrill (Stefano, 2026-10-01).

  python3 q4send.py test  <email>   one copy of each email (both variants) to <email>
  python3 q4send.py day1 [--go]     Q4_1 to everyone in the audience
  python3 q4send.py day2 [--go]     Q4_2 to day-1 recipients who have not opened it
  python3 q4send.py day3 [--go]     Q4_3 to anyone who opened day 1 or 2
  python3 q4send.py status          opens per day

Without --go it only prints who would get what. Before every send it drops
anyone Stripe shows active, trialing or past due, anyone already sent that
day (sent-<day>.json), and Mandrill itself skips unsubscribes and bounces.
Audience and logs live outside the repo (they hold email addresses):
DATA = APEX/marketing-exports/q4-2026/.
"""
import json, os, sys, time, base64, urllib.request, urllib.parse
from datetime import datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, "../../../marketing-exports/q4-2026"))
BACKEND_ENV = os.path.normpath(os.path.join(HERE, "../../../apex-apps/backend/.env.apex-apps-parent"))
APP_ENV = os.path.normpath(os.path.join(HERE, "../../.env.local"))

def env(path, key):
    for line in open(path):
        if line.startswith(key + "="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise KeyError(key)

MKEY = env(BACKEND_ENV, "MAILCHIMP_TRANSACTIONAL_API_KEY")
SKEY = env(APP_ENV, "STRIPE_SECRET_KEY")

FOOTER = (
    '<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#9ca3af;'
    'max-width:560px;margin-top:28px;padding-top:14px;border-top:1px solid #e5e7eb;">'
    "You're getting this because you signed up for Apex or asked us about it. "
    '<a href="*|UNSUB:https://www.apexapplications.io|*" style="color:#9ca3af;">Unsubscribe</a><br>'
    "Apex Applications, 8 The Green, Dover, DE 19901, USA</div>"
)

DAYS = {"day1": "Q4_1", "day2": "Q4_2", "day3": "Q4_3"}

def mandrill(path, body):
    body = dict(body, key=MKEY)
    r = urllib.request.Request("https://mandrillapp.com/api/1.0/" + path, data=json.dumps(body).encode(),
                               headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(r, timeout=120) as resp:
        return json.load(resp)

def stripe_active_emails():
    auth = base64.b64encode((SKEY + ":").encode()).decode()
    out = set()
    for st in ("active", "trialing", "past_due", "unpaid"):
        after = None
        while True:
            p = {"status": st, "limit": 100, "expand[]": "data.customer"}
            if after: p["starting_after"] = after
            r = urllib.request.Request("https://api.stripe.com/v1/subscriptions?" + urllib.parse.urlencode(p, doseq=True),
                                       headers={"Authorization": "Basic " + auth})
            d = json.load(urllib.request.urlopen(r, timeout=60))
            for s in d["data"]:
                c = s["customer"]
                if isinstance(c, dict) and c.get("email"): out.add(c["email"].lower())
            if not d.get("has_more"): break
            after = d["data"][-1]["id"]
    return out

def email_parts(eid, variant):
    html = open(os.path.join(HERE, "out", f"{eid}_{variant}.html")).read() + FOOTER
    subj, pre = open(os.path.join(HERE, "out", f"{eid}_{variant}.subject.txt")).read().strip().split("\n")
    return subj, html

def load(name, default):
    p = os.path.join(DATA, name)
    return json.load(open(p)) if os.path.exists(p) else default

def save(name, obj):
    json.dump(obj, open(os.path.join(DATA, name), "w"), indent=1)

def opens_by_email(tag, days_back=5):
    """email -> total opens for messages carrying this Mandrill tag."""
    out = {}
    date_from = (datetime.now(timezone.utc) - timedelta(days=days_back)).strftime("%Y-%m-%d")
    res = mandrill("messages/search.json", {"query": f'tags:"{tag}"', "date_from": date_from, "limit": 1000})
    for m in res:
        e = m["email"].lower()
        out[e] = out.get(e, 0) + (m.get("opens") or 0)
    return out, res

def send(eid, variant, emails, tags, go):
    subj, html = email_parts(eid, variant)
    results = []
    for i in range(0, len(emails), 100):
        chunk = emails[i:i + 100]
        if not go:
            continue
        msg = {
            "html": html, "subject": subj,
            "from_email": "info@apexapplications.io", "from_name": "Stefano at Apex",
            "to": [{"email": e, "type": "to"} for e in chunk],
            "preserve_recipients": False, "track_opens": True, "track_clicks": False,
            "tags": tags, "metadata": {"campaign": "q4-2026", "email": eid},
        }
        results += mandrill("messages/send.json", {"message": msg, "async": False})
        time.sleep(2)
    return results

def run_day(day, go):
    eid = DAYS[day]
    audience = {a["email"]: a["variant"] for a in load("audience.json", [])}
    sent_before = {r["email"] for r in load(f"sent-{day}.json", [])}
    paying = stripe_active_emails()
    if day == "day1":
        targets = set(audience)
    elif day == "day2":
        opens, msgs = opens_by_email("q4-day1")
        delivered = {m["email"].lower() for m in msgs if m.get("state") in ("sent", "deferred")}
        targets = {e for e in delivered if opens.get(e, 0) == 0}
    else:
        o1, _ = opens_by_email("q4-day1"); o2, _ = opens_by_email("q4-day2")
        targets = {e for e in set(o1) | set(o2) if o1.get(e, 0) + o2.get(e, 0) > 0}
    targets = {e for e in targets if e in audience and e not in paying and e not in sent_before}
    by_variant = {}
    for e in sorted(targets):
        by_variant.setdefault(audience[e], []).append(e)
    print(f"{day} ({eid}): {len(targets)} to send  " + "  ".join(f"{v}={len(l)}" for v, l in by_variant.items())
          + f"  | skipped as paying/trialing: {len(paying & set(audience))}" + ("" if go else "  [dry run, add --go to send]"))
    if not go:
        return
    log = load(f"sent-{day}.json", [])
    for variant, emails in by_variant.items():
        res = send(eid, variant, emails, ["q4-2026", f"q4-{day}"], go)
        log += [{"email": r["email"], "status": r["status"], "reason": r.get("reject_reason"), "variant": variant,
                 "at": datetime.now(timezone.utc).isoformat()} for r in res]
        save(f"sent-{day}.json", log)
    states = {}
    for r in log: states[r["status"]] = states.get(r["status"], 0) + 1
    print("result:", states)

def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    go = "--go" in sys.argv
    if cmd == "test":
        to = sys.argv[2]
        for eid in ("Q4_1", "Q4_2", "Q4_3"):
            for v in ("lead", "acct"):
                subj, html = email_parts(eid, v)
                r = mandrill("messages/send.json", {"message": {
                    "html": html, "subject": f"[TEST {eid} {v}] {subj}",
                    "from_email": "info@apexapplications.io", "from_name": "Stefano at Apex",
                    "to": [{"email": to}], "track_opens": True, "track_clicks": False, "tags": ["q4-test"]}})
                print(eid, v, r[0]["status"], r[0].get("reject_reason"))
    elif cmd in DAYS:
        run_day(cmd, go)
    else:
        for day in DAYS:
            o, msgs = opens_by_email(f"q4-{day}")
            if msgs:
                print(f"{day}: sent {len(msgs)}, opened {sum(1 for v in o.values() if v)}")

if __name__ == "__main__":
    main()
