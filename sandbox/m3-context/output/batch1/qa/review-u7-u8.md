# Style QA review: u7 (buses) and u8 (detune and wobble)

Reviewer: a fresh subagent that did not write this content, reading as the learner. Date: 2026-10-09.
Scope: `units/u7/**`, `units/u8/**` (8 lessons, 32 exercises), and the u7/u8 entries in `skills.yaml`.
I read every lesson sentence by sentence against the STYLE_TIPS checklist, skimmed every prompt and listen_for, and checked all arithmetic: cents to Hz, beat rates, dB to gain, sine and saw sample points, arp positions, and filter-envelope octaves.

## Checklist, overall

| Tip | How well it was followed |
|---|---|
| 1. Audible demos | Good. Everything is at C3 or above, and comparisons use short plucks so tails and pan are easy to hear. One weak demo was fixed (see the drift/vibrato compare below). The spread compare says it needs headphones. |
| 2. Terms defined before use | Mostly good: cents, beats, unison voice, send, orbit, effect bus, arpeggiator and impulse response are each named and then explained. Failures: "orbit" was used one lesson before it is defined, and `distort` was never introduced. |
| 3. Simplifications | Good. Conventions are flagged ("a convention, not a Strudel rule"), and the gotchas (bare `n` on supersaw, `detune` on sawtooth, `chorus`) are spelled out. One "but what about the harmonics?" gap in the beating explanation was fixed. |
| 4. Inference steps | Good. Cents to semitones, halvings to dB, and cycle = bar (a course convention, said explicitly) are worked through. One false equivalence (gain vs postgain) was fixed. |
| 5. Look-alikes | Good for stack vs `$:`, gain vs postgain, drift vs vib, spread vs pan, spread vs superimpose vs jux, and pattern vs signal pan. detune vs drift/vib was not stated, so I added a sentence. |
| 6. Units and exactness | Very good. Every number has its unit (Hz, cents, dB, seconds, cycles), and arithmetic is shown. All checked values are correct. One prompt overstated how often the reverb is rebuilt. |
| 7. Shapes drawn | Good: signal plots for pan sweeps, range, drift and vibrato; graphviz for buses and voice offsets. The rangex curve can't be drawn (`:::signal` has no exponential mapping), so I added a barline table instead. |
| 8. Analogies from the learner | Strong: conductor's seating, cori spezzati, Mahler 2 offstage band, choir in a church, trombones tuning, alto section, singer's vibrato, Alberti bass. The voix céleste is organ *registration* (allowed). I added a trombone-at-fff analogy for distortion. |
| Stranger Things | OK. The lesson names it as an example of the style only. The arpeggios (Alberti 0 2 1 2 on Am F C G; 0 1 2 1 2 0 2 1 in E minor) and the melodies are original, and none uses the theme's rising and falling maj7 arpeggio. |

## Failures found and fixed

### u7 (6 fixes)
- `lessons/mixing-balance.md`: said "its orbit's summing node" before orbits are taught (the orbit lesson comes later) → "a shared summing node (an **orbit**, the subject of a later lesson)".
- `lessons/mixing-balance.md`: `distort` was used in the gain/postgain contrast but never introduced anywhere in the course → defined it briefly (wave-shaping, Strudel's 0 to 10 range, `{cite doc=distort}`), with a trombone-at-fff analogy for why a louder input distorts more.
- `lessons/mixing-balance.md`: "with only filters between them, `gain(0.2)` and `postgain(0.2)` sound the same" was false, because postgain multiplies the default gain of 0.8, giving 0.16 (about 2 dB quieter) → "they simply multiply: `postgain(0.2)` on the default gain 0.8 is the same as `gain(0.16)`".
- `lessons/mixing-balance.md`: the even-in-dB rangex curve was described but not shown (§7) → added a barline table comparing range and rangex in gain and dB.
- `exercises/bus.orbit.v03.yaml`: "rebuild it at almost every note" was wrong (only 2 rebuilds per bar, when the size changes) → "rebuilt twice in every bar: once for the sine's 8 seconds, then for the plucks' 1 second".
- `exercises/bus.shared-effects.v02.yaml`: the listen_for stated a 6-second tail as fact, but the prompt allows 5 to 8 seconds → "(about 6 seconds in the reference)".
- Also (wording): `lessons/stereo-pan.md`, `bus.stereo-pan.v04` title and the `skills.yaml` summary called `jux(rev)` a "canon". A line against its own retrograde at the same time is a crab canon → "crab canon", with Bach's *Musical Offering* as the learner's reference. `lessons/shared-effects.md`: "An orbit splits a space" → "divides the work".

### u8 (6 fixes)
- `lessons/pitch-drift.md`: the drift-vs-vibrato compare used `sine…slow(2)`. Both a4 onsets (beats 1 of bars 1 and 2) landed on the sine's zero crossings, so the long note never drifted and only the short e4 moved by about ±14 cents, which is hard to hear → `slow(3)`. Evaluated: the a4s are now at 0, +17 and −17 cents.
- `lessons/pitch-drift.md`: added the detune vs drift/vibrato contrast (fixed offsets between simultaneous voices vs a pitch moving over time).
- `lessons/supersaw.md`: the beat rates were given for fundamentals only, which invites a brass player's "but the partials?" → added that each partial beats proportionally faster, the 2nd twice as fast, the 10th ten times.
- `lessons/supersaw.md`: "fuller, softer edge". The lexicon says "soft" is ambiguous and must be paired with a clearer word → "fuller than any solo voice and with a less sharply focused pitch".
- `lessons/detuned-lead.md` and `exercises/det.detuned-lead.v04.yaml`: detune was described as "heard as warmth". The lexicon ties *warm* to a moderate low-pass, not to detune → "heard as movement".

Verified as correct (no change): all cents↔Hz beat rates (2.5, 0.7, 2.7, 1.5, 7.7, 3.0, 4.5, 15.5, 4.6, 9.2, 2.3, 1.2, 3.6 per second); all dB values (−1.9, −6, −8, −12, −14, −20, 8.5 dB, the 13/5 dB split, 4.5 dB per bar); sine pan sample points; saw sixteenth offsets (50 to 87.5 cents); arp outputs; lpenv octaves and the default filter decay of 0.14 s (`helpers.mjs#L251`); perlin starting at 0 (evaluated: the first note is 63.8); chorus absent from superdough; Am/Dm/E voicings have 5 voices.

## Open issues (not fixed)

1. **Lexicon gaps.** These words are used as timbre descriptors and have no entry in `timbre-lexicon.yaml`: **wide** (10 uses, the core word of the chorus-detune lesson), **shimmer/shimmering** (12), **dry** (15, the counterpart of the existing *wet*), **sour** (6), **full/fuller** (several, beyond "full level" and "full scale"), **smeared/smears** (3), **close/distant** (spatial, from the shared-effects lessons), **rich/richer**, **thicken**. Add entries for at least wide, shimmer, dry and sour, or reword.
2. `lessons/stereo-pan.md` and `bus.stereo-pan.v04` use `rev`, but `bus.stereo-pan` prereqs don't include the skill that teaches it. Check that `rev` is taught earlier, or add the prereq.
3. `det.chorus-detune` teaches `jux` again without `bus.stereo-pan` as a prereq. That is fine as written, because the lesson re-explains it, but the graph could link them.
4. `pnpm verify` was not run on the batch (it is sandbox output). Only the changed snippet was evaluated. Run the gates when the batch is integrated, especially for the new `{cite doc=distort}`.
