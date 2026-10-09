---
id: pit.modal-mixture.lesson
title: Modal mixture, chords borrowed from the parallel minor
skill: pit.modal-mixture
---

**Modal mixture** (or *borrowing*) means using, in a major key, chords that belong to the **parallel minor**: the minor key on the same tonic. C major borrows from C minor. C natural minor is C D E♭ F G A♭ B♭, so its chords bring three lowered degrees into C major: E♭ (the flat third), A♭ (the flat sixth) and B♭ (the flat seventh). The four borrowed chords pop music uses most are these:

| Numeral | Chord in C | Borrowed tone | Typical use |
|---|---|---|---|
| iv | Fm | A♭, the flat sixth | the minor plagal cadence, iv–I |
| ♭VI | Ab | A♭ and E♭ | ♭VI–♭VII–I, a rising, heroic cadence |
| ♭VII | Bb | B♭, the flat seventh | ♭VII–I, a cadence with no leading tone |
| ♭III | Eb | E♭ and B♭ | a bright major chord a minor third above the tonic |

The flat sign in ♭VI is part of the numeral, not of the chord. It means "built on the lowered sixth degree" of the major key. The chord itself is major: ♭VI in C is A flat major, written Ab. As a symbol, a flat is a lowercase b after the letter: Ab, Bb, Eb {cite src="packages/tonal/tonleiter.mjs#L22-L29"}. `voicing` treats these symbols like any other, and names the black keys as flats in its output {cite src="packages/tonal/tonleiter.mjs#L74-L78"} {cite src="packages/tonal/tonleiter.mjs#L170-L170"}.

**The minor iv.** The plainest borrowing changes one note. Play IV–I, then iv–I, on the same voicing settings:

:::compare{diff="F → Fm"}
a:
  label: IV–I, F then C
  code: chord("<F C>").voicing().s("triangle")
b:
  label: iv–I, Fm then C
  code: chord("<Fm C>").voicing().s("triangle")
:::

F is F3 C4 F4 A4 C5, and Fm is F3 C4 F4 A♭4 C5. Only the fourth voice from the bottom changes, A4 to A♭4. In the C chord that follows, that voice is G4. So A♭ falls a semitone to G: the flat sixth sinks onto the fifth, the same sighing ♭6–5 you know from the bass of a minor-key lament.

Put the two side by side, IV then iv, and the same voice becomes a chromatic line, A4, A♭4, G4:

:::play{label="I, IV, iv, I in C major: the inner voice slides A4, A♭4, G4"}
chord("<C F Fm C>").voicing().s("triangle")
:::

:::abc
X:1
M:4/4
L:1/4
K:C
V:1
[CEGc]4 | [CFAc]4 | [CF_Ac]4 | [CEGc]4 |
V:2 clef=bass
E,4 | F,4 | F,4 | E,4 |
:::

**♭VI–♭VII–I.** Two borrowed major chords, rising by whole tones to the tonic, make a cadence with no dominant at all. Use `mode("root")` with a C4 anchor so that every chord stands on its root, and the bass climbs A♭3, B♭3, C4:

:::play{label="I, ♭VI, ♭VII, I in C major: C, Ab, Bb, C, all in root position"}
chord("<C Ab Bb C>").anchor("c4").mode("root").voicing().s("triangle")
:::

The chords are C4 G4 C5 E5, A♭3 E♭4 A♭4 C5, B♭3 F4 B♭4 D5 and C4 G4 C5 E5. The top voice goes E5, C5, D5, E5. B♭ major has no B natural, so nothing leads up to C by a semitone. The arrival comes from the bass rising by whole tones and the bright major chords, not from a leading tone. Film scores and arena rock often use this cadence for a triumphant ending.

**The Picardy third** is the same idea the other way round: a piece in a minor key borrows the major tonic from the parallel major for its last chord. Change only the last symbol:

:::play{label="i, iv, V, I in C minor: Cm, Fm, G, then C major at the end"}
chord("<Cm Fm G C>").voicing().s("triangle")
:::

The minor tonic is G3 C4 E♭4 G4 C5. The final C major is E3 C4 E4 G4 C5: its third, E4, is the raised E♭4 of bar 1.

:::bridge{title="Major and minor on the same tonic"}
You already know mixture from the Romantic repertoire. Schubert turns a phrase from major to minor on the same tonic and back, and Brahms colours a major key with the minor subdominant. The minor plagal iv–I has the same falling A♭ to G as the Fm to C above. The Picardy third ends many minor-key chorale harmonisations by Bach. In pop, ♭VI and ♭VII are borrowed as freely as iv. They come from the same parallel minor, and they let a song in a major key sound darker without changing key.
:::
