# Style QA review: advanced harmony (u5) and pattern transforms (u6)

Reviewer: fresh subagent who did not write the content, 2026-10-09.
Scope: `units/u5/` and `units/u6/` (lessons and exercises), the u5/u6 entries in `skills.yaml`, and `glossary/chord-symbols.yaml`.
Method: I read every lesson sentence by sentence as the learner, and read every exercise prompt and listen_for item. I evaluated every voicing or event claim with `packages/verify/scripts/run.mjs eval`: all chord spellings in lessons, all reference solutions whose listen_for names pitches, the Frère Jacques wrap, the `revv` example, the `ply` and `struct` claims, and the inversion arithmetic. Except for the two errors below, every stated pitch list matched the evaluated events.

## Checklist, overall

| # | Tip | How well it was followed |
|---|---|---|
| 1 | Demos audible on laptop speakers (§1) | Good. Everything sits at C3 or above, and basses use a sawtooth with `lpf(500–600)`. The lessons warn about the lone low root that appears when the anchor drops (A2 for Am at anchor G4, and the roots of B♭^7 and B^7). |
| 2 | Terms defined before use, no insider shorthand (§2) | Good. No unit ids or file names. One leak: "Strudel's music-theory library" in the sus2 paragraph (fixed). |
| 3 | Simplifications don't invite "but what about…" (§3) | Mostly good. The `revv` aside was vague about what "whole pattern" means for a looping pattern (fixed with a concrete example). |
| 4 | No skipped inference; conventions separated from Strudel facts (§4) | Good overall. "Bar = cycle" is flagged as a course convention throughout. Fixed four gaps: the tempo arithmetic for `setcpm(112 / 4)`, why each step of the subject is an eighth, why eight `struct` steps are eighths, and a "So F/G sounds softer" that rested on an unstated reason. |
| 5 | Look-alikes contrasted on the same input (§5) | Very good: C7 vs C^7, below vs duck, offset 0 vs −1, F/G vs G7sus, IV vs iv, fast vs slow, rev vs palindrome, superimpose vs off, every vs lastOf, tonal vs real inversion, ply vs fast. Each gets a one-sentence difference. |
| 6 | Units, exact claims, boundary cases (§6) | Good: semitone counts, cycles and degrees are given, along with boundary cases (duck matches pitch, not letter name; `<>` under `fast`; axis between degrees). One wrong number fixed (23 → 11 semitones). |
| 7 | Shapes drawn (§7) | Good. ABC scores for the voice-leading claims, plus diagrams for the loop rotation, rev vs palindrome, every vs lastOf, and the four forms of a subject. |
| 8 | Analogies from the learner's experience (§8) | Very good: figured bass, chorale cadence, continuo, accompanying a singer, tuba pedal, Haydn al rovescio, Bach crab canon, dux/comes, cori spezzati, Art of Fugue, brass tonguing, hoquetus. Two were imprecise (fixed): "appoggiatura" for a chord-tone ♭6–5, and "two per beat" for double tonguing. |

Teaching correctness: every prompt gives enough to reach its reference, or the rubric and note say that several answers are fine (creative items, `when`/`revv` alternatives). The difficulty ratings are sensible. Roman numerals, borrowed-chord labels, figures (6/5, 4/2, 6/4) and historical references all check out.

## Failures found and fixes

### Advanced harmony (u5): 8 fixes

