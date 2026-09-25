# Web Design Library — Index

> 88 vetted, offline frontend recipes. Vendored from
> [MengTo/Skills](https://github.com/MengTo/Skills) (`agent-skills/web-design`,
> MIT) — security-reviewed (2026-08-28): no network calls, no eval, no shell
> exec, no obfuscation. Demo folders were stripped; see the GitHub repo for
> live previews.

## How Odin / Vision use this

**This library is the primary section system for every website build.**

1. **Start with `build-awwwards-quality-sites/` (§2)** — the whole-site
   art-direction + section-sequence + honest-asset + one-motion-system umbrella.
   Every "create a website" task works through it first. **AvengerArmy
   override:** its §5 "justified hand-written Three.js shader canvas" is **not
   allowed** — that canvas is still a sourced component (React Bits / a recipe).
2. **Then scan this index** for one **aesthetic direction** (§1), the **section
   techniques** you need (§3 layout / §4 scroll-motion), and **finishing
   detail** (§6). Open each `SKILL.md`, follow its workflow, retheme to
   `doc/brandpack.md` tokens, wire real content. **Every section is built from
   a recipe** — component code only fills a drop-in gap a recipe leaves.
3. **Brandpack gate** — before you build with a recipe, check its art direction
   against `doc/brandpack.md`. A palette / surface / type / motion clash is
   stop-and-reconcile: pick a different recipe, or propose a brandpack update
   via NickFury.

**The hero is not sourced from here.** The landing hero is always a ready
component from **21st.dev, Aceternity, or React Bits** (free tier), chosen by
fit — `skills/_global/modern-frontend.md#The hero — always a component from
21st.dev, Aceternity, or React Bits`. The §5 WebGL/3D recipes below are for
*section*-level 3D, or a hero only after the three-library fallback clause.

These are **recipes, not drop-in components** — they tell you how to build the
effect well (a11y / performance / fallback discipline already worked out). For
copy-paste component *source* to fill a gap, use
`skills/_global/modern-frontend.md#Component catalog` — the hero table
(21st.dev / Aceternity / React Bits) and the section fill-in table (Magic UI,
Motion Primitives, Cult UI, Origin UI).

**The agent never models or codes 3D from scratch.** A WebGL/3D recipe here
that assembles primitives *in code as its `SKILL.md` instructs* is fine —
that's following the skill. Real 3D objects come from **free CC0 libraries**
(Poly Haven / Kenney / Quaternius / Sketchfab CC0), dropped in, never modelled.
If no recipe or component fits → use the closest sourced component or a Spline
embed and note the compromise; if it's genuinely un-sourceable, tell the user.
Never a blank file. See
`skills/_global/modern-frontend.md#The agent does not model or code 3D`.

Paths below are relative to `skills/web-design/`.

---

## 1 — Full aesthetic / design-system directions
Build a whole site (or redesign one) in this visual language. Pick ONE per project.

| Skill | Direction |
|---|---|
| `agency-grid-layout-minimal/` | Minimal agency system: disciplined editorial grid, oversized type, quiet uppercase labels |
| `nested-container-clean-agency/` | Agency system from nested containers: outer editorial shell, inset dark feature blocks, rounded cards |
| `documentary-brutalist-agency/` | Creative-studio / production / architecture: billboard type, hard B&W chapters, exposed grids, documentary imagery |
| `editorial-portfolio-chapters/` | Creative-studio / photographer / artist portfolio where project work leads the story |
| `editorial-tech/` | Editorial magazine composition + precision product-tech detailing, asymmetric grids, mono labels |
| `editorial-service-booking/` | Appointment-based services — salons, spas, clinics, hospitality |
| `book-serif-index/` | Archival book-reader: serif pages, mono index nav, aged paper, margin notes |
| `light-mode-paper-technical/` | Light-mode technical: warm paper surfaces, dark outer frame, bracketed geometry |
| `clean-minimal-beige-light-mode/` | Clean minimal beige: warm neutral shells, quiet process grids, low-contrast structure |
| `orange-clean-paper-saas/` | Paper-toned SaaS: warm neutrals, orange accent, rounded forms, product illustration |
| `blue-cloudy-clean-modern/` | Luminous blue sky atmosphere, soft cloud light, minimal white framing, serene type |
| `mesh-gradient-dark-blue-clean/` | Premium dark-blue mesh-gradient system: hero shell, floating nodes, framed sections |
| `dark-blue-contrasting-clean/` | Dark-blue, strong contrast, cobalt gradient feature blocks, crisp framed structure |
| `dark-glass-clean-layout/` | Dark glass: frosted premium shells, multi-column workspace, floating data cards |
| `glass-dark-ui/` | Dark-mode glassmorphism with readable contrast, frosted surfaces, gradient borders |
| `glass-dark-mode-clock/` | Dark glass + soft beam grids + circular calibration dials, sci-fi instrument framing |
| `blue-laser-clean-glass-layout/` | Dark glass + thin blue laser atmosphere + polished dashboard structure |
| `dither-laser-dark-mode/` | Near-black surfaces + ordered-dither texture + thin accent-colored laser atmosphere |
| `tech-green-dark-mode-modern/` | Matte-black + emerald signal accents + mono labels + framed dashboard cards |
| `bright-green-tech-system-webgl/` | Bright-green technical: split layouts, hard-framed dark surfaces, prominent WebGL zone |
| `framed-tech-dark-border-gradient/` | Framed dark technical: border-gradient shells, asymmetric grid panels, mono labels |
| `funky-purple-container-tech/` | Dark container-led: fuchsia-purple accents, layered rounded shells, playful focal objects |
| `high-contrast-skeuomorphic-clean/` | Molded dark surfaces, crisp light separation, tactile inset depth, restrained accents |
| `skeuomorphic-ui/` | Skeuomorphic surfaces: layered gradients, stacked shadows, reflective borders, micro texture |
| `technical-wireframe-info-layout/` | Monochrome technical wireframe: exploded 3D structure, connector annotations, sparse labels |
| `split-layout-technical/` | Technical split-screen: dual panels, fine frame lines, mono metadata, inset surfaces |
| `image-first-grid-layout/` | Image-led grid: full-bleed photography, structural guide lines, anchored content blocks |
| `operational-enterprise-ai/` | Enterprise AI / automation / security pages: system boundaries, approvals, auditability, rollback |
| `product-proof-saas/` | SaaS / AI landing where a real workflow, interface, or deterministic demo is the central proof |

