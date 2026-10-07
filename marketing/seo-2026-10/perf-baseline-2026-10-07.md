# Lighthouse baseline: www.apexapplications.io

Generated 2026-10-07 with Lighthouse 12.8.2, system Google Chrome (headless), run from one Mac on one network.

**These are lab measurements from one machine and one network, not real-user (CrUX) field data.** Mobile = Lighthouse default (Moto G Power emulation, simulated slow 4G, 4x CPU slowdown). Desktop = `--preset=desktop`. Each mobile page was run three times (the task asked for two; a third was added because two runs disagreed by up to 0.33 on some pages) and the median-performance run is reported, with all three scores shown; desktop was run once. Raw JSON is in `raw/`.

## Summary table

| Page | Form | Perf | LCP | CLS | TBT | FCP | Speed Index | Total bytes | JS bytes | 3rd-party reqs | A11y | SEO | Best-pr |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| / | Mobile | 86 (runs 65 / 86 / 95) | 2.89s | 0.000 | 358 ms | 1.02s | 3.21s | 3724 KiB | 1237 KiB | 33 | 88 | 100 | 75 |
| / | Desktop | 99 | 0.63s | 0.000 | 0 ms | 0.30s | 1.19s | 3673 KiB | 1142 KiB | 22 | 94 | 100 | 74 |
| /ai | Mobile | 49 (runs 36 / 49 / 78) | 8.69s | 0.000 | 1638 ms | 1.11s | 2.37s | 1486 KiB | 1240 KiB | 29 | 90 | 100 | 75 |
| /ai | Desktop | 90 | 2.15s | 0.000 | 15 ms | 0.35s | 0.57s | 1402 KiB | 1144 KiB | 22 | 95 | 100 | 74 |
| /pricing | Mobile | 57 (runs 31 / 57 / 64) | 11.69s | 0.000 | 195 ms | 6.07s | 6.07s | 1519 KiB | 1232 KiB | 28 | 88 | 100 | 75 |
| /pricing | Desktop | 83 | 2.52s | 0.000 | 67 ms | 0.84s | 1.62s | 1429 KiB | 1130 KiB | 23 | 94 | 100 | 74 |
| /features/green | Mobile | 62 (runs 62 / 62 / 84) | 4.31s | 0.000 | 1201 ms | 0.93s | 1.59s | 2056 KiB | 1234 KiB | 28 | 89 | 100 | 75 |
| /features/green | Desktop | 99 | 0.84s | 0.000 | 52 ms | 0.29s | 0.87s | 1972 KiB | 1138 KiB | 22 | 95 | 100 | 74 |
| /compare/seller-assistant | Mobile | 67 (runs 52 / 67 / 77) | 5.49s | 0.000 | 304 ms | 3.17s | 3.17s | 1575 KiB | 1243 KiB | 28 | 89 | 100 | 75 |
| /compare/seller-assistant | Desktop | 100 | 0.59s | 0.000 | 5 ms | 0.27s | 0.42s | 1482 KiB | 1142 KiB | 22 | 94 | 100 | 74 |
| /blog/amazon-fba-fees-explained | Mobile | 87 (runs 84 / 87 / 90) | 3.01s | 0.000 | 339 ms | 1.05s | 1.05s | 1636 KiB | 1225 KiB | 28 | 90 | 100 | 75 |
| /blog/amazon-fba-fees-explained | Desktop | 100 | 0.76s | 0.000 | 0 ms | 0.39s | 0.39s | 1552 KiB | 1130 KiB | 22 | 96 | 100 | 74 |
| /tools/fba-calculator | Mobile | 63 (runs 56 / 63 / 68) | 12.48s | 0.000 | 484 ms | 0.93s | 1.23s | 1495 KiB | 1254 KiB | 28 | 90 | 100 | 75 |
| /tools/fba-calculator | Desktop | 86 | 2.67s | 0.000 | 2 ms | 0.30s | 0.53s | 1383 KiB | 1130 KiB | 22 | 96 | 100 | 74 |

JS bytes = transfer size of Script resources. 3rd-party reqs = requests to hosts other than www.apexapplications.io.


## Run notes and cross-cutting findings

- Raw JSON: `raw/<page>.<mobile|desktop>.<n>.json` (3 mobile runs and 1 desktop run per page). `raw/home.mobile.1.PAGE_HUNG.errored.json` is a failed run (Chrome hung) and `raw/home.desktop.1.early.json` is an earlier desktop run from before the harness was fixed; both are kept but excluded from the tables.
- Variance is large on mobile (for example /pricing 31 / 57 / 64, /ai 36 / 49 / 78, / 65 / 86 / 95). Treat single mobile scores as +/- 15 points. Desktop was a single run per page.
- Every mobile LCP element is **text** (an h1 or a paragraph), never an image. The LCP phase table shows Load Delay 0 and Load Time 0 and the whole cost is **Render Delay** (e.g. /ai 8.1s, /pricing 10.5s, /tools/fba-calculator 11.8s on mobile). The page is not waiting for a resource; it is waiting for the main thread / hydration. Server HTML for `/`, `/ai`, `/features/green`, `/compare/seller-assistant` and `/tools/fba-calculator` ships hero elements with inline `style="opacity:0;transform:translateY(..px)"` (32, 9, 3, 16 and 5 occurrences; the fba-calculator `<h1>` itself is one), so the text is invisible until JS hydrates and the entrance animation runs. /pricing and the blog post have no such elements (blog mobile LCP is 3.0s, one of the two best).
- Main thread is saturated by third-party tags, not first-party code: Facebook pixel (263 KiB, up to 734 ms blocking on /features/green mobile) and Google Tag Manager/gtag (355 KiB, 119-453 ms blocking) are the top two third parties on every page. Long tasks on /ai mobile include fbevents.js 1443 ms and gtag 676 ms.
- `0hxj60v3t_s_5.js` (75 KiB, 71 KiB unused) is a Zod runtime (`_zod` in the bundle head) that loads on every page and is 100% unused at load. `1rx4n59ymi-cg.js` (70 KiB) is the Next/Turbopack runtime chunk; it is the largest first-party bootup cost on `/` (1.8 s on mobile).
- `POST https://www.apexapplications.io/api/track` returned **503** during every mobile run that logged it (errors-in-console). A plain GET returns 405, so the route exists; the 503 is on the POST path (not replayed from here to avoid writing tracking data).
- Third-party cookies (best-practices `third-party-cookies`, `inspector-issues`): set by `bzrcdn.openai.com/sdk/oaiq.min.js` (`__cf_bm`, `_cfuvid`) and Google Ads `googleads.g.doubleclick.net` (`test_cookie`). These two audits fail on every page.
- Home page ships two videos in the initial transfer: `/videos/dashboard-hero-demo.mp4` (1,415 KiB) and `sourcing-speed.mp4` (809 KiB), i.e. 60% of the 3.7 MB page weight. Every other page is about 1.4 to 2.0 MB.
- The same site-wide header/footer elements fail on all pages: mobile menu `button.p-2` has no accessible name (button-name), the logo image has redundant alt text (image-redundant-alt), and the footer link badges `span.rounded-full` and `span.block.text-xs.text-slate-400` fail color-contrast.
- SEO score is 100 on every page and form factor; best-practices is 74-75 everywhere because of the same three audits (errors-in-console, third-party-cookies, inspector-issues).

# Per-page findings

## /

### Mobile (final URL https://www.apexapplications.io/)
- LCP element: div.max-w-7xl > div.lg:grid > div.max-w-2xl > h1.text-5xl [<h1 class="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] mb-10 tracki…">]
- LCP phases: TTFB 626ms, Load Delay 0ms, Load Time 0ms, Render Delay 2259ms
- Unused JS (total wasted 366 KiB), top 5:
  - https://www.googletagmanager.com/gtag/js?id=G-21W9317C2L: 77 KiB wasted of 190 KiB
  - https://www.apexapplications.io/_next/static/chunks/0hxj60v3t_s_5.js: 71 KiB wasted of 71 KiB
  - https://www.googletagmanager.com/gtag/js?id=AW-17638589911&cx=c&gtm=4e6a60: 61 KiB wasted of 164 KiB
  - https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications...: 41 KiB wasted of 147 KiB
  - https://connect.facebook.net/en_US/fbevents.js: 38 KiB wasted of 110 KiB
