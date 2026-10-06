import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PRETTIER_CONFIG, styleProblems } from '../src/gates/l7-style.js';
import { failures, gate, LESSONS, REPO, VARIANTS, testRef, workspace } from './helpers.js';

const problems = (code: string) => styleProblems(code, testRef());

describe('L7 house style', () => {
  test('prettier config equals the one documented in docs/house-style.md', () => {
    const doc = readFileSync(path.join(REPO, 'docs', 'house-style.md'), 'utf8');
    const m = /```json\n(.*?)\n\s*```/s.exec(doc)!;
    expect(JSON.parse(m[1]!)).toEqual(PRETTIER_CONFIG);
  });
  test('accepts house-style code, including repeated $: labels and backticks', async () => {
    expect(await problems('setcpm(120 / 4)\n$: note("c3 e3").s("sawtooth").lpf(800)\n$: s(`bd sd`)\n')).toEqual([]);
  });
  test('catches unformatted code with a diff', async () => {
    const p = await problems('note("c3").s("sawtooth").lpf(.5)');
    expect(p).toHaveLength(1);
    expect(p[0]).toMatch(/not Prettier-formatted[\s\S]*- note\("c3"\).s\("sawtooth"\).lpf\(.5\)[\s\S]*\+ note\("c3"\).s\("sawtooth"\).lpf\(0.5\)/);
  });
  test('catches single-quoted strings', async () => {
    expect(await problems("note('c3')")).toEqual(expect.arrayContaining([expect.stringMatching(/single-quoted string 'c3' at 1:6/)]));
  });
  test('catches doc.json synonyms', async () => {
    expect(await problems('note("c3").sound("sawtooth").cutoff(800)')).toEqual([
      expect.stringMatching(/"sound" at 1:12 is a synonym; use the primary name "s"/),
      expect.stringMatching(/"cutoff" at 1:30 is a synonym; use the primary name "lpf"/),
    ]);
  });
  test('catches short synth aliases', async () => {
    expect(await problems('note("c3").s("<saw sqr tri sin>")')).toEqual(['saw', 'sqr', 'tri', 'sin'].map((w) => expect.stringMatching(new RegExp(`sound "${w}" .* is a short alias`))));
  });
  test('signal functions sine/saw are fine as identifiers', async () => {
    expect(await problems('note("c3").s("sawtooth").lpf(sine.range(200, 2000).slow(4))')).toEqual([]);
  });
  test('antipattern blocks and refactor starters are exempt (fixture contains both)', async () => {
    const o = await workspace().verify({ gates: ['L0', 'L7'] });
    expect(gate(o, 'L7').ok).toBe(true);
  });
  test('applies to lesson snippets and transform starters', async () => {
    const ws = workspace();
    ws.edit(`${LESSONS}/tone.md`, (s) => s.replace('note("c3 e3").s("triangle")', "note('c3 e3').s(\"triangle\")"));
    ws.edit(`${VARIANTS}/fx.filter.v02.yaml`, (s) => s.replace('starter: |\n  note("c3 e3").s("sawtooth")', 'starter: |\n  note("c3 e3").sound("sawtooth")'));
    const f = failures(await ws.verify({ gates: ['L0', 'L7'] }), 'L7').join('\n');
    expect(f).toMatch(/fx.tone.lesson: .*single-quoted/);
    expect(f).toMatch(/fx.filter.v02: "sound" .* is a synonym/);
  });
});
