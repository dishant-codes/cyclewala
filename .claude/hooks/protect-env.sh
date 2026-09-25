#!/usr/bin/env bash
# PreToolUse hook — Read|Edit|Write. Deterministic backstop against agents
# touching secret-bearing files directly, generalized from Phase 1's
# protect-env.sh. `.env.example`/`.env.sample`/`.env.template` are exempt —
# those are documentation of required vars, not secrets.

set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

FILE_PATH="$(aa_extract file_path)"
[ -z "$FILE_PATH" ] && aa_allow

BASENAME="$(basename -- "$FILE_PATH")"

case "$BASENAME" in
  .env.example|.env.sample|.env.template) aa_allow ;;
esac

case "$BASENAME" in
  .env|.env.*)
    aa_deny "Direct access to '$FILE_PATH' is blocked — .env files hold secrets. If you need to know which variables are required, read the .env.example/.env.sample equivalent instead — see CLAUDE.md rule 4."
    ;;
esac

case "$FILE_PATH" in
  *.pub) : ;; # public keys are not secrets
  *.pem|*.key|*id_rsa*|*.p12|*.pfx)
    aa_deny "Direct access to '$FILE_PATH' is blocked — this looks like a private key or certificate file — see CLAUDE.md rule 4."
    ;;
esac

aa_allow
