# Verified Strudel API Reference for M3

Every function, method, parameter, and sound name listed below has been verified against the pinned repository (`tools/strudel-ref/doc.json` and `tools/strudel-ref/sounds.json`) and headlessly evaluated in Node.

---

## 1. Advanced Harmony & Voicing (Unit U5)

### `voicing()`
Turns chord symbols into voiced pitch collections.
- **Source:** `packages/tonal/voicings.mjs#L175`
- **Method Signature:** `pattern.voicing()` or `voicing(options)`
- **Controls & Parameters:**
  - `chord`: Chord symbol (e.g. `"C"`, `"Am"`, `"G7"`, `"C^7"`, `"Dm7"`, `"Csus"`, `"Cadd9"`).
  - `dict`: Voicing dictionary. Default is `'ireal'` (4–5 note jazz/pop voicings).
  - `anchor`: Reference pitch used to align the voicing (default is `"C5"`).
  - `mode`: Alignment strategy relative to anchor:
    - `"below"`: top note <= anchor (default)
    - `"duck"`: top note <= anchor, anchor note excluded (avoids doubling a melody note on the anchor)
    - `"above"`: bottom note >= anchor
    - `"root"`: root-position voicing
  - `offset`: Integer that shifts the voicing up or down to the next inversion/position in the dictionary list.
  - `n`: If set, plays the voicing as an arpeggiated line/scale rather than a block chord.
- **CRITICAL Chord Spelling Rules for `ireal` dictionary:**
  - **Major 7th:** Write `C^7` or `CM7` (**NOT** `Cmaj7`; `Cmaj7` produces silence and logs unknown chord).
  - **Suspended 4th:** Write `Csus` (**NOT** `Csus4`).
  - **7th Suspended 4th:** Write `C7sus`.
  - **Add 9:** Write `Cadd9`.
  - **Minor 7th:** Write `Cm7`, `Dm7`, `Am7`, `Gm7`.
  - **Dominant 7th:** Write `C7`, `G7`, `D7`.
  - **Sus 2:** No working symbol in `ireal`. Teach as the sus4 a fifth up (`Gsus`), or spell notes explicitly: `note("[c4,d4,g4]")`.
  - **Slash Chords:** Slash chords (`/`) **CANNOT** be written inside `chord("...")` because `/` is mini-notation slow. Teach as:
    1. Inversion slash (bass is a chord tone): `anchor` on the bass note with `mode("above")`.
    2. Foreign bass (pedal point / slash): stack a separate bass line: `stack(chord("<F>").voicing().s("triangle"), note("<g3>").s("sawtooth"))`.
- **Primary Examples:**
  ```js
  // Block chords with anchor control
  chord("<C^7 Am7 Dm7 G7>").voicing().s("sawtooth").lpf(1200)

  // Arpeggiate voicing degrees across the chord
  n("0 1 2 3").chord("<C Am F G>").voicing().s("triangle")
  ```

---

## 2. Arithmetic on Control Patterns & Transforms (Unit U6)

### Arithmetic Rules (Crucial Gotcha!)
- `.add(7)` directly on a control pattern (after `note(...)` or `n(...)` or `.s(...)`) is a **no-op that logs a warning**.
- **Working forms for transposition & canons:**
  - Wrap the operand in `note(...)`: `x.add(note(7))` (7 semitones) or `x.transpose(7)`.
  - On scale degrees before `.scale(...)`: `x.add(n(4))` or `n("0 2".off(1 / 8, (x) => x.add(4))).scale("C4:major")`.
  - For microtonal drift: `.add(note(sine.range(-0.15, 0.15).slow(2)))` **after** `.scale(...)` or on voiced chords.

### Speed & Direction
- **`fast(factor)`**: Speeds up pattern by factor (same as `*` in mini-notation).
- **`slow(factor)`**: Slows down pattern by factor (same as `/` in mini-notation).
- **`rev()`**: Reverses events within each cycle.
- **`palindrome()`**: Plays pattern forward on even cycles, reversed on odd cycles.

### Canons & Layering
- **`off(time, func)`**: Superimposes the transformed pattern delayed by `time` cycles (e.g. `1 / 8` = eighth note).
  ```js
  // Canon at the octave, delayed by 1/8 cycle:
  note("c3 e3 g3 a3").off(1 / 8, (x) => x.add(note(12))).s("triangle")
  // Or in scale degrees:
  n("0 2 4 5".off(1 / 8, (x) => x.add(7))).scale("C4:major").s("triangle")
  ```
