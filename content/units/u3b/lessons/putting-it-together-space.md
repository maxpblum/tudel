---
id: snd.putting-it-together-space.lesson
title: "Putting it together: FM synthesis, noise and space"
skill: snd.putting-it-together-space
---

Electronic music gains realism and dimensionality through depth. A mix where every instrument is dry and centered sounds flat; a mix where everything is drenched in reverb sounds muddy. The solution is **acoustic contrast**: placing instruments at distinct depths in your virtual room {cite doc=room} {cite doc=delay}.

## Contrast in timbre and space

Combine dry rhythmic foundations with spatial melodic textures:

- **The dry anchor (kick and bass):** keep `room(0)` and `delay(0)` on the low end. Low frequencies in reverb create a wash of acoustic mud that obscures the tempo.
- **The spatial melody (FM pluck):** use FM synthesis (`fmi` and `fmh`) to create metallic, bell-like harmonics, then send them to a synced rhythmic delay (`delay(0.35).delaysync(3 / 16)`).
- **The atmospheric wash (noise & pads):** bathe airy white noise and chords in a wide space (`room(0.5).roomsize(4)`).

:::play{label="A 3D space: dry bass and drums, rhythmic FM delay, and ambient reverb"}
setcpm(116 / 4)
stack(
  s("bd*2, ~ sd").bank("RolandTR808"),
  note("<c3 bb3 a3 f3>").ply(2).s("sawtooth").gain(0.7),
  note("<[c4 e4] [g4 bb4]>")
    .s("sine")
    .fmi(3)
    .fmh(2)
    .decay(0.15)
    .sustain(0)
    .delay(0.35)
    .delaysync(3 / 16)
    .room(0.3)
    .gain(0.5),
)
:::

Notice the separation: the kick and sawtooth bass are crisp and immediate in the foreground, while the shimmering FM bell echoes a dotted eighth note later in a warm room.

:::bridge{title="Foreground and background in the orchestra"}
In an orchestral hall, the timpani and double basses sit directly on the stage floor, punchy and defined. Meanwhile, the harp and glockenspiel carry high, bright overtones that bounce off the hall's distant back wall. Reverb and delay recreate that natural architectural depth.
:::
