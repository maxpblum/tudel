/**
 * Gate L4: notation agreement. For every variant with `abc`, the notes abcjs parses
 * (`parseOnly` + `setUpAudio`, which applies key signatures, accidentals and ties) must equal
 * the canonical solution's haps in pitch, onset and duration (as configured), for the
 * configured voice. Time: an ABC whole note = 1 cycle (docs/time-conventions.md).
 *
 * The reference loops, so over `verify.cycles` its events must equal the notation repeated end
 * to end (a 1-bar dictation with `cycles: 4` must sound the same in all four bars). The
 * notation itself must fit within `verify.cycles`.
 * Lesson :::abc blocks have no reference to compare, but must parse without warnings.
 */
import abcjs from 'abcjs';
import type { ValidContent } from '../content/model.js';
import type { RunCache } from '../harness/evaluate.js';
import { DEFAULT_SOUND, hapBegin, hapEnd, hapMidi, onsetHaps } from '../harness/haps.js';
import { GateResult } from './result.js';

/** abcjs rounds times to 6 decimals; allow a little slack for that. */
const EPS = 1e-4;

export interface NoteEvent {
  pitch: number | null;
  onset: number;
  duration: number;
}

export interface AbcParse {
  ok: boolean;
  errors: string[];
  /** Note events per voice/track. */
  tracks: NoteEvent[][];
  /** Length of the tune in whole notes (= cycles). */
  length: number;
}

function stripTags(s: string) {
  return s.replace(/<[^>]*>/g, '');
}

export function parseAbc(abc: string): AbcParse {
  const tunes = (abcjs as any).parseOnly(abc);
  const tune = tunes?.[0];
  if (!tune) return { ok: false, errors: ['abcjs found no tune (missing X: header?)'], tracks: [], length: 0 };
  const errors: string[] = (tune.warnings ?? []).map((w: string) => `abcjs warning: ${stripTags(w)}`);
  if (tunes.length > 1) errors.push(`expected exactly one tune, found ${tunes.length}`);
  const audio = tune.setUpAudio();
  const tracks: NoteEvent[][] = audio.tracks.map((t: any[]) =>
    t.filter((e) => e.cmd === 'note').map((e) => ({ pitch: e.pitch, onset: e.start, duration: e.duration })),
  );
  // Tune length: the end of the last bar. Prefer the measure structure; fall back to last note end.
  let length = 0;
  for (const t of tracks) for (const e of t) length = Math.max(length, e.onset + e.duration);
  const meter = tune.getMeterFraction?.();
  const bar = meter && meter.den ? meter.num / meter.den : 1;
  length = Math.ceil(length / bar - EPS) * bar;
  return { ok: errors.length === 0, errors, tracks, length };
}

function fmt(e: NoteEvent, fields: string[]) {
  const parts: string[] = [];
  if (fields.includes('onset')) parts.push(`onset ${+e.onset.toFixed(4)}`);
  if (fields.includes('pitch')) parts.push(`pitch ${e.pitch === null ? 'none' : +e.pitch.toFixed(4)}`);
  if (fields.includes('duration')) parts.push(`dur ${+e.duration.toFixed(4)}`);
  return parts.join(', ');
}

function sortEvents(list: NoteEvent[]) {
  return [...list].sort((a, b) => a.onset - b.onset || (a.pitch ?? -1) - (b.pitch ?? -1) || a.duration - b.duration);
}

/** Compare two event lists on the chosen fields; returns human-readable differences. */
export function compareEvents(abc: NoteEvent[], ref: NoteEvent[], fields: string[]): string[] {
  const a = sortEvents(abc);
  const b = sortEvents(ref);
  const diffs: string[] = [];
  if (a.length !== b.length) diffs.push(`notation has ${a.length} notes but the solution has ${b.length} events in the window`);
  const eq = (x: number | null, y: number | null) => (x === null || y === null ? x === y : Math.abs(x - y) < EPS);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i];
    const y = b[i];
    if (!x || !y) {
      diffs.push(`#${i + 1}: notation ${x ? fmt(x, fields) : '(none)'} vs solution ${y ? fmt(y, fields) : '(none)'}`);
    } else {
      const bad = fields.filter((f) => !eq((x as any)[f], (y as any)[f]));
      if (bad.length) diffs.push(`#${i + 1}: notation ${fmt(x, fields)} vs solution ${fmt(y, fields)} (${bad.join(', ')} differ)`);
    }
    if (diffs.length >= 8) {
      diffs.push('...');
      break;
    }
  }
  return diffs;
}

