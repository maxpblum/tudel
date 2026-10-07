# M2 adversarial content review: U2 "Pitch & harmony"

- **Reviewer:** fresh adversarial reviewer (LLM), not the author. Fixes were applied in the same pass (see Resolution).
- **Date:** 2026-10-07
- **Pin:** `f610965f4332837febe45743105da170e8b331ed` (`tools/strudel-ref/pin.json`).
- **Scope:** `content/units/u2/lessons/*.md` (8), `content/units/u2/exercises/*.yaml` (27), `content/glossary/chord-symbols.yaml` (15 symbols), the `pit.*` entries in `content/skills.yaml` (read only).

## Method

Nothing could be executed in this review (no node, pnpm or git), so every gate was checked by hand.

1. **Haps.** For every solution and lesson snippet I derived onsets, durations and pitches from mini-notation and `scale`/`n`/`add`/`voicing` semantics. Where snapshots exist (`pit.modes.v01`–`v04`, `pit.scale-degrees.v01`–`v03`, lesson snapshots) they match the current code. Most variants have no snapshot yet.
2. **Voicings.** I ran the `voicing()` algorithm by hand (`voicings.mjs#L196-L215`, `tonleiter.mjs#L131-L179`, dictionary `ireal`) for every chord, anchor and mode used. Results agree with the snapshots (C = E3 C4 E4 G4 C5, Am = A3 C4 E4 A4 C5, F = F3 C4 F4 A4 C5, G = G3 D4 G4 B4, G7 = G3 D4 F4 G4 B4). I also derived the chords without snapshots: Em E3 B3 E4 G4 B4, D D3 A3 D4 Gb4 A4, Dm D3 A3 D4 F4 A4, Bb D3 Bb3 D4 F4 Bb4, Gm G3 Bb3 D4 G4 Bb4, C7 E3 Bb3 E4 G4 C5, D7 Gb3 C4 D4 Gb4 C5, E E3 B3 E4 Ab4 B4. Every pitch named in a `listen_for` was checked against these.
3. **ABC agreement (L4).** All 6 dictations (`pit.scale-degrees.v01`, `pit.modes.v03` with `K:Ddor`, `pit.chords-mini.v01`, `pit.parallel.v02`, `pit.polyphony.v01` with `only_sounds: [triangle]`, `pit.chord-voicing.v01`) were converted to onset/duration/pitch in cycles (whole note = 1 cycle) and compared with the derived haps.
4. **Accepted alternatives (L5).** One: `pit.parallel.v01` (`n(…).add(n("0,2"))`). Both sides produce objects, so `add` unions them with `unionWithObj` and the haps are identical to the comma-chord reference.
5. **Citations (L8b).** No local clone exists, so I fetched each cited file at the pin from codeberg and read the cited lines: `tonal.mjs`, `voicings.mjs`, `ireal.mjs`, `tonleiter.mjs`, `pattern.mjs`, `value.mjs`. doc= cites were checked in `tools/strudel-ref/doc.json` with `jq`.
6. **Names and style (L2, L7, L8a).** All identifiers are primary doc.json names. Lines are ≤ 80, double quotes only, call chains already in Prettier's layout. Inline spans checked against `checkSpan` by hand. Every chord symbol used appears in `chord-symbols.yaml` with correct spelling.

## Findings

Severity: blocker / minor / nit.

| ID | Location | Severity | Claim | Problem | Resolution |
|---|---|---|---|---|---|
| F01 | `lessons/scale-degrees.md` ABC | minor (risk) | `w: 0 2 4 7 4 2 0 -1` under the staff. | In ABC lyrics `-` is a syllable hyphen, so `-1` does not render as "−1" and may misalign or warn (L4 requires a clean parse). | Fixed: removed the `w:` line. The degrees are in the prose and the code. |
| F02 | `lessons/chord-voicing.md`, `progressions.md`, `register-inversion.md` ABC | minor (risk) | `%%score {1 2}` grand-staff directive. | abcjs support for this directive could not be confirmed offline, and the two voices already render on separate staves. | Fixed: removed in all three. Rendering only, no hap change. |
| F03 | `exercises/pit.scale-degrees.v02.yaml` listen_for | minor | Miscounted the notes that outline the tonic triad. | Hand-derived haps put the triad at notes 4–8. | Fixed: "Notes 4 to 8 outline the tonic triad, D4 F sharp 4 A4 F sharp 4 D4". |
| F04 | `lessons/chord-voicing.md` | minor | Default voicings span "about two octaves". | The widest default voicing here (E3–C5) spans a minor thirteenth, about an octave and a half. | Fixed: "about an octave and a half". |
| F05 | `lessons/register-inversion.md` | minor | `mode("above")` lands exactly on the anchor; mode root description. | The exact-landing statement holds for triads whose notes fit the rounding (`tonleiter.mjs#L139-L179`); the root mode uses the dictionary's first voicing with the root in the bass (`#L159-L161`). | Fixed: qualified "For a major or minor triad", and root mode now "the dictionary's first voicing … root in the bass". |
| F06 | `lessons/chords-mini.md:7` | minor | Note values of the two-step example. | Two steps per cycle are half notes; the four-step demo is quarters. The text mixed them. | Fixed. |
| F07 | `lessons/modes.md:28` | minor | Characteristic degree of each mode. | Stated against major for all modes; dorian and phrygian are conventionally compared with natural minor. | Fixed: dorian/phrygian vs natural minor, lydian/mixolydian vs major. |
| F08 | `lessons/polyphony.md:7, :31` | minor | Opens with `add`. | `pit.parallel` (which teaches `add`) is not a prerequisite of `pit.polyphony`. | Fixed: opens with comma chords `n("[0,2,4] [3,5,7]")`; `add` is defined where used. |
| F09 | `exercises/pit.polyphony.v01.yaml` prompt | nit | "staff check". | Unexplained jargon. | Fixed: "The upper part is on the treble staff and the bass on the bass staff." |
| F10 | `lessons/parallel.md` bridge | nit | "tonal and real answer in a fugue". | A fugal answer is a different device from transposing a line by scale steps vs semitones. | Fixed: "tonal and real sequence". |
| F11 | `content/skills.yaml` (not owned) | minor | Prerequisites. | `.lpf` is used in polyphony and progressions snippets, but `snd.lowpass` is not a U2 prerequisite; `pit.parallel` is not a prerequisite of `pit.polyphony`. | Reported to the owner, not changed. The lessons are self-contained after F08. |

No blockers. No reference code was changed; only lesson ABC blocks and prose.

## Claims I tried to refute and confirmed correct

- `scale` steps from octave 3 by default (`tonal.mjs#L36-L45`, `#L40`).
- The default voicing dictionary is `ireal` (`voicings.mjs#L83`); an unknown chord logs and plays silence (`#L209-L212`); aliases (`#L224-L243`).
- iReal symbols `^`, `-`, `o` (`ireal.mjs#L37`, `#L49-L50`) and their glossary spellings.
- Flats in voicing output (`tonleiter.mjs#L74-L78`, `#L170`), e.g. D = Gb4 not F#4; prose names them as sharps where musical, which the code does not contradict.
- `above` mode rounds down so the top lands at or below the anchor (code), even though the doc text says "bottom note >= anchor"; the lesson follows the code.
- `stack` vs comma, `appLeft` structure for `add` (`pattern.mjs#L175-L208`, `#L1321-L1330`).
- All 27 `listen_for` pitch claims, all six dictation ABCs, and the `pit.parallel.v01` alternative.
- `chord-symbols.yaml` covers C Dm Em F G Am Bo Bdim D E Gm Bb G7 C7 D7 with correct spellings and skills.
