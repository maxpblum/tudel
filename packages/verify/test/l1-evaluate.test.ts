import { describe, expect, test } from 'vitest';
import { RunCache, runSnippet } from '../src/harness/evaluate.js';
import { failures, LESSONS, otherFailingGates, VARIANTS, workspace } from './helpers.js';

describe('harness', () => {
  test('evaluates labeled parts and setcpm like the repl', async () => {
    const r = await runSnippet('setcpm(120 / 4)\n$: note("c3 e3").s("sawtooth")\n$: s("bd")', 1);
    expect(r.ok).toBe(true);
    expect(r.cps).toBe(0.5);
    expect(r.shows).toEqual(['[ 0/1 → 1/2 | note:c3 s:sawtooth ]', '[ 0/1 → 1/1 | s:bd ]', '[ 1/2 → 1/1 | note:e3 s:sawtooth ]']);
    expect((await runSnippet('setcpm(60)\nnote("c3")', 1)).cps).toBe(1);
  });
  test('fresh repl per evaluation: tempo does not leak', async () => {
    await runSnippet('setcpm(90)\nnote("c3")', 1);
    expect((await runSnippet('note("c3")', 1)).cps).toBe(0.5);
  });
  test('cache returns the same run for the same code and cycles', async () => {
    const c = new RunCache();
    expect(await c.run('note("c3")', 1)).toBe(await c.run('note("c3")', 1));
  });
});

describe('L1 evaluate', () => {
  const cases: [string, string, RegExp][] = [
    ['unknown method', 'note("c3").s("sawtooth").lfp(800)', /evaluation failed: .*lfp/],
    ['JavaScript syntax error', 'note("c3").s("sawtooth"', /evaluation failed/],
    ['mini-notation parse error', 'note("c3 [e3").s("sawtooth")', /evaluation failed: .*mini/],
    ['no events', 'silence', /produces no events/],
    ['bare string pattern (makes no sound)', '"c3 e3"', /not a control object/],
    ['no pattern at all', 'setcpm(30)', /evaluation failed|no events/],
    ['register below C3 (inaudible on laptop speakers)', 'note("c3 b2").s("sawtooth")', /MIDI 47, below C3/],
  ];
  for (const [name, code, re] of cases) {
    test(`catches: ${name}`, async () => {
      const ws = workspace();
      ws.edit(`${VARIANTS}/fx.tone.v03.yaml`, (s) => s.replace('  - code: |\n      note("c3").s("sine")', `  - code: |\n      ${code}`));
      const o = await ws.verify({ gates: ['L0', 'L1'] });
      expect(failures(o, 'L1').join('\n')).toMatch(re);
      expect(failures(o, 'L1')[0]).toMatch(/^fx.tone.v03: /);
    });
  }

  test('checks lesson snippets, compare sides, prompt snippets and starters too', async () => {
    const ws = workspace();
    ws.edit(`${LESSONS}/filter.md`, (s) => s.replace('code: note("c3").s("sawtooth").lpf(2000)', 'code: note("c3").s("sawtooth").lpff(2000)'));
    ws.edit(`${VARIANTS}/fx.tone.v03.yaml`, (s) => s.replace('  note("c3").s("sine")\n  :::', '  note("c3").s("sine").nope()\n  :::'));
    ws.edit(`${VARIANTS}/fx.filter.v02.yaml`, (s) => s.replace('starter: |\n  note("c3 e3").s("sawtooth")', 'starter: |\n  note("c3 e3").s("sawtooth").nothere()'));
    const o = await ws.verify({ gates: ['L0', 'L1'] });
    const f = failures(o, 'L1').join('\n');
    expect(f).toMatch(/fx.filter.lesson: evaluation failed: .*lpff/);
    expect(f).toMatch(/fx.tone.v03: evaluation failed: .*nope/);
    expect(f).toMatch(/fx.filter.v02: evaluation failed/);
    expect(gateWhere(o)).toEqual(expect.arrayContaining([expect.stringMatching(/^snippet#0 compare.b/), expect.stringMatching(/^prompt#0 play/), expect.stringMatching(/^starter/)]));
    expect(otherFailingGates(o, ['L1'])).toEqual([]);
  });
});

function gateWhere(o: Awaited<ReturnType<ReturnType<typeof workspace>['verify']>>) {
  return o.results.find((r) => r.gate === 'L1')!.failures.map((f) => f.where ?? '');
}
