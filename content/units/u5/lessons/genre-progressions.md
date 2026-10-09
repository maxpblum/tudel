---
id: pit.genre-progressions.lesson
title: Four-chord loops of 80s pop
skill: pit.genre-progressions
---

Much 80s synth-pop, and a great deal of pop since, is built on a **loop**: four chords, one per bar, repeated for a whole verse or chorus while the melody and the arrangement change around them. A few loops cover a large share of songs. This lesson writes the common ones as chord symbols and shows how they are related.

**I–V–vi–IV.** In C major this is C, G, Am, F. Here it is with a pulsing bass, the typical synth-pop accompaniment:

:::play{label="I–V–vi–IV in C major at 112 BPM, with an eighth-note bass on the roots"}
setcpm(112 / 4)
stack(
  chord("<C G Am F>").voicing().s("sawtooth").lpf(1600).gain(0.5),
  note("<c3*8 g3*8 a3*8 f3*8>").s("sawtooth").lpf(500),
)
:::

Read the bass line in two steps. `< >` plays one of its steps per cycle, and in this course a cycle is one bar of 4/4, so the bass changes root once per bar. Inside each step, `c3*8` plays C3 eight times in the time of one step, which is the whole bar, so the bass plays eight eighth notes. `setcpm(112 / 4)` sets 28 cycles per minute. In this course's convention a cycle is one bar of four beats, so 28 bars per minute is 28 × 4 = 112 beats per minute.

**Rotating the loop.** Start the same four chords from the third one and you get **vi–IV–I–V**: Am, F, C, G. The chords and their voicings are the same, but the loop now starts and ends on a different chord:

:::compare{diff="start on C → start on Am"}
a:
  label: I–V–vi–IV, C G Am F
  code: chord("<C G Am F>").voicing().s("triangle")
b:
  label: vi–IV–I–V, Am F C G
  code: chord("<Am F C G>").voicing().s("triangle")
:::

:::diagram
digraph loop {
  rankdir=LR;
  node [shape=circle, fontname="Helvetica", width=0.9, fixedsize=true];
  C [label="C\nI"];
  G [label="G\nV"];
  Am [label="Am\nvi"];
  F [label="F\nIV"];
  C -> G -> Am -> F -> C;
  node [shape=box, fixedsize=false, style=dashed];
  s1 [label="I–V–vi–IV\nstarts here"];
  s2 [label="vi–IV–I–V\nstarts here"];
  s1 -> C [style=dashed];
  s2 -> Am [style=dashed];
}
:::

Starting on Am makes A minor a candidate for the tonic. Heard as **A minor**, Am F C G is i–VI–III–VII. Pop analysts usually write it **i–♭VI–♭III–♭VII**, because they number every key's chords against the major scale on the same tonic: in A major, the sixth degree is F sharp, so a chord on F natural is "flat six". Classical analysis of a minor key would write VI, III and VII without the flats, because it numbers the chords against the minor scale itself. Both describe the same chords. Whether this loop is "vi–IV–I–V in C" or "i–♭VI–♭III–♭VII in A minor" is not in the code. The symbols are identical. The ear decides, from where the melody comes to rest and which chord the phrase treats as home.

**The Aeolian vamp, i–♭VII–♭VI–♭VII.** Aeolian is the natural minor, with no raised leading tone. A loop that stays inside it swings between the tonic and the two major chords below it, and never reaches a major V:

:::play{label="i–♭VII–♭VI–♭VII in A minor: Am, G, F, G over an eighth-note bass"}
setcpm(112 / 4)
stack(
  chord("<Am G F G>").voicing().s("sawtooth").lpf(1600).gain(0.5),
  note("<a3*8 g3*8 f3*8 g3*8>").s("sawtooth").lpf(500),
)
:::

The upper voices are A3 C4 E4 A4 C5, G3 D4 G4 B4, F3 C4 F4 A4 C5, G3 D4 G4 B4. The G chord brings B and D, but never G sharp, so nothing pulls back to A as a leading tone would. The loop circles round the tonic instead of cadencing on it, which is why it can run for minutes.

**Colouring a loop.** Synth-pop often colours a loop. Swap in the chords from the lesson on sevenths, sus and add9, and the same vi–IV–I–V gets a softer, more open sound:

:::compare{diff="triads → sevenths, add9 and sus"}
a:
  label: Am F C G
  code: chord("<Am F C G>").voicing().s("triangle")
b:
  label: Am7 F^7 Cadd9 Gsus
  code: chord("<Am7 F^7 Cadd9 Gsus>").voicing().s("triangle")
:::

The coloured version is A3 C4 E4 G4 C5, F3 C4 E4 A4 C5, E3 C4 D4 G4 C5, G3 C4 D4 G4 C5. The top note is C5 in all four bars: a held note in the soprano, what harmony textbooks call an inverted pedal. The colour tones sit in the inner voices: G4, the seventh of Am7; E4, the seventh of F^7; D4, the ninth of Cadd9; and C4, the fourth of Gsus.

:::bridge{title="Ground bass and the four-chord loop"}
A loop is a ground bass. Purcell's grounds, the chaconne and the passacaglia repeat a short bass and its harmony while the upper parts vary, and a pop song does the same with four bars. The ancestry is direct: Pachelbel's Canon in D runs I–V–vi–iii–IV–I–IV–V, and its first three chords are the first three of I–V–vi–IV.
:::
