# AvengerArmy — Root Brain

> Read ONCE per session. Pass facts forward. Never re-read unless this file changed.

## What this is
A generic, stack-agnostic multi-agent framework. Nothing here is specific to
any one project — project facts live in `doc/*.md`, agent activation lives in
`context/root.md`, everything else in this file is framework policy.

## First thing, every project
If `context/root.md#Active Agents` is empty or `doc/project-overview.md`
hasn't been filled in yet, this project hasn't been initialized. Run
`/initialize` before doing anything else — it generates the `doc/*.md`
knowledge base everything else depends on.
- **Existing project** (any real stack signal): it asks **only** the project
  name and goal, reads everything else — stack, database + schema, structure,
  deployment, auth, testing, the full design-token system + known issues —
  straight from the code, and prints one summary to correct. Agents/skills get
  the defaults.
- **New/empty project:** a short set of questions (stack, database, agents,
  skills) + the design-direction step (3 style-guide mockups → pick → iterate).

## Entry point
Route ALL work through **NickFury** (`agents/nickfury.md`). Never call a
specialist agent directly — NickFury checks skill gaps, active-agent status,
and credential/deploy gates before delegating. See `agents/nickfury.md` for
the full delegation matrix.

## Loading policy (token efficiency)
- Load only the skill file(s) a task actually needs — `skills/{agent}/` for
  agent-specific work, `skills/_global/{name}.md` for cross-cutting ones
  (git, docker, database-safety, etc). Never "read the whole skills
  directory" or "read every global skill" as a precaution.
- Read `memory/{agent}.md` + `context/{agent}.md` for your own agent scope
  only. Never read another agent's memory/context.
- Don't re-read a file already loaded this session unless something wrote to
  it since.
- Full efficiency rules: `security/guardrails.md#Efficiency Rules`.

## Non-negotiable safety rules
These are enforced two ways: deterministically by `hooks/*.sh` (wired in
`settings.json`) where the check is mechanical, and by every agent's prompt
where it requires judgment. Hooks fail closed — if a hook denies an action,
do not attempt to bypass it; explain the block to the user.

1. **No force-push, ever.** No `git push --force`/`-f` on any branch.
2. **No direct push to a protected branch** (`main`/`master`/`production`/
   `release` by default — see `AVENGERARMY_PROTECTED_BRANCHES` in
   `hooks/guard-git.sh`). Feature branches only; humans merge.
3. **No `git merge` / PR-merge by an agent.** Open the PR/MR, stop there.
4. **Never read, write, or commit `.env`/`.env.production`/etc.** (`.env.example`
   and equivalents are fine — they're documentation, not secrets.)
5. **Never commit a secret-shaped string** (API keys, private key blocks,
   long bearer tokens) — `guard-git.sh` scans staged diffs on `git commit`.
6. **No destructive database command** (`DROP`, `TRUNCATE`, `migrate:fresh`,
   `db:wipe`, `prisma migrate reset`, etc. — see `guard-database.sh` for the
   full cross-stack list) **without an isolation signal**, and never at all
   against a production-marked environment.
7. **No production deploy without Hulk's QA certification** and NickFury's
   approval, plus a rollback plan from Groot.
8. **Credentials flow through NickFury only.** No other agent reads
   `credentials/credentials.md` directly; NickFury injects key *names* into
   an agent's context, never values, and nothing ever logs a value.
9. **No skill or agent created without user + NickFury approval**, checked
   against `skills/_ref/skills-registry.md` first (don't duplicate).
10. **Unselected agents stay unselected.** If an agent isn't in
    `context/root.md#Active Agents`, don't delegate to it, don't assume its
    output exists, and don't re-enable it without the user running
    `/initialize` again.

## Map
| Need | Look here |
|---|---|
| Who does what | `agents/*.md`, `skills/_ref/agent-manifests.md` |
| Is a skill available | `skills/_ref/skills-registry.md` |
| Build a website / page / UI | route to Odin — a "create a website" task runs under the **`skills/web-design/build-awwwards-quality-sites` umbrella**, builds every section from a **`skills/web-design/` recipe** (the primary section system; component libraries fill drop-in gaps only), and opens the hero with **a component from 21st.dev, Aceternity, or React Bits** (free tier, by fit) — never hand-built. Every recipe/component is checked against `doc/brandpack.md` first (clash = reconcile, not build-anyway). No hand-authored 3D/shaders — always sourced. Full playbook: `skills/_global/modern-frontend.md` |
| Project facts | `doc/*.md` (only what `/initialize` actually generated exists) |
| Full guardrails | `security/guardrails.md` |
| Deterministic enforcement | `hooks/*.sh` + `settings.json` |
| Retry/fix-loop limits | `security/guardrails.md#Retry & Escalation Ceiling` |
| Credential inventory (names only) | `credentials/credentials.md` |
| Session state | `context/*.md` (reset after each task) |
| Durable learning | `memory/*.md` (append-only) |

## Disabled agents
Agents not selected in `/initialize` live under `agents/_disabled/`,
`skills/_disabled/{agent}/`, `context/_disabled/{agent}.md`,
`memory/_disabled/{agent}.md` — moved there, not deleted, so re-enabling
later doesn't lose history. Nothing in an active session should read from
`_disabled/`.
