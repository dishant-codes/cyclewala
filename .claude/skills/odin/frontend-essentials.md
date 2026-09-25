# Skill: Frontend Essentials

> The mandatory checklist for every page/feature Odin ships — not optional
> extras, the baseline. Performance targets/tuning specifics live in
> `skills/odin/page-optimize.md`; this file is the broader "did we cover
> everything a real page needs" list.

## Purpose
Research (competitor/UX patterns) informs *what* to build;
`skills/_global/modern-frontend.md` covers *how it should look and feel*
(component libraries, motion tier, "No Old UI"); **this checklist covers what
every page needs regardless of what it's about** — so SEO, OG tags, and
responsiveness don't get skipped just because they weren't explicitly asked
for.

## Prerequisites
- `skills/_global/modern-frontend.md` (the build-style companion — run the
  `build-awwwards-quality-sites` umbrella, source the aesthetic + sections from
  the `skills/web-design/` library, and the hero from 21st.dev / Aceternity /
  React Bits there before this checklist)
- `doc/brandpack.md` (the design system — pages must match its tokens, not
  invent their own look; every recipe/component is checked against it first)
- `doc/project-overview.md` (stack, so tags/markup match what the project
  actually uses)

## Usage — the checklist, every page

**SEO**
- [ ] `<title>` unique and descriptive per page (not the site name repeated)
- [ ] Meta description, ~150-160 characters
- [ ] One `<h1>`, logical heading hierarchy below it
- [ ] Semantic HTML (`<nav>`, `<main>`, `<article>`, not `<div>` soup)
- [ ] Canonical URL set
- [ ] Structured data (schema.org JSON-LD) where the content type has one
      (Article, Product, FAQ, etc.)
- [ ] Included in the sitemap / not accidentally `noindex`ed

**Open Graph / social**
- [ ] `og:title`, `og:description`, `og:image` (1200×630 — see
      `doc/brandpack.md#Logo` for the social preview asset), `og:type`, `og:url`
- [ ] `twitter:card` (`summary_large_image` unless there's a reason not to)

**Responsive**
- [ ] Mobile-first breakpoints, tested at mobile/tablet/desktop widths
- [ ] Touch targets ≥ 44×44px on interactive elements
- [ ] No horizontal scroll at any breakpoint
- [ ] Images/media scale, don't overflow their container

**Optimization**
- Full checklist + targets: `skills/odin/page-optimize.md`

**Other essentials**
- [ ] Favicon set (all required sizes)
- [ ] 404/empty/loading/error states designed, not left blank
- [ ] `robots.txt`/meta robots correct for the page's intended visibility
- [ ] Accessibility (contrast, keyboard nav, focus-visible, alt text,
      reduced-motion) — Odin owns this for anything Odin builds; copy-paste
      animated components frequently ship a11y gaps, so audit per
      `skills/_global/modern-frontend.md#Accessibility`
- [ ] GEO audit run for public-facing pages — `skills/odin/content-quality.md#GEO`
      (separate from the Lighthouse SEO score; Lighthouse doesn't check it)

## Pre-Launch Page Audit
Before calling any content-bearing page done, confirm each of these — don't
just assert it. Every item points to where its full detail actually lives,
so this stays a checklist, not a second copy of the rules. **Depth scales
with whether this is a new page type or a variant of an existing one** —
see the Scope Check in `skills/odin/content-research.md` and the Lighthouse
Gate's full-vs-lighter split in `skills/odin/page-optimize.md`. A checklist
item that references "the audit" below means "confirm it holds," not
"re-derive it from scratch" when a sibling page already established it.
- **Content & research** — `skills/odin/content-research.md` (audience,
  intent, keywords established) + `skills/odin/content-quality.md`
  (nothing fabricated, nothing templated)
- **Batch/series check** — if this page is one of several built from a
  shared skeleton, its headline and repeated-structure sections read
  differently from siblings already built, not a find-and-replace of one
  (`skills/odin/content-quality.md`)
- **SEO / OG / responsive / other essentials** — the checklists above
- **GEO** — 8-point audit, `skills/odin/content-quality.md#GEO`
- **Performance** — Lighthouse Gate, `skills/odin/page-optimize.md`
- **Accessibility** — WCAG 2.2 AA, keyboard nav, contrast, focus states
- **Code quality** — no dead code, no unresolved TODOs, reusable not
  duplicated components

## Input
A page or feature about to ship, plus `doc/brandpack.md` and
`doc/project-overview.md` for context.

## Output
A page that passes every box above, or an explicit note on which ones don't
apply and why (e.g. an internal admin page skipping OG tags) — never a
silent skip.

## Error Handling
| Situation | Response |
|---|---|
| A checklist item doesn't apply to this page type | Note why, don't just omit it silently — the next person reading the QA report shouldn't have to guess if it was missed or intentional. |
| Brand pack has `[TBD]` fields needed for a checklist item (e.g. no social preview image for OG) | Ship with a documented placeholder, flag it to the user — don't invent brand assets. |

## Security Notes
Structured data and OG tags should never leak internal-only fields (draft
content, internal IDs, unpublished data) — treat them as public output.

## Prohibited Actions
- Shipping a page with no meta description/title because "it's a small
  page."
- Skipping responsive testing because it "looked fine on one screen."
- Inventing brand colors/fonts/logo when `doc/brandpack.md` has them as
  `[TBD]` instead of flagging the gap.

## Memory Hooks
- Log any checklist item that recurs as a miss (e.g. "OG image keeps
  getting forgotten on blog posts") — that's a pattern for `memory/odin.md`,
  not a one-off note here.

## Change Log
<!-- Log updates to this skill -->