/** The notation looped every `length` cycles, keeping notes that start before `cycles`. */
export function repeatEvents(events: NoteEvent[], length: number, cycles: number): NoteEvent[] {
  const out: NoteEvent[] = [];
  if (length <= 0) return out;
  for (let k = 0; k * length < cycles - EPS; k++) {
    for (const e of events) if (e.onset + k * length < cycles - EPS) out.push({ ...e, onset: e.onset + k * length });
  }
  return out;
}

export async function gateL4(content: ValidContent, cache: RunCache): Promise<GateResult> {
  const r = new GateResult('L4');
  for (const l of content.lessons) {
    for (const s of l.segments) {
      if (s.kind !== 'directive' || s.name !== 'abc') continue;
      const p = parseAbc(s.body);
      if (!p.ok) for (const e of p.errors) r.fail(l.id, e, `${l.file}:${s.line}`);
      else r.pass(l.id, 'abc parses', `${l.file}:${s.line}`);
    }
  }
  for (const vv of content.variants) {
    const v = vv.v;
    for (const s of vv.promptSegments) {
      if (s.kind !== 'directive' || s.name !== 'abc') continue;
      const p = parseAbc(s.body);
      if (!p.ok) for (const e of p.errors) r.fail(v.id, e, `${vv.file} prompt:${s.line}`);
    }
    const cfg = v.verify.abc_agreement;
    if (!v.abc) {
      if (cfg) r.fail(v.id, 'verify.abc_agreement is set but the variant has no abc');
      continue;
    }
    if (!cfg) {
      r.fail(v.id, 'variant has abc but verify.abc_agreement is null, so the notation would be unchecked');
      continue;
    }
    const p = parseAbc(v.abc);
    if (!p.ok) {
      for (const e of p.errors) r.fail(v.id, e, `${vv.file} abc`);
      continue;
    }
    const track = p.tracks[cfg.voice];
    if (!track) {
      r.fail(v.id, `abc voice ${cfg.voice} does not exist (the notation has ${p.tracks.length} voice(s))`);
      continue;
    }
    if (p.length > v.verify.cycles + EPS) {
      r.fail(v.id, `the notation is ${p.length} bar(s) long but verify.cycles is ${v.verify.cycles}; raise cycles to cover it`);
      continue;
    }
    const run = await cache.run(v.solutions[0]!.code, v.verify.cycles);
    if (!run.ok) {
      r.fail(v.id, 'canonical solution does not evaluate (see L1)');
      continue;
    }
    const only = cfg.only_sounds ? new Set(cfg.only_sounds.map((x) => x.toLowerCase())) : null;
    const ref: NoteEvent[] = onsetHaps(run.haps)
      .filter((h) => !only || only.has(String(h.value?.s ?? DEFAULT_SOUND).toLowerCase()))
      .map((h) => ({ pitch: hapMidi(h.value), onset: hapBegin(h), duration: hapEnd(h) - hapBegin(h) }));
    // The reference loops: over verify.cycles it must equal the notation repeated end to end.
    const expected = repeatEvents(track, p.length, v.verify.cycles);
    const diffs = compareEvents(expected, ref, cfg.compare);
    const window = p.length < v.verify.cycles ? `the ${p.length}-bar notation repeated over ${v.verify.cycles} cycles` : `${p.length} cycles`;
    if (diffs.length) r.fail(v.id, `notation and canonical solution disagree (${cfg.compare.join(', ')}; ${window}):\n    ${diffs.join('\n    ')}`);
    else r.pass(v.id, `abc voice ${cfg.voice} matches the solution (${track.length} notes; ${cfg.compare.join(', ')})`);
  }
  return r;
}
