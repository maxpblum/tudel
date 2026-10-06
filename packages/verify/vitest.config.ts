import { defineConfig } from 'vitest/config';
import { buildSync } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Strudel's and tonal's dependency trees can't be loaded by Vite/Node module resolution (see
// docs/decisions/0002-esbuild-bundled-harness.md). The verifier imports them only through two
// seam modules; here each is bundled with esbuild (as scripts/run.mjs does for the CLI) and
// aliased to its bundle before any test runs.
const root = path.dirname(fileURLToPath(import.meta.url));
const seams = ['strudel-deps', 'music-deps'];
const alias = seams.map((name) => {
  const outfile = path.join(root, '.cache', `${name}.mjs`);
  buildSync({
    entryPoints: [path.join(root, 'src', 'harness', `${name}.ts`)],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node22',
    mainFields: ['module', 'main'],
    outfile,
    logLevel: 'warning',
    banner: { js: "import{createRequire as __cr}from'module';const require=__cr(import.meta.url);" },
  });
  return { find: new RegExp(`^.*/${name}(\\.js|\\.ts)?$`), replacement: outfile };
});

export default defineConfig({
  resolve: { alias },
  test: { include: ['test/**/*.test.ts'], testTimeout: 60000, hookTimeout: 60000 },
});
