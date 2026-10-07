# packages/verify/src

Data flows top to bottom:

| Folder / file | Role |
|---|---|
| `bin/verify.ts` | The `pnpm verify` CLI: flag parsing, path defaults, report printing, exit codes |
| `bin/gen-sounds.ts` | Generates `tools/strudel-ref/sounds.json` from the pinned prebake via the pinned superdough |
| `bin/eval.ts` | Dev tool: print the haps of a snippet |
| `verify.ts` | `runVerify(options)`: load → L0 → collect snippets → L1…L8 → compile → write bundle. Tests call it directly |
| `content/` | Loading `content/` from disk (`load.ts`), the line-based directive parser (`directives.ts`), directive-body schemas (`directive-bodies.ts`), validated-content types (`model.ts`), and **the one list of every code snippet** (`snippets.ts`) |
| `harness/` | Headless Strudel: `evaluate.ts` (the real `repl()`, a fresh one per snippet, console capture, a run cache shared by all gates), `haps.ts` (MIDI pitch and onsets the way superdough reads haps), and the two esbuild seam modules `strudel-deps.ts` / `music-deps.ts` |
| `code/` | Static analysis: `ast.ts` (acorn: free identifiers, called methods, `s()`/`bank()` literals, string tokens) and `mini.ts` (mini-notation words via Strudel's own parser) |
| `ref/` | Loading the pinned reference data: `pin.json`, `doc.json` (names, synonyms, descriptions), `sounds.json`, the allowlist |
| `gates/` | One module per gate ([gates/README.md](gates/README.md)), plus `allowlist.json` and `prettier.config.json` |
| `compile/` | The content compiler: `render.ts` (Shiki, Markdown with `{cite}`, Graphviz) `bundle.ts` (Blocks, variants, rolls, content hash, schema validation) and `terms.ts` (Strudel terms derived from skill vocabulary and doc.json descriptions) |
| `report.ts` | Text output for the run report and `--explain` |
| `util/diff.ts` | Line diff used in snapshot, equivalence and formatter failures |
| `types/shims.d.ts` | Strudel packages ship no types |

## Invariants

- A gate never trusts another gate's success: L2 checks names even if L1 evaluated them, and L2b checks sounds statically and dynamically.
- Every snippet is evaluated once per `(code, cycles)` (`RunCache`), so all gates and the compiler see the same events.
- The bundle is deterministic: no timestamps, stable ordering, `JSON.stringify(bundle, null, 2)`.
