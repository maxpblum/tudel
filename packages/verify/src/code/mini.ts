/**
 * Mini-notation helpers built on Strudel's own mini-notation parser (`mini2ast` from
 * @strudel/mini), so the leaves we check are exactly the words Strudel would play.
 */
import { mini2ast } from '../harness/strudel-deps.js';

/** Mini-notation rest/elongation symbols, which are not sound or note names. */
const NON_VALUES = new Set(['~', '-', '_']);

export interface MiniLeaves {
  ok: boolean;
  error?: string;
  /** The value words (e.g. `bd` from `bd:3*2`), excluding operator arguments like `*2` or `(3,8)`. */
  words: string[];
}

function walkAst(node: any, out: string[]) {
  if (!node || typeof node !== 'object') return;
  if (node.type_ === 'atom') {
    const v = String(node.source_);
    if (!NON_VALUES.has(v)) out.push(v);
    return;
  }
  if (node.type_ === 'element') return walkAst(node.source_, out); // skip options_ (ops arguments)
  if (node.type_ === 'pattern') {
    for (const child of node.source_ ?? []) walkAst(child, out);
    return;
  }
}

export function miniWords(str: string): MiniLeaves {
  try {
    const ast = mini2ast(JSON.stringify(str));
    const words: string[] = [];
    walkAst(ast, words);
    return { ok: true, words };
  } catch (e) {
    return { ok: false, error: (e as Error).message, words: [] };
  }
}
