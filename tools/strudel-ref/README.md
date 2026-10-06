# tools/strudel-ref: the pinned Strudel reference

Everything the verifier checks content against comes from one pinned Strudel version. The pin and its reference data live here. Why it's set up this way: [ADR 0001](../../docs/decisions/0001-pin-strudel-and-commit-reference-data.md).

| File | What it is | Committed? |
|---|---|---|
| `pin.json` | The Codeberg repo, the pinned commit, and the exact npm versions of every `@strudel/*` package (and `superdough`) the app and verifier use | yes |
| `doc.json` | Strudel's own function list (jsdoc output), generated from the pinned clone and normalized. Gate L2 checks every function name against it; L7 derives the synonym list from it; L8 checks `{cite doc=...}` | yes |
| `sounds.json` | Every sound name strudel.cc's prebake registers at the pin, typed `synth` (works offline), `sample`, `wavetable`, `soundfont` (need the network) or `input`. Aliases record `aliasOf`. Gate L2b checks sound names against it; L7 bans the short synth aliases (`saw`, `sqr`, `tri`, `sin`); the compiler derives `needsNetwork` from it | yes |
| `.cache/strudel/` | A clone of the Strudel repo checked out at the pinned commit. Gate L8b checks `{cite src="path#Lx-Ly"}` against it; it's also the source to cross-check facts in | no (gitignored) |

## Setup

```sh
pnpm strudel-ref                                    # clone at the pin + regenerate doc.json (needs pnpm and the network)
bash tools/strudel-ref/generate-doc-json.sh --setup-only   # just the clone (enough for gate L8b)
```

## Regenerating and checking

```sh
bash tools/strudel-ref/generate-doc-json.sh          # rewrite doc.json from the clone
bash tools/strudel-ref/generate-doc-json.sh --check  # fail if doc.json is out of date
bash tools/strudel-ref/generate-sounds.sh            # rewrite sounds.json (needs the network)
bash tools/strudel-ref/generate-sounds.sh --check    # fail if sounds.json is out of date
```

How `sounds.json` is generated (`packages/verify/src/bin/gen-sounds.ts`): it parses the pinned `website/src/repl/prebake.mjs` with acorn to find every `samples(...)` and `aliasBank(...)` call. Then it runs the pinned superdough's own `registerSynthSounds()`, `registerZZFXSounds()`, `samples()` (fetching the CDN sample maps) and `aliasBank()`, and reads superdough's `soundMap`. Soundfont names are the keys of the pinned `packages/soundfonts/gm.mjs` (what `registerSoundfonts()` registers). Nothing is copied by hand. The CDN maps aren't versioned with the commit, so `--check` can start failing when the CDN changes. The drift job reports that.

## Bumping the pin

Bumping Strudel is always one deliberate, reviewed change:

1. Find the Codeberg tag for the new npm release (e.g. `@strudel/web@1.4.0`). Check that `@strudel/core`'s tag at the same version has the same code (`git diff <core-tag> <web-tag> -- packages/`). npm's `gitHead` field is stale; don't trust it.
2. Update `pin.json` (`commit`, `commitNote`, `npm`). Update the exact versions in `packages/verify/package.json` and `apps/web/package.json`, then run `pnpm install`.
3. `pnpm strudel-ref` (re-checks out the clone and regenerates `doc.json`), then `bash tools/strudel-ref/generate-sounds.sh`.
4. `pnpm verify`. Fix any L1/L2/L2b failures in content. Then `pnpm verify --update` and **review every snapshot diff** in `packages/verify/__snapshots__/`. Each one is a behavior change in Strudel that content may describe.
5. Check that the allowlist (`packages/verify/src/gates/allowlist.json`) is still needed. L2 flags entries that `doc.json` now documents.
6. Run `bash ci/run-all.sh` (including L6 in the browser), and record the bump in the commit message.

`bash ci/drift.sh` previews steps 2-4 against the latest npm release without touching the repo.
