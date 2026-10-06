import { describe, expect, test } from 'vitest';
import { miniWords } from '../src/code/mini.js';
import { soundUse } from '../src/gates/l2b-sounds.js';
import { runSnippet } from '../src/harness/evaluate.js';
import { testRef } from './helpers.js';

const use = async (code: string, cycles = 1) => soundUse(code, await runSnippet(code, cycles), testRef());

describe('mini-notation words', () => {
  test('uses Strudel’s parser and skips operator arguments and rests', () => {
    expect(miniWords('<sawtooth square>*2').words).toEqual(['sawtooth', 'square']);
    expect(miniWords('bd:3 [sd hh]!2 ~ cp(3,8) sd@3 bd? - _').words).toEqual(['bd', 'sd', 'hh', 'cp', 'sd', 'bd']);
    expect(miniWords('{a b}%4').words).toEqual(['a', 'b']);
    expect(miniWords('a | b').words).toEqual(['a', 'b']);
    expect(miniWords('a, [b c]').words).toEqual(['a', 'b', 'c']);
    expect(miniWords('[a').ok).toBe(false);
  });
});

describe('L2b sound names', () => {
  test('registered synths pass and need no network', async () => {
    const u = await use('note("c3").s("<sawtooth square triangle sine supersaw>")');
    expect(u.problems).toEqual([]);
    expect(u.needsNetwork).toBe(false);
  });
  test('default sound (no s) is triangle', async () => {
    expect((await use('note("c3")')).sounds).toEqual(new Set(['triangle']));
  });
  test('catches a misspelled sound', async () => {
    expect((await use('note("c3").s("sawtoth")')).problems).toEqual(expect.arrayContaining([expect.stringMatching(/sound "sawtoth" \(at 1:14\) is not registered/)]));
  });
  test('catches a bad name in an alternation the queried cycles never reach (static check)', async () => {
    const u = await use('note("c3").s("<sawtooth square triangle nope>")', 1);
    expect(u.problems).toEqual([expect.stringMatching(/sound "nope"/)]);
  });
  test('catches a bad sound computed at runtime (dynamic check)', async () => {
    const u = await use('note("c3").s(cat("sawtooth", "nope"))', 2);
    expect(u.problems).toEqual(expect.arrayContaining([expect.stringMatching(/hap plays sound "nope"/)]));
  });
  test('samples and banks need the network; bank+sound combine like superdough', async () => {
    const bd = await use('s("bd sd")');
    expect(bd.problems).toEqual([]);
    expect(bd.needsNetwork).toBe(true);
    const tr = await use('s("bd").bank("RolandTR808")');
    expect(tr.problems).toEqual([]);
    expect(tr.sounds.has('rolandtr808_bd')).toBe(true);
    expect((await use('s("bd").bank("NoSuchMachine")')).problems).toEqual(expect.arrayContaining([expect.stringMatching(/bank "NoSuchMachine"/)]));
  });
  test('soundfonts are registered and need the network', async () => {
    const u = await use('note("c3").s("gm_piano")');
    expect(u.problems).toEqual([]);
    expect(u.needsNetwork).toBe(true);
  });
});
