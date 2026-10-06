/**
 * Dev tool: evaluate Strudel code and print its haps.
 *   pnpm --filter @tutor/verify exec node scripts/run.mjs eval 'note("c3 e3").s("sawtooth")' [cycles]
 *   echo 'note("c3")' | pnpm --filter @tutor/verify exec node scripts/run.mjs eval - [cycles]
 */
import { readFileSync } from 'node:fs';
import { queryCode } from '../harness/evaluate.js';

const [arg = '-', cyclesArg = '1'] = process.argv.slice(2);
const code = arg === '-' ? readFileSync(0, 'utf8') : arg;
const r = await queryCode(code, Number(cyclesArg));
if (!r.ok) {
  console.log(`ERROR: ${r.error}`);
  process.exit(1);
}
console.log(`cps: ${r.cps}`);
for (const h of r.haps) console.log(h);
process.exit(0);
