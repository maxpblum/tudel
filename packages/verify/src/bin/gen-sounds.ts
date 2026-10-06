/**
 * Generates tools/strudel-ref/sounds.json: every sound name strudel.cc's prebake registers at
 * the pinned commit, marked synth (offline) or sample/wavetable/soundfont (network).
 *
 * Nothing is hand-copied: the list of sample maps is read from the pinned clone's
 * website/src/repl/prebake.mjs (parsed with acorn), the sample maps are fetched from the CDN,
 * and registration runs through the pinned superdough itself (`registerSynthSounds`,
 * `registerZZFXSounds`, `samples`, `aliasBank`), after which we read superdough's `soundMap`.
 * Soundfont names are the keys of the clone's packages/soundfonts/gm.mjs, which is what
 * `registerSoundfonts()` registers.
 *
 * Needs the network and the pinned clone (`pnpm strudel-ref`).
 * Usage: node scripts/run.mjs gen-sounds [--check]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as walk from 'acorn-walk';
import { parseProgram } from '../code/ast.js';
import { webaudio } from '../harness/strudel-deps.js';
import type { SoundInfo, SoundsFile, SoundType } from '../ref/reference.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = process.env.VERIFY_REPO_ROOT ?? path.resolve(here, '..', '..', '..');
const refDir = path.join(repoRoot, 'tools', 'strudel-ref');
const pin = JSON.parse(readFileSync(path.join(refDir, 'pin.json'), 'utf8'));
const clone = path.join(refDir, '.cache', 'strudel');
const check = process.argv.includes('--check');

function fail(msg: string): never {
  console.error(`gen-sounds: ${msg}`);
  process.exit(1);
}
if (!existsSync(clone)) fail(`pinned clone missing at ${clone}; run \`pnpm strudel-ref\` first`);
const head = readFileSync(path.join(clone, '.git', 'HEAD'), 'utf8').trim();
if (head !== pin.commit) fail(`clone is at ${head}, pin is ${pin.commit}; run \`pnpm strudel-ref\``);

// --- read the pinned prebake -------------------------------------------------------------
const prebakeFile = 'website/src/repl/prebake.mjs';
const prebakeSrc = readFileSync(path.join(clone, prebakeFile), 'utf8');
const ast = parseProgram(prebakeSrc);
const consts: Record<string, string> = {};
walk.simple(ast, {
  VariableDeclarator(n: any) {
    if (n.id.type === 'Identifier' && n.init?.type === 'Literal' && typeof n.init.value === 'string') consts[n.id.name] = n.init.value;
  },
});
function evalNode(n: any): any {
  if (!n) return undefined;
  if (n.type === 'Literal') return n.value;
  if (n.type === 'TemplateLiteral') {
    return n.quasis.map((q: any, i: number) => {
      const e = n.expressions[i];
      if (!e) return q.value.cooked;
      if (e.type !== 'Identifier' || !(e.name in consts)) throw new Error(`can't evaluate template expression in ${prebakeFile}`);
      return q.value.cooked + consts[e.name];
    }).join('');
  }
  if (n.type === 'ObjectExpression') {
    const o: Record<string, any> = {};
    for (const p of n.properties) {
      const k = p.key.type === 'Identifier' ? p.key.name : p.key.value;
      o[k] = evalNode(p.value);
    }
    return o;
  }
  if (n.type === 'ArrayExpression') return n.elements.map(evalNode);
  if (n.type === 'Identifier' && n.name in consts) return consts[n.name];
  throw new Error(`can't evaluate ${n.type} in ${prebakeFile}`);
}
const sampleCalls: any[][] = [];
const aliasCalls: any[][] = [];
let soundfonts = false;
walk.simple(ast, {
  CallExpression(n: any) {
    if (n.callee.type !== 'Identifier') return;
    if (n.callee.name === 'samples') sampleCalls.push(n.arguments.map(evalNode));
    if (n.callee.name === 'aliasBank') aliasCalls.push(n.arguments.map(evalNode));
    if (n.callee.name === 'registerSoundfonts') soundfonts = true;
  },
});
if (!sampleCalls.length) fail(`found no samples(...) calls in ${prebakeFile}; has the prebake changed shape?`);

// --- register through the pinned superdough -------------------------------------------------
const wa = webaudio as any;
const sources: string[] = [`${prebakeFile} (registerSynthSounds, registerZZFXSounds)`];
wa.registerSynthSounds();
wa.registerZZFXSounds();
for (const [map, base, opts] of sampleCalls) {
  sources.push(typeof map === 'string' ? map : `inline sample map in ${prebakeFile} (base ${base})`);
  await wa.samples(map, base, opts);
}
for (const [arg] of aliasCalls) {
  sources.push(typeof arg === 'string' ? arg : `inline bank aliases in ${prebakeFile}`);
  await wa.aliasBank(arg);
}
const dict: Record<string, any> = wa.soundMap.get();

const sounds: Record<string, SoundInfo> = {};
const canonical = new Map<any, string>();
for (const [name, entry] of Object.entries(dict)) {
  const type = (entry?.data?.type ?? 'sample') as SoundType;
  const info: SoundInfo = { type, network: ['sample', 'wavetable', 'soundfont'].includes(type) };
  const first = canonical.get(entry);
  if (first) info.aliasOf = first;
  else canonical.set(entry, name);
  sounds[name] = info;
}
if (soundfonts) {
  const gm = (await import(pathToFileURL(path.join(clone, 'packages/soundfonts/gm.mjs')).href)).default;
  sources.push('packages/soundfonts/gm.mjs (registerSoundfonts)');
  for (const name of Object.keys(gm)) sounds[name.toLowerCase()] ??= { type: 'soundfont', network: true };
}

const sorted = Object.fromEntries(Object.keys(sounds).sort().map((k) => [k, sounds[k]!]));
const file: SoundsFile = { commit: pin.commit, sources, sounds: sorted };
const text = JSON.stringify(file, null, 1) + '\n';
const out = path.join(refDir, 'sounds.json');
const counts: Record<string, number> = {};
for (const s of Object.values(sorted)) counts[s.type] = (counts[s.type] ?? 0) + 1;
if (check) {
  const old = existsSync(out) ? readFileSync(out, 'utf8') : '';
  if (old === text) console.log('sounds.json up to date');
  else fail('sounds.json differs from what the pinned prebake registers now (the CDN sample maps may have changed). Review and regenerate.');
} else {
  writeFileSync(out, text);
  console.log(`wrote ${out}: ${Object.keys(sorted).length} sounds ${JSON.stringify(counts)}`);
}
process.exit(0);
