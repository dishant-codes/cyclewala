# AvengerArmy

> Production-grade multi-agent orchestration. NickFury commands. Agents execute. Memory learns. Mistakes never repeat.

## Architecture

```
User Request
    ↓
NickFury (Orchestrator)
    ↓
[Skill Gap Check] → [Create Skill?] → [Delegate]
    ↓
Agent(s) Execute → [Self-Correct via Memory]
    ↓
Hulk QA → [Pass/Fail → Memory Update]
    ↓
Groot Deploy → [Monitor → Memory Update]
    ↓
Deliver to User
```

## Core Principles

1. **NickFury is the single entry point.** All requests route through NickFury.
2. **Memory is append-only structured logging.** Every agent logs successes, failures, patterns.
3. **Self-correction is mandatory.** Failed outputs trigger memory updates with exact fixes.
4. **Skills are atomic.** One capability = one file. Registry is single source of truth.
5. **Credentials are isolated.** Agents never touch `credentials/`. NickFury injects on need.
6. **Context is session-scoped.** Reset per session unless NickFury persists to root.
7. **No agent reads another agent's memory.** Privacy boundary enforced.

## Quick Start

This repo's contents ARE a `.claude/` folder — its `agents/`, `commands/`,
and `skills/` subfolders are named and formatted for Claude Code's real
subagent/slash-command/skill discovery. Install it by cloning/copying the
**contents** directly into `.claude/` at your project root (not as a
subfolder next to it — see [SETUP.md](SETUP.md) for the exact layout and the
one-level mistake to avoid):

```bash
git clone <this-repo-url> ./my-project/.claude
```

Then, from `my-project/`:

```bash
# Run initialization
/initialize
```

**In an existing codebase** `/initialize` asks only the **project name and
goal** — stack, database + schema, file structure, deployment, auth, testing,
and the whole design-token system are read from the code and written to
`doc/*.md` automatically, then summarised for you to correct. **In a new/empty
project** it asks a short question set plus a design-direction step (3
style-guide mockups → pick → tweak → done).

## Agent Roster

| Agent | Role | Brandpack | Skills | Memory |
|-------|------|-----------|--------|--------|
| **NickFury** | Orchestrator | ✅ | All | Root |
| **IronMan** | Fullstack | ❌ | fullstack-integration, git, docker | Agent |
| **Vision** | Frontend — small changes | ✅ | frontend-build, modern-frontend, git | Agent |
| **BlackPanther** | Backend | ❌ | api-design, git, docker, aws | Agent |
| **Odin** | Full Frontend & Page Builder | ✅ | modern-frontend, web-design, sso, page-optimize, frontend-essentials, content-research, git | Agent |
| **Natasha** | Documents | ❌ | doc-gen, git | Agent |
| **Hulk** | QA Testing | ❌ | test-pipeline, git | Agent |
| **Groot** | Deploy | ❌ | deploy-pipeline, git, docker, aws | Agent |

## Folder Structure

This whole tree is what lives under `.claude/` at your project root (see
[SETUP.md](SETUP.md)) — `agents/`, `commands/`, and `skills/` are real Claude
Code discovery folders, not just documentation:

```
.claude/                      ← this repo's contents go directly here
├── CLAUDE.md                 # Root brain — read once per session
├── avengerarmy.json          # Master config
├── settings.json             # Wires hooks/*.sh as PreToolUse hooks
├── README.md                 # This file
├── SETUP.md                  # Installation guide
├── .gitignore                # Protects credentials/settings.local.json
│
├── hooks/                    # Deterministic guardrail enforcement
│   ├── guard-git.sh          # Force-push/protected-branch/merge/secret block
│   ├── guard-database.sh     # Destructive-command + production block
│   └── protect-env.sh        # .env/key-file read/write block
│
├── agents/                   # Real Claude Code subagents (name+description frontmatter)
│   ├── nickfury.md
│   ├── ironman.md
│   ├── vision.md
│   ├── blackpanther.md
│   ├── odin.md
│   ├── natasha.md
│   ├── hulk.md
│   ├── groot.md
│   └── _disabled/             # Agents deselected in /initialize live here — moved, not deleted
│
├── commands/                 # Real Claude Code slash commands
│   └── initialize.md         # /initialize
│
├── skills/                   # Real Claude Code skills + shared skill docs
│   ├── web-design/            # 88 frontend recipes (vendored MengTo/Skills) + INDEX.md — Odin scans this first on every build
│   ├── _global/               # Shared skill docs (git, docker, database-safety, modern-frontend, …), read as context
│   ├── _ref/                  # Registry + templates
│   ├── {agent}/               # Agent-specific skill docs
│   └── _disabled/{agent}/     # Skills for a deselected agent
│
├── memory/                   # Append-only learning layer
│   ├── root.md               # Cross-agent (NickFury only)
│   ├── {agent}.md            # Per-agent learning
│   └── _disabled/{agent}.md  # Deselected agent's memory, preserved
│
├── context/                  # Session state
│   ├── root.md               # Project state (NickFury only)
│   ├── {agent}.md            # Per-agent task state
│   └── _disabled/{agent}.md  # Deselected agent's context, preserved
│
├── doc/                      # Project documentation — only what's relevant gets generated
│   ├── project-overview.md
│   ├── brandpack.md          # Skipped if no UI-facing agent is active
│   ├── filestructure.md
│   ├── database.md           # Skipped if no data-facing agent/signal exists
│   ├── testing.md            # Generated only if Hulk is active
│   ├── deployment.md         # Generated only if Groot is active
│   ├── development-workflow.md
│   └── example-workflows.md
│
├── security/
│   └── guardrails.md         # Rules, forbidden patterns, approval matrix
│
├── tools/
│   └── index.md              # Tool registry
│
└── credentials/
    └── credentials.md        # 🔒 Secrets (gitignored)
```

