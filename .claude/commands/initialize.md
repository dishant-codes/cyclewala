---
description: One-command AvengerArmy bootstrap. In an existing codebase it asks only the project name + goal and reads everything else (stack, database + schema, structure, deployment, auth, testing, design tokens) straight from the code; in a new project it asks a short question set + a design-direction step. Generates the doc/context/memory/skills-registry knowledge base and physically enforces agent enable/disable. Safe to re-run.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion, SendUserFile
---

# /initialize

> One-command project bootstrap. Idempotent — re-running this updates rather
> than destroys.

Run this procedure now, in order: idempotency check, scan (which also decides
**mode** — see below), ask the questions that mode calls for (via
`AskUserQuestion` for every select, plain chat for text) — **existing-project
mode asks only name + goal and auto-accepts the rest from detection** — then
the design-direction step (if a UI agent is active), validate, enforce agent
selection, and generate.

**Hard requirement, not a style note: *whenever* a select-type question is
asked — Stack, Database, File Structure, Agents, Skills, the design-direction
pick, an Ambiguity-Gate question — it is an actual `AskUserQuestion` tool
call, never a written list of options with "(Recommended)" labels typed into a
chat message.** Describing the choices in prose and treating the user's next
message as their answer is not the same thing as the user selecting through
the real picker UI. In **existing-project mode** these questions are mostly
*not asked at all* (detection decides) — but the few that do fire (the
Ambiguity Gate, or the re-run idempotency prompt) are still real
`AskUserQuestion` calls. The scan/detection summary and the final auto-accept
summary are normal text messages; anything that asks the user to choose is not.

**Second hard requirement: the generated `doc/*.md` files are what every
agent reads instead of re-discovering the project from scratch — thin
documentation here is not a token-efficiency win, it's a cost deferred
onto every future task that has to re-derive what should've been captured
once.** This applies in **existing-project mode** (see Mode below). Don't
summarize a large/mature codebase down to a token-saving handful of items. If
a scan finds 60 tables, list 60 (grouped by domain, per the Database
question), not the 15 the user happened to mention in conversation. If two
font systems are in use, document both. If a table name looks like a typo
or a near-duplicate of another table, say so — that's exactly the kind of
detail a future agent needs and won't otherwise find without re-scanning
the whole codebase itself. Detail and brevity aren't opposed here: a
well-organized 60-item grouped list costs a few hundred tokens once at
`/initialize` time; an agent guessing wrong about the product's actual
scope on a later task costs far more.

**Third hard requirement: fill from detection, don't gap-fill from nothing —
and keep questions to the minimum.** Before writing `[TBD]`/"not
found"/"Unknown" into a generated file, decide which it is:
- **Genuinely not yet decided** — a production URL before the first deploy, a
  rollback plan before the first prod release, a test framework for a project
  with no tests yet, fonts/logo for a brand that doesn't have them yet. In
  **new-project mode** most Extended topics are exactly this. `[TBD]` is
  honest, not lazy. **Do not ask.**
- **Detectable from the code** — stack, DB engine + schema, file structure,
  deploy provider + CI, auth method, test runners, the whole design-token
  system. In **existing-project mode these are read straight from the code and
  written — no question.** Every auto-accepted value is listed in the final
  summary with the file/signal it came from, so the user corrects any wrong one
  in a single reply. A question is asked **only** when detection hits a genuine
  blocker (the Ambiguity Gate — conflicting signals, or a required value the
  code implies but no signal names).
- **Only the user knows, not in the code** — the project's *goal/description*.
  Asked in every mode. Nothing else in existing-project mode.
A placeholder is the last resort after detection comes up empty, never a
substitute for reading the code that's right there.

## Path convention

Every path below (`memory/root.md`, `context/root.md`, `doc/brandpack.md`,
`skills/_ref/skills-registry.md`, `credentials/credentials.md`,
`security/guardrails.md`, etc.) is written relative to **this file's own
`.claude/` root** — i.e. `memory/root.md` means `.claude/memory/root.md` in
the project this command is running in. Resolve every bare path in this file,
and in every `agents/*.md` persona, against `.claude/`, not the project root.

## Prerequisites
- `.claude/avengerarmy.json` exists
- `.claude/` populated with `agents/`, `skills/`, `memory/`, `context/`,
  `doc/`, `credentials/`, `security/`, `hooks/`, `CLAUDE.md`, `settings.json`
  (this whole system, cloned into `.claude/` at the project root)

## Mode

The Detection scan (below) runs first and decides which mode this run is in.
Mode decides how many questions get asked.

| Mode | Trigger | Behaviour |
|---|---|---|
| **New project** | No real stack signal found — no `package.json`/`composer.json`/`requirements.txt`/`pyproject.toml`/`Gemfile`/`go.mod`/`artisan`/`manage.py` with actual project content (only `.claude/` present, or a bare repo) | Ask the **Core questions only**. Extended questions are **not asked** — their `doc/*.md` fields are written as honest `[TBD]` / "set when you add it". The **design-direction step runs** (3 mockups → pick → iterate, or Skip) so the brandpack's *tokens* are real even though its *component* sections stay `[TBD]`. This is the "create me a site" path. |
| **Existing project** | Any real stack signal exists | **Near-zero questions — detection decides.** Ask **only** `name` (pre-filled, Enter accepts) and `description` (the sentence + the goal line) — these two are never reliably detectable. **Everything else — stack, database + full schema, file structure, deployment, auth, testing, the whole design-token system + Known Issues — is auto-accepted from detection and written straight into `doc/*.md`.** Agents + skills get the standard defaults (disclosed in the summary; re-run to change). The **only** interruption is a **blocking ambiguity** the scan genuinely can't resolve (see the Ambiguity Gate in Flow). The final summary lists every auto-accepted value with its detection source so the user can correct any one of them in a single reply. |

**Opt-outs:**
- New project + user says "set everything up now" / "ask me all of it" → opt into full-depth questioning for this run.
- Existing project + user says "ask me / let me confirm each" / "review everything" → fall back to confirm-each-detected-value (the old existing-project behaviour: Core questions pre-selected, Extended questions asked, brand Part 2B as a confirm-preview gate).

## Flow

