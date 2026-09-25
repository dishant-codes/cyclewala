# Root Context

> Current project state. NickFury only. Session-scoped. UPDATED after each task.

## Active Agents
- NickFury — orchestrator (locked)
- Odin — full frontend & page builder

Disabled (moved to `_disabled/`): IronMan, Vision, BlackPanther, Natasha,
Hulk, Groot.

## Current Sprint / Task
- Task: Build the Cycle Wala site by porting the reference project at
  `E:\laragon\www\-Gireesh-Portfolio` (also supplied as
  `E:\laragon\www\-Gireesh-Portfolio.zip`) — same exact code/structure
  (Lenis + GSAP ScrollTrigger, sticky `Scene` stack, Three.js `TunnelIntro` +
  `LightJourney`, `VelocityMarquee`, orbiting `DesignStack`), all content
  replaced for a bicycle shop (Cycle Wala — store / accessories / services).
- Requested recolor: reference's red accent `#ff2e0f` → Cycle Wala green
  (brandpack estimate `#4CAF2E`, sampled visually from the user's logo — needs
  exact re-sampling once the logo file itself is saved to disk).
- Requested content swap for the orbiting "My Design Stack" section → "Brands
  We Carry": real bicycle-brand names/logos and/or small bicycle icons instead
  of design-tool logos. User explicitly said this can include small bicycle
  graphics around the orbit and/or real brand names — exact mix is Odin's call.
  See `content/stack.ts` in the reference for the data shape to replace.
- Drop the reference's EN/FR `LanguageToggle` + `lib/i18n.tsx` — English only.
- Logo: user provided the Cycle Wala wordmark inline in chat (not yet a file
  on disk) — save it to `public/` when the app is scaffolded; see
  `doc/brandpack.md#17-logo`.
- Status: `/initialize` complete (docs generated, agents enabled/disabled).
  Site build not started yet — awaiting go-ahead / next message.
- Agent: none yet — will route to Odin via NickFury when the build starts.
- Started: 2026-09-12

### USER DECISIONS (confirmed — do NOT re-ask)
1. Port the reference project's code/structure exactly — do not redesign or
   rebuild from a `skills/web-design/` recipe; this is an explicit reuse of
   user-supplied reference code (also satisfies the "no hand-authored 3D"
   rule — the Three.js/GLSL scenes are copied, not authored from scratch).
2. Stack: Next.js, frontend-only (no database).
3. Agents: NickFury + Odin only (Vision/Natasha/Hulk/Groot/IronMan/BlackPanther
   all declined at init — re-run `/initialize` to add any of them later).
4. Skills: Git, Docker, Modern Frontend (+ always-on Web Design, Database
   Safety, Security Baseline). Jira/ClickUp/AWS not enabled.

## Blockers
None currently. Logo is only available as an inline chat image — no file path
yet, so exact colors are an estimate until the file is saved or its path shared.

## Pending Decisions
- Exact section-by-section content mapping (About/Experience/Certifications/
  Work/Connect → shop story/services/dealer badges/showcase/visit-us) — left
  to the build task, not fixed here.
- Deploy target (likely Vercel) — decide before first deploy; no Groot agent
  active to own this yet.
- Real bicycle-brand names to feature in "Brands We Carry" — ask the user
  which brands the shop actually carries before inventing any.

## Credentials Injected
None — frontend-only, no keys needed for this task.

## Notes
- This `.claude/` folder previously carried stale, non-matching state from two
  other projects (ByteSetu, TechVenta) with no code present in the working
  directory (`E:\laragon\www\CW` contained only `.claude/`). User explicitly
  chose "treat as fresh" — all `doc/*.md`, this file, and `memory/root.md`
  were rewritten for Cycle Wala; nothing from the prior state was carried
  forward as fact.
- Reference project confirmed real and inspected directly (not just described
  secondhand): `E:\laragon\www\-Gireesh-Portfolio` — Next.js 16, React 19,
  TS, gsap, lenis, three. Tokens sampled from its `app/globals.css` and
  `app/layout.tsx` — see `doc/brandpack.md` for exact values ported.

## Last Update
2026-09-12
