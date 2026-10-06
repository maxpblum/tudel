import { describe, expect, test } from 'vitest';
import { chordProblem, checkSpan, codeSpans, findCites } from '../src/gates/l8-prose.js';
import { failures, gate, LESSONS, VARIANTS, testRef, workspace } from './helpers.js';
import path from 'node:path';

const span = (s: string) => checkSpan(s, testRef());

describe('L8a inline code spans', () => {
  test('extracts spans', () => expect(codeSpans('a `lpf` b ``x `y` z`` c `s("bd")`')).toEqual(['lpf', 'x `y` z', 's("bd")']));
  test('accepts documented names, calls, chains, sounds, notes and non-code', () => {
    for (const ok of ['lpf', '.lpf(800)', 's("sawtooth")', 'note("c3").s("sawtooth")', 'range(min, max)', 'cutoff', '"sawtooth"', '"c3"', 'c3', '"c3 e3 g3"', '$:', '0.5', 'ADSR envelope', '120 BPM']) expect(span(ok), ok).toBeNull();
  });
  test('catches unknown names', () => {
    expect(span('lfp')).toMatch(/"lfp" is not in the pinned doc.json/);
    expect(span('.lfp(800)')).toMatch(/"lfp"/);
    expect(span('note("c3").sawtooth()')).toMatch(/"sawtooth".*a sound name/);
    expect(span('sawtooth')).toMatch(/a sound name: write `"sawtooth"`/);
  });
  test('catches quoted words that are not sounds', () => {
    expect(span('"sawtoth"')).toMatch(/not a registered sound name/);
  });
});

