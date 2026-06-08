# T001 Scout — Website UI Bug Root Causes

## Bug 1: White dot animation too springy (Effortless section)
- **File**: `assets/js/main.js` lines 2422–2439
- **Root cause**: `initTracker()` uses a spring simulation — `velocity += (diff - velocity) * 0.08; currentY += velocity * 0.28` — which causes visible overshoot/bounce
- **Fix**: Replace with simple lerp: `currentY += (targetY - currentY) * 0.12`

## Bug 2 & 4 & 6: Info Bar inconsistency (careers-2, privacy, security, about)
- **Homepage/global** (`assets/css/style.css`): `background: rgba(3,88,247,0.18)`, blue dot `#56C2FF`, pulsing animation, `height: 40px`, `z-index: 30`
- **Careers-2** (`folner-careers-2.html` inline CSS): `background: rgba(10,10,12,0.92)` (near-black), green dot `rgb(89,212,153)`, no pulse, `z-index: 22`
- **Privacy** (`privacy.html` inline CSS): same near-black style as careers-2
- **Security** (`security.html` inline CSS): same near-black style as careers-2
- **About** (`folner-about-us.html` inline CSS): same near-black style as careers-2
- **Fix**: Replace inline `.announce-bar`, `.announce-dot`, `.announce-close`, `.announce-text`, `.announce-link` CSS in careers-2, privacy, security, about pages with the canonical style from the global stylesheet (blue tint, blue dot, pulse)

## Bug 3: Platforms page blank
- **File**: `platforms-protocols.html`
- **Root cause**: Body has only empty HTML comment placeholders for the Announcement Bar and Site Header — no actual `<div class="announce-bar">`, no `<header class="site-header">`, no `<nav>`, no `.menu-overlay`, no cursor glow elements, and no JavaScript section
- **Fix**: Add the full header/announce bar HTML + site JS (copied from about or contact page, adapted) to platforms-protocols.html body

## Bug 5: Careers-2 hero buttons not centered
- **File**: `folner-careers-2.html` (and `folner/folner-careers-2.html`)
- **Root cause**: `.hero-cta-row` has `justify-content:center` and `flex-wrap:wrap` in CSS, but need to verify if margin or padding override shifts it left
- **CSS check needed**: The `hero-cta-row` on careers-2 has margin-top:0 and looks correct in CSS — may be a `text-align:left` or `align-items:flex-start` from parent leaking in

## Bug 5 (contact cursor disappears)
- **File**: `folner-contact.html`
- **Root cause**: Cursor ring (`#cRing`) opacity starts at 0. The `mousemove` handler checks `if(ring.style.opacity!=='1')` — but after CSS transitions, `ring.style.opacity` becomes `''` (empty string), not `'0'`. So after `mouseleave` fires (which sets it to `'0'`), on next mousemove the check compares `'0' !== '1'` correctly. BUT the real issue: `document.addEventListener('mouseleave')` fires when cursor exits the document (e.g. during fast scroll on Mac trackpad with edge-swipe). Fix: Use `opacity > 0` check or always set opacity on mousemove.

## Bug 7: Job pages showing empty/blank
- **Files**: `folner-job-junior-designer.html`, `folner-job-junior-designer-10x-2.html`, `folner-job-product-manager.html`, `folner-job-market-analyst.html`
- **Root cause**: Job pages load hero title as "Loading" and rely on a JS `ROLES` data object to populate content. If the roles data object is not present or the URL param doesn't match a known role, content stays blank/loading
- **Need to check**: Is there a URL param (`?role=xxx`) required, or does the page auto-detect? Check the JS logic

## Bug 8: Job page header should disappear after hero section
- **File**: All `folner-job-*.html` pages
- **Root cause**: Two conflicting scroll handlers exist:
  1. Lines 1059-1063: Hides header past 85% of hero height — correct behavior
  2. Lines 1631-1642: Hides header when scrollY is increasing past 80px, shows when decreasing — this overrides #1 and re-shows the header after the hero
- **Fix**: Remove the second scroll handler (lines 1631-1642) that re-shows the header on scroll-up
