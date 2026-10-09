---
id: spop.hooks.lesson
title: "Modal hooks: the riff over the loop"
skill: spop.hooks
---

A **hook** is the short phrase you remember after one listen. In synth-pop it is often not the vocal but a synth riff: one or two bars, played on a bright, plucky sound, repeated over the chord loop between and under the vocal lines. What makes it memorable is a strong rhythm, a narrow range, and a **modal colour**: the scale it draws its notes from.

**Write the hook in scale degrees.** With `n` and `scale`, the notes are positions in a scale (0 is the tonic, 1 the next step, and so on) and the scale name decides which pitches they are {cite doc=scale}. The rhythm and contour live in the `n` string. Here is a one-bar hook in eighth notes, in A natural minor (Aeolian):

:::play{label="A hook in A minor: E5 rest F5 E5 C5 rest A4 C5"}
setcpm(120 / 4)
n("4 ~ 5 4 2 ~ 0 2")
  .scale("A4:minor")
  .s("square")
  .decay(0.2)
  .sustain(0.3)
  .lpf(3000)
  .gain(0.5)
:::

:::abc
X:1
M:4/4
L:1/8
K:Am
e z f e c z A c |
:::

**Change the mode, keep the hook.** Degree 5 is the sixth note of the scale. In Aeolian it is F, a minor sixth above A; in **Dorian** it is F sharp, a major sixth. Swap `"A4:minor"` for `"A4:dorian"` and that one note changes: the hook goes from dark to bittersweet, the colour of much 80s synth-pop. Nothing else needs to move:

:::compare{diff="scale A4:minor → A4:dorian"}
a:
  label: Aeolian, F natural
  code: n("4 ~ 5 4 2 ~ 0 2").scale("A4:minor").s("square").decay(0.2).sustain(0.3)
b:
  label: Dorian, F sharp
  code: n("4 ~ 5 4 2 ~ 0 2").scale("A4:dorian").s("square").decay(0.2).sustain(0.3)
:::

Each mode has its own typical loop, because the mode decides which chords are diatonic. Natural minor gives A minor, F, C, G (i, VI, III, VII). Dorian's raised sixth makes the IV chord major: the two-chord vamp A minor to D major is the Dorian sound. **Mixolydian** (a major scale with a lowered seventh) gives G, F, C (I, bVII, IV): bright, but without a leading tone, so it never quite closes.

| Mode | Characteristic note (on A) | Typical loop |
|---|---|---|
| Aeolian (`minor`) | F natural, G natural | Am F C G |
| Dorian (`dorian`) | F sharp | Am D |
| Mixolydian (`mixolydian`, on G) | F natural over G major | G F C G |

**A riff over changing chords.** A hook repeated over a four-chord loop doesn't change, but its meaning does. Over the A minor loop, the hook's E5 is the fifth of A minor, the major seventh of F, the third of C and the sixth of G. This is why a repeated riff stays interesting for a whole song: the loop reharmonises it every bar.

:::play{label="The Aeolian hook over Am F C G"}
setcpm(120 / 4)
$: n("4 ~ 5 4 2 ~ 0 2")
  .scale("A4:minor")
  .s("square")
  .decay(0.2)
  .sustain(0.3)
  .lpf(3000)
  .gain(0.5)
$: chord("<Am F C G>")
  .voicing()
  .s("sawtooth")
  .attack(0.3)
  .release(0.8)
  .vowel("a")
  .gain(0.35)
:::

**Vary the end of the phrase.** Four identical bars become wallpaper. A common move is to answer in bar 4: change the riff on the last bar of each four-bar phrase. `lastOf(4, f)` applies `f` on the last of every four cycles, so on bars 4, 8, 12 and so on in this course's one-bar cycles {cite doc=lastOf}. Do the arithmetic on the degree string itself, before `n`: `x.add(2)` moves every note up two scale steps, and `x.rev()` plays the bar backwards {cite doc=add} {cite doc=rev}:

:::play{label="Bars 1 to 3 the hook, bar 4 the hook two steps higher"}
setcpm(120 / 4)
n("4 ~ 5 4 2 ~ 0 2".lastOf(4, (x) => x.add(2)))
  .scale("A4:dorian")
  .s("square")
  .decay(0.2)
  .sustain(0.3)
  .lpf(3000)
  .gain(0.5)
:::

In bar 4 the hook rises a third (in scale steps), to G5 rest A5 G5 E5 rest C5 E5. The rhythm stays, so it is heard as the same hook, answered.

:::bridge{title="One tune, many harmonisations"}
A hymn arranger keeps the melody and changes the harmony under it from verse to verse, and in the last verse adds a descant. A synth-pop hook works the same way in miniature: the riff stays, the loop reharmonises it every bar, and `lastOf` is the end-of-phrase variation, the small change that makes the repeat feel like a new statement.
:::
