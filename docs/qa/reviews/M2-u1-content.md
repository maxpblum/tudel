# M2 adversarial content review: U1 "Time & rhythm"

- **Reviewer:** fresh adversarial reviewer (LLM), not the author. Fixes were applied in the same pass (see Resolution).
- **Date:** 2026-10-07
- **Pin:** `f610965f4332837febe45743105da170e8b331ed` (`tools/strudel-ref/pin.json`).
- **Scope:** `content/units/u1/lessons/*.md` (7), `content/units/u1/exercises/*.yaml` (27), the seven `rhy.*` entries in `content/skills.yaml`, the U1 part of `docs/curriculum.md`, ADR 0201 §1–2.

## Method

Nothing could be executed in this review (no node, pnpm or git), so every gate was checked by hand.

1. **Haps.** For every solution and lesson snippet I derived the onsets, durations and pitches from mini-notation semantics and compared them with the L3 snapshots in `packages/verify/__snapshots__/rhy.*.snap` (ground truth for what the code produces). All 27 variants and 7 lessons agree with their prose.
2. **ABC agreement (L4).** Every dictation ABC (7) was converted by hand to onset/duration (and pitch where compared) in cycles, with a whole note = 1 cycle, and compared with the snapshot haps, including the `only_sounds` filter on `rhy.layers.v01` (the gate filters on `value.s`, and with `.bank` the hap keeps `s:bd`, `bank:RolandTR909` separate, as the snapshots show).
3. **Accepted alternatives (L5).** 13 alternatives. Each pair was checked as hap-identical by construction (`x*n` vs `[x x …]`, `x!n` vs repeated steps, `<…>` placement, `/n` vs `<…>`, `stack` vs comma, `euclid`/`euclidRot` vs bracket form, `(k,n)` vs written-out rests, `setcpm(15)` vs `setcpm(60 / 4)`); every snapshot lists identical haps for both.
4. **Citations (L8b).** No local clone exists, so I fetched each cited file at the pin from `codeberg.org/uzu/strudel/raw/commit/<pin>/…` and read the cited lines (list below). doc= cites were checked in `tools/strudel-ref/doc.json` with `jq`.
5. **Names, sounds, style (L2, L2b, L7, L8a).** All identifiers are primary doc.json names. Every drum name and `bank_sound` pair used is in `tools/strudel-ref/sounds.json` (`RolandTR808_rd` is the one missing pair, and nothing uses it). Inline code spans were run through the L8a rules by hand (`checkSpan`). Line widths are ≤ 80 and multi-call chains are already single-line under Prettier's member-chain rule (2 call groups after the head).
6. **Lexicon (L8 sources) and drum policy (ADR 0201 §1–2).** See F05 and the confirmed list.

## Findings

Severity: blocker / minor / nit.

| ID | Location | Severity | Claim | Problem | Resolution |
|---|---|---|---|---|---|
| F01 | `exercises/rhy.rests-lengths.v03.yaml` prompt | minor | "Every other eighth is silent." | "Every other" means alternate eighths. The silent eighths of `bd ~ sd ~ ~ bd sd ~` are 2, 4, 5 and 8, so the prompt contradicts the reference. | Fixed: "The other four eighths are silent." |
| F02 | `exercises/rhy.cycles-tempo.v04.yaml` abc | minor (risk) | `Q:1/4=96` in the dictation header. | The only `Q:` field in the repo. L4 reads `start`/`duration` from abcjs `setUpAudio` and treats them as whole notes. I could not confirm by hand that a tempo field leaves those values in whole notes. | Fixed: removed `Q:`, and the prompt now says "at **96 BPM**". The notation is unchanged otherwise. |
| F03 | `lessons/alternate.md:25`, `skills.yaml` rhy.alternate summary | minor | "`/n` … slows a step down so that it lasts n cycles"; "stretch a step over n cycles with /n". | True only when the step fills the bar. Inside a multi-step bar, `/n` slows that step's content, so it plays part of it per bar rather than lasting n cycles (§3: invites "what about `c4 e4/2`?"). | Fixed: "slows a step down n times … On a group that fills the whole bar, that spreads the group over n bars … This course uses `/n` only on a group like this." Summary: "stretch a group that fills the bar over n cycles". |
| F04 | `exercises/rhy.drums.v01.yaml` listen_for | nit | "Kick on beat 1, and on beat 3 together with the eighth after it". | "Together with" reads as simultaneous. The two kicks are successive eighths. | Fixed: "Kick on beats 1 and 3, plus a second kick on the eighth right after beat 3". |
| F05 | `exercises/rhy.drums.v03.yaml` listen_for | minor | "a short tick", "higher than the kick and noisier". | Qualitative timbre words with no lexicon entry or `lexicon:` source (content-authoring §1). | Fixed: cues are now register and ring length ("a high, very short hit that stops almost at once"; "in a middle register, higher than the kick and lower than the hi-hats"). |
| F06 | `exercises/rhy.euclid.v01.yaml` listen_for | nit | "Strudel's source lists (5,16) as the bossa nova rhythm". | `euclid.mjs#L114-L115` says "The Bossa-Nova rhythm necklace": the pattern counted from any hit. The usual bossa nova pattern is a rotation of it. | Fixed: quotes the source's "rhythm necklace" and says what it means. |
| F07 | `docs/strudel-idioms.md` | minor | content-authoring §1: each `idiom_note` "should match an entry in `docs/strudel-idioms.md`". | No U1 entry existed. | Fixed: added R1–R7 (one per `rhy.*` skill), with verified citations and code taken only from snapshotted snippets. |
| F08 | `lessons/layers.md:38` | nit | `{cite src="packages/transpiler/transpiler.mjs#L468-L470"}` for "each labelled line becomes its own part". | The range is the comment "converts label expressions to p calls" plus the `labelToP` header. It supports the claim, but only just. | Kept. Optional: widen to the end of `labelToP`. |
| F09 | `exercises/rhy.drums.v03.yaml` | nit | Identify four drums by ear. | ADR 0201 §1 says a U1 skill teaches rhythm, not drum timbre. This variant is about telling drums apart, but that is what `rhy.drums` (names and banks) is for, and it is the only one. | Kept. |

