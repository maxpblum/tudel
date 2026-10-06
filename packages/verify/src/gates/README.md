# Gates

One module per gate. Each returns a `GateResult` (`result.ts`): a list of `{item, ok, message, where}` entries, where `item` is a variant, lesson or skill id (or `skills.yaml`, `lexicon`, `allowlist`, `chord-symbols`). `--explain <id>` prints every entry for one item.

| Module | Gate |
|---|---|
| `l0-schema.ts` | L0: zod schemas (unknown fields are errors), ids, references, prerequisite cycles, ≥3 variants per skill, directive syntax and bodies. Produces the validated `ValidContent` every later gate uses |
| `l1-evaluate.ts` | L1: evaluation through the real repl, ≥1 event, control-object values, no Strudel console output |
| `l2-vocabulary.ts` | L2: names in code and skill vocabularies vs `doc.json` and the allowlist; checks allowlist ADRs exist |
| `l2b-sounds.ts` | L2b: sound and bank names vs `sounds.json`, statically and from events. `soundUse()` also gives the compiler `needsNetwork` |
| `l3-snapshots.ts` | L3: golden `hap.show(true)` files, `--update`, stale-file detection |
| `l4-notation.ts` | L4: abcjs `setUpAudio` notes vs the canonical solution's events |
| `l5-equivalence.ts` | L5: all solutions produce identical events and cps |
| `l7-style.ts` | L7: Prettier (`prettier.config.json`), quotes, synonyms, short synth aliases |
| `l8-prose.ts` | L8: inline code spans, `{cite}`, variant sources, chord symbols, lexicon sources/confidence |
| `allowlist.json` | L2 allowlist. Each entry cites an ADR (policy: [docs/verification.md](../../../../docs/verification.md#allowlist-policy-l2)) |
| `prettier.config.json` | The exact Prettier config from `docs/house-style.md` (a test asserts they match) |

Adding a gate: write the module, call it from `../verify.ts`, add a `GateId` and title in `result.ts`, add a test with a fixture that breaks it, and document it in `docs/verification.md`.
