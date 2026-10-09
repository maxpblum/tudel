# Batch 3: verified facts (adds to batch1/batch2 VERIFIED_FACTS.md)

Checked on 2026-10-09 against the pinned clone and by `node .cache/eval.mjs` in `packages/verify`.

## arrange (`packages/core/pattern.mjs#L1469-L1473`)
- `arrange([cycles, pat], ...)`: `section.fast(cycles)`, `stepcat` weighted by cycles, then `.slow(total)`.
- **Each section runs its own clock.** Its cycles count only while it plays. It starts at its own cycle 0 on its first entry, then continues where it stopped on the next pass. Evaluated: `arrange([2, note("c4")], [3, note("<e4 f4 g4 a4>")])` → bars 3-5 are E4 F4 G4, and bars 8-10 are A4 E4 F4.
- The same const used in two entries gets two independent clocks. Evaluated: `[2, pad] … [2, pad]` both play steps 1-2 on pass 1 and steps 3-4 on pass 2.
- Signals inside a section use section time: `saw.slow(4)` in a 4-bar section rises from 0 at the section's first bar on every pass (evaluated).
- `lastOf(4, …)` inside a section counts the section's own bars.

## seqPLoop (`packages/core/pattern.mjs#L1486-L1501`)
- `[start, end, pat]` windows, stacked, `.slow(total)`, `innerJoin`: **parts follow the song's clock** (the global cycle), and the window only gates them. Evaluated: a window [2, 5] on `<e4 f4 g4 a4>` starts on G4.
- **Loop length = the end of the LAST entry in the list**, not the max (`total = part[1]` on each iteration). `seqPLoop([0, 8, a], [2, 4, b])` → a 4-bar loop in which `a` never plays (evaluated).
- A 2-element entry `[end, pat]` starts at the previous entry's end.
- Masked `$:` lines and the equivalent seqPLoop give identical events (evaluated for loop-layering.v03).

## Other
- `transpose` on an unpitched drum part logs `[tonal] transpose: not a note` (an L1 failure). Transpose only an inner stack of pitched parts.
- `const` and arrow functions work; the gates' AST collects declared names (`packages/verify/src/code/ast.ts#L103`).
- `s("hh*<4 8 16 32>")` works (a patterned subdivision).
- All 34 playable snippets and solutions in this batch evaluate with no log lines and no notes below C3. Refactor starters and solutions give identical events for readability-refactor.v01, readability-refactor.v02, loop-layering.v03, and the lesson's before/after.
- Every chord symbol used is already in the glossary; `glossary/chord-symbols.yaml` only adds the zen.* skills to them.
