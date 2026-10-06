#!/usr/bin/env bash
# Drift check (R-PIN): runs gates L1-L5 and L8 against the LATEST npm release of Strudel in a
# temporary copy of the repo, and prints what changed compared to the pin. It never modifies
# the repo and always exits 0 (it reports; bumping the pin is a separate, reviewed change).
#
# Usage: bash ci/drift.sh [--docs]
#   --docs  also regenerate doc.json and sounds.json from Strudel's current main branch, so
#           L2/L8a check names against the latest docs (slow: clones and installs Strudel).
#           Without it, L2/L8a use the pinned doc.json; removed functions still show up as L1
#           errors because the code is evaluated by the latest packages.
#
# Output: the gate report for the latest release, then a diff of L3 snapshots
# (pinned -> latest). Exit status is 0 unless the script itself can't run.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PNPM="${PNPM:-pnpm}"
WITH_DOCS=0
[ "${1:-}" = "--docs" ] && WITH_DOCS=1
TMP="$(mktemp -d "${TMPDIR:-/tmp}/strudel-drift.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
say() { printf '\n==> %s\n' "$*"; }

say "copying the repo to $TMP"
tar -C "$ROOT" --exclude=./node_modules --exclude='*/node_modules' --exclude=./.git \
  --exclude=./tools/strudel-ref/.cache --exclude='*/.cache' -cf - . | tar -C "$TMP" -xf - || { echo "drift: copy failed"; exit 1; }

say "resolving the latest npm versions"
PKGS=$(node -e '
  const p = require(process.argv[1]);
  const all = { ...p.dependencies, ...p.devDependencies };
  console.log(Object.keys(all).filter((n) => n.startsWith("@strudel/") || n === "superdough").join(" "));
' "$TMP/packages/verify/package.json")
declare -A LATEST
for p in $PKGS; do
  v=$("$PNPM" view "$p" version 2>/dev/null) || { echo "drift: can't look up $p (network?)"; exit 1; }
  LATEST[$p]=$v
  pinned=$(node -p "require('$ROOT/packages/verify/package.json').dependencies['$p']")
  printf '  %-22s pinned %-8s latest %s\n' "$p" "$pinned" "$v"
done
node -e '
  const fs = require("fs");
  const [file, ...pairs] = process.argv.slice(1);
  const p = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const pair of pairs) { const [n, v] = pair.split("="); if (p.dependencies?.[n]) p.dependencies[n] = v; }
  fs.writeFileSync(file, JSON.stringify(p, null, 2) + "\n");
' "$TMP/packages/verify/package.json" $(for p in $PKGS; do printf '%s=%s ' "$p" "${LATEST[$p]}"; done)

say "installing the latest release in the copy"
(cd "$TMP" && "$PNPM" install --no-frozen-lockfile --filter @tutor/verify... --silent) || { echo "drift: install failed"; exit 1; }

SRC_ROOT="$ROOT/tools/strudel-ref/.cache/strudel"
if [ "$WITH_DOCS" = 1 ]; then
  say "regenerating doc.json and sounds.json from Strudel main"
  HEAD_SHA=$(git ls-remote "$(node -p "require('$ROOT/tools/strudel-ref/pin.json').repo")" refs/heads/main | cut -f1)
  node -e '
    const fs = require("fs"); const f = process.argv[1]; const p = JSON.parse(fs.readFileSync(f, "utf8"));
    p.commit = process.argv[2]; fs.writeFileSync(f, JSON.stringify(p, null, 2) + "\n");
  ' "$TMP/tools/strudel-ref/pin.json" "$HEAD_SHA"
  (bash "$TMP/tools/strudel-ref/generate-doc-json.sh" && bash "$TMP/tools/strudel-ref/generate-sounds.sh") || echo "drift: WARNING: could not regenerate reference data; using the pinned files"
  SRC_ROOT="$TMP/tools/strudel-ref/.cache/strudel"
  say "doc.json changes (pinned -> main), names only"
  diff <(node -e 'for (const d of require(process.argv[1]).docs) console.log(d.name)' "$ROOT/tools/strudel-ref/doc.json" | sort -u) \
       <(node -e 'for (const d of require(process.argv[1]).docs) console.log(d.name)' "$TMP/tools/strudel-ref/doc.json" | sort -u) && echo "  (no name changes)"
fi
[ -d "$SRC_ROOT" ] || SRC_ROOT="$TMP/no-clone"

GATES=L0,L1,L2,L2b,L3,L4,L5,L8
filter() { grep -v -e '@strudel/core loaded' -e 'not in browser' -e '^Content:'; }

say "gates L1-L5 and L8 at the pin (baseline)"
(cd "$ROOT/packages/verify" && node scripts/run.mjs verify --gates "$GATES") 2>&1 | filter > "$TMP/report-pinned.txt"
cat "$TMP/report-pinned.txt"

say "gates L1-L5 and L8 against the latest release"
(cd "$TMP/packages/verify" && node scripts/run.mjs verify --gates "$GATES" --src-root "$SRC_ROOT") 2>&1 | filter > "$TMP/report-latest.txt"
status=$(grep -c '^verify passed' "$TMP/report-latest.txt")
cat "$TMP/report-latest.txt"

say "report diff (pinned -> latest)"
if diff -u "$TMP/report-pinned.txt" "$TMP/report-latest.txt" | tail -n +3; then :; fi
cmp -s "$TMP/report-pinned.txt" "$TMP/report-latest.txt" && echo "  (identical reports)"

say "L3 snapshot diff (pinned -> latest)"
(cd "$TMP/packages/verify" && node scripts/run.mjs verify --gates L0,L3 --update --src-root "$SRC_ROOT" >/dev/null 2>&1)
if [ ! -d "$ROOT/packages/verify/__snapshots__" ]; then echo "  (no committed snapshots to compare)"
elif diff -ruN "$ROOT/packages/verify/__snapshots__" "$TMP/packages/verify/__snapshots__"; then echo "  (no hap changes)"; fi

say "drift summary"
if [ "$status" = 1 ]; then echo "  content passes against the latest Strudel release"; else echo "  DRIFT: some gates fail against the latest release (see above). The pinned build is unaffected."; fi
exit 0
