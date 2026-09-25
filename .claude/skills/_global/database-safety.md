# Skill: Database Safety

> Cross-stack rules for touching a database at all — read before writing any
> migration, seed, or destructive command. Backed by `hooks/guard-database.sh`,
> which enforces the hard cases mechanically; this skill covers the judgment
> calls the hook can't make.

## Purpose
Every stack this framework might be dropped into has a different destructive
command (`migrate:fresh`, `prisma migrate reset`, `rails db:reset`,
`manage.py flush`, raw `DROP TABLE`...) but the same failure mode: a command
meant for a disposable local/test database gets run against a real one.

## Prerequisites
- `doc/database.md` — read this first to know the actual DB type/engine for
  this project before assuming a pattern from a different stack applies.
- `hooks/guard-database.sh` wired in `settings.json`.

## Usage
1. **Identify the database type before touching it.** Read `doc/database.md`.
   Don't infer from a generic stack guess.
2. **Never modify a schema against production directly.** Migrations get
   written, reviewed (by BlackPanther/Natasha per `avengerarmy.json`'s
   `change_database_schema` approval), and applied through the project's
   normal migration tooling — never a hand-run `ALTER TABLE` against a
   production connection string.
3. **Destructive commands require an isolation signal.** A dedicated test
   database (`.env.testing`, a sqlite/`:memory:` override, a docker-compose
   test service) must exist and be active before running anything that wipes
   data — even in local dev, since "local" and "production" DB URLs have been
   mixed up before.
4. **If `guard-database.sh` denies a command, don't work around it** by
   editing the command to avoid the pattern match — fix the actual isolation
   gap (add the test DB config) or get explicit user confirmation to set
   `AVENGERARMY_ALLOW_DESTRUCTIVE_DB=1` for that session.

## Input
A migration, seed, or direct database command to run.

## Output
A safely-scoped database change, with the isolation/production check already
satisfied before execution — not after.

## Error Handling
| Situation | Response |
|---|---|
| Hook denies with "production detected" | Stop. Never override — there is no bypass for this one by design. Confirm with the user what environment they actually meant to target. |
| Hook denies with "no isolation signal" | Add the missing test DB config (ask the user for the intended test DB name/URL if not obvious), then retry — don't set the override env var as a first resort. |
| Migration fails halfway | Don't auto-retry a partial migration blindly — check what state the schema is actually in first; a failed migration can leave a DB half-migrated. |
| Schema drift between environments | Log it, don't silently "fix" one side to match the other without the user's input — could be intentional. |

## Using a Seeded Test Account (for browser/full-project QA)
Full-project QA needs to actually log in as someone. Never use a real
customer's credentials and never invent a fake one:
1. Look for the project's seed/fixture data (seeders, `fixtures/`,
   `db/seeds`, a documented demo account in `doc/database.md` or
   `doc/testing.md`) and use the first test/demo customer record it defines.
2. Confirm it's actually a fixture — a seed script, a name/email pattern
   like `test@`/`demo@`, or explicit documentation — before using it. If
   nothing confirms it's a fixture, stop and ask rather than guessing.
3. If no seeded test account exists yet, that's a gap to report, not one to
   fill by creating a throwaway account against a real/production database.

## Security Notes
- Never put a real connection string (with credentials) in a doc, memory
  file, or commit — `DATABASE_URL` stays in `.env`/`credentials/credentials.md`.
- A backup/snapshot before any destructive operation on a database that
  isn't clearly disposable is not optional, even when the hook allows the
  command (an isolation signal proves it's *not production* — it doesn't
  prove there's nothing worth keeping in it).

## Prohibited Actions
- Running any migrate-reset/db-wipe/DROP/TRUNCATE-class command without a
  verified isolation signal or explicit, logged user override.
- Applying an unreviewed schema change directly to production.
- Working around a `guard-database.sh` denial by rephrasing the command to
  dodge the pattern match instead of fixing the actual gap.
- **Setting `AVENGERARMY_ALLOW_DESTRUCTIVE_DB=1` yourself without the user
  explicitly confirming it first.** The hook can't tell who set that
  variable — an agent self-granting its own override defeats the whole
  point of the check. Ask, wait for a real answer, then set it.

## Memory Hooks
- Log the project's actual isolation setup once discovered (so it isn't
  re-derived every session).
- Log any destructive-command override and why it was safe that time.

## Change Log
<!-- Log updates to this skill -->
