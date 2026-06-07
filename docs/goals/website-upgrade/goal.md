# Folner Website — Full Upgrade

## Objective
Audit and upgrade every page in Main_Website — visually, structurally, and experientially — bringing all pages into full compliance with the Felnor OLED Emission design system and fixing all known issues identified in the scout audit.

## Original Request
Upgrade whole website, do it page by page, improve whatever required, change whatever required, fix whatever required, upgrade whole website experience and visuals.

## Intake Summary
- Input shape: `open_ended`
- Audience: Folner site visitors; Sanjay (owner)
- Authority: `approved`
- Proof type: `artifact`
- Completion proof: Every HTML page opens correctly in a browser, uses true `#000000` OLED canvas, consistent Felnor emission design tokens, working site chrome (header + footer), no broken interactions, no placeholder content, consistent cross-page experience.
- Goal oracle: All 15 HTML pages pass a per-page audit: correct canvas color, emission palette applied, header/footer consistent, no empty CSS blocks, no broken JS.
- Likely misfire: Touching only surface-level styling while leaving structural issues (blank header CSS on job pages, 404 with no chrome) unfixed.
- Blind spots: Legal pages (privacy, cookies, terms, security) need design system alignment but should stay readable; job pages share a template pattern.
- Existing plan facts: Scout audit identified priority issues per page.

## Goal Oracle
Every HTML page in `/Users/sanjaysharma/Desktop/Folner/Main_Website/` renders with:
1. `#000000` OLED canvas (or correct Felnor dark surface)
2. Consistent site chrome — header with nav + footer matching folner-about-us.html pattern
3. No empty/dead CSS blocks
4. Correct emission colors (no accidental duplication like all-rose belief cards)
5. Working hover/interaction states
6. No broken asset references

## Goal Kind
`open_ended`

## Page Execution Order
1. **index.html** — Homepage (high priority, first impression)
2. **folner-about-us.html** — About page (reference template for chrome)
3. **platforms-protocols.html** — Already in-flight, needs final verification
4. **folner-careers-2.html** — Careers listing
5. **folner-contact.html** — Contact page
6. **folner-job-junior-designer-10x-2.html** — Complete job page (template for others)
7. **folner-job-detail.html** — Job detail (blank header CSS fix)
8. **folner-job-junior-designer.html** — Junior designer (blank header + duplicate canonical fix)
9. **folner-job-market-analyst.html** — Market analyst (blank header fix)
10. **folner-job-product-manager.html** — Product manager (blank header fix)
11. **404.html** — Error page (no chrome at all — add header + footer)
12. **cookies.html** — Legal (dead .nav CSS fix + palette alignment)
13. **privacy.html** — Legal (dead .nav CSS fix + palette alignment)
14. **security.html** — Legal (dead .nav CSS fix + non-system emerald fix)
15. **terms.html** — Legal (dead .nav CSS fix + palette alignment)

## Non-Negotiable Constraints
- All CSS inlined in `<style>` block in `<head>` (no external CSS except Google Fonts)
- All JavaScript in `<script>` tags at end of `<body>`
- Canvas must be `#000000` (OLED true black) per Felnor design system
- One emission color per element — never flat fills, only glows/halos/borders
- Site chrome (header + footer) must be consistent across all pages
- Asset paths use relative paths from Main_Website/
- Do NOT break any page that is currently working well

## Stop Rule
Stop only when a final Judge audit confirms all 15 pages pass the oracle criteria with `full_outcome_complete: true`.

## Slice Sizing
Each page is one Worker task — the largest safe useful slice per page.

## Run Command
/goal Follow docs/goals/website-upgrade/goal.md.
