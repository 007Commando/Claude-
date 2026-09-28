# Desktop remarketing: two campaigns, one person never sees both

Written 2026-09-27 after Stefano asked whether Taboola could put Apex "in
front of the right people when they are on their desktop so they can easily
navigate to clicking and connecting to their Seller Central". The answer was
no: the right people are already account holders, and the moment is a desktop
session. Then he made the sharper point: a remarketing campaign should be
optimised for the conversion Google bids on, which is Trial Started. So there
are two campaigns, and the audiences are built so they cannot overlap.

| Campaign | Who sees it | What it asks | Lands on |
|---|---|---|---|
| RMKT \| Start trial \| Desktop | account, **no plan** (connected or not) | Start the 7 day trial | `https://app.apexapplications.io/?start=trial` |
| RMKT \| Connect Seller Central \| Desktop | account, **has a plan, not connected** | Connect Seller Central | `https://app.apexapplications.io/amazon-setup` |

Money first: a person with no plan and no connection only ever sees the
trial ad. The connect ad is for people already paying who stalled on the
OAuth step, which is the group the "email me a link to finish on my
computer" button also serves.

## The audiences

Built from the Google Ads tag in the app (frontend branch
`feat/google-ads-tag`, env var `VITE_APP_GOOGLE_ADS_ID` set in hosting when it
ships). Google Ads' own audience builder works on URLs, not custom events
(those need a GA4 property the app tag deliberately does not have), so once
per session the tag reports the account's state as page views of virtual
paths no route serves:

- `/__audience/no-plan` or `/__audience/has-plan` (seller accounts; any live
  subscription counts as a plan, the same test as the backend's access gate)
- `/__audience/amazon-not-connected` or `/__audience/amazon-connected`
  (the connected path is sent again on OAuth success)

Segments in Google Ads (Tools > Audience manager > Your data), all "Website
visitors", rule "URL contains", prefill off:

| Segment | Rule | Window |
|---|---|---|
| App: no plan | `/__audience/no-plan` | 30 days |
| App: has plan | `/__audience/has-plan` | 540 days |
| App: Amazon not connected | `/__audience/amazon-not-connected` | 30 days |
| App: Amazon connected | `/__audience/amazon-connected` | 540 days |
| App visitors (any) | `app.apexapplications.io` | 30 days |

Campaign targeting:

- Start trial: target **App: no plan**, exclude **App: has plan**.
- Connect: target **App: has plan** AND **App: Amazon not connected** (both
  segments on the ad group, so membership needs both), exclude **App: no
  plan** and **App: Amazon connected**.

The exclusions are what stop a person who moves between states (starts a
trial, or connects) from lingering in the wrong list for the rest of the
window. Not Customer Match: the account is weeks old and Customer Match needs
policy history first; revisit at 90 days.

## Shared settings

- Type: Display, standard (not Performance Max, which ignores the audience).
- Audience as **targeting**, not observation; optimised targeting OFF.
- Devices: desktop only. Mobile and tablet bid adjustment -100%.
- Location United States, language English.
- Bidding: Manual CPC $0.60 to start; the lists are small, frequency matters
  more than bid. Frequency cap 3 per day per user.
- Budget: $5/day each. A few hundred people per list; more buys nothing.
- Conversion: Trial Started primary, as everywhere else.
- Tracking template:
  `{lpurl}?utm_source=google&utm_medium=display&utm_campaign=CAMPAIGN&utm_content={creative}&device={device}`
  with `rmkt-trial-desktop` / `rmkt-connect-desktop`.

## Copy: Start trial

Headlines (30):
- Start your 7 day free trial
- Your Apex account is ready
- Scan your first catalog today
- Repricer in every plan
- Built for wholesale sellers

Long headline (90):
- Your Apex account is ready. Start the 7 day trial and scan your first supplier catalog today.

Descriptions (90):
- You already have the account. Start the trial and see what every product in a catalog actually earns.
- Seven days free. Card up front, nothing charged until the trial ends, cancel in one click.
- Scanning, purchase orders, repricing and profit tracking, $149 a month for the whole suite.

Call to action: Start free trial. Business name: Apex Applications.

Landing `?start=trial`: signed in, no plan, opens Stripe checkout for Starter
monthly straight away (the same `selectPlan("starter","monthly")` call the
light lock uses, per the trial checkout flow); signed out, the param survives
sign-in and then does the same. Frontend branch `feat/start-trial-link`.

## Copy: Connect Seller Central

Headlines (30):
- Connect Seller Central
- Your Apex account is waiting
- Finish setup on your computer
- Sync Amazon sales to Apex
- One click to connect Amazon

Long headline (90):
- Connect Seller Central to Apex in two minutes and see profit, fees and restock needs by tomorrow.

Descriptions (90):
- You created the account. Connecting Amazon is the one step left, and it takes two minutes at a desk.
- Once connected, Apex pulls your orders, fees and inventory and shows what each SKU actually earns.
- Nothing to install. Sign in on your computer, click Connect, approve in Seller Central. Done.

Call to action: Connect now.

## Images

Generated by `creative.py` into `creative/` from the bull logo and the
purchase-orders screenshot the site serves: `rmkt-trial-1200x628.png`,
`rmkt-trial-1200x1200.png`, `rmkt-connect-1200x628.png`,
`rmkt-connect-1200x1200.png`, plus `logo-1200x1200.png` and
`logo-1200x300.png`.

## What would make the connect campaign unnecessary

The "Email me a link to finish on my computer" button (backend + frontend
branch `feat/finish-on-desktop`). If that moves the connect rate, the connect
ad is a backstop for people who ignored the email. Read both before spending:
connect rate for accounts created after the button ships vs before.
