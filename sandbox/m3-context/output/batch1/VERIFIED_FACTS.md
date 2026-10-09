# Batch 1: verified facts (overrides STRUDEL_API_M3.md where they differ)

Checked on 2026-10-09 against the pinned clone (`tools/strudel-ref/.cache/strudel`, commit f610965) and `doc.json`, and by evaluating snippets with `packages/verify/scripts/run.mjs eval`. Several examples in `STRUDEL_API_M3.md` are **wrong**. Where they disagree, use this file.

Repo root: `/home/blampo/Projects/tudel`. Pinned source: `tools/strudel-ref/.cache/strudel/packages/...`. Cite as `{cite src="packages/tonal/tonleiter.mjs#L139-L179"}` (paths relative to the clone root). Open the lines before you cite them.

## Gates you can trip without noticing
- L1: Strudel must **log nothing**. An unknown chord symbol logs `[voicing]: unknown chord` and fails. Every snippet must make ≥1 event, and no note may go below C3 (MIDI 48).
- L2/L8a: every called name, and every bare name in backticks in prose, must be a doc.json name. **Not in doc.json: `dict`, `while`, `sound`.** Present (verified): voicing chord anchor mode offset fast slow rev palindrome off superimpose every firstOf lastOf when ply struct mask jux juxBy iter inside orbit pan gain postgain velocity stack add sub mul div transpose scaleTranspose scale n note segment range rangex sine cosine saw tri square perlin rand detune unison spread vib vibmod chorus room roomsize delay delaysync delayfeedback duckorbit duckdepth run arp layer echo early late invert.
- L7: Prettier (printWidth 80, double quotes, no semicolons, trailing commas), leading zeros (`0.5`), primary names only (`delaysync`, not `delaytime`; `s`, not `sound`).
- Lessons: no ``` fences. Use `:::code` / `:::play`. Copy directive syntax from the real lessons in `content/units/u2/lessons/*.md` and `content/units/u4/lessons/*.md`.

## Arithmetic on control patterns (affects U6, U8 and every `add` in a callback)
- `.add(7)` on a **control pattern** (anything after `note(...)`, `n(...)` or `.s(...)`) is a **no-op that logs `[warn]: Can't do arithmetic on control pattern.`** (`core/value.mjs#L10-L18`), so it also fails L1. `note("c3 e3").off(1 / 8, (x) => x.add(7))` plays the copy unchanged, and `note("c3").add(sine.range(...))` doesn't drift. The sandbox examples that do this are wrong.
- Working forms (all evaluated):
  - Wrap the operand in the control: `x.add(note(7))` (7 semitones), `x.add(n(4))` (4 scale degrees, before `.scale`), `.add(note(sine.range(-0.15, 0.15).slow(2)))` (fractional semitones: note 51.15 etc.).
  - Or do the arithmetic on the bare string pattern inside the control: `n("0 2".off(1 / 8, (x) => x.add(4))).scale("C4:major")`. This is the course's established idiom (`n("0 1 2 3".add("0,-2"))`).
  - `x.transpose(7)` works on note names (whole semitones only; it rounds fractions).
- Arithmetic on `n` *before* `.scale` uses scale degrees and rounds fractional degrees. So for microtonal drift, add `note(...)` **after** `.scale(...)`: `n("0 2").scale("C4:minor").add(note(sine.range(-0.15, 0.15).slow(2)))` works.
- `chord(...).voicing().add(note(perlin.range(-0.1, 0.1)))` works: every voice drifts together.

## Melodic inversion (U6, Risk K3)
- `invert` (synonym `inv`) **does exist in doc.json**, but it "swaps 1s and 0s in a binary pattern" (rhythm masks for `struct`). It is not a melodic inversion. Say this explicitly. Never call it on a melody.
- Verified idiom: reflection about degree 0 is multiplication by −1. `n("0 2 4 7").mul(n(-1)).scale("C4:major")` → C4 A3 F3 C3. Equivalently `n("0 2 4 7".mul(-1))`. To reflect about axis degree a: `"…".mul(-1).add(2a)`, e.g. axis 2 (E): `n("0 2 4 7".mul(-1).add(4))`. This is a diatonic (tonal) inversion: the steps mirror in degrees, not semitones, as in tonal counterpoint. A chromatic (real) inversion would do the same with `note` numbers in semitones.
- Watch the C3 floor: reflect downward from C4 only within an octave, or put the axis higher.

## Chord symbols (U5): what `voicing`'s default dictionary (ireal) accepts
Keys from `packages/tonal/ireal.mjs`, with aliases added in `packages/tonal/voicings.mjs#L224-L244` (`-`→`m`, `^`→`M`, `+`→`aug`). Default dict = `'ireal'` (`voicings.mjs#L83`).

| Want | Write | Plays? | tonal tones (for glossary) |
|---|---|---|---|
| major 7th | `C^7` or `CM7` (**not** `Cmaj7`) | yes (`Cmaj7` = unknown chord, L1 fail) | C E G B |
| minor 7th | `Dm7` (or `D-7`) | yes | D F A C |
| dominant 7th | `G7` | yes | G B D F |
| half-dim | `Bh7` / `Bm7b5` | yes | B D F A |
| sus4 | `Csus` (**not** `Csus4`) | yes, voicings 1-4-5-8 | C F G |
| 7sus4 | `C7sus` | yes | C F G Bb |
| add9 | `Cadd9` | yes | C E G D |
| sus2 | **no working symbol.** `C2` plays 1-5-8-9 (no third), but tonal reads `C2` as add9 (C E G D), so the glossary would contradict the sound. Don't use `C2` or `Csus2` in code. Teach sus2 as: same pitch classes as the sus4 a fifth up (Csus2 = C D G = Gsus4 G C D), or spell it with `note("[c4,d4,g4]")`. |
| 6, m6, 69, ^9, m9, 9, 9sus | `C6`, `Cm6`, `C69`, `C^9`, `Cm9`, `C9`, `C9sus` | yes | check tonal |
- `Cmaj7`, `Csus4`, `Csus2` → silence plus a log line. Tell the learner that `maj7` is spelled `^7` (the lead-sheet triangle) or `M7` here.
- **Slash chords cannot be written in `chord("…")`**: `/` is mini-notation's "slow" operator, so `chord("C/E")` throws `ERROR: Invalid argument`. Even the tokenizer that parses a slash bass (`tonleiter.mjs#L22-L29`) discards it: `renderVoicing` uses only root and symbol (`tonleiter.mjs#L139-L144`). So teach slash chords as:
  1. **Inversion slash (C/E, bass is a chord tone):** `mode("above")` plus `anchor` on the bass note (see the existing lesson `content/units/u2/lessons/register-inversion.md`, which says mode above *rounds down*: the bottom note is the closest chord tone at or below the anchor).
  2. **Foreign bass (F/G, D/C):** `stack(chord("<F>").voicing()…, note("<g3>")…)`, or `$:` parts: the upper structure is voiced and the bass is a separate line. In prose the learner sees the symbol "F/G". In code it's two parts.
- Glossary (`output/batch1/glossary/chord-symbols.yaml`): same format as `content/glossary/chord-symbols.yaml` (`entries: [{symbol, tones, name, skills}]`). Don't repeat existing symbols: C Dm Em F G Am Bo Bdim D E Gm Bb G7 C7 D7 (check the file for the full list). `tones` = tonal's spelling (for example `Cadd9: [C, E, G, D]`, `Csus: [C, F, G]`). Only symbols that are actually used. No slash symbols.
- `voicing` controls: `anchor` (default C5), `mode` below (default) / duck / above / root, `offset` (integer; steps to the next voicing in the dictionary list, wrapping and shifting an octave: `tonleiter.mjs#L163-L169`), `n` (play voicing as a scale: arpeggio). `duck` = like below, but drops any voice that equals the anchor exactly (`tonleiter.mjs#L172-L174`), so the melody note on the anchor can sit above the chord without doubling. **`voicing` has no memory of the previous chord.** Smooth top lines come from a fixed anchor (each chord's top note is the nearest chord tone ≤ anchor), not from voice-leading logic.
- Default anchor C5 + mode below: C^7 → C3 E4 G4 B4. Csus → C4 F4 G4 C5. Cadd9 → C4 D4 G4 C5 (…; eval to see all voices). The ireal dict often puts the root alone low (C3) with the upper structure in octave 4. Check the bass against the C3 floor whenever the anchor goes below C5: a root at or below B2 fails L1.

## Pattern transforms (U6)
- `every(n, f)` is an alias for `firstOf`: it applies f on cycles 0, n, 2n… (the **first** bar of each group), not the last. `lastOf(n, f)` applies it on the last bar of each group, which fits a phrase-ending fill (4-bar phrase → `lastOf(4, …)`). Both are in doc.json.
- `when(binaryPat, f)` is in doc.json. `while` is NOT.
- `palindrome` = rev every other cycle (fwd, back, fwd…), not "pattern then its reverse inside one cycle".
- `off(time, f)`: time in cycles (1 / 8 = an eighth note in this course's 4/4 bar). The delayed copy wraps: its tail from the previous cycle shows at time 0.
- `ply(n)` repeats each event n times inside its own slot. `fast(n)` squeezes the whole cycle n times. Contrast them on the same input (STYLE tip 5).
- `jux(f)`: original panned hard left, f(original) hard right.
- `struct("x ~ x x")` imposes rhythm. `invert` flips a binary rhythm (`"1 0 0 1".invert()` style, used inside `struct`).

## Buses (U7)
- `orbit(n)`: "global parameter context". Patterns on the same orbit share **one** delay and **one** reverb (`superdough.mjs#L925-L955`, `superdoughoutput.mjs` class `Orbit` from L19). Default orbit is 1 (`superdough.mjs#L195`). Consequence: two parts on the same orbit with different `delaysync`/`roomsize` fight (the effect is rebuilt or reset by whichever event comes last). Give parts with different space settings their own orbit. Parts that should sit in the same room share one. `delay`/`room` amounts are per-event **sends**; the time/size settings belong to the orbit's shared effect.
- `pan` 0 = left, 0.5 = centre, 1 = right. Pan can be a signal.
- `gain` is a linear amplitude multiplier (default **0.8**, `superdough.mjs#L182`; halving ≈ −6 dB). `postgain` is applied after effects.
- `duckorbit(n)` (sidechain-like ducking of another orbit) exists but is a Batch 2 (synthwave) topic. At most mention it.
- `$:` lines = independent parts (the course already uses them). `stack` = one pattern with shared methods after it.

## Detune & wobble (U8)
- `s("supersaw")` (`packages/superdough/synth.mjs#L153-L200`): `unison` voices (default **5**), `detune` = **total spread in semitones** between the lowest and highest voice, voices evenly spaced (default **0.18** = 18 cents total, ±9 cents; `worklets.mjs#L38-L49`, `#L551-L556`), `spread` = stereo pan spread 0–1 (default 0.6). Gain is scaled by 1/√voices.
  - So `detune(0.1)` = ±5 cents: shimmer or chorus (micro-detune heard as timbre, like a choir section where no two voices are perfectly in tune). `detune(0.5)` = ±25 cents: audibly sour, "out of tune". `detune(12)` would spread the voices over an octave.
- **Gotcha:** if `detune` is unset, supersaw uses the `n` value as detune (`detune = detune ?? n ?? 0.18`, `synth.mjs#L158`). `n(...).scale(...)` is fine (scale turns n into note), but bare `n("0 1 2").s("supersaw")` changes the detune instead of the pitch. Always use `note` or `n`+`scale`, and set `detune` explicitly.
- `detune` only affects supporting oscillators (supersaw). On `"sawtooth"` it does nothing. To thicken a plain sawtooth, layer copies: `superimpose((x) => x.add(note(0.1)))` (+10 cents) plus pan, or `jux`.
- Vibrato: `vib(Hz)` and `vibmod(semitones, default 0.5)` (`superdough/helpers.mjs#L346-L364`: gain = vibmod × 100 cents). This works on all synths. The doc.json entries live under supradough, but the names are valid, and superdough implements them in helpers.mjs.
- Slow drift (tape wobble): `.add(note(sine.range(-0.15, 0.15).slow(4)))` or `perlin.range(...)` after the pitch is fixed. Notes sample the signal **at onset**, so a held note doesn't bend. Short notes or `segment` show the drift. Continuous in-note wobble = `vib`/`vibmod`.
- `chorus` exists in doc.json. Check its description and source before teaching it (optional).
- *Stranger Things* aesthetic: arpeggiated, detuned analog synths in minor (Kyle Dixon & Michael Stein's style). **Never** reproduce the theme's melody or arpeggio. Write original material.
