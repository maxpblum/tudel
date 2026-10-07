/**
 * The pinned Strudel reference data the gates check against:
 *  - tools/strudel-ref/pin.json    (git commit + npm versions)
 *  - tools/strudel-ref/doc.json    (Strudel's own function list, generated from the pinned clone)
 *  - tools/strudel-ref/sounds.json (sound names registered by the pinned prebake)
 *  - src/gates/allowlist.json      (names L2 accepts although doc.json lacks them; each cites an ADR)
 *  - tools/strudel-ref/.cache/strudel (the pinned clone, for `{cite src=...}`)
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export interface Pin {
  repo: string;
  commit: string;
  npm: Record<string, string>;
}

export interface DocEntry {
  name: string;
  memberof?: string;
  kind?: string;
  synonyms?: string[];
  /** HTML (rendered Markdown from the JSDoc comment). */
  description?: string;
}

/** What doc.json says about one name, for the app's Strudel-terms glossary. */
export interface DocInfo {
  description: string;
  synonyms: string[];
}

export type SoundType = 'synth' | 'sample' | 'wavetable' | 'soundfont' | 'input';
export interface SoundInfo {
  type: SoundType;
  /** True if playing it needs the network (samples, wavetables, soundfonts load from the CDN). */
  network: boolean;
  /** Set if this name is an alias of another registered sound (e.g. `saw` → `sawtooth`). */
  aliasOf?: string;
}
export interface SoundsFile {
  commit: string;
  sources: string[];
  sounds: Record<string, SoundInfo>;
}

export interface AllowlistEntry {
  name: string;
  /** Path of the ADR (relative to the repo root) that justifies the entry. */
  adr: string;
  reason: string;
}

export interface Reference {
  pin: Pin;
  /** Primary doc.json names that content may call (top-level, Pattern methods, repl). */
  names: Set<string>;
  /** synonym → primary name. Excludes synonyms that are themselves primary names. */
  synonyms: Map<string, string>;
  /** Primary name → description (HTML) and synonyms, from the first user-scope entry that has a description. */
  docs: Map<string, DocInfo>;
  sounds: Map<string, SoundInfo>;
  /** Lower-cased bank prefixes (`RolandTR808` → `rolandtr808`) derived from sample names. */
  banks: Set<string>;
  allowlist: Map<string, AllowlistEntry>;
  /** Absolute path of the pinned clone (may not exist). */
  srcRoot: string;
  refDir: string;
}

/** doc.json entries that belong to internal classes (DoughVoice, OLAProcessor, ...) are not user API. */
const USER_SCOPES = new Set([undefined, 'Pattern', 'repl']);

export function loadDoc(docPath: string): { names: Set<string>; synonyms: Map<string, string>; docs: Map<string, DocInfo> } {
  const doc = JSON.parse(readFileSync(docPath, 'utf8')) as { docs: DocEntry[] };
  const names = new Set<string>();
  const syn = new Map<string, string>();
  const docs = new Map<string, DocInfo>();
  for (const d of doc.docs) {
    if (!d.name || !USER_SCOPES.has(d.memberof)) continue;
    if (d.kind === 'package') continue;
    names.add(d.name);
    if (d.description && !docs.has(d.name)) docs.set(d.name, { description: d.description, synonyms: d.synonyms ?? [] });
    for (const s of d.synonyms ?? []) if (!syn.has(s)) syn.set(s, d.name);
  }
  for (const n of names) syn.delete(n);
  return { names, synonyms: syn, docs };
}

export interface LoadReferenceOptions {
  refDir: string;
  repoRoot: string;
  allowlistPath: string;
  /** Override the clone location (tests use a small fake source tree). */
  srcRoot?: string;
}

export function loadReference(o: LoadReferenceOptions): Reference {
  const pin = JSON.parse(readFileSync(path.join(o.refDir, 'pin.json'), 'utf8')) as Pin;
  const { names, synonyms, docs } = loadDoc(path.join(o.refDir, 'doc.json'));
  const soundsPath = path.join(o.refDir, 'sounds.json');
  if (!existsSync(soundsPath)) {
    throw new Error(`${soundsPath} is missing. Generate it with: bash tools/strudel-ref/generate-sounds.sh`);
  }
  const soundsFile = JSON.parse(readFileSync(soundsPath, 'utf8')) as SoundsFile;
  if (soundsFile.commit !== pin.commit) {
    throw new Error(`sounds.json was generated at ${soundsFile.commit}, but the pin is ${pin.commit}. Regenerate it.`);
  }
  const sounds = new Map(Object.entries(soundsFile.sounds));
  const banks = new Set<string>();
  for (const [name, info] of sounds) {
    const i = name.indexOf('_');
    if (info.type === 'sample' && i > 0) banks.add(name.slice(0, i));
  }
  const allowlist = new Map<string, AllowlistEntry>();
  for (const e of JSON.parse(readFileSync(o.allowlistPath, 'utf8')) as AllowlistEntry[]) allowlist.set(e.name, e);
  return {
    pin,
    names,
    synonyms,
    docs,
    sounds,
    banks,
    allowlist,
    srcRoot: o.srcRoot ?? path.join(o.refDir, '.cache', 'strudel'),
    refDir: o.refDir,
  };
}

/** Is `name` a known Strudel function (doc.json name, doc.json synonym, or allowlisted)? */
export function isKnownName(ref: Reference, name: string): boolean {
  return ref.names.has(name) || ref.synonyms.has(name) || ref.allowlist.has(name);
}

/** superdough looks sounds up lower-cased (see superdough.mjs `getSound`). */
export function lookupSound(ref: Reference, name: string): SoundInfo | undefined {
  return ref.sounds.get(name.toLowerCase());
}

export function codebergUrl(pin: Pin, file: string, from?: number, to?: number): string {
  const base = pin.repo.replace(/\.git$/, '');
  const anchor = from ? `#L${from}${to && to !== from ? `-L${to}` : ''}` : '';
  return `${base}/src/commit/${pin.commit}/${file}${anchor}`;
}