describe('L8b citations', () => {
  test('parses cites', () => {
    expect(findCites('x {cite doc=lpf} y {cite src="packages/a.mjs#L3-L9"} {cite src="b.mjs#L4"} {cite foo}')).toEqual([
      { doc: 'lpf', raw: '{cite doc=lpf}' },
      { src: { file: 'packages/a.mjs', from: 3, to: 9 }, raw: '{cite src="packages/a.mjs#L3-L9"}' },
      { src: { file: 'b.mjs', from: 4, to: 4 }, raw: '{cite src="b.mjs#L4"}' },
      { raw: '{cite foo}', error: expect.stringMatching(/malformed/) },
    ]);
  });
  const L = `${LESSONS}/tone.md`;
  const cases: [string, (s: string) => string, RegExp][] = [
    ['unknown doc cite', (s) => s.replace('{cite doc=note}', '{cite doc=nota}'), /"nota" is not a primary doc.json name/],
    ['synonym doc cite', (s) => s.replace('{cite doc=note}', '{cite doc=cutoff}'), /synonym of "lpf"/],
    ['line range past end of file', (s) => s.replace('#L2-L4', '#L2-L40'), /has 6 lines; L2-L40 is out of range/],
    ['missing source file', (s) => s.replace('packages/core/demo.mjs', 'packages/core/nope.mjs'), /does not exist in the pinned clone/],
    ['path escaping the clone', (s) => s.replace('packages/core/demo.mjs', '../demo.mjs'), /must be relative to the Strudel repo root/],
    ['malformed cite', (s) => s.replace('{cite doc=note}', '{cite note}'), /malformed citation/],
    ['bad inline code span', (s) => s.replace('`note` says', '`nota` says'), /\(a\) `nota`/],
    ['bad span inside a bridge', (s) => s.replace('`s` picks', '`ss` picks'), /\(a\) `ss`/],
    ['bad span in a directive label', (s) => s.replace('label="Sawtooth"', 'label="`saww`"'), /\(a\) `saww`/],
  ];
  for (const [name, edit, re] of cases) {
    test(`catches: ${name}`, async () => {
      const ws = workspace();
      ws.edit(L, edit);
      const o = await ws.verify({ gates: ['L0', 'L8'] });
      expect(failures(o, 'L8').join('\n')).toMatch(re);
    });
  }
  test('variant sources are checked', async () => {
    const ws = workspace();
    ws.edit(`${VARIANTS}/fx.tone.v02.yaml`, (s) => s.replace('demo.mjs#L1', 'demo.mjs#L99').replace('lexicon: warm', 'lexicon: toasty').replace('url: https://strudel.cc/workshop/', 'url: strudel.cc'));
    ws.edit(`${VARIANTS}/fx.tone.v01.yaml`, (s) => s.replace('strudel-doc: note', 'strudel-doc: notes'));
    const f = failures(await ws.verify({ gates: ['L0', 'L8'] }), 'L8').join('\n');
    expect(f).toMatch(/strudel-src "packages\/core\/demo.mjs#L99": .*out of range/);
    expect(f).toMatch(/lexicon "toasty" is not a term/);
    expect(f).toMatch(/url "strudel.cc" is not an http/);
    expect(f).toMatch(/strudel-doc "notes"/);
  });
  test('prompts, listen_for, skills and the lexicon are checked', async () => {
    const ws = workspace();
    ws.edit(`${VARIANTS}/fx.tone.v01.yaml`, (s) => s.replace('listen_for: ["Four even notes"]', 'listen_for: ["Four even `notes`"]').replace('on a `"triangle"` wave', 'on a `"triangel"` wave'));
    ws.edit('skills.yaml', (s) => s.replace('with `.lpf(800)`', 'with `.lpff(800)`'));
    ws.edit('glossary/timbre-lexicon.yaml', (s) => s.replace('Raise `lpf`', 'Raise `lpfx`'));
    const f = failures(await ws.verify({ gates: ['L0', 'L8'] }), 'L8').join('\n');
    expect(f).toMatch(/fx.tone.v01: \(a\) `notes`/);
    expect(f).toMatch(/fx.tone.v01: \(a\) `"triangel"`/);
    expect(f).toMatch(/fx.filter: \(a\) `.lpff\(800\)`/);
    expect(f).toMatch(/lexicon: \(a\) `lpfx`/);
  });
  test('a missing clone fails with setup instructions (only when src cites exist)', async () => {
    const ws = workspace();
    const o = await ws.verify({ gates: ['L0', 'L8'], srcRoot: path.join(ws.dir, 'no-clone') });
    expect(failures(o, 'L8').join('\n')).toMatch(/pinned Strudel clone is missing .* Run `pnpm strudel-ref`/);
  });
});

describe('L8c chord symbols and L8d lexicon', () => {
  test('tonal spelling', () => {
    expect(chordProblem('Csus4', ['C', 'F', 'G'])).toBeNull();
    expect(chordProblem('Csus4', ['C', 'E', 'G'])).toMatch(/spelled C F G/);
    expect(chordProblem('Ebmaj7', ['Eb', 'G', 'Bb', 'D'])).toBeNull();
    expect(chordProblem('Ebmaj7', ['D#', 'G', 'A#', 'D'])).toMatch(/spelled Eb G Bb D/);
    expect(chordProblem('Cfoo', ['C'])).toMatch(/doesn't recognize/);
  });
  test('chord-symbols.yaml entries are checked', async () => {
    const ws = workspace();
    ws.edit('glossary/chord-symbols.yaml', (s) => s.replace('tones: [C, E, G, B]', 'tones: [C, E, G, Bb]'));
    expect(failures(await ws.verify({ gates: ['L0', 'L8'] }), 'L8').join('\n')).toMatch(/"Cmaj7" is spelled C E G B/);
  });
  test('lexicon entries report sources and confidence', async () => {
    const o = await workspace().verify({ gates: ['L0', 'L8'] });
    expect(gate(o, 'L8').entries.filter((e) => e.message.startsWith('(d)')).map((e) => e.message)).toEqual([
      '(d) "warm": 1 source(s), confidence medium, canonical',
      '(d) "bright": 1 source(s), confidence high, canonical',
    ]);
  });
});
