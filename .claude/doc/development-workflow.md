# Development Workflow

> Project-specific conventions layered on top of `skills/_global/git.md`'s
> framework-wide baseline.

## Branch Strategy
[TBD — default until changed] `feature/*`, `fix/*`, `chore/*` branches off the
default branch; squash-merge via PR; humans merge. Protected branches per
`hooks/guard-git.sh` defaults (`main`/`master`/`production`/`release`) — agents
never push to these directly, never force-push, never merge.

## Issue Tracker
Not selected — no Jira / ClickUp integration enabled at init. Re-run
`/initialize` → "update selection only" to add one.

## PR / Review Process
[TBD] Odin opens PRs; a human reviews and merges. No Hulk QA agent active — run
Core Web Vitals / a11y checks manually or via `skills/odin/page-optimize.md`
before requesting review.

## Local Dev
- `npm run dev` (or the scaffolded package manager) → `localhost:3000`
- Design tokens in `app/globals.css` + `tailwind.config` must stay in sync with
  `doc/brandpack.md`

## Deploy
No Groot agent active and no infra chosen yet. `doc/deployment.md` is not
generated. Likely target: Vercel (Next.js) — decide and document before first
deploy.

## Change Log
- 2026-09-03 — Created at `/initialize`.
- 2026-09-12 — Re-initialized for Cycle Wala (Vision no longer active in this
  project's agent selection; references to it updated).
