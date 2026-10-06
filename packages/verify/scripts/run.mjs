// Bundles the verifier (TypeScript, ESM) with esbuild and runs it.
// Bundling is required: see the note in src/harness/evaluate.ts about @kabelsalat/web.
// Usage: node scripts/run.mjs <entry-name> [args...]
//   entry-name: a file under src/bin/ without extension (e.g. `verify`, `eval`).
import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const [entry = 'verify', ...args] = process.argv.slice(2);
const outfile = path.join(root, '.cache', `${entry}.mjs`);
await build({
  entryPoints: [path.join(root, 'src', 'bin', `${entry}.ts`)],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  mainFields: ['module', 'main'],
  outfile,
  logLevel: 'warning',
  sourcemap: 'inline',
  // Packages with native/wasm assets or heavy dynamic loading are loaded from node_modules at runtime.
  external: ['shiki', '@viz-js/viz', 'prettier', 'esbuild'],
  banner: { js: "import{createRequire as __cr}from'module';const require=__cr(import.meta.url);" },
});
const r = spawnSync(process.execPath, ['--enable-source-maps', outfile, ...args], { stdio: 'inherit', cwd: process.cwd() });
process.exit(r.status ?? 1);
