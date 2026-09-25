# Skill: ClickUp

> Project management integration — task lifecycle, comments, subtasks, status,
> assignment. **Connector-first**: if a ClickUp MCP connector is available in
> the current session's tool list, use it directly — that's the expected,
> primary path (this is how the reference CallerBot `.claude` setup runs it:
> no `CLICKUP_API_KEY` ever entered, the connector handles auth). REST with a
> manual API key is a fallback ONLY for environments with no connector
> configured. Only NickFury coordinates which credential path is in use;
> other agents don't manage auth themselves either way.

## Purpose
Lets AvengerArmy read and update ClickUp tasks as part of a workflow (pick up
a task, move it through statuses, comment progress, create subtasks for
multi-agent work, hand off to QA gating before marking Complete).

## Prerequisites
- **Preferred:** a ClickUp MCP connector already configured for this session
  — check the current tool list for `clickup_*` tools (e.g.
  `..._clickup_get_task`, `..._clickup_create_task`,
  `..._clickup_filter_tasks`, `..._clickup_search`,
  `..._clickup_get_workspace_hierarchy`, `..._clickup_create_task_comment`,
  `..._clickup_update_task`) before assuming REST is needed. If those tools
  are deferred rather than directly callable, load them first (they still
  count as "available" — a connector being deferred isn't the same as a
  connector being absent).
- **Fallback only:** `CLICKUP_API_KEY` and `CLICKUP_TEAM_ID` in
  `credentials/credentials.md` (still `[PENDING]` is fine if the connector
  covers this project — no need to fill these in when it does).

## Usage

**Connector (default when available):** call the `clickup_*` tools directly
— they resolve workspace/list/task IDs, handle auth, and paginate for you.
Typical flow:
1. `clickup_get_workspace_hierarchy` / `clickup_search` / `clickup_filter_tasks`
   to locate the target task or confirm one doesn't already exist
   (Idempotency, below).
2. `clickup_create_task` / `clickup_update_task` for create/status/assignee
   changes.
3. `clickup_create_task_comment` for progress notes.
4. `clickup_add_task_to_list` / the subtask-creating call for multi-agent
   work (see Conventions).
No API key is read, logged, or requested from the user in this path.