```
START
  │
  ├─→ LOAD avengerarmy.json
  │   └─→ IF missing: ABORT
  │
  ├─→ IDEMPOTENCY CHECK
  │   ├─→ Read context/root.md
  │   └─→ IF "## Active Agents" already lists one or more agents:
  │         Tell the user: "AvengerArmy already initialized for this
  │         project (active agents: [list])." Ask via AskUserQuestion:
  │         Re-run full setup / Update agent+skill selection only / Cancel
  │         (an `AskUserQuestion` call, same hard requirement as the pickers).
  │         - Re-run full setup → continue below: re-detect, re-ask what the
  │           mode calls for (existing-project: just name + goal), regenerate;
  │           existing files handled per the file-exists rule below.
  │         - Update selection only → ask the Agents + Skills questions (a real
  │           `AskUserQuestion` even in existing-project mode — this path is an
  │           explicit request to choose), then AGENT ENABLEMENT, leave every
  │           other already-generated file untouched.
  │         - Cancel → stop here, no changes.
  │
  ├─→ DETECT EXISTING PROJECT (read-only scan, no writes) → also sets MODE
  │   ├─→ Stack signals: package.json / composer.json / requirements.txt /
  │   │     pyproject.toml / Gemfile / go.mod / artisan (Laravel) / manage.py (Django)
  │   │     → present ⇒ existing-project mode;  absent ⇒ new-project mode
  │   ├─→ File-structure signals: top-level layout — apps/+packages/ → Monorepo,
  │   │     separate frontend/+backend/ dirs → Separated, single src/ → Flat
  │   ├─→ Database signals: prisma/schema.prisma (+ its provider), migrations/
  │   │     folder, docker-compose.yml db service, config/database.*,
  │   │     .env.example DB_CONNECTION / DB_* (NOT .env — never read secrets),
  │   │     a DB driver dependency (pg/mysql2/mongoose/…)
  │   ├─→ Design-system signals (feeds brandpack, existing-project): tailwind.config.*
  │   │     theme (colors/fontFamily/borderRadius/boxShadow/screens), :root/.dark/--*
  │   │     custom properties in any *.css, CVA variant maps in **/ui/*, which
  │   │     Components/ui/* primitives exist, font <link>/@font-face/--font*,
  │   │     README title, package.json "name", logo/favicon/og files
  │   ├─→ Infra signals (feeds Deployment): Dockerfile, docker-compose.yml, vercel.json,
  │   │     netlify.toml, wrangler.toml, .github/workflows/, .gitlab-ci.yml,
  │   │     terraform/*.tf, serverless.yml
  │   ├─→ Auth signals (feeds Auth): passport/next-auth/devise/laravel sanctum-style
  │   │     dependency in the manifest, an auth/ or Auth* directory, JWT/session
  │   │     config keys in .env.example
  │   ├─→ Testing signals (feeds Testing): jest/vitest/playwright/cypress/mocha in
  │   │     package.json devDependencies, phpunit.xml / pestphp in composer.json,
  │   │     pytest.ini / pytest in requirements/pyproject, spec/ + rspec in Gemfile
  │   └─→ IF nothing found → new-project mode: detection contributes nothing,
  │         the Core questions are asked plain, Extended questions are skipped
  │
  ├─→ ASK
  │   ├─→ NEW-PROJECT MODE: Core questions (name, description, stack, database,
  │   │     brand Part 1, agents, skills). Detection pre-fills where it can;
  │   │     detection proposes, the user decides. Extended questions skipped.
  │   └─→ EXISTING-PROJECT MODE (default): ask ONLY `name` (pre-filled — Enter
  │         accepts) and `description` (sentence + goal line). Every other value
  │         — stack, database + schema, file_structure, deployment, auth,
  │         testing, the design-token system — is AUTO-ACCEPTED from detection,
  │         no question. Agents + skills = standard defaults. Then:
  │         └─→ AMBIGUITY GATE — one targeted AskUserQuestion per unresolved
  │               blocker, and only if it actually fired:
  │               · two conflicting stack signals in a non-monorepo
  │               · backend/API code present but zero database signal
  │               · conflicting file-structure signals
  │               · >1 distinct design-token system with no clear canonical one
  │               · a manifest/schema that won't parse
  │               No blocker → zero further questions.
  │         (Opt-out: user says "let me confirm each" → run the new-project-style
  │          confirm-each flow instead.)
  │
  ├─→ DESIGN DIRECTION (only if a UI agent — Odin/Vision — is active)
  │   ├─→ NEW-PROJECT MODE:
  │   │     ├─→ derive 3 distinct directions from goal/audience/tone/register
  │   │     │     (+ any reference site the user named) — see the `brand` question
  │   │     ├─→ write 3 self-contained style-guide mockups:
  │   │     │     doc/brand-previews/option-{a,b,c}.html
  │   │     ├─→ SendUserFile all 3 → AskUserQuestion: Option A / B / C / Skip
  │   │     ├─→ PICK → iterate loop: user feedback → edit that ONE file →
  │   │     │     SendUserFile again → until the user approves. Keep it as
  │   │     │     doc/brand-previews/brand-preview.html; delete the 2 rejected.
  │   │     └─→ SKIP → no preview; brandpack tokens ship concrete only where the
  │   │           user gave them, [TBD] elsewhere, design-direction sections
  │   │           marked "not chosen at init — pick one before the first build"
  │   └─→ EXISTING-PROJECT MODE (auto — NOT a gate):
  │         ├─→ detection reverse-engineers the token system from the codebase
  │         ├─→ write doc/brandpack.md straight from detection + ONE preview →
  │         │     doc/brand-previews/brand-preview.html
  │         └─→ SendUserFile it as an FYI. Continue without waiting. Iterate
  │               ONLY if the user replies with a correction.
  │
  ├─→ VALIDATE
  │   ├─→ Project name: required
  │   ├─→ Description: required
  │   ├─→ Stack: required — a question answer (new project) OR a detected value
  │   │     (existing project; unresolved conflict → Ambiguity Gate asked it)
  │   ├─→ Database: required — same (detected, or "None" is valid, or the Gate asked)
  │   ├─→ Brand: required if any UI agent (Odin/Vision) is active
  │   ├─→ Design direction: chosen or Skip (new-project + UI agent); auto from
  │   │     detection (existing-project)
  │   └─→ At least 1 agent (NickFury locked)
  │
  ├─→ AGENT ENABLEMENT (physically enforces the Agents answer — see below)
  │
  ├─→ GENERATE FILES
  │   ├─→ doc/project-overview.md (Architecture notes auth summary, or
  │   │     "frontend-only — no data layer" when database = None)
  │   ├─→ doc/brandpack.md                (skip if no UI agent active;
  │   │     tokens filled from the chosen design direction / detected system;
  │   │     component-implementation sections stay [TBD] in new-project mode)
  │   ├─→ doc/brand-previews/brand-preview.html  (the approved mockup, kept
  │   │     as reference; skipped if the user chose Skip)
  │   ├─→ doc/filestructure.md
  │   ├─→ doc/database.md                 (SKIP ENTIRELY when database = None)
  │   ├─→ doc/testing.md                  (only if Hulk selected)
  │   ├─→ doc/deployment.md               (only if Groot selected)
  │   ├─→ doc/development-workflow.md
  │   ├─→ context/root.md
  │   ├─→ memory/root.md
  │   ├─→ credentials/credentials.md (template)
  │   └─→ skills/_ref/skills-registry.md (active skills)
  │
  ├─→ IF a target file exists:
  │   ├─→ still the untouched shipped template (contains `<!-- /initialize: -->`
  │   │     markers / placeholder content, no real edits) → overwrite silently
  │   └─→ meaningfully edited → ASK: Overwrite / Append / Skip
  │
  ├─→ EXISTING-PROJECT MODE → print the auto-accept summary (every detected
  │     value + its source). A reply naming a wrong value → fix that one file.
  │
  └─→ NOTIFY NickFury: "AvengerArmy initialized. Awaiting orders."
```

## Questions

### Core questions

**`name` and `description` are asked in every mode** — they're the *only* two
asked in existing-project mode. **`stack`, `database`, `brand` Part 1,
`agents`, `skills` are asked in new-project mode; in existing-project mode they
are auto-accepted from detection / defaults** (unless the Ambiguity Gate fires
or the user asked to confirm each).

