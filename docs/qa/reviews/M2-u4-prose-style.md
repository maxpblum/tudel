# M2 prose-style review: U4 "Time & modulation" (STYLE_TIPS.md §1-§8)

Reviewer: independent; I read every lesson, prompt and listen-for list as the learner (an advanced classical musician who knows Web Audio graphs). Fixes were applied in the same pass.
Scoring: ✅ follows / ⚠️ partly / ❌ fails, **after** the fixes below. Word counts are prose only (frontmatter, directive bodies and `{cite}` tags excluded; `:::bridge` text and table cells included).

## Summary

| Lesson | §1 | §2 | §3 | §4 | §5 | §6 | §7 | §8 | Words (≤300) |
|---|---|---|---|---|---|---|---|---|---|
| signals | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ~297 (was ~308) |
| range | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ~296 (was ~308) |
| signal-speed | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~255 |
| segment | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~246 |
| perlin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~230 |
| signal-melody | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~235 |
| phrase-sweeps | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~255 |

Totals after fixes: 0 ❌ cells, 2 ⚠️ cells (both §7, limited by the directives; see P-10, P-11). 12 findings: 10 fixed, 2 kept and reported.

How each tip was followed overall:
- **§1:** sawtooth and square lines at c3–c4 under a moving low-pass, and melodies at c4–g5 on triangle. These are all clearly audible ranges. Every cutoff range starts at 200 Hz or higher.
- **§2:** signal, range, rangex, segment, perlin and rand are each introduced in plain words before their name is used. "Wobble" was undefined (P-04).
- **§3:** each simplification is narrowed to what the example does: rounding up of fractional degrees, "both bounds must be above 0", and "with plain numbers the order makes no difference; with a patterned range it does".
- **§4:** tempo arithmetic is shown step by step (22.5 cycles per minute → 2.67 s bar → 10.7 s sweep). "One cycle per bar" is marked as this course's convention.
- **§5:** look-alikes are compared on the same line: saw vs isaw, range vs rangex, eighths vs sixteenths under the same `fast(4)` signal, perlin vs rand, and `slow` before vs after `segment` and `range`.
- **§6:** cutoffs in Hz, sweep lengths in bars and seconds, degrees counted from 0, and the c4/octave-3 boundary for `scale`.
- **§7:** signal plots for tri, the `fast(4)` sine, perlin and the eight-bar tri; ABC for both stepped melodies; a table of downbeat values for range vs rangex.
- **§8:** messa di voce and terraced dynamics, trombone slide positions, piano hammer, trombone vs piano glissando, choir tone and pianist's touch, chant contour, verse-by-verse hymn shaping. All come from the learner's own experience.

## Findings

Severity: H = fix before shipping, M = should fix, L = polish.

- **P-01 (M)** signals.md bridge, §8. Quote: "`square` is a Baroque echo: one level, then the other." Problem: an echo goes loud then soft, but `square` goes low then high, so the analogy does not hold. Title "Six hairpins" fits neither `square` nor `sine`. Fixed: "terraced dynamics: two levels, half a bar each"; title "Six dynamic shapes".
- **P-02 (L)** signals.md, word budget. ~308 words. Fixed by tightening two sentences (~297).
- **P-03 (L)** range.md, word budget. ~308 words. Fixed: "The ear hears frequency as ratios: each doubling is one octave." and a shorter min > max sentence (~296).
- **P-04 (M)** signal-speed.md:7, §2. "`.fast(4)` is one wobble per beat". "Wobble" carries the rest of the lesson and was never defined. Fixed: "one wobble (one full repetition of the signal) per beat".
- **P-05 (M)** phrase-sweeps.md:9, §6 (state conditions). "`tri.slow(8)` starts dark in bar 1". A signal is not dark; it is dark only when it drives `lpf`. Fixed: "Driving `lpf`, `tri.slow(8)` starts dark …".
- **P-06 (L)** phrase-sweeps.md:26, §6 (exact statement). "the second verse never arrives". Fixed: "does not arrive until bar 65".
- **P-07 (M)** `mod.range.v04` prompt, §6. "spends about equal time on every octave" is false for a sine swing. Fixed: "symmetric, spending as long near the dark end as near the bright end".
- **P-08 (M)** `mod.phrase-sweeps.v04` listen_for, §3. "with c3 almost gone" invites "then why do I still hear the chord?". Fixed: the fundamentals go, the upper partials and the pitches remain. "Full" (no lexicon entry) was replaced.
- **P-09 (L)** `mod.signal-speed.v02` ("wah"), `mod.perlin.v02` and `v03` ("weight"), §2. Colloquial or overloaded words. Fixed: "the filter audibly opens and closes"; "force"; "even ratios rather than even steps in hertz".
- **P-10 (L, kept)** signals.md, §7. The table describes six shapes, but only `tri` is plotted. `:::signal` draws one shape per block and lessons allow one or two visuals, so a six-shape family plot would need a multi-curve signal directive (like the filter `curves:` list). Reported as a tooling suggestion; the table gives the downbeat value and motion of each.
- **P-11 (L, kept)** range.md, §7. The linear-vs-exponential mapping is shown as a table of downbeat values rather than two curves. `:::signal` has no `rangex` option. Reported as a tooling suggestion.
- **P-12 (L)** `mod.signal-speed.v04` listen_for, §6. "8 ÷ 2.67 = 3" is a rounded equality. Fixed with the exact 8/3.

## Prompts and listen-for lists

All 27 variants were read. Listen-for items name what changes, where in the bar and in which direction, with corrective hints ("If yours gets brighter through the bar, you used saw: switch to isaw"; "If the cutoff changes only once per bar, segment came before slow"). Describe-to-code prompts state the admissible value ranges (`mod.signals.v04`, `mod.perlin.v01`). Every qualitative word now has a `lexicon:` source (bright, dark, thin).
