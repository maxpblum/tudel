# M2 adversarial content review: U4 "Time & modulation"

- **Reviewer:** fresh adversarial reviewer (LLM), not the author. Fixes were applied in the same pass (see Resolution).
- **Date:** 2026-10-07
- **Pin:** `f610965f4332837febe45743105da170e8b331ed` (`tools/strudel-ref/pin.json`).
- **Scope:** `content/units/u4/lessons/*.md` (7), `content/units/u4/exercises/*.yaml` (27), the seven `mod.*` entries in `content/skills.yaml`, the U4 part of `docs/curriculum.md`, `docs/plan/M2-plan.md` (U4 skill list), ADR 0201 §1 and §5.

## Method

Nothing could be executed in this review, so every gate was checked by hand.

1. **Haps and values.** For every solution and lesson snippet I computed the control values at each note onset from the pinned signal definitions (`saw = t % 1`, `isaw = 1 − t % 1`, `sine = ½ + ½ sin 2πt`, `cosine = sine` shifted ¼ earlier, `square = ⌊2t⌋ mod 2`, `tri = fastcat(saw, isaw)`), `range` (`x(max − min) + min`), `rangex` (`range` on the logs, then `exp`), `segment` (`struct(pure(true).fast(n))`) and `scale` (degree rounded up with `Math.ceil`). I compared them with the L3 snapshots `packages/verify/__snapshots__/mod.*.snap`. Every number quoted in prose and listen-for lists matches, to rounding: the range table (950, 1700, 2450 vs 400, 800, 1600 Hz), the 1400 Hz eighths and the 1400/2400/1400/400 Hz sixteenths, the 400/1100/1800/2500 Hz steps, MIDI 60–71 and 60–74 runs, the arch c4 e4 g4 b4 d5 b4 g4 e4, the sine melody g4 b4 c5 b4 g4 e4 c4 e4, the perlin downbeats 300, 992, 2733 and 495 Hz, and rand/perlin = 0 at cycle 0.
2. **ABC agreement (L4).** `mod.segment.v01` (MIDI 60, 62 … 74 in eighths) and `mod.signal-melody.v01` (C E G B d B G E in eighths, `K:C`) match the snapshot pitches, onsets and durations exactly. Both are dyadic values, so there is no float drift.
3. **Accepted alternatives (L5).** `mod.signal-melody.v01` (`range` before or after `segment`: the same arithmetic on the same sample times) and `mod.phrase-sweeps.v02` (`"<1500 4000>/8"` vs `"<1500!8 4000!8>"`: the same bound on every cycle). Both are hap-identical by construction.
4. **Citations (L8b).** Every `src` cite was fetched at the pin from `codeberg.org/uzu/strudel/raw/commit/<pin>/…` and read (list below). doc= cites were checked with `jq` on `tools/strudel-ref/doc.json`.
5. **Names and style (L2, L7, L8a).** All identifiers are primary doc.json names. Code spans were checked with the L8a rules. Line widths are ≤ 80. Multi-line references (`mod.signals.v03`, `mod.range.v03`) are over 80 characters when joined, so Prettier keeps them expanded.
6. **Lexicon.** Every variant's title, prompt and listen-for list was searched for qualitative words and compared with its `lexicon:` sources (F05).
7. **Policy.** ADR 0201 §1: all U4 snippets are synth-only (`sawtooth`, `square`, `triangle`), with no `bank` and no samples. §5: no lesson re-teaches `sine.range(a, b).slow(n)`.

## Findings

