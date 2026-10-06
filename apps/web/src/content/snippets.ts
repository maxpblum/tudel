/**
 * Pure helpers over a Bundle (no import of the bundle itself), shared by the app, unit tests and the
 * Playwright L6 test (which imports this file from Node).
 */
import type { Block, Bundle, CodeSnippet } from '@tutor/content-schema';

export interface PlayableSnippet {
  /** Stable id, e.g. `variant:fx.lowpass.v01:solution` or `lesson:fx.lowpass.lesson:3:b`. */
  id: string;
  code: string;
  needsNetwork: boolean;
  /** Cycles to play (variant cycles; lesson snippets use a default). */
  cycles: number;
}

/** Every playable snippet inside a block list (play blocks, compare a/b, recursing into bridges). */
export function playableInBlocks(blocks: Block[], prefix: string, cycles = 4): PlayableSnippet[] {
  const out: PlayableSnippet[] = [];
  const add = (id: string, s: CodeSnippet) => out.push({ id, code: s.code, needsNetwork: s.needsNetwork, cycles });
  blocks.forEach((b, i) => {
    if (b.kind === 'play') add(`${prefix}:${i}`, b.snippet);
    else if (b.kind === 'compare') {
      add(`${prefix}:${i}:a`, b.a.snippet);
      add(`${prefix}:${i}:b`, b.b.snippet);
    } else if (b.kind === 'bridge') out.push(...playableInBlocks(b.blocks, `${prefix}:${i}`, cycles));
  });
  return out;
}

/**
 * Gate L6's snippet list: every variant's canonical solution, plus every play/compare snippet in
 * lessons and prompts.
 */
export function smokeSnippets(bundle: Pick<Bundle, 'variants' | 'lessons'>): PlayableSnippet[] {
  const out: PlayableSnippet[] = [];
  for (const v of bundle.variants) {
    const s = v.solutions[0]!.snippet;
    out.push({ id: `variant:${v.id}:solution`, code: s.code, needsNetwork: s.needsNetwork, cycles: v.cycles });
    out.push(...playableInBlocks(v.prompt, `variant:${v.id}:prompt`, v.cycles));
  }
  for (const l of bundle.lessons) out.push(...playableInBlocks(l.blocks, `lesson:${l.id}`));
  return out;
}
