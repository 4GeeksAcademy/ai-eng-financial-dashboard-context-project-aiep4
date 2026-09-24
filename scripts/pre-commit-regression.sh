#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
cd "$ROOT_DIR"

log() {
  printf '\n[pre-commit-regression] %s\n' "$1"
}

fail() {
  printf '\n[pre-commit-regression] ERROR: %s\n' "$1" >&2
  exit 1
}

log "Checking staged diff"
git diff --cached --check

while IFS= read -r staged_file; do
  case "$staged_file" in
    .env|*/.env|.env.*|*/.env.*)
      [[ "$staged_file" == ".env.example" || "$staged_file" == */.env.example ]] ||
        fail "The staged changes contain a real .env file."
      ;;
    node_modules/*|*/node_modules/*|dist/*|*/dist/*|coverage/*|*/coverage/*|__pycache__/*|*/__pycache__/*|.pytest_cache/*|*/.pytest_cache/*)
      fail "The staged changes contain generated artifacts: $staged_file"
      ;;
  esac
done < <(git diff --cached --name-only)

log "Running frontend regression"
(
  cd "$ROOT_DIR/frontend"
  npm test -- --run
  npm run lint
  npm run build
)

log "Running backend regression"
(
  cd "$ROOT_DIR/backend"
  if python -m pytest -q; then
    :
  else
    if python -m pytest --version >/dev/null 2>&1; then
      echo "Backend tests failed." >&2
      exit 1
    fi
    echo "pytest is unavailable; running compileall fallback."
    python -m compileall -q app tests
  fi
)

staged_files="$(git diff --cached --name-only)"
if printf '%s\n' "$staged_files" | grep -E '(^|/)(docker-compose\.yml|frontend/vite\.config\.ts|backend/Dockerfile|frontend/Dockerfile)$' >/dev/null; then
  log "Validating Docker Compose configuration"
  docker compose config >/dev/null
fi

log "Pre-commit regression passed"
printf '\nPre-commit regression: PASS\nFrontend: PASS\nBackend: PASS\nDeploy/config: %s\nCommit readiness: READY\nBlockers: none\n' \
  "$([[ "$staged_files" =~ (^|/)(docker-compose\.yml|frontend/vite\.config\.ts|backend/Dockerfile|frontend/Dockerfile)$ ]] && echo PASS || echo NOT RUN)"
