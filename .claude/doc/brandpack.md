# Brand Pack — Cycle Wala

> Design system. Editable by: Odin, NickFury.
> Stack: Next.js (App Router), frontend-only · Sources: design direction —
> ported 1:1 from the user-supplied reference project at
> `E:\laragon\www\-Gireesh-Portfolio` (`app/globals.css`, `app/layout.tsx`),
> recolored from its red accent to Cycle Wala's brand green (sampled visually
> from the user-supplied logo — see Known Limitation under §17).

## 1. Colors

### Light (CSS custom properties on `:root`)
| Token | Value | Usage |
|---|---|---|
| --background | #ffffff | Page background (`--bg` in the reference) |
| --foreground | #141414 | Default text (`--ink`) |
| --primary | #4CAF2E | Primary buttons, CTAs, links, selection — Cycle Wala green (replaces the reference's `--accent: #ff2e0f`) |
| --primary-foreground | #ffffff | Text on primary |
| --secondary | #3c3c42 | Secondary text/surfaces (`--ink-2`) |
| --secondary-foreground | #ffffff | Text on secondary |
| --muted | #f2f2f3 | Disabled / subtle fills, placeholders (`--ph`) |
| --muted-foreground | #8a8a90 | Help text, captions (`--ink-3`) |
| --accent | #3c8a24 | Accent/hover state for primary green (`--accent-dark` equivalent) |
| --accent-foreground | #ffffff | Text on accent |
| --destructive | #e5484d | Errors only — the brand green is never reused for error states |
| --destructive-foreground | #ffffff | Text on destructive |
| --border | #ededef | Borders, dividers (`--line`) |
| --input | #ededef | Form input borders |
| --ring | #4CAF2E | Focus ring — primary green |
| --card | #ffffff | Card background |
| --card-foreground | #141414 | Text on cards |

### Dark
The reference project is light-only (no `.dark` theme exists in its source) —
not invented here. `[TBD] — add a dark theme only if the site later needs one;
port `.dark` tokens by mirroring the light set with `--background`/`--foreground`
inverted and re-checking contrast against the green primary.`

### Sidebar tokens
Not applicable — the reference has no sidebar/app-shell pattern; this is a
single scrolling marketing page.

### Chart palette (5)
Not applicable yet — no charts on a bike-shop marketing site. `[TBD]` if one
is ever added; see `skills/dataviz`.

### Semantic usage
- Primary green: CTAs, nav active state, key actions, `::selection`
- Accent (dark green): hover/pressed state for primary
- Destructive: form errors only · Muted-foreground: never for primary content

## 2. Typography

### Font stack
```
Sans (UI):    Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial
Serif (display): Instrument Serif (italic for accent headlines), Georgia, serif
Script (accent):  Caveat (weights 600/700), cursive
```
Loaded via `next/font/google` exactly as in the reference `app/layout.tsx`
(`--font-ui`, `--font-serif`, `--font-script` CSS variables). <!-- /initialize -->