- uses-responsive-images (90 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 57 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 33 KiB
- modern-image-formats (97 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 55 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
- unsized-images ():
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt]
  - https://www.apexapplications.io/__l5e/assets-v1/b3e15893-18f1-44d2-aebb-f3ab4aaf9bcd/bull-blue.png div.relative > div.lg:order-2 > a.group > img.h-16 [<img src="/__l5e/assets-v1/b3e15893-18f1-44d2-aebb-f3ab4aaf9bcd/bull-blue.png" alt="APEX B]
  - https://www.apexapplications.io/__l5e/assets-v1/a0c4a52b-a77b-4b9a-b0ab-bc2869ea2c95/bull-black.png div.relative > div.lg:order-1 > a.group > img.h-16 [<img src="/__l5e/assets-v1/a0c4a52b-a77b-4b9a-b0ab-bc2869ea2c95/bull-black.png" alt="APEX ]
  -  div.relative > div.lg:order-1 > a.group > img.h-16 [<img src="" alt="APEX GREEN" loading="lazy" decoding="async" class="h-16 w-auto object-con]
- offscreen-images (47 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 47 KiB
- Third-party summary top: Google Tag Manager (355 KiB, main-thread 316ms, blocking 150ms); Facebook (263 KiB, main-thread 353ms, blocking 135ms); firebaseapp.com (94 KiB, main-thread 0ms, blocking 0ms); msgsndr.com (84 KiB, main-thread 45ms, blocking 0ms); Google CDN (49 KiB, main-thread 54ms, blocking 0ms); Other Google APIs/SDKs (42 KiB, main-thread 45ms, blocking 0ms)
- uses-long-cache-ttl: 9 resources found -> https://www.googletagmanager.com/a?id=G-21W9317C2L&v=3&t=t&pid=497354944&gtm=45je6a60v9265338671za200zd9265... 0 KiB; https://www.googletagmanager.com/a?id=G-21W9317C2L&v=3&t=t&pid=497354944&gtm=45je6a60v9265338671za200zd9265... 0 KiB; https://www.googletagmanager.com/a?id=G-21W9317C2L&v=3&t=t&pid=497354944&gtm=45je6a60v9265338671za200zd9265... 0 KiB
- mainthread-work-breakdown: 4.3 s
- bootup-time: 1.9 s -> https://www.apexapplications.io/_next/static/chunks/1rx4n59ymi-cg.js 1793ms; https://www.apexapplications.io/ 757ms; Unattributable 369ms
- unminified-javascript: Est savings of 71 KiB
- legacy-javascript: Est savings of 26 KiB -> https://www.apexapplications.io/_next/static/chunks/1rx4n59ymi-cg.js 14 KiB; https://connect.facebook.net/en_US/fbevents.js 12 KiB; https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 1 KiB
- total-byte-weight: Total size was 3,724 KiB -> https://www.apexapplications.io/videos/dashboard-hero-demo.mp4 1415 KiB; https://www.apexapplications.io/__l5e/assets-v1/1ec2f41e-3f0f-4173-a020-aee5370d9885/sourcing-speed.mp4 809 KiB; https://www.googletagmanager.com/gtag/js?id=G-21W9317C2L 190 KiB
- Accessibility failing audits: 
  - **button-name** (1 elements): div.max-w-7xl > div.flex > div.lg:hidden > button.p-2 [<button class="p-2 text-slate-100 bg-slate-900 rounded-lg shadow-lg">]
  - **color-contrast** (6 elements): div.lg:grid > div.max-w-2xl > h1.text-5xl > span.text-slate-300 [<span class="text-slate-300 italic">] | div.relative > div.bg-white > div.absolute > div.text-[10px] [<div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">] | div.max-w-7xl > div.bg-white > div.max-w-2xl > div.inline-flex [<div class="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand/10 text-brand text-[…">] | div.bg-white > div.max-w-2xl > h3.text-4xl > span.text-slate-300 [<span class="text-slate-300 italic">] | ul.space-y-3 > li > a.inline-flex > span.rounded-full [<span class="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-black uppercase trac…">] | ul.space-y-3 > li > a.hover:text-brand > span.block [<span class="block text-xs text-slate-400">]
  - **heading-order** (2 elements): div.max-w-7xl > div.grid > div > h3.text-4xl [<h3 class="text-4xl font-extrabold text-slate-900 mb-6">] | div.space-y-6 > div.flex > div > h5.font-black [<h5 class="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">]
  - **image-redundant-alt** (1 elements): div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
- Best-practices failing: errors-in-console, third-party-cookies, inspector-issues

### Desktop (final URL https://www.apexapplications.io/)
- LCP element: div.max-w-7xl > div.lg:grid > div.max-w-2xl > h1.text-5xl [<h1 class="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] mb-10 tracki…">]
- LCP phases: TTFB 181ms, Load Delay 0ms, Load Time 0ms, Render Delay 453ms
- Unused JS (total wasted 393 KiB), top 5:
  - https://www.googletagmanager.com/gtag/js?id=G-21W9317C2L: 78 KiB wasted of 190 KiB
  - https://www.apexapplications.io/_next/static/chunks/0hxj60v3t_s_5.js: 71 KiB wasted of 71 KiB
  - https://www.googletagmanager.com/gtag/js?id=AW-17638589911&cx=c&gtm=4e6a61h2: 62 KiB wasted of 164 KiB
  - https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications...: 42 KiB wasted of 147 KiB
  - https://connect.facebook.net/en_US/fbevents.js: 39 KiB wasted of 110 KiB
- uses-responsive-images (124 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 61 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/49e2659a-0879-4cda-8766-39fb1497383d/apex-gold-bull.png div.relative > div.lg:order-2 > a.group > img.h-16 [<img src="/__l5e/assets-v1/49e2659a-0879-4cda-8766-39fb1497383d/apex-gold-bull.png" alt="A] 21 KiB
- modern-image-formats (114 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 55 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/49e2659a-0879-4cda-8766-39fb1497383d/apex-gold-bull.png div.relative > div.lg:order-2 > a.group > img.h-16 [<img src="/__l5e/assets-v1/49e2659a-0879-4cda-8766-39fb1497383d/apex-gold-bull.png" alt="A] 17 KiB
- unsized-images ():
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt]
  - https://www.apexapplications.io/__l5e/assets-v1/49e2659a-0879-4cda-8766-39fb1497383d/apex-gold-bull.png div.relative > div.lg:order-2 > a.group > img.h-16 [<img src="/__l5e/assets-v1/49e2659a-0879-4cda-8766-39fb1497383d/apex-gold-bull.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/b3e15893-18f1-44d2-aebb-f3ab4aaf9bcd/bull-blue.png div.relative > div.lg:order-2 > a.group > img.h-16 [<img src="/__l5e/assets-v1/b3e15893-18f1-44d2-aebb-f3ab4aaf9bcd/bull-blue.png" alt="APEX B]
  - https://www.apexapplications.io/__l5e/assets-v1/92204b1e-f18c-4fa0-a40f-8765b8f8778e/bull-green.png div.relative > div.lg:order-1 > a.group > img.h-16 [<img src="/__l5e/assets-v1/92204b1e-f18c-4fa0-a40f-8765b8f8778e/bull-green.png" alt="APEX ]
- Third-party summary top: Google Tag Manager (354 KiB, main-thread 86ms, blocking 0ms); Facebook (263 KiB, main-thread 112ms, blocking 0ms); msgsndr.com (84 KiB, main-thread 8ms, blocking 0ms); Google CDN (49 KiB, main-thread 13ms, blocking 0ms); openai.com (28 KiB, main-thread 8ms, blocking 0ms); Google/Doubleclick Ads (4 KiB, main-thread 1ms, blocking 0ms)
- uses-long-cache-ttl: 3 resources found -> https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 132 KiB; https://connect.facebook.net/en_US/fbevents.js 100 KiB; https://bzrcdn.openai.com/sdk/oaiq.min.js 18 KiB
- unminified-javascript: Est savings of 71 KiB
- legacy-javascript: Est savings of 26 KiB -> https://www.apexapplications.io/_next/static/chunks/1rx4n59ymi-cg.js 14 KiB; https://connect.facebook.net/en_US/fbevents.js 12 KiB; https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 1 KiB
- total-byte-weight: Total size was 3,673 KiB -> https://www.apexapplications.io/videos/dashboard-hero-demo.mp4 1415 KiB; https://www.apexapplications.io/__l5e/assets-v1/1ec2f41e-3f0f-4173-a020-aee5370d9885/sourcing-speed.mp4 809 KiB; https://www.googletagmanager.com/gtag/js?id=G-21W9317C2L 190 KiB
- Accessibility failing audits: 
  - **color-contrast** (7 elements): div.lg:grid > div.max-w-2xl > h1.text-5xl > span.text-slate-300 [<span class="text-slate-300 italic">] | div.relative > div.bg-white > div.absolute > div.text-[10px] [<div class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">] | div.max-w-7xl > div.bg-white > div.max-w-2xl > div.inline-flex [<div class="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand/10 text-brand text-[…">] | div.bg-white > div.max-w-2xl > h3.text-4xl > span.text-slate-300 [<span class="text-slate-300 italic">] | main > section.py-24 > div.max-w-7xl > p.text-white/80 [<p class="text-white/80 text-xl max-w-2xl mx-auto mb-10 font-medium">] | ul.space-y-3 > li > a.inline-flex > span.rounded-full [<span class="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-black uppercase trac…">] | ul.space-y-3 > li > a.hover:text-brand > span.block [<span class="block text-xs text-slate-400">]
  - **heading-order** (2 elements): div.max-w-7xl > div.grid > div > h3.text-4xl [<h3 class="text-4xl font-extrabold text-slate-900 mb-6">] | div.space-y-6 > div.flex > div > h5.font-black [<h5 class="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">]
  - **image-redundant-alt** (1 elements): div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
- Best-practices failing: errors-in-console, third-party-cookies, inspector-issues

## /ai

### Mobile (final URL https://www.apexapplications.io/ai)
- LCP element: section.border-b > div.mx-auto > div > h1.mb-5 [<h1 class="mb-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 …">]
- LCP phases: TTFB 615ms, Load Delay 0ms, Load Time 0ms, Render Delay 8073ms
- Unused JS (total wasted 365 KiB), top 5:
  - https://www.googletagmanager.com/gtag/js?id=G-21W9317C2L: 76 KiB wasted of 190 KiB
  - https://www.apexapplications.io/_next/static/chunks/0hxj60v3t_s_5.js: 71 KiB wasted of 71 KiB
  - https://www.googletagmanager.com/gtag/js?id=AW-17638589911&cx=c&gtm=4e6a60: 59 KiB wasted of 164 KiB
  - https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications...: 42 KiB wasted of 147 KiB
  - https://connect.facebook.net/en_US/fbevents.js: 38 KiB wasted of 110 KiB
- uses-responsive-images (90 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 57 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 33 KiB
- modern-image-formats (97 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 55 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
- unsized-images ():
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt]
- offscreen-images (47 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 47 KiB
- Third-party summary top: Facebook (263 KiB, main-thread 663ms, blocking 470ms); Google Tag Manager (355 KiB, main-thread 614ms, blocking 453ms); Other Google APIs/SDKs (42 KiB, main-thread 152ms, blocking 51ms); Google CDN (49 KiB, main-thread 162ms, blocking 18ms); openai.com (28 KiB, main-thread 90ms, blocking 10ms); msgsndr.com (84 KiB, main-thread 57ms, blocking 1ms)
- uses-long-cache-ttl: 4 resources found -> https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 132 KiB; https://connect.facebook.net/en_US/fbevents.js 100 KiB; https://apex-apps-parent.firebaseapp.com/__/auth/iframe.js 80 KiB
- mainthread-work-breakdown: 5.3 s
- bootup-time: 2.8 s -> Unattributable 1266ms; https://www.apexapplications.io/ai 1156ms; https://connect.facebook.net/en_US/fbevents.js 469ms
- unminified-javascript: Est savings of 4 KiB
- legacy-javascript: Est savings of 26 KiB -> https://www.apexapplications.io/_next/static/chunks/1rx4n59ymi-cg.js 14 KiB; https://connect.facebook.net/en_US/fbevents.js 12 KiB; https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 1 KiB
- Accessibility failing audits: 
  - **button-name** (1 elements): div.max-w-7xl > div.flex > div.lg:hidden > button.p-2 [<button class="p-2 text-slate-100 bg-slate-900 rounded-lg shadow-lg">]
  - **color-contrast** (3 elements): div.mx-auto > div.rounded-3xl > div > p.mt-1 [<p class="mt-1 text-center text-[11px] text-slate-400 sm:hidden">] | ul.space-y-3 > li > a.inline-flex > span.rounded-full [<span class="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-black uppercase trac…">] | ul.space-y-3 > li > a.hover:text-brand > span.block [<span class="block text-xs text-slate-400">]
  - **image-redundant-alt** (1 elements): div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
- Best-practices failing: errors-in-console, third-party-cookies, inspector-issues

### Desktop (final URL https://www.apexapplications.io/ai)
- LCP element: section.border-b > div.mx-auto > div > h1.mb-5 [<h1 class="mb-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 …">]
- LCP phases: TTFB 171ms, Load Delay 0ms, Load Time 0ms, Render Delay 1977ms
- Unused JS (total wasted 396 KiB), top 5:
  - https://www.googletagmanager.com/gtag/js?id=G-21W9317C2L: 78 KiB wasted of 190 KiB
  - https://www.apexapplications.io/_next/static/chunks/0hxj60v3t_s_5.js: 71 KiB wasted of 71 KiB
  - https://www.googletagmanager.com/gtag/js?id=AW-17638589911&cx=c&gtm=4e6a60: 62 KiB wasted of 164 KiB
  - https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications...: 42 KiB wasted of 147 KiB
  - https://connect.facebook.net/en_US/fbevents.js: 39 KiB wasted of 110 KiB
- uses-responsive-images (104 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 61 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
- modern-image-formats (97 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 55 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
- unsized-images ():
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt]
- offscreen-images (47 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 47 KiB
- Third-party summary top: Facebook (263 KiB, main-thread 133ms, blocking 26ms); Google Tag Manager (354 KiB, main-thread 112ms, blocking 1ms); msgsndr.com (84 KiB, main-thread 15ms, blocking 0ms); Google CDN (49 KiB, main-thread 24ms, blocking 0ms); openai.com (28 KiB, main-thread 17ms, blocking 0ms); Google/Doubleclick Ads (4 KiB, main-thread 2ms, blocking 0ms)
- uses-long-cache-ttl: 3 resources found -> https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 132 KiB; https://connect.facebook.net/en_US/fbevents.js 100 KiB; https://bzrcdn.openai.com/sdk/oaiq.min.js 18 KiB
- unminified-javascript: Est savings of 71 KiB
- legacy-javascript: Est savings of 26 KiB -> https://www.apexapplications.io/_next/static/chunks/1rx4n59ymi-cg.js 14 KiB; https://connect.facebook.net/en_US/fbevents.js 12 KiB; https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 1 KiB
- Accessibility failing audits: 
  - **color-contrast** (3 elements): div.bg-white > div.mx-auto > nav.sticky > p.mb-3 [<p class="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">] | ul.space-y-3 > li > a.inline-flex > span.rounded-full [<span class="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-black uppercase trac…">] | ul.space-y-3 > li > a.hover:text-brand > span.block [<span class="block text-xs text-slate-400">]
  - **image-redundant-alt** (1 elements): div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
- Best-practices failing: errors-in-console, third-party-cookies, inspector-issues

## /pricing

### Mobile (final URL https://www.apexapplications.io/pricing)
- LCP element: div.max-w-7xl > div.grid > div.relative > img.w-full [<img src="/__l5e/assets-v1/d2051143-2068-4e7c-9bb6-fd30689f7c81/apex-brand-collage.p…" alt]
- LCP phases: TTFB 625ms, Load Delay 263ms, Load Time 329ms, Render Delay 10478ms
- Render-blocking (est. savings 0ms): https://www.apexapplications.io/_next/static/chunks/2_68toai2vjcg.css (19 KiB)
- Unused JS (total wasted 384 KiB), top 5:
  - https://www.googletagmanager.com/gtag/js?id=G-21W9317C2L: 78 KiB wasted of 190 KiB
  - https://www.apexapplications.io/_next/static/chunks/0hxj60v3t_s_5.js: 71 KiB wasted of 71 KiB
  - https://www.googletagmanager.com/gtag/js?id=AW-17638589911&cx=c&gtm=4e6a60: 63 KiB wasted of 164 KiB
  - https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications...: 42 KiB wasted of 147 KiB
  - https://www.apexapplications.io/_next/static/chunks/1ly9rx7hh07qa.js: 38 KiB wasted of 47 KiB
- uses-responsive-images (131 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 57 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/d2051143-2068-4e7c-9bb6-fd30689f7c81/apex-brand-collage.png div.max-w-7xl > div.grid > div.relative > img.w-full [<img src="/__l5e/assets-v1/d2051143-2068-4e7c-9bb6-fd30689f7c81/apex-brand-collage.p…" alt] 41 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 33 KiB
- modern-image-formats (106 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 55 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/d2051143-2068-4e7c-9bb6-fd30689f7c81/apex-brand-collage.png div.max-w-7xl > div.grid > div.relative > img.w-full [<img src="/__l5e/assets-v1/d2051143-2068-4e7c-9bb6-fd30689f7c81/apex-brand-collage.p…" alt] 9 KiB
- unsized-images ():
  - https://www.apexapplications.io/__l5e/assets-v1/d2051143-2068-4e7c-9bb6-fd30689f7c81/apex-brand-collage.png div.max-w-7xl > div.grid > div.relative > img.w-full [<img src="/__l5e/assets-v1/d2051143-2068-4e7c-9bb6-fd30689f7c81/apex-brand-collage.p…" alt]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt]
- offscreen-images (47 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 47 KiB
- Third-party summary top: Facebook (263 KiB, main-thread 310ms, blocking 158ms); Google Tag Manager (354 KiB, main-thread 275ms, blocking 119ms); firebaseapp.com (94 KiB, main-thread 0ms, blocking 0ms); msgsndr.com (84 KiB, main-thread 31ms, blocking 0ms); Google CDN (49 KiB, main-thread 51ms, blocking 0ms); Other Google APIs/SDKs (42 KiB, main-thread 51ms, blocking 0ms)
- uses-long-cache-ttl: 4 resources found -> https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 132 KiB; https://connect.facebook.net/en_US/fbevents.js 100 KiB; https://apex-apps-parent.firebaseapp.com/__/auth/iframe.js 80 KiB
- unminified-javascript: Est savings of 71 KiB
- legacy-javascript: Est savings of 26 KiB -> https://www.apexapplications.io/_next/static/chunks/1rx4n59ymi-cg.js 14 KiB; https://connect.facebook.net/en_US/fbevents.js 12 KiB; https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 1 KiB
- Accessibility failing audits: 
  - **button-name** (1 elements): div.max-w-7xl > div.flex > div.lg:hidden > button.p-2 [<button class="p-2 text-slate-100 bg-slate-900 rounded-lg shadow-lg">]
  - **color-contrast** (2 elements): ul.space-y-3 > li > a.inline-flex > span.rounded-full [<span class="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-black uppercase trac…">] | ul.space-y-3 > li > a.hover:text-brand > span.block [<span class="block text-xs text-slate-400">]
  - **heading-order** (1 elements): div.min-w-[900px] > div > div.px-6 > h3.text-xl [<h3 class="text-xl lg:text-2xl font-black tracking-tight text-slate-900">]
  - **image-redundant-alt** (1 elements): div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
- Best-practices failing: errors-in-console, third-party-cookies, inspector-issues

### Desktop (final URL https://www.apexapplications.io/pricing)
- LCP element: div.max-w-7xl > div.grid > div.relative > img.w-full [<img src="/__l5e/assets-v1/d2051143-2068-4e7c-9bb6-fd30689f7c81/apex-brand-collage.p…" alt]
- LCP phases: TTFB 163ms, Load Delay 0ms, Load Time 0ms, Render Delay 2360ms
- Render-blocking (est. savings 0ms): https://www.apexapplications.io/_next/static/chunks/2_68toai2vjcg.css (19 KiB)
- Unused JS (total wasted 307 KiB), top 5:
  - https://www.googletagmanager.com/gtag/js?id=G-21W9317C2L: 77 KiB wasted of 190 KiB
  - https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications...: 42 KiB wasted of 147 KiB
  - https://www.apexapplications.io/_next/static/chunks/1ly9rx7hh07qa.js: 38 KiB wasted of 47 KiB
  - https://connect.facebook.net/en_US/fbevents.js: 38 KiB wasted of 110 KiB
  - https://www.googletagmanager.com/gtag/js?id=AW-17638589911&cx=c&gtm=4e6a61h2: 33 KiB wasted of 86 KiB
- uses-responsive-images (149 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 61 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/d2051143-2068-4e7c-9bb6-fd30689f7c81/apex-brand-collage.png div.max-w-7xl > div.grid > div.relative > img.w-full [<img src="/__l5e/assets-v1/d2051143-2068-4e7c-9bb6-fd30689f7c81/apex-brand-collage.p…" alt] 45 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
- modern-image-formats (106 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 55 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/d2051143-2068-4e7c-9bb6-fd30689f7c81/apex-brand-collage.png div.max-w-7xl > div.grid > div.relative > img.w-full [<img src="/__l5e/assets-v1/d2051143-2068-4e7c-9bb6-fd30689f7c81/apex-brand-collage.p…" alt] 9 KiB
- unsized-images ():
  - https://www.apexapplications.io/__l5e/assets-v1/d2051143-2068-4e7c-9bb6-fd30689f7c81/apex-brand-collage.png div.max-w-7xl > div.grid > div.relative > img.w-full [<img src="/__l5e/assets-v1/d2051143-2068-4e7c-9bb6-fd30689f7c81/apex-brand-collage.p…" alt]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt]
- offscreen-images (47 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 47 KiB
- Third-party summary top: Facebook (263 KiB, main-thread 161ms, blocking 58ms); Google Tag Manager (355 KiB, main-thread 132ms, blocking 9ms); msgsndr.com (84 KiB, main-thread 14ms, blocking 0ms); Google CDN (49 KiB, main-thread 36ms, blocking 0ms); openai.com (28 KiB, main-thread 19ms, blocking 0ms); Google/Doubleclick Ads (4 KiB, main-thread 2ms, blocking 0ms)
- uses-long-cache-ttl: 3 resources found -> https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 132 KiB; https://connect.facebook.net/en_US/fbevents.js 100 KiB; https://bzrcdn.openai.com/sdk/oaiq.min.js 18 KiB
- unminified-javascript: Est savings of 71 KiB
- legacy-javascript: Est savings of 26 KiB -> https://www.apexapplications.io/_next/static/chunks/1rx4n59ymi-cg.js 14 KiB; https://connect.facebook.net/en_US/fbevents.js 12 KiB; https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 1 KiB
- Accessibility failing audits: 
  - **color-contrast** (5 elements): div.p-6 > div.mt-1 > span.flex > span.text-xs [<span class="text-xs text-slate-400 font-semibold">] | div.p-6 > div.mt-1 > span.flex > span.text-xs [<span class="text-xs text-slate-400 font-semibold">] | div.sticky > div.grid > div.p-6 > span.absolute [<span class="absolute top-3 right-3 bg-orange-400 text-white text-[9px] font-black px-2…">] | ul.space-y-3 > li > a.inline-flex > span.rounded-full [<span class="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-black uppercase trac…">] | ul.space-y-3 > li > a.hover:text-brand > span.block [<span class="block text-xs text-slate-400">]
  - **heading-order** (1 elements): div.min-w-[900px] > div > div.px-6 > h3.text-xl [<h3 class="text-xl lg:text-2xl font-black tracking-tight text-slate-900">]
  - **image-redundant-alt** (1 elements): div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
- Best-practices failing: errors-in-console, third-party-cookies, inspector-issues

## /features/green

### Mobile (final URL https://www.apexapplications.io/features/green)
- LCP element: div.pt-40 > div.max-w-7xl > div.max-w-4xl > p.text-2xl [<p class="text-2xl text-slate-500 leading-relaxed text-center font-medium opacity-80…">]
- LCP phases: TTFB 631ms, Load Delay 0ms, Load Time 0ms, Render Delay 3675ms
- Render-blocking (est. savings 0ms): https://www.apexapplications.io/_next/static/chunks/2_68toai2vjcg.css (19 KiB)
- Unused JS (total wasted 375 KiB), top 5:
  - https://www.googletagmanager.com/gtag/js?id=G-21W9317C2L: 78 KiB wasted of 190 KiB
  - https://www.apexapplications.io/_next/static/chunks/0hxj60v3t_s_5.js: 71 KiB wasted of 71 KiB
  - https://www.googletagmanager.com/gtag/js?id=AW-17638589911&cx=c&gtm=4e6a60: 63 KiB wasted of 164 KiB
  - https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications...: 41 KiB wasted of 147 KiB
  - https://connect.facebook.net/en_US/fbevents.js: 38 KiB wasted of 110 KiB
- uses-responsive-images (424 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/336e0c0d-434c-4b09-a8a3-288d56a5c421/upc-scanner.png div.relative > section#upc-scanner > div.rounded-[32px] > img.w-full [<img src="/__l5e/assets-v1/336e0c0d-434c-4b09-a8a3-288d56a5c421/upc-scanner.png" alt="Apex] 168 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/2c02c751-705f-41a1-83e7-6c7586256d0b/master-catalog.png div.relative > section#master-catalog > div.rounded-[32px] > img.w-full [<img src="/__l5e/assets-v1/2c02c751-705f-41a1-83e7-6c7586256d0b/master-catalog.png" alt="A] 160 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 57 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 33 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/7e2ad736-4093-40ee-8f1c-0451f5fff17f/apex-green-core-featur... div.grid > div.relative > div.relative > img.w-full [<img src="/__l5e/assets-v1/7e2ad736-4093-40ee-8f1c-0451f5fff17f/apex-green-core-feat…" alt] 7 KiB
- modern-image-formats (544 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/2c02c751-705f-41a1-83e7-6c7586256d0b/master-catalog.png div.relative > section#master-catalog > div.rounded-[32px] > img.w-full [<img src="/__l5e/assets-v1/2c02c751-705f-41a1-83e7-6c7586256d0b/master-catalog.png" alt="A] 144 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/336e0c0d-434c-4b09-a8a3-288d56a5c421/upc-scanner.png div.relative > section#upc-scanner > div.rounded-[32px] > img.w-full [<img src="/__l5e/assets-v1/336e0c0d-434c-4b09-a8a3-288d56a5c421/upc-scanner.png" alt="Apex] 133 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/e4081fc2-8a3d-4724-be4f-822c6415bd5f/apex-green-cta-bull.png div.max-w-7xl > div.mt-32 > div.absolute > img.h-full [<img src="/__l5e/assets-v1/e4081fc2-8a3d-4724-be4f-822c6415bd5f/apex-green-cta-bull.…" alt] 131 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 55 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/7e2ad736-4093-40ee-8f1c-0451f5fff17f/apex-green-core-featur... div.grid > div.relative > div.relative > img.w-full [<img src="/__l5e/assets-v1/7e2ad736-4093-40ee-8f1c-0451f5fff17f/apex-green-core-feat…" alt] 40 KiB
- unsized-images ():
  - https://www.apexapplications.io/__l5e/assets-v1/336e0c0d-434c-4b09-a8a3-288d56a5c421/upc-scanner.png div.relative > section#upc-scanner > div.rounded-[32px] > img.w-full [<img src="/__l5e/assets-v1/336e0c0d-434c-4b09-a8a3-288d56a5c421/upc-scanner.png" alt="Apex]
  - https://www.apexapplications.io/__l5e/assets-v1/2c02c751-705f-41a1-83e7-6c7586256d0b/master-catalog.png div.relative > section#master-catalog > div.rounded-[32px] > img.w-full [<img src="/__l5e/assets-v1/2c02c751-705f-41a1-83e7-6c7586256d0b/master-catalog.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/7e2ad736-4093-40ee-8f1c-0451f5fff17f/apex-green-core-featur... div.grid > div.relative > div.relative > img.w-full [<img src="/__l5e/assets-v1/7e2ad736-4093-40ee-8f1c-0451f5fff17f/apex-green-core-feat…" alt]
  - https://www.apexapplications.io/__l5e/assets-v1/e4081fc2-8a3d-4724-be4f-822c6415bd5f/apex-green-cta-bull.png div.max-w-7xl > div.mt-32 > div.absolute > img.h-full [<img src="/__l5e/assets-v1/e4081fc2-8a3d-4724-be4f-822c6415bd5f/apex-green-cta-bull.…" alt]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
- offscreen-images (377 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/2c02c751-705f-41a1-83e7-6c7586256d0b/master-catalog.png div.relative > section#master-catalog > div.rounded-[32px] > img.w-full [<img src="/__l5e/assets-v1/2c02c751-705f-41a1-83e7-6c7586256d0b/master-catalog.png" alt="A] 189 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/e4081fc2-8a3d-4724-be4f-822c6415bd5f/apex-green-cta-bull.png div.max-w-7xl > div.mt-32 > div.absolute > img.h-full [<img src="/__l5e/assets-v1/e4081fc2-8a3d-4724-be4f-822c6415bd5f/apex-green-cta-bull.…" alt] 141 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 47 KiB
- Third-party summary top: Facebook (263 KiB, main-thread 906ms, blocking 734ms); Google Tag Manager (354 KiB, main-thread 612ms, blocking 450ms); Other Google APIs/SDKs (42 KiB, main-thread 126ms, blocking 40ms); msgsndr.com (84 KiB, main-thread 68ms, blocking 10ms); openai.com (28 KiB, main-thread 83ms, blocking 10ms); Google CDN (49 KiB, main-thread 137ms, blocking 7ms)
- uses-long-cache-ttl: 4 resources found -> https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 132 KiB; https://connect.facebook.net/en_US/fbevents.js 100 KiB; https://apex-apps-parent.firebaseapp.com/__/auth/iframe.js 80 KiB
- mainthread-work-breakdown: 4.3 s
- bootup-time: 2.8 s -> Unattributable 778ms; https://connect.facebook.net/en_US/fbevents.js 577ms; https://www.apexapplications.io/features/green 483ms
- unminified-javascript: Est savings of 71 KiB
- legacy-javascript: Est savings of 26 KiB -> https://www.apexapplications.io/_next/static/chunks/1rx4n59ymi-cg.js 14 KiB; https://connect.facebook.net/en_US/fbevents.js 12 KiB; https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 1 KiB
- Accessibility failing audits: 
  - **button-name** (1 elements): div.max-w-7xl > div.flex > div.lg:hidden > button.p-2 [<button class="p-2 text-slate-100 bg-slate-900 rounded-lg shadow-lg">]
  - **color-contrast** (5 elements): div.max-w-7xl > div.max-w-4xl > div.flex > div.inline-flex [<div class="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 border border-green…">] | div.pt-40 > div.max-w-7xl > div.text-center > span.text-xs [<span class="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">] | div.max-w-7xl > div.mt-32 > div.relative > button.bg-white [<button class="bg-white text-green-600 px-10 py-4 rounded-[20px] font-black hover:scale-1…] | ul.space-y-3 > li > a.inline-flex > span.rounded-full [<span class="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-black uppercase trac…">] | ul.space-y-3 > li > a.hover:text-brand > span.block [<span class="block text-xs text-slate-400">]
  - **image-redundant-alt** (1 elements): div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
- Best-practices failing: errors-in-console, third-party-cookies, inspector-issues

### Desktop (final URL https://www.apexapplications.io/features/green)
- LCP element: div.pt-40 > div.max-w-7xl > div.max-w-4xl > p.text-2xl [<p class="text-2xl text-slate-500 leading-relaxed text-center font-medium opacity-80…">]
- LCP phases: TTFB 179ms, Load Delay 0ms, Load Time 0ms, Render Delay 664ms
- Unused JS (total wasted 390 KiB), top 5:
  - https://www.googletagmanager.com/gtag/js?id=G-21W9317C2L: 76 KiB wasted of 190 KiB
  - https://www.apexapplications.io/_next/static/chunks/0hxj60v3t_s_5.js: 71 KiB wasted of 71 KiB
  - https://www.googletagmanager.com/gtag/js?id=AW-17638589911&cx=c&gtm=4e6a60: 60 KiB wasted of 164 KiB
  - https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications...: 41 KiB wasted of 147 KiB
  - https://connect.facebook.net/en_US/fbevents.js: 39 KiB wasted of 110 KiB
- uses-responsive-images (469 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/336e0c0d-434c-4b09-a8a3-288d56a5c421/upc-scanner.png div.relative > section#upc-scanner > div.rounded-[32px] > img.w-full [<img src="/__l5e/assets-v1/336e0c0d-434c-4b09-a8a3-288d56a5c421/upc-scanner.png" alt="Apex] 176 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/2c02c751-705f-41a1-83e7-6c7586256d0b/master-catalog.png div.relative > section#master-catalog > div.rounded-[32px] > img.w-full [<img src="/__l5e/assets-v1/2c02c751-705f-41a1-83e7-6c7586256d0b/master-catalog.png" alt="A] 167 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 61 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/e4081fc2-8a3d-4724-be4f-822c6415bd5f/apex-green-cta-bull.png div.max-w-7xl > div.mt-32 > div.absolute > img.h-full [<img src="/__l5e/assets-v1/e4081fc2-8a3d-4724-be4f-822c6415bd5f/apex-green-cta-bull.…" alt] 23 KiB
- modern-image-formats (544 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/2c02c751-705f-41a1-83e7-6c7586256d0b/master-catalog.png div.relative > section#master-catalog > div.rounded-[32px] > img.w-full [<img src="/__l5e/assets-v1/2c02c751-705f-41a1-83e7-6c7586256d0b/master-catalog.png" alt="A] 144 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/336e0c0d-434c-4b09-a8a3-288d56a5c421/upc-scanner.png div.relative > section#upc-scanner > div.rounded-[32px] > img.w-full [<img src="/__l5e/assets-v1/336e0c0d-434c-4b09-a8a3-288d56a5c421/upc-scanner.png" alt="Apex] 133 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/e4081fc2-8a3d-4724-be4f-822c6415bd5f/apex-green-cta-bull.png div.max-w-7xl > div.mt-32 > div.absolute > img.h-full [<img src="/__l5e/assets-v1/e4081fc2-8a3d-4724-be4f-822c6415bd5f/apex-green-cta-bull.…" alt] 131 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 55 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/7e2ad736-4093-40ee-8f1c-0451f5fff17f/apex-green-core-featur... div.grid > div.relative > div.relative > img.w-full [<img src="/__l5e/assets-v1/7e2ad736-4093-40ee-8f1c-0451f5fff17f/apex-green-core-feat…" alt] 40 KiB
- unsized-images ():
  - https://www.apexapplications.io/__l5e/assets-v1/336e0c0d-434c-4b09-a8a3-288d56a5c421/upc-scanner.png div.relative > section#upc-scanner > div.rounded-[32px] > img.w-full [<img src="/__l5e/assets-v1/336e0c0d-434c-4b09-a8a3-288d56a5c421/upc-scanner.png" alt="Apex]
  - https://www.apexapplications.io/__l5e/assets-v1/2c02c751-705f-41a1-83e7-6c7586256d0b/master-catalog.png div.relative > section#master-catalog > div.rounded-[32px] > img.w-full [<img src="/__l5e/assets-v1/2c02c751-705f-41a1-83e7-6c7586256d0b/master-catalog.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/7e2ad736-4093-40ee-8f1c-0451f5fff17f/apex-green-core-featur... div.grid > div.relative > div.relative > img.w-full [<img src="/__l5e/assets-v1/7e2ad736-4093-40ee-8f1c-0451f5fff17f/apex-green-core-feat…" alt]
  - https://www.apexapplications.io/__l5e/assets-v1/e4081fc2-8a3d-4724-be4f-822c6415bd5f/apex-green-cta-bull.png div.max-w-7xl > div.mt-32 > div.absolute > img.h-full [<img src="/__l5e/assets-v1/e4081fc2-8a3d-4724-be4f-822c6415bd5f/apex-green-cta-bull.…" alt]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
- offscreen-images (47 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 47 KiB
- Third-party summary top: Facebook (263 KiB, main-thread 155ms, blocking 52ms); Google Tag Manager (354 KiB, main-thread 147ms, blocking 9ms); msgsndr.com (84 KiB, main-thread 20ms, blocking 0ms); Google CDN (49 KiB, main-thread 36ms, blocking 0ms); openai.com (28 KiB, main-thread 17ms, blocking 0ms); Google/Doubleclick Ads (4 KiB, main-thread 2ms, blocking 0ms)
- uses-long-cache-ttl: 3 resources found -> https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 132 KiB; https://connect.facebook.net/en_US/fbevents.js 100 KiB; https://bzrcdn.openai.com/sdk/oaiq.min.js 18 KiB
- unminified-javascript: Est savings of 71 KiB
- legacy-javascript: Est savings of 26 KiB -> https://www.apexapplications.io/_next/static/chunks/1rx4n59ymi-cg.js 14 KiB; https://connect.facebook.net/en_US/fbevents.js 12 KiB; https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 1 KiB
- Accessibility failing audits: 
  - **color-contrast** (7 elements): div.max-w-7xl > div.max-w-4xl > div.flex > div.inline-flex [<div class="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 border border-green…">] | div.pt-40 > div.max-w-7xl > div.text-center > span.text-xs [<span class="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">] | div.grid > div.max-w-xl > div.flex > div.text-xs [<div class="text-xs font-black text-green-600 uppercase tracking-[0.2em]">] | div > div.grid > div.max-w-xl > button.bg-green-600 [<button data-feature-cta="true" class="bg-green-600 text-white px-6 py-3.5 rounded-xl font] | div.max-w-7xl > div.mt-32 > div.relative > button.bg-white [<button class="bg-white text-green-600 px-10 py-4 rounded-[20px] font-black hover:scale-1…] | ul.space-y-3 > li > a.inline-flex > span.rounded-full [<span class="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-black uppercase trac…">] | ul.space-y-3 > li > a.hover:text-brand > span.block [<span class="block text-xs text-slate-400">]
  - **image-redundant-alt** (1 elements): div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
- Best-practices failing: errors-in-console, third-party-cookies, inspector-issues

## /compare/seller-assistant

### Mobile (final URL https://www.apexapplications.io/compare/seller-assistant)
- LCP element: div.pt-32 > div.max-w-5xl > header.text-center > p.text-lg [<p class="text-lg text-slate-500 leading-relaxed">]
- LCP phases: TTFB 623ms, Load Delay 0ms, Load Time 0ms, Render Delay 4869ms
- Render-blocking (est. savings 0ms): https://www.apexapplications.io/_next/static/chunks/2_68toai2vjcg.css (19 KiB)
- Unused JS (total wasted 366 KiB), top 5:
  - https://www.googletagmanager.com/gtag/js?id=G-21W9317C2L: 76 KiB wasted of 190 KiB
  - https://www.apexapplications.io/_next/static/chunks/0hxj60v3t_s_5.js: 71 KiB wasted of 71 KiB
  - https://www.googletagmanager.com/gtag/js?id=AW-17638589911&cx=c&gtm=4e6a60: 60 KiB wasted of 164 KiB
  - https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications...: 42 KiB wasted of 147 KiB
  - https://connect.facebook.net/en_US/fbevents.js: 38 KiB wasted of 110 KiB
- uses-responsive-images (163 KiB savings):
  - https://www.apexapplications.io/images/fba-starter-bundle/apex-suite-overview.png div.max-w-5xl > div.max-w-3xl > div.rounded-2xl > img.w-full [<img src="/images/fba-starter-bundle/apex-suite-overview.png" alt="The Apex suite dashboar] 73 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 57 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 33 KiB
- modern-image-formats (109 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 55 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
  - https://www.apexapplications.io/images/fba-starter-bundle/apex-suite-overview.png div.max-w-5xl > div.max-w-3xl > div.rounded-2xl > img.w-full [<img src="/images/fba-starter-bundle/apex-suite-overview.png" alt="The Apex suite dashboar] 12 KiB
- unsized-images ():
  - https://www.apexapplications.io/images/fba-starter-bundle/apex-suite-overview.png div.max-w-5xl > div.max-w-3xl > div.rounded-2xl > img.w-full [<img src="/images/fba-starter-bundle/apex-suite-overview.png" alt="The Apex suite dashboar]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt]
- offscreen-images (47 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 47 KiB
- Third-party summary top: Google Tag Manager (354 KiB, main-thread 288ms, blocking 129ms); Facebook (263 KiB, main-thread 251ms, blocking 117ms); firebaseapp.com (94 KiB, main-thread 0ms, blocking 0ms); msgsndr.com (84 KiB, main-thread 34ms, blocking 0ms); Google CDN (49 KiB, main-thread 49ms, blocking 0ms); Other Google APIs/SDKs (42 KiB, main-thread 58ms, blocking 0ms)
- uses-long-cache-ttl: 4 resources found -> https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 132 KiB; https://connect.facebook.net/en_US/fbevents.js 100 KiB; https://apex-apps-parent.firebaseapp.com/__/auth/iframe.js 80 KiB
- unminified-javascript: Est savings of 71 KiB
- legacy-javascript: Est savings of 26 KiB -> https://www.apexapplications.io/_next/static/chunks/1rx4n59ymi-cg.js 14 KiB; https://connect.facebook.net/en_US/fbevents.js 12 KiB; https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 1 KiB
- Accessibility failing audits: 
  - **button-name** (1 elements): div.max-w-7xl > div.flex > div.lg:hidden > button.p-2 [<button class="p-2 text-slate-100 bg-slate-900 rounded-lg shadow-lg">]
  - **color-contrast** (7 elements): div.pt-32 > div.max-w-5xl > header.text-center > p.mt-5 [<p class="mt-5 text-sm text-slate-400">] | div.pt-32 > div.max-w-5xl > div.rounded-3xl > h3.text-sm [<h3 class="text-sm font-black uppercase tracking-[0.15em] text-slate-400 mb-6 text-ce…">] | div.pt-32 > div.max-w-5xl > div.rounded-3xl > p.text-[11px] [<p class="text-[11px] text-slate-400 mt-5 text-center">] | main > div.pt-32 > div.max-w-5xl > p.text-xs [<p class="text-xs text-slate-400 leading-relaxed max-w-2xl mx-auto text-center">] | div.max-w-5xl > p.text-xs > span > a.underline [<a href="https://www.sellerassistant.app/pricing/" target="_blank" rel="noopener noreferre] | ul.space-y-3 > li > a.inline-flex > span.rounded-full [<span class="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-black uppercase trac…">] | ul.space-y-3 > li > a.hover:text-brand > span.block [<span class="block text-xs text-slate-400">]
  - **heading-order** (1 elements): div.pt-32 > div.max-w-5xl > div.rounded-3xl > h3.text-sm [<h3 class="text-sm font-black uppercase tracking-[0.15em] text-slate-400 mb-6 text-ce…">]
  - **image-redundant-alt** (1 elements): div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - **td-has-header** (1 elements): div.pt-32 > div.max-w-5xl > div.overflow-x-auto > table.w-full [<table class="w-full min-w-[38rem] border-collapse bg-white text-left">]
- Best-practices failing: errors-in-console, third-party-cookies, inspector-issues

### Desktop (final URL https://www.apexapplications.io/compare/seller-assistant)
- LCP element: div.pt-32 > div.max-w-5xl > header.text-center > p.text-lg [<p class="text-lg text-slate-500 leading-relaxed">]
- LCP phases: TTFB 183ms, Load Delay 0ms, Load Time 0ms, Render Delay 408ms
- Unused JS (total wasted 396 KiB), top 5:
  - https://www.googletagmanager.com/gtag/js?id=G-21W9317C2L: 78 KiB wasted of 190 KiB
  - https://www.apexapplications.io/_next/static/chunks/0hxj60v3t_s_5.js: 71 KiB wasted of 71 KiB
  - https://www.googletagmanager.com/gtag/js?id=AW-17638589911&cx=c&gtm=4e6a60h1: 62 KiB wasted of 164 KiB
  - https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications...: 42 KiB wasted of 147 KiB
  - https://connect.facebook.net/en_US/fbevents.js: 39 KiB wasted of 110 KiB
- uses-responsive-images (173 KiB savings):
  - https://www.apexapplications.io/images/fba-starter-bundle/apex-suite-overview.png div.max-w-5xl > div.max-w-3xl > div.rounded-2xl > img.w-full [<img src="/images/fba-starter-bundle/apex-suite-overview.png" alt="The Apex suite dashboar] 69 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 61 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
- modern-image-formats (109 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 55 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
  - https://www.apexapplications.io/images/fba-starter-bundle/apex-suite-overview.png div.max-w-5xl > div.max-w-3xl > div.rounded-2xl > img.w-full [<img src="/images/fba-starter-bundle/apex-suite-overview.png" alt="The Apex suite dashboar] 12 KiB
- unsized-images ():
  - https://www.apexapplications.io/images/fba-starter-bundle/apex-suite-overview.png div.max-w-5xl > div.max-w-3xl > div.rounded-2xl > img.w-full [<img src="/images/fba-starter-bundle/apex-suite-overview.png" alt="The Apex suite dashboar]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt]
- offscreen-images (47 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 47 KiB
- Third-party summary top: Facebook (263 KiB, main-thread 102ms, blocking 9ms); Google Tag Manager (354 KiB, main-thread 92ms, blocking 0ms); msgsndr.com (84 KiB, main-thread 13ms, blocking 0ms); Google CDN (49 KiB, main-thread 23ms, blocking 0ms); openai.com (28 KiB, main-thread 11ms, blocking 0ms); Google/Doubleclick Ads (4 KiB, main-thread 1ms, blocking 0ms)
- uses-long-cache-ttl: 3 resources found -> https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 132 KiB; https://connect.facebook.net/en_US/fbevents.js 100 KiB; https://bzrcdn.openai.com/sdk/oaiq.min.js 18 KiB
- unminified-javascript: Est savings of 71 KiB
- legacy-javascript: Est savings of 26 KiB -> https://www.apexapplications.io/_next/static/chunks/1rx4n59ymi-cg.js 14 KiB; https://connect.facebook.net/en_US/fbevents.js 12 KiB; https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 1 KiB
- Accessibility failing audits: 
  - **color-contrast** (7 elements): div.pt-32 > div.max-w-5xl > header.text-center > p.mt-5 [<p class="mt-5 text-sm text-slate-400">] | div.pt-32 > div.max-w-5xl > div.rounded-3xl > h3.text-sm [<h3 class="text-sm font-black uppercase tracking-[0.15em] text-slate-400 mb-6 text-ce…">] | div.pt-32 > div.max-w-5xl > div.rounded-3xl > p.text-[11px] [<p class="text-[11px] text-slate-400 mt-5 text-center">] | main > div.pt-32 > div.max-w-5xl > p.text-xs [<p class="text-xs text-slate-400 leading-relaxed max-w-2xl mx-auto text-center">] | div.max-w-5xl > p.text-xs > span > a.underline [<a href="https://www.sellerassistant.app/pricing/" target="_blank" rel="noopener noreferre] | ul.space-y-3 > li > a.inline-flex > span.rounded-full [<span class="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-black uppercase trac…">] | ul.space-y-3 > li > a.hover:text-brand > span.block [<span class="block text-xs text-slate-400">]
  - **heading-order** (1 elements): div.pt-32 > div.max-w-5xl > div.rounded-3xl > h3.text-sm [<h3 class="text-sm font-black uppercase tracking-[0.15em] text-slate-400 mb-6 text-ce…">]
  - **image-redundant-alt** (1 elements): div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - **td-has-header** (1 elements): div.pt-32 > div.max-w-5xl > div.overflow-x-auto > table.w-full [<table class="w-full min-w-[38rem] border-collapse bg-white text-left">]
- Best-practices failing: errors-in-console, third-party-cookies, inspector-issues

## /blog/amazon-fba-fees-explained

### Mobile (final URL https://www.apexapplications.io/blog/amazon-fba-fees-explained)
- LCP element: main > div.pt-28 > div.max-w-2xl > h1.text-3xl [<h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.1…">]
- LCP phases: TTFB 607ms, Load Delay 0ms, Load Time 0ms, Render Delay 2400ms
- Unused JS (total wasted 384 KiB), top 5:
  - https://www.googletagmanager.com/gtag/js?id=G-21W9317C2L: 78 KiB wasted of 190 KiB
  - https://www.apexapplications.io/_next/static/chunks/0hxj60v3t_s_5.js: 71 KiB wasted of 71 KiB
  - https://www.googletagmanager.com/gtag/js?id=AW-17638589911&cx=c&gtm=4e6a61h2: 62 KiB wasted of 164 KiB
  - https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications...: 41 KiB wasted of 147 KiB
  - https://www.apexapplications.io/_next/static/chunks/1ly9rx7hh07qa.js: 38 KiB wasted of 47 KiB
- uses-responsive-images (217 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png div.space-y-6 > figure.my-8 > div.rounded-2xl > img.w-full [<img src="/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png" alt="] 127 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 57 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 33 KiB
- modern-image-formats (193 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png div.space-y-6 > figure.my-8 > div.rounded-2xl > img.w-full [<img src="/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png" alt="] 96 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 55 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
- unsized-images ():
  - https://www.apexapplications.io/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png div.space-y-6 > figure.my-8 > div.rounded-2xl > img.w-full [<img src="/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png" alt="]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt]
- offscreen-images (199 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png div.space-y-6 > figure.my-8 > div.rounded-2xl > img.w-full [<img src="/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png" alt="] 152 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 47 KiB
- Third-party summary top: Facebook (263 KiB, main-thread 352ms, blocking 196ms); Google Tag Manager (354 KiB, main-thread 275ms, blocking 122ms); msgsndr.com (84 KiB, main-thread 33ms, blocking 0ms); firebaseapp.com (94 KiB, main-thread 0ms, blocking 0ms); Google CDN (49 KiB, main-thread 55ms, blocking 0ms); Other Google APIs/SDKs (42 KiB, main-thread 48ms, blocking 0ms)
- uses-long-cache-ttl: 4 resources found -> https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 132 KiB; https://connect.facebook.net/en_US/fbevents.js 100 KiB; https://apex-apps-parent.firebaseapp.com/__/auth/iframe.js 80 KiB
- unminified-javascript: Est savings of 71 KiB
- legacy-javascript: Est savings of 26 KiB -> https://www.apexapplications.io/_next/static/chunks/1rx4n59ymi-cg.js 14 KiB; https://connect.facebook.net/en_US/fbevents.js 12 KiB; https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 1 KiB
- Accessibility failing audits: 
  - **button-name** (1 elements): div.max-w-7xl > div.flex > div.lg:hidden > button.p-2 [<button class="p-2 text-slate-100 bg-slate-900 rounded-lg shadow-lg">]
  - **color-contrast** (25 elements): main > div.pt-28 > div.max-w-2xl > span.inline-flex [<span class="inline-flex text-xs font-bold text-brand bg-brand/10 rounded-full px-3 py-…">] | div.pt-28 > div.max-w-2xl > div.flex > span [<span>] | div.pt-28 > div.max-w-2xl > div.flex > span [<span>] | div.max-w-2xl > div.flex > span > time [<time datetime="2026-10-04">] | div.pt-28 > div.max-w-2xl > div.flex > span.inline-flex [<span class="inline-flex items-center gap-1.5">] | ol.space-y-2 > li > a.text-sm > span.text-slate-400 [<span class="text-slate-400 font-semibold mr-1.5">] | ol.space-y-2 > li > a.text-sm > span.text-slate-400 [<span class="text-slate-400 font-semibold mr-1.5">] | ol.space-y-2 > li > a.text-sm > span.text-slate-400 [<span class="text-slate-400 font-semibold mr-1.5">]
  - **image-redundant-alt** (1 elements): div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
- Best-practices failing: errors-in-console, third-party-cookies, inspector-issues

### Desktop (final URL https://www.apexapplications.io/blog/amazon-fba-fees-explained)
- LCP element: main > div.pt-28 > div.max-w-2xl > h1.text-3xl [<h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.1…">]
- LCP phases: TTFB 160ms, Load Delay 0ms, Load Time 0ms, Render Delay 600ms
- Unused JS (total wasted 410 KiB), top 5:
  - https://www.googletagmanager.com/gtag/js?id=G-21W9317C2L: 78 KiB wasted of 190 KiB
  - https://www.apexapplications.io/_next/static/chunks/0hxj60v3t_s_5.js: 71 KiB wasted of 71 KiB
  - https://www.googletagmanager.com/gtag/js?id=AW-17638589911&cx=c&gtm=4e6a60: 63 KiB wasted of 164 KiB
  - https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications...: 41 KiB wasted of 147 KiB
  - https://connect.facebook.net/en_US/fbevents.js: 39 KiB wasted of 110 KiB
- uses-responsive-images (235 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png div.space-y-6 > figure.my-8 > div.rounded-2xl > img.w-full [<img src="/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png" alt="] 131 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 61 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
- modern-image-formats (193 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png div.space-y-6 > figure.my-8 > div.rounded-2xl > img.w-full [<img src="/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png" alt="] 96 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 55 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
- unsized-images ():
  - https://www.apexapplications.io/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png div.space-y-6 > figure.my-8 > div.rounded-2xl > img.w-full [<img src="/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png" alt="]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt]
- offscreen-images (199 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png div.space-y-6 > figure.my-8 > div.rounded-2xl > img.w-full [<img src="/__l5e/assets-v1/68d206bf-650d-4e94-b983-3ee9d56d0dd0/purchase-orders.png" alt="] 152 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 47 KiB
- Third-party summary top: Google Tag Manager (354 KiB, main-thread 87ms, blocking 0ms); Facebook (263 KiB, main-thread 74ms, blocking 0ms); msgsndr.com (84 KiB, main-thread 8ms, blocking 0ms); Google CDN (49 KiB, main-thread 14ms, blocking 0ms); openai.com (28 KiB, main-thread 9ms, blocking 0ms); Google/Doubleclick Ads (4 KiB, main-thread 1ms, blocking 0ms)
- uses-long-cache-ttl: 3 resources found -> https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 132 KiB; https://connect.facebook.net/en_US/fbevents.js 100 KiB; https://bzrcdn.openai.com/sdk/oaiq.min.js 18 KiB
- unminified-javascript: Est savings of 71 KiB
- legacy-javascript: Est savings of 26 KiB -> https://www.apexapplications.io/_next/static/chunks/1rx4n59ymi-cg.js 14 KiB; https://connect.facebook.net/en_US/fbevents.js 12 KiB; https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 1 KiB
- Accessibility failing audits: 
  - **color-contrast** (25 elements): main > div.pt-28 > div.max-w-2xl > span.inline-flex [<span class="inline-flex text-xs font-bold text-brand bg-brand/10 rounded-full px-3 py-…">] | div.pt-28 > div.max-w-2xl > div.flex > span [<span>] | div.pt-28 > div.max-w-2xl > div.flex > span [<span>] | div.max-w-2xl > div.flex > span > time [<time datetime="2026-10-04">] | div.pt-28 > div.max-w-2xl > div.flex > span.inline-flex [<span class="inline-flex items-center gap-1.5">] | ol.space-y-2 > li > a.text-sm > span.text-slate-400 [<span class="text-slate-400 font-semibold mr-1.5">] | ol.space-y-2 > li > a.text-sm > span.text-slate-400 [<span class="text-slate-400 font-semibold mr-1.5">] | ol.space-y-2 > li > a.text-sm > span.text-slate-400 [<span class="text-slate-400 font-semibold mr-1.5">]
  - **image-redundant-alt** (1 elements): div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
- Best-practices failing: errors-in-console, third-party-cookies, inspector-issues

## /tools/fba-calculator

### Mobile (final URL https://www.apexapplications.io/tools/fba-calculator)
- LCP element: div.bg-white > section.relative > div.relative > p.mx-auto [<p class="mx-auto mt-5 max-w-2xl text-balance text-lg leading-relaxed text-slate-600" styl]
- LCP phases: TTFB 630ms, Load Delay 0ms, Load Time 0ms, Render Delay 11849ms
- Render-blocking (est. savings 0ms): https://www.apexapplications.io/_next/static/chunks/2_68toai2vjcg.css (19 KiB)
- Unused JS (total wasted 370 KiB), top 5:
  - https://www.googletagmanager.com/gtag/js?id=G-21W9317C2L: 78 KiB wasted of 190 KiB
  - https://www.apexapplications.io/_next/static/chunks/0hxj60v3t_s_5.js: 71 KiB wasted of 71 KiB
  - https://www.googletagmanager.com/gtag/js?id=AW-17638589911&cx=c&gtm=4e6a60: 63 KiB wasted of 164 KiB
  - https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications...: 42 KiB wasted of 147 KiB
  - https://connect.facebook.net/en_US/fbevents.js: 37 KiB wasted of 110 KiB
- uses-responsive-images (90 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 57 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 33 KiB
- modern-image-formats (97 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 55 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
- unsized-images ():
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt]
- offscreen-images (47 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 47 KiB
- Third-party summary top: Facebook (263 KiB, main-thread 410ms, blocking 240ms); Google Tag Manager (354 KiB, main-thread 367ms, blocking 212ms); firebaseapp.com (94 KiB, main-thread 0ms, blocking 0ms); msgsndr.com (84 KiB, main-thread 49ms, blocking 0ms); Google CDN (49 KiB, main-thread 64ms, blocking 0ms); Other Google APIs/SDKs (42 KiB, main-thread 68ms, blocking 0ms)
- uses-long-cache-ttl: 4 resources found -> https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 132 KiB; https://connect.facebook.net/en_US/fbevents.js 100 KiB; https://apex-apps-parent.firebaseapp.com/__/auth/iframe.js 80 KiB
- mainthread-work-breakdown: 3.0 s
- bootup-time: 1.6 s -> https://www.apexapplications.io/_next/static/chunks/1ly9rx7hh07qa.js 741ms; Unattributable 393ms; https://www.apexapplications.io/tools/fba-calculator 374ms
- unminified-javascript: Est savings of 71 KiB
- legacy-javascript: Est savings of 26 KiB -> https://www.apexapplications.io/_next/static/chunks/1rx4n59ymi-cg.js 14 KiB; https://connect.facebook.net/en_US/fbevents.js 12 KiB; https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 1 KiB
- Accessibility failing audits: 
  - **button-name** (1 elements): div.max-w-7xl > div.flex > div.lg:hidden > button.p-2 [<button class="p-2 text-slate-100 bg-slate-900 rounded-lg shadow-lg">]
  - **color-contrast** (2 elements): ul.space-y-3 > li > a.inline-flex > span.rounded-full [<span class="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-black uppercase trac…">] | ul.space-y-3 > li > a.hover:text-brand > span.block [<span class="block text-xs text-slate-400">]
  - **image-redundant-alt** (1 elements): div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
- Best-practices failing: errors-in-console, third-party-cookies, inspector-issues

### Desktop (final URL https://www.apexapplications.io/tools/fba-calculator)
- LCP element: div.bg-white > section.relative > div.relative > h1.text-balance [<h1 class="text-balance text-4xl font-black leading-[1.05] tracking-tight text-slate-…" st]
- LCP phases: TTFB 179ms, Load Delay 0ms, Load Time 0ms, Render Delay 2495ms
- Unused JS (total wasted 366 KiB), top 5:
  - https://www.googletagmanager.com/gtag/js?id=G-21W9317C2L: 76 KiB wasted of 190 KiB
  - https://www.apexapplications.io/_next/static/chunks/0hxj60v3t_s_5.js: 71 KiB wasted of 71 KiB
  - https://www.googletagmanager.com/gtag/js?id=AW-17638589911&cx=c&gtm=4e6a60: 60 KiB wasted of 164 KiB
  - https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications...: 42 KiB wasted of 147 KiB
  - https://connect.facebook.net/en_US/fbevents.js: 38 KiB wasted of 110 KiB
- uses-responsive-images (104 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 61 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
- modern-image-formats (97 KiB savings):
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A] 55 KiB
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt] 42 KiB
- unsized-images ():
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png div.grid > div.md:col-span-2 > a.inline-block > img.h-16 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
  - https://www.apexapplications.io/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge.png div.max-w-7xl > div.grid > div.md:col-span-2 > img.h-28 [<img src="/__l5e/assets-v1/dc2d5fb1-ceee-4cf0-82b7-8b4c1c4a4a3c/amazon-partner-badge…" alt]
- Third-party summary top: Facebook (263 KiB, main-thread 95ms, blocking 2ms); Google Tag Manager (354 KiB, main-thread 85ms, blocking 0ms); msgsndr.com (84 KiB, main-thread 9ms, blocking 0ms); Google CDN (49 KiB, main-thread 12ms, blocking 0ms); openai.com (28 KiB, main-thread 7ms, blocking 0ms); Google/Doubleclick Ads (4 KiB, main-thread 1ms, blocking 0ms)
- uses-long-cache-ttl: 3 resources found -> https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 132 KiB; https://connect.facebook.net/en_US/fbevents.js 100 KiB; https://bzrcdn.openai.com/sdk/oaiq.min.js 18 KiB
- unminified-javascript: Est savings of 71 KiB
- legacy-javascript: Est savings of 26 KiB -> https://www.apexapplications.io/_next/static/chunks/1rx4n59ymi-cg.js 14 KiB; https://connect.facebook.net/en_US/fbevents.js 12 KiB; https://connect.facebook.net/signals/config/2587560145358706?v=2.9.415&r=stable&domain=www.apexapplications... 1 KiB
- Accessibility failing audits: 
  - **color-contrast** (2 elements): ul.space-y-3 > li > a.inline-flex > span.rounded-full [<span class="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-black uppercase trac…">] | ul.space-y-3 > li > a.hover:text-brand > span.block [<span class="block text-xs text-slate-400">]
  - **image-redundant-alt** (1 elements): div.max-w-7xl > div.flex > a.flex > img.h-18 [<img src="/__l5e/assets-v1/e479ef22-740f-4404-857c-695c92a87214/apex-bull-logo.png" alt="A]
- Best-practices failing: errors-in-console, third-party-cookies, inspector-issues
