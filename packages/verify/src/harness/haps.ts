/**
 * Helpers for reading haps the way superdough plays them.
 */
import { core } from './strudel-deps.js';

/** Default sound superdough uses when a hap has no `s` (superdough.mjs: `s = 'triangle'`). */
export const DEFAULT_SOUND = 'triangle';

/**
 * MIDI pitch of a hap value, following superdough's `getFrequencyFromValue`: `freq` wins,
 * then `note` (string note names via noteToMidi, numbers as MIDI), shifted by `octave`.
 * Returns null if the value carries no pitch (e.g. a drum sample, or bare `n` without `scale`,
 * which synths don't treat as pitch).
 */
export function hapMidi(value: any): number | null {
  if (!value || typeof value !== 'object') return null;
  let midi: number | null = null;
  if (typeof value.freq === 'number') midi = core.freqToMidi(value.freq);
  else if (typeof value.note === 'string') midi = core.noteToMidi(value.note);
  else if (typeof value.note === 'number') midi = value.note;
  if (midi === null) return null;
  if (typeof value.octave === 'number') midi += 12 * value.octave;
  return midi;
}

/** Haps that start inside the queried span (fragments of longer events are skipped). */
export function onsetHaps(haps: any[]): any[] {
  return haps.filter((h) => (typeof h.hasOnset === 'function' ? h.hasOnset() : true));
}

export function hapBegin(h: any): number {
  return (h.whole ?? h.part).begin.valueOf();
}
export function hapEnd(h: any): number {
  return (h.whole ?? h.part).end.valueOf();
}
