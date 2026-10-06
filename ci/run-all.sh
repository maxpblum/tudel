#!/usr/bin/env bash
# The whole main build, identical on a laptop or any CI host:
#   install (frozen lockfile) -> typecheck -> pnpm verify (gates L0-L5, L7, L8 + bundle) -> pnpm test -> pnpm e2e (incl. L6)
# Gate L8b needs the pinned Strudel clone; it is set up here if missing (needs git + network once).
# Usage: bash ci/run-all.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PNPM="${PNPM:-pnpm}"
step() { printf '\n==> %s\n' "$*"; }

step "install"
"$PNPM" install --frozen-lockfile

if [ ! -d tools/strudel-ref/.cache/strudel/.git ]; then
  step "set up the pinned Strudel clone (for gate L8b)"
  bash tools/strudel-ref/generate-doc-json.sh --setup-only
fi

step "typecheck"
"$PNPM" typecheck

step "verify (gates L0-L5, L7, L8; writes the bundle)"
"$PNPM" verify

step "unit tests"
"$PNPM" test

step "e2e (Playwright, including gate L6)"
"$PNPM" e2e

step "all green"
