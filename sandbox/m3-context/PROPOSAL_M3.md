# M3 Curriculum & Pedagogical Requirements

Extracted from `PROPOSAL.md` for Milestone 3 (Full Curriculum).

---

## 1. The Learner Persona & Goal
- **Learner Profile:** An advanced classical musician: pianist, choral singer and conductor, and trombone/tuba player with strong Western music theory. Strong mental model of audio graphs (oscillators, filters, modulations) from Web Audio API. Has some jazz familiarity (e.g. learning what "sus", "add9", slash chords mean in practice).
- **Core Goal:** Become fluent in [Strudel](https://strudel.cc) for live-coding music in target genres: **synthwave**, **synth-pop**, and **chiptune**.
- **Pedagogy (R-PEDAGOGY):**
  - Connect concepts to their classical background (voice leading, inversions, figured bass, counterpoint, orchestration, articulation, hairpins).
  - Skip beginner music theory (no explaining what a triad or an octave is).
  - Teach pop and jazz chord symbols, modal mixture, and genre progressions as practical Strudel idioms.
  - Sound sources: Strudel's built-in synths, effects, and standard sample banks. No external samples.

---

## 2. Hard Invariants & Settled Requirements
1. **Self-grading (R-GRADE):** The learner grades their own work against a reference solution. The tutor never auto-grades.
2. **No Editor (R-NO-EDITOR):** No editor or REPL in the app. The learner types in their own external Strudel setup. Every code block has a copy button.
3. **Spaced Repetition (R-SRS & R-SKILLS):** FSRS schedules *skills*. Each skill has a pool of ≥3 exercise variants.
4. **Machine Verification (R-ACCURACY):** CI gates L0–L8 verify every snippet and reference solution against a pinned Strudel version.
   - Floor: Notes below C3 (MIDI 48) fail Gate L1 (`MIN_MIDI`). Write bass lines at C3 or above.
   - Names: Only functions and methods in `doc.json` (or ADR-backed allowlist) are valid.
5. **Citations (R-CITE):** Behavioral claims in prose carry `{cite doc=NAME}` or `{cite src="path/to/file.mjs#L10-L20"}`.
6. **Time Conventions:** 1 cycle = 1 bar (4 beats in 4/4). Tempo set by `setcpm(BPM / 4)`.

---

## 3. M3 Curriculum Specifications (Units U5–U12)

| Unit | Title | Core Content & Objectives |
|---|---|---|
| **U5** | **Advanced harmony & voicing** | Voicing dictionaries and controls (`voicing`, `dict`, `anchor`, `mode`, `offset`), voice leading constraints, slash chords, sus chords (sus = third replaced by 2nd or 4th), add9, 7ths, modal mixture, genre-typical progressions. |
| **U6** | **Pattern transforms** | Transposition, melodic inversion idiom (see Risk K3: reflect scale degrees around an axis, do not invent nonexistent functions), reversal (`rev`, `palindrome`), speed (`fast`, `slow`), canons with `off` and `superimpose`, conditional variation with `every` and `when`/`while`, `ply`, `struct`, `jux`. |
| **U7** | **Layering & buses** | `orbit` for shared effect buses, shared delays/reverbs, named parts (`$:`), mixing, stereo placement with `pan`, balance with `gain`. |
| **U8** | **Detune & wobble** | Micro-detune as timbre versus audible detune; slow pitch drift; `supersaw` with `detune`; 80s detuned-synth style (the *Stranger Things* timbre aesthetic, without copying the copyrighted theme). |
| **U9** | **Chiptune track** | Authentic 8-bit sound design (pulse waves, duty cycles, arpeggios with fast notes, noise percussions), arcade progressions, fast melodic ornaments, beginner/intermediate/advanced techniques, plus Capstone Chiptune Song Project. |
| **U10** | **Synth-pop track** | 80s synth-pop aesthetic: driving basslines, bright brass stabs, gated-reverb feel, arpeggiated synth beds, modal hooks, beginner/intermediate/advanced techniques, plus Capstone Synth-pop Song Project. |
| **U11** | **Synthwave track** | Outrun / synthwave aesthetic: driving eighth-note rolling bass, sidechain-like dynamic pumping with signals, lush detuned pads, leads with delay, beginner/intermediate/advanced techniques, plus Capstone Synthwave Song Project. |
| **U12** | **Form, arc & zen** | Arrangement and section composition with `arrange` and `seqPLoop`; large-scale code structure showing song arc; consolidating idiom notes taught across U1–U11 into high-level readability. |

---

## 4. Exercise Types Catalog

Every variant belongs to one of these types:
- `dictation`: Given ABC notation (rendered to staff), learner writes code. (Requires `abc` string and `verify.abc_agreement`).
- `ear-dictation`: Audio only, code hidden until reveal. Learner writes down what they hear.
- `spec-to-code`: Explicit technical spec ("saw lead, low-pass at 800 Hz with resonance, short pluck envelope").
- `describe-to-code`: Qualitative description using timbre lexicon or musical terms ("warm, slowly blooming pad under C minor").
- `match-by-ear`: Reference sound played with code hidden until reveal. Learner recreates the sound.
- `transform`: Starter code provided (`starter: ...`). Learner applies an operation (e.g. invert, transpose, double speed, canon).
- `sweep`: A spec of change over time across bars or phrases.
- `recall`: Flashcard-style prompt testing quick syntax recall.
- `read-the-code`: Code provided; learner predicts sound/arc, then plays to check.
- `refactor`: Clumsy code provided in `starter`; learner rewrites into idiomatic Strudel.
- `creative`: Open brief with a rubric checklist (`rubric: [...]`).
- `arrange`: Multi-part brief with stems/parts; layering, mixing, buses.
- `project`: Capstone multi-part song project with checkpoint prompts, starter stems, canonical reference code, and a comprehensive rubric checklist (`rubric: [...]`).

---

## 5. Specific Risks & Gotchas
- **Risk K3 (Melodic Inversion):** Strudel does **not** have a built-in `invert()` function. Inversion must be taught as an idiom: reflecting scale degrees around an axis using `n` and `scale` (e.g. `n(tri.range(0, 7)).scale("C4:major")` inverted via `n(tri.range(7, 0))` or degree reflection math), or via mini-notation patterns. Never invent an `invert` method on Pattern.
- **Voicing Dictionaries:** In Strudel, `voicing()` uses the `ireal` dictionary by default. Unknown chords fail silently or log a warning. Chord symbols must be valid in `ireal` and match `tonal` spelling (Gate L8c).
- **Pitch Floor:** Remember that any note below C3 (MIDI 48) fails Gate L1. All bass lines must be written in octave 3 or higher (e.g., `c3`, `g3`).