### Scale
| Class | px | Usage |
|---|---|---|
| text-xs | 12 | Labels, captions |
| text-sm | 14 | Secondary text, hints |
| text-base | 16 | Body (matches reference `body { font-size: 16px }`) |
| text-lg | 18 | Card titles, subheads |
| text-xl | 20 | Section headings |
| text-2xl | 24 | Page / modal titles |
| text-3xl | 30 | Small hero headings |
| text-4xl+ | 36+ | Hero (`clamp()`, Instrument Serif italic for the emphasis word — mirrors the reference's "My Design **Stack.**" treatment) |

### Weights
400 body (Inter) · 500 buttons/labels · 600 titles · 700 hero · Caveat 600/700 for handwritten accents

### Heading hierarchy
h1 `text-4xl font-bold` (Inter, with an Instrument Serif italic emphasis word)
· h2 `text-3xl font-semibold` · h3 `text-2xl font-semibold` · h4 `text-xl
font-semibold` · h5 `text-lg font-medium`

### Component typography
[TBD — set when the first components are built; port classnames from the
reference's `*.module.css` files section-by-section]

## 3. Spacing

### Scale
| px | Tailwind | Usage |
|---|---|---|
| 4 | p-1 / gap-1 | Icon gaps |
| 8 | p-2 / gap-2 | Tight spacing |
| 16 | p-4 / gap-4 | Standard padding |
| 24 | p-6 / gap-6 | Card header/footer, form spacing |
| 32 | p-8 / gap-8 | Section padding |
| 48 | gap-12 | Page-level rhythm |

Reference uses `--max: 1280px` as the content max-width — carry this over as
the page container.

### Card / form / page patterns
[TBD — set when the first components are built]

## 4. Radius & Elevation

| Token | Value |
|---|---|
| --radius | 22px (matches reference `--radius`) |
| --radius-sm | 12px |
| --radius-lg | 32px |

Shadows (ported verbatim from the reference):
- `--shadow: 0 24px 60px -12px rgba(20,20,20,0.1), 0 4px 16px rgba(20,20,20,0.05)`
- `--shadow-lg: 0 48px 110px -20px rgba(20,20,20,0.18), 0 8px 28px rgba(20,20,20,0.07)`

## 5. Motion

| Token | Value |
|---|---|
| --easing | `cubic-bezier(0.16, 1, 0.3, 1)` (`--ease-out-expo`, ported verbatim) |
| control feedback | 200ms (`--dur-fast`) |
| interface state change | 400ms (`--dur-base`) |
| page / section reveal | 500–800ms, via GSAP ScrollTrigger (ported) |

Named systems ported from the reference: Lenis smooth-scroll, GSAP
ScrollTrigger section reveals, the sticky `Scene` stack (holds + runways,
rising z-index), `VelocityMarquee`, the WebGL tunnel intro, and the GLSL
light-cable "Journey" scene.
**`prefers-reduced-motion`**: every effect renders its settled state
immediately — not a shortened animation. Non-negotiable.

## 6. Buttons
[TBD — set when the first components are built; port from the reference's
`components/ui/Button.tsx` + `Button.module.css`, restyled to the green
primary token]

## 7. Forms
[TBD — set when the first components are built. Likely just a contact/visit-us
form (no backend yet) — a `mailto:`/third-party form service, per Non-Goals]

## 8. Cards
[TBD — set when the first components are built]

## 9. Modals / Dialog
[TBD — set when the first components are built]

## 10. Icons
- **Primary:** lucide-react (bicycle-adjacent icons: `Bike`, `Wrench`,
  `MapPin`, `Phone`, `Clock`)
- **Custom:** the Cycle Wala logo mark (bicycle integrated into the "CYC"
  wordmark) — see §17
- Sizing: h-3 w-3 (badges) · h-4 w-4 (standard) · h-5 w-5 (large buttons) · h-6 w-6 (headers)
- In use: [TBD — set when the first components are built]

## 11. Layout
- Breakpoints: sm 640 · md 768 · lg 1024 · xl 1280 — mobile-first
- Single scrolling page (no app-shell/sidebar) — mirrors the reference's layout shell

## 12. States
- Alert colours:
  | Type | BG | Border | Text |
  |---|---|---|---|
  | Success | #eafbe7 | #b7e3ab | #1e5c14 |
  | Error | rgba(229,72,77,0.1) | #e5484d | #e5484d |
  | Warning | #fff8e1 | #ffe082 | #8a6d00 |
  | Info | #eaf2ff | #b9d3ff | #1d4b8f |
- Skeleton / spinner / empty-state / error-state patterns: [TBD — set when the
  first components are built]

## 13. Toasts
[TBD — set when the first components are built]

## 14. Component Library & Sourcing

- **Primary approach for this project: port, don't rebuild.** The user
  supplied a complete, working reference implementation
  (`E:\laragon\www\-Gireesh-Portfolio`) to copy structurally and recolor —
  this takes precedence over sourcing a new hero/section set from scratch.
  Its Three.js/GLSL scenes are copied as-is per the user's explicit request,
  which satisfies "no hand-authored 3D" (sourced from supplied reference code,
  not authored from a blank file).
- **Base primitives:** shadcn/ui (Radix) may still be used for any new UI the
  port doesn't cover (e.g. a contact form) — rethemed to the tokens above.
- **Hero:** already covered by the ported `TunnelIntro` + `Hero` section — no
  need to source a new one unless the user asks for a different hero.
- **Sections beyond the port:** if new sections are needed later, the
  `skills/web-design/` recipe library (`build-awwwards-quality-sites` umbrella)
  is the fallback system.
- **Own the code:** the ported components live in this repo and get rethemed —
  no runtime dependency on the reference project.

## 15. Design Principles
- **Port-first for this build:** match the reference's scroll narrative and
  motion beats exactly; only the content and the accent color change.
- **Story-driven:** hook → context → approach (store/accessories/services) →
  proof (brands carried) → outcome → CTA (visit/contact) — same spine as the
  reference, recast for a bike shop.
- **Animated throughout:** every ported section keeps its original GSAP/Lenis
  choreography.
- **Brandpack gate:** any *new* component added beyond the port is checked
  against this file first — a clash is stop-and-reconcile.
- **No legacy UI** · **Own the code** — see §14.

## 16. Libraries & Frameworks
> Binding choices for this project. `skills/_global/modern-frontend.md` is the
> full menu; `skills/web-design/INDEX.md` is the 88 recipe folders (fallback
> only — this build ports a reference first).

| Category | Tools |
|---|---|
| **Reference port (primary)** | `E:\laragon\www\-Gireesh-Portfolio` — Next.js 16, React 19, TypeScript, GSAP + ScrollTrigger, Lenis, Three.js |
| **Base** | Tailwind CSS / CSS Modules (reference uses CSS Modules — keep consistent with the port), shadcn/ui for any net-new UI |
| **Section system (fallback, if new sections are needed)** | `skills/web-design/build-awwwards-quality-sites/` umbrella + `skills/web-design/INDEX.md` |
| **Scroll choreography** | GSAP + ScrollTrigger + Lenis (ported, already wired) |
| **3D** | Three.js scenes ported verbatim from the reference (`TunnelIntro`, `LightJourney`) |
| **Generative (drafts only)** | v0.dev — scaffold then refactor by hand, only if needed beyond the port |

## 17. Logo
| Variant | File path | Status |
|---|---|---|
| Primary wordmark | `[TBD — save the user-supplied logo file to public/images/ once the app is scaffolded]` | Provided by user in chat (not yet a file on disk) |
| Dark variant | `[TBD]` | |
| Favicon | `[TBD]` | |
| Social preview (1200×630) | `[TBD]` | |

**Logo description (from the supplied image):** wordmark "CYCLE WALA" — the
"Y" and "C" in "CYC" are styled to suggest a bicycle (frame + wheel), "CYC" in
brand green, "LE WALA" in white/ink, tagline "Store | Accessories | Services"
below. Rounded, friendly geometric sans-serif.

**Known limitation:** the primary-green hex (`#4CAF2E`) above is a visual
estimate from the logo image shown in chat, not a pixel-sampled value — the
file itself hasn't been saved to disk yet. Re-sample exactly once the logo
asset is saved into `public/` (or share its file path) and update this table.

## 18. Known Issues
Not applicable — new project, no code exists yet.

## Change Log
- 2026-09-12 — Created at `/initialize`. Tokens ported from the user-supplied
  reference project (`E:\laragon\www\-Gireesh-Portfolio`), recolored to Cycle
  Wala green. Superseded prior stale brandpack content (ByteSetu "Momentum"
  direction) which did not match this project.
