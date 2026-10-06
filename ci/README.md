# ci/: portable CI scripts

Every CI job is a plain bash script that runs the same way on a laptop or any CI host (R-AGNOSTIC). Hosted-CI config files only call these scripts. Requirements: bash, git, Node 22+, pnpm 10 (`packageManager` in the root `package.json`), and, for `pnpm e2e`, Playwright's Chromium.

| Script | What it does | Fails the build? |
|---|---|---|
| `run-all.sh` | `pnpm install --frozen-lockfile`, sets up the pinned Strudel clone if it's missing (gate L8b needs it), then `pnpm verify`, `pnpm test`, `pnpm e2e` | yes |
| `drift.sh [--docs]` | Copies the repo to a temp dir, installs the **latest** npm release of every `@strudel/*` package, runs gates L1-L5 and L8, and prints the report plus a diff of L3 snapshots (pinned vs latest). `--docs` also regenerates `doc.json` and `sounds.json` from Strudel's main branch so L2/L8a check against the latest docs (slow) | never (always exits 0) |

The drift job only reports. Moving the pin is a deliberate change: see [tools/strudel-ref/README.md](../tools/strudel-ref/README.md#bumping-the-pin).

## Examples

`examples/` has ready-to-copy configs that just call the scripts:

- `github-actions.yml` → `.github/workflows/ci.yml`
- `gitlab-ci.yml` → `.gitlab-ci.yml`
- `woodpecker.yml` → `.woodpecker.yml` (Codeberg CI / Forgejo with Woodpecker)
- `forgejo-actions.yml` → `.forgejo/workflows/ci.yml`

Run the drift job on a schedule (e.g. weekly) rather than on every push.
