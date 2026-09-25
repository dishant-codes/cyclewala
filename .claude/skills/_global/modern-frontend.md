# Skill: Modern Frontend

> How the army builds a site: **animated by default; the landing hero is
> ALWAYS a ready component from one of exactly three free libraries —
> 21st.dev, Aceternity, or React Bits — chosen to fit the brief; every
> section that animates is also a sourced component, never a hand-rolled
> effect.** Odin's playbook for any page/site/section/redesign/design-system
> build. Vision reads only `## No Old UI` and `## Component catalog` (for
> dropping one component into an existing system).

## Purpose

Research (`skills/odin/content-research.md`) decides *what* to build.
`skills/odin/frontend-essentials.md` is the coverage checklist. **This skill
decides how it looks and moves** — and its core rule is:

**A site the army builds is never "normal". It's a story:** the scroll tells
the brand's narrative (`## Story spine`), the landing hero is always a ready
animated component from **21st.dev, Aceternity, or React Bits**, chosen to
express what the company does (`## The hero — always a component from
21st.dev, Aceternity, or React Bits`), and every section's animation
dramatizes its story beat — all derived from the site's goal + content
(`## Website intake`), all sourced from component libraries or
`skills/web-design/` recipes, never hand-built from scratch.

Use it when the task **creates or redesigns** UI. For a code-only change
(copy edit, bug fix, padding) that's a Vision task — Vision needs only
`## No Old UI` + `## Component catalog`.

## Prerequisites

- `doc/brandpack.md` — Design Principles + Libraries & Frameworks are the
  project's binding choices; this skill is the generic menu, the brandpack is
  what this project picked. Conflict → brandpack wins (propose an update via
  NickFury rather than building around it).
- `doc/project-overview.md#stack` — the catalog assumes React/Tailwind. On
  another stack use `## Non-React stacks`; the *direction* holds, the packages
  change.
- **Real web search/fetch tooling** (`WebSearch`/`WebFetch`) — this skill
  depends on it. See `skills/odin/tool-selection.md`. If it's genuinely
  unavailable, say so and use the catalog below from memory — never invent a
  component name or install command.

## No Old UI

The bar: a visitor reads the page as *deliberately designed this year*, not a
framework default someone forgot to theme.

**Reject these — the "old UI" tell:**
- Unstyled / barely-styled Bootstrap or Material defaults; the stock MUI
  palette; default browser form controls on a marketing page.
- **A static hero** — a headline + subhead + two buttons + a flat screenshot,
  no motion, no depth. This is the #1 thing the army must stop shipping. Every
  landing hero is a sourced animated component from 21st.dev / Aceternity /
  React Bits (`## The hero — always a component from 21st.dev, Aceternity, or
  React Bits`).
- A motionless page — no entrance animation, no scroll reveal, no hover
  feedback, no state transitions.
- Stock purple→blue diagonal gradients, `box-shadow: 0 1px 3px` on every
  card, one evenly-spaced three-column feature grid as the only layout idea.
- shadcn/ui pasted in with zero theming — the demo look, shipped.
- **Any hand-authored 3D** — a modelled mesh, a generated GLB, a Three.js
  scene written from a blank file. 3D is only ever a ready component, a
  `skills/web-design/` recipe, a free CC0 model, or a Spline embed
  (`### The agent does not model or code 3D`).
- Placeholder-grey everything; no type scale; one font weight.

**"Modern" here means all of:**
- A hero that's a real animated component from 21st.dev / Aceternity / React
  Bits (`## The hero`), plus every section built from a `skills/web-design/`
  recipe (`## Animated sections`).
- A real layout point of view — bento, editorial/asymmetric, oversized/kinetic
  type, considered type scale, generous negative space.
- A surface language — glass, layered depth, grain, gradient mesh, dark-first,
  or a strong flat-graphic direction — chosen for the brand, not defaulted.
- Motion in every section (scroll reveal, animated cards, marquee, sticky
  scroll, tracing beam, count-up, text effects).
- Details: `:focus-visible`, custom selection color, tuned easing (never
  linear/`ease`), consistent radius + spacing tokens.

Rich ≠ heavy. A fast, tasteful page with one strong hero idea and crisp
section motion beats an effects soup. `## Performance` is not negotiable
against "it looks cool".

## Website intake — collect this before building

When the task is "create / build a website" (not a single-page or a tweak),
**stop and gather the brief first** — the whole design is derived from it, so
guessing here wastes the build:

1. **Logo** — ask the user to share the file(s) (SVG/PNG, light + dark if
   they have them). If none exists yet, use a clean typographic wordmark as a
   placeholder and flag it in the deliverable — never invent a logo mark.
2. **Goal** — the ONE outcome the site must drive. "Get demo requests." "Look
   credible enough to win enterprise RFPs." "Get developers to sign up."
   Everything downstream serves this.
