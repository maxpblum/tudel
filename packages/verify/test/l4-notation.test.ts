import { describe, expect, test } from 'vitest';
import { compareEvents, parseAbc } from '../src/gates/l4-notation.js';
import { failures, gate, VARIANTS, workspace } from './helpers.js';

const V = `${VARIANTS}/fx.tone.v01.yaml`;

describe('abc parsing', () => {
  test('applies key signature, accidentals and ties; whole note = 1', () => {
    const p = parseAbc('X:1\nM:4/4\nL:1/4\nK:G\nF ^c c- c|');
    expect(p.ok).toBe(true);
    expect(p.tracks[0]).toEqual([
      { pitch: 66, onset: 0, duration: 0.25 },
      { pitch: 73, onset: 0.25, duration: 0.25 },
      { pitch: 73, onset: 0.5, duration: 0.5 },
    ]);
    expect(p.length).toBe(1);
  });
  test('length rounds up to whole bars (trailing rests count)', () => {
    expect(parseAbc('X:1\nM:4/4\nL:1/4\nK:C\nC D z z|C4|').length).toBe(2);
  });
  test('compareEvents reports mismatches per field', () => {
    const a = [{ pitch: 60, onset: 0, duration: 0.5 }];
    expect(compareEvents(a, [{ pitch: 61, onset: 0, duration: 0.5 }], ['pitch', 'onset', 'duration'])[0]).toMatch(/pitch differ/);
    expect(compareEvents(a, [{ pitch: 61, onset: 0, duration: 0.5 }], ['onset', 'duration'])).toEqual([]);
  });
});

describe('L4 notation agreement', () => {
  const cases: [string, (s: string) => string, RegExp][] = [
    ['wrong pitch in the solution', (s) => s.replace('note("c4 d4 e4 g4")', 'note("c4 d4 e4 a4")'), /#4: notation onset 0.75, pitch 67, dur 0.25 vs solution onset 0.75, pitch 69, dur 0.25 \(pitch differ\)/],
    ['wrong octave', (s) => s.replace('note("c4 d4 e4 g4")', 'note("c3 d3 e3 g3")'), /pitch differ/],
    ['wrong rhythm', (s) => s.replace('note("c4 d4 e4 g4")', 'note("c4 d4 e4@2 g4")'), /differ/],
    ['wrong note in the notation', (s) => s.replace('  C D E G|', '  C D F G|'), /#3: .*pitch 65.*pitch 64/],
    ['key signature changes the pitch', (s) => s.replace('  K:C', '  K:D'), /pitch differ/],
    ['notation longer than verify.cycles', (s) => s.replace('  C D E G|', '  C D E G|C D E G|'), /2 bar\(s\) long but verify.cycles is 1/],
    ['missing voice', (s) => s.replace('voice: 0', 'voice: 1'), /voice 1 does not exist/],
    ['unparseable abc', (s) => s.replace('  C D E G|', '  C D }E G|'), /abcjs warning/],
  ];
  for (const [name, edit, re] of cases) {
    test(`catches: ${name}`, async () => {
      const ws = workspace();
      ws.edit(V, edit);
      const o = await ws.verify({ gates: ['L0', 'L4'] });
      expect(failures(o, 'L4').join('\n')).toMatch(re);
    });
  }
  test('the reference must loop the notation over all verify cycles', async () => {
    const ws = workspace();
    ws.edit(V, (s) => s.replace('note("c4 d4 e4 g4")', 'note("<[c4 d4 e4 g4] [c4 d4 e4 a4]>")').replace('cycles: 1', 'cycles: 2'));
    expect(failures(await ws.verify({ gates: ['L0', 'L4'] }), 'L4').join('\n')).toMatch(/1-bar notation repeated over 2 cycles[\s\S]*#8: notation onset 1.75, pitch 67, dur 0.25 vs solution onset 1.75, pitch 69/);
    ws.edit(V, (s) => s.replace('[c4 d4 e4 a4]', '[c4 d4 e4 g4]'));
    expect(gate(await ws.verify({ gates: ['L0', 'L4'] }), 'L4').ok).toBe(true);
  });
  test('abc without abc_agreement is not silently unchecked', async () => {
    const ws = workspace();
    ws.edit(`${VARIANTS}/fx.tone.v03.yaml`, (s) => s.replace('solutions:', 'abc: "X:1\\nK:C\\nC|"\nsolutions:'));
    expect(failures(await ws.verify({ gates: ['L0', 'L4'] }), 'L4').join('\n')).toMatch(/abc_agreement is null/);
  });
  test('only_sounds ignores other layers; compare can skip pitch (rhythm-only)', async () => {
    const ws = workspace();
    ws.edit(V, (s) =>
      s
        .replace('note("c4 d4 e4 g4").s("triangle")', '$: note("c4 d4 e4 g4").s("triangle")\n      $: note("c3").s("sawtooth")')
        .replace('abc_agreement: { voice: 0, compare: [pitch, onset, duration] }', 'abc_agreement: { voice: 0, compare: [pitch, onset, duration], only_sounds: [triangle] }'),
    );
    expect(gate(await ws.verify({ gates: ['L0', 'L4'] }), 'L4').ok).toBe(true);
    ws.edit(V, (s) => s.replace(', only_sounds: [triangle]', ''));
    expect(failures(await ws.verify({ gates: ['L0', 'L4'] }), 'L4').join('\n')).toMatch(/notation has 4 notes but the solution has 5/);
  });
  test('lesson abc blocks must parse cleanly', async () => {
    const ws = workspace();
    ws.edit('units/fx/lessons/tone.md', (s) => s.replace('C D E G|\n:::', 'C D }E G|\n:::'));
    expect(failures(await ws.verify({ gates: ['L0', 'L4'] }), 'L4').join('\n')).toMatch(/fx.tone.lesson: abcjs warning/);
  });
});
