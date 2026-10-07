#!/usr/bin/env bash
# M2 validation runner. Runs every check from docs/plan/M2-plan.md "Verification" and writes
# two paste-ready files:
#   validation/out/REPORT.md            step results + verbatim failure excerpts
#   validation/out/SNAPSHOT-REVIEW.md   every L3 snapshot that `pnpm verify --update` created/changed/deleted
# Full logs are in validation/out/logs/.
#
# Usage (from anywhere):  bash validation/run-m2-validation.sh
# Optional:               SKIP_DRIFT=1 bash validation/run-m2-validation.sh   (skips the slow drift report)
#
# It never stops early except when `pnpm install` fails (nothing else can run without it).
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1
export NO_COLOR=1 FORCE_COLOR=0

OUT="$ROOT/validation/out"
rm -rf "$OUT"
mkdir -p "$OUT/logs" "$OUT/snap-before"
REPORT="$OUT/REPORT.md"
SNAP="$OUT/SNAPSHOT-REVIEW.md"
: > "$REPORT"
: > "$SNAP"
FAILED_STEPS=()
STEP_CODE=0

r() { printf '%s\n' "$*" >> "$REPORT"; }
strip() { sed -e 's/\x1b\[[0-9;]*[A-Za-z]//g' -e 's/\r$//'; }
# block TITLE MAXLINES  (reads stdin, appends a fenced block to the report)
block() {
  r "$1"
  r '```text'
  strip | head -n "$2" >> "$REPORT"
  r '```'
}
# run_step NAME LOGNAME CMD...
run_step() {
  local name="$1" log="$OUT/logs/$2"; shift 2
  printf '==> %s\n' "$name"
  local start; start=$(date +%s)
  "$@" > "$log" 2>&1
  STEP_CODE=$?
  local secs=$(( $(date +%s) - start ))
  r ""
  if [ "$STEP_CODE" -eq 0 ]; then
    r "## $name: PASS (exit 0, ${secs}s)"
  else
    r "## $name: FAIL (exit $STEP_CODE, ${secs}s)"
    FAILED_STEPS+=("$name")
  fi
  r "Full log: validation/out/logs/$2"
}

r "# M2 validation report"
r ""
r "Generated: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
r "node: $(node -v 2>&1 | head -1) | pnpm: $(pnpm -v 2>&1 | head -1) | os: $(uname -sm)"

# 1. install ---------------------------------------------------------------------------------
run_step "STEP 1 install" 01-install.log pnpm install --frozen-lockfile
if [ "$STEP_CODE" -ne 0 ]; then
  block "Last 40 lines:" 40 < <(tail -n 40 "$OUT/logs/01-install.log")
  r ""
  r "OVERALL: FAIL (install failed; nothing else was run)"
  echo "Done. Paste validation/out/REPORT.md"
  exit 1
fi

# 2. pinned Strudel clone (gate L8b) -----------------------------------------------------------
if [ ! -d tools/strudel-ref/.cache/strudel/.git ]; then
  run_step "STEP 2 strudel clone setup" 02-clone.log bash tools/strudel-ref/generate-doc-json.sh --setup-only
  [ "$STEP_CODE" -ne 0 ] && block "Last 30 lines:" 30 < <(tail -n 30 "$OUT/logs/02-clone.log")
else
  r ""
  r "## STEP 2 strudel clone setup: PASS (already present)"
fi

# 3. typecheck --------------------------------------------------------------------------------
run_step "STEP 3 typecheck" 03-typecheck.log pnpm typecheck
if [ "$STEP_CODE" -ne 0 ]; then
  block "TypeScript errors (first 100):" 100 < <(grep -E 'error TS|ERR_' "$OUT/logs/03-typecheck.log")
  block "Last 25 lines:" 25 < <(tail -n 25 "$OUT/logs/03-typecheck.log")
fi

