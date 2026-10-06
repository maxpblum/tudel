/**
 * Runs all gates over a content directory and, if everything passes, compiles the bundle.
 * The CLI (bin/verify.ts) is a thin wrapper around `runVerify`; tests call it directly.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Bundle } from '@tutor/content-schema';
import { loadContent } from './content/load.js';
import { collectSnippets } from './content/snippets.js';
import type { ValidContent } from './content/model.js';
import { RunCache } from './harness/evaluate.js';
import { loadReference, type Reference } from './ref/reference.js';
import { gateL0 } from './gates/l0-schema.js';
import { gateL1 } from './gates/l1-evaluate.js';
import { gateL2 } from './gates/l2-vocabulary.js';
import { gateL2b } from './gates/l2b-sounds.js';
import { gateL3 } from './gates/l3-snapshots.js';
import { gateL4 } from './gates/l4-notation.js';
import { gateL5 } from './gates/l5-equivalence.js';
import { gateL7 } from './gates/l7-style.js';
import { gateL8 } from './gates/l8-prose.js';
import { buildBundle, serializeBundle } from './compile/bundle.js';
import type { GateId, GateResult } from './gates/result.js';

export interface VerifyOptions {
  contentDir: string;
  snapshotDir: string;
  /** Where to write the bundle on success; null = don't write. */
  bundleOut: string | null;
  refDir: string;
  repoRoot: string;
  allowlistPath: string;
  /** Override the pinned clone location (tests). */
  srcRoot?: string;
  update?: boolean;
  /** Restrict to these gates (drift job runs L1-L5 + L8). Default: all. */
  gates?: GateId[];
}

export interface VerifyOutcome {
  ok: boolean;
  results: GateResult[];
  content: ValidContent;
  bundle?: Bundle;
  bundleWritten?: string;
}

export function defaultOptions(repoRoot: string): VerifyOptions {
  const pkg = path.join(repoRoot, 'packages', 'verify');
  return {
    contentDir: path.join(repoRoot, 'content'),
    snapshotDir: path.join(pkg, '__snapshots__'),
    bundleOut: path.join(repoRoot, 'apps', 'web', 'src', 'content', 'bundle.json'),
    refDir: path.join(repoRoot, 'tools', 'strudel-ref'),
    repoRoot,
    allowlistPath: path.join(pkg, 'src', 'gates', 'allowlist.json'),
  };
}

export async function runVerify(o: VerifyOptions, ref?: Reference): Promise<VerifyOutcome> {
  ref ??= loadReference({ refDir: o.refDir, repoRoot: o.repoRoot, allowlistPath: o.allowlistPath, srcRoot: o.srcRoot });
  const want = (g: GateId) => !o.gates || o.gates.includes(g);
  const raw = loadContent(o.contentDir);
  const l0 = gateL0(raw);
  const content = l0.content;
  const results: GateResult[] = [];
  if (want('L0')) results.push(l0.result);
  const snippets = collectSnippets(content);
  const cache = new RunCache();
  if (want('L1')) results.push(await gateL1(snippets, cache));
  if (want('L2')) results.push(gateL2(snippets, content.skills, ref, o.repoRoot));
  if (want('L2b')) results.push(await gateL2b(snippets, cache, ref));
  if (want('L3')) results.push(await gateL3(content, snippets, cache, { dir: o.snapshotDir, update: !!o.update, deleteStale: l0.result.ok }));
  if (want('L4')) results.push(await gateL4(content, cache));
  if (want('L5')) results.push(await gateL5(content, cache));
  if (want('L7')) results.push(await gateL7(snippets, ref));
  if (want('L8')) results.push(gateL8(content, ref));

  const gatesOk = results.every((r) => r.ok) && l0.result.ok;
  const out: VerifyOutcome = { ok: gatesOk, results, content };
  if (want('BUILD')) {
    const { bundle, result } = await buildBundle(content, ref, cache);
    results.push(result);
    out.ok = gatesOk && result.ok;
    out.bundle = bundle;
    if (out.ok && bundle && o.bundleOut) {
      mkdirSync(path.dirname(o.bundleOut), { recursive: true });
      writeFileSync(o.bundleOut, serializeBundle(bundle));
      out.bundleWritten = o.bundleOut;
    }
  }
  return out;
}
