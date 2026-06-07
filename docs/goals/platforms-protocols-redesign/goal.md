# Platforms & Protocols Page — Complete Implementation

## Objective
Build `platforms-protocols.html` from scratch as a complete, visually correct, site-consistent Folner page matching the approved spec: requirements.md, design.md, and tasks.md all exist and are complete.

## Original Request
Do the complete implementation of platforms-protocols.html.

## Intake Summary
- Input shape: `existing_plan`
- Audience: Folner site visitors; Sanjay (owner)
- Authority: `approved`
- Proof type: `artifact`
- Completion proof: `platforms-protocols.html` opens in a browser and renders all sections (hero with neural canvas, platforms grid with 6 emission cards, protocols accordion, philosophy statement, feature matrix, CTA, footer) with correct Felnor OLED design system styling, full JS interactions, and responsive mobile layout.
- Goal oracle: The file `/Users/sanjaysharma/Desktop/Folner/Main_Website/platforms-protocols.html` exists, is non-empty, and passes an HTML syntax check with all spec sections present.
- Likely misfire: Generating a page that looks done structurally but is missing JS interactions (accordion, cursor glow, neural canvas) or mobile responsiveness.
- Blind spots: Asset paths (assets/images/) must be correct relative paths; the page must be consistent with folner-about-us.html site chrome.
- Existing plan facts: Full spec in /Users/sanjaysharma/Desktop/Folner/.kiro/specs/platforms-protocols-redesign/ (requirements.md, design.md, tasks.md)

## Goal Oracle
`platforms-protocols.html` exists at `/Users/sanjaysharma/Desktop/Folner/Main_Website/platforms-protocols.html`, is non-empty (>500 lines), and contains all required section IDs: `hero`, `platforms`, `protocols`, `philosophy`, `matrix`, `cta`, `siteFooter`, with complete CSS, HTML, and JavaScript.

## Goal Kind
`existing_plan`

## Current Tranche
Full implementation — all tasks in tasks.md executed to completion.

## Non-Negotiable Constraints
- All CSS inlined in `<style>` block in `<head>` (no external CSS except Google Fonts)
- All JavaScript in `<script>` tags at end of `<body>`
- Asset paths use `assets/images/` (relative to Main_Website/)
- Page must match Felnor OLED Emission design system exactly
- Site chrome (header, footer, menu) must be consistent with folner-about-us.html

## Stop Rule
Stop only when the final audit confirms platforms-protocols.html is complete, non-empty, and all sections are present.

## Slice Sizing
The entire page is one Worker task — it is the largest safe useful slice.

## Run Command
/goal Follow docs/goals/platforms-protocols-redesign/goal.md.
