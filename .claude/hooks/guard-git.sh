#!/usr/bin/env bash
# PreToolUse hook — Bash. Deterministic backstop for Git safety rules that
# also live in CLAUDE.md / skills/_global/git.md, generalized from Phase 1's
# guard-git.sh (which existed because an agent force-pushed over a teammate's
# work before the rule was enforced anywhere but a prompt).
#
# Blocks: force-push, direct push to a protected branch, merges, and
# committing a secret-shaped diff or a staged .env file. Everything else
# passes through untouched.

set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

CMD="$(aa_extract command)"
[ -z "$CMD" ] && aa_allow

# Only look at git/gh/glab invocations — everything else is none of this hook's business.
case "$CMD" in
  git\ * | git) : ;;
  gh\ pr\ merge* | glab\ mr\ merge*) : ;;
  *) aa_allow ;;
esac

# --- Force push -------------------------------------------------------
if printf '%s' "$CMD" | grep -qE 'git[[:space:]]+push' \
   && printf '%s' "$CMD" | grep -qE '(--force([^-]|$)|--force-with-lease|[[:space:]]-f([[:space:]]|$))'; then
  aa_deny "Force-push is blocked project-wide. If you need to fix a mistaken push, revert forward with a new commit instead — see CLAUDE.md rule 1."
fi

# --- Merge (agents open PRs, humans merge) -----------------------------
if printf '%s' "$CMD" | grep -qE 'git[[:space:]]+merge' \
   || printf '%s' "$CMD" | grep -qE '^gh[[:space:]]+pr[[:space:]]+merge' \
   || printf '%s' "$CMD" | grep -qE '^glab[[:space:]]+mr[[:space:]]+merge'; then
  aa_deny "Merging is a human action, not an agent one. Open/update the PR and stop there — see CLAUDE.md rule 3."
fi

# --- Direct push to a protected branch ---------------------------------
if printf '%s' "$CMD" | grep -qE 'git[[:space:]]+push'; then
  for branch in $(aa_protected_branches); do
    # Explicit target in the command, e.g. `git push origin main`.
    if printf '%s' "$CMD" | grep -qE "git[[:space:]]+push([[:space:]]+[^[:space:]]+)?[[:space:]]+${branch}([[:space:]]|$)"; then
      aa_deny "Direct push to protected branch '$branch' is blocked. Push a feature branch and open a PR — see CLAUDE.md rule 2."
    fi
  done
  # No explicit branch in the command (`git push` / `git push origin`) — check what's checked out.
  if printf '%s' "$CMD" | grep -qE 'git[[:space:]]+push([[:space:]]+[a-zA-Z0-9_.-]+)?[[:space:]]*$'; then
    CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
    for branch in $(aa_protected_branches); do
      if [ "$CURRENT_BRANCH" = "$branch" ]; then
        aa_deny "Currently on protected branch '$branch' — this push would land directly on it. Switch to a feature branch — see CLAUDE.md rule 2."
      fi
    done
  fi
fi

# --- Committing a staged .env file or a secret-shaped diff --------------
if printf '%s' "$CMD" | grep -qE 'git[[:space:]]+commit'; then
  STAGED_FILES="$(git diff --cached --name-only 2>/dev/null || true)"
  if printf '%s' "$STAGED_FILES" | grep -qE '(^|/)\.env(\.[A-Za-z0-9_-]+)?$' \
     && ! printf '%s' "$STAGED_FILES" | grep -qE '(^|/)\.env\.(example|sample|template)$'; then
    aa_deny "A .env-style file is staged for commit. .env files hold secrets and must never be committed — unstage it (git restore --staged <file>) — see CLAUDE.md rule 4."
  fi

  STAGED_DIFF="$(git diff --cached 2>/dev/null || true)"
  if printf '%s' "$STAGED_DIFF" | grep -qE 'AKIA[0-9A-Z]{16}|-----BEGIN[A-Z ]*PRIVATE KEY-----|(api|secret)[_-]?key[[:space:]]*[:=][[:space:]]*["'"'"'][A-Za-z0-9/+_-]{16,}|Bearer[[:space:]]+[A-Za-z0-9._-]{20,}'; then
    aa_deny "The staged diff contains what looks like a real secret (API key / private key / bearer token). Remove it and use an env var or credentials/credentials.md reference instead — see CLAUDE.md rule 5."
  fi
fi

aa_allow
