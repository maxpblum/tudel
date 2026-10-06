# Verification

Content enters the app only through `pnpm verify`. It runs every gate below over `content/`. Only if all of them pass does it compile the bundle the app reads (`apps/web/src/content/bundle.json`). The gates prove that code is valid Strudel at the pinned version, that its musical events are exactly what was reviewed, and that names and claims match Strudel's own docs and source. They **can't** prove that a sound matches a word like "warm". The cited timbre lexicon and the learner's ears cover that (PROPOSAL §13).

Code: `packages/verify/` ([README](../packages/verify/README.md)). The pinned reference data: `tools/strudel-ref/` ([README](../tools/strudel-ref/README.md)).

## Commands

| Command | Does |
|---|---|
| `pnpm verify` | Runs all gates. Prints a per-gate report listing every failing item with its file and line. Exits 1 on any failure. Writes the bundle only on success |
| `pnpm verify --update` | Same, but (re)writes the L3 snapshot files in `packages/verify/__snapshots__/` and deletes stale ones. **Review the git diff before committing** |
| `pnpm verify --explain <id>` | For one variant or lesson id (e.g. `snd.waveforms.v01`, `snd.lowpass.lesson`), lists every check of every gate with ok/x and the reason. Exits 0 if that item passes. Doesn't write the bundle |
| `pnpm verify --content <dir>` | Verify another content tree (tests use fixtures this way). Also `--snapshots <dir>`, `--out <file>`, `--no-bundle`, `--src-root <clone>`, `--gates L1,L3,...` |
| `pnpm test` | Unit tests, including one or more deliberately broken fixtures per gate |
| `pnpm strudel-ref` | Set up the pinned Strudel clone that L8b checks citations against, and regenerate `doc.json` |
| `bash ci/drift.sh` | Run the gates against the latest Strudel release and report differences (never fails) |

Exit codes: 0 all green, 1 a gate failed, 2 a usage or setup problem (e.g. missing `sounds.json`).

## The gates

