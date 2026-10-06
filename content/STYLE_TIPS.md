# Style tips for lesson and prompt prose

The reader is one person: an advanced classical musician (piano, choral singing and conducting, trombone, tuba) who knows Web Audio graphs but is new to synthesis jargon and to Strudel. Write so that **every sentence leaves them with less confusion than before.** `docs/house-style.md` covers code. This file covers prose and demos.

## 1. Make demos easy to hear

- Choose the register for the ear and for ordinary speakers, not for the theory. Melodic and timbre demos sit around **C3–C6**. Sines and soft sounds below about C3 are hard to hear on laptop speakers. *(A waveform demo at c3 made the sine nearly inaudible. Waveform comparisons at c2 sounded alike.)*
- **Gate L1 enforces a floor:** any pitched note below **C3 (MIDI 48)** in any snippet, solution, or starter fails `pnpm verify`. This applies to bass lines too: write them at c3 or above. The floor is `MIN_MIDI` in `packages/verify/src/gates/l1-evaluate.ts`.
- A comparison should make the difference obvious on first listen. If you have to strain to hear it, change the register, the duration, or the parameter range.

## 2. Use only words the reader already has

- **Name it first, then explain it.** Lead with the plain idea, then give the Strudel name. Then give the engineering name only if it helps: "resonance, a peak just below the cutoff (`lpq`; engineers call it the filter's Q)". Never let a bare symbol (`Q`, "sound name") carry a sentence before it is defined. *(Opening with "`lpq` sets the filter's Q" lost the reader.)*
- **No insider shorthand.** No unit ids (`U1`), file names, or course-internal labels in prose. Say "later lessons cover the rest."
- If a perceptual term such as "resonance" is still abstract, say what it sounds like **and** show what it looks like.

## 3. Give a simplification its concrete consequence

- You may narrow the scope ("for now…"). Never blur it. Instead of an abstract rule ("spaces divide the bar evenly"), state what this lesson's example *does*: "`c4 e4 g4 c5` fits four notes evenly into one bar, so each is a quarter note."
- A simplified statement must still be **true** and must not invite obvious follow-up questions, such as tuplets, double spaces, or what happens with five notes. If it does, add one concrete example that answers the likeliest question, or pick a different example.

## 4. Show every step of an inference

- Don't jump to a conclusion that depends on an unstated fact. "`c2*8` is eight eighths" needs both "8 notes in one cycle" and "1 cycle = 1 bar in 4/4". Say both, in that order. *(The reader saw eight C2s, but not why they were eighths.)*
- **Separate Strudel facts from course conventions.** Strudel has cycles. It has no bars. "Bar = cycle" is *this course's* convention (`docs/time-conventions.md`). Say which is which whenever it matters.

## 5. Contrast look-alikes side by side

When two features look or sound alike (`!` and `*`, `lpf` and `hpf`, `attack` and `decay`), show them on the same input. Then say the difference in one sentence: "`c*2` squeezes two Cs into one step; `c!2` adds a second full-length step."

## 6. Always write units, and say exactly what is meant

- Every number has its unit: Hz, dB, seconds, cycles, bars. "0 to 50" is incomplete. "0 to 50 dB" is complete.
- Prefer the exact statement over a softened one that is technically wrong. "Changes little" is wrong when the truth is "changes nothing until…, then…".
- State conditions explicitly: "**if the input is only a sine wave**, `lpf`…", not "a sine has…, so `lpf`…".
- Boundary cases matter for conventions that are easy to get off by one. Add the nearby case: "c4 is middle C (the B just below it is b3, not b4)".

## 7. Draw what you describe

If prose describes a shape, show the shape. That covers a curve, a corner, a peak, a sweep, or an envelope. To show what a parameter does, plot a **family of curves that varies one parameter**, each with a clear label, and plot a second family for the other parameter if it matters. *(A "gentle corner with no obvious peak" needed a plot of several Q values at one cutoff, and several cutoffs at one Q.)*

## 8. Draw analogies from the learner's own experience

- **Good sources:** voice and choir (vowels, formants, consonant attacks, blend), brass playing (mutes, embouchure, tonguing, partials), piano (hammer attack, pedal, decay), conducting, orchestration, and score reading.
- **Avoid** specialist knowledge from instruments they don't play. Organ registration as a general idea (stops with different tone colours) is fine. Organ mechanics (a swell box) are not.
- An analogy must hold for the point being made. If it needs caveats, drop it.

## QA: check a draft against these tips

Read the draft **as the learner**, sentence by sentence, and ask:

1. Could this demo be heard clearly on laptop speakers? (§1)
2. Is every term or symbol defined before or where it is used? Is there any insider shorthand? (§2)
3. Does any simplification invite an obvious "but what if…?" (§3)
4. Does any "so" or "therefore" skip a step? Is any course convention presented as a Strudel fact? (§4)
5. Are look-alikes contrasted on the same input? (§5)
6. Does every number have a unit, every claim state its conditions, and every off-by-one convention give its boundary case? (§6)
7. Is every described shape drawn? (§7)
8. Does every analogy come from the learner's own experience? (§8)

Record any failures and fix them before running `pnpm verify`. The gates check facts and code, not clarity.
