/**
 * Rendering helpers for the compiler: Shiki code highlighting, Markdown prose (with
 * `{cite}` directives), and Graphviz diagrams. All output is deterministic.
 */
import { createHighlighter, type Highlighter } from 'shiki';
import { instance as vizInstance } from '@viz-js/viz';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { findCites } from '../gates/l8-prose.js';
import { codebergUrl, type Pin } from '../ref/reference.js';

/**
 * Shiki dual themes: the light theme's colors are inline `color:`; the dark theme's are in
 * `--shiki-dark` / `--shiki-dark-bg` CSS variables, which the app switches on in dark mode.
 */
export const SHIKI_THEMES = { light: 'github-light', dark: 'github-dark' } as const;

let hl: Promise<Highlighter> | undefined;
export function highlighter() {
  hl ??= createHighlighter({ themes: [SHIKI_THEMES.light, SHIKI_THEMES.dark], langs: ['javascript'] });
  return hl;
}

export async function highlight(code: string): Promise<string> {
  return (await highlighter()).codeToHtml(code, { lang: 'javascript', themes: SHIKI_THEMES, defaultColor: 'light' });
}

let viz: ReturnType<typeof vizInstance> | undefined;
export async function renderDot(dot: string): Promise<{ svg?: string; error?: string }> {
  viz ??= vizInstance();
  const r = (await viz).render(dot, { format: 'svg' });
  if (r.status !== 'success') return { error: r.errors.map((e) => e.message).join('; ') || 'Graphviz failed' };
  const svg = r.output
    .replace(/<\?xml[^>]*\?>\s*/g, '')
    .replace(/<!DOCTYPE[^>]*>\s*/g, '')
    .replace(/<!--[\s\S]*?-->\s*/g, '')
    .trim();
  return { svg };
}

const md = unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify);

function escapeAttr(s: string) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Numbering state for citations within one document (lesson or prompt). */
export interface CiteState {
  pin: Pin;
  n: number;
}

export function citeHtml(state: CiteState, raw: string): string {
  const c = findCites(raw)[0];
  state.n++;
  let href = 'https://strudel.cc/reference/';
  let title = raw;
  if (c?.doc) title = `Strudel reference: ${c.doc}`;
  else if (c?.src) {
    href = codebergUrl(state.pin, c.src.file, c.src.from, c.src.to);
    title = `Strudel source: ${c.src.file} lines ${c.src.from}-${c.src.to} (pinned ${state.pin.commit.slice(0, 8)})`;
  }
  return `<sup class="cite"><a href="${escapeAttr(href)}" title="${escapeAttr(title)}" target="_blank" rel="noopener noreferrer">[${state.n}]</a></sup>`;
}

/** Markdown → HTML. Raw HTML in the Markdown is dropped (remark-rehype default). */
export function renderMarkdown(src: string, cites: CiteState): string {
  const found: string[] = [];
  const withMarks = src.replace(/\{cite\b[^}]*\}/g, (m) => {
    found.push(m);
    return `CITEMARK${found.length - 1}X`;
  });
  let html = String(md.processSync(withMarks)).trim();
  html = html.replace(/CITEMARK(\d+)X/g, (_, i) => citeHtml(cites, found[Number(i)]!));
  return html;
}

export function htmlToText(html: string): string {
  return html
    .replace(/\s*<sup class="cite">[\s\S]*?<\/sup>/g, '')
    .replace(/<\/?(?:p|div|h\d|li|ul|ol|table|thead|tbody|tr|td|th|br|pre|blockquote|hr)\b[^>]*>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
