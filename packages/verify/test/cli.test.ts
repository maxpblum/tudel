/**
 * End-to-end: the esbuild-bundled CLI, exactly as `pnpm verify` runs it.
 */
import { describe, expect, test } from 'vitest';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { FAKE_SRC, PKG, VARIANTS, workspace } from './helpers.js';

function cli(args: string[]) {
  const r = spawnSync(process.execPath, [path.join(PKG, 'scripts', 'run.mjs'), 'verify', ...args], { cwd: PKG, encoding: 'utf8', env: { ...process.env, INIT_CWD: PKG } });
  return { code: r.status, out: r.stdout + r.stderr };
}

describe('verify CLI', () => {
  test('passes on good content and writes the bundle', () => {
    const ws = workspace();
    const r = cli(['--content', ws.content, '--snapshots', ws.snaps, '--src-root', FAKE_SRC, '--out', ws.bundle]);
    expect(r.out).toContain('verify passed: all gates green');
    expect(r.code).toBe(0);
    expect(existsSync(ws.bundle)).toBe(true);
  });
  test('fails with a per-item report and non-zero exit; no bundle', () => {
    const ws = workspace();
    ws.edit(`${VARIANTS}/fx.tone.v02.yaml`, (s) => s.replace('.s("square")\n  - code', '.s("squaer")\n  - code'));
    const r = cli(['--content', ws.content, '--snapshots', ws.snaps, '--src-root', FAKE_SRC, '--out', ws.bundle]);
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/FAIL  L2b .*\n\s+x fx.tone.v02 \[solution\[0\]/);
    expect(r.out).toContain('bundle NOT written (gates failed)');
    expect(existsSync(ws.bundle)).toBe(false);
  });
  test('--explain prints every gate for one item', () => {
    const ws = workspace();
    const r = cli(['--content', ws.content, '--snapshots', ws.snaps, '--src-root', FAKE_SRC, '--explain', 'fx.tone.v01']);
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/PASS  L4 +Notation agreement\n +ok abc voice 0 matches the solution \(4 notes; pitch, onset, duration\)/);
    expect(r.out).toMatch(/----  L5 +Solution equivalence: not applicable/);
  });
  test('--explain of an unknown id exits non-zero', () => {
    const ws = workspace();
    const r = cli(['--content', ws.content, '--snapshots', ws.snaps, '--src-root', FAKE_SRC, '--explain', 'fx.nope']);
    expect(r.code).toBe(1);
    expect(r.out).toContain('No gate checked an item with id "fx.nope"');
  });
  test('usage errors exit 2', () => {
    expect(cli(['--bogus']).code).toBe(2);
    expect(cli(['--gates', 'L9']).code).toBe(2);
  });
});
