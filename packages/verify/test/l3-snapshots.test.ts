import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { failures, gate, LESSONS, VARIANTS, workspace } from './helpers.js';

describe('L3 snapshots', () => {
  test('committed fixture snapshots match', async () => {
    const o = await workspace().verify({ gates: ['L0', 'L3'] });
    expect(gate(o, 'L3').ok).toBe(true);
  });
  test('a changed solution fails with a readable diff', async () => {
    const ws = workspace();
    ws.edit(`${VARIANTS}/fx.tone.v01.yaml`, (s) => s.replace('note("c4 d4 e4 g4")', 'note("c4 d4 f4 g4")'));
    const o = await ws.verify({ gates: ['L0', 'L3'] });
    const f = failures(o, 'L3').join('\n');
    expect(f).toMatch(/fx.tone.v01: haps differ from/);
    expect(f).toContain('- [ 1/2 → 3/4 | note:e4 s:triangle ]');
    expect(f).toContain('+ [ 1/2 → 3/4 | note:f4 s:triangle ]');
  });
  test('a tempo change shows up as a cps diff', async () => {
    const ws = workspace();
    ws.edit(`${VARIANTS}/fx.tone.v03.yaml`, (s) => s.replace('  - code: |\n      note("c3").s("sine")', '  - code: |\n      setcpm(60)\n      note("c3").s("sine")'));
    const o = await ws.verify({ gates: ['L0', 'L3'] });
    expect(failures(o, 'L3').join('\n')).toMatch(/cps 1/);
  });
  test('lesson snippets are snapshotted by index', async () => {
    const ws = workspace();
    ws.edit(`${LESSONS}/tone.md`, (s) => s.replace('note("c3 e3").s("triangle")', 'note("c3 e3 g3").s("triangle")'));
    const o = await ws.verify({ gates: ['L0', 'L3'] });
    expect(failures(o, 'L3').join('\n')).toMatch(/fx.tone.lesson: haps differ[\s\S]*## snippet#2 code/);
  });
  test('a missing snapshot fails unless --update, which writes it', async () => {
    const ws = workspace();
    const file = path.join(ws.snaps, 'fx.tone.v02.snap');
    const before = readFileSync(file, 'utf8');
    unlinkSync(file);
    expect(failures(await ws.verify({ gates: ['L0', 'L3'] }), 'L3').join('\n')).toMatch(/fx.tone.v02: snapshot missing/);
    const o = await ws.verify({ gates: ['L0', 'L3'], update: true });
    expect(gate(o, 'L3').ok).toBe(true);
    expect(readFileSync(file, 'utf8')).toBe(before);
  });
  test('stale snapshots fail; --update deletes them', async () => {
    const ws = workspace();
    const stale = path.join(ws.snaps, 'fx.gone.v01.snap');
    writeFileSync(stale, 'old');
    expect(failures(await ws.verify({ gates: ['L0', 'L3'] }), 'L3').join('\n')).toMatch(/stale snapshot fx.gone.v01.snap/);
    await ws.verify({ gates: ['L0', 'L3'], update: true });
    expect(existsSync(stale)).toBe(false);
  });
  test('--update keeps snapshots of items that only failed L0', async () => {
    const ws = workspace();
    ws.edit(`${VARIANTS}/fx.tone.v02.yaml`, (s) => s.replace('difficulty: 1', 'difficulty: 9'));
    await ws.verify({ gates: ['L0', 'L3'], update: true });
    expect(existsSync(path.join(ws.snaps, 'fx.tone.v02.snap'))).toBe(true);
  });
  test('snapshot: false skips the variant', async () => {
    const ws = workspace();
    ws.edit(`${VARIANTS}/fx.tone.v02.yaml`, (s) => s.replace('verify:\n  cycles: 2', 'verify:\n  cycles: 2\n  snapshot: false'));
    unlinkSync(path.join(ws.snaps, 'fx.tone.v02.snap'));
    expect(gate(await ws.verify({ gates: ['L0', 'L3'] }), 'L3').ok).toBe(true);
  });
});
