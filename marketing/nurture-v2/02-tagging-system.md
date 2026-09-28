# APEX EMAIL EXPERIMENT TAGGING SYSTEM

Stefano's brief, pasted 2026-09-28. The schema `emails.csv` follows.

For every email in the Apex Applications nurture campaign, create and maintain a structured metadata record.

The purpose is to let us analyze performance after 30–60+ days and determine not only which individual emails perform best, but which underlying marketing mechanisms, hooks, formats, topics, and creative approaches drive the highest-quality conversions.

Do NOT change the email copy merely to fit a tag. Analyze the email as written and classify it.

Assign every email the following fields:

EMAIL_ID: Unique permanent identifier. Example: SELLER_01 or BEGINNER_14.

AUDIENCE: SELLER | NON_SELLER

SEND_DAY: Day in nurture sequence.

PRIMARY_FRAMEWORK (choose ONE): FOUNDER_NOTE | EDUCATION | DIRECT_RESPONSE | PROOF | VISUAL_DEMO | OBJECTION_HANDLING | PARADIGM_SHIFT | ROOT_PROBLEM | SEASONAL_URGENCY | ENTERTAINMENT_PATTERN_INTERRUPT | CUSTOMER_STORY | CONTRARIAN | COST_OF_INACTION | PROCESS_CLARITY

SECONDARY_FRAMEWORK: Optional. Use only when another mechanism is materially present.

HOOK_TYPE (dominant opening mechanism): CURIOSITY | SPECIFIC_NUMBER | PAIN | QUESTION | CONTRARIAN_CLAIM | CUSTOMER_RESULT | SEASONAL_EVENT | PERSONAL_FOUNDER | FEAR_OF_MISSING_OUT | PROBLEM_DIAGNOSIS | HOW_TO | MYTH_BUSTING | FUTURE_PACING | STORY

SUBJECT_TYPE (classify the subject separately from the body): CURIOSITY | NUMBER | QUESTION | DIRECT | CONTRARIAN | OUTCOME | PERSONAL | URGENCY | PAIN | EDUCATIONAL

LENGTH: MICRO (under 100 words) | SHORT (100–250) | MEDIUM (251–500) | LONG (501–800) | VERY_LONG (801+)

FORMAT: PLAIN_TEXT | DESIGNED_TEXT | GIF | SCREENSHOT | MULTIPLE_PROOF_SCREENSHOTS | DIAGRAM | MIXED_VISUAL

PRIMARY_TOPIC (examples): SUPPLIERS | CATALOG_SCANNING | UNGATING | PRODUCT_RESEARCH | BRAND_RESEARCH | PURCHASE_ORDER_BUILDER | RESTOCKING | COGS | PNL | REVIEW_BOOSTER | REPRICING | FIRST_PO | AMAZON_WHOLESALE_EDUCATION | LOGISTICS | PROFITABILITY | OPERATIONS | ACTIVATION

PAIN_POINT: the primary problem being activated, one short phrase.

DESIRED_OUTCOME: the primary outcome being sold, one short phrase.

EMOTIONAL_DRIVER (strongest): CURIOSITY | FRUSTRATION | ASPIRATION | FEAR | RELIEF | CONFIDENCE | URGENCY | BELONGING | SOCIAL_PROOF | CONTROL | SIMPLICITY | OPPORTUNITY

CTA_TYPE: START_TRIAL | VIEW_FEATURE | WATCH_DEMO | FIND_SUPPLIER | SCAN_CATALOG | REPLY | LEARN_MORE | RETURN_TO_APEX | OTHER

CTA_INTENSITY: SOFT | MEDIUM | HARD

PERSONALITY_LEVEL: LOW | MEDIUM | HIGH

SALES_PRESSURE: LOW | MEDIUM | HIGH

