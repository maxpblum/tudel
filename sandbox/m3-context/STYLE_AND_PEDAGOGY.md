# Style & Pedagogy Guidelines for tudel

This document brings together all prose, code, and pedagogical rules enforced in **tudel**.

---

## Part 1: Prose & Pedagogy (`STYLE_TIPS.md`)

The reader is one person: an advanced classical musician (piano, choral singing and conducting, trombone, tuba) who knows Web Audio graphs but is new to synthesis jargon and to Strudel. Write so that **every sentence leaves them with less confusion than before.**

### 1. Make Demos Easy to Hear
- Melodic and timbre demos sit around **C3–C6**. Sines and soft sounds below C3 are inaudible on laptop speakers.
- **Gate L1 Floor:** Any pitched note below **C3 (MIDI 48)** fails `pnpm verify`. Write bass lines at C3 or above!
- A comparison should make the difference obvious on first listen.

### 2. Use Only Words the Reader Already Has
- **Name it first, then explain it.** Lead with the musical or physical idea, then give the Strudel name, then engineering terms: "voice leading aligned to a reference pitch (`anchor`), using closest inversion". Never let an unexplained symbol or bare code token lead a sentence.
- **No insider shorthand.** No unit ids (`U5`), file names, or course-internal labels in prose. Say "later lessons cover the rest."
- If an acoustic term is abstract, say what it sounds like **and** show what it looks like.

### 3. Concrete Simplifications
- Narrow the scope honestly ("for now..."), never blur it. State what the lesson's example does concretely.
- A simplified statement must still be true and not invite confusing follow-ups.

### 4. Show Every Step of an Inference
- Don't jump to conclusions that depend on unstated facts.
- **Separate Strudel facts from course conventions.** Strudel has cycles; it has no concept of "bars". "1 cycle = 1 bar in 4/4" is *this course's* convention (`time-conventions.md`).

### 5. Contrast Look-Alikes Side by Side
- When two features look or sound alike (e.g. `fast` vs `ply`, `off` vs `superimpose`, `dict` vs `voicing`), contrast them on the same input and state the difference in one sentence.

### 6. Always Write Units and Conditions
- Every number needs its unit: Hz, dB, seconds, cycles, bars, semitones, cents.
- Boundary conditions matter: state what happens at the edges.

### 7. Draw What You Describe
- Use custom directives (`:::diagram`, `:::filter`, `:::signal`, `:::envelope`, `:::compare`, `:::play`) whenever a shape, structure, or comparison is explained.

### 8. Classical Bridges (R-PEDAGOGY)
- **Primary sources for analogies:**
  - Choral singing and choir (vowels, formants, blend, consonant attacks, SATB voice leading).
  - Brass playing (trombone slide, tuba breath support, mutes, embouchure, partials, overtone series).
  - Piano (hammer strike, soundboard decay, damper resonance, chord voicing).
  - Conducting & orchestration (score layout, terraced dynamics, hairpins, orchestral balance, doubling).
  - Figured bass and counterpoint (inversions, voice independence, canon, imitation).
- Avoid specialist mechanics from instruments the learner does not play.

### QA Prose Checklist (Mandatory Self-Check)
1. Can this demo be heard clearly on laptop speakers?
2. Is every term defined before use?
3. Does any simplification invite an obvious "but what about..."?
4. Does any step skip an inference?
5. Are look-alikes contrasted side by side?
6. Does every number have units?
7. Is every described shape drawn?
8. Does every analogy come from the learner's musical background?

---

## Part 2: Strudel House Style (`docs/house-style.md`)

Gate **L7** enforces formatting and syntax rules on every snippet and reference solution.

### Formatting Rules [L7]
- Code must match Prettier formatting:
  ```json
  { "parser": "babel", "semi": false, "singleQuote": false, "printWidth": 80, "trailingComma": "all" }
  ```
- **NO single-quoted strings [L7].**
  - In Strudel, double quotes `"..."` and backticks `` `...` `` trigger mini-notation parsing. Single quotes `'...'` are plain JavaScript strings.
  - Prettier transforms `'...'` to `"..."`, altering syntax.
  - **Always use double quotes `"` or backticks for strings in Strudel code.**
- One statement per line. Put `setcpm(...)` first if the tempo matters.
- Numbers must have a leading zero: `0.5`, never `.5` [L7].

### Naming Rules [L7]
- **Always use the primary name from `doc.json`, never a synonym:**
  - `s` (not `sound`)
  - `lpf` (not `cutoff` or `lp`)
  - `lpq` (not `resonance`)
  - `hpf` (not `hp`)
  - `attack` (not `att`)
  - `fmi` (not `fm`)
  - `delaysync` (not `delaytime`)
- Full sound names: `"sawtooth"`, `"square"`, `"triangle"`, `"sine"`, `"supersaw"`.
  - Signal functions are identifiers: `sine`, `saw`, `tri`, `square`, `perlin`.

### Structure & Method Order
- **Signal chain order for readability:**
  `note(...)` or `n(...)` or `chord(...)` → `.s(...)` → amp envelope (`attack`, `decay`, `sustain`, `release`) → filters (`lpf`, `hpf`) → effects / buses (`orbit`, `room`, `delay`) → `.gain(...)`.
  *(Note: Method call order does not alter Superdough's audio graph, but adhering to this order makes code immediately readable).*
- Multi-part code: Use `$:` labels or `stack(...)`.

---

## Part 3: Time Conventions (`docs/time-conventions.md`)

| Term | Course Convention |
|---|---|
| **Bar** | 1 cycle (assuming 4/4 time). |
| **Beat** | ¼ cycle. |
| **Tempo** | `setcpm(BPM / 4)` sets BPM in 4/4 (e.g. `setcpm(120 / 4)` = 120 BPM). Default without `setcpm` is 120 BPM. |
| **Phrase** | 4 bars = 4 cycles. |
| **Section** | 8 or 16 bars. |

---

## Part 4: Key Strudel Idioms (`docs/strudel-idioms.md`)

1. **Say what, then with what:** `note("c3 eb3 g3").s("sawtooth")`.
2. **A parameter can be a pattern:** `.lpf("<400 800 1200>")` or `.s("<sawtooth square>")`.
3. **Terraced steps with `<>`, smooth sweeps with signals:** `"<a b c d>"` steps once per bar; `sine.range(lo, hi).slow(4)` sweeps continuously over 4 bars.
4. **Signals need notes to carry them:** Notes sample signals at their onset. Use eighths or sixteenths to render continuous parameter sweeps cleanly.
5. **Parallel derivation over duplication:** Derive harmonies using `.add(...)` or stack interval offsets rather than writing duplicate melodic lines by hand.
6. **Zen of arrangement:** Show the dramatic arc through clean structure (`arrange` or `seqPLoop`) rather than repetitive copy-pasting.
