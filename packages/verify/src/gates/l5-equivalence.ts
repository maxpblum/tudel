/**
 * Gate L5: when `verify.equivalent_solutions` is true (the default), every accepted solution
 * must produce exactly the same L3 output (haps formatted with `hap.show(true)`, and cps) as
 * the canonical solution over `verify.cycles`.
 */
import type { ValidContent } from '../content/model.js';
import type { RunCache } from '../harness/evaluate.js';
import { lineDiff } from '../util/diff.js';
import { GateResult } from './result.js';

export async function gateL5(content: ValidContent, cache: RunCache): Promise<GateResult> {
  const r = new GateResult('L5');
  for (const { v } of content.variants) {
    if (v.solutions.length < 2) continue;
    if (!v.verify.equivalent_solutions) {
      r.pass(v.id, 'solutions are declared non-equivalent (verify.equivalent_solutions: false)');
      continue;
    }
    const canon = await cache.run(v.solutions[0]!.code, v.verify.cycles);
    if (!canon.ok) {
      r.fail(v.id, 'canonical solution does not evaluate (see L1)');
      continue;
    }
    const lines = (run: typeof canon) => [`cps ${run.cps}`, ...run.shows];
    for (let i = 1; i < v.solutions.length; i++) {
      const alt = await cache.run(v.solutions[i]!.code, v.verify.cycles);
      if (!alt.ok) r.fail(v.id, `solution[${i}] does not evaluate (see L1)`);
      else if (lines(alt).join('\n') !== lines(canon).join('\n'))
        r.fail(v.id, `solution[${i}] differs from solution[0] over ${v.verify.cycles} cycles (- solution[0], + solution[${i}]):\n${lineDiff(lines(canon), lines(alt))}`);
      else r.pass(v.id, `solution[${i}] is equivalent to solution[0]`);
    }
  }
  return r;
}
