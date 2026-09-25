# Cycle Wala

> A local bicycle shop's marketing website — store, accessories, and services.

## Stack
Next.js (App Router) — frontend-only, no backend data layer.
<!-- /initialize --> Matches the ported reference exactly: Next.js 16, React 19,
TypeScript, npm. GSAP + Lenis (scroll) + Three.js (WebGL) come along as part of
the ported codebase — see Architecture below.

## Active Agents
- NickFury — orchestrator (locked)
- Odin — full frontend & page builder

Disabled at init (2026-09-12): IronMan, Vision, BlackPanther, Natasha, Hulk,
Groot — moved to `agents/_disabled/`. Re-run `/initialize` → "update agent +
skill selection only" to re-enable (e.g. add Vision later for small tweaks,
Natasha once docs need to stay in sync with a shipped site, or Hulk/Groot
before the first production deploy).

## Goals
Primary: build a single, heavily animated one-page site for Cycle Wala (bike
store / accessories / services) by **porting the exact code and structure** of
a reference Next.js portfolio project the user supplied
(`E:\laragon\www\-Gireesh-Portfolio`, also provided as a zip) — same
architecture (Lenis + GSAP ScrollTrigger, sticky `Scene` stack, Three.js
tunnel-intro + light-journey WebGL, `VelocityMarquee`, the orbiting
"stack" component), all content replaced for a bicycle shop. The orbiting
"My Design Stack" section is repurposed as a **"Brands We Carry"** section
(real bicycle-brand names/logos or bicycle iconography in place of design-tool
logos). Brand palette recolored from the reference's red accent to Cycle
Wala's green (from the user-supplied logo) — see `doc/brandpack.md`.

## Non-Goals
No e-commerce/checkout, no user accounts, no backend or database — content is
static. No i18n (the reference's EN/FR toggle is dropped; English only, per
user instruction).

## Architecture
Frontend-only — no database / backend data layer.
Auth — not applicable (no accounts).
Ported subsystems (from the reference codebase, code reused as-is / adapted,
not hand-authored — satisfies the "no hand-authored 3D" rule since it's a
sourced port of user-supplied reference code):
- `lib/lenis.ts` + `components/layout/SmoothScroll.tsx` — smooth scroll
- `lib/gsap.ts` + GSAP ScrollTrigger — scroll choreography
- `components/layout/Scene.tsx` — sticky-stack scene system
- `components/sections/Intro/TunnelIntro.tsx` — WebGL tunnel intro (Three.js)
- `components/sections/Journey/LightJourney.tsx` — GLSL light-cable journey (Three.js)
- `components/sections/Stack/DesignStack.tsx` + `content/stack.ts` — orbiting
  logo section → retheme + recontent as "Brands We Carry"
- `components/ui/VelocityMarquee.tsx`, `components/ui/Button.tsx`
- `components/layout/Nav.tsx` (drop `LanguageToggle` — EN only)

## Environments
- Local: localhost:3000
- Staging: [TBD]
- Production: [TBD]

## Initialized
2026-09-12

## Change Log
- 2026-09-12 — Project initialized via `/initialize` (new-project mode).
  Stack: Next.js, frontend-only. Design direction: ported 1:1 from a
  user-supplied reference project, recolored to Cycle Wala's brand green.
  Agents: NickFury, Odin.
- 2026-09-12 — Re-init note: this `.claude/` folder previously carried stale
  state from two other projects (ByteSetu, TechVenta) with no matching code in
  the working directory. Treated as fresh per explicit user instruction; old
  `doc/*.md`, `context/root.md`, `memory/root.md` content overwritten.
