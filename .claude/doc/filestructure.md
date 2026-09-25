# File Structure

> Directory layout. Mirrors the reference project being ported
> (`E:\laragon\www\-Gireesh-Portfolio`) — see `doc/project-overview.md`.

## Structure

### Flat — single Next.js app (App Router), ported from the reference

```
CycleWala/
├── .claude/                # AvengerArmy framework (this system)
├── app/
│   ├── layout.tsx          # Root layout — Inter + Instrument Serif + Caveat fonts
│   ├── page.tsx            # Landing page (single scrolling page)
│   ├── globals.css         # Design tokens — mirrors doc/brandpack.md
│   ├── not-found.tsx
│   ├── robots.ts / sitemap.ts
│   └── work/[slug]/        # Case-style route — repurpose for Store/Accessories/Services detail pages
├── components/
│   ├── layout/              # Nav, Scene (sticky-stack), SmoothScroll — drop LanguageToggle (EN only)
│   ├── sections/
│   │   ├── Intro/           # TunnelIntro — WebGL tunnel (Three.js), ported as-is
│   │   ├── Hero/             # Recontent for Cycle Wala
│   │   ├── About/            # Shop story
│   │   ├── Experience/       # Repurpose (services/milestones)
│   │   ├── Gallery/           # Shop photos
│   │   ├── Stack/DesignStack.tsx → retheme/recontent as "Brands We Carry"
│   │   ├── Journey/LightJourney.tsx  # GLSL light-cable scene, ported as-is
│   │   ├── Certifications/   # Repurpose (authorized-dealer badges) or drop
│   │   ├── Work/              # Repurpose as Store/Accessories/Services showcase
│   │   └── Connect/           # Visit-us / contact
│   └── ui/                   # Button, VelocityMarquee — ported, retheme to green
├── content/                 # Static content data (TS) — no DB; replaces reference's stack.ts, projects.ts, etc.
├── lib/                     # gsap.ts, lenis.ts, scene.ts, site.ts — ported; i18n.tsx dropped (EN only)
├── public/                  # Logo, favicon, og image — save the user-supplied Cycle Wala logo here
├── doc/  ·  see .claude/doc/  # Project knowledge base
├── next.config.ts
├── package.json
└── .env.example             # Not needed yet — frontend-only, no secrets
```

> Package manager, exact TS config, and whether a `src/` dir is used are set
> when the app is scaffolded from the reference — update this file then if it
> diverges from the reference's own layout.

## Rules
- Port the reference's structure 1:1 where possible — don't reorganize during
  the port; recontent and retheme, then refactor once it's working.
- Design tokens live in `app/globals.css` and must mirror `doc/brandpack.md` —
  never hardcode hex.
- Frontend-only: no `api/` data layer, no ORM, no migrations.
- Drop `lib/i18n.tsx` and `LanguageToggle` — English only.

## Change Log
- 2026-09-12 — Rewritten at `/initialize` for Cycle Wala (previously described
  a hypothetical ByteSetu layout with no reference project; this project has a
  concrete one to port).
