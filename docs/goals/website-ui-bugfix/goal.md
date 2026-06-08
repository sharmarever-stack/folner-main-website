# Website UI Bugfix — 8 Issues

## Objective
Fix all 8 reported UI bugs across the Folner website in one bounded tranche.

## Original Request
Fix the following issues:
1. "Effortless is engineered" section — white light dot has too much spring animation (looks weird), make it subtle
2. Info Bar/Announcement bar on careers-2 page doesn't match homepage design — make it consistent across all pages
3. Platforms page is broken / showing mostly blank — fix it
4. Careers-2 page — Info Bar differs from homepage
5. Contact page — cursor disappears after scrolling past hero section
6. Privacy page — Info Bar differs from homepage
7. Careers-2 page — Hero section buttons are not centered (shifted left)
8. All job pages are broken (showing empty/blank); header should disappear after hero section on all job pages

## Intake Summary
- Input shape: `specific`
- Audience: Site visitors and Folner team
- Authority: `approved`
- Proof type: `artifact`
- Completion proof: All 8 bugs fixed and verifiable by visual inspection of each affected page
- Goal oracle: Each named page/section renders correctly with no visual regressions
- Likely misfire: Fixing some bugs but missing others; or fixing in isolation and breaking shared components
- Blind spots: Info Bar is likely a shared component — one fix may cascade to all pages; job pages may share a template
- Existing plan facts: none

## Goal Oracle
`All 8 reported bugs are fixed: animation is subtle, Info Bar is identical across all pages, Platforms page renders, Careers-2 buttons are centered, Contact cursor persists after scroll, job pages render with disappearing header.`

## Goal Kind
`specific`

## Current Tranche
All 8 bugs in one pass. Continue until final audit confirms all are resolved.

## Non-Negotiable Constraints
- Do not break pages that are currently working
- Maintain existing design tokens and visual language
- One Worker task active at a time

## Stop Rule
Stop only when a final Judge/PM audit maps all receipts to the oracle and records `full_outcome_complete: true`.

## Slice Sizing
Safe = bounded + explicit + verified + reversible.

## Run Command
/goal Follow docs/goals/website-ui-bugfix/goal.md.