# 4. verify --update (writes snapshots), then plain verify (must be green) ---------------------
cp -R packages/verify/__snapshots__/. "$OUT/snap-before/" 2>/dev/null
run_step "STEP 4a verify --update" 04a-verify-update.log pnpm verify --update
run_step "STEP 4b verify" 04b-verify.log pnpm verify
VLOG="$OUT/logs/04b-verify.log"
block "Gate summary and every failure (verbatim):" 300 < <(awk '
  /^(PASS|FAIL)  /{infail=($0 ~ /^FAIL/); print; next}
  /^verify /{print; next}
  /^$/{infail=0}
  infail{print}' "$VLOG")
if [ "$STEP_CODE" -ne 0 ]; then
  block "Last 30 lines (shows crashes that are not gate failures):" 30 < <(tail -n 30 "$VLOG")
  IDS=$(grep -E '^        x ' "$VLOG" | sed -E 's/^        x ([^ :]+).*/\1/' | sort -u | head -n 15)
  for id in $IDS; do
    pnpm verify --explain "$id" > "$OUT/logs/04c-explain-$id.log" 2>&1
    block "Explain $id (failing entries only):" 40 < <(grep -E '^  FAIL|^          x ' "$OUT/logs/04c-explain-$id.log")
  done
fi

# 5. snapshot review file ---------------------------------------------------------------------
{
  echo "# Snapshot changes made by \`pnpm verify --update\`"
  echo
  NEW=0; CHG=0; DEL=0
  for f in packages/verify/__snapshots__/*.snap; do
    b=$(basename "$f")
    if [ ! -f "$OUT/snap-before/$b" ]; then
      NEW=$((NEW+1))
      echo "## NEW $b"
      echo '```text'
      head -n 40 "$f"
      [ "$(wc -l < "$f")" -gt 40 ] && echo "... ($(wc -l < "$f") lines total, truncated)"
      echo '```'
    elif ! cmp -s "$f" "$OUT/snap-before/$b"; then
      CHG=$((CHG+1))
      echo "## CHANGED $b"
      echo '```diff'
      diff -u "$OUT/snap-before/$b" "$f" | head -n 80
      echo '```'
    fi
  done
  for f in "$OUT"/snap-before/*.snap; do
    b=$(basename "$f")
    if [ ! -f "packages/verify/__snapshots__/$b" ]; then DEL=$((DEL+1)); echo "## DELETED $b"; fi
  done
  echo
  echo "Totals: new=$NEW changed=$CHG deleted=$DEL"
} 2>&1 | strip > "$SNAP"
r ""
r "Snapshot changes: $(tail -n 1 "$SNAP") (details in validation/out/SNAPSHOT-REVIEW.md)"

# 6. unit tests (+coverage thresholds) --------------------------------------------------------
run_step "STEP 6 unit tests" 06-test.log pnpm test
TLOG="$OUT/logs/06-test.log"
block "Test totals and coverage lines:" 40 < <(grep -E 'Test Files|Tests  |All files|srs|store|session|threshold|ERROR: Coverage' "$TLOG")
if [ "$STEP_CODE" -ne 0 ]; then
  block "Failure lines (first 150):" 150 < <(grep -nE ' FAIL |×|✗|AssertionError|Error:|Expected|Received|expected|ERROR' "$TLOG")
  block "Last 40 lines:" 40 < <(tail -n 40 "$TLOG")
fi

# 7. e2e (Playwright, includes gate L6) -------------------------------------------------------
run_step "STEP 7a playwright browser install" 07a-pw-install.log pnpm --filter @tudel/web exec playwright install chromium
[ "$STEP_CODE" -ne 0 ] && block "Last 20 lines:" 20 < <(tail -n 20 "$OUT/logs/07a-pw-install.log")
run_step "STEP 7b e2e" 07b-e2e.log pnpm e2e
ELOG="$OUT/logs/07b-e2e.log"
block "Totals:" 10 < <(grep -E '[0-9]+ (passed|failed|flaky|skipped|did not run)' "$ELOG")
if [ "$STEP_CODE" -ne 0 ]; then
  block "Failure lines (first 200):" 200 < <(grep -nE '✘|\[chromium\].*›|Error:|Expected|Received|Locator|Timeout|waiting for|failed' "$ELOG")
  block "Last 60 lines:" 60 < <(tail -n 60 "$ELOG")
fi

# 8. doc.json pin check (R-PIN) ---------------------------------------------------------------
run_step "STEP 8 doc.json pin check" 08-docjson-check.log bash tools/strudel-ref/generate-doc-json.sh --check
[ "$STEP_CODE" -ne 0 ] && block "Last 30 lines:" 30 < <(tail -n 30 "$OUT/logs/08-docjson-check.log")

# 9. drift report (informational; never a failure) -------------------------------------------
if [ "${SKIP_DRIFT:-0}" != "1" ]; then
  printf '==> STEP 9 drift report\n'
  bash ci/drift.sh > "$OUT/logs/09-drift.log" 2>&1
  r ""
  r "## STEP 9 drift report: INFO (never fails; attach to docs/qa/M2-walkthrough.md)"
  block "Gate lines from the drift run:" 60 < <(grep -E '^(PASS|FAIL)  |^verify |^==> ' "$OUT/logs/09-drift.log")
fi

# 10. working-tree sanity ---------------------------------------------------------------------
r ""
r "## STEP 10 file sanity"
block "Variant count per unit (expect u1=27 u2>=23 u3a=20 u3b>=21 u4=27):" 10 < <(for u in u1 u2 u3a u3b u4; do printf '%s %s\n' "$u" "$(ls content/units/$u/exercises 2>/dev/null | wc -l)"; done)

r ""
if [ "${#FAILED_STEPS[@]}" -eq 0 ]; then
  r "OVERALL: PASS"
else
  r "OVERALL: FAIL in: ${FAILED_STEPS[*]}"
fi
echo "Done. Paste validation/out/REPORT.md and validation/out/SNAPSHOT-REVIEW.md"
