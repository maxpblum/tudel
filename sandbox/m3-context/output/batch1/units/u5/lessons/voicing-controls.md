---
id: pit.voicing-controls.lesson
title: Harmonising a melody with anchor, duck and offset
skill: pit.voicing-controls
---

You already steer `voicing` with two controls. The **anchor** is the note it lines each chord up against, and `mode` says which end of the chord meets it: the top note with `mode("below")`, the bass with `mode("above")` {cite doc=anchor} {cite src="packages/tonal/tonleiter.mjs#L131-L137"}. This lesson puts a melody on the anchor, keeps the chords from doubling that melody, and shows how to ask for a different voicing without moving the anchor.

First, one fact that shapes everything else: `voicing` has **no memory**. It voices each chord on its own: it reads the chord symbol and the anchor, picks one voicing from its dictionary, and moves on, without looking at the chord before {cite src="packages/tonal/voicings.mjs#L196-L215"} {cite src="packages/tonal/tonleiter.mjs#L139-L179"}. It never avoids parallel fifths or keeps a common tone on purpose. Any smoothness comes from the anchor. With `mode("below")`, every chord's top note is the closest chord tone at or below the anchor, so a fixed anchor gives a soprano that stays just under it, and an anchor that moves gives a soprano that follows it.

So the anchor can be a tune. Give it one note per bar and, as long as each note is a chord tone, it becomes the top voice of the chord. Here the tune is E5, F5, D5, C5 over C, F, G, C. The `stack` plays the tune on its own as a lead on `"square"`, and plays the chords under it, anchored to the same notes:

:::play{label="A tune on the anchor, also played as a lead: every chord doubles it"}
stack(
  note("<e5 f5 d5 c5>").s("square").lpf(2000).gain(0.4),
  chord("<C F G C>").anchor("<e5 f5 d5 c5>").voicing().s("triangle"),
)
:::

Listen to the top of the chords: it is the tune again, at the same pitch. The chord plays C4 G4 C5 E5 in bar 1, and the lead plays E5 as well. Two parts on one pitch at the same moment is a **unison doubling**: the lead loses its edge, and the chord's top note is wasted.

The fix is a third mode, **duck**. `mode("duck")` chooses the voicing exactly as `mode("below")` does, then drops every voice that lands exactly on the anchor pitch {cite src="packages/tonal/tonleiter.mjs#L172-L174"}. Strudel's own documentation describes `mode` with this case in mind: "Remove anchor note from the voicing. Useful for melody harmonization" {cite doc=mode}. Same input, one word changed:

:::compare{diff="mode below → duck"}
a:
  label: mode("below"), the chord's top note doubles the tune
  code: |
    stack(
      note("<e5 f5 d5 c5>").s("square").lpf(2000).gain(0.4),
      chord("<C F G C>").anchor("<e5 f5 d5 c5>").voicing().s("triangle"),
    )
b:
  label: mode("duck"), the tune's note is taken out of the chord
  code: |
    stack(
      note("<e5 f5 d5 c5>").s("square").lpf(2000).gain(0.4),
      chord("<C F G C>")
        .anchor("<e5 f5 d5 c5>")
        .mode("duck")
        .voicing()
        .s("triangle"),
    )
:::

With duck, the chords are C4 G4 C5, A3 F4 A4 C5, G3 D4 G4 B4 and E3 C4 E4 G4. Each is the `mode("below")` voicing with its top note removed, so the lead now sits alone above the chord:

:::abc
X:1
M:4/4
L:1/4
K:C
V:1
e4 | f4 | d4 | c4 |
V:2
[CGc]4 | [A,FAc]4 | [G,DGB]4 | [E,CEG]4 |
:::

Two edge cases. Duck removes only a voice at **exactly** the anchor's pitch, not every note with that letter name: the C4 under the C5 tune in bar 4 stays. And if a tune note is not a chord tone, nothing in the chord equals it, so nothing is dropped and the chord's top note sits just below the tune. For example, with a D5 in the tune over a C chord, the closest chord tone at or below D5 is C5. The chord is E3 C4 E4 G4 C5, and its top note sits a whole tone (2 semitones) below the tune.

:::bridge{title="Accompanying a singer from a lead sheet"}
When you accompany a soloist from chord symbols, the tune belongs to the soloist. You voice the right hand underneath it, so the melody stands out instead of being doubled in your top finger. `mode("duck")` is that habit: realise the chord below the tune and leave the tune's note to the tune.
:::

The last control is **`offset`**: a second opinion from the dictionary {cite doc=offset}. For each chord type, the default dictionary holds a short list of voicings, ordered roughly by their bass note: root position first, then third, fifth or seventh in the bass {cite src="packages/tonal/ireal.mjs#L49-L51"}. The anchor picks one entry from that list. `offset` then counts along the list from that entry, wrapping round at the end {cite src="packages/tonal/tonleiter.mjs#L163-L169"}:

- `offset(-1)` takes the previous entry. Its top note still sits at or below the anchor, so the chord stays in about the same register with a different spacing.
- Any positive offset, such as `offset(1)`, also moves the result **up an octave**, so the top note lands above the anchor. This is a quirk of the code, not a musical rule: Strudel adds 12 semitones whenever the offset is between 1 and the length of the list, and more for larger offsets.

:::compare{diff="offset 0 → -1"}
a:
  label: No offset, C major is E3 C4 E4 G4 C5
  code: chord("<C F G C>").voicing().s("triangle")
b:
  label: offset(-1), C major is E3 G3 C4 E4 G4
  code: chord("<C F G C>").offset(-1).voicing().s("triangle")
:::

With `offset(-1)` the four chords are E3 G3 C4 E4 G4, F3 C4 F4 A4, D3 G3 B3 D4 G4 and E3 G3 C4 E4 G4. The soprano now runs G4, A4, G4, G4 instead of C5, C5, B4, C5. The G chord moved its fifth, D3, into the bass, because its previous entry wraps round to the end of the list. That is why `offset` is a tool for trying alternatives by ear, not for planning a voicing note by note. For that, set `anchor` and `mode`.

One warning whenever you lower the anchor. Many voicings put a lone root or third far below the rest. With the anchor on G4, the A minor chord comes out as A2 E3 A3 C4 E4, and A2 is below C3, the lowest note this course allows. Read the bass after any anchor change below C5.
