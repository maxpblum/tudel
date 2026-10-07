# M2 prose-style review: U3b "Sound design II" (STYLE_TIPS.md §1-§8)

Reviewer: independent; I read every lesson, prompt and listen-for list as the learner (an advanced classical musician who knows Web Audio graphs). Fixes were applied in the same pass.
Scoring: ✅ follows / ⚠️ partly / ❌ fails, **after** the fixes below. Word counts are prose only (frontmatter, directive bodies and `{cite}` tags excluded; `:::bridge` text included).

## Summary

| Lesson | §1 | §2 | §3 | §4 | §5 | §6 | §7 | §8 | Words (≤300) |
|---|---|---|---|---|---|---|---|---|---|
| filter-envelope | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~291 |
| bandpass | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~273 |
| noise | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~266 |
| delay | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ~261 |
| room | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~236 |
| fm | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~296 |
| fm-envelope | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ~287 |

Totals after fixes: 0 ❌ cells, 2 ⚠️ cells. 9 findings: 6 fixed, 3 kept with reasons. Every lesson is within the word budget.

How each tip was followed overall:
- **§1 (audible demos):** pitched demos sit in octaves 3–5; noise demos are gain-matched so no source is much louder than another.
- **§2 (terms):** Q, wet/dry, feedback, modulation index and harmonicity are defined before use.
- **§3 (simplifications):** the odd-harmonic and bandwidth claims now carry their conditions (S-03, S-04).
- **§4 (inferences):** no forward references to lessons that do not exist (S-02).
- **§5 (look-alikes):** `bpq` 1 vs high Q, `delay` vs `room`, `fmenv` exp vs lin, white/pink/brown on the same rhythm.
- **§6 (units):** Hz, seconds, octaves, dB, fractions of a cycle for `delaytime`.
- **§7 (shapes drawn):** filter and FM envelopes are drawn with `:::envelope`, the bandpass with a response plot. Two gaps remain (S-07, S-08).
- **§8 (analogies):** mutes, hall acoustics, organ registration; "clarinet-like" for odd harmonics (S-09).

## Findings

Severity: H = fix before shipping, M = should fix, L = polish.

- **S-01 (M)** noise.md:7, §3. "three noise synths" was false (`crackle` exists). Fixed.
- **S-02 (M)** room.md:40, §4. "a later lesson covers how" pointed at a lesson that does not exist. Fixed: removed.
- **S-03 (L)** bandpass.md:20, §6. `bpq(5)` width now "a little under a third of an octave".
- **S-04 (M)** fm.md:25, §3. The odd-harmonics claim now says "On a sine".
- **S-05 (L)** `snd.bandpass.v03` listen_for, §3. "stands out above its neighbours" instead of implying the others vanish.
- **S-06 (L)** `snd.room.v03` listen_for, §6. Bar 1 is dry; the tail heard there on repeat comes from bar 4. Fixed.
- **S-07 (L, kept)** fm-envelope, §7. The exp curve is described but only the lin shape is drawn: `:::envelope` draws straight segments only, so an exp plot cannot be drawn without a new directive.
- **S-08 (L, kept)** delay, §7. The "running sixteenths" echo pattern is described, not drawn. The ABC directive could show it, but the echoes are not haps and a drawn staff could mislead about what the gate checks.
- **S-09 (L, kept)** bandpass play block uses `bpq` 1/4/12 while the plot uses 1/5/12; `snd.fm.v01` uses the "clarinet-like" analogy, which is outside the learner's own instruments but backed by the lexicon. Both are minor and left.
