# Skill: Content Research

> Pre-build research for any content-bearing page (landing/marketing page, or
> a content/SEO-affecting change to one) — this is what makes the difference
> between a generic page and one that actually speaks to its audience.
> Skip this only for a code-only change (CSS tweak, bug fix, padding
> adjustment) that doesn't touch content.

## Purpose
A page built without this reads generic no matter how polished the code is.
Research informs *what* to build; `skills/odin/frontend-essentials.md`
covers what every page needs regardless of what it's about.

## Scope check first — new page type, or one more of an existing pattern?
This full pipeline is for a **genuinely new page/content type**. Before
running it, check whether the project already has an established sibling
(e.g. existing use-case/vertical/location pages following the same
skeleton). If one exists:
- **Reuse its research and structure** — don't redo competitor/keyword/
  conversion research that already produced that pattern.
- **Research only what's actually specific to the new instance** (here:
  what HR teams' pain points/terminology/objections are — not the whole
  page-structure question again).
- **Steps 1 (competitor) and 6 (conversion) usually don't need re-running**
  for a variant — the sibling page already answered "what should this kind
  of page look like." Steps 2-5 (content/keywords/intent/audience) still
  need the *variant's own* answer, just scoped to what's actually different.
This is the single biggest cost lever in this skill — a full 6-step
research pass on the Nth variant of an already-proven page type is where
token spend balloons for no real quality gain.

## Prerequisites
- `doc/project-overview.md` (business/product context)
- `doc/brandpack.md` (tone)
- Real search/fetch tools available this session — see
  `skills/odin/tool-selection.md` for what to do when they aren't

## Usage — six things to establish before writing a word of copy

1. **Competitor research.** Top-ranking competitors for the target
   keywords: positioning, messaging, page structure, CTAs, USPs, common
   FAQs, content gaps, weaknesses. Use real search/fetch tools to find
   actual current pages — don't describe "competitor positioning" from
   memory. Never copy; understand the approach, find the gap, do better.
2. **Content research.** Industry, audience, location, customer type, pain
   points, needs, search intent, terminology the industry actually uses,
   questions people ask. A broad brief ("UK property") is usually several
   distinct audiences (builders, developers, agents, letting agents,
   property managers) each with different vocabulary — don't flatten them
   into one generic voice.
3. **Long-tail keyword research.** Long-tail, low-competition,
   high-commercial-intent, question-based, industry-specific keywords.
   Prioritize intent-match over raw volume — a lower-volume phrase the
   audience actually searches beats a high-volume term the page has no
   realistic shot at ranking for. Integrate naturally, never stuff.
4. **Search intent.** Informational, Commercial, Transactional,
   Navigational, Local, or Industry-specific — determine before writing;
   content must satisfy the *actual* intent, not just contain the keyword.
5. **Target audience.** Who is this for? What problem do they have? What's
   the solution? Why this solution? What objections would they raise? What
   action should they take? Every heading/example/benefit/CTA should trace
   back to one of these six answers — if a section doesn't, question why
   it's on the page.
6. **Conversion research** (conversion-focused pages only — skip for a
   component refactor or non-funnel work). Primary/secondary conversion
   goal, objections, trust signals that matter to *this* audience, buying
   triggers, friction points. Know where the page sits in the project's
   actual funnel and **reuse whatever step already exists** (pricing,
   checkout, signup, onboarding) — never build a parallel one. The
   incomplete-purchase/exit path matters too: the recovery experience
   (demo booking, contact sales, back to pricing) should reuse existing
   project mechanisms, and never invent a discount/offer to smooth it over
   unless it's a real, existing business mechanism.

## Input
A content-bearing page task and access to real search/fetch tooling.

## Output
A short synthesis (not a raw research dump) feeding the page's structure,
copy, and metadata — audience, intent, keywords, and the one or two things
that make this page's angle different from a generic version of it.

## Error Handling
| Situation | Response |
|---|---|
| No search/fetch tools available this session | State plainly that the analysis is general category knowledge, not a verified current check — see `skills/odin/tool-selection.md`. Never invent competitor names/pages to fill the gap. |
| Broad brief covers multiple distinct sub-audiences | Don't average them into one generic voice — either scope the page to one, or address the mix explicitly in the structure. |

## Security Notes
Don't send project-confidential detail (unreleased pricing, internal
architecture, customer data) to an external search/fetch call — a public
query about industry pain points is fine, pasting internal specifics isn't.

## Prohibited Actions
- Writing copy before establishing audience + intent + keywords.
- Presenting an invented competitor analysis as a verified one.
- Building a parallel pricing/checkout/signup flow instead of reusing the
  project's real one.
- Inventing a discount/offer/guarantee that doesn't exist in the project.

## Memory Hooks
- Log durable findings (an audience segment's actual vocabulary, a
  recurring competitor gap) to `memory/odin.md` if they'll matter beyond
  this one page — not every research pass needs a log entry.

## Change Log
<!-- Log updates to this skill -->
