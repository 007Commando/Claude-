# APEX landing page

Reference: https://www.realspiro.com/features, inspected live and against the user's full-page sequence of screenshots. The user owns the reference site and requested its design and animations with APEX content.

## Implementation

Matches the reference's illustrated city hero, inset translucent navigation, centered three-line rotating headline, yellow/white actions, floating orb, overlapping feature tabs, laptop showcase, moving brand strip, split phone showcase, dark orbital section, highlighted comparison column, pricing area, sticky trial action, and dotted footer wordmark.

Motion includes 2.8-second headline rotation, 9.5-second automatic desktop feature progression, 4.4-second orb float, 32-second brand marquee, staged phone messages, orbit floating/glow, and scroll reveals. These are recreated CSS/React sequences; no claim is made that every original source animation is identical. A global pause button and reduced-motion support control the sequences. Feature cycling pauses during interaction and remains manual on mobile.

## Assets

User-owned reference assets downloaded from the live page and stored locally:
- `public/images/landing/reference-city.webp`: `/features/realspiro/hero-city-v2.webp`
- `public/images/landing/phone-frame.png`: `/iphone-frame.png?v=2026-05-20-b`
- `public/fonts/landing/inter-{medium,semibold,bold}.woff2`: `/features/fillout/inter-*.woff2`

The laptop tabs use the repository's actual master catalog, vendors, purchase orders, profit/loss, and university screenshots in `public/__l5e/assets-v1/`. The demo uses the existing APEX video. The phone learning preview is illustrative and labeled accordingly. The earlier generated concept and commerce-sky image are retained as design history, but are superseded by the live reference assets.

## Content adaptations

APEX suite brands replace RealSpiro customer logos; learning replaces iMessage functionality; APEX tools replace unestablished integrations; suite coverage replaces competitor claims and savings. Pricing keeps APEX's two existing plans: Starter $149.99/month and Pro $299/month, with a 7-day trial and existing monthly signup routes. No $1 offer or third plan was introduced. Existing root attribution tracking remains in place.

## Verification

Production build and TypeScript check pass. Browser checks covered feature switching, automatic progression, global pause, demo dialog, comparison disclosure, and monthly signup destinations; no account or purchase was submitted. Latest desktop and mobile checks at observed CSS widths 1015 and 354 found no document overflow or broken images. The final supplier preview was inspected in a viewport screenshot using view_image. Temporary viewport override was reset and the browser returned to the hero with animations enabled. Full-page stitching was unreliable, so viewport captures were used instead.

Local preview: http://127.0.0.1:3012/. These changes have not been published.

## Seven browser comments — September 7 revision

Replaced the brand strip with six looping fictional product cards (cost, profit per unit, ROI, monthly sales, and sparklines); both cards and section label the data as demo. ROI is calculated as sample profit divided by sample cost. Removed the phone chat bubbles and hero orb. The phone now uses nested rounded clipping and a code-drawn bezel, removing the stretched bitmap-frame corner mismatch. Added moving orbital path segments, glints, and activity bars. Added a source-linked comparison with SellerAmp, InventoryLab, and sellerboard, describing documented workflow focus without unsupported absence claims or competitor pricing. Sources: https://selleramp.com/features/, https://www.threecolts.com/seller-365/inventorylab, https://sellerboard.com/.

New hero asset: `public/images/landing/warehouse-hero.png`, generated using the built-in image tool. Prompt: “Use case: stylized-concept. Create a wide website hero background for APEX Amazon wholesale sourcing software. Beautiful sunny anime-painted environment, vivid azure blue sky and billowy white clouds like a premium illustrated city landing page. Transform the setting into a modern fulfillment and sourcing district: warehouses and loading docks on lower left and right, blue glass office details, neatly stacked cardboard shipping cartons, a delivery truck, trees and distant industrial buildings. Huge clean blue-sky negative space across the central upper 65% for white website headline and buttons. Ground-level perspective with edges framing the center. Bright optimistic afternoon, painterly detailed architectural background, sophisticated not childish. No text, no logos, no UI, no drone (the drone will be a separate interactive layer), no characters. Landscape 1536x1024.”

The interactive drone is a separate CSS/React overlay with spinning rotors, pickup/carry/drop motion and a replay button. It follows a 14-second loop, honors the existing global pause/reduced-motion controls, and does not intercept clicks outside its replay button.

Validation: production build passed; browser replay button tested; global pause returned zero running element animations and disabled replay until resumed. Desktop width 1016 and mobile width 390 had matching document widths and no broken images. Inspected hero, product cards, corrected phone, and competitor table in browser screenshots. Restored normal viewport. Changes remain local.

## Navigation, delivery, and matrix refinement

Matched the reference navigation structure with centered product links, a white account capsule and a working dropdown menu; motion controls are inside the menu. Converted the comparison to icon-labeled rows, blue circular checks, related-capability indicators and unverified markers, retaining source-backed explanations in accessible hover/focus tooltips. Unverified markers explicitly do not imply a competitor lacks a feature. The three researched competitors remain, rather than inventing two additional competitors for column-count parity.

Moved dock cartons to the hero's bottom border. A single independently animated carton now sits at the pickup point, follows the drone, remains visible at the drop point while the drone returns, then resets for the next 14-second loop. Build passes. Browser replay and navigation/menu pause controls verified; no document overflow at observed width 693. Desktop navigation and border animation inspected visually.