**REST fallback** (no connector configured — confirm this before falling
back, don't default to it):
```bash
# Look up a task before creating anything — avoid duplicates (Idempotency)
curl -s -H "Authorization: $CLICKUP_API_KEY" \
  "https://api.clickup.com/api/v2/list/$LIST_ID/task?include_closed=true" \
  | jq '.tasks[] | select(.name == "Exact Task Name")'

# Create (only after the lookup above found nothing)
curl -s -X POST -H "Authorization: $CLICKUP_API_KEY" -H "Content-Type: application/json" \
  "https://api.clickup.com/api/v2/list/$LIST_ID/task" \
  -d '{"name":"Task name","description":"...","status":"to do"}'

# Update status
curl -s -X PUT -H "Authorization: $CLICKUP_API_KEY" -H "Content-Type: application/json" \
  "https://api.clickup.com/api/v2/task/$TASK_ID" \
  -d '{"status":"in progress"}'

# Comment
curl -s -X POST -H "Authorization: $CLICKUP_API_KEY" -H "Content-Type: application/json" \
  "https://api.clickup.com/api/v2/task/$TASK_ID/comment" \
  -d '{"comment_text":"Progress note"}'

# Subtask (full-stack work spanning multiple agents)
curl -s -X POST -H "Authorization: $CLICKUP_API_KEY" -H "Content-Type: application/json" \
  "https://api.clickup.com/api/v2/list/$LIST_ID/task" \
  -d '{"name":"Subtask name","parent":"'"$TASK_ID"'"}'

# Assignee
curl -s -X PUT -H "Authorization: $CLICKUP_API_KEY" -H "Content-Type: application/json" \
  "https://api.clickup.com/api/v2/task/$TASK_ID" \
  -d '{"assignees":{"add":['"$USER_ID"']}}'
```

## Conventions
- Status mapping: `To Do` → `In Progress` → `Review` → `Complete`.
- Custom fields (create if the workspace doesn't have them; ask user first):
  agent assigned, skill needed, deploy-ready.
- **Idempotency:** before creating a task or subtask, search/filter by exact
  name (and parent, for subtasks) within the target list. If found, update
  it instead of creating a duplicate. Tag agent-created tasks with a
  consistent marker (custom field or tag, e.g. `avengerarmy-created`) so
  repeat runs can find them reliably.
- **QA gating:** never move a task to `Complete` until Hulk has certified it
  (see `security/guardrails.md` deploy approval matrix). `In Progress` →
  `Review` is the agent's ceiling; `Review` → `Complete` requires the QA gate
  to have passed.

## Input
A task reference (ID, or name + list for lookup), and the action to perform.

## Output
The updated/created task's ID and current status, logged back to the
requesting agent — not the raw API response.

## Error Handling

**Connector path:** if a `clickup_*` tool call errors, read the tool's error
message (connectors typically surface a clear reason — permission, not
found, rate limit) rather than guessing; don't fall back to REST just
because one connector call failed — retry the connector call first unless
the error is clearly "connector not configured."

**REST fallback path:**

| HTTP status | Meaning | Response |
|---|---|---|
| 401 | Invalid/expired token | Do not retry with the same token. Tell NickFury the credential needs rotation; NickFury updates `credentials/credentials.md` and logs it. Never print the token value while reporting this. |
| 403 | Token valid, insufficient permission for this list/space | Stop — do not try alternate endpoints to work around it. Report which resource was denied. |
| 404 | Task/list/space ID doesn't exist (or was deleted) | Re-verify the ID via lookup before assuming it's a transient error. Don't invent a new ID. |
| 409 | Conflict (e.g. task already has this exact update, or a name collision on create) | Treat as "already done" for idempotent operations — verify current state, don't blindly retry the write. |
| 429 | Rate limited | Back off using the `X-RateLimit-Reset` header if present, otherwise a fixed short backoff (e.g. 5s), and retry up to 3 times. Never busy-loop. |
| 5xx | ClickUp-side failure | Retry up to 3 times with backoff; if still failing, stop and report — don't silently drop the update. |

Bounded retries everywhere: max 3 attempts, exponential-ish backoff, then
surface the failure rather than looping.

## Security Notes
- **Connector path:** no credential ever touches this framework's files —
  the connector is configured at the platform/account level, outside
  `.claude/`. Nothing to rotate here, nothing to leak from `credentials.md`.
- **REST fallback path:** never hardcode `CLICKUP_API_KEY`/`CLICKUP_TEAM_ID`
  in code, skill files, or commit history — read from
  `credentials/credentials.md` via NickFury only, never log the raw
  Authorization header value.
- Don't guess task/list/space IDs either way — a wrong ID sent to a write
  endpoint can silently modify the wrong task; always resolve via
  lookup/search first if an ID wasn't explicitly given.

## Prohibited Actions
- Creating a task without first searching for an existing match (no
  duplicate-task spam on repeat runs).
- Marking a task `Complete` without a passed QA gate.
- Falling back to REST/API-key mode when a connector is already available
  and working.
- Any agent other than NickFury reading a raw REST credential value (N/A
  when using the connector).
- Guessing at a `LIST_ID`/`TEAM_ID`/`TASK_ID` instead of looking it up.

## Memory Hooks
- Log status-mapping customizations if this workspace differs from the
  default (`To Do → In Progress → Review → Complete`).
- Log automation triggers the user sets up (e.g. "Complete" webhook to
  notify a channel).
- Log whether this project runs connector or REST mode, so it isn't
  re-discovered every session.
- Log any 401/403 encountered (REST mode) so a stale-credential pattern
  isn't repeated.

## Change Log
- Connector-first usage confirmed live (workspace hierarchy call returned
  real data) and matched to the reference CallerBot `.claude` setup, which
  runs ClickUp exclusively via MCP with no API key configured.
