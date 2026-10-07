# M2 prose-style review: U1 "Time & rhythm" (STYLE_TIPS.md §1-§8)

Reviewer: independent; I read every lesson, prompt and listen-for list as the learner (an advanced classical musician who knows Web Audio graphs). Fixes were applied in the same pass.
Scoring: ✅ follows / ⚠️ partly / ❌ fails, **after** the fixes below. Word counts are prose only (frontmatter, directive bodies and `{cite}` tags excluded; `:::bridge` text included).

## Summary

| Lesson | §1 | §2 | §3 | §4 | §5 | §6 | §7 | §8 | Words (≤300) |
|---|---|---|---|---|---|---|---|---|---|
| cycles-tempo | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~247 |
| drums | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~257 |
| subdivide | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~234 |
| rests-lengths | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~275 |
| alternate | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~240 |
| layers | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~204 |
| euclid | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~249 |

Totals after fixes: 0 ❌ cells, 2 ⚠️ cells. 9 findings (below): 7 fixed, and 2 low-severity ones kept with reasons (the two ⚠️). Every lesson is within the word budget.

How each tip was followed overall:
- **§1 (audible demos):** synth demos sit at c4–e5 on triangle or square. The lowest pitched note anywhere is c3 (`rhy.euclid.v03`, sawtooth), at the L1 floor. Drum demos are labelled "(needs network)".
- **§2 (terms):** cycle, step, unit, slot, sample and bank are each defined before use. Two light ⚠️ remain (see S-06, S-07).
- **§3 (simplifications):** the boundary cases are answered in place: three steps and five steps (cycles-tempo), `"c4@3 e4 g4"` (rests-lengths), the quintuplet group (subdivide). The `/n` claim was fixed (S-03).
- **§4 (inferences):** "bar = cycle" is presented as this course's convention every time (cycles-tempo, euclid). Strudel's "no bars" is stated.
- **§5 (look-alikes):** `!` vs `*` on the same input, `@2` vs `~` as a compare, `*3` vs `[ ]`, comma vs `stack`, `(3,8)` vs `(3,8,2)`, TR-808 vs TR-909 on the same beat.
- **§6 (units):** tempi in BPM and cycles per minute, durations in seconds, gaps in eighths and sixteenths. Rotation counts from 1, with the wrap stated.
- **§7 (shapes drawn):** every rhythm described has an ABC staff or the Euclid slot diagram.
- **§8 (analogies):** conductor's beat pattern, percussion part, triple tonguing (trombone and tuba), voltas, hemiola and staves, fermata, 3+3+2 beaten long-long-short. All come from the learner's experience.

## Findings

Severity: H = fix before shipping, M = should fix, L = polish.

- **S-01 (M)** `rhy.rests-lengths.v03` prompt, §6. Quote: "Every other eighth is silent." Problem: it reads as alternate eighths and contradicts the reference. Fixed: "The other four eighths are silent."
- **S-02 (L)** `rhy.drums.v01` listen_for, §6. Quote: "on beat 3 together with the eighth after it". Problem: "together with" suggests simultaneity. Fixed: "plus a second kick on the eighth right after beat 3".
- **S-03 (M)** alternate.md:25, §3. Quote: "it slows a step down so that it lasts n cycles". Problem: the follow-up question "what about `c4 e4/2`?" gets a wrong answer. Fixed: the lesson now states what its example does (a group that fills the bar spreads over n bars) and narrows the scope ("This course uses `/n` only on a group like this").
- **S-04 (L)** subdivide.md:13, §2. Quote: "inside its own slot". Problem: "slot" is not defined in this lesson (euclid defines it later). Fixed: "in the time of that one step".
- **S-05 (M)** `rhy.drums.v03` listen_for, §2 and lexicon. Quote: "a short tick", "noisier". Problem: impressionistic words with no lexicon backing. Fixed: register and ring-length cues the learner can check.
- **S-06 (L, kept)** layers.md:38, §2. "write one `$:` line per part: each labelled line becomes its own part". "Labelled" is JavaScript vocabulary, but the sentence before shows `$:` lines and the code block follows straight away, so the meaning is clear in context.
- **S-07 (L, kept)** euclid.md:7, §2. "the Bjorklund algorithm" is named without explanation. The sentence is skippable: the next one says what the algorithm produces (gaps of 3, 3 and 2 eighths).
- **S-08 (L)** `rhy.euclid.v01` listen_for, §6. "lists (5,16) as the bossa nova rhythm" overstated the source. Fixed to quote "rhythm necklace" and explain it.
- **S-09 (L)** `rhy.cycles-tempo.v04` prompt, §2. "at the tempo marked" relied on a `Q:` field that was removed for gate safety (content review F02). Fixed: "at **96 BPM**".

## Prompts and listen-for lists

All 27 variants were read. Listen-for items are concrete (what, where in the bar, direction) and have 2–4 items each. Hints are where they help ("If yours pulls ahead of the target, lower the BPM"; "Not g4*6 c5*2, which has only two steps"). After the fixes no qualitative timbre word appears without a lexicon entry; U1 uses none.
