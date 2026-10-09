---
id: chip.fast-arps.lesson
title: "Fast arpeggios: a whole chord on one channel"
skill: chip.fast-arps
---

A console channel plays one note at a time, yet chiptune is full of chords. The trick is speed. If one channel cycles through a chord's notes fast enough, the ear stops following the individual notes and hears a single, shimmering chord with a buzzing texture. Game composers often stepped such arpeggios once per video frame, 60 notes per second on a 60 Hz television, or every second frame. This lesson builds that sound and contrasts it with a broken chord slow enough to hear as a melody.

**`arp` on a chord.** Earlier in the course `arp` played a broken chord: you give it a pattern of positions in the chord, 0 for the lowest written note, 1 for the next, and it plays one note per position {cite doc=arp}. It works on stacked notes, and on the chords that `voicing` makes. The speed lives in the position pattern: `"[0 1 2]*4"` plays the three positions four times per bar, twelve notes in all.

:::play{label="C major then A minor, arpeggiated 0 1 2 four times per bar"}
note("<[c4,e4,g4] [a3,c4,e4]>").arp("[0 1 2]*4").s("pulse").gain(0.5)
:::

**Where the notes fuse.** At 150 BPM a bar lasts 1.6 seconds (four beats at 0.4 seconds each). Count notes per second for different speeds of the same four-note arpeggio:

| position pattern | notes per bar | notes per second at 150 BPM | heard as |
|---|---|---|---|
| `"[0 1 2 3]*2"` | 8 | 5 | a broken-chord melody (eighth notes) |
| `"[0 1 2 3]*4"` | 16 | 10 | a fast figure, still separate notes |
| `"[0 1 2 3]*12"` | 48 | 30 | one buzzing, shimmering chord |

Somewhere around 15 to 20 notes per second the individual pitches stop being heard as events and fuse into a texture; the exact point depends on the listener and on the interval sizes ([Auditory scene analysis](https://en.wikipedia.org/wiki/Auditory_scene_analysis)). The table's first and last rows are on either side of it:

:::compare{diff="arp: \"[0 1 2 3]*2\" → \"[0 1 2 3]*12\""}
a:
  label: 5 notes per second, a melody
  code: |
    setcpm(150 / 4)
    note("<[a3,c4,e4,a4] [f3,a3,c4,f4]>").arp("[0 1 2 3]*2").s("pulse").gain(0.5)
b:
  label: 30 notes per second, one chord
  code: |
    setcpm(150 / 4)
    note("<[a3,c4,e4,a4] [f3,a3,c4,f4]>").arp("[0 1 2 3]*12").s("pulse").gain(0.5)
:::

**Keep the speed in the arp pattern, not on the line.** `"[0 1 2]*8"` is mini-notation for the pattern `"0 1 2"` played 8 times as fast, so `arp("0 1 2".fast(8))` does exactly the same {cite doc=fast}. But `.fast(8)` at the end of the whole line is different: it speeds up *everything*, including the `< >` that changes chords once per bar.

:::compare{diff="fast inside arp → fast on the whole line"}
a:
  label: arp("0 1 2".fast(8)), chords change once per bar
  code: note("<[c4,e4,g4] [a3,c4,e4]>").arp("0 1 2".fast(8)).s("pulse").gain(0.5)
b:
  label: arp("0 1 2").fast(8), chords change eight times per bar
  code: note("<[c4,e4,g4] [a3,c4,e4]>").arp("0 1 2").fast(8).s("pulse").gain(0.5)
:::

In the second version the chord changes after every run of three notes, every eighth of a bar: C, Am, C, Am… The harmony has become part of the arpeggio.

**Chord symbols as arpeggios.** Because `voicing` produces stacked notes, you can write the harmony as symbols and still play it on one channel. With the default settings, `chord("<Am F G Am>").voicing()` gives Am as A3 C4 E4 A4 C5, F as F3 C4 F4 A4 C5, and G as G3 D4 G4 B4 (Am and F also have a fifth voice, C5, on top, which positions 0 to 3 skip):

:::play{label="Aeolian loop as a frame-fast arpeggio on one pulse channel, positions 0 1 2 3"}
setcpm(150 / 4)
chord("<Am F G Am>").voicing().arp("[0 1 2 3]*12").s("pulse").pw(0.5).gain(0.45)
:::

Choosing positions is voicing. `"[0 1 2]"` keeps the low, close part of the chord; `"[1 2 3]"` drops the bass note so the triangle can carry it; `"[0 2 1 3]"` changes the order, which at frame speed changes the texture more than the harmony.

:::bridge{title="Implied polyphony, sped up"}
Bach's preludes for solo cello and solo violin give one-line instruments whole progressions by breaking every chord into a figure, and the listener hears the harmony and even separate voices in a single line. The chip arpeggio is the same idea taken past the point where the figure is still a melody: like a pianist's unmeasured tremolo in a reduction of orchestral strings, the notes are no longer counted, only heard together.
:::
