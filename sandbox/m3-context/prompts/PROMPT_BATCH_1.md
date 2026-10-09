# Authoring Prompt: Batch 1 (Units U5, U6, U7, U8)

You are authoring **Batch 1 of Milestone 3** for **tudel**, a live-coding music tutor for an advanced classical musician learning [Strudel](https://strudel.cc).

---

## Operating Environment & Ground Truth
- **Working Directory (`PWD`):** `/home/blampo/Projects/tudel/sandbox/m3-context`
- **Primary Source of Truth:**
  - **Rely strictly on the local sandbox files:**
    - `PROPOSAL_M3.md` (curriculum objectives & exercise types)
    - `STYLE_AND_PEDAGOGY.md` (pedagogy tips, house style, time conventions)
    - `STRUDEL_API_M3.md` (verified Strudel APIs)
    - `SCHEMA_AND_EXEMPLARS.md` (Zod schemas, directive syntax, exemplars)
    - `CURRENT_SKILL_GRAPH.yaml` (existing skills to use as prerequisites)
  - **Only use web search as a fallback** if you encounter ambiguous questions not answerable from the sandbox.

---

## Scope for Batch 1: Music & Sound Mechanics (Units U5–U8)

Author the units, skills, lessons, and exercise variants (minimum 3 variants per skill) for:

### 1. Unit `u5`: Advanced harmony & voicing (order: 6)
- **Topics:**
  - `voicing` controls: `chord`, `anchor`, `mode` (`below`, `duck`, `above`), `offset`
  - Jazz & pop chord symbols: 7th chords (`Cmaj7`, `Dm7`, `G7`), slash chords, sus chords (`Csus2`, `Csus4` where the 3rd is replaced by 2nd or 4th), `Cadd9`
  - Voice-leading constraints & smooth top line
  - Modal mixture and genre progressions
- **Target Skills (suggested 5–6 skills):**
  - `pit.voicing-controls`: anchor and mode for tight inversions
  - `pit.extended-chords`: major/minor sevenths, add9, sus chords
  - `pit.slash-chords`: inversions and altered bass notes
  - `pit.modal-mixture`: borrowing chords from parallel minor/modes
  - `pit.genre-progressions`: classic 80s/pop progressions
- **Glossary Additions:** Any new chord symbols must be added to `content/glossary/chord-symbols.yaml` with correct `tones` (matching `tonal`).

### 2. Unit `u6`: Pattern transforms (order: 7)
- **Topics:**
  - Speed changes with `fast` and `slow`
  - Reversals with `rev` and `palindrome`
  - Canons and echoes with `off(time, func)` (superimposing delayed copy)
  - Layered transforms with `superimpose(func)`
  - Conditional variation with `every(n, func)`
  - Structural rhythms with `struct` and `ply`
  - **Melodic Inversion Idiom (Risk K3):** Strudel has NO `invert()` method! Teach melodic inversion by reflecting scale degrees around an axis (e.g. `n` arithmetic or degree inverted patterns).
- **Target Skills (suggested 5–6 skills):**
  - `pat.speed-dir`: `fast`, `slow`, `rev`, `palindrome`
  - `pat.canon-imitation`: `off(time, func)`
  - `pat.superimpose`: `superimpose(func)`
  - `pat.variation-every`: `every(n, func)`
  - `pat.inversion-idiom`: melodic reflection without fake builtins
  - `pat.ply-struct`: `ply` and `struct`

### 3. Unit `u7`: Layering & buses (order: 8)
- **Topics:**
  - `orbit(n)` for bus routing and shared effect contexts
  - Stereo positioning with `pan(0..1)`
  - Mixing and balancing with `gain`
  - Multi-part score layout with `stack` and `$:`
- **Target Skills (suggested 4–5 skills):**
  - `bus.orbit`: bus routing with `orbit`
  - `bus.stereo-pan`: positioning with `pan`
  - `bus.mixing-balance`: gain staging and part hierarchy
  - `bus.shared-effects`: routing different parts to shared delay/reverb buses

### 4. Unit `u8`: Detune & wobble (order: 9)
- **Topics:**
  - Micro-detuning vs audible detuning
  - `s("supersaw")` with `detune(...)`
  - Slow pitch drift and vintage tape wobble using continuous signals (`sine`, `perlin`) modulating pitch/add
  - Thick 80s synth leads and pads (the *Stranger Things* timbre aesthetic, without copying the theme)
- **Target Skills (suggested 4–5 skills):**
  - `det.supersaw`: `supersaw` and `detune`
  - `det.pitch-drift`: vintage LFO wobble with continuous signals
  - `det.chorus-detune`: wide stereo detuned pads
  - `det.detuned-lead`: expressive detuned synth lead

---

## Deliverables & Output Layout
Write all authored files into `output/batch1/`:
```
output/batch1/
├── skills.yaml                             # Additions to units: and skills:
├── units/
│   ├── u5/
│   │   ├── lessons/                        # *.md
│   │   └── exercises/                      # *.yaml
│   ├── u6/
│   │   ├── lessons/
│   │   └── exercises/
│   ├── u7/
│   │   ├── lessons/
│   │   └── exercises/
│   └── u8/
│       ├── lessons/
│       └── exercises/
└── glossary/
    └── chord-symbols.yaml                  # New chord symbols introduced in U5
```

---

## Self-QA Checklist Before Submitting
- [ ] Pitch floor check: Are ALL notes in snippets/solutions at or above C3 (MIDI 48)?
- [ ] Double quotes: Did you use only `"..."` (never single quotes `'...'`) in Strudel code?
- [ ] Pinned names: Is every function in code and inline prose present in `doc.json`?
- [ ] Inversion check: Did you avoid calling `.invert()` on Pattern?
- [ ] Style tips check: Does every number have units? Are analogies drawn from classical/brass/choral/piano practice?
