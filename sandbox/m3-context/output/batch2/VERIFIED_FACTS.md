# Batch 2: verified facts (adds to `output/batch1/VERIFIED_FACTS.md`; both override `STRUDEL_API_M3.md`)

Checked on 2026-10-09 against the pinned clone (`tools/strudel-ref/.cache/strudel`) and `doc.json`. Paths below are relative to the clone root. Everything in Batch 1's facts file still applies (arithmetic on control patterns needs `note(...)`, `Cmaj7` is `C^7`, no slash chords in `chord`, C3 floor, `every` = `firstOf`, etc.). Exemplar 4 in `SCHEMA_AND_EXEMPLARS.md` uses `Abmaj7`, which is an unknown chord: don't copy it.

## Names confirmed in doc.json for this batch
pw pwrate pwsweep penv pattack pdecay psustain prelease pcurve panchor crush coarse distort duckorbit duckdepth duckattack duckonset tremolo tremolosync tremolodepth tremoloskew tremolophase tremoloshape vowel arp segment echo swingBy swing struct mask ply lastOf firstOf transpose bank velocity roomfade roomlp compressor phaser.
Not in doc.json: `pulse` (it is a sound name, `s("pulse")`), `duty`, `setcps`, `dict`, `set`, `nudge`, `arpeggiate`.

## Sounds (sounds.json)
- Synths: `"pulse"`, `"square"`, `"triangle"`, `"sawtooth"`, `"sine"`, `"supersaw"`, noises `"white"`, `"pink"`, `"brown"`, `"crackle"`.
- Drum banks: `bank("RolandTR808")` has bd sd hh oh cp cb cr rim lt mt ht perc sh. `bank("RolandTR909")` has bd sd hh oh cp cr rd rim lt mt ht (no cowbell, no shaker).

## Pulse oscillator (`packages/superdough/synth.mjs#L294-L350`, worklet `worklets.mjs#L742-L842`)
- `s("pulse")` is a band-limited pulse. `pw` default **0.5** (`synth.mjs#L312`). The worklet sets the phase offset between two saw generators to `(1 - pw) * π` (`worklets.mjs#L806`, `#L828-L834`), so **duty cycle = (1 − pw) / 2**:
  - `pw(0)` = 50 % (a square, same spectrum as `s("square")`).
  - `pw(0.5)` = 25 % (**the default**: plain `s("pulse")` is already the thinner NES-style 25 % pulse).
  - `pw(0.75)` = 12.5 %, thin and nasal.
  - Negative values mirror (pw −0.5 = 75 %, which sounds the same as 25 %). pw is clamped to ±0.99; pw near 1 approaches silence.
  - A numeric simulation of the worklet confirmed: pw 0 → 50 % high, 0.5 → ~27 %/73 %, 0.75 → ~16 %/84 % (band-limiting rounds the edges).
- PWM: `pwrate` (Hz) and `pwsweep` (depth). Setting only `pwrate` gives `pwsweep` 0.3; setting only `pwsweep` gives `pwrate` 1 Hz (`synth.mjs#L299-L310`). This is the C64/SID "moving" pulse sound.
- Levels: the pulse worklet peaks around 0.2–0.3 (`0.15 * (out0 - out1)`, `worklets.mjs#L832-L835`), and the basic waveforms are turned down to 0.3 (`synth.mjs#L52`), so pulse and square are roughly level. Don't make claims about exact loudness differences; balance by ear with `gain`.
- Pitch envelope and vibrato work on pulse, supersaw and all basic waveforms (`synth.mjs#L336-L337`, `#L533-L536`).

## Pitch envelope (`packages/superdough/helpers.mjs#L326-L344`)
- `penv` in **semitones** (`cents = penv * 100`). Active as soon as any of penv/pattack/pdecay/psustain/prelease is set; penv then defaults to 1.
- With `penv(n).pdecay(t)` and nothing else: attack = 0.001 s, sustain ≈ 0, so `panchor` (defaults to psustain) ≈ 0 and the pitch **starts n semitones above the note and falls to the note in t seconds**. `note("c3").s("triangle").penv(36).pdecay(0.06)` = starts at C6, lands on C3 within 60 ms: a chip kick. Positive penv = drop from above; negative penv = scoop up from below.
- With only `penv` set (no pattack/pdecay), defaults are attack 0.2 s and sustain 1 → panchor 1 → the pitch rises from note − penv to the note over 0.2 s. Always set `pdecay` (or `pattack`) explicitly.
- `pcurve(1)` = exponential curve ("good for kicks", doc.json).
- `s("sbd")` is a built-in synth kick (`synth.mjs#L84-L140`) but it is not needed; teach the triangle pitch-drop.

## Noise (`helpers.mjs#L7`, `synth.mjs#L407-L440`, `noise.mjs`)
- `s("white")` etc. ignore `note`. They use the normal ADSR (default decay 0.05 s, sustain 0.6 if only decay unset…), so set `.decay(x).sustain(0)` for hits.
- White is about 10 dB louder than pink (existing noise lesson). For hats use white with `hpf` 6000–8000 Hz and decay 0.02–0.05 s; for snare white with decay 0.1–0.2 s, optional `bpf`/`lpf`, optionally layered with a short triangle pitch drop for a body.
- NES noise had a "long" (hiss) and a "short, metallic" mode; Strudel has no periodic-noise mode. Approximate metallic hits with a high `pulse` note plus `crush`, or just say it's not available.