3. **Audience** — who lands here, what they already believe, the one objection
   they arrive with.
4. **Content** — the real material: what the company does, its offerings /
   services / process, real proof (numbers, client names, case results),
   and anything the user pasted or a provided doc (`doc/project-overview.md`,
   an uploaded profile/brief). No invented stats, clients, or quotes
   (`skills/odin/content-quality.md`).
5. **Tone + references** — corporate / playful / editorial / technical; any
   sites they admire.

If the user already gave some of this in their prompt, use it — only ask for
what's missing (especially the logo and the goal).

## Story spine — the site is a narrative, not a pile of sections

**The scroll from top to bottom tells the brand's story.** Derive a spine from
the goal and content, then make every section a beat in it:

| Beat | What it does | Typical section |
|---|---|---|
| **Hook** | the one line + the 3D moment that says what this is | hero (see below) |
| **Context / problem** | the world the audience lives in, the friction | intro / "why this matters" |
| **Approach** | how the company solves it — its actual method | "what we do" / process / capabilities |
| **Proof** | evidence it works | clients, numbers, case studies, work |
| **Outcome / vision** | what changes for the customer; where this is going | outcomes / scale / "built to grow" |
| **Ask** | the single next step toward the goal | CTA |

Adapt the beats to the real goal (a portfolio's spine ≠ a SaaS's ≠ a
manufacturer's). Then: **each section's animation dramatizes its beat.**
"We connect suppliers to plants" → a motion that visually links two things on
scroll. "We scale with you" → something that multiplies / extends as you
scroll. **An animation with no narrative job gets cut** — this is the
difference between a story and an effects reel. Full-animated ≠ everything
wiggling; it means every beat lands with motion that means something.

## The hero — always a component from 21st.dev, Aceternity, or React Bits

**Hard rule.** The landing / home hero is **always one ready component copied
from exactly one of these three free libraries.** No exceptions, no
hand-built hero, no "I'll assemble this one myself". It is the Hook beat and
the single most important thing on the site — never wait to be asked.

| Library | Where | Hero material |
|---|---|---|
| **21st.dev** | `21st.dev` | Whole animated hero blocks + backgrounds from many authors — install via the shadcn CLI |
| **Aceternity UI** | `ui.aceternity.com` | Container Scroll, Hero Parallax, Google Gemini Effect, Lamp Effect, Spotlight, Background Beams / Boxes, Aurora / Wavy / Vortex backgrounds, GitHub Globe, 3D Card / 3D Pin |
| **React Bits** | `reactbits.dev` | WebGL / OGL / Three.js backgrounds: Aurora, Hyperspeed, Threads, Silk, Iridescence, LiquidChrome, Balatro, Galaxy, Beams, Dark Veil, Waves, Lightning, Ballpit, Ferrofluid |

- **Free tier only.** Aceternity *components* are MIT/free — its *templates*
  are paid, never pull those. React Bits is MIT. 21st.dev is a marketplace —
  use components published free (a working `npx shadcn@latest add` URL is the
  tell); license-check the specific component before committing.
- **The component is chosen by fit, not by rule.** Match the site's register
  (`### Pick the hero from the content`), the goal, and the one idea the hero
  must express about what the company does. Often that's a WebGL background
  (React Bits Aurora / Hyperspeed / Threads / Iridescence; Aceternity Aurora /
  Beams); sometimes a scroll-reveal block (Aceternity Container Scroll /
  Gemini Effect / Macbook Scroll); sometimes a 21st.dev animated hero block.
  A flat-but-animated hero from one of the three is allowed when it genuinely
  serves the goal better than a 3D one — **a motionless hero never is.**
- **The old "every hero is a hand-built Three.js scroll world" default is
  retired.** A scroll-through 3D experience is now just one option, taken from
  a component in these three libraries (Aceternity scroll components, React
  Bits 3D backgrounds), picked only when the content wants it — never
  authored from a blank file, never escalated.
- **Own the code.** Copy the source into the project's components dir (or
  `npx shadcn@latest add "<registry url>"`), retheme every color / radius /
  font / easing to `doc/brandpack.md` tokens, wire the real copy. No runtime
  dependency on a component gallery, no demo colors, no demo strings.
- **If none of the three fit** after a real search of all three: use the
  closest fit from them and note the compromise in the build report. Only
  then, and only with the user's OK, reach for Magic UI / Spline / a
  `skills/web-design/` recipe. Never a blank file, never a hand-authored
  scene.

**Secondary pages** (about, services, contact): a lighter animated header — a
`skills/web-design/` masthead recipe (e.g. `staggered-word-reveal`,
`masked-reveal`) or a smaller component from the three libraries (a React Bits
text component, an Aceternity Spotlight / Background Beams band) — plus fully
animated sections. Not a second full hero. The home hero is the set piece.

