# Skill: Security Baseline

> The routine-task checklist every agent loads instead of reading the full
> `security/guardrails.md` for a task that doesn't need the whole thing —
> token-efficiency: load this thin pointer, not the ~180-line source file,
> unless the task is specifically about security policy itself.

## Purpose
Most tasks just need the standard checklist reflexes (no hardcoded secrets,
validate input, etc.) — not the full credential-flow diagram, incident
runbooks, or approval matrix in `security/guardrails.md`. This skill is that
subset. Read the full file instead of this one when the task IS about
credentials, incident response, or the approval matrix itself.

## Prerequisites
None — this is a checklist, not an integration.

## Usage
Before finishing any code-writing or infra task, confirm:

- [ ] No hardcoded secrets (keys, tokens, passwords) anywhere in the diff
- [ ] Input validated at the boundary (API request, form submit, CLI arg)
- [ ] Output encoded for the context it renders in (HTML/SQL/shell)
- [ ] Auth check present on any newly-added protected route/endpoint
- [ ] Rate limiting considered on anything public-facing and mutating
- [ ] CORS scoped to an actual allowlist, never `*` in production
- [ ] No sensitive data written to logs
- [ ] New dependency isn't an obviously unmaintained/typosquatted package

If any item fails and can't be fixed within the current task's scope, say so
explicitly rather than shipping it silently.

## Input
A diff, config change, or infra change about to be finalized.

## Output
Either a clean pass, or a named list of what still needs fixing before this
ships.

## Error Handling
| Situation | Response |
|---|---|
| A checklist item fails and the fix is out of scope for this task | Note it in the final output, don't silently ship it, don't block the whole task over an unrelated pre-existing issue either. |
| Uncertain whether something counts as a secret | Treat it as one — read `security/guardrails.md#Credential Rules` for the full definition rather than guessing. |

## Security Notes
This file IS the security note — see `security/guardrails.md` for the
forbidden-pattern code examples (SQL injection, XSS, plaintext passwords,
etc.) this checklist is a compressed pointer to.

## Prohibited Actions
Same as `security/guardrails.md` in full — this is a subset for routine use,
not a relaxed version of the rules.

## Memory Hooks
- Log any checklist item that recurs as a mistake pattern — if the same item
  keeps failing, that's a `memory/{agent}.md` Failures entry, not just a
  one-off note here.

## Change Log
<!-- Log updates to this skill -->
