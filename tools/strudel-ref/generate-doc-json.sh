#!/usr/bin/env bash
# Clones Strudel at the pinned commit into tools/strudel-ref/.cache/strudel and
# regenerates tools/strudel-ref/doc.json (Strudel's authoritative function list).
# This is also the setup step for gate L8b, which checks {cite src=...} against the clone.
#
# Usage: bash tools/strudel-ref/generate-doc-json.sh [--check | --setup-only]
#   (no flag)     clone/checkout the pin, regenerate doc.json
#   --check       regenerate into a temp file and fail if it differs from the committed doc.json
#   --setup-only  only clone/checkout the pinned commit (fast; enough for gate L8b)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:-}"
case "$MODE" in ""|--check|--setup-only) ;; *) echo "usage: $0 [--check | --setup-only]" >&2; exit 2 ;; esac
REPO=$(node -p "require('$HERE/pin.json').repo")
COMMIT=$(node -p "require('$HERE/pin.json').commit")
SRC="$HERE/.cache/strudel"
if [ ! -d "$SRC/.git" ]; then
  mkdir -p "$HERE/.cache"
  git clone --filter=blob:none --quiet "$REPO" "$SRC"
fi
git -C "$SRC" fetch --quiet origin "$COMMIT" 2>/dev/null || true
git -C "$SRC" checkout --quiet --detach "$COMMIT"
echo "pinned clone ready: $SRC at $(git -C "$SRC" rev-parse --short HEAD)"
if [ "$MODE" = "--setup-only" ]; then exit 0; fi
(cd "$SRC" && pnpm install --frozen-lockfile --ignore-scripts --config.confirm-modules-purge=false --reporter=silent && pnpm run --silent jsdoc-json)
# Normalize: drop absolute paths so the file is identical on every machine.
node "$HERE/normalize-doc-json.mjs" "$SRC/doc.json" "$HERE/doc.json.new"
if [ "$MODE" = "--check" ]; then
  if cmp -s "$HERE/doc.json.new" "$HERE/doc.json"; then echo "doc.json up to date"; rm "$HERE/doc.json.new"; else echo "doc.json differs from pinned source" >&2; rm "$HERE/doc.json.new"; exit 1; fi
else
  mv "$HERE/doc.json.new" "$HERE/doc.json"
  echo "wrote $HERE/doc.json"
fi
