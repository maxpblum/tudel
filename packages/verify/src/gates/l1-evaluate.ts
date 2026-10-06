/**
 * Gate L1: every snippet evaluates through @strudel/core's real `repl()` (see
 * harness/evaluate.ts; nothing being taught is mocked) and its pattern can be queried.
 *
 * Beyond "no error", a snippet must produce at least one event in its verify window, and
 * Strudel must log nothing while evaluating (warnings mean the learner's tool would complain), and
 * every event value must be a control object (what superdough plays). A bare string pattern
 * such as `"c3 e3"` evaluates fine but makes no sound, so it fails here.
 *
 * Register: no pitched event may sit below MIN_MIDI (C3). Lower notes are hard to hear on
 * laptop speakers, the learner's usual playback (content/STYLE_TIPS.md §1).
 */
import type { Snippet } from '../content/snippets.js';
import type { RunCache } from '../harness/evaluate.js';
import { hapMidi } from '../harness/haps.js';
import { GateResult } from './result.js';

/** Lowest allowed pitch: C3 (MIDI 48). See content/STYLE_TIPS.md §1. */
export const MIN_MIDI = 48;

export async function gateL1(snippets: Snippet[], cache: RunCache): Promise<GateResult> {
  const r = new GateResult('L1');
  for (const s of snippets) {
    const run = await cache.run(s.code, s.cycles);
    const where = `${s.key} (${s.where})`;
    if (!run.ok) {
      r.fail(s.owner, `evaluation failed: ${run.error}`, where);
      continue;
    }
    if (run.logs.length) {
      r.fail(s.owner, `Strudel logged while evaluating: ${run.logs.join(' | ')}`, where);
      continue;
    }
    if (run.haps.length === 0) {
      r.fail(s.owner, `pattern produces no events in ${s.cycles} cycle(s)`, where);
      continue;
    }
    const bad = run.haps.find((h) => !h.value || typeof h.value !== 'object' || Array.isArray(h.value));
    if (bad) {
      r.fail(s.owner, `event value ${JSON.stringify(bad.value)} is not a control object (wrap it in note(...), n(...) or s(...))`, where);
      continue;
    }
    const low = run.haps.map((h) => hapMidi(h.value)).filter((m): m is number => m != null && m < MIN_MIDI);
    if (low.length) {
      r.fail(s.owner, `lowest note is MIDI ${Math.min(...low)}, below C3 (MIDI ${MIN_MIDI}): too low for laptop speakers; raise the register (content/STYLE_TIPS.md §1)`, where);
      continue;
    }
    r.pass(s.owner, `evaluates (${run.haps.length} haps over ${s.cycles} cycles, cps ${run.cps})`, where);
  }
  return r;
}
