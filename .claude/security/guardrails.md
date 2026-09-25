# Security Guardrails

> Forbidden patterns, credential rules, safety boundaries. All agents follow.

## Credential Rules

### Absolute Prohibitions
1. **NEVER** hardcode secrets in code, docs, or outputs
2. **NEVER** commit `credentials/credentials.md`
3. **NEVER** log API keys, tokens, passwords in memory/context
4. **NEVER** send credentials over unencrypted channels
5. **NEVER** store credentials in env vars on shared systems

### Credential Flow
```
Agent needs credential
    ↓
Requests via NickFury
    ↓
NickFury reads credentials/credentials.md
    ↓
Injects into agent context (name logged, value hidden)
    ↓
Agent uses credential
    ↓
NEVER logs or outputs credential value
```

### Rotation Policy
- Rotate API keys every 90 days
- Rotate immediately if leak suspected
- Log rotation in `memory/root.md`

## Forbidden Code Patterns

### JavaScript/TypeScript
```javascript
// ❌ NEVER
eval(userInput);
new Function(userInput);
document.write(userInput);
element.innerHTML = userInput;

// ❌ NEVER — SQL injection
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ ALWAYS — parameterized
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);

// ❌ NEVER — disabled security
app.use(cors({ origin: '*' })); // production

// ✅ ALWAYS — whitelist
app.use(cors({ origin: ['https://myapp.com'] }));

// ❌ NEVER — JWT secret in client
const SECRET = 'hardcoded-secret';

// ✅ ALWAYS — env var
const SECRET = process.env.JWT_SECRET;
```

### Infrastructure
```dockerfile
// ❌ NEVER — root container
USER root

// ✅ ALWAYS — non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

// ❌ NEVER — latest tag
FROM node:latest

// ✅ ALWAYS — pinned
FROM node:20.11.0-alpine
```

### Authentication
```javascript
// ❌ NEVER — plaintext passwords
const user = await db.query('SELECT * FROM users WHERE password = ?', [password]);

// ✅ ALWAYS — bcrypt/Argon2
const match = await bcrypt.compare(password, hashedPassword);

// ❌ NEVER — no rate limiting
app.post('/api/login', handler);

// ✅ ALWAYS — rate limiting
app.post('/api/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), handler);
```

## Git Safety
Full skill: `skills/_global/git.md`. Mechanically enforced by
`hooks/guard-git.sh` (wired in `settings.json`) — these aren't just prompt
rules, the hook denies the action outright:
- No force-push (`--force`/`-f`/`--force-with-lease`) on any branch.
- No direct push to a protected branch (`main`/`master`/`production`/
  `release` by default, project-configurable via `AVENGERARMY_PROTECTED_BRANCHES`).
- No `git merge` / `gh pr merge` / `glab mr merge` by an agent — open the
  PR/MR, a human merges.
- No committing a staged `.env`-style file, and no committing a diff that
  matches a secret-shaped pattern (API key, private key block, bearer token).

## Database Safety
Full skill: `skills/_global/database-safety.md`. Mechanically backed by
`hooks/guard-database.sh` for the commands it can pattern-match:
1. **Identify the database type first** — read `doc/database.md` before
   assuming a pattern from a different stack applies.
2. **Never modify production schema directly** — migrations are written,
   reviewed, and applied through the project's own tooling.
3. **Destructive commands** (`DROP`/`TRUNCATE`/`migrate:fresh`/
   `db:wipe`/`prisma migrate reset`/etc.) **require a verified isolation
   signal** (dedicated test DB config) — the hook denies unconditionally
   against a detected production environment, no override exists for that
   case.
4. **Backups before destructive operations** on anything not clearly
   disposable, even when the hook allows the command.

## Retry & Escalation Ceiling
Every fix-verify cycle is capped at **3 attempts** — this applies whether
it's agent↔agent (Hulk fails a test, sends it back, retests) or agent↔user
(NickFury's User-Reported Regression Protocol: user says it's still broken
after a claimed fix). On the 3rd consecutive failure of the *same* issue:
1. **Stop retrying automatically.** A 4th attempt with no new information
   is how token budgets die and "fixed" stops meaning anything.
