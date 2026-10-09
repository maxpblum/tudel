---
id: zen.loop-layering.lesson
title: "Staggered entrances with seqPLoop"
skill: zen.loop-layering
---

`arrange` plays sections one at a time: when one starts, the previous one stops. Many builds don't work like that. In a fugal exposition the voices enter one by one and each keeps going after the next arrives; in an electronic intro the drums start, the bass joins four bars later, then the pad, then the lead. The parts **overlap**. For that, `seqPLoop` gives each part a window of its own: the cycle it starts on and the cycle it stops on {cite doc=seqPLoop}.

## One window per part

Each entry is `[start, end, pattern]`, with start and end in cycles, which in this course means bar lines counted from 0. `[0, 4, drums]` plays the drums from the first bar line to the fourth, that is, in bars 1 to 4. `[2, 4, bass]` brings the bass in at the start of bar 3. The windows may overlap, and the loop repeats when the last entry ends.

:::play{label="A 4-bar build: drums from bar 1, bass from bar 2, chords from bar 3"}
setcpm(100 / 4)
const drums = s("bd*4, ~ sd ~ sd").bank("RolandTR909")
const bass = note("<a3 f3 c3 g3>").ply(8).s("sawtooth").lpf(700).gain(0.6)
const chords = chord("<Am F C G>").voicing().s("triangle").gain(0.5)
seqPLoop([0, 4, drums], [1, 4, bass], [2, 4, chords])
:::

Laid out bar by bar, the code above is this cue sheet:

| Part | Bar 1 | Bar 2 | Bar 3 | Bar 4 |
|---|---|---|---|---|
| drums `[0, 4]` | ■ | ■ | ■ | ■ |
| bass `[1, 4]` | | ■ | ■ | ■ |
| chords `[2, 4]` | | | ■ | ■ |

:::bridge{title="Entrances in a fugue, the conductor's cue sheet"}
In the exposition of a fugue, the subject enters in one voice, then the answer in a second voice while the first carries on with the countersubject, then a third. A conductor marks those entrances on a cue sheet: which section comes in at which bar. `seqPLoop` is that sheet, written as code: one row per part, its entrance and its exit, all visible in one place.
:::

## The window follows the song's bar count

Notice the bass in bar 2 above. Its `< >` has four roots, A3 F3 C3 G3, and yet it enters on **F3**, not A3. A `seqPLoop` window doesn't restart the part: the part has been "playing" silently all along, and the window only opens and closes the sound, much like an orchestral player who has been counting rests and comes in wherever the music has got to. Strudel builds `seqPLoop` by stacking all the windows and reading each part at the song's own time {cite src="packages/core/pattern.mjs#L1486-L1501"}.

`arrange` does the opposite, as the previous lesson showed: each section starts from its own first step. Same parts, same entry bar, different first note:

:::compare{diff="seqPLoop window → arrange section, for a part entering in bar 3"}
a:
  label: seqPLoop, the part enters on its third step, G4
  code: seqPLoop([0, 2, note("c4")], [2, 4, note("<e4 f4 g4 a4>")]).s("sine")
b:
  label: arrange, the part enters on its first step, E4
  code: arrange([2, note("c4")], [2, note("<e4 f4 g4 a4>")]).s("sine")
:::

In one sentence: **`arrange` turns to a section's first page when the section begins; `seqPLoop` opens a window on a part that has been running since bar 1.** So in a `seqPLoop`, let a part with a 4-bar `< >` enter at bar 1, 5, 9 and so on (start 0, 4, 8…), and it will begin on its first chord. In the example above, the bass enters mid-loop on purpose: its bar 2 root, F3, fits the chord progression, because the bass and the chords share one clock and so agree on which chord is current.

## The last entry sets the loop

The loop's length is not the largest end you write. It is the **end of the last entry in the list** {cite src="packages/core/pattern.mjs#L1486-L1501"}. Write the entries in any order and an earlier, longer window can vanish:

:::code
const pad = chord("<Am F C G>").voicing().s("triangle")
const lead = note("e5 d5 c5 b4").s("square")
seqPLoop([0, 8, pad], [2, 4, lead])
:::

This loop is 4 bars long, not 8, and the pad's window from 0 to 8 doesn't fit inside it, so the pad never plays. The safe habit: **write the entry that ends last at the bottom**, and the loop is as long as you meant. Writing the entries in order of entrance, as a cue sheet does, usually takes care of it.

Always write all three numbers. An entry with only two, `[end, pattern]`, is allowed, but it means "from the previous entry's end up to this end", which is easy to misread as a duration.

## arrange, seqPLoop or mask?

All three decide when music sounds. Choose the one whose shape matches the music's:

- **`arrange`** when the texture changes as a whole, section by section: verse, chorus, verse.
- **`seqPLoop`** when parts enter and leave on their own and overlap: a build, an exposition, a thinning outro.
- **`mask`** when one part drops in or out of an otherwise steady loop, and a single string on that part says so {cite doc=mask}.

They combine. A `seqPLoop` entry can hold a whole `arrange`, and an `arrange` section can hold a `seqPLoop`: the build-up can be the intro section of a larger form.