#### `name` — Project Name
- Type: text. Required. Both modes.
- Detect: `package.json` `"name"` / README title → shown as the default (Enter
  accepts in existing-project mode).
- Target: `doc/project-overview.md#name`

#### `description` — Description (+ one optional line)
- Two prompts, not a picker. Both modes — never detectable.
  1. "One sentence — what does this site/platform do?" (required)
  2. "Primary goal right now, and anything explicitly out of scope? One line,
     optional — press enter to skip."
- If prompt 2 is skipped, write `Goals`/`Non-Goals` as "Not specified (asked
  during /initialize, skipped)" — never a bare empty section, and never a
  silent omission.
- Target: `doc/project-overview.md#description`, `#goals`, `#non-goals`

#### `stack` — Tech Stack
- **New-project mode:** **single-select — `AskUserQuestion` tool call**.
  Options: **Next.js**, **React (Vite SPA)**, plus automatic **Other** (free
  text — "Nuxt / Laravel / MySQL", "Astro", "SvelteKit", "Django + HTMX", …).
- **Existing-project mode: not asked — auto-accepted from detection.**
  `next.config.*` → Next.js; `vite.config.*` + a `react` dep → React (Vite
  SPA); `artisan` → Laravel + its version; `manage.py` → Django; a
  Vue/Svelte/Nuxt manifest → that framework. Capture the real string
  (framework + major version + language + package manager). Only asked if two
  frameworks conflict in a non-monorepo (Ambiguity Gate).
- The database is appended to the written stack line (e.g. "Next.js (App
  Router) + PostgreSQL", "Laravel 11 + MySQL", "React + Vite (SPA) — no
  backend data layer").
- Target: `doc/project-overview.md#stack`

#### `database` — Database
- **New-project mode:** **single-select — `AskUserQuestion` tool call**.
  Options: **PostgreSQL**, **MySQL**, **MongoDB**, **None — frontend-only
  site**, plus automatic **Other** (SQLite, Supabase, PlanetScale, DynamoDB,
  Redis-only, …).
- **Existing-project mode: not asked — auto-accepted from detection.**
  `prisma/schema.prisma` `provider`; `config/database.php` default connection;
  a `docker-compose.yml` db image; a driver dep (`pg`→PostgreSQL,
  `mysql2`→MySQL, `mongoose`/`mongodb`→MongoDB); `.env.example` `DB_CONNECTION`
  (never `.env`). No DB signal anywhere **and** no backend/API code → `None`.
  No DB signal **but** backend/API code exists → Ambiguity Gate asks.