2. **Report what was actually tried** — each attempt and why it failed —
   not just "still broken."
3. **Ask the user how to proceed** instead of silently trying again.
The count resets only when the fix attempt is based on genuinely new
information (a different root cause identified, not a retry of the same
approach). Applies to: Hulk↔specialist QA loops, Groot deploy-fail→redeploy
cycles, NickFury's User-Reported Regression Protocol, and NickFury's
Conflict Resolution (Rule 6) if the same disagreement recurs after a
decision was already made.

## Agent Behavior Boundaries

### Privacy Rules
- No agent reads another agent's memory
- No agent writes to root memory without NickFury
- No agent modifies brandpack without approval

### Workflow Rules
- No agent bypasses Hulk QA for production deploy
- No agent creates skills without user approval
- No agent accesses credentials directly

### Communication Rules
- Agents communicate through NickFury, not directly
- Agent outputs never contain credential values
- Agent context references credential names, not values

## Approval Matrix

| Action | Approval Required | Log Location |
|--------|------------------|--------------|
| Create skill | User + NickFury | `memory/root.md` + registry |
| Modify brandpack | NickFury | `memory/root.md` |
| Access credentials | NickFury + User | `context/root.md` (name only) |
| Deploy production | Hulk cert + NickFury | `memory/root.md` |
| Change DB schema | Natasha + NickFury | `memory/root.md` + `doc/database.md` |
| Add global tool | User + NickFury | `memory/root.md` + `tools/index.md` |
| Disable guardrail | User + NickFury (emergency) | `memory/root.md` + this file |

## Incident Response

### Secret Leak
1. **IMMEDIATE:** Rotate credential
2. **Log:** `memory/root.md` → Security Incidents
3. **Assess:** What was exposed? What systems affected?
4. **Notify:** All agents that used credential
5. **Prevent:** Update guardrails if systemic

### Vulnerability Found
1. **STOP** deploy pipeline
2. **Patch** vulnerability
3. **Hulk retests**
4. **Log** in `memory/root.md`
5. **Update** agent memory with new pattern

### Agent Violates Guardrail
1. **NickFury intervenes**
2. **Log** violation in `memory/root.md`
3. **Retrain** agent with corrected instructions
4. **If repeated** → escalate to user

## Efficiency Rules (All Agents Follow)

Token spend is a first-class constraint, not an afterthought.

- **Read only what the current task needs.** An agent reads its own
  `memory/{agent}.md` + `context/{agent}.md` + root memory/context, plus
  exactly the skill file(s) — global or agent-specific — the task actually
  calls for. Never preload every global skill "just in case," never read
  another agent's memory/context.
- **One agent per task, unless the task genuinely spans roles.** If the user
  names an agent directly ("Odin, do this"), NickFury delegates to that agent
  only — it does not fan out to others without a reason the task itself
  supplies.
- **Don't re-read unchanged files within a session.** If `doc/brandpack.md` or
  `context/root.md` was already read this session and nothing has written to
  it since, use what's already in context instead of reading it again.
- **Targeted reads over full-file dumps.** Grep/read the section relevant to
  the task rather than pulling in an entire large file when only part of it
  is needed.
- **Concise outputs.** Report what changed and why, not a restated copy of
  file contents the user can already see. Memory log entries follow the
  compact `MISTAKE/CONTEXT/FIX/VERIFIED` format — no prose padding.
- **Batch independent tool calls** instead of issuing them one at a time
  when there's no dependency between them.

## Security Checklist (Every Task)
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] Output encoding for dynamic content
- [ ] Auth check on protected routes
- [ ] Rate limiting considered
- [ ] CORS properly configured
- [ ] Dependencies scanned for vulnerabilities
- [ ] No sensitive data in logs
