/**
 * Reads content/ from disk into raw (unvalidated) structures. Gate L0 validates them.
 *
 * Layout (docs/plan/M1-plan.md §2.1):
 *   skills.yaml
 *   units/<unit>/lessons/<name>.md          (YAML frontmatter + Markdown with directives)
 *   units/<unit>/exercises/<variant-id>.yaml (one variant per file)
 *   glossary/timbre-lexicon.yaml
 *   glossary/chord-symbols.yaml             (optional in M1)
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { splitFrontmatter } from './directives.js';

export interface RawYaml {
  /** Path relative to the content root, with forward slashes. */
  file: string;
  data?: unknown;
  error?: string;
}
export interface RawLesson {
  file: string;
  unit: string;
  frontmatter?: unknown;
  body: string;
  bodyLineOffset: number;
  error?: string;
}
export interface RawVariant extends RawYaml {
  unit: string;
}
export interface RawContent {
  root: string;
  /** Every file under the content root (relative, sorted). Used for the content hash. */
  files: string[];
  skills: RawYaml | null;
  lessons: RawLesson[];
  variants: RawVariant[];
  lexicon: RawYaml | null;
  chords: RawYaml | null;
  /** Files in places the loader reads from that it won't load (wrong extension, etc.). */
  stray: { file: string; message: string }[];
}

function walk(dir: string, root: string, out: string[]) {
  for (const name of readdirSync(dir).sort()) {
    const abs = path.join(dir, name);
    if (statSync(abs).isDirectory()) walk(abs, root, out);
    else out.push(path.relative(root, abs).split(path.sep).join('/'));
  }
}

function readYaml(root: string, file: string): RawYaml {
  try {
    const data = parseYaml(readFileSync(path.join(root, file), 'utf8'), { prettyErrors: true, uniqueKeys: true });
    return { file, data };
  } catch (e) {
    return { file, error: `YAML parse error: ${(e as Error).message}` };
  }
}

export function loadContent(root: string): RawContent {
  if (!existsSync(root)) throw new Error(`content directory not found: ${root}`);
  const files: string[] = [];
  walk(root, root, files);
  const out: RawContent = {
    root,
    files,
    skills: null,
    lessons: [],
    variants: [],
    lexicon: null,
    chords: null,
    stray: [],
  };
  if (files.includes('skills.yaml')) out.skills = readYaml(root, 'skills.yaml');
  if (files.includes('glossary/timbre-lexicon.yaml')) out.lexicon = readYaml(root, 'glossary/timbre-lexicon.yaml');
  if (files.includes('glossary/chord-symbols.yaml')) out.chords = readYaml(root, 'glossary/chord-symbols.yaml');
  for (const f of files) {
    if (f.endsWith('.yml')) out.stray.push({ file: f, message: 'use the .yaml extension; .yml files are not loaded' });
    const m = /^units\/([^/]+)\/(lessons|exercises)\/(.+)$/.exec(f);
    if (!m) continue;
    const [, unit, kind, rest] = m as unknown as [string, string, string, string];
    if (rest.includes('/')) {
      out.stray.push({ file: f, message: `nested directories under ${kind}/ are not loaded` });
      continue;
    }
    if (kind === 'lessons') {
      if (!f.endsWith('.md')) {
        out.stray.push({ file: f, message: 'lessons must be .md files' });
        continue;
      }
      const src = readFileSync(path.join(root, f), 'utf8');
      const split = splitFrontmatter(src);
      if (!split) {
        out.lessons.push({ file: f, unit, body: src, bodyLineOffset: 0, error: 'missing YAML frontmatter (--- id/title/skill ---)' });
        continue;
      }
      try {
        const frontmatter = parseYaml(split.frontmatter, { uniqueKeys: true });
        out.lessons.push({ file: f, unit, frontmatter, body: split.body, bodyLineOffset: split.bodyLineOffset });
      } catch (e) {
        out.lessons.push({ file: f, unit, body: split.body, bodyLineOffset: split.bodyLineOffset, error: `frontmatter YAML error: ${(e as Error).message}` });
      }
    } else {
      if (!f.endsWith('.yaml')) {
        if (!f.endsWith('.yml')) out.stray.push({ file: f, message: 'exercise variants must be .yaml files' });
        continue;
      }
      out.variants.push({ ...readYaml(root, f), unit });
    }
  }
  return out;
}
