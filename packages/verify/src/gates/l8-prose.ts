/**
 * Gate L8: prose claims.
 *  (a) Inline code spans in lessons, prompts, skills, and the lexicon that look like Strudel
 *      code (an identifier, a call, or a method chain) must only use doc.json/allowlisted
 *      names. A quoted single word (`"sawtooth"`) must be a registered sound or a note name.
 *  (b) `{cite doc=X}` must name a doc.json entry; `{cite src="path#Lx-Ly"}` must point at
 *      existing lines in the pinned clone (tools/strudel-ref/.cache/strudel). Variant
 *      `sources:` entries are checked the same way.
 *  (c) content/glossary/chord-symbols.yaml (if present): each symbol's tones must be spelled
 *      exactly as `tonal` spells the chord.
 *  (d) every timbre-lexicon entry has at least one source and a confidence level.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { Chord } from '../harness/music-deps.js';
import type { ValidContent } from '../content/model.js';
import type { Segment } from '../content/directives.js';
import { analyzeCode } from '../code/ast.js';
import { isKnownName, lookupSound, type Reference } from '../ref/reference.js';
import { GateResult } from './result.js';

/** Note names like `c3`, `Eb4`, `f#2`, `c` (mini-notation note words). */
const NOTE_NAME = /^[a-gA-G](?:#|b|s|f)*-?\d*$/;
const CODEISH = /^\.?[A-Za-z_$][\w$]*/;

export function codeSpans(text: string): string[] {
  const out: string[] = [];
  const re = /(`+)([\s\S]*?[^`])\1(?!`)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push(m[2]!.trim());
  return out;
}

/** Returns a problem description, or null if the span is fine or doesn't look like Strudel code. */
export function checkSpan(span: string, ref: Reference): string | null {
  const q = /^"([^"\s]*)"$/.exec(span);
  if (q) {
    const w = q[1]!;
    if (!/^[A-Za-z_][\w-]*$/.test(w)) return null; // mini-notation snippets like "c3 e3" or "<0 2>" aren't checked
    if (lookupSound(ref, w) || NOTE_NAME.test(w)) return null;
    return `\`${span}\` is not a registered sound name (or a note name) at the pin`;
  }
  if (!CODEISH.test(span)) return null;
  const src = span.startsWith('.') ? `__x${span}` : span;
  const a = analyzeCode(src);
  if (!a.ok) return null; // not code (e.g. prose in backticks)
  // A bare name (`lpf`, `.lpf`) is checked as such. In a call or chain (`range(min, max)`),
  // only the called functions and methods are checked: argument names are usually placeholders.
  const bare = /^\.?[A-Za-z_$][\w$]*$/.test(span);
  const unknown = a.refs.filter(
    (r) =>
      r.name !== '__x' &&
      (bare || r.called || r.kind === 'method') &&
      !isKnownName(ref, r.name) &&
      !(r.kind === 'ident' && !r.called && NOTE_NAME.test(r.name)),
  );
  if (!unknown.length) return null;
  return unknown
    .map((r) => {
      const hint = ref.sounds.has(r.name.toLowerCase()) ? ` (a sound name: write \`"${r.name}"\` or \`s("${r.name}")\`)` : '';
      return `\`${span}\`: "${r.name}" is not in the pinned doc.json or the allowlist${hint}`;
    })
    .join('; ');
}

const CITE = /\{cite\b([^}]*)\}/g;

export interface Cite {
  doc?: string;
  src?: { file: string; from: number; to: number };
  raw: string;
  error?: string;
}

