# M2 prose-style review: U2 "Pitch & harmony" (STYLE_TIPS.md §1-§8)

Reviewer: independent; I read every lesson, prompt and listen-for list as the learner (an advanced classical musician who knows Web Audio graphs). Fixes were applied in the same pass.
Scoring: ✅ follows / ⚠️ partly / ❌ fails, **after** the fixes below. Word counts are prose only (frontmatter, directive bodies and `{cite}` tags excluded; `:::bridge` text included).

## Summary

| Lesson | §1 | §2 | §3 | §4 | §5 | §6 | §7 | §8 | Words (≤300) |
|---|---|---|---|---|---|---|---|---|---|
| scale-degrees | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~251 |
| modes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~247 |
| chords-mini | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~257 |
| parallel | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~281 |
| polyphony | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~229 |
| chord-voicing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~253 |
| register-inversion | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~238 |
| progressions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~268 |

Totals after fixes: 0 ❌ cells, 0 ⚠️ cells. 9 findings: 8 fixed, 1 kept as a nit. Every lesson is within the word budget.

How each tip was followed overall:
- **§1 (audible demos):** pitched demos sit in octaves 3–5 on triangle, square or sawtooth; voicings bottom out at D3.
- **§2 (terms):** scale degree, mode, voicing, anchor and dictionary are defined before use. `add` is now defined in polyphony instead of assumed (S-04).
- **§3 (simplifications):** note values and the `above` landing rule are now stated with their conditions (S-01, S-07).
- **§4 (inferences):** characteristic mode degrees are given against the right reference scale (S-02).
- **§5 (look-alikes):** `n` + `scale` vs `note`, scale-step vs semitone transposition, `voicing()` modes compared on the same chord.
- **§6 (units):** intervals in steps and semitones, spans in octaves (S-06 fixed).
- **§7 (shapes drawn):** every melody and voicing has an ABC staff.
- **§8 (analogies):** figured bass, sequences, grand-staff reading; the fugue analogy was corrected (S-03).

## Findings

Severity: H = fix before shipping, M = should fix, L = polish.

- **S-01 (M)** chords-mini.md:7, §3. The two-step example was described with the wrong note value. Fixed: two steps are half notes; the four-step demo is quarters.
- **S-02 (M)** modes.md:28, §4. Characteristic degrees were all measured against major. Fixed: dorian and phrygian against natural minor, lydian and mixolydian against major.
- **S-03 (L)** parallel.md bridge, §8. "tonal and real answer in a fugue" names a different device. Fixed: "tonal and real sequence".
- **S-04 (M)** polyphony.md:7, §2. Opened with `add`, which this skill's prerequisites do not teach. Fixed: opens with comma chords, `add` defined in place at :31.
- **S-05 (L)** `pit.polyphony.v01` prompt, §2. "staff check" is insider wording. Fixed: "The upper part is on the treble staff and the bass on the bass staff."
- **S-06 (L)** chord-voicing.md, §6. "about two octaves" overstated the span. Fixed: "about an octave and a half".
- **S-07 (M)** register-inversion.md, §3. The `above` landing rule and the root mode were stated without conditions. Fixed: "For a major or minor triad …"; root mode is "the dictionary's first voicing … root in the bass".
- **S-08 (L)** `pit.scale-degrees.v02` listen_for, §6. Note numbering was off. Fixed: "Notes 4 to 8 outline the tonic triad".
- **S-09 (L, kept)** `pit.register-inversion.v02`: "still in default mode" is slightly loose (no mode is set, so the default applies). The meaning is clear, so it was left.
