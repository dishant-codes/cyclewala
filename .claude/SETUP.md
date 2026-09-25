# Setup Guide

> How to install and configure AvengerArmy.

## Step 1: Install as `.claude/`

AvengerArmy's own folders (`agents/`, `commands/`, `skills/`) are named and
formatted to match what **Claude Code itself** auto-discovers — real
subagents and a real `/initialize` slash command —
but only if this repo's *contents* land directly inside your project's
`.claude/` folder, not as a subfolder next to it.

```bash
# clone straight into .claude/ …
git clone <avengerarmy-repo-url> ./my-project/.claude

# …or if you already have a local copy:
cp -r /path/to/avengerarmy/. ./my-project/.claude/
```

Skip the packaging leftover when copying (`*.zip`) — that's not part of the
system, just an artifact of distribution.

Your project:
```
my-project/
├── .claude/                   ← avengerarmy's contents go directly here
│   ├── CLAUDE.md               (root brain, read once per session)
│   ├── README.md
│   ├── avengerarmy.json
│   ├── settings.json           (wires hooks/*.sh)
│   ├── hooks/                  (deterministic git/database/env guardrails)
│   ├── agents/                (real Claude Code subagents: nickfury, vision, …)
│   ├── commands/               (real slash commands: /initialize)
│   ├── skills/                 (web-design recipe library + shared skill docs)
│   ├── memory/
│   ├── context/
│   ├── doc/
│   ├── security/
│   ├── tools/
│   └── credentials/
├── src/                       # Your code
├── package.json
└── ...
```

This is *not* the same as "copy the `avengerarmy/` folder into your project" —
the folder's contents must be directly under `.claude/`, one level up from
where a plain copy would put them. Get this one level wrong and neither
`/initialize` nor the agents will be discovered.

## Step 2: Initialize

### Option A: /initialize Command
```
/initialize
```

### Option B: Manual Setup
If your AI tool doesn't support slash commands, manually create:

#### doc/project-overview.md
```markdown
# YourProjectName

> Description

## Stack
React / Node.js / PostgreSQL

## Active Agents
- NickFury
- Odin
- Vision
- BlackPanther

## Initialized
2026-08-12
```

#### doc/brandpack.md
```markdown
# Brand Pack

| Property | Value |
|----------|-------|
| Name | YourBrand |
| Primary Color | #HEX |
| Tone | professional |
```

#### doc/filestructure.md
```markdown
# File Structure

```
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── ui/
│   └── config/
```
```

#### doc/database.md
```markdown
# Database Structure

## Overview
| Property | Value |
|----------|-------|
| Type | SQL |
| Engine | PostgreSQL |

## Tables
### users
- id, email, name, created_at
```

#### context/root.md
```markdown
# Root Context

## Active Agents
- NickFury
- Odin
- Vision
- BlackPanther

## Current Sprint
Status: idle

## Last Update
2026-08-12
```

#### memory/root.md
```markdown
# Root Memory

## Decisions

## Patterns

## Security Incidents

## Initialized
2026-08-12
```

#### credentials/credentials.md
```markdown
# Credentials

## git
- No credentials needed

## [Your tools]
- API_KEY: [your-value]
```

#### skills/_ref/skills-registry.md
```markdown
## Active Global Skills
- Git ✅
- Docker ✅
```

## Step 2.5: Verify the hooks actually fire

`hooks/*.sh` need `bash` on PATH (Git Bash on Windows, native on
macOS/Linux) and are wired via `settings.json`. Before relying on them,
confirm they're actually intercepting — a hook that silently no-ops is worse
than no hook at all, because everyone believes it's protecting them. From
`my-project/`:

```bash
# Should be denied — confirms guard-git.sh is live
git push origin main --force

# Should be denied — confirms protect-env.sh is live (only if .env exists)
# (ask your AI tool to read .env directly and confirm it refuses)
```

If either succeeds instead of being blocked, check that `bash` is on PATH
and that `settings.json` was actually copied into `.claude/` (not skipped
along with the packaging leftovers).

## Step 3: Configure AI Tool

### Claude Code
Nothing more to do — Step 1 already placed everything where Claude Code looks
for it (`.claude/agents/*.md`, `.claude/commands/*.md`, `.claude/skills/*/SKILL.md`).
Open Claude Code in `my-project/` and either run `/initialize` or just talk
to it: `NickFury, I need a login page with Google SSO.` — real subagents,
invoked by name or auto-selected, not a persona you have to role-play into.

### Cursor
```bash
mkdir -p .cursor/rules/avengerarmy
cp .claude/agents/*.md .cursor/rules/avengerarmy/
```

### VS Code + Copilot
```bash
mkdir -p ~/.github/agents/avengerarmy
cp .claude/agents/*.md ~/.github/agents/avengerarmy/
```

### Generic (any other AI tool)
Reference agent files in prompts:
```
You are NickFury from AvengerArmy.
Read .claude/agents/nickfury.md for instructions.
Read .claude/context/root.md for current state.
```

## Step 4: Start Working

```
NickFury, I need a login page with Google SSO.
```

NickFury will delegate to Odin (SSO flow + login UI), BlackPanther (API).

## Step 5: Watch Memory Grow

After each task, check:
- `memory/root.md` — NickFury's cross-agent learnings
- `memory/{agent}.md` — Each agent's personal learnings

## Troubleshooting

### "Config missing"
Ensure `avengerarmy.json` exists directly under `.claude/` (not one level
deeper, and not still sitting inside an `avengerarmy/` subfolder).

### Agents not responding
1. Check agent files loaded in AI tool
2. Verify `context/root.md` has correct agents
3. Check `skills/_ref/skills-registry.md`

### Credentials not working
1. Verify `credentials/credentials.md` has values (not [PENDING])
2. Check NickFury injects properly
3. Ensure file is NOT committed to git

### Memory not updating
1. Check file permissions on `memory/`
2. Ensure agents write to own files
3. NickFury writes to `memory/root.md`

### A blocked command went through anyway
1. Confirm `bash` is on PATH — the hooks are shell scripts
2. Confirm `settings.json` exists directly under `.claude/` and still has
   its `hooks.PreToolUse` block pointing at `hooks/*.sh`
3. Re-run the Step 2.5 check above; if it still doesn't block, the hook
   isn't wired for this session — restart your AI tool session (hook config
   is typically read at session start)