export function parseCite(inner: string, raw: string): Cite {
  const d = /^\s+doc=("?)([\w$.]+)\1\s*$/.exec(inner);
  if (d) return { doc: d[2], raw };
  const s = /^\s+src="([^"#]+)#L(\d+)(?:-L?(\d+))?"\s*$/.exec(inner);
  if (s) {
    const from = Number(s[2]);
    const to = s[3] ? Number(s[3]) : from;
    return { src: { file: s[1]!, from, to }, raw };
  }
  return { raw, error: `malformed citation ${raw}: use {cite doc=NAME} or {cite src="path/file.mjs#L10-L20"}` };
}

export function findCites(text: string): Cite[] {
  return [...text.matchAll(CITE)].map((m) => parseCite(m[1]!, m[0]));
}

export class SourceChecker {
  private problem: string | null | undefined;
  private lines = new Map<string, number | null>();
  constructor(private ref: Reference) {}

  /** null if the clone exists at the pinned commit, else why not. */
  cloneProblem(): string | null {
    if (this.problem !== undefined) return this.problem;
    const root = this.ref.srcRoot;
    if (!existsSync(root)) return (this.problem = `the pinned Strudel clone is missing at ${root}. Run \`pnpm strudel-ref\` to set it up`);
    const head = path.join(root, '.git', 'HEAD');
    if (existsSync(head)) {
      const h = readFileSync(head, 'utf8').trim();
      if (h !== this.ref.pin.commit) return (this.problem = `the clone at ${root} is at ${h}, not the pinned commit ${this.ref.pin.commit}. Run \`pnpm strudel-ref\``);
    }
    return (this.problem = null);
  }

  check(file: string, from: number, to: number): string | null {
    const cp = this.cloneProblem();
    if (cp) return cp;
    if (file.split('/').includes('..') || path.isAbsolute(file)) return `source path "${file}" must be relative to the Strudel repo root`;
    if (!this.lines.has(file)) {
      const abs = path.join(this.ref.srcRoot, file);
      this.lines.set(file, existsSync(abs) ? readFileSync(abs, 'utf8').split('\n').length : null);
    }
    const n = this.lines.get(file);
    if (n === null || n === undefined) return `source file "${file}" does not exist in the pinned clone`;
    if (from < 1 || to < from) return `invalid line range L${from}-L${to} in "${file}"`;
    if (to > n) return `"${file}" has ${n} lines; L${from}-L${to} is out of range`;
    return null;
  }
}

function proseTexts(segments: Segment[]): { text: string; line: number }[] {
  const out: { text: string; line: number }[] = [];
  for (const s of segments) {
    if (s.kind === 'prose') out.push({ text: s.text, line: s.line });
    else if (s.name === 'bridge') out.push({ text: s.body, line: s.line });
    if (s.kind === 'directive') {
      for (const v of Object.values(s.attrs)) if (typeof v === 'string') out.push({ text: v, line: s.line });
    }
  }
  return out;
}

export function gateL8(content: ValidContent, ref: Reference): GateResult {
  const r = new GateResult('L8');
  const src = new SourceChecker(ref);

  const checkText = (item: string, text: string, where: string) => {
    for (const span of codeSpans(text)) {
      const p = checkSpan(span, ref);
      if (p) r.fail(item, `(a) ${p}`, where);
    }
    for (const c of findCites(text)) {
      if (c.error) r.fail(item, `(b) ${c.error}`, where);
      else if (c.doc) {
        if (ref.names.has(c.doc)) r.pass(item, `(b) ${c.raw} found in doc.json`, where);
        else r.fail(item, `(b) ${c.raw}: "${c.doc}" is not a primary doc.json name${ref.synonyms.has(c.doc) ? ` (it is a synonym of "${ref.synonyms.get(c.doc)}")` : ''}`, where);
      } else if (c.src) {
        const p = src.check(c.src.file, c.src.from, c.src.to);
        if (p) r.fail(item, `(b) ${c.raw}: ${p}`, where);
        else r.pass(item, `(b) ${c.raw} exists in the pinned source`, where);
      }
    }
    if (/\{cite(?![\s}])/.test(text)) r.fail(item, '(b) malformed citation "{cite..." (needs a space before doc= or src=)', where);
  };

  for (const l of content.lessons) {
    checkText(l.id, l.title, l.file);
    for (const t of proseTexts(l.segments)) checkText(l.id, t.text, `${l.file}:${t.line}`);
  }
  const terms = new Set(content.lexicon.map((e) => e.term));
  for (const vv of content.variants) {
    const v = vv.v;
    checkText(v.id, v.title, vv.file);
    for (const t of proseTexts(vv.promptSegments)) checkText(v.id, t.text, `${vv.file} prompt:${t.line}`);
    for (const x of v.listen_for) checkText(v.id, x, `${vv.file} listen_for`);
    for (const x of v.rubric ?? []) checkText(v.id, x, `${vv.file} rubric`);
    for (const s of v.solutions) if (s.note) checkText(v.id, s.note, `${vv.file} solutions.note`);
    for (const s of v.sources) {
      const [k, val] = Object.entries(s)[0] as [string, string];
      const where = `${vv.file} sources`;
      if (k === 'strudel-doc') {
        if (ref.names.has(val)) r.pass(v.id, `(b) source strudel-doc ${val} exists`, where);
        else r.fail(v.id, `(b) source strudel-doc "${val}" is not a primary doc.json name`, where);
      } else if (k === 'strudel-src') {
        const m = /^([^#]+)#L(\d+)(?:-L?(\d+))?$/.exec(val);
        if (!m) r.fail(v.id, `(b) source strudel-src "${val}" must look like "packages/x/y.mjs#L10" or "#L10-L20"`, where);
        else {
          const p = src.check(m[1]!, Number(m[2]), m[3] ? Number(m[3]) : Number(m[2]));
          if (p) r.fail(v.id, `(b) source strudel-src "${val}": ${p}`, where);
          else r.pass(v.id, `(b) source strudel-src ${val} exists`, where);
        }
      } else if (k === 'lexicon') {
        if (terms.has(val)) r.pass(v.id, `(b) source lexicon "${val}" exists`, where);
        else r.fail(v.id, `(b) source lexicon "${val}" is not a term in timbre-lexicon.yaml`, where);
      } else if (k === 'url') {
        if (/^https?:\/\/\S+$/.test(val)) r.pass(v.id, `(b) source url ok`, where);
        else r.fail(v.id, `(b) source url "${val}" is not an http(s) URL`, where);
      } else if (!val.trim()) r.fail(v.id, `(b) source ${k} is empty`, where);
    }
  }
  for (const s of content.skills) {
    checkText(s.id, s.title, 'skills.yaml');
    checkText(s.id, s.summary, 'skills.yaml');
    checkText(s.id, s.idiom_note, 'skills.yaml');
  }
  for (const e of content.lexicon) {
    const where = `glossary/timbre-lexicon.yaml "${e.term}"`;
    for (const t of [e.term, ...e.tendencies, e.notes ?? '', ...e.sources.map((s) => s.note ?? '')]) checkText('lexicon', t, where);
    // (d)
    if (!e.sources.length) r.fail('lexicon', `(d) "${e.term}" has no sources`, where);
    else if (!e.confidence) r.fail('lexicon', `(d) "${e.term}" has no confidence level`, where);
    else r.pass('lexicon', `(d) "${e.term}": ${e.sources.length} source(s), confidence ${e.confidence}, ${e.status}`, where);
  }
  // (c)
  for (const c of content.chords) {
    const where = `glossary/chord-symbols.yaml "${c.symbol}"`;
    const p = chordProblem(c.symbol, c.tones);
    if (p) r.fail('chord-symbols', `(c) ${p}`, where);
    else r.pass('chord-symbols', `(c) ${c.symbol} = ${c.tones.join(' ')}`, where);
  }
  return r;
}

/** null if `tones` is exactly tonal's spelling of `symbol` (order-insensitive), else why not. */
export function chordProblem(symbol: string, tones: string[]): string | null {
  const ch = Chord.get(symbol);
  if (ch.empty) return `tonal doesn't recognize the chord symbol "${symbol}"`;
  const want = [...ch.notes].sort();
  const got = [...tones].sort();
  if (want.join(' ') === got.join(' ')) return null;
  return `"${symbol}" is spelled ${ch.notes.join(' ')} (tonal), but the entry says ${tones.join(' ')}`;
}
