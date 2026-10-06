#!/usr/bin/env bash
# Regenerates tools/strudel-ref/sounds.json: every sound name strudel.cc's prebake registers at
# the pinned commit, marked synth (offline) or sample/wavetable/soundfont (network).
# Needs the pinned clone (bash tools/strudel-ref/generate-doc-json.sh --setup-only) and the
# network (it fetches the CDN sample maps the prebake lists).
#
# Usage: bash tools/strudel-ref/generate-sounds.sh [--check]
#   --check  fail if the committed sounds.json differs from what would be generated now
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
cd "$ROOT/packages/verify"
exec node scripts/run.mjs gen-sounds "$@"
