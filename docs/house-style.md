# House style for Strudel code

Every reference solution, starter, and lesson snippet follows these rules, so the code the learner copies is always a good model. Gate **L7** enforces every rule marked **[L7]**. The others are review guidance.

## Formatting [L7]

- Code must be unchanged by Prettier with this exact configuration (also in `packages/verify/src/gates/prettier.config.json`):

  ```json
  { "parser": "babel", "semi": false, "singleQuote": false, "printWidth": 80, "trailingComma": "all" }
  ```

  The `$:` labels Strudel uses for parallel parts are valid JavaScript labels, so Prettier accepts them unchanged.
- **No single-quoted strings [L7].** In Strudel, double-quoted and backtick strings are parsed as mini-notation, but single-quoted strings are plain JavaScript strings. Prettier would silently turn `'…'` into `"…"`, which changes the meaning. So reference code uses only `"…"` (mini-notation) and backticks.
- One statement per line. Put `setcpm(...)` first if the tempo matters (see `time-conventions.md`).

## Naming [L7]

- **Use the primary name from `doc.json`, never a synonym:** `s` not `sound`, `lpf` not `cutoff`/`lp`, `lpq` not `resonance`, `attack` not `att`, `hpf` not `hp`, and so on. The verifier derives the synonym list from `doc.json`, so the rule always matches the pinned Strudel version.
- Sound names are the full readable forms: `"sawtooth"`, `"square"`, `"triangle"`, `"sine"` (not `saw`, `sqr`, `tri`, `sin`).
  - **Exception:** the *signal* functions `sine`, `saw`, `square`, `tri` (and `cosine`, `isaw`, `perlin`, …) are JavaScript identifiers, not sound names. Write them as they appear in `doc.json`.

## Structure (review guidance)

- Lead with *what* is played (`note(...)` or `n(...)`), then *with what sound* (`.s(...)`), then the amp envelope, then filters, then gain and effects. This mirrors superdough's fixed signal chain at the pin: oscillator → amp envelope (`packages/superdough/synth.mjs` L65–67) → `gain` → `lpf` → `hpf` (`packages/superdough/superdough.mjs` L652–727) → effects. The one exception is `gain`, which is written last by convention even though it is applied before the filters; both are linear, so the order doesn't change the sound. **The order of method calls does not change the sound.** The chain is fixed, and this convention is only for readability.
- Use one `$:` per musical part when there are several parts. Avoid `stack(...)` for top-level parts in M1 content.
- Prefer mini-notation for sequences of values (`.lpf("<400 800 1600>")`) over JavaScript arrays or chains of `.every`.
- Numbers have a leading zero: `0.5`, not `.5`. Prettier enforces this [L7].
- Keep a reference solution as short as possible while still sounding right. No parameters set to their default values unless the lesson is *about* that parameter.
