---
id: pit.chord-voicing.lesson
title: Chord symbols and voicing
skill: pit.chord-voicing
---

Writing every chord tone by hand is slow. Strudel can read lead-sheet chord symbols instead: `chord` sets the symbols, and `.voicing()` turns each one into notes {cite doc=chord} {cite doc=voicing}. A symbol is a root letter (with *b* or *#* if needed) and a chord type. No type means major (C), *m* means minor (Am), *7* the dominant seventh (G7) and *o* diminished (Bo) {cite src="packages/tonal/voicings.mjs#L224-L243"} {cite src="packages/tonal/ireal.mjs#L37-L37"}.

:::play{label="C, Am, F, G: one chord symbol per bar, voiced"}
chord("<C Am F G>").voicing().s("triangle")
:::

`voicing` doesn't play a close-position triad. Its default dictionary holds several piano voicings for each chord type, mostly four or five notes over about two octaves, with doubled tones {cite src="packages/tonal/voicings.mjs#L83-L83"} {cite src="packages/tonal/voicings.mjs#L245-L245"} {cite src="packages/tonal/ireal.mjs#L49-L50"}. For each chord it picks the voicing whose **top note** is the closest chord tone at or below C5 (later lessons move that limit) {cite src="packages/tonal/tonleiter.mjs#L139-L169"}. Here is what the example plays:

:::abc
X:1
M:4/4
L:1/4
K:C
%%score {1 2}
V:1
[CEGc]4 | [CEAc]4 | [CFAc]4 | [DGB]4 |
V:2 clef=bass
E,4 | A,4 | F,4 | G,4 |
:::

The C chord has C5 on top and E3 in the bass, so it is a first-inversion chord (a 6/3). The other three happen to have their root in the bass. The symbol fixes the pitch classes. The voicing fixes the spacing and the inversion.

Two practical details. A symbol missing from the dictionary plays nothing and logs "unknown chord" {cite src="packages/tonal/voicings.mjs#L209-L212"}. Bdim is one, so write Bo. And `voicing` names black keys as flats, so an F sharp appears as Gb in the event list {cite src="packages/tonal/tonleiter.mjs#L74-L78"} {cite src="packages/tonal/tonleiter.mjs#L170-L170"}.

:::bridge{title="Realising the symbols"}
A chord symbol is figured bass turned around. It names the root and the quality, but leaves the bass and the spacing to the player. `voicing` is your continuo player: it realises each symbol at the keyboard from a fixed set of hand positions.
:::