## 2 — Page-type playbooks

| Skill | Use for |
|---|---|
| `landing-page/` | High-converting single-offer landing page (SaaS / apps / services) |
| `pricing-page/` | High-converting SaaS pricing page — structure, plan design, copy, FAQs, experiments |
| `build-awwwards-quality-sites/` | Art-direct + implement distinctive motion-rich marketing / editorial / portfolio sites (GSAP, one smooth-scroll engine, optional Three.js) |
| `webgl-landing-steering/` | Steering a WebGL-heavy landing toward a target outcome (premium / technical / playful / cinematic) while keeping conversion + performance |

## 3 — Layout / structural detail

| Skill | Effect |
|---|---|
| `framed-grid-layout/` | Thin visible boundary lines, L-shaped corner brackets, diagonal texture, strict alignment |
| `nested-container-frames/` | Container-in-container layout from nested frames |
| `container-lines/` | Vertical container-size guide lines with mini corner squares |
| `corner-diagonals/` | Diagonal-cut / chamfered corners on buttons, cards, panels, shells |
| `number-details/` | Decorative `01 / 02 / 03` numeric section markers |
| `company-logos/` | Iconify Simple Icons logos (64×64) instead of text logos |

## 4 — Scroll & motion systems

| Skill | Effect |
|---|---|
| `animation-systems/` | Product-grade web motion à la Stripe / Linear / Apple / Vercel — the system, not one effect |
| `animation-on-scroll/` | IntersectionObserver scroll-reveal with Tailwind-friendly classes/keyframes |
| `cinematic-gsap-lenis-motion-system/` | Premium cinematic motion system: GSAP + ScrollTrigger + Lenis |
| `cinematic-scroll-storytelling/` | Cinematic scroll landing: Lenis + ScrollTrigger, sticky card stacks, parallax, scrubbed transitions |
| `gsap-scrolltrigger-storytelling/` | Cinematic sticky product storytelling, scroll-synced UI reveals, smooth interpolation |
| `scroll-world-storytelling/` | Long-form story → cinematic scroll page via one of 3 renderers (scrubbed video / Three.js world / semantic HTML+SVG) |
| `scroll-progress-timeline/` | Any ordered process → data-driven vertical/horizontal scroll story with progress fill + active states |
| `scroll-scrubbed-visual-sequence/` | Reversible scroll-controlled transforms — pinned stage, normalized progress, video/image-seq/canvas/SVG/DOM renderers |
| `scroll-scrubbed-word-reveal/` | Reveal text word-by-word on scroll progress, preserving links / emphasis / wrapping / reduced-motion |
| `staggered-word-reveal/` | Subtle editorial word-by-word fade+rise once each word enters the viewport |
| `masked-reveal/` | Masked staggered word reveals on scroll (GSAP ScrollTrigger) |
| `marquee-loop/` | Seamless infinite marquee via duplicated items |
| `reveal-hover-effect/` | Cursor-following spotlight that exposes a second aligned image through a soft radial mask |

## 5 — WebGL / 3D / shader recipes
**Not the default hero source** — the hero is a component from 21st.dev /
Aceternity / React Bits (`skills/_global/modern-frontend.md#The hero — always a
component from 21st.dev, Aceternity, or React Bits`). These are a fallback the
hero reaches only when nothing in the three fits and the user agrees, or a
source for a section-level 3D/shader effect. Match intensity to the site's
register (`skills/_global/modern-frontend.md#Pick the hero from the content`).

