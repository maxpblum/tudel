import { describe, expect, test } from 'vitest';
import { failures, gate, VARIANTS, workspace } from './helpers.js';

const V = `${VARIANTS}/fx.tone.v02.yaml`;

describe('L5 equivalence', () => {
  test('equivalent alternative passes', async () => {
    expect(gate(await workspace().verify({ gates: ['L0', 'L5'] }), 'L5').ok).toBe(true);
  });
  test('catches an alternative that sounds different', async () => {
    const ws = workspace();
    ws.edit(V, (s) => s.replace('note("c4 e4 g4 c4 e4 g4")', 'note("c4 e4 g4 c4 e4 a4")'));
    const f = failures(await ws.verify({ gates: ['L0', 'L5'] }), 'L5').join('\n');
    expect(f).toMatch(/solution\[1\] differs from solution\[0\] over 2 cycles/);
    expect(f).toContain('+ [ 5/6 → 1/1 | note:a4 s:square ]');
  });
  test('catches a tempo difference', async () => {
    const ws = workspace();
    ws.edit(V, (s) => s.replace('      note("c4 e4 g4 c4 e4 g4")', '      setcpm(40)\n      note("c4 e4 g4 c4 e4 g4")'));
    expect(failures(await ws.verify({ gates: ['L0', 'L5'] }), 'L5').join('\n')).toMatch(/- cps 0.5[\s\S]*\+ cps 0.6/);
  });
  test('equivalent_solutions: false allows different alternatives', async () => {
    const ws = workspace();
    ws.edit(V, (s) => s.replace('note("c4 e4 g4 c4 e4 g4")', 'note("c4 e4 g4 c4 e4 a4")').replace('verify:\n  cycles: 2', 'verify:\n  cycles: 2\n  equivalent_solutions: false'));
    expect(gate(await ws.verify({ gates: ['L0', 'L5'] }), 'L5').ok).toBe(true);
  });
});
