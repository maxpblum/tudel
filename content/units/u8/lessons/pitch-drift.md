---
id: det.pitch-drift.lesson
title: "Drift and vibrato: slow wander, fast waver"
skill: det.pitch-drift
---

Pitch can move in two quite different ways while you play:

- **Drift** is slow and has no regular beat: the tuning wanders over several bars. A record on a slightly warped turntable does it, and so do old tape machines and analog synths whose oscillators slide as they warm up. Tape engineers call the slow kind of pitch waver *wow*.
- **Vibrato** is fast and regular: the pitch swings up and down several times a second, inside every held note, as in a singer's tone or a trombonist's lip vibrato.

Strudel builds them differently, and the difference matters.

**Drift: add a slowly moving offset to the note.** A signal from earlier lessons, such as `sine` or `perlin`, can supply the offset. To shift a pitch, the offset must itself be a note value, in semitones, so wrap the signal in `note(...)` and add it {cite doc=add}:

:::play{label="Drift of ±15 cents, one slow swing every 4 bars"}
note("c4 eb4 g4 bb4")
  .add(note(sine.range(-0.15, 0.15).slow(4)))
  .s("sawtooth")
  .lpf(1500)
:::

`sine.range(-0.15, 0.15)` runs between −0.15 and +0.15 semitones, that is ±15 cents, and `.slow(4)` makes one full swing last four bars (four cycles; one cycle is one bar in this course).

:::signal
shape: sine
min: -0.15
max: 0.15
period: 4
cycles: 8
label: "sine.range(-0.15, 0.15).slow(4): the offset in semitones, one swing per 4 bars"
:::

Strudel adds `note` to `note`, so c4 (MIDI note number 60) becomes 60.15 at the top of the swing, a fractional MIDI number that plays 15 cents sharp {cite src="packages/superdough/util.mjs#L32-L34"}. Use `perlin` instead of `sine` for drift with no repeating period, as a real warped record has.

**The trap: adding a bare number does nothing.** `note("c4").add(sine.range(-0.15, 0.15))` looks right but plays plain c4. After `note(...)` each event is a set of named controls (note, s, and so on), and a bare number has no name to add to. Strudel prints the warning "Can't do arithmetic on control pattern" and returns the note unchanged {cite src="packages/core/value.mjs#L10-L18"}. Wrapped as `note(...)`, the offset has the name `note`, and the values with matching names are added {cite src="packages/core/pattern.mjs#L1007-L1018"} {cite src="packages/core/value.mjs#L16-L17"}.

**Drift moves between notes, never inside one.** Each note reads the signal once, at its onset {cite src="packages/core/signal.mjs#L18-L21"}, and its oscillator's frequency is set once from that value {cite src="packages/superdough/synth.mjs#L530-L531"}. So a held note stays on one pitch, and the drift is heard as the next note arriving a little higher or lower. Short notes show the drift in finer steps. This comparison uses a wider swing, ±30 cents, so you can hear it clearly:

:::compare{diff="note c4 (whole notes) → c4*8 (eighths)"}
a:
  label: Whole notes, each one steady at its own pitch
  code: |
    note("c4")
      .add(note(sine.range(-0.3, 0.3).slow(4)))
      .s("triangle")
b:
  label: Eighth notes, the drift heard in small steps
  code: |
    note("c4*8")
      .add(note(sine.range(-0.3, 0.3).slow(4)))
      .s("triangle")
:::

The whole notes read the sine on the four downbeats only, so bars 1 to 4 play c4 in tune, 30 cents sharp, in tune, and 30 cents flat. The eighth notes read it eight times per bar and creep up and down between those points.

**Vibrato: a wobble inside the note.** `vib` sets the vibrato rate in hertz (swings per second) {cite doc=vib}, and `vibmod` sets its depth in semitones {cite doc=vibmod}. Strudel attaches a sine-wave oscillator at that rate to the note's tuning, scaled to `vibmod` × 100 cents, so the pitch swings up and down by `vibmod` semitones around the note {cite src="packages/superdough/helpers.mjs#L346-L364"}. With only `vib` set, the depth is 0.5 semitones (±50 cents), a wide operatic wobble. `vibmod` alone does nothing. The vibrato starts at full depth at the note's onset {cite src="packages/superdough/helpers.mjs#L349-L361"}. It works on the basic waveforms and on `"supersaw"` alike {cite src="packages/superdough/synth.mjs#L533-L533"} {cite src="packages/superdough/synth.mjs#L189-L189"}.

At the default tempo of 120 BPM a bar lasts 2 seconds, so `vib(5)` swings 10 times per bar:

:::signal
shape: sine
min: -0.2
max: 0.2
period: 0.1
cycles: 1
label: "vib(5).vibmod(0.2) at 120 BPM: ±0.2 semitones, 10 swings per bar, inside each note"
:::

:::compare{diff="add(note(sine…)) → vib(5).vibmod(0.2)"}
a:
  label: Drift, a slow sine read once per note
  code: |
    note("a4@3 e4")
      .add(note(sine.range(-0.2, 0.2).slow(3)))
      .s("triangle")
b:
  label: Vibrato, 5 Hz ±20 cents inside each note
  code: note("a4@3 e4").s("triangle").vib(5).vibmod(0.2)
:::

In one sentence: drift (`add(note(signal))`) picks a new pitch for each note from a slow curve, and vibrato (`vib` and `vibmod`) makes the pitch swing continuously inside every note. Neither is `detune`: `detune` splits one note into several voices at fixed offsets that sound together, while drift and vibrato move a pitch over time. They combine: a slow drift plus a light vibrato is the tape-worn lead sound of the next lessons.

:::bridge{title="A singer's vibrato and a warped record"}
A singer's vibrato is regular, a few swings per second, and it belongs to the voice: it is there on every sustained note. A warped record is slower and sounds wrong, not expressive: the whole performance sags and recovers over seconds. `vib` is the singer and `add(note(perlin...))` is the record. One difference from the singer: Strudel's vibrato is at full depth from the very first instant. A singer usually starts a long note straight and lets the vibrato bloom, which Strudel's `vib` cannot do on its own.
:::