| Skill | Effect |
|---|---|
| `build-threejs-scroll-worlds/` | Scroll-controlled real-time Three.js as one persistent 3D world evolving across authored chapters (incl. `references/` + `scroll-conductor.js`) |
| `add-mouse-driven-orbit/` | Restrained mouse-driven orbit + parallax depth on a Three.js hero (damped pointer split across camera + objects) |
| `webgl-3d-object/` | A real 3D WebGL object — geometric mesh depth, PBR material, directional+ambient light, subtle float |
| `build-wireframe-scan-reveal/` | Reveal Three.js geometry with an expanding world-space scan; wire cage leads the surface, then burns away |
| `threejs-landscape/` | Live Three.js landscape that stays quiet behind a subject — noise heightfield, slope-coloured ground, instanced grass |
| `threejs-towers/` | Procedural architecture in Three.js, filmed assembling — pagodas / castles / domes from parameters |
| `threejs-weather/` | Weather that reads as weather — frustum-anchored rain, storm, scheduled thunder, blowing snow |
| `background-grid-webgl/` | Perspective WebGL background grid: fading lines, particle haze, slow forward drift, camera parallax |
| `atmosphere-background/` | Dark atmospheric bg: drifting vertical light folds, screen-blended glow, one luminous corner bloom |
| `webgl-laser/` | Fixed full-screen WebGL laser bg: thin white-hot vertical core, brand-colored halo, smoky fog |
| `corner-lasers/` | Corner-anchored laser composition: thin beams, bright emitter node, bloom, atmospheric fog |
| `dither-background/` | Dark monochrome procedural bg: enlarged square pixels, Bayer-style ordered dithering |
| `globe-particles/` | Globe-like 3D particle viz: dense luminous spherical core + thin orbital ring/disc |
| `globe-gl/` | globe.gl 3D globe data-viz — points / arcs / polygons / labels (plain HTML or React) |
| `cobejs/` | Lightweight interactive globe with `cobe` (canvas, markers, interaction, perf) |
| `gooey-blob-system/` | Gooey blobs via SVG filters — multiple shapes merge into one fluid form |
| `ambient-section-particles/` | Restrained particle atmosphere inside ONE section — density, gravity, wind, pointer disturbance, reduced-motion |
| `build-interactive-particle-trail/` | Cursor/touch particle emission by distance along the traveled segment into a recycled GPU pool |
| `pointer-trail-emitter/` | Cursor trail with constant spacing at any hand speed (emit per unit distance, not per timer) |
| `add-shader-cursor-trail/` | WebGPU halftone cursor trail (ChromaFlow + DotGrid mask + ripples + grain) with full fallbacks — incl. React `assets/` |
| `shaders-cursor-ripples/` | Cursor-following fluid WebGPU distortion over an existing image (Shaders `ImageTexture` + `CursorRipples`) — incl. React `assets/` |
| `falling-leaves/` | Leaves that tumble on their own axis — face, edge, face — with sideways slip driven by the tumble |
| `liquid-metal-border/` | Animated liquid-metal WebGL borders via the React `metal-fx` package |
| `thinking-orbs/` | Accessible animated AI loading / agent-status indicators via the React `thinking-orbs` library |
| `vantajs/` | Animated WebGL background effects with Vanta.js (setup, params, resize, perf, React/Next) |
| `unicorn-studio/` | Embed + customize Unicorn Studio interactive animations (embed, responsive, perf, fallbacks) |

## 6 — Finishing details

| Skill | Effect |
|---|---|
| `beautiful-shadows/` | Exact Tailwind arbitrary shadow utilities for polished layered neutral elevation |
| `beam-glow-states/` | React loading / processing / selected / focus / pressed states with `border-beam` animated edge glow |
| `css-border-gradient/` | Subtle gradient-border treatment via masked pseudo-element |
| `css-alpha-masking/` | Horizontal / vertical edge fades with `mask-image` linear-gradient |
| `progressive-blur/` | Layered CSS progressive blur (top or bottom) from stacked `backdrop-filter` masks |
| `solar-duotone-bold/` | Iconify Solar Duotone Bold icon style |

## 7 — Library references
Deep how-to for the core libraries (use when debugging or going beyond a recipe).

| Skill | Library |
|---|---|
| `gsap/` | GSAP — timelines, ScrollTrigger, stagger, transforms, SPA cleanup |
| `threejs/` | Three.js — scene/camera/renderer, lights/materials, GLTF, controls, performance, disposal |
| `tailwindcss/` | Tailwind CSS — layout, typography, responsive, theming, component patterns, dynamic-class safety |
| `matterjs/` | Matter.js — 2D physics: Engine/World, Render/Runner, bodies, constraints, scroll-friendly canvas |

## Notes

- Some skills reference npm packages that are the author's own or niche
  (`shaders`, `metal-fx`, `border-beam`, `thinking-orbs`, `metal-fx`). Follow
  `skills/_global/modern-frontend.md#Install discipline` — list + confirm
  before installing; check the package is maintained; a well-known equivalent
  from the component catalog is a fine substitute.
- Every recipe already bakes in `prefers-reduced-motion`, lazy-loading, and
  fallback discipline — keep those when adapting.
- `agents/openai.yaml` files in each folder are the upstream project's OpenAI
  agent metadata — harmless, not used by AvengerArmy.