## Bitcrush (`worklets.mjs#L193-L257`, `superdough.mjs#L775-L784`)
- `crush(bits)`: quantises amplitude to `2^(bits-1)` steps (crush 4 = 8 steps per polarity). `coarse(n)`: sample-and-hold every n samples (n = 8 at 48 kHz ≈ 6 kHz effective rate). Both optional "8-bit" grit. The NES triangle channel was a 4-bit stepped triangle, so `s("triangle").crush(4)` is a fair imitation.

## Arpeggios
- `note("<[c4,e4,g4] [a3,c4,e4]>").arp("[0 1 2]*4")` evaluated: 12 notes per bar, C4 E4 G4 ×4, then A3 C4 E4 ×4. The chord changes once per bar regardless of arp speed. `*k` inside the arp string is mini-notation for fast(k).
- `n("0 1 2 3").chord("<C Am F G>").voicing()` plays voicing indices, but the ireal voicings are not in close position (C → E3 C4 E4 G4; Bb → D3 Bb3 D4…), so for chip arps prefer explicit stacked notes + `arp`.
- At 120 BPM a bar is 2 s; 48 notes per bar = 24 notes per second, past the ~20 per second where successive notes stop being heard as separate (fusion). 24 per bar = 12/s: heard as a fast trill/arpeggio.

## Arithmetic and repetition (evaluated)
- `note("<c3 ab3>").ply(8).add(note("[0 12]*4"))` → C3 C4 C3 C4… then Ab3 Ab4…: octave-pumping bass. The offset pattern must have as many steps per bar as the bass (`[0 12]*4` for 8 steps, `[0 0 12 0]*4` for 16).
- `note("c4 e4 g4").transpose("<0 1>")` → bar 2 in Db (note names, whole semitones). On `n(...).scale(...)` use `.add(note("<0 0 0 1>"))` after `.scale`.

## Pumping
- `chord("<Am F>").voicing().segment(4).gain(saw.range(0.2, 0.8).fast(4))` gives **every** event gain 0.2: each onset lands exactly where the saw restarts at 0. Use `segment(16)` so each beat gets 4 steps (0.2, 0.35, 0.5, 0.65). Good teaching contrast for "signals need notes to carry them". `saw` rises 0→1; `isaw` falls.
- `tremolosync(k)`: tremolo rate = cps × k, i.e. k cycles of the LFO per bar (`superdough.mjs#L796-L823`). The LFO's phase is computed from the cycle position (`time = cycle / cps`), so it lines up with the bar. Default shape when no `tremoloshape` is given: `tri` with skew 1 = a **rising ramp** 0→1 each period (`worklets.mjs#L72-L80`, `superdough.mjs#L809`), raised to the power 1.5. With default `tremolodepth` 1 the sound is silent at each beat and swells to full by the next one: a sidechain-like pump on a held chord. `tremolodepth(0.5)` keeps a floor (gain = 1 − depth + depth·LFO). So `tremolosync(4)` = one pump per beat in this course's 4/4.
- `duckorbit(n)` on the kick ducks orbit n's whole output each time the kick plays (`superdough.mjs#L511-L513`, `superdoughoutput.mjs#L102-L125`, `#L200-L218`). Gain drops to `1 − √duckdepth` (default depth 1 → 0.01) over `duckonset` (default 0 s), and recovers to 1 over `duckattack` (default 0.1 s, min 0.002). Despite its name, `duckattack` is the **recovery** time (doc.json says so). Multiple orbits: `duckorbit("2:3")`.
  - If the target orbit hasn't played anything yet, superdough logs `duck target orbit N does not exist` and skips (`superdoughoutput.mjs#L209-L211`). Harmless in the browser once the pad starts; mention it so the learner isn't alarmed. The verifier only queries events, so it won't see it.
  - The kick should be on a *different* orbit from the one it ducks (it would duck itself otherwise).

## Reverb / "gated" snare
- `roomsize` = RT60 in seconds (default 2 s); `roomfade` is the impulse's **fade-in** time, not a gate (`reverb.mjs#L28-L44`, `reverbGen.mjs#L30-L44`). Strudel has no noise gate. Teach the 80s gated snare as an *approximation*: a loud send (`room(0.6–0.9)`) into a short reverb (`roomsize(0.3–0.6)`) on the snare's own orbit, so it's "big, then gone". Say clearly that a real gated reverb cuts a long tail abruptly and Strudel only offers a short tail.
- Reverb settings belong to the orbit (Batch 1 facts). Pad hall and snare "gate" must be on different orbits.

## Vowel (`packages/superdough/vowel.mjs#L4-L19`)
- `vowel("a")`, also e i o u ae aa oe ue y uh un en an on. Five formant band-passes per vowel (a: 660, 1120, 2750, 3000, 3350 Hz). Works best on a harmonically rich source (sawtooth chords), which is the choir-pad idiom.

## Genre/historical notes (general knowledge, phrase as such, no citation needed beyond a link if you add one)
- NES (Ricoh 2A03): two pulse channels with duty 12.5/25/50/75 %, a triangle channel (no volume control, usually the bass), a noise channel, and a sample (DPCM) channel. Game Boy: two pulses, a 4-bit wave channel, noise. C64 SID: three voices with variable pulse width (PWM), filter.
- Synth-pop 1980–84: Human League *Dare* (1981, Linn LM-1 drums), Depeche Mode *Speak & Spell* (1981), New Order "Blue Monday" (1983, Oberheim DMX, sequenced 16th bass). Gated reverb: Hugh Padgham and Phil Collins, Peter Gabriel's third album (1980) and "In the Air Tonight" (1981). Never copy a riff, melody or drum pattern note for note; describe the technique.
- Synthwave: late 2000s on, Kavinsky ("Nightcall", 2010), College, the *Drive* soundtrack (2011), Perturbator, The Midnight, FM-84. Tempo typically 80–120 BPM. Same rule: original material only.
