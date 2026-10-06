/**
 * `pnpm verify` CLI. Runs gates L0-L5, L7, L8 over content/ and writes the bundle only if
 * every gate passes. Exit code 0 = all green, 1 = a gate failed, 2 = usage/setup error.
 *
 *   pnpm verify                     all gates; writes apps/web/src/content/bundle.json on success
 *   pnpm verify --update            also (re)writes L3 snapshots in packages/verify/__snapshots__/
 *   pnpm verify --explain <id>      per-gate report for one variant or lesson (no bundle written)
 *   --content <dir>                 content root (default: <repo>/content)
 *   --snapshots <dir>               snapshot dir (default: packages/verify/__snapshots__)
 *   --out <file> | --no-bundle      bundle path, or don't write one
 *   --src-root <dir>                pinned Strudel clone (default: tools/strudel-ref/.cache/strudel)
 *   --gates L1,L2,...               only run these gates (and don't write a bundle)
 *
 * Relative paths are resolved against the directory you ran pnpm from.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultOptions, runVerify } from '../verify.js';
import { formatExplain, formatReport } from '../report.js';
import type { GateId } from '../gates/result.js';

const ALL_GATES: GateId[] = ['L0', 'L1', 'L2', 'L2b', 'L3', 'L4', 'L5', 'L7', 'L8', 'BUILD'];

function usage(msg: string): never {
  console.error(`verify: ${msg}\nUsage: pnpm verify [--update] [--explain <id>] [--content <dir>] [--snapshots <dir>] [--out <file> | --no-bundle] [--src-root <dir>] [--gates L1,L2,...]`);
  process.exit(2);
}

// The bundle lives at packages/verify/.cache/verify.mjs; the repo root is three levels up.
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = process.env.VERIFY_REPO_ROOT ?? path.resolve(here, '..', '..', '..');
const userCwd = process.env.INIT_CWD ?? process.cwd();
const resolveUser = (p: string) => path.resolve(userCwd, p);
const show = (p: string) => {
  const rel = path.relative(userCwd, p);
  return rel.startsWith('..') ? p : rel || '.';
};

const opts = defaultOptions(repoRoot);
let explain: string | null = null;
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const a = args[i]!;
  const val = () => args[++i] ?? usage(`${a} needs a value`);
  switch (a) {
    case '--update':
      opts.update = true;
      break;
    case '--explain':
      explain = val();
      break;
    case '--content':
      opts.contentDir = resolveUser(val());
      break;
    case '--snapshots':
      opts.snapshotDir = resolveUser(val());
      break;
    case '--out':
      opts.bundleOut = resolveUser(val());
      break;
    case '--no-bundle':
      opts.bundleOut = null;
      break;
    case '--src-root':
      opts.srcRoot = resolveUser(val());
      break;
    case '--gates': {
      const gates = val().split(',').map((g) => g.trim()) as GateId[];
      for (const g of gates) if (!ALL_GATES.includes(g)) usage(`unknown gate "${g}" (known: ${ALL_GATES.join(', ')})`);
      opts.gates = gates;
      opts.bundleOut = null;
      break;
    }
    case '--':
      break;
    default:
      usage(`unknown argument "${a}"`);
  }
}
if (explain) opts.bundleOut = null;

let outcome;
try {
  outcome = await runVerify(opts);
} catch (e) {
  console.error(`verify: ${(e as Error).message}`);
  process.exit(2);
}

if (explain) {
  const ex = formatExplain(explain, outcome.results);
  console.log(ex.text);
  console.log('');
  console.log(outcome.ok ? 'Overall: all gates green.' : `Overall: failing gates: ${outcome.results.filter((r) => !r.ok).map((r) => r.gate).join(', ')}`);
  process.exit(ex.ok ? 0 : 1);
}

console.log(`Content: ${show(opts.contentDir)}`);
console.log(formatReport(outcome.results));
if (outcome.bundleWritten) console.log(`bundle written: ${show(outcome.bundleWritten)}`);
else if (!outcome.ok && opts.bundleOut) console.log('bundle NOT written (gates failed)');
process.exit(outcome.ok ? 0 : 1);
