import { describe, expect, test } from 'vitest';
import { renameSync } from 'node:fs';
import path from 'node:path';
import { strippedKeys } from '../src/gates/l0-schema.js';
import { failures, gate, LESSONS, otherFailingGates, VARIANTS, workspace } from './helpers.js';

const L0 = ['L0'] as const;

describe('L0 schema and skill graph', () => {
  test('the good fixture passes every gate', async () => {
    const o = await workspace().verify();
    expect(o.results.filter((r) => !r.ok).map((r) => `${r.gate}: ${r.failures.map((f) => f.message).join('; ')}`)).toEqual([]);
    expect(o.ok).toBe(true);
  });

  const broken: [string, (ws: ReturnType<typeof workspace>) => void, RegExp][] = [
    ['prerequisite cycle', (ws) => ws.edit('skills.yaml', (s) => s.replace('prereqs: []', 'prereqs: [fx.filter]')), /prerequisite cycle: .*fx\.(tone|filter) -> .* -> fx\.(tone|filter)/],
    ['dangling prerequisite', (ws) => ws.edit('skills.yaml', (s) => s.replace('prereqs: [fx.tone]', 'prereqs: [fx.nope]')), /prerequisite "fx.nope" does not exist/],
    ['self prerequisite', (ws) => ws.edit('skills.yaml', (s) => s.replace('prereqs: [fx.tone]', 'prereqs: [fx.filter]')), /lists itself/],
    ['unknown unit', (ws) => ws.edit('skills.yaml', (s) => s.replace('unit: fx\n    title: Low-pass', 'unit: fy\n    title: Low-pass')), /unit "fy" is not defined/],
    ['missing lesson', (ws) => ws.edit('skills.yaml', (s) => s.replace('lesson: fx.filter.lesson', 'lesson: fx.nope.lesson')), /lesson "fx.nope.lesson" does not exist/],
    ['lesson points at another skill', (ws) => ws.edit(`${LESSONS}/filter.md`, (s) => s.replace('skill: fx.filter', 'skill: fx.tone')), /has skill "fx.tone" in its frontmatter/],
    ['variant skill dangling', (ws) => ws.edit(`${VARIANTS}/fx.filter.v01.yaml`, (s) => s.replace('skills: [fx.filter, fx.tone]', 'skills: [fx.filter, fx.nope]')), /skill "fx.nope" does not exist/],
    ['file name differs from id', (ws) => renameSync(path.join(ws.content, VARIANTS, 'fx.tone.v03.yaml'), path.join(ws.content, VARIANTS, 'fx.tone.v09.yaml')), /file name "fx.tone.v09.yaml" must equal the variant id "fx.tone.v03"/],
    ['id not named after first skill', (ws) => ws.edit(`${VARIANTS}/fx.filter.v01.yaml`, (s) => s.replace('skills: [fx.filter, fx.tone]', 'skills: [fx.tone, fx.filter]')), /must be "<first skill>.vNN"/],
    ['fewer than 3 variants', (ws) => ws.edit(`${VARIANTS}/fx.filter.v03.yaml`, (s) => s.replace('skills: [fx.filter]', 'skills: [fx.tone]').replace('id: fx.filter.v03', 'id: fx.tone.v04')), /fx.filter: has 2 variant\(s\); every skill needs at least 3/],
    ['typo in a field name (would silently default)', (ws) => ws.edit(`${VARIANTS}/fx.tone.v02.yaml`, (s) => s.replace('verify:\n  cycles: 2', 'verify:\n  cycles: 2\n  equivalent_solution: false')), /unknown field "verify.equivalent_solution"/],
    ['typo in skills.yaml', (ws) => ws.edit('skills.yaml', (s) => s.replace('idiom_note: Filter', 'idiom-note: x\n    idiom_note: Filter')), /unknown field "skills\[1\].idiom-note"/],
    ['schema violation', (ws) => ws.edit(`${VARIANTS}/fx.tone.v02.yaml`, (s) => s.replace('difficulty: 1', 'difficulty: 9')), /difficulty/],
    ['dictation without abc', (ws) => ws.edit(`${VARIANTS}/fx.tone.v01.yaml`, (s) => s.replace(/abc: \|[\s\S]*?(?=solutions:)/, '')), /dictation requires abc/],
    ['source with two keys', (ws) => ws.edit(`${VARIANTS}/fx.tone.v01.yaml`, (s) => s.replace('  - strudel-doc: note', '  - strudel-doc: note\n    lexicon: warm')), /exactly one key/],
    ['source with an unknown key', (ws) => ws.edit(`${VARIANTS}/fx.tone.v01.yaml`, (s) => s.replace('  - strudel-doc: note', '  - strudel_doc: note')), /sources/],
    ['duplicate variant id', (ws) => ws.write(`${VARIANTS}/fx.tone.v04.yaml`, ws.read(`${VARIANTS}/fx.tone.v03.yaml`)), /duplicate variant id "fx.tone.v03"/],
    ['invalid directive body', (ws) => ws.edit(`${LESSONS}/filter.md`, (s) => s.replace('cutoff: 800', 'cutoff: high')), /:::filter body is invalid: cutoff/],
    ['filter: too many curves', (ws) => ws.edit(`${LESSONS}/filter.md`, (s) => s.replace('cutoff: 800\nq: 10\n', 'curves:\n' + [1, 2, 3, 4, 5, 6, 7].map((n) => `  - {cutoff: 800, q: ${n}, label: q${n}}\n`).join(''))), /:::filter body is invalid: curves: at most 6 curves/],
    ['filter: missing label with several curves', (ws) => ws.edit(`${LESSONS}/filter.md`, (s) => s.replace('cutoff: 800\nq: 10\n', 'curves:\n  - {cutoff: 800, q: 1, label: a}\n  - {cutoff: 800, q: 10}\n')), /:::filter body is invalid: curves: every curve needs a label/],
    ['filter: curves mixed with cutoff', (ws) => ws.edit(`${LESSONS}/filter.md`, (s) => s.replace('q: 10\n', 'q: 10\ncurves:\n  - {cutoff: 800, q: 1}\n')), /either top-level cutoff\/q or curves/],
    ['broken compare body', (ws) => ws.edit(`${LESSONS}/filter.md`, (s) => s.replace('  label: Cutoff 400 Hz\n', '')), /:::compare body is invalid: a.label/],
    ['bad YAML', (ws) => ws.write(`${VARIANTS}/fx.tone.v03.yaml`, 'id: [unclosed'), /YAML parse error/],
    ['.yml file is not silently skipped', (ws) => ws.write(`${VARIANTS}/fx.tone.v04.yml`, 'id: x'), /use the .yaml extension/],
    ['lesson without frontmatter', (ws) => ws.write(`${LESSONS}/extra.md`, 'Just text'), /missing YAML frontmatter/],
    ['orphan lesson', (ws) => ws.write(`${LESSONS}/extra.md`, '---\nid: fx.extra\ntitle: X\nskill: fx.tone\n---\nText'), /orphan lesson/],
  ];
  for (const [name, mutate, re] of broken) {
    test(`catches: ${name}`, async () => {
      const ws = workspace();
      mutate(ws);
      const o = await ws.verify({ gates: [...L0] });
      expect(o.ok).toBe(false);
      expect(failures(o, 'L0').join('\n')).toMatch(re);
    });
  }

  test('catches a missing lexicon file', async () => {
    const ws = workspace();
    renameSync(path.join(ws.content, 'glossary/timbre-lexicon.yaml'), path.join(ws.content, 'glossary/lexicon.txt'));
    const o = await ws.verify({ gates: ['L0'] });
    expect(failures(o, 'L0').join('\n')).toMatch(/timbre-lexicon.yaml is missing/);
  });

  test('catches a lexicon entry without sources', async () => {
    const ws = workspace();
    ws.edit('glossary/timbre-lexicon.yaml', (s) => s.replace(/    sources:\n      - title: Example source\n        url: https:\/\/example.org\/warm\n/, '    sources: []\n'));
    const o = await ws.verify({ gates: ['L0'] });
    expect(failures(o, 'L0').join('\n')).toMatch(/entries.0.sources/);
  });

  test('strippedKeys finds keys zod dropped, recursively', () => {
    expect(strippedKeys({ a: 1, b: { c: 1, d: 2 }, e: [{ f: 1, g: 1 }] }, { a: 1, b: { c: 1 }, e: [{ f: 1 }] })).toEqual(['b.d', 'e[0].g']);
  });

  test('a broken L0 item does not break unrelated gates', async () => {
    const ws = workspace();
    ws.edit('skills.yaml', (s) => s.replace('prereqs: [fx.tone]', 'prereqs: [fx.nope]'));
    const o = await ws.verify();
    expect(gate(o, 'L0').ok).toBe(false);
    expect(otherFailingGates(o, 'L0')).toEqual([]);
    expect(o.bundleWritten).toBeUndefined();
  });
});
