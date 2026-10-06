import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { Bundle } from '@tutor/content-schema';
import { failures, gate, LESSONS, VARIANTS, workspace } from './helpers.js';

describe('compiler', () => {
  test('writes a schema-valid, deterministic bundle', async () => {
    const ws = workspace();
    const o = await ws.verify();
    expect(o.ok).toBe(true);
    const text = readFileSync(ws.bundle, 'utf8');
    const b = Bundle.parse(JSON.parse(text));
    expect(b.schemaVersion).toBe(1);
    expect(b.strudel.commit).toMatch(/^f610965f/);
    expect(b.contentHash).toMatch(/^[0-9a-f]{64}$/);
    // byte-identical across runs (fresh workspace, same content)
    const ws2 = workspace();
    await ws2.verify();
    expect(readFileSync(ws2.bundle, 'utf8')).toBe(text);
  });

  test('content hash changes when any source file changes', async () => {
    const a = (await workspace().verify()).bundle!.contentHash;
    const ws = workspace();
    ws.edit('glossary/timbre-lexicon.yaml', (s) => s.replace('slower attack', 'slow attack'));
    expect((await ws.verify()).bundle!.contentHash).not.toBe(a);
  });

  test('lesson blocks, in order, with every directive kind', async () => {
    const b = (await workspace().verify()).bundle!;
    const tone = b.lessons.find((l) => l.id === 'fx.tone.lesson')!;
    expect(tone.blocks.map((x) => x.kind)).toEqual(['html', 'play', 'play', 'code', 'code', 'abc', 'diagram', 'bridge']);
    const filter = b.lessons.find((l) => l.id === 'fx.filter.lesson')!;
    expect(filter.blocks.map((x) => x.kind)).toEqual(['html', 'compare', 'filter', 'envelope', 'signal', 'html']);
    const [play1, play2] = tone.blocks.filter((x) => x.kind === 'play') as any[];
    expect(play1).toMatchObject({ label: 'Sawtooth', showCode: true, snippet: { code: 'note("c3 e3 g3").s("sawtooth")', needsNetwork: false } });
    expect(play2.showCode).toBe(false);
    expect(play1.snippet.html).toMatch(/^<pre class="shiki shiki-themes github-light github-dark"/);
    expect(play1.snippet.html).toContain('--shiki-dark:');
    expect(filter.blocks[2]).toEqual({ kind: 'filter', type: 'lowpass', cutoff: 800, q: 10 });
    expect(filter.blocks[3]).toEqual({ kind: 'envelope', attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.3, hold: 0.5 });
    expect(filter.blocks[4]).toEqual({ kind: 'signal', shape: 'sine', min: 200, max: 2000, period: 4, cycles: 4, label: 'lpf' });
    expect(filter.blocks[1]).toMatchObject({ kind: 'compare', diff: 'lpf 400 → 2000', a: { label: 'Cutoff 400 Hz' }, b: { label: 'Cutoff 2000 Hz', snippet: { code: 'note("c2").s("sawtooth").lpf(2000)' } } });
    expect((filter.blocks[5] as any).html).toContain('<table>');
    const diagram = tone.blocks.find((x) => x.kind === 'diagram') as any;
    expect(diagram.svg).toMatch(/^<svg/);
    expect(diagram.svg).not.toMatch(/<\?xml|DOCTYPE|<!--/);
  });

  test('citations render as numbered superscripts linking to the reference or pinned source', async () => {
    const b = (await workspace().verify()).bundle!;
    const tone = b.lessons.find((l) => l.id === 'fx.tone.lesson')!;
    const html = (tone.blocks[0] as any).html as string;
    expect(html).toContain('<sup class="cite"><a href="https://strudel.cc/reference/" title="Strudel reference: note"');
    expect(html).toContain('>[1]</a></sup>');
    const bridge = tone.blocks.find((x) => x.kind === 'bridge') as any;
    expect(bridge.title).toBe('From the organ loft');
    expect(bridge.blocks[0].html).toContain('href="https://codeberg.org/uzu/strudel/src/commit/f610965f4332837febe45743105da170e8b331ed/packages/core/demo.mjs#L2-L4"');
    expect(bridge.blocks[0].html).toContain('>[2]</a>');
    expect(tone.text).toContain('A stop is a timbre; s picks the stop.');
    expect(tone.text).not.toContain('cite');
  });

  test('variants: prompt blocks, solutions, starter, roll, skills pools', async () => {
    const b = (await workspace().verify()).bundle!;
    const v1 = b.variants.find((v) => v.id === 'fx.tone.v01')!;
    expect(v1.roll).toEqual([
      { b: 0, e: 0.25, midi: 60, s: 'triangle' },
      { b: 0.25, e: 0.5, midi: 62, s: 'triangle' },
      { b: 0.5, e: 0.75, midi: 64, s: 'triangle' },
      { b: 0.75, e: 1, midi: 67, s: 'triangle' },
    ]);
    expect(v1.abc).toContain('C D E G|');
    expect(v1.cycles).toBe(1);
    const v2 = b.variants.find((v) => v.id === 'fx.tone.v02')!;
    expect(v2.solutions.map((s) => s.note ?? null)).toEqual([null, 'Writing it out gives the same events; `*2` reads better.']);
    expect(b.variants.find((v) => v.id === 'fx.filter.v02')!.starter!.code).toBe('note("c3 e3").s("sawtooth")');
    const v3 = b.variants.find((v) => v.id === 'fx.tone.v03')!;
    expect(v3.prompt.map((x) => x.kind)).toEqual(['html', 'play']);
    expect(b.skills.find((s) => s.id === 'fx.tone')!.variants).toEqual(['fx.tone.v01', 'fx.tone.v02', 'fx.tone.v03', 'fx.filter.v01']); // primary first, then secondary
    expect(b.variants.map((v) => v.id)).toEqual([...b.variants.map((v) => v.id)].sort());
  });

  test('needsNetwork is set for sample-bank snippets', async () => {
    const ws = workspace();
    ws.edit(`${LESSONS}/tone.md`, (s) => s.replace('note("c3 e3").s("triangle")', 'note("c3 e3").s("piano")'));
    const o = await ws.verify({ update: true });
    const code = o.bundle!.lessons.find((l) => l.id === 'fx.tone.lesson')!.blocks.find((x) => x.kind === 'code') as any;
    expect(code.snippet.needsNetwork).toBe(true);
  });

  test('a Graphviz error fails the build and no bundle is written', async () => {
    const ws = workspace();
    ws.edit(`${LESSONS}/tone.md`, (s) => s.replace('digraph { osc -> out }', 'digraph { osc -> }'));
    const o = await ws.verify();
    expect(failures(o, 'BUILD').join('\n')).toMatch(/fx.tone.lesson: :::diagram: Graphviz error/);
    expect(o.bundleWritten).toBeUndefined();
  });

  test('no bundle is written when any gate fails', async () => {
    const ws = workspace();
    ws.edit(`${VARIANTS}/fx.tone.v02.yaml`, (s) => s.replace('note("c4 e4 g4 c4 e4 g4")', 'note("c4 e4 g4 c4 e4 a4")'));
    const o = await ws.verify();
    expect(gate(o, 'L5').ok).toBe(false);
    expect(o.ok).toBe(false);
    expect(o.bundleWritten).toBeUndefined();
  });
});
