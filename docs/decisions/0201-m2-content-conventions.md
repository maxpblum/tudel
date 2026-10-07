# 0201: Content conventions for the M2 units (U1, U2, U3b, U4)

- **Status:** accepted (M2)
- **Date:** 2026-10-06

## Context

The M2 units bring in drum samples, chord symbols, FM, effects and continuous signals. ADR 0200 still applies in full. This ADR records what M2 adds or changes.

## Decisions

1. **Network policy (amends 0200 §4).**
   - U1 drum content uses sample banks through `s` and `bank`. Gate L2b tags those snippets `needsNetwork`, the app shows its existing offline banner for them, and L6 skips them under `L6_OFFLINE=1`.
   - All other M2 units stay synth-only, so they work offline. Noise uses the built-in synths `white`, `pink` and `brown`.
   - A U1 skill must still teach rhythm, not drum timbre. Wherever a synth would make the point equally well, prefer the synth.
2. **Drum dictation.**
   - Drum haps carry no pitch, so `verify.abc_agreement.compare` is `[onset, duration]`.
   - The ABC uses `clef=perc`, with one voice per drum line that is checked.
   - When the reference stacks a kit, `only_sounds` selects which line a voice is compared against.
3. **Verified names.** These follow from `tools/strudel-ref/doc.json` and the pinned source.
   - FM is taught as `fmi`. `fm` is only its synonym.
   - Delay time is taught as `delaysync`, which is in cycles and therefore follows the tempo. Its default is 3/16 (`packages/superdough/superdough.mjs#L194`). When `delaytime` (in seconds) isn't set, superdough derives it from `delaysync` (`superdough.mjs#L503`, `#L612`).
     - In `doc.json`, `delaytime` exists only as a synonym (`delayt`, `dt`), and its doc text is attached to `delayspeed`. So `delaytime` is not taught.
   - `dict` is not a `doc.json` name; voicing dictionaries wait for U5 (M3).
4. **Id prefixes.** `rhy.` (U1), `pit.` (U2), `snd.` (U3b, continuing U3a), `mod.` (U4).
5. **U4 builds on `snd.filter-sweep`**, which already introduced `sine.range(a, b).slow(n)`. U4 lessons go beyond it rather than repeating it: signal shapes, `rangex`, `fast`, `segment`, drift, signals as melody, and phrase alignment.
6. **Chord symbols.**
   - Every chord symbol that U2 prose or code uses gets an entry in `content/glossary/chord-symbols.yaml`, with `skills` set to the skills that teach it.
   - L8c checks the tones against `tonal`.

## Consequences

U1 needs the network for its drum audio. Its rhythm content can still be read, and its exercises can still be rated offline.
