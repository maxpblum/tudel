# ui/

The React views, with hash routing (`router.ts`):

| Route | View |
|---|---|
| `#/` | `TodayPage`: plan preview, start or continue a session, session length, skill list |
| `#/session` | `SessionPage`: the current step (`LessonView` or `ExerciseView`), progress dots, skip |
| `#/library`, `#/library/skill/:id`, `#/lesson/:id`, `#/variant/:id` | `LibraryPages`: browse everything and open anything out of session |
| `#/map` | `MapPage`: the skill DAG as SVG (`dag.ts` `layoutDag`: column = longest prerequisite depth, rows by unit order then skill order). Nodes use the `status-*` classes and link to the skill; scrolls sideways on narrow screens |
| `#/search/:q` | `SearchPage`: search box and results linking to their pages. The Library has the same box (`SearchBox`) |
| `#/glossary/terms[/:name]`, `#/glossary/lexicon`, `#/glossary/chords` | `GlossaryPages`: Strudel terms (synopsis, synonyms), the timbre lexicon (tendencies, status, confidence, source links) and chord symbols (name, tones). Every entry links to its skills; the skill page's vocabulary links to the term |
| `#/data` | `DataPage`: export and import of the event log |
| `#/__smoke` | `SmokePage`: hidden gate L6 harness (`window.__smoke`) |

- Overrides (`OverridesMenu`): show again soon, **suspend**, retire, mark known, restore (a suspended skill offers only Restore). The Library's unit headers have *Focus on this unit* / *Clear focus* (appends `focus_changed`); Today shows a focus chip with a clear button. `SkillPage` shows a fluency sparkline (informational only; hidden without data).
- `appContext.tsx`: the event log and clock. `useDerived()` replays the log into SRS, session and rotation state. `useAppend()` resolves after the durable write; await it before moving on.
- `Blocks.tsx`: renders every bundle `Block` kind. `plots.tsx` and `plotMath.ts` draw the envelope, filter and signal plots, computed from their parameters.
- `components.tsx`: `CopyButton`, `CodeBlock` (read-only Shiki HTML plus copy; there is no editor anywhere, per R-NO-EDITOR), `PlayControls` (play/stop, loop, slow-down, offline note), `LivePianoRoll` (@strudel/draw), `StaticPianoRoll` (SVG from `roll`).
- `ExerciseView.tsx`: prompt, notation or audio, starter, reveal (reference plus copy, alternatives, listen-for and rubric checklists, live and static rolls), rating, overrides, and reopening the lesson. It respects `hideReferenceCodeUntilReveal`. Out of session it allows one rating per view, then shows "Rated: …" and *Practise again*, which remounts the view and logs a new `variant_shown`. Reference audio plays before reveal only for `ear-dictation`, `match-by-ear` and `read-the-code`; slow-down is offered for the two ear types.
