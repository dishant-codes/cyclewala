# Source & Provenance

**Upstream:** [github.com/MengTo/Skills](https://github.com/MengTo/Skills) —
`agent-skills/web-design/` (by Meng To / Design+Code)
**License:** MIT — see `LICENSE` (Copyright (c) 2026 Meng To). Retained in full.
**Vendored:** 2026-08-28, at upstream commit `321c769` (2026-08-29).
**What was copied:** every skill folder's `SKILL.md`, `REFERENCES.md`,
`ARTICLE.md`, `references/`, `assets/` (React component templates), `scripts/`,
`agents/openai.yaml`, and storyboard `.png`s — 88 skills, 166 files, ~1.6 MB.
**What was dropped:** the `demo/` folders (rendered HTML previews + bundled
copies of three.js/GSAP — ~84 MB). See the upstream repo for live demos.
**Local additions:** `INDEX.md` (categorized index + how AvengerArmy uses it),
this file.

## Security review (2026-08-28, pre-add — user-gated)

Cloned the full repo and inspected every executable file. **Clean.**

- No `eval` / `new Function` / dynamic code execution anywhere.
- No `child_process` / shell exec in any skill file (only in the upstream
  repo's own build tooling, which was not vendored).
- No credential / cookie / `localStorage` theft, no `sendBeacon`, no WebSocket
  exfiltration.
- **Zero external `<script src>`** in any demo — every script was a local
  relative path. (Demos dropped anyway.)
- **Zero network calls** (`fetch`/XHR/axios) in any non-demo skill file.
- Bundled libraries (three.js ×6 — identical SHA-256, GSAP, ScrollTrigger,
  Draggable, Iconify) were stock files with correct MIT/GreenSock headers.
- The `atob`/`btoa` in demo wrappers is a sandbox mechanism: demos ran inside
  `<iframe sandbox="allow-scripts">` with CSP `connect-src 'none'` — unable to
  phone home. Not obfuscation.
- No prompt injection across 208 markdown files (no "ignore instructions",
  no exfil directives, no malicious commands).

## Notes for agents

- Some recipes reference niche npm packages (`shaders`, `metal-fx`,
  `border-beam`, `thinking-orbs`). Per `skills/_global/modern-frontend.md#Install
  discipline`: list + confirm before installing, check the package is
  maintained, and a well-known equivalent from the component catalog is a fine
  substitute.
- `agents/openai.yaml` files are upstream OpenAI-agent metadata — harmless,
  unused by AvengerArmy.
