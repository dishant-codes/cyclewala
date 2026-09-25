# Odin Memory

> Frontend build intelligence for ByteSetu. Append-only.

## Project stack (confirmed 2026-09-03)
- Next.js 16.3.4 (App Router, Turbopack), React 19.2.8, TypeScript, Tailwind v4
  (CSS `@theme` config, no `tailwind.config.js`), npm.
- Design tokens: `src/app/globals.css` — mirrors `doc/brandpack.md` "Momentum".
  `cn()` in `src/lib/utils.ts`. Site content in `src/lib/site.ts` (marked
  ILLUSTRATIVE PLACEHOLDER — swap before launch).
- Deps: `motion`, `gsap`, `lenis`, `class-variance-authority`, `clsx`,
  `tailwind-merge`, `lucide-react`. No Three.js/ogl (disk + perf budget; light
  register doesn't need WebGL).

## Design decisions
- **Hero: NovaAI cinematic pattern** (2026-09-04, user request) — dark
  `#0a0a0a` section, scroll-scrubbed CloudFront video (`src/components/scroll-video.tsx`),
  NovaAI SectionOne layout (service list / intro / left-accent badge / huge
  headline / glass contact card) with ByteSetu copy in `src/lib/site.ts#hero`.
  Video URL = the NovaAI Higgs CloudFront clip (CORS `*`, canvas draw path).
  Portrait deliberately omitted (was a named real person "Mitha" — content-quality);
  a Hexagon icon fills that slot. "Dark hero, light rest" — nav flips
  dark-glass → light after the hero (`site-header.tsx` `onDark` state).
  ScrollVideo: seek-only (no ImageBitmap cache — too heavy for this machine),
  rAF loop self-idles when the scrub settles.
  *Superseded:* Aceternity Background Beams (`src/components/background-beams.tsx`
  still in repo, unused), and Aurora Background (deleted).
- Lenis / `SmoothScroll` REMOVED — conflicted with the scroll-scrub; NovaAI
  pattern does its own lerp. Native scroll only now.
- **2026-09-04 — scrub smoothness fix.** User reported the hero video scrub
  wasn't smooth. Root cause: seeking a live `<video>`'s `currentTime` every
  scroll tick is inherently laggy (keyframe decode latency per seek).
  `scroll-video.tsx` now pre-extracts ~28–56 frames (offscreen video, sized to
  the clip's actual duration) into `ImageBitmap`s once in the background;
  steady-state scrub is just array-index + `drawImage`, no seeking. Live-seek
  stays as the fallback while the cache builds. Also gave the hero more scroll
  room per the user's ask ("if the video needs two sections, use two sections
  for hero") — shell height 210vh → **300vh** (100vh pinned + 200vh scrub,
  ~2 viewport-heights), so the scrub reads as paced rather than rushed.
- **Primary section library / aesthetic:** `product-proof-saas` +
  `blue-cloudy-clean-modern` accents (reconciled from `blue-laser-clean-glass-layout`
  which clashed with the light Momentum direction — logged in brandpack §16).
- **Surface language:** light-first, white/`--surface` grounds, one dark band
  (PAP explainer, `bg-foreground`), colored brand shadows, pill buttons,
  gradient signature on wordmark + key headline words + stat numbers.
- Motion: `Reveal` (motion whileInView), `SectionHeading` (staggered word
  reveal), `CountUp`, `Journey` (scroll-progress-timeline via useScroll),
  `Marquee` (marquee-loop). One smooth-scroll engine: Lenis (`SmoothScroll`),
  disabled under reduced-motion.

## Status
- Phase 1 DONE: scaffold + design system + Home (`src/app/page.tsx`) — 11
  sections. `npm run build` green. Dev server on :3000.
- Phase 2 TODO: /courses + /courses/[slug] (2), /pay-after-placement,
  /placements, /about, /contact, /hire-from-us, /career-tools, /blog shell,
  /login stub. Nav links currently 404.
- Phase 3 TODO: sitemap/robots, OG image, per-route metadata, Lighthouse gate,
  a11y sweep, mobile pass. `dark` tokens are in CSS but no theme toggle yet.

## Notes / gotchas
- Dev machine is slow + disk was near-full (~2.5GB freed). First paint in dev
  can take 5–10s; production build is fine. **Headless-browser screenshots on
  this box are unreliable — frequently blank/torn even when the DOM is correct.
  Verify with JS: `getComputedStyle().opacity`, `elementsFromPoint()`,
  `getBoundingClientRect()`.** Confirmed repeatedly the layout is right when
  screenshots looked broken.
- `Reveal` (`src/components/reveal.tsx`) is now fail-safe: renders VISIBLE by
  default, only arms the hidden→shown animation for off-screen elements, with a
  2s fallback timer. Motion `whileInView` + `once:true` was leaving content
  stuck invisible under rAF throttle / fast scroll — don't reintroduce it.
- `html { scroll-behavior: smooth }` makes programmatic `scrollTo` stall on the
  slow pane; real wheel scroll is fine.
- `next.config.ts` has `agentRules: false` so Next stops regenerating root
  `CLAUDE.md`/`AGENTS.md` over the AvengerArmy `.claude/` setup.
