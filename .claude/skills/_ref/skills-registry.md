# Skills Registry

> Single source of truth for all skills. NickFury checks here before creating new skills.

## Global Skills

| Skill | File | Credentials | Used By | Status |
|-------|------|-------------|---------|--------|
| Git | `_global/git.md` | No | All | Active |
| Docker | `_global/docker.md` | No | All | Active |
| Jira | `_global/jira.md` | Yes | NickFury, Natasha | Inactive |
| ClickUp | `_global/clickup.md` | Connector preferred (no key needed); REST fallback needs key | NickFury | Inactive |
| AWS | `_global/aws.md` | Yes | Odin | Inactive |
| Modern Frontend | `_global/modern-frontend.md` | No | Odin | Active |
| Web Design Library | `web-design/INDEX.md` (88 vendored recipes from MengTo/Skills — aesthetic directions, layouts, scroll/motion choreography, WebGL/shader fallbacks, finishing detail, page types). **The primary section system for every website build**, with `build-awwwards-quality-sites/` as the mandatory whole-site umbrella. **Not the hero source** — that's 21st.dev / Aceternity / React Bits. | No | Odin (**scanned first on every website build**; component libraries only fill drop-in gaps) | Active |
| Database Safety | `_global/database-safety.md` | No | N/A — frontend-only project; kept active per framework policy | Active |
| Security Baseline | `_global/security-baseline.md` | No | All | Active |
| Audio Generation | `_global/audio-generation.md` | Optional (HF_TOKEN) | IronMan, BlackPanther (both disabled) | Inactive |

## Agent-Specific Skills

| Skill | File | Owner |
|-------|------|-------|
| Orchestration | `nickfury/orchestration.md` | NickFury |
| SSO | `odin/sso.md` | Odin |
| Page Optimize | `odin/page-optimize.md` | Odin |
| Frontend Essentials | `odin/frontend-essentials.md` | Odin |
| Content Research | `odin/content-research.md` | Odin |
| Content Quality & Anti-Fabrication | `odin/content-quality.md` | Odin |
| External Tool Selection | `odin/tool-selection.md` | Odin |

> IronMan, Vision, BlackPanther, Natasha, Hulk, Groot disabled at `/initialize`
> (2026-09-12) — their agent skills moved to `skills/_disabled/`. Re-run
> `/initialize` → "update agent + skill selection only" to re-enable.

## Active Global Skills
<!-- /initialize 2026-09-12 — Cycle Wala (new project, Next.js, frontend-only) -->
- **Git** — `_global/git.md`
- **Docker** — `_global/docker.md`
- **Modern Frontend** — `_global/modern-frontend.md` (Odin active)
- **Web Design Library** — `web-design/INDEX.md` (always active — primary section system)
- **Database Safety** — `_global/database-safety.md` (always active)
- **Security Baseline** — `_global/security-baseline.md` (always active)

Not enabled: Jira, ClickUp, AWS.