All paths referenced throughout this system (`memory/root.md`,
`doc/brandpack.md`, `skills/_ref/skills-registry.md`, etc.) are written
relative to `.claude/` — e.g. `memory/root.md` means `.claude/memory/root.md`
at your project root, not a `memory/` folder elsewhere in your repo.

## Memory System

### Root Memory (`memory/root.md`)
NickFury writes cross-agent intelligence:
- Architectural decisions
- Security incidents
- Coordination patterns
- Stack changes
- Multi-agent mistakes

### Agent Memory (`memory/{agent}.md`)
Each agent writes structured logs:
```markdown
## ✅ Successes
[2026-08-12 14:30] Pattern: Using Zod + React Hook Form for validation.
Result: Zero runtime validation errors. Use for all forms.

## ❌ Failures & Corrections
[2026-08-12 15:45] MISTAKE: Built login without `type="password"`.
CONTEXT: Login form component.
FIX: Always use `type="password"`, add `autocomplete`, disable submit during loading.
VERIFIED: yes

## 🔁 Patterns
[2026-08-12 16:00] Form standard: Zod schema → RHF → submit handler → toast on success.

## 👤 Preferences
[2026-08-12 16:15] User prefers dark mode default. Check `prefers-color-scheme`.

## 🚧 Skill Gaps
[2026-08-12 16:30] Needed Stripe integration skill. Requested creation.
```

**Format:** `[YYYY-MM-DD HH:MM] MISTAKE: [what]. CONTEXT: [where]. FIX: [solution]. VERIFIED: [yes/no]`

## Context System

### Root Context (`context/root.md`)
```markdown
## Active Agents
[nickfury, vision, blackpanther]

## Current Sprint
- Task: Build auth system
- Status: in_progress
- Started: 2026-08-12 14:00
- Deadline: 2026-08-13 18:00

## Blockers
- BlackPanther waiting for OAuth credentials

## Pending Decisions
- Use JWT or session cookies? (NickFury to decide)

## Last Update
2026-08-12 16:00
```

### Agent Context (`context/{agent}.md`)
```markdown
## Current Task
- Task: Build login page
- Status: in_progress
- Started: 2026-08-12 14:30
- Deadline: 2026-08-12 18:00

## Dependencies
- Waiting for: API contract from BlackPanther
- Blocking: Hulk QA

## Output Ready
- [ ] Component code
- [ ] Storybook story
- [ ] Accessibility audit

## Notes
- Using brand primary color #4F46E5
- Mobile-first responsive design
```

## Cleanup Protocol

### Context Cleanup (After Every Task)
- Each agent resets their `context/{agent}.md` to idle template
- Root context: blockers cleared, status → idle
- Exception: NickFury-approved persistent notes → moved to memory

### Memory Compression (When Needed)
- Trigger: file > 50KB OR entries > 30 days old
- Action: NickFury summarizes related entries into single pattern
- Archive: old entries moved to `memory/{agent}-archive-YYYY-MM.md`
- Root memory: quarterly compression

### Why This Matters
| Without Cleanup | With Cleanup |
|----------------|--------------|
| Context bloats with stale task notes | Fresh start every task |
| Memory grows forever | Compressed, archived, organized |
| +2000 tokens per task | +200 tokens per task |
| Agents confused by old state | Agents focused on current task |

## Skill System

### Global Skills (`skills/_global/`)
Shared capabilities. Agents load only what they need — never "read the whole
skills directory":
- `git.md` — version control, branch protection, secret detection
- `database-safety.md` — cross-stack destructive-command discipline (always active)
- `security-baseline.md` — the routine-task checklist (always active)
- `docker.md` — containerization
- `jira.md` — issue tracking
- `clickup.md` — project management (MCP-first, REST fallback)
- `aws.md` — cloud infrastructure
- `modern-frontend.md` — the tiered modern animated-UI build stack (default for Odin/Vision projects); the landing hero is always a free-tier component from 21st.dev / Aceternity / React Bits (chosen by fit), animated sections use those three first, never hand-built

### Agent Skills (`skills/{agent}/`)
Deep expertise for one agent:
- `nickfury/orchestration.md` — delegation, skill gap detection
- `vision/frontend-build.md` — small-change discipline, component patterns
- `blackpanther/api-design.md` — REST standards, security
- `odin/sso.md` — OAuth flows
- `hulk/test-pipeline.md` — testing standards
- `groot/deploy-pipeline.md` — CI/CD patterns

### Registry (`skills/_ref/skills-registry.md`)
Single source of truth. NickFury checks here before creating skills.

## Security

Two layers, not one:
- **Prompt-level** — `CLAUDE.md` + `security/guardrails.md`: credential
  isolation rules, forbidden code patterns, approval matrix, incident
  response. Agents are expected to follow these by design.
- **Deterministic** — `hooks/*.sh`, wired in `settings.json`: force-push,
  protected-branch pushes, merges, destructive database commands without
  isolation, and `.env`/key-file access are hard-blocked regardless of what
  an agent's prompt says. Verify they actually fire after install — run a
  command you expect to be blocked and confirm it is; a silently-misfiring
  hook is worse than no hook.

## License
MIT