**Every content section, every page:** an animation that carries its story
beat — see `## Animated sections`. A plain static `<section>` is a bug.

### The agent does not model or code 3D

**Hard rule — no softening, no "just this once".** The agent **never**, from a
blank file, writes: a 3D model or mesh, a GLB/GLTF, a Three.js / R3F scene, a
GLSL or WebGPU shader, or an animated `<canvas>` / WebGL effect. Every 3D,
shader, or generative-visual element on the page is **pre-built and free**,
from exactly one of these:

1. **A hero component from the three libraries** (`## The hero` above) —
   Aceternity 3D / Globe / Container Scroll components, React Bits WebGL
   backgrounds, a 21st.dev 3D hero block. Drop it in, retheme, wire real copy.
   The default; covers almost every case.
2. **A `skills/web-design/` recipe** followed step by step (sections /
   choreography, or a hero only after `## The hero`'s fallback clause) —
   `build-threejs-scroll-worlds`, `scroll-world-storytelling`,
   `add-mouse-driven-orbit`, `globe-particles`, `gooey-blob-system`, etc. Some
   assemble primitives *in code as the recipe instructs* — that is the skill
   doing it, and is allowed. Following the recipe ≠ freestyling 3D.
3. **Another free, pre-built component from any reputable gallery** — free tier,
   license-checked, source copied in and rethemed. Pre-built only; a gallery is
   not a licence to hand-write "something similar".
4. **A free CC0 3D model** when a real object is needed — Poly Haven, Kenney,
   Quaternius, Sketchfab's CC0 filter. Downloaded and dropped in, **never
   modelled by the agent**. Normalize scale/origin on import.
5. **An existing public Spline scene** embedded via `@splinetool/react-spline`
   — a scene the user provides or a free community one, not one the agent
   "designs".

**`build-awwwards-quality-sites` override:** that skill's §5 allows a "justified
hand-written Three.js shader canvas" — **AvengerArmy does not.** Even there the
canvas is a sourced component (React Bits, a `skills/web-design/` recipe), never
written from a blank file.

If none can express what's needed, use the closest sourced option and note the
compromise in the build report — **never** hand-author it. If the concept is
genuinely un-sourceable, say so to the user and let them decide.

Same rule for section animations: a `skills/web-design/` recipe or a sourced
component every time — never a hand-written canvas/WebGL effect.

### Pick the hero from the content

The hero must *mean something* about the product — an abstract of what the
company does, not decoration bolted on. Match the register to pick which
component from the three libraries, and at what intensity:

| Site register | Hero component (from 21st.dev / Aceternity / React Bits) — subject & intensity |
|---|---|
| Serious / industrial / B2B / logistics / finance | **Restrained**: React Bits Threads / Silk / Waves, or Aceternity Background Beams / Spotlight / Lamp as a quiet field behind precise type. Or Aceternity Container Scroll / Macbook Scroll for a slow product reveal. A 21st.dev restrained 3D hero block. Aesthetic direction from `skills/web-design/INDEX.md`: `dark-glass-clean-layout`, `light-mode-paper-technical`, `split-layout-technical`. |
| SaaS / product / dashboard marketing | Aceternity Container Scroll / Google Gemini Effect revealing the product; React Bits Aurora / Iridescence as the ambient bed; a 21st.dev product hero block. Aesthetic: `product-proof-saas`, `tech-green-dark-mode-modern`. |
| Tech / startup / crypto / AI / creative / agency | **Loud**: React Bits Hyperspeed / Galaxy / Lightning / LiquidChrome / Balatro / Dark Veil, Aceternity Vortex / Aurora / Wavy Background / Meteors. Dense, emissive, bold. Aesthetic: `bright-green-tech-system-webgl`, `mesh-gradient-dark-blue-clean`. |
| Portfolio / studio / editorial | Aceternity Hero Parallax / Parallax Scroll of the work itself; React Bits animated text backgrounds; a 21st.dev editorial hero. Pair with `masked-reveal` + `staggered-word-reveal` (web-design recipes) for the copy layer. Aesthetic: `editorial-portfolio-chapters`, `documentary-brutalist-agency`. |

Calibrate *intensity* to the register — a serious brand's hero is restrained
and precise; a creative studio's is loud. **Which** of the three libraries and
**which** component is a fit decision every build; that the hero is one of
their components is not.

## Animated sections

Every content section animates to carry its story beat (`## Story spine`).
The animation is **sourced**, never a hand-written effect. The web-design
library is the section system — component libraries only fill a drop-in gap.
Source order:

1. **`skills/web-design/build-awwwards-quality-sites/SKILL.md` — the umbrella.**
   On every website build this runs first: it sets the art direction, the
   section sequence, the honest-asset system, and the GSAP + one-smooth-scroll
   motion system that every section obeys. Not optional.
2. **A `skills/web-design/` recipe per section** — `animation-on-scroll`,
   `scroll-progress-timeline`, `scroll-scrubbed-visual-sequence`,
   `staggered-word-reveal`, `masked-reveal`, `marquee-loop`,
   `cinematic-scroll-storytelling`, plus the §3 layout-detail and §6
   finishing-detail recipes. This is the **primary** source for section motion.
3. **Component code to fill a specific drop-in gap a recipe leaves** — from the
   three hero libraries (Aceternity Sticky Scroll Reveal / Tracing Beam /
   Timeline / Bento / Text Generate / Meteors; React Bits animated text: Split
   Text, Blur Text, Count Up, Gradient Text; 21st.dev feature / pricing / CTA
   blocks) or, still sections-only, **Magic UI / Motion Primitives / Cult UI /
   Origin UI**. Use these for a *piece* a recipe needs, not as the section system.
4. **Scroll choreography** (pinning, scrub, timeline) is always GSAP +
   ScrollTrigger + **one** smooth-scroll engine (Lenis) via
   `skills/web-design/cinematic-gsap-lenis-motion-system/`.
5. **One embedded 3D object** in a section when the content calls for it →
   Spline (a public/user scene) or a `skills/web-design/` WebGL recipe — never
   authored (`### The agent does not model or code 3D`).

## Sourcing components — the workflow

Run this every build. It is the point of this skill.

1. **Brief yourself.** Read `doc/brandpack.md` end to end — the token system
   (§1–5), the Component Library & Sourcing rules (§14), the Design Principles
   (§15). Name the site's register (`### Pick the hero from the content`) and
   the one idea the hero must express about what the company does.
2. **Run `build-awwwards-quality-sites` first.** On a "create a website" task,
   `skills/web-design/build-awwwards-quality-sites/SKILL.md` is the whole-site
   art-direction + section-sequence + motion umbrella — work through it before
   any section. **AvengerArmy override:** its §5 permits a "justified
   hand-written Three.js shader canvas" — AvengerArmy does not. That canvas is
   still a sourced component (React Bits / a recipe), never authored.
3. **Scan `skills/web-design/INDEX.md`** — pick **one** aesthetic direction
   (§1), and the section techniques (§3 layout / §4 scroll-motion) + finishing
   detail (§6) you'll use. The library is the **primary section system**;
   follow each recipe's `SKILL.md`. It does **not** supply the hero.
4. **Get the hero component** from **21st.dev, Aceternity, or React Bits**
   (`## The hero`). Use `WebSearch`/`WebFetch` to open the component's current
   page and copy its source / registry URL — don't trust memory for props.
   Query patterns:
   - `aceternity ui <effect>` — "container scroll", "gemini effect", "lamp",
     "background beams", "aurora background", "vortex"
   - `react bits <name>` / `react bits backgrounds` — Aurora, Hyperspeed,
     Threads, Silk, Iridescence, LiquidChrome, Balatro, Galaxy, Dark Veil,
     Waves, Lightning, Ballpit
   - `21st.dev <hero | 3d hero | section type>` — marketplace, whole blocks
5. **Pull section *component code* only to fill a drop-in gap** a recipe leaves
   — `## Animated sections` step 3. Not as the section system.
6. **Brandpack gate — check every recipe and component against
   `doc/brandpack.md` before you build with it.** A recipe's palette / surface /
   type / motion character that clashes with the brandpack tokens or the
   project's existing UI is **stop-and-reconcile**: pick a different recipe, or
   propose a brandpack update via NickFury. Never retheme a fundamentally
   off-brand direction into place, never "build it anyway".
7. **Shortlist.** 1 hero (from the three) + the aesthetic direction + one
   recipe (or gap-fill component) per story beat that cohere. Don't stitch five
   aesthetics together. **Every item is a real recipe or component you found** —
   never "I'll build this part myself". A gap with no source → closest sourced
   fit + compromise noted, never a blank file.
8. **Bring the code in.** Copy component source into the project's components
   dir (`doc/filestructure.md`), or `npx shadcn@latest add "<registry url>"`
   where offered; for a `skills/web-design/` recipe, follow its `SKILL.md`
   steps. Own the code — no runtime dependency on a component gallery.
9. **Retheme + wire real content.** Map colors/radius/fonts/easing to brandpack
   tokens. Replace every demo string, demo image, and demo color with the
   site's real content. No lorem, no placeholder data, no `indigo-500`.
10. **Install deps** (list + confirm first — `## Install discipline`). Most
    Aceternity components need `motion`; React Bits WebGL backgrounds need
    `three` or `ogl`; the awwwards motion system needs `gsap` + `lenis`;
    Spline needs `@splinetool/react-spline` `@splinetool/runtime`.
11. **Verify on the running dev URL — actually look.** Load the page in a
    browser (the project's preview/dev-server tooling — see the `run` skill),
    scroll it top to bottom: the hero renders and holds ~60fps, every section's
    animation fires on scroll, nothing janks, mobile is fine, and
    `prefers-reduced-motion` shows a clean static fallback. A screenshot / a
    described observation — never "it should work".
12. **Log what you used** — source (library · component · URL, or
    `skills/web-design/<name>`) — to the build output and `memory/odin.md`.

## Component catalog

**The umbrella:** `skills/web-design/build-awwwards-quality-sites/` governs
every website build — art direction, section sequence, honest assets, one
motion system. Run it first.

**The section system:** `skills/web-design/INDEX.md` — 88 vendored, offline,
security-reviewed recipes (aesthetics §1, layout §3, scroll/motion §4,
finishing §6). Technique + art direction, not drop-in code. This is where
sections come from; component libraries below only fill a drop-in gap.

**The hero:** never from the library — always one component from 21st.dev /
Aceternity / React Bits (next table).

Verify a component's current API by fetching its page before wiring it —
don't trust memory for props.

### The hero — one of exactly these three (free tier only)

The landing hero is always a component from this table
(`## The hero — always a component from 21st.dev, Aceternity, or React Bits`).

| Library | What's there | Pull |
|---|---|---|
| **21st.dev** (`21st.dev`) | Marketplace — whole animated hero blocks, 3D hero blocks, backgrounds, section blocks, from many authors. Use components published free. | `npx shadcn@latest add "https://21st.dev/r/<author>/<name>"` |
| **Aceternity UI** (`ui.aceternity.com`) | Scroll: Container Scroll Animation, Hero Parallax, Parallax Scroll, Google Gemini Effect, Macbook Scroll, Sticky Scroll Reveal, Tracing Beam. Focus/light: Lamp Effect, Spotlight, Background Beams, Background Boxes. Ambient: Aurora Background, Wavy Background, Vortex, Meteors, Sparkles, Shooting Stars. 3D: 3D Card Effect, 3D Pin, GitHub Globe. **Components MIT/free; templates are paid — never pull those.** | copy from site, or `npx shadcn@latest add "<registry url>"` where shown |
| **React Bits** (`reactbits.dev`) | WebGL/OGL/Three.js backgrounds: Aurora, Hyperspeed, Threads, Silk, Iridescence, LiquidChrome, Balatro, Galaxy, Beams, Dark Veil, Waves, Dot Grid, Squares, Ballpit, Lightning, Ferrofluid. Plus text/animation components. "Background Studio" previews them. MIT. | copy from site, or its CLI |

### Section animation — three libraries first, then these (sections only)

Not for the hero. See `## Animated sections` for the source order.

| Library | What's there | Pull |
|---|---|---|
| **Magic UI** (`magicui.design`) | Animated Beam, Marquee, Bento Grid, Globe, Particles, Meteors, Warp Background, Retro Grid, Ripple, Orbiting Circles, Dot/Grid Pattern, text: Text Animate, Blur Fade, Line Shadow, Aurora Text, Number Ticker. | `npx shadcn@latest add "https://magicui.design/r/<name>"` |
| **Spline** (`spline.design`) | Drag-and-drop 3D scenes → embed a real 3D *object* in a section (a product, an abstract form) when the three libraries can't. A community/user scene, never one the agent designs. | `npm i @splinetool/react-spline @splinetool/runtime`, `<Spline scene="<url>" />` |
| **`skills/web-design/` recipes** | Scroll/motion systems (§4), aesthetic technique (§1), finishing detail (§6) — followed step by step. | open the folder's `SKILL.md` |

### Sections / primitives

| Library | Best for | Pull |
|---|---|---|
| **shadcn/ui** | Accessible primitives, the base layer | `npx shadcn@latest add <component>` |
| **Cult UI**, **Motion Primitives**, **Origin UI**, **Kokonut UI** | More free shadcn-compatible animated section sets | shadcn registry URL or copy |
| **Motion** (`motion`, formerly Framer Motion) | The animation engine everything above leans on — entrance, layout, `AnimatePresence`, scroll (`useScroll`/`useTransform`) | `npm i motion` |
| **GSAP + ScrollTrigger + Lenis** | Heavier scroll choreography (pinning, scrub, timeline). One scroll source only — Lenis owns it. Recipe: `skills/web-design/cinematic-gsap-lenis-motion-system/SKILL.md`. | `npm i gsap lenis` |

Rules:
1. **One primary aesthetic per project.** Pull individual pieces from others
   only to fill a real gap.
2. **Retheme on the way in** — brand tokens, never demo colors.
3. **Own the code** — copied into the repo, not a gallery dependency.
4. **Audit accessibility** — copy-paste animated components routinely miss
   focus management, `aria-*`, reduced-motion, keyboard support. Fix before
   shipping (`## Accessibility`).
5. **License-check** the specific component (mostly MIT/free; a few libraries
   gate *templates* behind payment while components stay free — don't pull a
   paid template).

### v0.dev (Vercel)

Free tier, usage-limited. Use it to **generate a first-draft scaffold** of a
layout, then rebuild it against the project's components and tokens. Its
output over-nests, hard-codes, and skips a11y/motion — a draft, not drop-in.

### ui-ux-pro-max-cli (optional accelerator — documented, never auto-run)

A free design-intelligence skill: searchable UI styles, palettes, font
pairings, per-stack guidance. Free, no API key, needs Python 3.

```bash
npm install -g ui-ux-pro-max-cli
uipro init --ai claude      # installs into .claude/skills/ui-ux-pro-max/
```

- **Never install it automatically and never prompt the user to.** If
  `.claude/skills/ui-ux-pro-max/` already exists, use it for style/palette/font
  selection. This skill works fully without it.

## Tiered stack

The **floor** for every build is Tier 1 **plus the sourced hero** — you never
ship below that. Higher tiers add depth when the content wants it.

### Tier 1 — always

Tailwind CSS (brand tokens, real type scale) · shadcn/ui primitives (rethemed)
· the `build-awwwards-quality-sites` umbrella + `skills/web-design/` recipes as
the section system (`## Animated sections`) · Motion / GSAP for the motion the
recipes call for.

### Tier 1+ — the hero (also always, on landing pages)

A component from **21st.dev, Aceternity, or React Bits**, chosen to fit the
brief (`## The hero — always a component from 21st.dev, Aceternity, or React
Bits`). Lazy-loaded, reduced-motion fallback, not the LCP blocker.

### Tier 2 — scroll-choreography briefs

GSAP + ScrollTrigger + Lenis for pinned sections / scrubbed timelines /
parallax narratives. One scroll source (Lenis). Recipes:
`skills/web-design/cinematic-gsap-lenis-motion-system/`,
`skills/web-design/gsap/`.

### Tier 3 — bespoke immersive briefs

When the hero's fallback clause has been reached (nothing in the three
libraries fits, user agreed) or a section needs a full scroll-cinematic 3D
world: Three.js / R3F / drei assembled by following a `skills/web-design/`
recipe step by step (`build-threejs-scroll-worlds`,
`scroll-world-storytelling`, `threejs`) plus free CC0 models. **No
hand-authored scenes.** If no recipe can express the concept, tell the user —
the agent does not build it from a blank file.

## Non-React stacks

Direction holds, packages change:
- **Vue** — `@vueuse/motion` / Motion for Vue, GSAP, shadcn-vue, Inspira UI
  (Aceternity-style ports for Vue).
- **Svelte** — Svelte transitions + Motion One, GSAP, shadcn-svelte.
- **Astro** — ships React/Vue/Svelte islands; use the catalog inside an island.
- **Blade / plain HTML** — GSAP + Lenis directly, Alpine.js, Tailwind,
  hand-built sections; Spline embed or a `<script>` shader for the hero.
Confirm the stack actually supports a library before proposing it.

## Install discipline

Before any `npm install`, list exactly what + why, wait for explicit
confirmation — never install silently:

```
Installing: motion, three, @splinetool/react-spline
Reason: Aceternity Container Scroll (motion) for the hero product reveal,
        React Bits Threads (three) as the ambient background, Spline object
        for the "what we manufacture" section
```

Bundle-audit heavy additions (`skills/odin/page-optimize.md`). Three, GSAP,
R3F, Spline are each non-trivial — justify against the content.

## Performance

Rich animation is where LCP/TBT regressions come from. Non-negotiable:
- **Lazy-load the hero WebGL/3D** (`React.lazy` + `Suspense`, or dynamic
  import) — it must not block first paint or become the LCP element.
- **`prefers-reduced-motion`** — every effect (hero included) has a
  reduced/static path. Not optional.
- **Code-split** below-the-fold animated sections and any 3D canvas.
- Compress GLB (Draco/meshopt) + textures (KTX2); pause `useFrame` /
  RAF loops off-screen (IntersectionObserver); cap `devicePixelRatio` ≤ 2 and
  drop postprocessing on mobile.
- **60fps desktop, 30fps+ mid-tier mobile** — test with CPU/GPU throttling.
- Run the **Lighthouse Gate** (`skills/odin/page-optimize.md`) before "done" —
  Performance < 80 is a failure. A heavy hero that tanks the score gets
  swapped for a lighter component, not shipped.

## Accessibility

- Reduced-motion path for every effect (above).
- `:focus-visible` on every interactive element — copy-paste components drop it.
- Keyboard-operable menus/carousels/tabs/dialogs (Radix/shadcn give this;
  hand-rolled animated versions often don't).
- Motion never carries the only copy of information; no flashing/strobing.
- Real DOM for screen readers — 3D/canvas is supplementary.
- Contrast holds over animated/gradient/video backgrounds (test it, don't
  assume — a shader can wash out white text mid-animation).

## Input

A UI build task (site / landing / section / component / design system) plus
`doc/brandpack.md`, `doc/project-overview.md`, and Odin's content research.

## Output

A site where the landing hero is a **component copied from 21st.dev,
Aceternity, or React Bits** — rethemed to brand tokens, wired to real content,
never authored by the agent; the scroll follows the story spine; every section
animates its beat with a sourced component (`## Animated sections`); it holds
framerate and passes the Lighthouse Gate + a11y checklist; and the build
report names every source used (library · component · URL, or
`skills/web-design/<name>`) plus any CC0 model + its license. Anything the
three libraries can't cover is delivered with the closest fit from them, the
compromise noted — the agent never hand-authors the hero.

## Error Handling

| Situation | Response |
|---|---|
| Brandpack Libraries/Principles conflict with this menu | Brandpack wins. Build to it; propose an update via NickFury, don't silently override. |
| A `skills/web-design/` recipe's look (palette, surface, type, motion character) clashes with `doc/brandpack.md` | **Do not build it.** Rethemed-into-place off-brand is still off-brand. Pick a different recipe whose art direction matches the brandpack, or propose a brandpack update via NickFury and wait. Same for a section component. |
| `doc/brandpack.md` token sections are still `[TBD]` (user chose Skip at init) | Stop before building. Ask the user to run the design-direction step (`/initialize` → 3 mockups) or supply tokens now — the brandpack gate has nothing to check against otherwise. |
| Web search/fetch unavailable this session | Say so. Pick a well-known component from the three (e.g. Aceternity Container Scroll, React Bits Aurora / Hyperspeed), state that you couldn't check its current API. Never invent a component or install command. |
| The chosen hero component is a paid Aceternity *template* / a paywalled 21st.dev listing | Use a free component instead — an Aceternity component (not template), a free 21st.dev listing, or a React Bits background. Never pull paid template code. |
| The sourced hero tanks the Lighthouse score | Swap it for a lighter component *from the same three* (a React Bits background with fewer particles via its own props, an Aceternity Spotlight/Beams instead of a heavy WebGL field, a static poster + click-to-animate). Don't ship a failing score, don't hand-roll a "lighter" custom one. |
| Nothing in the three libraries fits the concept | Use the closest fit from them and note the compromise in the build report. Only with the user's OK, then reach for Magic UI / Spline / a `skills/web-design/` recipe. If it's genuinely un-sourceable, tell the user — the agent does not author a scene. |
| A real 3D object/model is needed in a section | Download a **free CC0 model** (Poly Haven / Kenney / Quaternius / Sketchfab CC0), load it via a recipe or a Spline embed, normalize scale/origin. Never model it. |
| Non-React stack | `## Non-React stacks` — keep the direction, swap packages, confirm support first. The three-library rule still holds where ports exist (Inspira UI for Vue); otherwise the closest sourced equivalent, compromise noted. |

## Security Notes

- Copied component code is third-party — skim it before committing; reject
  `dangerouslySetInnerHTML` on unsanitized input, inline `eval`, or a
  phone-home `fetch` (`security/guardrails.md`).
- Don't paste project-confidential content into v0.dev or any external
  generator (`skills/odin/tool-selection.md`).
- Pin versions for `three`/`ogl`/`gsap`/Spline; prefer a known CDN or
  self-host, not an arbitrary tutorial URL.

## Memory Hooks

- Log the project's chosen hero component + primary section library + surface
  language to `memory/odin.md` once decided — every later page matches it, and
  re-deciding per page is wasted effort and inconsistency.
- Log any component that needed heavy a11y or perf rework, so the next pull
  budgets for it.
- Log stack-specific package choices for a non-React project.

## Change Log
<!-- Log updates to this skill -->
- [2026-09-03] **Web-design library is now the primary section system.**
  `build-awwwards-quality-sites` is the mandatory umbrella for every website
  build (art direction + section sequence + one motion system); `skills/web-design/`
  recipes (§1/§3/§4/§6) drive every section; component libraries (Aceternity
  sections, Magic UI, React Bits text, Motion Primitives / Cult UI / Origin UI)
  only fill a specific drop-in gap. Rewrote `## Animated sections` and
  `## Sourcing components — the workflow` (build-awwwards first → INDEX aesthetic
  + sections → hero component → gap-fill components → **brandpack gate** → build).
  Added a hard **brandpack gate** step: check every recipe/component against
  `doc/brandpack.md` before building; a look-clash is stop-and-reconcile, not
  retheme-anyway (also a new Error Handling row). Hardened `### The agent does
  not model or code 3D` — never from a blank file: mesh/GLB/Three.js/GLSL/WebGPU/
  animated canvas; sources broadened to "any reputable free gallery, pre-built
  only"; added the **`build-awwwards-quality-sites` §5 override** (its
  "justified hand-written shader canvas" is disallowed here — still sourced).
  `## Component catalog` + Tier 1 reworded. Threaded through `agents/odin.md`
  Rule 0 + workflow, `doc/brandpack.md` (§14–15), `commands/initialize.md`
  (brandpack template §14–15), `skills/web-design/INDEX.md`, `CLAUDE.md`,
  `doc/example-workflows.md`, `agents/nickfury.md`,
  `skills/nickfury/orchestration.md`.
- [2026-09-03] **Pinned the hero to three free libraries.** The landing hero
  is now ALWAYS one ready component from **21st.dev, Aceternity, or React
  Bits** — chosen by fit to the register/goal, no hand-built hero, no full
  hand-authored Three.js scroll world as the default (that's retired; a
  scroll-through 3D hero is now just an Aceternity scroll component or a React
  Bits 3D background, picked when the content wants it). `## The hero is always
  a 3D scroll experience` → `## The hero — always a component from 21st.dev,
  Aceternity, or React Bits` (anchor changed — updated in `agents/odin.md`,
  `doc/brandpack.md`, `commands/initialize.md`, `CLAUDE.md`, `README.md`,
  `doc/example-workflows.md`). Added `## Animated sections` (three libraries
  first for section animation components; Magic UI / `skills/web-design/`
  recipes / Spline co-equal for sections only, never the hero). `### Pick the
  hero from the content` table rewritten to name components from the three,
  not Three.js recipes. Sourcing workflow, Component catalog, Tiered stack,
  Output, Error Handling all rewritten to match. `skills/web-design/INDEX.md`
  is still scanned first — now for aesthetic direction + scroll choreography +
  finishing detail, not the hero. Free-tier discipline made explicit
  (Aceternity templates paid, components free; React Bits MIT; 21st.dev
  free listings only).
- [2026-08-29] Retired the bespoke-3D path: removed the **Strange** agent and
  the `3d-motion` / `3d-scrollbase` skills. The 3D scroll hero is now **always
  sourced** — from a component/prompt library (Aceternity, React Bits, Magic
  UI, 21st.dev, **motionsites.ai**, Spline) or a `skills/web-design/` recipe —
  never `/3d-scrollbase`, never hand-authored, never escalated. `### The agent
  does not model or code 3D` renumbered (4 sources, no `/3d-scrollbase`); the
  "nothing fits → Strange" fallbacks in the sourcing workflow, Output, Error
  Handling, and Tier 3 replaced with "closest sourced substitute + note the
  compromise; tell the user if genuinely un-sourceable". Scanning
  `skills/web-design/INDEX.md` first is now mandatory on every website build.
  Lenis+GSAP recipe pointer repointed to
  `skills/web-design/cinematic-gsap-lenis-motion-system/`.
- [2026-08-28] Reframed around "signature animated hero + animated sections,
  sourced by web-searching component libraries, never hand-rolled" as the
  default for every army site build. Added the hero section, `## Sourcing
  components — the web-search workflow`, an expanded real-component catalog
  (Aceternity / React Bits / Magic UI / 21st.dev / Spline), and a "pick the
  hero style from the content register" guide.
- [2026-08-28] Vendored the `skills/web-design/` recipe library (88 recipes,
  MengTo/Skills) and made it the first place to look in the sourcing workflow.
- [2026-08-28] Made it explicitly **story-first** for a new website: added
  `## Website intake` (collect logo + goal + audience + real content before
  building) and `## Story spine` (the scroll is a narrative; each section's
  animation dramatizes its beat; motion with no narrative job is cut).
  Hero section renamed → `## The hero is always a 3D scroll experience` — the
  home hero is now always a real WebGL/Three.js scroll experience whose subject
  is a metaphor for what the company does, intensity calibrated to the
  register (not just any "signature animation").
- [2026-08-28] Added the hard rule `### The agent does not model or code 3D` —
  3D is only ever a ready component (Aceternity / React Bits / Magic UI /
  21st.dev), a `skills/web-design/` recipe followed step-by-step,
  `/3d-scrollbase`, a free CC0 model dropped in, or a Spline embed. No
  hand-authored mesh/GLB, no Three.js scene from a blank file. Nothing fits →
  Strange. Threaded through No Old UI, the hero section, the sourcing workflow
  (step 4), Error Handling, Output, `agents/odin.md` Rule 0, the brandpack
  Design Principles, `_global/3d-scrollbase.md`, and `web-design/INDEX.md`.