- **`None — frontend-only site` sets the `frontend_only` flag:**
  - `doc/database.md` is **not generated**.
  - `doc/project-overview.md#architecture` says "Frontend-only — no database /
    backend data layer."
  - The `auth` value is treated as "not applicable".
  - Agent defaults are **unchanged** (BlackPanther/IronMan/Natasha still
    default-on and available — a frontend-only site can still grow an API
    later; nothing is disabled just because there's no DB today).
- **Existing-project mode** always enumerates the schema exhaustively per the
  second hard requirement — every `create_*_table` migration / every Prisma
  model / every collection, grouped by domain if long, with real foreign keys
  and any naming drift noted. State the total count. This happens automatically,
  no question.
- Target: `doc/database.md` (skipped if None), `doc/project-overview.md#stack`

#### `brand` — Brand & Design Direction

- **Part 1 (base info):** **new-project mode only**, in the question sequence.
  In **existing-project mode Part 1 is not asked** — name comes from the `name`
  question, primary colour + the token system come from detection, tone is
  inferred from the `description` (or left unstated).
- **Part 2 (design direction):** runs in the **DESIGN DIRECTION phase** (Flow
  diagram) — *after* the agent set is known, so only if Odin or Vision is
  active. New-project: 3 mockups → pick → iterate, or Skip. Existing-project:
  auto-generated from detection, one FYI preview, not a gate. If neither UI
  agent is active, skip Part 2 and don't generate `doc/brandpack.md`.

##### Part 1 — base info (NEW-PROJECT mode, text)
- **Base prompt:** "Brand name, and a primary color + tone if you already have
  one — otherwise just the name and I'll propose directions." Example
  "Acme / #6D28D9 / bold-editorial", or just "Acme".

##### Detection (existing-project — feeds the auto-generated brandpack)
- Name from `package.json`/README; primary colour + full token system from the
  theme / CSS custom properties / CVA maps.
- Also scanned:
  Google/Bunny/Adobe Fonts `<link>`, CSS `--font*` / `:root` / `.dark` custom
  properties in any `*.css`, Tailwind `theme` (`colors`, `fontFamily`,
  `borderRadius`, `boxShadow`), `@font-face`, `class-variance-authority` variant
  maps in `**/ui/button.*` and siblings, which `Components/ui/*` /
  `components/ui/*` primitives exist; `public/favicon*`, `apple-touch-icon*`,
  `*logo*`, `*-og.*`.

##### Part 2A — design direction (NEW-PROJECT mode)
1. **Derive 3 distinct directions** from the goal / audience / tone / register
   collected in the `description` question, plus any reference site the user
   named. Each direction is a **complete mini design system**:
   - a short name + one-line rationale tying it to the brief
   - palette — `bg`, `surface`, `ink`, `muted`, `border`, `primary`,
     `primary-fg`, `accent`, `destructive` as **real hexes, light AND dark**
   - font pairing — real Google/system fonts (heading + body), with fallbacks
   - radius scale + one elevation/shadow character
   - motion character + an easing curve (`cubic-bezier(...)`)
   - the mapped `skills/web-design/` aesthetic recipe (INDEX §1)
   - a hero-component suggestion — which of **21st.dev / Aceternity / React
     Bits** + an example component
   The three must be **materially different** (e.g. restrained-editorial-light /
   dark-technical-glass / bold-kinetic), each plausible for the brief.
2. **Write 3 self-contained style-guide mockups** —
   `doc/brand-previews/option-a.html`, `option-b.html`, `option-c.html`. Each
   renders its direction as a living style guide: palette swatches (light + dark
   toggle), the type scale in the real pairing, buttons (every variant × state),
   a form field (default / focus / error), a card, a chip/badge, the 4 alert
   types, a sample hero band (headline + sub + CTA + a **labelled placeholder**
   "hero component → `<library / component>`"), and 2 sample sections (feature
   grid, stat row) annotated with the motion character. Inline `<style>` + one
   Google Fonts `<link>` + a system fallback stack. **No build step, no external
   JS, no external images.**
3. **`SendUserFile` all three** (`status: proactive`, `display: render`), then
   an `AskUserQuestion` — **Option A / Option B / Option C / Skip** (same hard
   requirement as every other picker: a real tool call).
4. **On a pick** — iterate loop: the user describes changes in chat → apply them
   to **that one file only** → `SendUserFile` it again → repeat until the user
   approves ("looks good" / "ok" / "ship it"). Then keep the approved file as
   `doc/brand-previews/brand-preview.html` and delete the two rejected drafts.
5. **On Skip** — no preview is kept. `doc/brandpack.md` ships with concrete
   values only where the user gave them in Part 1, `[TBD]` everywhere else, and
   the token sections carry a note: "not chosen at init — pick a direction
   before the first UI build".

##### Part 2B — auto-generate from the detected system (EXISTING-PROJECT mode)
The project already has a design — **not a gate, not a question**.
1. Reverse-engineer the token system from detection (tailwind `theme`, `:root`
   / `.dark` CSS custom properties, `ui/*` CVA maps, landing CSS, font links)
   and the Known Issues (raw `<button>`, legacy patterns, hardcoded hex, dual
   font/accent systems, near-duplicate tokens).
2. **Write `doc/brandpack.md` straight from that** — all 18 sections filled,
   no `[TBD]` in the component sections.
3. Render **one** preview — `doc/brand-previews/brand-preview.html` — of the
   written system, `SendUserFile` it as an **FYI**, and **continue** (don't
   wait). Iterate **only** if the user replies with a correction.
4. A genuine *design* ambiguity — more than one distinct token system with no
   clear canonical one — is the only thing that becomes an Ambiguity-Gate
   question. A dual accent that's clearly intentional (landing vs app) is just
   recorded in §1 + Known Issues, not asked.

- Target: `doc/brandpack.md`, `doc/brand-previews/brand-preview.html`

#### `agents` — Agent Selection
- **New-project mode:** **multi-select — `AskUserQuestion` tool call**.
- **Existing-project mode: not asked — standard defaults applied silently**
  (all optional agents on), disclosed in the final summary with "re-run
  `/initialize` → 'update agent + skill selection only' to change". Asked only
  if the user says so.
- NickFury: locked. Optional (default-on): IronMan, Vision (small UI changes
  only), BlackPanther, Odin (full frontend & page builder), Natasha, Hulk,
  Groot.
- Option descriptions (new-project picker): **Odin** builds UI (sites, pages,
  sections, components, design systems); **Vision** only makes small surgical
  changes to UI that already exists.
- Target: `context/root.md#active_agents` · Drives Deployment/Auth/Testing
  gating and Agent Enablement.

#### `skills` — Global Skills
- **New-project mode:** **multi-select — `AskUserQuestion` tool call**.
- **Existing-project mode: not asked — defaults applied**, plus **auto-check
  Jira / ClickUp / AWS when their signal is detected** (`.github` + a Jira key
  in commits / `.clickup` / a `terraform/` or `aws-sdk` dep). Disclosed in the
  summary.
- Options: Git, Docker, Jira, ClickUp, AWS, Modern Frontend.
- Default-checked: Git, Docker, and **Modern Frontend whenever Odin or Vision
  is active** — the modern-UI build baseline (`skills/_global/modern-frontend.md`).
- Target: `skills/_ref/skills-registry.md#active_global`
- (`database-safety`, `security-baseline`, `web-design` are always active.)

### Extended questions (new-project: never asked. existing-project: never asked either — auto-accepted from detection)

In **both** modes these are no longer questions. **New-project:** the `doc/*.md`
fields ship as honest `[TBD]`. **Existing-project:** each is filled directly
from its detection signal (below); a value only becomes an Ambiguity-Gate
question if its signal is missing where the code implies it should exist, or
signals conflict.

#### `file_structure` — File Structure
- **New-project mode:** not asked → **Flat** (a single-app site).
- **Existing-project mode:** auto from the detected top-level layout —
  `apps/`+`packages/` → Monorepo; separate `frontend/`+`backend/` → Separated;
  single app → Flat. Conflicting signals → Ambiguity Gate.
- Target: `doc/filestructure.md`

#### `deployment` — Deployment / Infra
- **New-project mode / no infra signal:** not asked → `doc/deployment.md`
  ships with `[TBD]` fields (nothing is deployed yet — honest).
- **Existing-project mode:** auto from the infra signal — provider from
  `vercel.json` / `netlify.toml` / `wrangler.toml` / a `Dockerfile`; CI from
  `.github/workflows/` / `.gitlab-ci.yml`; environments from workflow/compose
  file names. Production URL stays `[TBD]` unless a config file states it.
  Written whether or not Groot is active (Groot just maintains it after).
- Target: `doc/deployment.md`

#### `auth` — Auth
- **New-project mode / no signal / frontend-only:** not asked → Architecture
  says "Auth — not yet decided (set when building auth)".
- **Existing-project mode:** auto from the auth signal — method + provider
  inferred from the dependency (`next-auth`/`@auth/*`, `passport-*` strategies,
  `laravel/sanctum` or `socialite` providers, `devise` + `omniauth-*`) and any
  `auth/` route/controller names. Written to
  `doc/project-overview.md#architecture`.

#### `testing` — Testing Framework
- **New-project mode / no signal:** not asked → `doc/testing.md` ships `[TBD]`
  / "choose when adding the first tests".
- **Existing-project mode:** auto from the runner(s) in the manifest — unit +
  integration + e2e inferred from `vitest`/`jest` + `supertest` +
  `playwright`/`cypress`; `phpunit`/`pest`; `pytest`; `rspec`. Test-DB
  isolation from `.env.testing` / a sqlite override / a `phpunit.xml` env
  block, else "Unknown — confirm before any destructive test command".
  Written whether or not Hulk is active.

#### `credentials` — Credentials
- **Never auto-collected, either mode.** For each active skill that needs a
  credential, the key name is written to `credentials/credentials.md` as
  `[PENDING]`. In existing-project mode this is silent — no "provide now?"
  prompt; the user fills them in later, or NickFury asks at first use.
- Target: `credentials/credentials.md`

## Detection Rules

Runs once, before the first question, read-only (never writes files, never
runs code, never reads `.env`/secrets — `.env.example` and committed config
only). It sets **mode** (see Mode above), and what it does with a found value
depends on mode:

- **New-project mode:** every value is a *suggested default* pre-filled into
  its question — detection proposes, the user decides.
- **Existing-project mode (default):** every value is **auto-accepted and
  written** — detection decides. A question is raised only when the scan hits a
  blocking ambiguity (Ambiguity Gate in Flow) or the user asked to confirm each.
  The final summary lists every auto-accepted value + its source so the user
  can override any one in a reply.

In a genuinely empty project none of these signals exist, detection finds
nothing, mode is new-project, and only the Core questions are asked.

| Signal | Where checked | Feeds |
|---|---|---|
| `package.json` / `composer.json` / `requirements.txt` / `pyproject.toml` / `Gemfile` / `go.mod` | project root | `stack`; **presence ⇒ existing-project mode** |
| `next.config.*` | project root | `stack` → Next.js |
| `vite.config.*` + a `react` dependency | project root | `stack` → React (Vite SPA) |
| `artisan` (Laravel) / `manage.py` (Django) / a Vue/Svelte/Nuxt manifest | project root | `stack` → Other (pre-filled) |
| `apps/` + `packages/` dirs | project root | `file_structure` → Monorepo |
| separate `frontend/` + `backend/` dirs | project root | `file_structure` → Separated |
| single `src/` with no other top-level app dirs | project root | `file_structure` → Flat |
| `prisma/schema.prisma` (+ `provider`), `migrations/` folder, `docker-compose.yml` db service, `config/database.*`, `.env.example` `DB_CONNECTION`/`DB_*` (never `.env`), a DB driver dep | project root | `database` — new-project: pre-select the engine · existing-project: auto-accept + enumerate the schema |
| README title, `package.json` `"name"` | project root | `brand` Part 1 (name; tone is never guessed) |
| **Design system**: `tailwind.config.*` `theme` (`colors`, `fontFamily`, `borderRadius`, `boxShadow`, `screens`); `:root` / `.dark` / `--*` CSS custom properties in any `*.css`; `class-variance-authority` variant maps in `**/ui/button.*` + siblings; which `Components/ui/*` or `components/ui/*` primitives exist; font `<link>` / `@font-face` / `--font*`; `public/favicon*` / `apple-touch-icon*` / `*logo*` / `*-og.*` | project root + `src/`/`app/`/`resources/` | `design_direction` step — **existing-project: auto-writes the full 18-section brandpack + Known Issues, one FYI preview, not a gate.** new-project: the 3-mockup pick. |
| `Dockerfile`, `docker-compose.yml`, `vercel.json`, `netlify.toml`, `wrangler.toml`, `.github/workflows/`, `.gitlab-ci.yml`, `terraform/*.tf`, `serverless.yml` | project root | `deployment` — existing-project: auto-write provider + CI + environments to `doc/deployment.md` |
| Auth dependency in manifest (passport/next-auth/`@auth/*`/devise/sanctum/socialite), `auth/`/`Auth*` dir + route/controller names, JWT/session keys in `.env.example` | project root | `auth` — existing-project: auto-infer method + provider(s) → `doc/project-overview.md#architecture` |
| `jest`/`vitest`/`playwright`/`cypress`/`mocha` in devDependencies, `phpunit.xml`/pestphp, `pytest.ini`/pytest, `spec/`+rspec in Gemfile, `.env.testing` / sqlite test override | project root | `testing` — existing-project: auto-write unit/integration/e2e + test-DB isolation → `doc/testing.md` |
| Jira key pattern in recent commit messages / `.jira` config; `.clickup`; `terraform/` or `aws-sdk`/`@aws-sdk` dep | project root + git log | existing-project: auto-check the matching global skill (Jira / ClickUp / AWS) |

## Agent Enablement

Runs once the agent set is decided (the `agents` question in new-project mode;
the standard defaults — all optional agents on — in existing-project mode),
before file generation, and is what makes "Active Agents" an enforced fact
rather than a note nobody checks. For every optional agent (IronMan, Vision,
BlackPanther, Odin, Natasha, Hulk, Groot — never NickFury, it's locked)
**not** active:

1. Move `agents/{id}.md` → `agents/_disabled/{id}.md` (create the directory
   if needed)
2. Move `skills/{id}/` → `skills/_disabled/{id}/`, if it exists
3. Move `context/{id}.md` → `context/_disabled/{id}.md`
4. Move `memory/{id}.md` → `memory/_disabled/{id}.md`
5. Remove its row from `skills/_ref/agent-manifests.md` and the
   "Agent-Specific Skills" table in `skills/_ref/skills-registry.md`
6. Remove its name from the comma-separated agent list in `agents/nickfury.md`'s
   YAML frontmatter `description:` line

These moves are non-destructive — nothing is deleted, so selecting a
previously-disabled agent on a later `/initialize` run reverses every step
above (move files back, restore the registry rows and the frontmatter
mention). Never create a new empty file for a disabled agent, and never leave
a reference to it anywhere in an active (non-`_disabled`) file once this step
completes — that's the whole point: an unselected agent should look like it
was never part of this project.

`context/root.md#Active Agents` still gets the human-readable list — it's now
a description of what the file layout already enforces, not the only place
the selection lives.

## Generated Files

### doc/project-overview.md
```markdown
# [name]

> [description]

## Stack
[stack answer + database — e.g. "Next.js (App Router) + PostgreSQL" or
"React + Vite (SPA) — frontend-only, no data layer"]

## Active Agents
[agents list]

## Goals
[description prompt 2 — goal portion; if skipped: "Not specified (asked during
/initialize, skipped)", never a bare empty section]

## Non-Goals
[description prompt 2 — out-of-scope portion; if skipped: "Not specified
(asked during /initialize, skipped)"]

## Architecture
[High-level description. If database = None: "Frontend-only — no database /
backend data layer." Else if the auth question was asked: "Auth — Required:
[Y/N], Method: [detected/user-provided], Provider: [detected/user-provided]".
Else: "Auth — not yet decided (set when building auth)."]

## Environments
- Local: localhost:3000
- Staging: [TBD]
- Production: [TBD]

## Initialized
[Timestamp]

## Change Log
```

### doc/brandpack.md

The generated file has a **fixed rich structure** — the design system, not a
stub. Fill rules:
- **Token sections (Colors, Typography scale, Spacing scale, Radius &
  Elevation, Motion)** are **concrete in both modes** — from the chosen design
  direction (new-project) or the detected system (existing-project). Never
  `[TBD]` once a direction is chosen; only `[TBD]` if the user chose **Skip**.
- **Component-implementation sections (Buttons, Forms, Cards, Modals, Icons
  "in use", Layout shells, State patterns, Toasts)** are **`[TBD] — set when
  the first components are built`** in new-project mode, and **fully filled from
  detection** in existing-project mode.
- **Policy sections (Component Library & Sourcing, Design Principles, Libraries
  & Frameworks)** are always concrete — they're framework policy, identical
  every project.
- **Known Issues** section: **existing-project mode only** — omit the whole
  section on a new project.
- Put a `<!-- /initialize: … -->` marker on every field this command fills.

```markdown
# Brand Pack — [name]

> Design system. Editable by: Odin, Vision, NickFury.
> Stack: [stack answer] · Sources: [new-project: "design direction — <chosen name>"]
> [existing-project: "tailwind.config.*, <css files>, <ui component dir>"]

## 1. Colors

### Light (CSS custom properties on `:root`)
| Token | Value | Usage |
|---|---|---|
| --background | [hex] | Page background |
| --foreground | [hex] | Default text |
| --primary | [hex] | Primary buttons, CTAs |
| --primary-foreground | [hex] | Text on primary |
| --secondary | [hex] | Secondary surfaces |
| --secondary-foreground | [hex] | Text on secondary |
| --muted | [hex] | Disabled / subtle fills |
| --muted-foreground | [hex] | Help text, captions |
| --accent | [hex] | Accent highlights, active states |
| --accent-foreground | [hex] | Text on accent |
| --destructive | [hex] | Errors, destructive actions |
| --destructive-foreground | [hex] | Text on destructive |
| --border | [hex] | Borders, dividers |
| --input | [hex] | Form input borders |
| --ring | [hex] | Focus ring |
| --card | [hex] | Card background |
| --card-foreground | [hex] | Text on cards |

### Dark (`.dark`)
| Token | Value |
|---|---|
| --background | [hex] |
| --foreground | [hex] |
| --primary | [hex] |
| --primary-foreground | [hex] |
| --secondary | [hex] |
| --destructive | [hex] |
| …(mirror every light token that changes) | |

### Sidebar tokens
`--sidebar-background`, `--sidebar-foreground`, `--sidebar-primary`,
`--sidebar-accent`, `--sidebar-border`, `--sidebar-ring` (+ `-foreground`
variants) — [values, or "inherit from the base palette until a sidebar exists"]

### Chart palette (5)
`--chart-1` … `--chart-5` — [5 hex/HSL values chosen to be distinguishable and
on-brand; see `skills/dataviz` when charts are built]

### Semantic usage
- Primary: CTAs, active nav, key actions · Accent: selection, progress, focus
- Destructive: errors + delete only · Muted-foreground: never for primary content

## 2. Typography

### Font stack
```
Sans: [heading/body families], ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial
Mono: [mono family], ui-monospace, "SF Mono", Menlo, monospace
```
Loaded via: [Google Fonts `<link>` / self-hosted / system] <!-- /initialize -->

### Scale
| Class | px | Usage |
|---|---|---|
| text-xs | 12 | Labels, captions |
| text-sm | 14 | Secondary text, hints |
| text-base | 16 | Body |
| text-lg | 18 | Card titles, subheads |
| text-xl | 20 | Section headings |
| text-2xl | 24 | Page / modal titles |
| text-3xl | 30 | Small hero headings |
| text-4xl+ | 36+ | Hero (`clamp()` on landing) |

### Weights
400 body · 500 buttons/labels · 600 titles · 700 hero

### Heading hierarchy
h1 `text-4xl font-bold` · h2 `text-3xl font-semibold` · h3 `text-2xl font-semibold`
· h4 `text-xl font-semibold` · h5 `text-lg font-medium`

### Component typography
[TBD — set when the first components are built]
<!-- existing-project: CardTitle / CardDescription / Label / … exact classes -->

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

### Card / form / page patterns
[TBD — set when the first components are built]
<!-- existing-project: card padding, FormItem spacing, page container -->

## 4. Radius & Elevation

| Token | Value |
|---|---|
| --radius | [value] |
| --radius-sm | [value] |
| --radius-lg | [value] |

Shadows: [named shadow utilities / "Tailwind defaults until refined"]

## 5. Motion

| Token | Value |
|---|---|
| --easing | [cubic-bezier from the direction] |
| control feedback | 120–200ms |
| interface state change | 300–500ms |
| page / section reveal | 500–800ms |

Named animations: [reveal / marquee / … from the direction, or "[TBD]"]
**`prefers-reduced-motion`**: every effect renders its settled state
immediately — not a shortened animation. Non-negotiable.

## 6. Buttons
[TBD — set when the first components are built]
<!-- existing-project: CVA variant matrix (default/destructive/outline/secondary/
ghost/link), size matrix (sm/default/lg/icon), hover/focus/disabled states,
and any raw <button> that should be migrated -->

## 7. Forms
[TBD — set when the first components are built]
<!-- existing-project: form lib(s), field structure, error-text + error-border
pattern + placement, multi-step pattern -->

## 8. Cards
[TBD — set when the first components are built]

## 9. Modals / Dialog
[TBD — set when the first components are built]
<!-- existing-project: Radix Dialog parts + classes, size-override pattern -->

## 10. Icons
- **Primary:** lucide-react · **Radix:** @radix-ui/react-icons · **Custom:**
  `@/Components/icons` (logo, spinner, social)
- Sizing: h-3 w-3 (badges) · h-4 w-4 (standard) · h-5 w-5 (large buttons) ·
  h-6 w-6 (headers)
- In use: [TBD — set when the first components are built]

## 11. Layout
- Breakpoints: sm 640 · md 768 · lg 1024 · xl 1280 — mobile-first
- App / guest layout shells: [TBD — set when the layout is built]

## 12. States
- Alert colours:
  | Type | BG | Border | Text |
  |---|---|---|---|
  | Success | [green-50-ish] | [green-200-ish] | [green-900-ish] |
  | Error | bg-destructive/10 | border-destructive | text-destructive |
  | Warning | [yellow-50-ish] | [yellow-200-ish] | [yellow-900-ish] |
  | Info | [blue-50-ish] | [blue-200-ish] | [blue-900-ish] |
- Skeleton / spinner / empty-state / error-state patterns:
  [TBD — set when the first components are built]

## 13. Toasts
[TBD — set when the first components are built]

## 14. Component Library & Sourcing

- **Base primitives:** shadcn/ui (Radix) — accessible, unstyled, rethemed to the
  tokens above. The base layer for buttons, dialogs, dropdowns, tabs, etc.
- **Hero:** always ONE component from **21st.dev, Aceternity, or React Bits**
  (free tier), chosen by fit —
  `skills/_global/modern-frontend.md#The hero — always a component from 21st.dev, Aceternity, or React Bits`.
- **Sections:** the `skills/web-design/` recipe library under the
  **`build-awwwards-quality-sites`** umbrella is the primary section system.
  Component libraries (Aceternity section components, Magic UI, React Bits text,
  Motion Primitives / Cult UI / Origin UI) fill a specific drop-in gap only.
  `skills/_global/modern-frontend.md#Animated sections`.
- **Own the code:** every sourced component is copied into the repo and
  rethemed — no runtime dependency on a component gallery, no demo colours.
- **No hand-authored 3D:** meshes, GLBs, Three.js scenes, shaders, animated
  canvas/WebGL effects are always sourced (a library component, a
  `skills/web-design/` recipe, a free CC0 model, or a public Spline scene) —
  never written from a blank file.
  `skills/_global/modern-frontend.md#The agent does not model or code 3D`.

## 15. Design Principles
- **Story-driven:** the scroll tells the brand's story (hook → context →
  approach → proof → outcome → CTA); every section's animation dramatizes its
  beat. `skills/_global/modern-frontend.md#Story spine`.
- **Hero = a component from 21st.dev, Aceternity, or React Bits** — §14. Free
  tier, chosen by fit, rethemed to these tokens. A motionless hero is never
  allowed.
- **Animated throughout, via the web-design library:** every section is built
  from a `skills/web-design/` recipe under the `build-awwwards-quality-sites`
  umbrella. A plain static `<section>` is a bug.
- **Brandpack gate:** before applying any recipe or component, check it against
  THIS file. A clash with these tokens / this UI is **stop-and-reconcile** —
  pick another recipe, or propose a brandpack update via NickFury. Never
  "build it anyway".
- **The agent never models or codes 3D** — §14.
- **No legacy UI:** no default-framework, motionless, or generic-hero look;
  `skills/_global/modern-frontend.md#No Old UI`.
- **Own the code** — §14.

## 16. Libraries & Frameworks
> Binding choices. `skills/_global/modern-frontend.md` is the full menu;
> `skills/web-design/INDEX.md` is the 88 recipe folders.

| Category | Tools |
|---|---|
| **Hero — ONE component per site (free tier)** | **21st.dev** (`npx shadcn@latest add "https://21st.dev/r/<author>/<name>"`), **Aceternity UI** (components free, templates paid), **React Bits** (MIT). Chosen by fit to register + goal. |
| **Section system (primary)** | `skills/web-design/build-awwwards-quality-sites/` umbrella + `skills/web-design/INDEX.md` §1 aesthetic / §3 layout / §4 scroll-motion / §6 finishing recipes |
| **Base** | Tailwind CSS, shadcn/ui (Radix primitives), Motion (Framer Motion) |
| **Section component fill-in** (only when a recipe needs drop-in code) | Aceternity section components, Magic UI, React Bits text, Motion Primitives / Cult UI / Origin UI |
| **Scroll choreography** | GSAP + ScrollTrigger + Lenis (one smooth-scroll engine only) |
| **3D (sourced only)** | `skills/web-design/` recipe (`build-threejs-scroll-worlds`, `scroll-world-storytelling`); CC0 models (Poly Haven / Kenney / Quaternius); a public Spline scene |
| **Generative (drafts only)** | v0.dev — scaffold then refactor by hand |
| **Design intelligence (optional)** | `ui-ux-pro-max-cli` — free, no key, not auto-run |

## 17. Logo
| Variant | File path | Status |
|---|---|---|
| Light variant | [detected path + confirmation, or [TBD] on a new project] | |
| Dark variant | [same] | |
| Favicon | [same — the candidate confirmed as current] | |
| Social preview (1200×630) | [same] | |

Natasha reads the Light variant path for document headers — `[TBD]` there means
generated docs ship without a logo rather than guessing.

## 18. Known Issues
<!-- EXISTING-PROJECT MODE ONLY — omit this whole section on a new project.
Populate from detection: raw <button> not using <Button>, legacy toast patterns,
hardcoded hex in tailwind.config, form-spacing drift, missing dialog size
variants, dual font systems, near-duplicate tokens, etc. — with severity. -->

## Change Log
```

If the user chose **Skip** at the design-direction step: every token section
above ships `[TBD] — no design direction chosen at init; pick one (3 mockups)
before the first UI build`, policy sections (§14–16) stay as written.

### doc/filestructure.md
```markdown
# File Structure

## Structure

### [file_structure choice — Flat by default on a new project]

[Generated template]

## Rules
...
```

### doc/database.md  — NOT GENERATED when database = None (frontend-only)
```markdown
# Database Structure

## Overview
| Property | Value |
|----------|-------|
| Type | [SQL / Document — from the database answer] |
| Engine | [database answer] |
| ORM | [detected, or [TBD]] |

## Tables / Collections
[Existing-project mode: full exhaustive enumeration, grouped by domain if
large. State the total count. New-project mode: "None yet — schema is
designed by BlackPanther when the first data-backed feature is built."]

## Key Relationships
[Real foreign keys found while enumerating migrations/schema. Omit the
section if there are too few tables (or none) for it to be meaningful.]

## Migrations
...

## Change Log
```

### doc/testing.md (only if Hulk selected)
```markdown
# Testing

> Testing strategy and conventions. Hulk maintains.

## Framework
| Layer | Tool |
|-------|------|
| Unit | [testing answer / detected / [TBD] — choose when adding the first tests] |
| Integration | [same] |
| E2E | [same] |

## Test Database Isolation
[Detected .env.testing / sqlite override, or "Unknown — requires confirmation
before any destructive test command runs." See `hooks/guard-database.sh` and
`skills/_global/database-safety.md`. "Not applicable — frontend-only" when
database = None.]

## Coverage Expectations
[TBD]

## Running Tests
```bash
[command — from package.json scripts / detected runner, or [TBD]]
```

## Change Log
```

### doc/deployment.md (only if Groot selected)
```markdown
# Deployment

> Environments and deploy process. Groot maintains.

## Environments
| Environment | URL | Notes |
|---|---|---|
| Local | localhost | |
| Staging | [TBD] | |
| Production | [TBD] | |

## Provider / CI-CD
[deployment answer / detected / [TBD] — decide before the first deploy]

## Deploy Process
[TBD]

## Rollback Plan
[TBD — required before first production deploy; see
`security/guardrails.md` approval matrix — "deploy_production" requires
Hulk certification + NickFury approval]

## Change Log
```

### doc/development-workflow.md
```markdown
# Development Workflow

> Project-specific conventions layered on top of `skills/_global/git.md`'s
> framework-wide baseline.

## Branch Strategy
[TBD — default: feature/fix/hotfix/chore branches, squash-merge via PR,
protected branches per `hooks/guard-git.sh` defaults unless overridden]

## Issue Tracker
[Detected from the skills answer: Jira / ClickUp / Not selected — TBD]

## PR / Review Process
[TBD]

## Change Log
```

### context/root.md
```markdown
# Root Context

## Active Agents
[agents list — enforced by file layout, see Agent Enablement]

## Current Sprint / Task
- Status: idle
- Agent: —
- Task: —

## Blockers

## Pending Decisions

## Last Update
[Timestamp]
```

### memory/root.md
```markdown
# Root Memory

## Architectural Decisions

## Cross-Agent Patterns

## Security Incidents

## Stack Changes

## Mistake Log

## Initialized
[Timestamp]
```

### credentials/credentials.md
```markdown
# Credentials

## git
- No credentials needed

## docker
- No credentials needed

## [Selected skills]
- KEY: [value or PENDING]
```

## Error Handling

| Error | Response |
|-------|----------|
| avengerarmy.json missing | Abort |
| Project name empty | Re-prompt `name` |
| Description empty | Re-prompt `description` |
| Stack empty | Re-prompt `stack` (the "Other" free text can't be blank) |
| Target file exists but is the untouched shipped template (`<!-- /initialize: -->` markers, placeholder content) | Overwrite silently — that's what it's for. Don't prompt. |
| Target file exists and has real edits | Ask: Overwrite / Append / Skip |
| Credentials skipped | Mark [PENDING] |
| User asks for a 4th design direction | Regenerate all three toward what they described — don't add a 4th file. Three is the comparison set. |
| User keeps requesting changes to a preview (no convergence after ~4 rounds) | Say so plainly, summarise the current state, ask them to either approve what's there or pick a different option — don't loop indefinitely. |
| Preview HTML won't open / user can't view it | Paste the palette table + type scale + motion tokens inline as text, confirm from that, continue. The `.html` is a convenience, not a gate. |
| Design-direction step on a project with no UI agent active | Skip it entirely — `doc/brandpack.md` is not generated (existing rule). |
| Detection finds nothing (empty/new project) | New-project mode — ask the Core questions plain, skip Extended, no error, this is the expected path |
| **Existing project — Ambiguity Gate: two framework signals in a non-monorepo** (e.g. a `next.config` and an `artisan` at the same root) | One `AskUserQuestion`: which is the primary stack? List both with what pointed at each. Everything else still auto. |
| **Existing project — Ambiguity Gate: backend/API code present, zero DB signal** | One `AskUserQuestion`: PostgreSQL / MySQL / MongoDB / None — it's stateless / Other. Don't guess `None` when controllers/models exist. |
| **Existing project — Ambiguity Gate: conflicting file-structure signals** | One `AskUserQuestion`: Monorepo / Separated / Flat, listing every candidate and its signal. |
| **Existing project — Ambiguity Gate: >1 distinct design-token system, no clear canonical** | One `AskUserQuestion`: which is canonical, or are they intentionally scoped (e.g. landing vs app)? A clearly-scoped split is recorded, not asked. |
| **Existing project — a manifest / schema / config won't parse** | Note it in the summary + `doc/*.md` as "could not parse `<file>` — verify manually", fill what you can from other signals, don't abort. |
| Existing project — user says "let me confirm each" / "review everything" | Fall back to the confirm-each flow: Core questions pre-selected from detection, Extended questions asked, brand as a confirm-preview gate. |
| Existing project — user replies to the final summary with a correction | Edit only the one `doc/*.md` field they named; re-print that line; don't re-run. |
| `context/root.md` already has Active Agents populated | Idempotency check triggers — see Flow. Never silently re-run everything from scratch. |
| Agent Enablement tries to move a file that's already at its destination | Treat as already-satisfied, skip that move, continue |
| An Agent Enablement move fails (permission denied, file locked, etc.) | Stop — don't retry the same move repeatedly and don't proceed to the remaining moves for that agent, since a half-moved agent is worse than an unfinished one. Report exactly which move failed and why, leave everything else from this run as-is, let the user resolve it and re-run. |

## Example Session — New Project (the common case)

```
User: /initialize

System: 🛡️ AvengerArmy Initialization
        Scanning… empty project, no stack signal → new-project setup.

        1 — Project name?
User: Nimbus

System: 2 — One sentence: what does it do?
User: Marketing site for a weather-data API
System: Primary goal + anything out of scope? (one line, optional)
User: Launch the landing + docs by next month. No dashboard yet.

System: 3 — Stack?
        ( ) Next.js   ( ) React (Vite SPA)   ( ) Other…
User: Next.js

System: 4 — Database?
        ( ) PostgreSQL  ( ) MySQL  ( ) MongoDB  ( ) None — frontend-only  ( ) Other…
User: None — frontend-only

System: 5 — Brand name, and a primary color + tone if you have one?
User: Nimbus / #0EA5E9 / clean-technical

System: 6 — Design direction. I built 3 style-guide mockups from your brief —
        opening them now:
        · doc/brand-previews/option-a.html — "Clear Sky" (light, airy, cobalt
          accent, Inter + Geist Mono; maps to `blue-cloudy-clean-modern`;
          hero → React Bits Aurora)
        · doc/brand-previews/option-b.html — "Instrument" (dark technical glass,
          calibration-dial motifs; `glass-dark-mode-clock`; hero → React Bits
          Threads)
        · doc/brand-previews/option-c.html — "Forecast Grid" (editorial light,
          mono labels, data-grid; `editorial-tech`; hero → Aceternity Background
          Beams)
        ( ) A   ( ) B   ( ) C   ( ) Skip
User: A — but make the accent a touch deeper and tighten the radius

System: Updated doc/brand-previews/option-a.html (accent #0284C7, --radius 10px).
        Re-opening it.
User: looks good

System: 7 — Agents:
        [✓] NickFury (locked)   [✓] IronMan   [✓] Vision (small changes)
        [✓] BlackPanther   [✓] Odin (full builder)   [✓] Natasha
        [✓] Hulk   [✓] Groot
        Global skills:
        [✓] Git   [✓] Docker   [✓] Modern Frontend   [ ] Jira   [ ] ClickUp
        [ ] AWS
User: [accept defaults]

System: Agent Enablement: all 8 agents active — nothing to disable.

System: ✅ AvengerArmy initialized!
        Project: Nimbus — Next.js, frontend-only
        Design direction: "Clear Sky" — tokens live in doc/brandpack.md;
        approved mockup kept at doc/brand-previews/brand-preview.html
        Agents: 8 active
        Skills: Git, Docker, Modern Frontend, Web Design, Database Safety, Security Baseline
        Files: 10 generated (doc/database.md skipped — frontend-only;
               doc/deployment.md + doc/testing.md ship with [TBD];
               brandpack tokens concrete, component sections [TBD])
        NickFury: "Initialized. Awaiting orders."
```

No file-structure, deployment, auth, or testing question was asked — a
brand-new site hasn't decided any of them yet, and `[TBD]` is the honest
record until it does. The brandpack's **colors, type, spacing, radius and
motion are real** (from "Clear Sky"); its Buttons / Forms / Dialog / Toast
sections stay `[TBD]` until those components exist.

## Example Session — Existing Project (near-zero questions — the default)

Drop `.claude/` into an existing Next.js + Express + PostgreSQL monorepo with
Docker, GitHub Actions, next-auth, vitest, tailwind + `Components/ui/*`, then:

```
User: /initialize

System: 🛡️ AvengerArmy Initialization
        Scanning… package.json, prisma/schema.prisma (postgresql), apps/+packages/,
        Dockerfile, .github/workflows/, next-auth, vitest, tailwind.config.ts,
        Components/ui/* (11), :root/.dark tokens, Geist + Geist Mono.
        → existing project — detection decides. Just 2 questions.

        1 — Project name?   Detected "taskflow" — Enter to accept
User: [Enter]

System: 2 — One sentence: what does it do? + primary goal / out of scope (one line)
User: Team task manager for agencies. Goal: ship the billing revamp this quarter.

System: No ambiguities — everything else read from the code.
        Building the design preview → doc/brand-previews/brand-preview.html (FYI)

System: ✅ AvengerArmy initialized — everything auto-detected:

        Project      TaskFlow
        Stack        Next.js (App Router) 14 + TypeScript + pnpm  ← next.config.ts, package.json
        Database     PostgreSQL  ← prisma schema provider
        Schema       47 tables / 6 domains → doc/database.md
        Structure    Monorepo (apps/ + packages/)  ← top-level layout
        Deployment   Docker + GitHub Actions, staging + production  ← .github/workflows/
        Auth         next-auth — OAuth (Google, GitHub)  ← [next-auth] dep + app/api/auth
        Testing      Vitest (unit) + Playwright (e2e)  ← devDependencies
        Design       16 tokens (light+dark), Geist/Geist Mono, --radius 14px,
                     CVA button 6×4, 11 ui/* primitives → doc/brandpack.md (fully filled)
        Known issues 4 recorded (raw <button> ×3, hardcoded hex in tailwind.config) → brandpack §18
        Agents       all 8 (defaults) · Skills  Git, Docker, Modern Frontend, web-design
        Files        11 generated

        Anything wrong? Reply and I'll fix that one file. Otherwise you're done.
        (To change agents/skills: re-run /initialize → "update selection only".)
User: auth is Google only, drop GitHub
System: Fixed doc/project-overview.md — Auth: OAuth (Google).
```

No stack / database / structure / deployment / testing question — all read
from the code and written straight to `doc/*.md`. The only interruption would
have been a real ambiguity (two frameworks, no DB signal behind an API, etc.).

## Example — Re-running on an already-initialized project

```
User: /initialize

System: AvengerArmy already initialized for this project.
        Active agents: NickFury, IronMan, Vision, BlackPanther, Odin,
        Natasha, Hulk, Groot.

        What would you like to do?
        (•) Re-run full setup (re-asks everything, files handled per
            overwrite/append/skip)
        ( ) Update agent + skill selection only
        ( ) Cancel

User: Update agent + skill selection only

System: Agents: [current selection pre-checked]
User: [deselects IronMan — this project has no fullstack work]

System: Global skills: [current selection pre-checked]
User: [Enter]

System: Agent Enablement: moving agents/ironman.md → agents/_disabled/ironman.md
        (and its skill/context/memory files), removing its registry rows and
        NickFury's frontmatter mention.

System: ✅ Selection updated. IronMan is now disabled (re-run /initialize to
        re-enable). Nothing else was touched — doc/*.md, memory/*.md unchanged.
```
