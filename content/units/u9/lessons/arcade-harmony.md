---
id: chip.arcade-harmony.lesson
title: "Arcade progressions: bVI-bVII-I and the semitone lift"
skill: chip.arcade-harmony
---

Game music of the 8-bit era leaned on a small stock of progressions that loop well and sound heroic, adventurous or ominous within a few bars. Most of them come from two sources you already know: the natural minor (Aeolian) mode, and chords borrowed from the parallel minor (modal mixture). This lesson collects three of them and the arcade's favourite way of raising the stakes: moving the whole loop up a semitone.

Roman numerals with a flat (bVI, bVII) mean "built on the lowered sixth or seventh degree": in C major, bVI is Ab and bVII is Bb.

**1. The Aeolian loop: i-bVI-bVII-i.** In A minor that is Am, F, G, Am. It never uses the leading tone (G sharp), so there is no dominant pull: the loop circles rather than resolves, which is why it can repeat for minutes behind a level without tiring. G to Am is a whole-step rise from bVII to i, the "modal" cadence of rock and folk.

:::play{label="i bVI bVII i in A minor: Am, F, G, Am, voiced on a 50 % pulse"}
chord("<Am F G Am>").voicing().s("pulse").pw(0).gain(0.35)
:::

**2. The victory cadence: bVI-bVII-I.** In C major: Ab, Bb, C. Both Ab and Bb are borrowed from C minor, and the bass climbs by whole steps, Ab to Bb to C, into the major tonic. After the dark borrowed chords the major tonic arrives like a fanfare; this is the sound of a level cleared or a flag reached. Game-music writers often call it the "Mario cadence" after the game series that made it famous; rock uses it too, as a rising whole-step approach to the tonic that skips the dominant entirely.

:::play{label="bVI bVII I in C: Ab, Bb, C, held for the last two bars"}
chord("<Ab Bb C C>").voicing().s("pulse").pw(0).gain(0.35)
:::

The top two voices move Ab4-C5, then F4-Bb4, then G4-C5 (voiced by `voicing` against its default anchor, C5 {cite src="packages/tonal/voicings.mjs#L196-L215"}). For a monophonic channel you would play these chords as arpeggios, the subject of a later lesson.

**3. The Mixolydian shout: I-bVII-IV-I.** In C: C, Bb, F, C. The bVII is the only chord outside the key, and it gives a bright, open, "riding off to adventure" colour without any minor chord in sight.

:::play{label="I bVII IV I in C: C, Bb, F, C"}
chord("<C Bb F C>").voicing().s("pulse").pw(0).gain(0.35)
:::

**The semitone lift.** When a game wants more urgency, on a final lap, a boss's second phase or the last repeat of a title theme, it often plays the same loop again a semitone higher. Pop arrangers call this the "truck driver's modulation": no preparation, just a jolt upward ([Truck driver's gear change](https://en.wikipedia.org/wiki/Truck_driver%27s_gear_change)).

In Strudel, put the whole loop in one `stack` and add `transpose` at the end, with one value per bar: `transpose("<0 0 0 0 1 1 1 1>")` plays bars 1 to 4 as written and bars 5 to 8 a semitone up {cite doc=transpose}. `transpose` works on note names, including the notes `voicing` produces, and moves them in whole semitones. Within `< >`, `!` repeats a step, so `"<0!4 1!4>"` is the same pattern, shorter.

:::play{label="Aeolian loop with bass, then the same loop a semitone higher (B flat minor) for bars 5 to 8"}
setcpm(150 / 4)
stack(
  chord("<Am F G Am>").voicing().s("pulse").pw(0).gain(0.3),
  note("<a3 f3 g3 a3>").ply(8).s("triangle").gain(0.9),
).transpose("<0!4 1!4>")
:::

In bars 5 to 8 the chords are Bbm, Gb, Ab, Bbm. Strudel spells the raised notes with flats (F becomes Gb), because `transpose` chooses its own spelling. Remember the C3 floor when you lift a bass line *down* instead: a bass on C3 can't go lower.

:::bridge{title="The same move in an anthem"}
A choir hears the semitone lift in the last verse of many hymn arrangements, where the organ shifts up a step for the final stanza and everyone's register rises with it. The harmony doesn't change at all; only the key does. The listener feels new energy because every pitch, and the singers' effort, has gone up.
:::
