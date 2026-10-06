/**
 * Line-based parser for the lesson/prompt directive syntax (docs/plan/M1-plan.md §2.2).
 *
 *   :::name{key="value" flag}
 *   body (raw text; Markdown only for `bridge`)
 *   :::
 *
 * Directives don't nest. Everything between directives is Markdown prose. Fenced code blocks
 * (```) are rejected in prose: code must go through `:::code` / `:::play` so the gates see it.
 */
export const DIRECTIVES = {
  play: { label: 'string', hidecode: 'flag' },
  code: { antipattern: 'flag' },
  abc: {},
  diagram: {},
  envelope: {},
  filter: {},
  signal: {},
  bridge: { title: 'string' },
  compare: { diff: 'string' },
} as const satisfies Record<string, Record<string, 'string' | 'flag'>>;
export type DirectiveName = keyof typeof DIRECTIVES;

export interface ProseSegment {
  kind: 'prose';
  text: string;
  /** 1-based line of the first line of this segment in the source file. */
  line: number;
}
export interface DirectiveSegment {
  kind: 'directive';
  name: DirectiveName;
  attrs: Record<string, string | true>;
  body: string;
  line: number;
}
export type Segment = ProseSegment | DirectiveSegment;
export interface ParseIssue {
  line: number;
  message: string;
}

const OPEN = /^:::([A-Za-z][\w-]*)(?:\{(.*)\})?\s*$/;
const CLOSE = /^:::\s*$/;
const FENCE = /^\s*(```|~~~)/;

export function parseAttrs(src: string): { attrs: Record<string, string | true>; error?: string } {
  const attrs: Record<string, string | true> = {};
  const re = /\s*(?:([A-Za-z][\w-]*)="([^"]*)"|([A-Za-z][\w-]*))\s*/y;
  let i = 0;
  while (i < src.length) {
    re.lastIndex = i;
    const m = re.exec(src);
    if (!m || m[0].length === 0) return { attrs, error: `can't parse attributes near "${src.slice(i)}"` };
    const key = m[1] ?? m[3]!;
    if (key in attrs) return { attrs, error: `duplicate attribute "${key}"` };
    attrs[key] = m[1] ? m[2]! : true;
    i = re.lastIndex;
  }
  return { attrs };
}

/**
 * @param lineOffset added to reported line numbers (e.g. the frontmatter length of a lesson).
 */
export function parseDirectives(src: string, lineOffset = 0): { segments: Segment[]; issues: ParseIssue[] } {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const segments: Segment[] = [];
  const issues: ParseIssue[] = [];
  let prose: string[] = [];
  let proseStart = 1;
  const flushProse = () => {
    if (prose.some((l) => l.trim() !== '')) segments.push({ kind: 'prose', text: prose.join('\n'), line: proseStart + lineOffset });
    prose = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const ln = i + 1 + lineOffset;
    const open = OPEN.exec(line);
    if (open) {
      const name = open[1]!;
      flushProse();
      const body: string[] = [];
      let closed = false;
      let j = i + 1;
      for (; j < lines.length; j++) {
        const l = lines[j]!;
        if (CLOSE.test(l)) {
          closed = true;
          break;
        }
        if (OPEN.test(l)) {
          issues.push({ line: j + 1 + lineOffset, message: `directive :::${OPEN.exec(l)![1]} inside :::${name} (directives don't nest; close :::${name} first)` });
        }
        body.push(l);
      }
      if (!closed) issues.push({ line: ln, message: `:::${name} is never closed (expected a line containing only ":::")` });
      if (!(name in DIRECTIVES)) {
        issues.push({ line: ln, message: `unknown directive :::${name} (known: ${Object.keys(DIRECTIVES).join(', ')})` });
      } else {
        const { attrs, error } = parseAttrs(open[2] ?? '');
        if (error) issues.push({ line: ln, message: `:::${name}: ${error}` });
        const spec = DIRECTIVES[name as DirectiveName] as Record<string, 'string' | 'flag'>;
        for (const [k, v] of Object.entries(attrs)) {
          const kind = spec[k];
          if (!kind) issues.push({ line: ln, message: `:::${name}: unknown attribute "${k}"${Object.keys(spec).length ? ` (allowed: ${Object.keys(spec).join(', ')})` : ' (takes no attributes)'}` });
          else if (kind === 'flag' && v !== true) issues.push({ line: ln, message: `:::${name}: "${k}" is a flag and takes no value` });
          else if (kind === 'string' && v === true) issues.push({ line: ln, message: `:::${name}: "${k}" needs a value, e.g. ${k}="..."` });
        }
        if (name === 'compare' && typeof attrs.diff !== 'string') issues.push({ line: ln, message: ':::compare requires diff="..." describing the single difference' });
        if (body.join('').trim() === '') issues.push({ line: ln, message: `:::${name} has an empty body` });
        segments.push({ kind: 'directive', name: name as DirectiveName, attrs, body: body.join('\n'), line: ln });
      }
      i = j;
      proseStart = j + 2;
      continue;
    }
    if (CLOSE.test(line)) issues.push({ line: ln, message: 'stray ":::" closing line with no open directive' });
    else if (FENCE.test(line)) issues.push({ line: ln, message: 'fenced code blocks are not allowed; use :::code or :::play so the code is verified' });
    else if (/^:::/.test(line)) issues.push({ line: ln, message: `malformed directive line "${line}"` });
    if (prose.length === 0) proseStart = i + 1;
    prose.push(line);
  }
  flushProse();
  return { segments, issues };
}

/** Split a Markdown file into YAML frontmatter and body. */
export function splitFrontmatter(src: string): { frontmatter: string; body: string; bodyLineOffset: number } | null {
  const s = src.replace(/\r\n/g, '\n');
  if (!s.startsWith('---\n')) return null;
  const end = s.indexOf('\n---', 4);
  if (end < 0) return null;
  const after = s.indexOf('\n', end + 4);
  const frontmatter = s.slice(4, end + 1);
  const body = after < 0 ? '' : s.slice(after + 1);
  const bodyLineOffset = s.slice(0, after < 0 ? s.length : after + 1).split('\n').length - 1;
  return { frontmatter, body, bodyLineOffset };
}
