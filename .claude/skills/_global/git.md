# Skill: Git

> Version control standard — branch discipline, safe staging, and the rules
> `hooks/guard-git.sh` enforces mechanically so this skill doesn't have to be
> trusted on prompt alone.

## Purpose
Every agent that touches source control (all of them, indirectly, via
IronMan/Vision/BlackPanther/Odin/Groot) follows this skill for how to branch,
stage, commit, and push. It does not cover merging — merging is never an
agent action (see Prohibited below).

## Prerequisites
- A git repository already initialized at the project root.
- `hooks/guard-git.sh` wired in `settings.json` (ships with this framework —
  confirm it's present; if missing, the rules below are advisory only).

## Usage

```bash
# 1. Status/diff — always check before acting
git status
git diff                       # unstaged
git diff --cached              # staged

# 2. Branch — always from an up-to-date base
git checkout main && git pull origin main
git checkout -b feature/short-description   # or fix/, hotfix/, chore/

# 3. Stage explicitly — never blind-stage
git add path/to/file.ts path/to/other.ts    # not `git add -A` / `git add .`
                                              # by default; only stage what
                                              # you intentionally changed

# 4. Commit — conventional, scoped
git commit -m "feat: add rate limiting to login endpoint"

# 5. Push — feature branch only
git push origin feature/short-description
# Open a PR/MR here. Stop. A human merges.
```

## Conventions
- Branch prefixes: `feature/`, `fix/`, `hotfix/`, `chore/`.
- Commit format: `type: subject` (`feat`, `fix`, `docs`, `refactor`, `test`,
  `chore`) — imperative mood, no period.
- Protected branches (never pushed to directly, never merged into by an
  agent): `main`, `master`, `production`, `release` by default — see
  `AVENGERARMY_PROTECTED_BRANCHES` if the project uses different names.
- Squash-merge preferred at PR time (a human's call, not this skill's).

## Input
A change already made in the working tree, and a decision about what subset
of it belongs in this commit.

## Output
A pushed feature branch with a clean, reviewable commit history — never a
merge, never a direct push to a protected branch.

## Human Confirmation Gates
Three separate yes/no checkpoints — none of them implied by the others.
Getting a "yes" to one is not permission for the next:

1. **Before writing any code — ask, with real options, not an open
   question.** Check `git status`/current branch first. If there's
   uncommitted work that isn't part of this task, stop and ask before
   building on top of it. Then ask explicitly, offering the actual choices
   rather than a vague "should I branch?":
   - **Create a new branch** — and *which base*: `development` (if the
     project uses a dev-integration branch), `main`/`master`, or another
     branch the user names. Never assume which one — a project on a
     `main`-only flow and one on a `development`-gated flow look identical
     from the code alone.
   - **Use the current branch as-is** (already a feature branch reasonably
     scoped to this task, or the user says to just keep working here).
   - **No branch at all — edit directly on what's currently checked out.**
     A real, legitimate answer for a quick fix or a solo/local project; not
     the default, but don't treat it as unavailable either.
   Only start coding after one of these three is actually chosen — don't
   default to "create a branch" just because it's the safest-sounding
   option. If `doc/development-workflow.md` documents this project's
   convention, offer it as the suggested default, not an auto-applied one.
   For a batch of related items (e.g. a series of similar pages built
   together), suggest **one shared branch for the series** rather than one
   per item, if branching is the chosen path. Creating a *local* branch as
   normal workspace setup doesn't itself need a second approval; pushing it
   for the first time does (gate 3) — and if "no branch" was chosen, gates
   2 and 3 still apply exactly the same to whatever branch is checked out.
2. **After the code is done — ask to commit, with the exact file list.**
   Look at `git status --short`/`git diff --stat` first — never
   `git add -A`/`git add .` as a shortcut. State the exact files about to
   be staged (by name, not "the usual files") and what changed in each,
   plus anything nearby you're deliberately *not* staging. Then wait for
   real approval in the user's own words ("approve," "go ahead," "yes,
   commit this"). **These are not approval, even though they sound
   adjacent:** "finish the task," "complete this," "test it," "prepare
   it" — those are scoped to the implementation, not to git operations on
   top of it. Approval covers this change only, not standing permission
   for the next one.
3. **After a commit — ask to push, separately.** Even immediately after a
   "yes" to commit, push needs its own explicit yes — don't fold it into
   the commit question. This also covers the first push of a new branch
   and opening a PR/MR (`gh pr create`/equivalent) if one's wanted — same
   gate, not a separate approval-free step.

This is a workflow courtesy, not a hook — nothing mechanically blocks
skipping it, which is exactly why it has to actually be asked every time
rather than assumed from a prior task's answer.

## Error Handling
| Situation | Response |
|---|---|
| `guard-git.sh` denies a force-push | Do not retry with a workaround (`--force-with-lease`, deleting and re-pushing the branch). Explain the block to the user; if history genuinely needs correcting, that's a human decision. |
| `guard-git.sh` denies a push to a protected branch | Create a feature branch from the current state and push that instead. |
| `guard-git.sh` denies a commit (staged `.env` or secret-shaped diff) | `git restore --staged <file>` the offending file, fix the secret (env var / `credentials/credentials.md` reference), then re-commit. |
| Merge conflict on rebase/pull | Resolve conflicts file-by-file with the user's intent in mind; never auto-resolve by discarding one side without checking what it contained. Log the resolution pattern per Memory Hooks. |
| Detached HEAD / wrong branch | `git status` first, always, before any write — this skill assumes you checked. |

## Security Notes
- Never commit `.env`/`.env.*` (except `.example`/`.sample`/`.template`),
  `*.key`, `*.pem`, `*.p12`, `*.pfx` — `hooks/protect-env.sh` blocks reading
  them and `hooks/guard-git.sh` blocks committing a staged one, but don't
  rely on the hook as the only check: look at `git status` output yourself.
- Never write an API key, token, or password literal into a commit message
  or diff — use `credentials/credentials.md` (via NickFury) or an env var.
- `git log`/`git blame` output may itself leak history — if a secret was
  ever committed, rotating it is not optional even after removing it from
  the current tree (old commits keep it in history).

## Prohibited Actions
- `git push --force` / `-f` / `--force-with-lease` on any branch.
- `git push` (direct or via no-arg push while checked out) to a protected
  branch.
- `git merge`, `gh pr merge`, `glab mr merge` — open the PR/MR and stop.
- `git add -A` / `git add .` as a default habit — stage what you meant to
  change, not everything sitting in the working tree.
- Rewriting history on a branch someone else may have already pulled
  (`git rebase`/`git commit --amend` on a shared branch).

## Memory Hooks
- Log merge-conflict resolutions and why one side won.
- Log rebase-vs-merge preference if the user states one.
- Log any time a hook denial required a workflow change (e.g. "this project
  uses `develop` as an additional protected branch").

## Change Log
<!-- Log updates to this skill -->
