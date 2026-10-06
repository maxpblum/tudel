#!/usr/bin/env bash
# Build the app from a clean checkout and force-push it as a single commit to the gh-pages branch.
# Usage: pnpm pages   (serves at https://maxpblum.github.io/tudel/)
set -euo pipefail
root=$(git rev-parse --show-toplevel)
cd "$root"
[ -z "$(git status --porcelain)" ] || { echo "Working tree is dirty; commit first so the deploy maps to a commit." >&2; exit 1; }
sha=$(git rev-parse --short HEAD)
remote=$(git remote get-url origin)
pnpm build
[ -f apps/web/src/content/bundle.json ] || { echo "No verified bundle; refusing to deploy fixture content." >&2; exit 1; }
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cp -r apps/web/dist/. "$tmp"
touch "$tmp/.nojekyll"
git -C "$tmp" init -q -b gh-pages
git -C "$tmp" add -A
git -C "$tmp" commit -qm "Deploy $sha"
git -C "$tmp" push -f "$remote" gh-pages
echo "Deployed $sha to gh-pages → https://maxpblum.github.io/tudel/"
