---
id: pit.extended-chords.lesson
title: Sevenths, sus and add9 chord symbols
skill: pit.extended-chords
---

Pop and jazz lead sheets add a few chord colours to the triads and the dominant seventh you have written so far. Most are chords you know from figured bass under new names. Two are pop colours with no strict classical counterpart. Here is each one, with the symbol Strudel's default voicing dictionary accepts, spelled on C:

| Chord | In classical terms | Write | Tones |
|---|---|---|---|
| major seventh | a major triad with a major 7th, the 7 on I or IV | C^7 | C E G B |
| minor seventh | a minor triad with a minor 7th, like ii7 | Cm7 | C Eb G Bb |
| dominant seventh | V7 | C7 | C E G Bb |
| suspended fourth | the 4 of a 4–3 suspension, with no 3 at all | Csus | C F G |
| seventh with suspended fourth | V7 with the 4 in place of the 3 | C7sus | C F G Bb |
| added ninth | a triad plus the 9th, with no 7th | Cadd9 | C E G D |

Two of these spellings are Strudel's, not the ones you see on most lead sheets {cite src="packages/tonal/ireal.mjs#L48-L51"} {cite src="packages/tonal/ireal.mjs#L62-L62"} {cite src="packages/tonal/voicings.mjs#L224-L243"}:

- The **major seventh** is written with a caret, C^7, which stands for the small triangle (△) many lead sheets print. A capital M also works: CM7. The common printed form "maj7" does **not**: Cmaj7 is not in the dictionary, so `voicing` plays nothing for that bar and logs "unknown chord" {cite src="packages/tonal/voicings.mjs#L209-L212"}.
- The **suspended fourth** is just "sus": Csus. Csus4 is also unknown and plays nothing.

The ii, V and I of a major key, with sevenths, then vi7:

:::play{label="ii7, V7, Imaj7, vi7 in C major: Dm7, G7, C^7, Am7"}
chord("<Dm7 G7 C^7 Am7>").voicing().s("triangle")
:::

`voicing` plays F3 C4 D4 F4 C5, then G3 D4 F4 G4 B4, then C3 E4 G4 B4, then A3 C4 E4 G4 C5. The Dm7 has its third, F3, in the bass. That is a ii6/5, the pre-dominant of a chorale cadence, with its seventh, C5, on top. The C^7 shows a habit of this dictionary: the root sits alone at the bottom, C3, more than an octave below the rest of the chord, the way a pianist's left hand plays a single bass note under a right-hand chord. The voicings are taken from the iReal Pro app's piano voicings, and they are jazz-piano spacings, not SATB spacings {cite src="packages/tonal/ireal.mjs#L1-L4"}. That lone root can fall below this course's C3 floor: with the default anchor, the major sevenths on A, B flat and B put their roots at A2, B flat 2 and B2. Raise the anchor for those chords. On B flat, an anchor of D5 gives F3 B♭3 D4 A4 D5.

The dominant seventh and the major seventh differ in one note: the seventh is a minor seventh (10 semitones above the root) in C7 and a major seventh (11 semitones) in C^7. Here both are in root position on C3, with the same `anchor` and `mode`:

:::compare{diff="C7 → C^7"}
a:
  label: C7, C3 G3 B♭3 C4 E4
  code: chord("C7").anchor("c3").mode("root").voicing().s("triangle")
b:
  label: C^7, C3 G3 B3 E4 G4
  code: chord("C^7").anchor("c3").mode("root").voicing().s("triangle")
:::

The two voicings also double different notes, because each chord type has its own list of hand positions. Listen to the third note from the bottom. B flat 3 is a dominant's seventh: it leans down toward A, the third of F major. B3 is the major seventh, a semitone under the octave. In a Baroque piece it would have to resolve, but pop lets it stand as a colour.

**Sus chords.** Csus is C F G: the fourth replaces the third. In classical terms it is the 4 of a 4–3 suspension that never resolves to its 3. With no third, the chord is neither major nor minor, and it sounds open and unsettled. A pop arranger can let it hang, or resolve it late, as here. The 4 of Gsus, C5, is held over into G7sus, and only in bar 3 does it fall to the leading tone, B4:

:::play{label="Gsus, G7sus, G7, C: a 4–3 suspension held for two bars"}
chord("<Gsus G7sus G7 C>").voicing().s("triangle")
:::

The four chords are G3 C4 D4 G4 C5, G3 D4 F4 G4 C5, G3 D4 F4 G4 B4 and E3 C4 E4 G4 C5. The soprano is C5, C5, B4, C5: the fourth held for two bars, its resolution to the leading tone, then the tonic.

**Sus2** is the other suspended chord: the second replaces the third, so a C sus2 is C D G. Strudel has **no reliable symbol** for it: Csus2 is not in the default dictionary, so, like Cmaj7, it plays nothing. Instead, use one of two equivalents:

- Spell it as a chord in mini-notation: `note("[c4,d4,g4]")`.
- Note that C D G are the same pitch classes as Gsus, G C D: a sus2 is a sus4 a fifth higher, re-voiced. Play Gsus and put C in the bass as a separate part. The lesson on slash chords shows how.

:::play{label="C sus2 then C major, spelled by hand: the 2 rises to the 3"}
note("<[c4,d4,g4] [c4,e4,g4]>").s("triangle")
:::

**Add9.** Cadd9 is C E G D: a major triad with the 9th added and no 7th. It is not a 9–8 suspension, because the 9th stays and the octave is still there. The default voicing for Cadd9 keeps C4 and puts D4 right above it, so the colour is a whole-tone rub (2 semitones) in the middle of the chord:

:::compare{diff="C → Cadd9"}
a:
  label: C, E3 C4 E4 G4 C5
  code: chord("C").voicing().s("triangle")
b:
  label: Cadd9, E3 C4 D4 G4 C5
  code: chord("Cadd9").voicing().s("triangle")
:::

Only one note changes, E4 to D4. The third is still there, in the bass (E3), so the chord stays major. That is the difference from a sus chord, which removes the third.

:::bridge{title="Figured bass already names most of these"}
A Baroque continuo player would read C^7 in root position as the figure 7 over C with a major 7th, and a G7sus as the 7 and 4 figures over G, waiting for the 3. The jazz symbols name the same sonorities from the root up instead of from the bass up. What is new is the treatment. A Baroque seventh or suspension must be prepared and resolved. In pop, the major seventh, the sus and the add9 are colours that can stand on their own, start a phrase, or end a song.
:::
