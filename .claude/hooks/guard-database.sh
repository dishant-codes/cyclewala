#!/usr/bin/env bash
# PreToolUse hook — Bash. Deterministic backstop against destructive database
# commands, generalized from Phase 1's guard-database.sh (which exists
# because an agent ran a test suite that globally reset the database against
# a real, unbackuped dataset — a Laravel/Pest-specific footgun there, but the
# underlying failure mode — "destructive command, no isolation check" — is
# universal across stacks).
#
# Two independent triggers:
#   A. Cross-stack destructive DB commands (DROP/TRUNCATE/migrate:fresh/etc.)
#      — always denied against a detected production environment, denied
#      elsewhere unless an isolation signal or explicit override is present.
#   B. The test suite itself, but ONLY when this specific project is
#      detected to have the Laravel/Pest global-RefreshDatabase footgun —
#      this hook never gates a generic `npm test`/`pytest` on stacks where
#      that risk doesn't exist.

set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/_lib.sh"

CMD="$(aa_extract command)"
[ -z "$CMD" ] && aa_allow

DESTRUCTIVE_RE='migrate:fresh|migrate:refresh|db:wipe|prisma[[:space:]]+migrate[[:space:]]+reset|knex[[:space:]]+migrate:rollback[^&]*--all|rails[[:space:]]+db:(reset|drop)|manage\.py[[:space:]]+flush|manage\.py[[:space:]]+migrate[[:space:]]+[a-zA-Z_]+[[:space:]]+zero|alembic[[:space:]]+downgrade[[:space:]]+base|flyway[[:space:]]+clean|sequelize[[:space:]]+db:migrate:undo:all|DROP[[:space:]]+(DATABASE|TABLE|SCHEMA)|TRUNCATE[[:space:]]+TABLE|dropDatabase\(|--drop-all|--force-wipe'
TEST_RUNNER_RE='artisan[[:space:]]+test|(^|[[:space:]])pest([[:space:]]|$)|phpunit'

IS_DESTRUCTIVE=0
printf '%s' "$CMD" | grep -qiE "$DESTRUCTIVE_RE" && IS_DESTRUCTIVE=1
IS_TEST_RUN=0
printf '%s' "$CMD" | grep -qiE "$TEST_RUNNER_RE" && IS_TEST_RUN=1

[ "$IS_DESTRUCTIVE" = 0 ] && [ "$IS_TEST_RUN" = 0 ] && aa_allow

# --- Environment markers --------------------------------------------------
ENV_FILE=""
for f in .env .env.local; do
  [ -f "$f" ] && ENV_FILE="$f" && break
done

is_production_env() {
  [ -z "$ENV_FILE" ] && return 1
  grep -qiE '^(APP_ENV|NODE_ENV|RAILS_ENV|ENVIRONMENT|DJANGO_SETTINGS_MODULE)[[:space:]]*=[[:space:]]*"?[a-z_.]*prod' "$ENV_FILE" 2>/dev/null
}

if [ "$IS_DESTRUCTIVE" = 1 ] && is_production_env; then
  aa_deny "Destructive database command blocked: environment looks like production (checked $ENV_FILE). This is never allowed, no override — see CLAUDE.md rule 6."
fi

# --- Isolation signal ------------------------------------------------------
has_isolation_signal() {
  if [ -f .env.testing ] && grep -qiE '^DB_DATABASE|^DATABASE_URL' .env.testing 2>/dev/null; then
    return 0
  fi
  if grep -rqsiE '(sqlite|:memory:)' phpunit.xml phpunit.xml.dist jest.config.* vitest.config.* pytest.ini pyproject.toml 2>/dev/null; then
    return 0
  fi
  return 1
}

if [ "${AVENGERARMY_ALLOW_DESTRUCTIVE_DB:-}" = "1" ]; then
  aa_allow
fi

if has_isolation_signal; then
  aa_allow
fi

# --- Trigger A: explicit destructive command, no isolation, not caught above
if [ "$IS_DESTRUCTIVE" = 1 ]; then
  aa_deny "Destructive database command with no isolation signal detected (no .env.testing / test-scoped DB config found). Do not set AVENGERARMY_ALLOW_DESTRUCTIVE_DB=1 yourself — ask the user first and only set it after they explicitly confirm it's safe. Preferred: add proper test DB isolation instead — see CLAUDE.md rule 6."
fi

# --- Trigger B: running tests specifically on a Laravel/Pest project with
# global RefreshDatabase and no isolation signal — same shape as the real
# incident this hook is modeled on.
laravel_pest_refresh_database_risk() {
  [ -f artisan ] || return 1
  { [ -f tests/Pest.php ] || [ -f phpunit.xml ]; } || return 1
  grep -rqsiE 'RefreshDatabase' tests/ 2>/dev/null
}

if [ "$IS_TEST_RUN" = 1 ] && laravel_pest_refresh_database_risk; then
  aa_deny "This project uses RefreshDatabase in tests with no isolated test-database signal found (.env.testing / sqlite override). Running the suite could wipe a real database. Add test DB isolation first — do not set AVENGERARMY_ALLOW_DESTRUCTIVE_DB=1 yourself, ask the user first and only set it after they explicitly confirm it's safe — see CLAUDE.md rule 6."
fi

aa_allow
