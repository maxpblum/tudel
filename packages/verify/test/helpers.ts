/**
 * Test helpers. Gate tests copy the known-good fixture (test/fixtures/good) to a temp dir,
 * break exactly one thing, and assert the right gate fails with the right message.
 */
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultOptions, runVerify, type VerifyOptions, type VerifyOutcome } from '../src/verify.js';
import { loadReference, type Reference } from '../src/ref/reference.js';
import type { GateId } from '../src/gates/result.js';

export const PKG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const REPO = path.resolve(PKG, '..', '..');
export const FIXTURES = path.join(PKG, 'test', 'fixtures');
export const GOOD = path.join(FIXTURES, 'good');
export const GOOD_SNAPS = path.join(FIXTURES, 'good-snapshots');
export const FAKE_SRC = path.join(FIXTURES, 'fake-strudel');

let cachedRef: Reference | undefined;
export function testRef(): Reference {
  const d = defaultOptions(REPO);
  cachedRef ??= loadReference({ refDir: d.refDir, repoRoot: REPO, allowlistPath: d.allowlistPath, srcRoot: FAKE_SRC });
  return cachedRef;
}

export interface Workspace {
  dir: string;
  content: string;
  snaps: string;
  bundle: string;
  read(rel: string): string;
  write(rel: string, text: string): void;
  edit(rel: string, fn: (s: string) => string): void;
  verify(extra?: Partial<VerifyOptions>): Promise<VerifyOutcome>;
}

/** A temp copy of the good fixture and its snapshots. */
export function workspace(): Workspace {
  const dir = mkdtempSync(path.join(tmpdir(), 'tutor-verify-'));
  const content = path.join(dir, 'content');
  const snaps = path.join(dir, 'snaps');
  cpSync(GOOD, content, { recursive: true });
  cpSync(GOOD_SNAPS, snaps, { recursive: true });
  const ws: Workspace = {
    dir,
    content,
    snaps,
    bundle: path.join(dir, 'bundle.json'),
    read: (rel) => readFileSync(path.join(content, rel), 'utf8'),
    write: (rel, text) => writeFileSync(path.join(content, rel), text),
    edit: (rel, fn) => {
      const before = ws.read(rel);
      const after = fn(before);
      if (after === before) throw new Error(`edit of ${rel} changed nothing (bad test)`);
      ws.write(rel, after);
    },
    verify: (extra = {}) =>
      runVerify(
        { ...defaultOptions(REPO), contentDir: content, snapshotDir: snaps, bundleOut: ws.bundle, srcRoot: FAKE_SRC, ...extra },
        extra.srcRoot ? undefined : testRef(),
      ),
  };
  return ws;
}

export function gate(o: VerifyOutcome, id: GateId) {
  const r = o.results.find((x) => x.gate === id);
  if (!r) throw new Error(`gate ${id} did not run`);
  return r;
}

/** All failure messages of a gate, as "item: message" strings. */
export function failures(o: VerifyOutcome, id: GateId): string[] {
  return gate(o, id).failures.map((f) => `${f.item}: ${f.message}`);
}

/** Gates other than `id` that failed (to prove a mutation breaks only what it should). */
export function otherFailingGates(o: VerifyOutcome, id: GateId | GateId[]): GateId[] {
  const ids = Array.isArray(id) ? id : [id];
  return o.results.filter((r) => !r.ok && !ids.includes(r.gate) && r.gate !== 'BUILD').map((r) => r.gate);
}

export const VARIANTS = 'units/fx/exercises';
export const LESSONS = 'units/fx/lessons';
