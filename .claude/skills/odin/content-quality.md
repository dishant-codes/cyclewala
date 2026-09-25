# Skill: Content Quality & Anti-Fabrication

> The "don't ship AI slop" rulebook — content must be original, specific,
> and honest, or it fails regardless of how well-optimized it is.

## Purpose
Generic, fabricated, or templated content undermines both the reader's
trust and search/GEO performance. This is the checklist that catches it
before a page ships.

## Prerequisites
- The page's target audience/intent from `skills/odin/content-research.md`

## Usage

**Never fabricate:**
- A statistic or customer count ("40% of buyers...", "trusted by 2,400
  teams") unless it's real, or explicitly marked illustrative
- A testimonial or case study presented as real
- A competitor analysis not backed by an actual search/fetch (see
  `skills/odin/content-research.md`)
- A video URL, video ID, or video content that doesn't exist
- A price, currency, plan, discount, trial, or guarantee not backed by the
  project's real pricing/config source
- Fake urgency or scarcity ("Only 2 spots left," a countdown to nothing) or
  a manipulative dark pattern to force conversion

**Never templated:**
- A repeated sentence shape across a grid/list with only a noun swapped
  (a real, observed failure mode — city/location grids and feature-card
  grids are exactly where this creeps in). Each item needs its own
  specific value, not a mail-merge of one template.
- The same headline/hero-copy formula reused across a series of similar
  pages with only the subject swapped. **Before calling any page in a
  series done, read its headline and repeated-structure sections against
  the sibling pages already built in that series** — if one reads like
  find-and-replace of another, that's a sign the audience research for
  *this* page was skipped, not just a phrasing issue. Go back and do the
  research, don't just edit the sentence.

**Never:**
- Keyword-stuff — if a sentence reads worse for having the keyword in it,
  rewrite the sentence
- Claim content is plagiarism-checked without an actual tool having run
- Attempt to evade AI-content detectors — write for people, not around a
  detector
- Duplicate an existing page in this project without surfacing the overlap
  first (a narrower page silently competing with a broader existing one in
  search is a real cost)

**E-E-A-T** (Experience, Expertise, Authority, Trust — same discipline as
above, Google's own naming for it): write like someone who understands the
industry's actual workflows, back claims with specifics not vague
assertions, never invent proof, use real examples where available and say
plainly when they aren't.

## GEO — Generative Engine Optimization
Making the business understandable to AI answer systems (ChatGPT, Gemini,
Claude, Perplexity), not just crawlers. For public-facing pages, run this
8-point check separately from the Lighthouse SEO score (Lighthouse doesn't
check any of it):
- [ ] Product/service description stated plainly
- [ ] Audience — specific, not "businesses"
- [ ] Location, where relevant, stated naturally
- [ ] Capabilities — only real, verified ones, hedged honestly where partial
- [ ] Pricing — traces to the project's real authoritative source, never a
      stale hardcoded snapshot, every currency shown actually has a price
      behind it (a currency in a UI selector is not proof pricing exists
      for it — verify the source)
- [ ] FAQs — real questions this audience asks, answered honestly
      (including "no" where the honest answer is no)
- [ ] Structured data present, valid, and matching the visible page exactly
- [ ] No unsupported claims anywhere — copy, metadata, or schema. This one
      item matters most: a page can pass every other check and still fail
      on one invented claim.

This is people-first content that happens to be machine-parseable — never
add a section or claim solely to game an AI system.

## Input
Drafted copy/content for a page, plus its declared audience and intent.

## Output
Content that passes every box above, or an explicit note where something
is illustrative/placeholder rather than a silent pass.

## Error Handling
| Situation | Response |
|---|---|
| A number/fact would strengthen the page but isn't verified | Don't invent it. Ask the user for the real figure, or write around it honestly. |
| Pricing data has a gap (a currency/plan missing from the real source) | Report the inconsistency — don't fabricate a conversion or silently drop it. |

## Security Notes
None beyond the standard rule: never send confidential project data to an
external research tool (see `skills/odin/tool-selection.md`).

## Prohibited Actions
Everything under "Never fabricate" / "Never templated" / "Never" above —
these are hard rules, not style preferences.

## Memory Hooks
- Log a caught fabrication/templating incident to `memory/odin.md` as a
  correction — the pattern (not just the instance) is what future sessions
  need to avoid repeating it.

## Change Log
<!-- Log updates to this skill -->
