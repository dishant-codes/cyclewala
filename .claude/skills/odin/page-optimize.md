# Skill: Page Optimization

> Frontend performance optimization — techniques, targets, and the gate
> that actually enforces them instead of just listing them.

## Checklist
- [ ] Images: WebP/AVIF, lazy load, responsive srcset, explicit
      width/height (CLS prevention)
- [ ] Fonts: preload critical, font-display swap, subset
- [ ] CSS: critical CSS inline, async non-critical
- [ ] JS: defer non-critical, tree-shake, code-split, dynamic imports for
      below-the-fold/route-level code
- [ ] Bundle-size audited before adding a dependency — one eagerly-loaded
      heavy SDK (payments, chat widget, analytics) on a page that doesn't
      use it is one of the most common real causes of a bad TBT/LCP; gate
      it behind only the routes that actually need it
- [ ] Caching: service worker, HTTP cache headers (`immutable` on
      content-hashed build output)
- [ ] CDN: CloudFront/Cloudflare for static assets
- [ ] Compression: Brotli/Gzip
- [ ] No forced synchronous reflow — don't read a layout property
      (`scrollHeight`/`offsetWidth`/`getBoundingClientRect`) right after a
      DOM write in an effect that runs every render

## Self-Hosted Video (when a page has one)
- Never eager-load a video below the fold or before it's requested — a
  large file loading on mount is a common cause of bad LCP/TBT.
- `preload="metadata"` (not `auto`), or genuine click-to-play.
- Don't let it become the page's LCP element by accident (a click-to-play
  poster/card keeps a static element as LCP) — verify which element
  Lighthouse actually reports as LCP, don't assume.
- Never invent a poster image or video content that doesn't exist — a
  styled click-to-play card is a legitimate substitute for a missing poster.

## Targets (defaults — document in `doc/testing.md`/`doc/deployment.md` if
this project's real constraints require different numbers)
- LCP < 2.5s
- CLS < 0.1
- TTFB < 600ms
- Lighthouse Performance > 90 (see Lighthouse Gate — below 80 is a hard
  failure requiring investigation, not just a "could be better" note)

## Verification discipline — measure, don't assert
- **Production build only.** A dev server (HMR, unminified, dev-mode React)
  scores badly regardless of the page's real code — build it, serve it,
  then measure.
- **Check what's actually downloaded**, not just this page's own component
  code — a shared provider or misconfigured build can silently pull in
  unrelated bundles. A small page-specific chunk proves nothing if the
  shared entry point is bloated.
- **One run is noise.** Run more than once; state which mode
  (Desktop/Mobile) and which server (dev/production) a number came from
  before treating it as fact — the same page can legitimately score very
  differently across those two factors alone.
- **TTFB is a backend concern too** — if FCP/LCP are bad despite a lean
  bundle, check server response time (BlackPanther's territory) before
  optimizing the frontend further.

## Lighthouse Gate — before calling any content-bearing page done

**Full gate required for:** a genuinely new page type, a page introducing
a new dependency/template/pattern, or the first page of a new series.

**Full gate NOT required for:** a templated variant of a page type already
verified in this project (same components, same libraries, no new heavy
dependency) — e.g. the Nth use-case/vertical/location page following an
established pattern. For these, a lighter check is enough: confirm the
production build compiles clean and the new page's bundle chunk is a
similar size to its siblings (no unexpected size jump). Run the full gate
only if something about this specific variant is actually different
(a new library, a new section type not in the sibling pages). This is
where a routine page addition otherwise pays for a full Lighthouse run it
doesn't need — don't default to the full gate just because the task
touches a "page."

1. Build for production, serve it, load the real page.
2. Run Lighthouse against it — state Desktop/Mobile and dev/prod server.
3. Check all four categories: Performance, Accessibility, Best Practices, SEO.
4. Investigate anything below 90; **Performance below 80 is a failure**,
   treat it like a broken build, not a minor ding.
5. Fix what's practical within this task's scope — don't defer a real,
   fixable issue in code this task touched.
6. Re-run to confirm a fix actually moved the number — a code change isn't
   proof by itself (see Verification discipline above).
7. SEO should be 95+; a lower score is acceptable only with a documented
   reason stated to the user.
8. **If Lighthouse genuinely can't be run** (sandboxed environment, no
   reachable server) — say so explicitly and name what wasn't verified.
   Never fabricate a score or imply a run happened — see
   `skills/odin/tool-selection.md`.
