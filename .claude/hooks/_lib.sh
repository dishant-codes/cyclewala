#!/usr/bin/env bash
# Shared helpers for AvengerArmy PreToolUse hooks.
# Sourced by guard-git.sh / guard-database.sh / protect-env.sh — not run directly.
#
# Hook contract: read the PreToolUse JSON payload from stdin, decide, then either
# fall through silently (exit 0, no output) or deny with a structured reason
# (exit 2, JSON on stdout). Never throw a raw shell error at the agent — an
# unreadable failure here is worse than a missed check, so every helper below
# degrades to "allow" rather than crashing the hook chain.

AA_STDIN="$(cat 2>/dev/null || true)"

# aa_extract <field> — pulls tool_input.<field> out of $AA_STDIN.
# Tries jq, then python3, then node, then a best-effort grep/sed fallback so
# this works even on a bare-bones target project with none of those installed
# (Phase 1's hooks silently no-op'd for months on a missing `jq` — this list
# of fallbacks exists specifically so that can't happen silently here too).
aa_extract() {
  local field="$1"
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$AA_STDIN" | jq -r ".tool_input.${field} // empty" 2>/dev/null && return 0
  fi
  if command -v python3 >/dev/null 2>&1; then
    printf '%s' "$AA_STDIN" | python3 -c "
import json,sys
try:
    d = json.load(sys.stdin)
    v = d.get('tool_input', {}).get('${field}', '')
    print(v if v is not None else '')
except Exception:
    pass
" 2>/dev/null && return 0
  fi
  if command -v node >/dev/null 2>&1; then
    printf '%s' "$AA_STDIN" | node -e "
let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
  try{const j=JSON.parse(d);const v=(j.tool_input||{})['${field}'];process.stdout.write(v==null?'':String(v));}catch(e){}
});" 2>/dev/null && return 0
  fi
  # Last-resort fallback: crude single-line regex extraction. Won't handle
  # multi-line/escaped values perfectly — good enough to catch the common case.
  # `|| true` guards every stage so a no-match (grep exit 1) can't trip
  # `set -e`/`pipefail` in the calling hook and abort it uninspected.
  { printf '%s' "$AA_STDIN" | grep -o "\"${field}\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" 2>/dev/null || true; } \
    | head -1 \
    | sed -E "s/\"${field}\"[[:space:]]*:[[:space:]]*\"//; s/\"\$//"
  return 0
}

# aa_deny <reason> — emit the structured deny payload and exit 2.
aa_deny() {
  local reason="$1"
  local escaped
  escaped=$(printf '%s' "$reason" | sed 's/\\/\\\\/g; s/"/\\"/g' | tr '\n' ' ')
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$escaped"
  exit 2
}

# aa_allow — explicit pass-through.
aa_allow() {
  exit 0
}

# aa_protected_branches — space-separated list, overridable per-project.
aa_protected_branches() {
  echo "${AVENGERARMY_PROTECTED_BRANCHES:-main master production release}" | tr ',' ' '
}