## Skill Creation Log
<!-- NickFury logs new skills here -->
[2026-09-03] **Web-design library = primary section system + `/initialize`
design-direction flow + rich brandpack.** Three linked changes, no new skill
file: (1) `skills/web-design/` recipes now drive every below-the-fold section on
a website build, with `build-awwwards-quality-sites/` as the mandatory
whole-site art-direction + motion umbrella; component libraries (Aceternity
sections, Magic UI, React Bits text, Motion Primitives / Cult UI / Origin UI)
only fill a drop-in gap a recipe leaves; hero stays locked to 21st.dev /
Aceternity / React Bits. (2) Hardened `### The agent does not model or code 3D`
in `modern-frontend.md` — never from a blank file (mesh / GLB / Three.js / GLSL /
WebGPU / animated canvas); sources broadened to "any reputable free gallery,
pre-built only"; added the `build-awwwards-quality-sites` §5 override (its
hand-written shader canvas is disallowed here). (3) New **brandpack gate** —
check every recipe/component against `doc/brandpack.md` before building; a
look-clash is stop-and-reconcile. (4) `/initialize` `brand` question rewritten
as **Brand & Design Direction**: new-project mode generates **3 HTML
style-guide mockups** (`doc/brand-previews/option-{a,b,c}.html`), user picks one
(or **Skip**), iterates on the chosen file, then a **rich `doc/brandpack.md`**
is written (18 sections modelled on a supplied real-world example — token
sections concrete, component-implementation sections `[TBD]` until built);
existing-project mode reverse-engineers the token system + Known Issues from the
code and confirms via one preview. Files touched: `commands/initialize.md`,
`doc/brandpack.md`, `skills/_global/modern-frontend.md`, `agents/odin.md`,
`skills/web-design/INDEX.md`, `CLAUDE.md`, `doc/example-workflows.md`,
`agents/nickfury.md`, `skills/nickfury/orchestration.md`, this registry.
[2026-09-03] **Hero pinned to three free component libraries.** `modern-frontend.md`
reworked so the landing hero is ALWAYS one ready component from **21st.dev,
Aceternity, or React Bits** (free tier — Aceternity templates are paid, never
those), chosen by fit to the site's register + goal. The prior "every hero is a
hand-built Three.js scroll world" default is retired — a scroll-through 3D hero
is now just an Aceternity scroll component or a React Bits 3D background, used
when the content wants it. New `## Animated sections` section: section
animations come from the same three libraries first, with Magic UI /
`skills/web-design/` recipes / Spline co-equal for sections only (never the
hero). `skills/web-design/INDEX.md` is still scanned first — now for aesthetic
direction + scroll choreography + finishing detail, not the hero. Section
`## The hero is always a 3D scroll experience` renamed →
`## The hero — always a component from 21st.dev, Aceternity, or React Bits`
(anchor updated in `agents/odin.md` Rule 0 + workflow, `doc/brandpack.md`,
`commands/initialize.md` brandpack template, `CLAUDE.md` Map, `README.md`,
`doc/example-workflows.md`, `tools/index.md`). No new skill file.
[2026-08-29] Removed the **Strange** agent and the `3d-motion` / `3d-scrollbase`
skills entirely (hard delete: `agents/strange.md`, `skills/strange/`,
`skills/3d-scrollbase/`, `skills/_global/3d-motion.md`,
`skills/_global/3d-scrollbase.md`). The 3D / scroll / shader hero is now
**always sourced** — a component or ready AI prompt from a library (Aceternity,
React Bits, Magic UI, 21st.dev, **motionsites.ai**, Spline) or a
`skills/web-design/` recipe followed step by step — never `/3d-scrollbase`,
never hand-authored, never escalated to a sub-agent. Every "create a website"
task now scans `skills/web-design/INDEX.md` first (added to `CLAUDE.md` Map,
`agents/odin.md` Rule 0). Delegation matrices (`agents/nickfury.md`,
`skills/nickfury/orchestration.md`), `skills/_ref/agent-manifests.md`,
`avengerarmy.json`, `commands/initialize.md`, `doc/brandpack.md`,
`doc/example-workflows.md`, `credentials/credentials.md`, `README.md`,
`SETUP.md`, and `skills/web-design/INDEX.md` updated to match.
[2026-08-19] Rebuilt 3D Scrollbase end-to-end as a full skill at `skills/3d-scrollbase` (invoke `/3d-scrollbase`), porting lets-scroll-main's interview-driven structure (subject/brand/art-direction/camera-style/journey interview, camera-architecture step, assembly, QA, gotchas, references/) but re-engineered on real-time Three.js + GSAP ScrollTrigger instead of Higgsfield/Monid AI image+video generation. Zero API keys, zero per-build cost. Superseded the earlier paid `lets-scroll` install (removed) and the short Three.js placeholder note.
[2026-08-27] Created `_global/modern-frontend.md` — the tiered modern-UI build playbook (Tailwind + shadcn/ui + Motion always; GSAP/ScrollTrigger/Lenis for scroll briefs; Three.js/R3F for one accent scene, Strange/`/3d-scrollbase` beyond that), free animated component sourcing (Aceternity, Magic UI, 21st.dev, React Bits, Cult UI, Motion Primitives, Origin UI), a hard "No Old UI" anti-pattern list, and `ui-ux-pro-max-cli` documented as an optional (never auto-run) design accelerator. Paired with the same-day rescope: **Odin** = full frontend builder (owns all UI construction — sites, pages, components, design systems); **Vision** = minimal surgical changes only (fixes, tweaks, wire-ups, one component into an existing system). Delegation matrices in `agents/nickfury.md` + `skills/nickfury/orchestration.md` updated to route builds→Odin, changes→Vision.
[2026-08-28] Revised `_global/modern-frontend.md` after the army shipped a plain site + hand-coded a bad Three.js hero: the default is now **"signature animated hero + every section animates, sourced not hand-rolled."** Every landing page gets a 3D/scroll/WebGL hero *copied from a component library* (Aceternity/React Bits/Magic UI/21st.dev/Spline), rethemed, wired to real content — added `## The hero is always a signature animation`, `## Sourcing components — the web-search workflow` (search → shortlist → copy → retheme → verify on live dev URL), a real named-component catalog, and a "pick the hero style from the content register" guide. Hand-building canvas/3D = last resort. `/3d-scrollbase` clarified as bespoke-full-scroll-cinematic-only. `agents/odin.md` Rule 0 + workflow, `agents/hulk.md` step 4, brandpack template, `_global/3d-scrollbase.md` updated to match. Scope: full 3D hero on home/landing pages; secondary pages get a lighter animated header.
[2026-08-28] Vendored the **Web Design Library** — 88 frontend recipes from [MengTo/Skills](https://github.com/MengTo/Skills) `agent-skills/web-design` (Design+Code, MIT) into `skills/web-design/`, index at `skills/web-design/INDEX.md` (7 categories: aesthetic directions, page-type playbooks, layout detail, scroll/motion systems, WebGL/shader heroes, finishing details, library refs). **Security-reviewed before adding** (user-gated): cloned + inspected every executable file — no `eval`/`new Function`, no `child_process` in skill files, no credential/cookie/storage exfil, zero external `<script src>` in demos, bundled libs (three.js ×6 identical hash, GSAP, ScrollTrigger) are stock, the `atob` usage is a `connect-src 'none'` iframe-sandbox mechanism not obfuscation, no prompt injection across 208 md files. Demo folders stripped (86MB → 1.6MB). `skills/_global/modern-frontend.md` + `agents/odin.md` workflow wired to scan `INDEX.md` FIRST (local, vetted) before web-searching.
[2026-08-28] Made `modern-frontend.md` explicitly **story-first for a new website**: `## Website intake` (Odin collects logo + goal + audience + real content before building — asks the user for the logo), `## Story spine` (the scroll is a narrative: hook→context→approach→proof→outcome→CTA from the real goal; each section's animation dramatizes its beat; motion with no narrative job is cut), and hero section → `## The hero is always a 3D scroll experience` (home hero is always a real WebGL/Three.js scroll experience, subject = a metaphor for what the company does, intensity calibrated to the register — "crazy but on-brand"). `agents/odin.md` Rule 0 + workflow (intake step + write-the-story-spine step), brandpack Design Principles (both `commands/initialize.md` template + `doc/brandpack.md`), and `_global/3d-scrollbase.md` updated to match.
[2026-08-28] Added the hard rule **`### The agent does not model or code 3D`** to `modern-frontend.md` — 3D is only ever a ready component (Aceternity / React Bits / Magic UI / 21st.dev), a `skills/web-design/` recipe followed step-by-step, `/3d-scrollbase`, a free CC0 model (Poly Haven / Kenney / Quaternius) dropped in, or a Spline embed. Never a hand-authored mesh/GLB or a Three.js scene from a blank file; nothing fits after a real search → Strange. Threaded through `agents/odin.md` Rule 0, brandpack Design Principles, `_global/3d-scrollbase.md`, and `skills/web-design/INDEX.md`.
[2026-08-31] Added `_global/audio-generation.md` — Chatterbox TTS (open-source,
23-language multilingual voice cloning). Wired into IronMan and BlackPanther
(`agents/ironman.md`, `agents/blackpanther.md`, `skills/_ref/agent-manifests.md`
Global lists updated). `tools/index.md` and `credentials/credentials.md`
updated to match.

## Rules
- Search this file + `_global/` + agent folders before creating
- New skills must be atomic (one capability)
- Global skills → `_global/`. Agent skills → `{agent}/`
- Update this index on every addition
