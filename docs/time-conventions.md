# Time conventions

All content uses these conventions, so "a beat," "a bar," and "a verse" mean the same thing everywhere.

| Musical term | Strudel meaning |
|---|---|
| **Bar** | **1 cycle.** All content assumes 4/4 unless a variant says otherwise. |
| **Beat** | ¼ cycle (in 4/4). |
| **Tempo** | `setcpm(BPM / 4)` gives *BPM* quarter-note beats per minute in 4/4. For example, `setcpm(120 / 4)` is 120 BPM. This is the idiom from Strudel's own `setcpm` documentation. |
| **Default tempo** | Strudel's default is 0.5 cycles per second = 30 cycles per minute = **120 BPM in 4/4**. Content that is happy at 120 BPM may omit `setcpm`. |
| **Phrase** | 4 bars = 4 cycles. |
| **Verse / section** | 8 or 16 bars, stated explicitly in each prompt. |

## Consequences

- **Notation (dictation and gate L4).** One ABC bar (`M:4/4`) equals one cycle. An ABC whole note is 1 cycle and a quarter note is ¼ cycle, no matter what `L:` says.
- **Sweeps.** "Over one bar" means a change across 1 cycle, and "over a phrase" means `.slow(4)` on a 1-cycle signal. Sweeps written with mini-notation alternation (`"<a b c d>"`) step once per bar.
- **Verify cycles.** Each variant's `verify.cycles` should cover at least one full repetition of the musical idea (a phrase-long sweep needs `cycles: 4` or more).
