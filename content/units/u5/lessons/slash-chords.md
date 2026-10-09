---
id: pit.slash-chords.lesson
title: Slash chords, inversions and pedal points
skill: pit.slash-chords
---

A **slash chord** is a chord symbol with a bass note after a slash: C/E means "C major, with E in the bass". Lead sheets use slash chords in two different ways, and Strudel handles the two differently:

- **The bass is a chord tone.** C/E, G/B and Am/G are inversions. C/E is a 6/3, G/B is a 6/3, and Am/G puts G, the seventh of Am7, in the bass: a 4/2.
- **The bass is not in the chord.** F/G puts an F major triad over a G. A run such as C, F/C, G/C, C keeps C in the bass under chords that don't contain it. That is a **pedal point**.

You can't write either kind inside `chord`. Inside the quotes, `/` is mini-notation's "slow down" operator {cite src="packages/mini/krill.pegjs#L150-L151"}, so `chord("C/E")` stops with the error "Invalid argument". And even the part of `voicing` that can read a slash bass from a symbol throws that bass away: it keeps only the root and the chord type {cite src="packages/tonal/tonleiter.mjs#L22-L29"} {cite src="packages/tonal/tonleiter.mjs#L139-L144"}. So you write slash chords with the tools you already have.

**An inversion slash is `mode("above")` plus an anchor on the bass note.** With `mode("above")`, the bottom note is the closest chord tone at or below the anchor, so when the anchor is a chord tone, it becomes the bass exactly {cite src="packages/tonal/tonleiter.mjs#L148-L169"}. A whole bass line can be the anchor pattern, one note per bar. Here is a stepwise descending bass under C, G/B, Am, Am/G, F, C/E, Dm7, G7. Am/G is written as Am7, because G is not in an A minor triad. It is the seventh of Am7, and the anchor puts it in the bass:

:::play{label="C, G/B, Am, Am/G, F, C/E, Dm7, G7 over a bass falling from C4 to D3"}
chord("<C G Am Am7 F C Dm7 G7>")
  .anchor("<c4 b3 a3 g3 f3 e3 d3 g3>")
  .mode("above")
  .voicing()
  .s("triangle")
:::

:::abc
X:1
M:4/4
L:1/4
K:C
V:1
[Gce]4 | [DGBd]4 | [CEAc]4 | [CEGA]4 | [CFA]4 | [G,CEG]4 | [F,A,CF]4 | [DFGB]4 |
V:2 clef=bass
C4 | B,4 | A,4 | G,4 | F,4 | E,4 | D,4 | G,4 |
w: 5/3 6/3 5/3 4/2 5/3 6/3 7 7
:::

The bass descends by step, C4 B3 A3 G3 F3 E3 D3, then leaps to G3 for the dominant. The soprano mostly falls too, E5 D5 C5 A4 A4 G4 F4, then rises to B4, the leading tone. You specified only the bass. The upper voices follow from each voicing, chosen with no memory of the chord before.

**A foreign bass needs a part of its own.** No chord type in the dictionary is "F major over G", so build it the way an arranger scores it: voice the upper chord with `voicing`, and play the bass as a separate line under it with `stack`. To keep the bass at the bottom, push the upper chord up with `mode("above")` and an anchor above the bass. Here the anchor is C4, so every upper chord starts at or just below C4:

:::play{label="F/G resolving to C: the bass is its own line"}
stack(
  chord("<F C>").anchor("c4").mode("above").voicing().s("triangle"),
  note("<g3 c3>").s("sawtooth").lpf(600),
)
:::

Bar 1 is G3 under C4 F4 A4 C5 F5. Bar 2 is C3 under C4 G4 C5 E5. F/G is a favourite pop dominant. It has G, the root of V, in the bass, plus F, its seventh, and C, a fourth above the bass that has not resolved to the third. It has no leading tone, so it pulls toward C more softly than G7. Compare it with G7sus, which has the same bass, seventh and fourth:

:::compare{diff="F/G → G7sus"}
a:
  label: F/G, G3 under C4 F4 A4 C5 F5
  code: |
    stack(
      chord("F").anchor("c4").mode("above").voicing().s("triangle"),
      note("g3").s("sawtooth").lpf(600),
    )
b:
  label: G7sus, G3 D4 F4 G4 C5
  code: chord("G7sus").voicing().s("triangle")
:::

Both have G at the bottom with C and F above it. The difference is one pitch class: F/G has A, the dominant's ninth, where G7sus has D, its fifth. With A instead of D, the upper notes of F/G form a complete F major triad, the IV chord, floating over the dominant's root. That consonant triad on top is why F/G sounds softer than G7sus.

**A pedal point** is the same technique with the bass held still. Keep one bass note, and let the chords above it change:

:::play{label="A tonic pedal: C, F/C, G/C, C over a C3 bass struck every bar"}
stack(
  chord("<C F G C>").anchor("c4").mode("above").voicing().s("triangle"),
  note("c3").s("sawtooth").lpf(600),
)
:::

`note("c3")` is one C3 per bar, so the pedal is re-struck at every bar line rather than held. The upper chords are C4 G4 C5 E5, C4 F4 A4 C5 F5, B3 D4 G4 B4 D5 and C4 G4 C5 E5. In bar 2, F/C is an inversion slash after all: C is a chord tone of F, and with the anchor on C4 the F chord's own voicing starts on C4. In bar 3, G/C is a true foreign bass. Its B3 sits a major seventh (11 semitones) above the pedal C3, and that clash is the point of a pedal.

The same trick gives the **sus2** chord that has no symbol. Gsus is G C D, the same pitch classes as a C sus2. Put C3 under it as its own part, and you have a C sus2 with C in the bass: C3 under G3 C4 D4 G4.

:::play{label="C sus2 as Gsus over a separate C3 bass"}
stack(
  chord("Gsus").anchor("c4").mode("above").voicing().s("triangle"),
  note("c3").s("sawtooth").lpf(600),
)
:::

:::bridge{title="The bass as its own voice"}
A pedal point is the tonic held in the organ pedals under the final bars of a fugue, or a long low note in the tuba part while the harmony moves above it. You breathe and phrase that note as a line of its own, not as the bottom of each chord. A slash chord with a foreign bass asks for the same thinking: one part plays the bass, and another realises the chord above it.
:::
