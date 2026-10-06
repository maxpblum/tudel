import { describe, expect, test } from 'vitest';
import { analyzeCode } from '../src/code/ast.js';
import { gateL2 } from '../src/gates/l2-vocabulary.js';
import type { Snippet } from '../src/content/snippets.js';
import { REPO, testRef } from './helpers.js';

const snip = (code: string): Snippet => ({ owner: 'x.v01', ownerKind: 'variant', key: 'solution[0]', role: 'solution', code, antipattern: false, styleExempt: false, cycles: 1, where: 'x.yaml' });
const run = (code: string) => gateL2([snip(code)], [], testRef(), REPO);
const fails = (code: string) => run(code).failures.filter((f) => f.item !== 'allowlist').map((f) => f.message);

describe('code analysis', () => {
  test('collects free identifiers and called methods, not declared names or properties', () => {
    const a = analyzeCode('const x = 2\n$: note("c3").s("sawtooth").every(x, (p) => p.rev())\nlet o = { lpf: 1 }\no.lpf');
    expect(a.refs.map((r) => `${r.kind}:${r.name}`)).toEqual(['ident:note', 'method:s', 'method:every', 'method:rev']);
  });
  test('collects literal s()/sound()/bank() arguments', () => {
    const a = analyzeCode('s("bd sd").bank("RolandTR808")\nnote("c3").sound(`saw`)\nnote("c3").s(x)');
    expect(a.soundArgs.map((s) => `${s.fn}:${s.value}`)).toEqual(['s:bd sd', 'bank:RolandTR808', 'sound:saw', 's:null']);
  });
});

describe('L2 vocabulary', () => {
  test('accepts documented names, synonyms, `$:` labels, locals and the allowlisted `p`', () => {
    expect(fails('setcpm(30)\n$: note("c3").sound("sawtooth").cutoff(800).p("lead")\nconst f = (x) => x.slow(2)\nf(s("bd"))')).toEqual([]);
  });
  test('catches undocumented methods even if they would evaluate', () => {
    // `piano` is defined by strudel.cc's website prebake, not by the packages: not documented.
    expect(fails('note("c3").piano()')).toEqual([expect.stringMatching(/method .piano\(\) at 1:12 is not in the pinned doc.json/)]);
  });
  test('catches unknown functions and identifiers', () => {
    expect(fails('lfp(800)')).toEqual([expect.stringMatching(/function lfp\(\)/)]);
    expect(fails('note("c3").lpf(cutof)')).toEqual([expect.stringMatching(/identifier cutof/)]);
  });
  test('hints when a sound name is used as a function', () => {
    expect(fails('note("c3").sawtooth()')[0]).toMatch(/is a sound name: use s\("sawtooth"\)/);
  });
  test('internal doc.json entries (DoughVoice members) are not user vocabulary', () => {
    expect(fails('note("c3").psustain(1)')).toHaveLength(1);
  });
  test('registered functions may be called as methods', () => {
    expect(fails('register("twice", (pat) => pat.fast(2))\nnote("c3").twice()')).toEqual([]);
  });
  test('skill vocabulary must be primary doc.json names', () => {
    const skill = (vocabulary: string[]) => ({ id: 'x', unit: 'u', title: 't', prereqs: [], summary: '', vocabulary, lesson: 'l', idiom_note: '' });
    const r = gateL2([], [skill(['lpf', 'cutoff', 'sawtooth', 'nonsense'])], testRef(), REPO);
    expect(r.failures.map((f) => f.message)).toEqual([
      'vocabulary "cutoff" is a synonym; list the primary name "lpf"',
      'vocabulary "sawtooth" is not in the pinned doc.json (it is a sound name, not a function; list "s" instead)',
      'vocabulary "nonsense" is not in the pinned doc.json',
    ]);
  });
  test('allowlist entries must cite an existing ADR', () => {
    const ref = { ...testRef(), allowlist: new Map([['zz', { name: 'zz', adr: 'docs/decisions/9999-nope.md', reason: '' }], ['yy', { name: 'yy', adr: 'notes.txt', reason: '' }]]) };
    const r = gateL2([], [], ref, REPO);
    expect(r.failures.map((f) => f.message)).toEqual([expect.stringMatching(/9999-nope.md, which does not exist/), expect.stringMatching(/must cite an ADR path/)]);
  });
  test('the real allowlist is valid', () => {
    expect(run('note("c3")').failures).toEqual([]);
  });
});