Every snippet means: each variant solution and starter, and each `:::play`, `:::code` and both sides of each `:::compare` in lessons and prompts. They all go through the same list (`src/content/snippets.ts`), so no code can skip a gate by living somewhere unusual. Fenced Markdown code blocks (```` ``` ````) are rejected for the same reason: use `:::code`.

| Gate | Checks | Fails on, for example |
|---|---|---|
| **L0** Schema and graph | zod schemas from `@tudel/content-schema`. **Unknown fields are errors**, because zod would silently drop a typo like `equivalent_solution` and use the default. Unique ids. Units, prerequisites, lessons and variant skills all resolve. No prerequisite cycles. Variant file name = id = `<first skill>.vNN`. Files sit under their skill's unit. Lessons and skills point at each other. Every skill has ≥3 variants in its pool (variants listing it in `skills`). Directive syntax (unknown directive or attribute, nesting, unclosed). YAML bodies of `:::envelope/filter/signal/compare` | `fx.filter: has 2 variant(s)`, `prerequisite cycle: a -> b -> a`, `unknown field "verify.equivalent_solution"` |
| **L1** Evaluate | Each snippet goes through `@strudel/core`'s real `repl()` (`$:` labels, `setcpm`, everything the learner's tool does; nothing being taught is mocked) and its pattern is queried over the verify window. It must produce ≥1 event. Every event value must be a control object (what superdough plays). Strudel must log nothing while evaluating. No pitched event may be below C3 (MIDI 48), which is too low for laptop speakers (`content/STYLE_TIPS.md` §1) | `lowest note is MIDI 36, below C3`, `.lfp is not a function`, `[mini] parse error`, `pattern produces no events`, a bare `"c3 e3"` (makes no sound) |
| **L2** Vocabulary | Every free identifier and every called method (found with acorn) is a user-facing `doc.json` name or synonym, or on the allowlist. Internal doc entries (e.g. `DoughVoice` members) don't count. Each skill's `vocabulary` lists primary doc names. Every allowlist entry cites an existing ADR, and entries `doc.json` now documents are flagged as redundant | `method .piano() is not in the pinned doc.json` (it's a strudel.cc website helper) |
| **L2b** Sound names | Every sound a snippet can play is registered at the pin (`sounds.json`). Static: every word of every literal `s()`/`sound()` mini-notation string, parsed with Strudel's own parser (so `"<a b c d e>"` is fully checked even if the window shows only `a`), and every `.bank()`. Dynamic: the `s` (and superdough's `bank_s`) of every queried event | `sound "sawtoth" is not registered`, `bank "NoSuchMachine"` |
| **L3** Snapshots | `pattern.sortHapsByPart().queryArc(0, cycles)` → `hap.show(true)` lines plus the cps, per snippet, equal `__snapshots__/<id>.snap` (one file per variant or lesson; lesson snippets keyed `snippet#<index> <kind>`). Variants use `verify.cycles`; lesson snippets use 4 cycles. Missing or stale snapshot files fail | A line diff of the changed events |
| **L4** Notation | For variants with `abc`: abcjs `parseOnly` + `setUpAudio` (key signature, accidentals, ties applied) vs the canonical solution's events in the configured voice: pitch (MIDI, as superdough computes it from `note`/`freq`), onset and duration, with whole note = 1 cycle. The reference loops, so over `verify.cycles` its events must equal the notation (rounded up to whole bars) repeated end to end. The notation must fit in `verify.cycles`. `only_sounds` limits which events count. `abc` without `abc_agreement` fails (it would be unchecked). abcjs warnings fail. Lesson `:::abc` blocks must parse without warnings | `#4: notation onset 0.75, pitch 67 vs solution onset 0.75, pitch 69 (pitch differ)` |
| **L5** Equivalence | With `equivalent_solutions: true` (the default), every alternative solution's L3 output (events and cps) equals the canonical one's | A diff `- solution[0]`, `+ solution[1]` |
| **L7** House style | [house-style.md](house-style.md): Prettier with `packages/verify/src/gates/prettier.config.json` leaves the code unchanged. No single-quoted strings. No `doc.json` synonyms (the list is derived from `doc.json`). No short synth aliases (`saw`, `sqr`, `tri`, `sin`; derived from `sounds.json`). Exempt: `:::code{antipattern}` blocks and `refactor` starters, which are clumsy on purpose | `"cutoff" is a synonym; use the primary name "lpf"` |
| **L8** Prose | (a) Inline code spans in lessons, prompts, `listen_for`, rubrics, solution notes, skills and the lexicon that look like code: a bare name (`` `lpf` ``) must be a doc/allowlist name. In calls and chains (`` `.lpf(800)` ``, `` `range(min, max)` ``), the called names must be. A quoted single word (`` `"sawtooth"` ``) must be a registered sound or a note name. (b) `{cite doc=X}` names a primary doc entry. `{cite src="path#Lx-Ly"}` points at existing lines in the pinned clone, which must be at the pinned commit. Variant `sources` are checked the same way (`strudel-doc`, `strudel-src`, `lexicon` term exists, `url` is http(s)). (c) `content/glossary/chord-symbols.yaml`, if present (`entries: [{symbol, tones}]`): tones equal tonal's spelling. (d) Every lexicon entry has sources and a confidence level | `` `"lowpass"` is not a registered sound name ``, `"packages/x.mjs" has 120 lines; L118-L130 is out of range` |
| **BUILD** | The compiler (Shiki highlighting, Markdown, Graphviz) succeeds and the bundle validates against the `Bundle` zod schema | `:::diagram: Graphviz error: syntax error in line 1` |

L6 (browser audio smoke test) runs under `pnpm e2e` in `apps/web`. It is the only place allowlisted names are proven to play.

## Updating snapshots

1. Change content (or bump the pin).
2. `pnpm verify` shows each L3 mismatch as a diff.
3. If every change is intended, `pnpm verify --update`, then `git diff packages/verify/__snapshots__/`. The diff is the review: each changed line is an event that now sounds different.
4. Commit the content and the snapshots together.

`--update` never deletes the snapshot of an item that only failed L0 (a typo shouldn't wipe its golden file). Fix L0 first.

## Explaining one item

```
$ pnpm verify --explain snd.waveforms.v01
  PASS  L1    Evaluate
          ok [solution[0] (units/u3a/exercises/snd.waveforms.v01.yaml)] evaluates (16 haps over 2 cycles, cps 0.5)
  ...
  ----  L4    Notation agreement: not applicable
```

## Drift

`bash ci/drift.sh` copies the repo to a temp dir, installs the latest npm release of every `@strudel/*` package, and runs L1-L5 and L8 (L0 too, as the loader). It prints the pinned and latest reports, their diff, and the L3 snapshot diff (pinned → latest). It always exits 0. Run it on a schedule. When it reports differences:

- **Only snapshots changed:** Strudel's behavior changed. Read the diff and check whether any lesson prose or `listen_for` describes the old behavior.
- **L1/L2b fail:** something content uses was removed or renamed upstream. Note it before bumping.
- Then bump deliberately: [tools/strudel-ref/README.md § Bumping the pin](../tools/strudel-ref/README.md#bumping-the-pin).

`drift.sh --docs` also regenerates `doc.json` and `sounds.json` from Strudel's main branch, so L2 and L8a check against the latest docs. It's slow (it clones and installs Strudel).

## Allowlist policy (L2)

`packages/verify/src/gates/allowlist.json` lists names that L2 accepts although `doc.json` doesn't document them. Rules:

- **One ADR per entry**, in `docs/decisions/` (numbers 0001-0099 belong to verification). The ADR says what the name is, where it's defined in the pinned source (file and lines), and why content needs it. The entry's `adr` field is that file's path, and L2 fails if the file doesn't exist.
- Allowlisted names still have to evaluate (L1) and play in the browser (L6). The allowlist only waives "is documented".
- Prefer changing content to adding an entry. Never allowlist website-only helpers (e.g. `piano`, defined in strudel.cc's prebake, not in the packages the app uses).
- When a pin bump makes `doc.json` document an entry, L2 reports it as redundant. Remove it and mark the ADR superseded.

Current entries: `p` ([ADR 0003](decisions/0003-allowlist-p.md)).

## What the gates don't cover (known limits)

- Timbre words (`warm`, `bright`) can't be machine-checked. That's the lexicon's job (L8d checks its sources exist, not that they're right) plus adversarial review.
- L3/L5 compare events, not audio. Two snippets with identical events but different superdough defaults would compare equal. L6 is the audio check.
- L4 compares pitch, onset and duration only: not dynamics, articulation or ornaments. abcjs is permissive: some malformed ABC parses without warnings (and is then caught only if it changes notes).
- L8a doesn't check code-like text outside backticks, or chord symbols in prose (only `chord-symbols.yaml`).
- `sounds.json` reflects the CDN sample maps when it was generated (they aren't versioned with the Strudel commit).