- **`superimpose(func)`**: Layers transformed copy without delay:
  ```js
  note("c3 e3 g3 b3").superimpose((x) => x.add(note(12))).s("sawtooth")
  ```

### Conditional Transforms & Rhythmic Structure
- **`every(n, func)`**: Applies `func` on the **first** cycle of each group of `n` cycles (0, n, 2n...).
- **`lastOf(n, func)`**: Applies `func` on the **last** cycle of each group of `n` cycles (phrase-ending fills!).
- **`when(binaryPattern, func)`**: Applies `func` when binary pattern is active (e.g. `"1 0 0 1"`).
  *(Note: `while` is NOT in doc.json; use `when`).*
- **`ply(n)`**: Repeats each event `n` times within its step length.
- **`struct(pattern)`**: Imposes rhythmic structure (hits/rests, e.g. `"x ~ x x ~ x ~ x"`).
- **`invert()`**: Flips a binary rhythm pattern (swaps 1s and 0s in mini-notation rhythm masks).
- **`jux(func)`**: Stereo split: original in left channel, `func(original)` in right channel.

### Melodic Inversion Idiom (Risk K3)
- Strudel's `invert` flips binary rhythm masks, **not** pitch.
- **Idiomatic Melodic Inversion:**
  - Negating scale degrees: `n("0 2 4 7".mul(-1)).scale("C4:major")` (mirrors degrees around degree 0).
  - Reflecting around axis degree $a$: `.mul(-1).add(2 * a)`.
  - Always keep the C3 floor in mind when inverting downward!

---

## 3. Layering, Buses & Effects (Unit U7)

### Buses & Output Context
- **`orbit(busNumber)`**: Global parameter context/bus (`0`, `1`, `2`...).
  - Patterns sharing the same orbit share one delay and one reverb.
  - Set send amounts per event (`delay`, `room`); the effect configuration (`delaysync`, `roomsize`) belongs to the orbit.
- **`pan(value)`**: Stereo position from `0` (hard left) to `1` (hard right), with `0.5` center.
- **`gain(value)`**: Linear amplitude multiplier (default is **0.8**; halving ≈ −6 dB).
- **`postgain(value)`**: Gain applied after orbit effects.
- **`$:` labels vs `stack`**: Multi-part layout with `$:` or `stack(...)`.

---

## 4. Detune & Wobble (Unit U8)

### Multi-Oscillator & Detune
- **`s("supersaw")`**: Stack of 5 voices (default) with built-in stereo spread.
- **`detune(semitones)`**: Total detune spread across all voices in **semitones** (default is `0.18` = 18 cents total spread, ±9 cents).
  - `detune(0.1)` = subtle micro-detune / chorus shimmer.
  - `detune(0.5)` = audibly sour / detuned.
  - *(Note: `detune` only works on `supersaw`. On `"sawtooth"`, detune does nothing; use `superimpose` with `add(note(0.1))` or `jux` instead).*
- **Continuous Pitch Wobble / Vibrato:**
  - Built-in vibrato: `vib(Hz).vibmod(semitones)`.
  - Continuous tape drift: `.add(note(sine.range(-0.15, 0.15).slow(4)))` or `perlin` after the pitch is defined.

---

## 5. Song Form & Arrangement (Unit U12)

### Structure Functions
- **`arrange([duration, pattern], [duration, pattern], ...)`**:
  Chains sections sequentially over specified cycle counts and loops the entire sequence.
  - *Syntax:*
    ```js
    arrange(
      [2, note("c4 e4")],
      [2, note("g4 b4")],
    ).s("sawtooth")
    ```
  - *Or with full patterns:*
    ```js
    arrange(
      [4, s("bd(3,8)").bank("RolandTR909")],
      [4, s("bd*4, [~ cp]*2").bank("RolandTR909")],
    )
    ```
- **`seqPLoop([start, end, pattern], ...)`**:
  Arranges patterns over explicit cycle windows `[start, end, pattern]`, allowing overlapping sections or staggered entries. The loop period is the maximum `end` cycle.
  - *Syntax:*
    ```js
    seqPLoop(
      [0, 2, s("bd*2")],
      [1, 3, s("hh*2")],
    )
    ```
- **Naming and Synonyms Warning:**
  - Always use `.s(...)` — **NEVER** `.sound(...)` (`sound` is a synonym in `doc.json` and fails Gate L2).
  - Use `$: name:` or standalone `$:` statements when defining independent concurrent parts.
