#!/usr/bin/env bash
set -euo pipefail

CODEX_STATE_DB="${CODEX_STATE_DB:-$HOME/.codex/state_5.sqlite}"
WORKSPACE_CWD="${1:-$PWD}"
REFRESH_SECONDS="${CODEX_USAGE_REFRESH_SECONDS:-5}"

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "sqlite3 is required to read Codex usage."
  exit 1
fi

if [[ ! -f "$CODEX_STATE_DB" ]]; then
  echo "Codex state DB not found: $CODEX_STATE_DB"
  exit 1
fi

while true; do
  clear
  printf "Codex usage monitor\n"
  printf "Updated: %s\n" "$(date '+%Y-%m-%d %H:%M:%S')"
  printf "Workspace: %s\n\n" "$WORKSPACE_CWD"

  sqlite3 -readonly "$CODEX_STATE_DB" <<SQL
.mode column
.headers on
.parameter init
.parameter set :cwd "$WORKSPACE_CWD"

select
  datetime(updated_at, 'unixepoch', 'localtime') as updated,
  coalesce(model, '') as model,
  coalesce(reasoning_effort, '') as effort,
  printf('%,d', tokens_used) as tokens,
  substr(replace(title, char(10), ' '), 1, 64) as latest_workspace_thread
from threads
where archived = 0 and cwd = :cwd
order by updated_at desc
limit 5;

select
  printf('%,d', coalesce(sum(tokens_used), 0)) as workspace_open_thread_tokens
from threads
where archived = 0 and cwd = :cwd;

select
  datetime(updated_at, 'unixepoch', 'localtime') as updated,
  source,
  coalesce(model, '') as model,
  printf('%,d', tokens_used) as tokens,
  substr(replace(title, char(10), ' '), 1, 64) as latest_all_codex_threads
from threads
where archived = 0
order by updated_at desc
limit 5;
SQL

  printf "\nRefresh: every %ss. Stop: Ctrl+C.\n" "$REFRESH_SECONDS"
  sleep "$REFRESH_SECONDS"
done
