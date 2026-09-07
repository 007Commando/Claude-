# Site-wide design rollout

Accepted reference: the collaboratively built homepage, implemented in `src/components/landing`, plus the user's RealSpiro screenshots. Old-site context reviewed at https://www.apexapplications.io/ on September 7, 2026. The generated `design/landing-concept.png` is historical; it is not the final accepted homepage design.

## Coverage

All 23 page route files use the shared shell, including dynamically generated blog posts. The production build generates 55 route artifacts. Home retains its own composition; interior routes receive the shared visual system. Seventeen components have explicit hero treatment hooks.

- Product pages (Black, Blue, Green, Red): warehouse illustration, white hero typography, pale badges, framed screenshots, feature panels and existing scroll reveals.
- Pricing: shared illustrated-color palette, rounded hero, existing billing toggle and plan selection.
- Roadmap, review booster, rewards, contact, distributor vault, ungating, prep network: pale blue hero panels, teal accents, consistent controls and existing diagrams/interactions.
- Offers and thank-you: matching hero panels, yellow principal actions, retained offer terms and checkout URLs.
- Blog index and posts: editorial typography, pale category treatments and hover lift on index cards; existing article contents and links.
- Signup: matching form surfaces, typography, focus treatments; authentication logic unchanged.
- Legal: readable white document panel, unchanged legal text.
- Dashboard: restrained typography, control and surface styling; data and dashboard actions unchanged.

Shared navigation supports desktop links, a sign-in capsule, an accessible dropdown, Escape dismissal, navigation dismissal and motion preference control. The shared footer includes product/resource links and the original Amazon partner badge. The Elite countdown retains its fixed top slot, with navigation offset below it.

## Fidelity ledger and verification limitations

| Comparison point | Implementation | Verification |
| --- | --- | --- |
| Navigation geometry | Reuses homepage navigation CSS and component on every route | Code-reviewed; all local menu/footer paths resolve |
| Typography | Local Inter files, 600-weight headings, tighter spacing | Code-reviewed; rendered line breaks pending |
| Palette | Navy ink, teal accents, pale blue surfaces, yellow primary actions | Code-reviewed; rendered contrast pending |
| Asset treatment | Existing warehouse hero and actual screenshots, dark device bezel | Code-reviewed; crop/viewport inspection pending |
| Panels and spacing | Explicit hero and feature panel hooks, mobile overrides | Code-reviewed; mobile screenshots pending |
| Motion | Existing Motion animations retained; shared reduced-motion config and CSS shimmer | Build checked; live interactions pending |
| Content | Original page bodies, prices, forms and checkout routes preserved; four feature headings changed to sentence casing | Source diff reviewed |

Production build/TypeScript compilation and git diff whitespace check pass. Shared navigation route audit passes. Browser inspection was attempted via IAB but denied because the admin-enforced browser policy could not be verified. No alternate browser or indirect rendering workaround was used. Consequently, new interior screenshots, side-by-side view_image inspection, desktop/mobile visual QA and runtime interaction checks remain pending. This rollout is implemented but is not visually signed off. Previous homepage QA does not constitute verification of these new pages.

Intentional deviations: long-form, account and dashboard pages do not reproduce the homepage hero or drone; the design is adapted to their reading/task purpose. Existing product-specific accent colors and established route functionality remain. No deployment or push was performed.

## Mobile and detail pass

- Product cards now use a 252px height, approximately 75% of their previous 336px footprint, with compact artwork and vertical spacing. On mobile the carousel becomes a touch-scrolling rail with snap points and removes repeated demo cards.
- Added iPhone mute, volume, and power buttons outside the clipped screen.
- Replaced fading static lessons with a four-step interactive lesson preview: animated orbital course artwork, active lesson highlight, timed progress, and click-to-select. Honors shared pause and reduced-motion preferences.
- Replaced the orbit's straight top/bottom fade with an elliptical radial fade.
- Moved the comparison legend below the attached disclosure; added separation. Floating trial bar hides while the comparison is in view.
- Mobile refinements apply across the shared site shell: heading scale, hero/panel padding, input sizes, touch targets, menu height, article/legal gutters, offer button wrapping, auth spacing, dashboard gutters and roadmap spacing. Pricing now exposes two mobile plan cards using the original price state and signup handler, with the detailed comparison still scrollable below.

Browser review attempted again but the admin-policy check remained unavailable. No mobile visual sign-off or new screenshot comparison is claimed. The supplied marked screenshots were used as evidence for the five detailed fixes. Full site visual verification remains pending browser access.