PROOF_TYPE: NONE | TRUSTPILOT | CUSTOMER_QUOTE | CUSTOMER_SCREENSHOT | SALES_RESULT | PAYOUT_RESULT | PRODUCT_DEMO | FOUNDER_EXPERIENCE | PLATFORM_DATA | OTHER

SEASONAL: TRUE | FALSE. If TRUE, SEASON_OR_EVENT: e.g. Q4, Prime Day, Holiday, January Planning.

EVERGREEN: TRUE | FALSE

INSPIRATION_MECHANIC (the marketing principle being tested, not a voice to copy): HORMOZI_EDUCATION | HORMOZI_ROOT_PROBLEM | IMAN_CLARITY | IMAN_OBJECTION | IMAN_FUTURE_PACING | SABRI_DIRECT_RESPONSE | SABRI_ENTERTAINMENT | SABRI_URGENCY | SABRI_PARADIGM_SHIFT | STEFANO_FOUNDER | APEX_PROOF | APEX_DEMO | HYBRID

Then, once emails begin sending, attach these performance fields:

SENT, DELIVERED, UNIQUE_OPENS, OPEN_RATE, UNIQUE_CLICKS, CTR, CLICK_TO_OPEN_RATE, REPLIES, REPLY_RATE, UNSUBSCRIBES, UNSUBSCRIBE_RATE, TRIAL_STARTS, TRIAL_START_RATE, TIME_TO_TRIAL, REVENUE, REVENUE_PER_LEAD

IMPORTANT: Trial Start Rate is more important than Open Rate. An email with a huge open rate but almost no trial starts should not automatically be considered a winner.

Analyze the entire funnel: DELIVERED → OPENED → CLICKED → STARTED TRIAL → ACTIVATED → PAID

If activation/payment data becomes available, also track: AMAZON_CONNECTED, COGS_ADDED, REVIEW_BOOSTER_ENABLED, FIRST_SUPPLIER_VIEWED_OR_ADDED, FIRST_CATALOG_SCAN, FIRST_PO, BECAME_PAID, REVENUE_PER_TRIAL

## ANALYSIS RULES

Once sufficient data exists, do not simply rank individual emails. Analyze performance across dimensions:

SELLER vs NON_SELLER; FOUNDER_NOTE vs EDUCATION vs PROOF vs DIRECT_RESPONSE; SHORT vs LONG; GIF vs PLAIN_TEXT; CUSTOMER_RESULT subject vs CURIOSITY subject; SOFT CTA vs HARD CTA; HIGH personality vs LOW personality; feature-specific vs broad Apex positioning; proof vs education; Hormozi-inspired educational mechanics vs Iman-inspired clarity mechanics vs Sabri-inspired direct-response mechanics vs Stefano founder emails; evergreen vs seasonal.

Most importantly, identify interactions. Examples: LONG emails may have lower CTR overall but LONG + CUSTOMER_STORY produces more trials; GIF emails may work for SELLERS but not NON_SELLERS; NON_SELLERS may respond to PROCESS_CLARITY while SELLERS respond to PAIN and COST_OF_INACTION; SPECIFIC_NUMBER subject lines may increase opens but attract weaker clicks; FOUNDER_NOTE emails may produce fewer clicks but more replies and eventual conversions.

Do not prematurely declare winners from tiny samples. Flag insufficient sample sizes. Separate correlation from causation. When comparing emails sent at different points in the nurture, account for SEND_DAY because later recipients are a more filtered population than Day 5 recipients. Also account for seasonality, lead source, and major changes in ad targeting whenever that information is available.

GOAL: over time, identify the combination of AUDIENCE + FRAMEWORK + HOOK + SUBJECT + LENGTH + FORMAT + TOPIC + EMOTIONAL DRIVER + CTA that produces the highest (1) Trial Start Rate, (2) Activation Rate, (3) Paid Conversion Rate, (4) Revenue Per Lead. Then use those findings to recommend the NEXT controlled email experiments rather than simply rewriting everything around the current top performer.
