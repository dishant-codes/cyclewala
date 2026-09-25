# Root Memory

## Architectural Decisions
- 2026-09-12 — Cycle Wala's design system and site architecture are a direct
  port of a user-supplied reference Next.js project
  (`E:\laragon\www\-Gireesh-Portfolio`), recolored (red → green) rather than
  built from `skills/web-design/` recipes. This is a deliberate exception to
  the usual recipe-driven build path, made explicit by the user; the framework
  rule against hand-authored 3D is satisfied because the Three.js/GLSL code is
  copied from supplied reference code, not authored from a blank file.

## Cross-Agent Patterns

## Security Incidents

## Stack Changes

## Mistake Log
- 2026-09-12 — This `.claude/` folder had been reused across at least two
  unrelated prior projects (ByteSetu, TechVenta) without being reset —
  `doc/*.md`, `context/root.md`, and `credentials/credentials.md` all
  described projects/code that didn't exist in the working directory, and
  `agents/_disabled/` was empty even though the docs claimed agents were
  disabled. Lesson: before trusting `context/root.md#Active Agents` as a
  signal that a project is already initialized, verify the working directory
  actually contains matching project code — don't assume `.claude/` state and
  repo state agree.

## Initialized
2026-09-12
