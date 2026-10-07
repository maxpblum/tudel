# M2 adversarial content review: U3b "Sound design II"

- **Reviewer:** fresh adversarial reviewer (LLM), not the author. Fixes were applied in the same pass (see Resolution).
- **Date:** 2026-10-07
- **Pin:** `f610965f4332837febe45743105da170e8b331ed` (`tools/strudel-ref/pin.json`).
- **Scope:** `content/units/u3b/lessons/*.md` (7), `content/units/u3b/exercises/*.yaml` (21), the U3b `snd.*` entries in `content/skills.yaml` (read only), the timbre-lexicon entries they cite (read only).

## Method

Nothing could be executed in this review (no node, pnpm or git), so every gate was checked by hand.

1. **Haps and parameters.** For every solution and snippet I derived the haps and the control values (`bpf`/`bpq`, `delay`/`delaytime`/`delayfeedback`, `room`/`roomsize`, `fm`/`fmh`/`fmdecay`/`fmenv`, filter-envelope params, noise sources) and compared them with the prose and `listen_for`. There are no dictations and no accepted alternatives in U3b.
2. **Signal claims.** Computed by hand: noise loudness (pink ≈ −9.5 dB, brown ≈ −20 dB vs white, matching the 0.3 / 0.9 / 3 gain choices); bandpass −3 dB bands for Q = 1, 2.5, 5 at 1 kHz (618–1618, 820–1220, 905–1105 Hz); FM envelope levels (exp reaches 0.1 at a third of `fmdecay`, lin is at 0.66 after 0.17 s of 0.5 s); FM sideband spectra for `fmh` 1 and 2 on a sine carrier.
3. **Citations (L8b).** No local clone exists, so I fetched each cited file at the pin from codeberg and read the cited lines: `superdough/helpers.mjs`, `superdough.mjs`, `synth.mjs`, `noise.mjs`, `reverb.mjs`, `reverbGen.mjs`, `feedbackdelay.mjs`, `superdoughoutput.mjs`, `util.mjs`. doc= cites checked in `tools/strudel-ref/doc.json` with `jq`. Web Audio claims checked against the W3C spec (BiquadFilter bandpass Q is linear; `DelayNode` `maxDelayTime` defaults to 1 s).
4. **Names, sounds, style (L2, L2b, L7, L8a).** All identifiers are primary doc.json names; sound names are in `sounds.json`. Lines are ≤ 80 (longest 79, `snd.room.v03`), double quotes only, call chains in Prettier's layout, `1 / 8` style arguments already expanded.
5. **Lexicon.** Every timbre word in prose and `listen_for` maps to a lexicon entry or a `lexicon:` source ("whistles"/"ringing" → resonant, "honky" → nasal, "distant" → wet).

## Findings

Severity: blocker / minor / nit.

| ID | Location | Severity | Claim | Problem | Resolution |
|---|---|---|---|---|---|
| F01 | `lessons/noise.md:7` | minor | "three noise synths". | `crackle` is a fourth noise source (`helpers.mjs#L7`, `sounds.json`). | Fixed: reworded, with `crackle` mentioned. |
| F02 | `lessons/room.md:40` | minor | "a later lesson covers how" (separate reverbs per part). | No lesson covers orbits. | Fixed: removed the forward reference. |
| F03 | `lessons/bandpass.md:20` | minor | `bpq(5)` width described loosely. | Q = 5 gives a −3 dB band of about 0.29 octave. | Fixed: "a little under a third of an octave". |
| F04 | `lessons/fm.md:25` | minor | `fmh(2)` gives only odd harmonics. | True only for a sine carrier (sidebands at f ± 2kf). | Fixed: "On a sine, `fmh(2)` gives only the odd harmonics". |
| F05 | `exercises/snd.bandpass.v03.yaml` listen_for | minor | The centre harmonic is the only one heard. | Neighbours are attenuated, not removed (h2 ≈ −11 dB, h4 ≈ −8 dB relative). | Fixed: "stands out above its neighbours". |
| F06 | `exercises/snd.room.v03.yaml` listen_for | minor | Bar 1 has a reverb tail. | Bar 1 sends nothing; what is heard there on repeat is the tail of bar 4 spilling over. | Fixed: stated both. |
| F07 | `content/skills.yaml` (not owned) | minor | `snd.fm.v03` lists secondary skill `snd.filter-sweep`. | `snd.filter-sweep` is not a prerequisite of `snd.fm`. | Resolved by the orchestrator: `snd.filter-sweep` added to `snd.fm` prereqs in `skills.yaml` and the DOT graph in `docs/curriculum.md`. |

No blockers. No reference code was changed; only prose.

## Claims I tried to refute and confirmed correct

- Noise sources and their gain compensation (`noise.mjs#L19-L36`, `#L65-L67`; `helpers.mjs#L293-L307`, noise ≤ 0.5 doubles gain in `wetfade`).
- Bandpass is a BiquadFilter with linear Q (`helpers.mjs#L245-L263`, W3C).
- Delay defaults: feedback 0.5, time 3/16 (`superdough.mjs#L193-L194`); feedback clamp 0.98 (`superdoughoutput.mjs#L53-L58`); 1 s maximum delay time (`feedbackdelay.mjs#L1-L6`, W3C).
- Reverb: generated impulse decaying to −60 dB, default lowpass 15000 Hz and dim 1000 Hz (`reverb.mjs#L28`, `reverbGen.mjs#L30-L36`, `#L85-L102`); `roomsize` 0–10 and `room` 0–1 (doc.json).
- FM: modulation index and harmonicity (`synth.mjs#L407-L421`); `fmenv` exp vs lin, with doc.json's own "might be a bit broken" caveat respected.
- Filter envelope params and defaults (`helpers.mjs#L40-L99`, `#L446-L466`).
- All 21 `listen_for` lists and all lesson parameter values.
