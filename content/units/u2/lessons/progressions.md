---
id: pit.progressions.lesson
title: Simple diatonic progressions
skill: pit.progressions
---

A progression in Roman numerals becomes chord symbols once you name the key. In C major, I ii iii IV V vi vii° are C, Dm, Em, F, G, Am and Bo, and V7 is G7. In A minor, i and iv are Am and Dm, and V is E, major, because minor-key harmony raises the leading tone to G sharp. Put one symbol per bar inside `< >`, and `voicing` realises each bar {cite doc=chord} {cite doc=voicing}.

:::play{label="I IV V7 I in C major: C, F, G7, C"}
chord("<C F G7 C>").voicing().s("triangle")
:::

:::abc
X:1
M:4/4
L:1/4
K:C
%%score {1 2}
V:1
[CEGc]4 | [CFAc]4 | [DFGB]4 | [CEGc]4 |
V:2 clef=bass
E,4 | F,4 | G,4 | E,4 |
:::

The soprano runs C, C, B, C: a held common tone, then the leading tone and its resolution. `voicing` has no memory of the chord before. It places each chord on its own, against the same anchor {cite src="packages/tonal/voicings.mjs#L196-L215"} {cite src="packages/tonal/tonleiter.mjs#L139-L179"}. The smooth top line comes from that fixed anchor. Every top note is the closest chord tone at or below C5, so with these chords the soprano stays within a fourth below C5. Here it only steps or holds.

The bass is not so tidy. It runs E, F, G, E, so the two C chords are in first inversion, which weakens the cadence. To give the progression root-position weight, stack a bass line underneath, written as scale degrees. For a bass on the roots, each degree is the Roman numeral minus one:

:::play{label="The same progression over a bass on the roots: degrees 0 3 4 0"}
stack(
  chord("<C F G7 C>").voicing().s("triangle"),
  n("<0 3 4 0>").scale("C3:major").s("sawtooth").lpf(600),
)
:::

:::bridge{title="Numerals travel, symbols don't"}
Roman numerals describe a progression in any key. Chord symbols name one key's chords. I IV V7 I is C F G7 C in C major and F Bb C7 F in F major. To move a `chord` line to a new key, rewrite the symbols. To move a line written in degrees, such as the bass above, change only the `scale`.
:::