- `lessons/slash-chords.md`: **factual error.** "B3 sits a major seventh plus an octave (23 semitones) above the pedal C3." B3 is 11 semitones above C3. → Changed to "a major seventh (11 semitones)".
- `lessons/slash-chords.md`: "So F/G sounds softer than G7sus" did not follow from the preceding sentence (A instead of D). → Stated the reason: with A, the upper notes form a complete, consonant F major triad, and that is why F/G sounds softer.
- `lessons/extended-chords.md`: sus2 paragraph had insider wording ("means it to Strudel's music-theory library") and never told the learner what happens if they type the obvious `Csus2`. → "Strudel has no reliable symbol for it: Csus2 is not in the default dictionary, so, like Cmaj7, it plays nothing."
- `lessons/modal-mixture.md`: "like a melancholy appoggiatura". A♭→G in IV–iv–I is a chord tone moving to a chord tone, not an appoggiatura, so a classical reader would object. → "the same sighing ♭6–5 you know from the bass of a minor-key lament".
- `lessons/genre-progressions.md`: "28 cycles per minute, which … is 112 beats per minute" skipped the × 4. → Spelled out: one cycle = one bar of four beats, so 28 × 4 = 112.
- `lessons/genre-progressions.md`: "Classical analysis … would write VI and VII without the flats" left out III, which also appears in the numeral. → "VI, III and VII", plus why (numbered against the minor scale).
- `lessons/genre-progressions.md`: "a pedal in the soprano". → Added the term the learner knows: "what harmony textbooks call an inverted pedal".
- `exercises/pit.slash-chords.v02.yaml`: the prompt said the starter is "voiced from C4 upward", but Dm starts on A3 and E on B3, which the listen_for itself relies on. → "with each chord's lowest note at or just below C4".

### Pattern transforms (u6): 8 fixes

- `lessons/speed-dir.md`: "The bar holds eight units, so each plain step is an eighth" did not show the count or the 4/4 step. → Counted the units (five single notes, `[6 5]` = 1, `3@2` = 2) and stated that one bar of 4/4 is split into eight.
- `lessons/speed-dir.md`: "(`revv` also reverses a whole pattern rather than each cycle)" was vague for a looping pattern and invited the question "so which do I use?". → Made it concrete: `revv` reverses the order of the cycles too. I evaluated `n("<[0 1 2 3] [4 5 6 7]>").revv()` and confirmed that it runs C5 down to C4 across two bars.
- `lessons/canon.md`: "so any delay sounds consonant". To a counterpoint-trained reader that is false, because a fourth above the lower voice can occur. → "the two voices only ever sound notes of that one chord together".
- `lessons/inversion.md`: "An odd number puts the axis halfway" didn't say which number. → "An odd number after `add`".
- `lessons/ply-struct.md`: "double tonguing (two per beat, *ta-ka*)". Double tonguing is a syllable alternation, not a fixed count per beat. → "(*ta-ka*, for notes in pairs) … (*ta-ta-ka*, for notes in threes)".
- `lessons/ply-struct.md`: "eight steps, so each `x` is an eighth" was missing "in one bar of 4/4". → Added.
- `lessons/variation-every.md`: "A function that takes no settings can be passed by name" was abstract. → "A transform that needs no value of its own, such as `rev`, …".
- `exercises/pat.superimpose.v04.yaml`: listen_for said the bar "alternates leader and follower in eighths", but the leader's quarter notes overlap the follower. → "the attacks alternate leader, follower, in eighth notes".

## Open issues (not fixed)

- `lessons/voicing-controls.md`, offset bullets: "Any positive offset … moves the result up an octave". The source adds 12 semitones to where the *next* entry would sit, so for G, `offset(1)` gives G3 D4 G4 B4 D5. That is not the default G voicing an octave up. The stated consequence ("top note lands above the anchor") is true. An author may want to reword this to "the next entry, placed an octave higher than it would otherwise sit".
- `lessons/modal-mixture.md`: the table lists ♭III, but no demo plays it. It appears only as an option in the creative exercise. Consider a one-line demo.
- `lessons/superimpose.md`: "Because it sets `pan`, it goes after `n(...)` and `scale`". I did not evaluate what `jux` does inside the degree string.
- `exercises/pit.genre-progressions.v02.yaml`: the prose constraints ("starts on a minor chord, only triads from F major, a loop from the lesson") also fit the Aeolian vamp Dm C B♭ C. That is acceptable for ear dictation, because the audio decides, but the prompt alone does not determine the answer.
- `pnpm verify` was not run on this sandbox batch. Only the one changed inline snippet was evaluated.
