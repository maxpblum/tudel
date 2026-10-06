import { describe, expect, test } from 'vitest';
import { parseAttrs, parseDirectives, splitFrontmatter } from '../src/content/directives.js';

describe('directive parser', () => {
  test('splits prose and directives, keeping raw bodies and line numbers', () => {
    const src = ['Intro `lpf`.', '', ':::play{label="Saw" hidecode}', 'note("c3")', '  .s("sawtooth")', ':::', 'Outro.'].join('\n');
    const { segments, issues } = parseDirectives(src, 10);
    expect(issues).toEqual([]);
    expect(segments).toEqual([
      { kind: 'prose', text: 'Intro `lpf`.\n', line: 11 },
      { kind: 'directive', name: 'play', attrs: { label: 'Saw', hidecode: true }, body: 'note("c3")\n  .s("sawtooth")', line: 13 },
      { kind: 'prose', text: 'Outro.', line: 17 },
    ]);
  });

  test('parses attributes', () => {
    expect(parseAttrs('diff="lpf 400 → 2000"')).toEqual({ attrs: { diff: 'lpf 400 → 2000' } });
    expect(parseAttrs('a="x" b').attrs).toEqual({ a: 'x', b: true });
    expect(parseAttrs('a="x" a="y"').error).toMatch(/duplicate/);
    expect(parseAttrs('a=x').error).toMatch(/can't parse/);
  });

  const issues = (src: string) => parseDirectives(src).issues.map((i) => `${i.line}: ${i.message}`);

  test('rejects nesting', () => expect(issues(':::bridge\n:::play\nx\n:::\n:::')).toEqual(expect.arrayContaining([expect.stringMatching(/^2: directive :::play inside :::bridge/)])));
  test('rejects unclosed directives', () => expect(issues(':::code\nnote("c3")')).toEqual(['1: :::code is never closed (expected a line containing only ":::")']));
  test('rejects unknown directives', () => expect(issues(':::plya\nx\n:::')[0]).toMatch(/unknown directive :::plya/));
  test('rejects unknown attributes', () => expect(issues(':::code{antipatern}\nx\n:::')[0]).toMatch(/unknown attribute "antipatern"/));
  test('rejects a value on a flag and a flag for a value', () => {
    expect(issues(':::code{antipattern="yes"}\nx\n:::')[0]).toMatch(/is a flag/);
    expect(issues(':::play{label}\nx\n:::')[0]).toMatch(/needs a value/);
  });
  test('compare needs diff', () => expect(issues(':::compare\na: 1\n:::')[0]).toMatch(/requires diff/));
  test('rejects empty bodies', () => expect(issues(':::code\n\n:::')[0]).toMatch(/empty body/));
  test('rejects fenced code in prose (it would bypass the gates)', () => expect(issues('Text\n```js\nnote("c3")\n```')[0]).toMatch(/fenced code blocks are not allowed/));
  test('rejects stray closers and malformed directive lines', () => {
    expect(issues('Text\n:::')[0]).toMatch(/stray/);
    expect(issues(':::play{label="x"')[0]).toMatch(/malformed directive line/);
  });

  test('frontmatter split reports the body line offset', () => {
    const s = splitFrontmatter('---\nid: a\ntitle: T\n---\n\nBody')!;
    expect(s.frontmatter).toBe('id: a\ntitle: T\n');
    expect(s.body).toBe('\nBody');
    expect(s.bodyLineOffset).toBe(4);
    expect(splitFrontmatter('no frontmatter')).toBeNull();
  });
});