No **blockers** were found.

## Claims I tried to refute and confirmed correct

**Source citations (read at the pin):**
- `core/cyclist.mjs#L24`: `this.cps = 0.5` (default 2 s per cycle, 120 BPM).
- `core/repl.mjs#L132-L135`: `setCpm` calls `setCps(cpm / 60)`. `#L238-L258`: `$:` patterns are collected and `stack`ed.
- `mini/krill.pegjs`: `#L113` sub-cycle `[ ]`; `#L122-L125` `< >` gets `polymeter_slowcat` alignment; `#L128` a slice may be a slow sequence (so `*<2 4>` works); `#L134-L135` `@` weight = 1 + n − 1; `#L137-L145` `!` replicate; `#L147-L148` bjorklund `(p,s,r)`; `#L150-L151` `/` stretch slow; `#L153-L154` `*` stretch fast; `#L178-L180` comma stack.
- `mini/mini.mjs`: `#L36-L42` bjorklund → `euclidRot` when a rotation is given, else `euclid`; `#L88-L89` stack; `#L95-L96` polymeter slowcat; `#L124-L132` weighted `timeCat`; `#L138-L141` plain `sequence`; `#L157-L158` `~` and `-` are silence.
- `core/euclid.mjs`: `#L43-L52` Bjorklund; `#L106-L107` cinquillo `(5,8)`; `#L114-L115` bossa nova necklace `(5,16)`; `#L130-L136` `rotate(b, -rotation)`. `core/util.mjs#L153` `rotate` shifts left, so −r shifts **later** (snapshot: `(3,8,2)` hits at 0, 1/4, 5/8).
- `superdough/sampler.mjs#L313-L317`: with no `clip`, `loop` or `release`, duration = sample length. `superdough/synth.mjs#L63-L70`: synth hold ends at `t + duration`, then release.
- `website/src/pages/learn/samples.mdx`: `#L25-L39` drum abbreviation table; `#L70-L72` lazy loading; `#L91-L93` bank prepends `name_`, and "some banks won't have samples for all sounds".
- `transpiler/transpiler.mjs#L468-L470`: see F08.

**doc.json:** `setcpm` (example `setcpm(140/4) // =140 bpm in 4/4`), `bank` (prepends name + "_"), `euclid` (tresillo example), `euclidRot`, `stack`, `slow` and `fast` (the `/` and `*` operators), `s`, `note`.

**Arithmetic and haps:** 90 BPM gives a 0.67 s beat and 2.67 s bar; 80 BPM gives a 3 s bar (v02); 104 BPM gives 0.58 s / 2.3 s (v03); 96 BPM triplet notes are 0.83 s (v04); 0.17 s triplet eighths at 120 BPM (subdivide.v02); Beethoven motto 1 + 3 + 4 = 8 units, E-flat = eb4 in `K:Cm`; `(3,8,5)` hits slots 1, 4, 6 with gaps 3, 2, 3; `(5,16)` hits at 0, 3, 6, 9, 12 sixteenths; `(5,8)` gaps 2, 1, 2, 1, 2; `layers.v04` g4 onsets 1/3 and 2/3 of a bar fall a third of a beat after beat 2 and two thirds after beat 3.

**Policy:** every drum dictation (drums.v01, subdivide.v01, alternate.v01, layers.v01, euclid.v01) uses `clef=perc`, one checked voice, and `compare: [onset, duration]`; `layers.v01` uses `only_sounds: [bd, sd]` on voice 1. Drum snippets carry "(needs network)" labels or the lesson says so; 18 of 27 variants are synth-only. All pitched notes are ≥ c3 (L1).

## Counts

7 lessons, 27 variants, 40 solutions plus 4 starters and the lesson snippets read against snapshots, 7 ABC dictations checked by hand, 13 accepted alternatives, 29 distinct `src` citations fetched and read. 9 findings: 0 blockers, 4 minor (one a risk), 5 nits. 7 fixed, 2 kept with reasons.

## Reference code changed

None. Only prose, a prompt, an ABC header and docs changed, so no U1 snapshot goes stale.
