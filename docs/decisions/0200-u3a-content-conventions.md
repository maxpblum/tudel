# 0200: Content conventions established in U3a

- **Status:** accepted (M1, WS-C)
- **Date:** 2026-10-05

## Context

U3a "Sound basics" is the first content written against the pinned Strudel (commit in `tools/strudel-ref/pin.json`). While it was being written, a few points came up where the docs, the source, and teaching convenience pulled in different directions.

## Decisions

1. **Source over docs when they disagree.** When `doc.json` text and the pinned source differ, content states the source behaviour, cites the source lines, and mentions the doc wording. Two cases came up in U3a:
   - `gain`'s doc text says "exponential", but the gain curve is the identity by default (`packages/superdough/superdough.mjs#L65-L69`, `#L606-L611`).
   - The workshop says that `.lpf(sine.range(100, 2000).slow(4))` repeats every 8 cycles. The source and the harness show 4 (`website/src/pages/workshop/first-effects.mdx#L284-L293`, `packages/core/signal.mjs#L70-L80`).
2. **Explicit sustain for plucks.** Superdough infers sustain ≈ 0 when `decay` is set without `sustain` (`packages/superdough/helpers.mjs#L167-L178`). References still write `.sustain(0)` for readability. `.decay(x)` alone is *not* listed as an accepted alternative, because its haps differ (L5).
3. **Minimal mini-notation before U1.** U3a is taught first (the M1 slice), so it uses only spaces (equal steps), `[ ]`, `*n`, `@n`, `!n`, `,` and `<...>`. The waveforms lesson, which is the root of the skill graph, explains all of them in one paragraph and plays one example. The highpass lesson repeats the `,` chord explanation. Anything else waits for U1.
4. **Synths only in U3a**, so the whole unit works offline, with no sample banks.
5. **Accepted alternatives** are listed only after their haps have been compared with the canonical solution's in the harness. Each one carries a `note` saying why the canonical form is preferred.
6. **Lexicon confidence is honest.** Terms whose tendencies are partly this course's convention (*warm* cutoff ranges, *pluck* sustain 0, *pad* slow attack) are marked `subjective` or given lowered confidence, and the `notes` say which part is convention.

## Consequences

Reviewers can check every behavioural sentence against a line range. If the pin is bumped, the drift job and a re-read of the cited ranges are needed, because line numbers will move.

## Amendments (after the M1 adversarial review, docs/qa/reviews/M1-content.md)

- **Method order (F01).** The order of method calls is a readability convention only. The convention is note, `s`, envelope, filters, then `gain` and effects (`docs/house-style.md`). References that combine an envelope with a filter were reordered to match. Their haps are unchanged apart from key order.
- **`snd.amp-envelope` now requires `snd.lowpass` (F03).** We kept `lpf` in the envelope lesson and in the pad variant rather than removing it. Envelope work is most musical on a filtered, rich source: a pad is "slow attack plus a darkened sawtooth", and that is the classic subtractive voice. Moving the skill one step later in a five-skill DAG costs little. The alternative would have been teaching envelopes only on raw waveforms, which makes pads sound unidiomatic.
- **Lexicon synonyms.** A word listed as a synonym in a lexicon entry's `notes` (for example "body" and "weight" under `thin`, or "percussive" and "blip" under `plucky`) counts as that entry. A variant that uses it must cite the entry with `lexicon:`.