| ID | Location | Severity | Claim | Problem | Resolution |
|---|---|---|---|---|---|
| F01 | `lessons/signals.md` bridge | minor | "`square` is a Baroque echo: one level, then the other." Title "Six hairpins". | An echo goes loud then soft, but `square` goes from 0 to 1 (low then high). "Baroque" repeats the generalisation the M1 review flagged (F17). `square` is not a hairpin, and `sine` is a pair of them. | Fixed: "`square` is terraced dynamics: two levels, half a bar each." Title "Six dynamic shapes". |
| F02 | `exercises/mod.range.v04.yaml` prompt | minor | With `rangex`, a sine swing "spends about equal time on every octave". | False. A sine dwells at its extremes, so even on a log axis the top and bottom octaves get more time than the middle ones. What `rangex` gives is symmetry between the two ends, which the listen-for already says. | Fixed: "the other is symmetric, spending as long near the dark end as near the bright end." |
| F03 | `lessons/phrase-sweeps.md:26` | nit | With `.slow(8)` after a patterned range, "the second verse never arrives". | It arrives at bar 65 ("1500 Hz holds for 64 bars"). | Fixed: "does not arrive until bar 65". |
| F04 | `exercises/mod.phrase-sweeps.v04.yaml` listen_for, prompt | minor | "thin by bar 8, with c3 almost gone"; "Full in bar 1"; "the full sound returns". | By bar 8 the high-pass is above 1.1 kHz, so it is above *all three* fundamentals (131, 196 and 311 Hz). But the sawtooth partials above the cutoff remain, so c3's pitch does not vanish (the missing-fundamental issue of M1 F15). "Full" is a qualitative word with no lexicon entry. | Fixed: "close to the unfiltered chord in bar 1 (100 Hz is below c3's fundamental) … the cutoff is higher than all three fundamentals and mostly their upper partials are left; the chord's pitches still sound"; "the low end returns". |
| F05 | variant `sources:` | minor | content-authoring §1: every qualitative word needs a `lexicon:` source. | Missing: `mod.range.v02` (brightening → bright), `mod.segment.v02` and `v03` (brightness → bright), `mod.perlin.v03` (dark), `mod.perlin.v04` (brightness → bright). Unlexiconed words: "wah" (`mod.signal-speed.v02`), and "weight" in `mod.perlin.v02` and `v03`, a lexicon synonym for spectral body (entry `thin`), used here for touch and for octave spacing. | Fixed: added the five sources. Reworded "wah" ("the filter audibly opens and closes"), "weight" → "force" (v02), and "even ratios rather than even steps in hertz" (v03). |
| F06 | `lessons/phrase-sweeps.md:7,9` | nit | "Signals count from cycle 0 {signal.mjs#L18-L21}"; "`tri.slow(8)` starts dark". | The cite shows that signals read the query time, not that playback starts at 0. "Dark" holds only when the signal drives `lpf`. | Fixed: added `{cite src="packages/core/cyclist.mjs#L101-L104"}` (already used in the perlin lesson) and "Driving `lpf`, …". |
| F07 | `exercises/mod.signal-speed.v04.yaml` listen_for | nit | "8 ÷ 2.67 = 3 bars". | 8 ÷ 2.67 = 2.996. The prompt says "exactly 8 seconds". | Fixed: "60 ÷ 22.5 = 8/3 ≈ 2.67 seconds, so 8 seconds is exactly 3 bars". |
| F08 | `docs/plan/M2-plan.md:113` | minor | U4 skill `mod.slow-signals`. | `skills.yaml`, the lesson, the variants and `docs/curriculum.md` all use `mod.signal-speed`, which covers `slow` and `fast`. | Fixed: the plan now names `mod.signal-speed` and notes the earlier working name. `docs/curriculum.md` already agreed (DOT graph, table and type counts re-checked: 6 sweep, 7 match-by-ear, 4 describe-to-code, 4 spec-to-code, 3 transform, 2 dictation, 1 read-the-code). |
| F09 | `docs/strudel-idioms.md` | minor | Each `idiom_note` should match an idioms entry. | No U4 entry existed. | Fixed: added M1–M7, with verified citations and code taken only from snapshotted snippets. |
| F10 | `lessons/perlin.md:11-18` `:::signal` | nit | `shape: perlin`, `period: 4`, label "a new level at each barline". | content-authoring says `period` is the `.slow(n)` value. The code shown has no `slow`, but the plot is right only because `apps/web/src/ui/plotMath.ts:79` changes the illustrative perlin level every `period / 4` cycles, so `period: 4` draws one level per bar. | Kept (the rendered plot matches the label and the code). Reported for the directive doc or plotMath owner. |

No **blockers** were found.

## Claims I tried to refute and confirmed correct

**Source citations (read at the pin):**
- `core/signal.mjs`: `#L18-L21` `signal()` evaluates at `state.span.begin` (the onset); `#L35` saw; `#L56` isaw; `#L70-L80` sine (from bipolar); `#L91` cosine = `sine._early(1/4)`; `#L107` square; `#L124` tri = `fastcat(saw, isaw)`; `#L237-L264` legacy RNG from time only, period 300 cycles; `#L243-L248` seed 0 gives 0; `#L449` `rand` from `getRandsAtTime(t)`; `#L626-L635` `_perlin` with smootherstep between random values at whole cycles.
- `core/pattern.mjs`: `#L1771-L1773` `range` = `mul(max − min).add(min)`; `#L1786-L1788` `rangex` = `_range(log min, log max).fmap(exp)`; `#L2173-L2175` `segment` = `struct(pure(true)._fast(rate))`.
- `core/controls.mjs#L41-L49`: a control applied to a pattern uses `pat.set(reify(value))`, so structure comes from the notes.
- `core/cyclist.mjs#L101-L104`: `start()` resets the cycle counters to 0.
- `superdough/helpers.mjs#L241-L248`: the biquad's `frequency` and `Q` are set once per note.
- `tonal/tonal.mjs#L36-L37`: `scaleStep` applies `Math.ceil` to the degree.

**doc.json:** `sine`, `cosine`, `saw`, `square`, `tri` "between 0 and 1"; `isaw` "between 1 and 0"; `perlin` "in the range 0..1"; `rand` "between 0 and 1"; `rangex` "following an exponential curve"; `segment` "n events per cycle"; `scale` "zero indexed" and "The root note defaults to octave 3"; `note` "69 is mapped to A4 440Hz"; `slow` and `fast`; `setcpm`.

**Behaviour checked against the snapshots:** isaw opens at 4000 Hz and saw at 400 Hz per bar; cosine is brightest on the first downbeat; the tri gain peaks on the fifth eighth (0.9) under a square cutoff that switches at beat 3; `fast(2)` peaks on the offbeat eighths after beats 1 and 3; `saw.fast(4)` gives four-step ramps per beat; `slow(3)` at 90 BPM is exactly 8 s, brightest on beat 4 of bar 1 and darkest on beat 2 of bar 3; `tri.slow(2).segment(4)` gives 300, 975, 1650, 2325, 3000, 2325, 1650, 975 Hz; the pentatonic arch with degrees 0–7, then 8 (g5), then 7–1; `sine.rangex(200, 3200).slow(2)` starts at 800 Hz; `isaw.rangex(300, 4800).slow(8)` falls half an octave per bar; `hpf` doubles every two bars from 100 Hz. All pitched notes are ≥ c3.

## Counts

7 lessons, 27 variants, 29 solutions plus 3 starters and the lesson snippets read against snapshots, 2 ABC dictations, 2 accepted alternatives, 19 distinct `src` citations fetched and read. 10 findings: 0 blockers, 6 minor, 4 nits. 9 fixed, 1 kept and reported.

## Reference code changed

None. All fixes are prose, prompts, `sources:` or docs, so no U4 snapshot goes stale.
