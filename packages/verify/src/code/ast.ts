/**
 * Static analysis of Strudel code with acorn.
 *
 * Strudel's transpiler accepts plain JavaScript (plus `$:` labels, which are ordinary JS
 * labels), so acorn parses reference code directly. We collect:
 *  - every referenced free identifier and every called method name (gate L2),
 *  - the literal arguments of `s()` / `sound()` / `.bank()` (gate L2b, L7),
 *  - every string literal token with its quote style (gate L7).
 */
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

export interface CodeRef {
  name: string;
  /** `ident`: a free identifier (called or not); `method`: `x.name(...)`. */
  kind: 'ident' | 'method';
  called: boolean;
  line: number;
  col: number;
}
export interface SoundArg {
  fn: 's' | 'sound' | 'bank';
  /** The literal string, or null if the argument isn't a plain string literal. */
  value: string | null;
  line: number;
  col: number;
}
/** A quoted string literal token (template literals are not included). */
export interface StringToken {
  raw: string;
  quote: '"' | "'";
  line: number;
  col: number;
}
export interface CodeAnalysis {
  ok: boolean;
  error?: string;
  refs: CodeRef[];
  soundArgs: SoundArg[];
  strings: StringToken[];
  /** Names declared in the code (variables, functions, parameters). */
  declared: Set<string>;
  /** Names registered with `register("name", ...)`, usable as methods afterwards. */
  registered: Set<string>;
}

const PARSE_OPTS: acorn.Options = {
  ecmaVersion: 'latest',
  sourceType: 'module',
  allowAwaitOutsideFunction: true,
  allowReturnOutsideFunction: true,
  locations: true,
};

function collectPatternNames(node: any, out: Set<string>) {
  if (!node) return;
  switch (node.type) {
    case 'Identifier':
      out.add(node.name);
      break;
    case 'ObjectPattern':
      for (const p of node.properties) collectPatternNames(p.type === 'RestElement' ? p.argument : p.value, out);
      break;
    case 'ArrayPattern':
      for (const e of node.elements) collectPatternNames(e, out);
      break;
    case 'RestElement':
      collectPatternNames(node.argument, out);
      break;
    case 'AssignmentPattern':
      collectPatternNames(node.left, out);
      break;
  }
}

function literalString(node: any): string | null {
  if (!node) return null;
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) return node.quasis[0].value.cooked;
  return null;
}

export function parseProgram(code: string, onToken?: (t: acorn.Token) => void): acorn.Program {
  return acorn.parse(code, { ...PARSE_OPTS, onToken });
}

export function analyzeCode(code: string): CodeAnalysis {
  const res: CodeAnalysis = { ok: true, refs: [], soundArgs: [], strings: [], declared: new Set(), registered: new Set() };
  let ast: acorn.Program;
  const tokens: acorn.Token[] = [];
  try {
    ast = parseProgram(code, (t) => tokens.push(t));
  } catch (e) {
    return { ...res, ok: false, error: `JavaScript syntax error: ${(e as Error).message}` };
  }
  for (const t of tokens) {
    if (t.type.label !== 'string') continue;
    const raw = code.slice(t.start, t.end);
    res.strings.push({ raw, quote: raw[0] as StringToken['quote'], line: t.loc!.start.line, col: t.loc!.start.column + 1 });
  }

  walk.full(ast, (node: any) => {
    if (node.type === 'VariableDeclarator') collectPatternNames(node.id, res.declared);
    if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
      if (node.id) res.declared.add(node.id.name);
      for (const p of node.params) collectPatternNames(p, res.declared);
    }
    if (node.type === 'CatchClause' && node.param) collectPatternNames(node.param, res.declared);
    if (node.type === 'ClassDeclaration' && node.id) res.declared.add(node.id.name);
  });

  const at = (n: any) => ({ line: n.loc.start.line, col: n.loc.start.column + 1 });
  const calledIdents = new Set<any>();
  walk.simple(ast, {
    CallExpression(node: any) {
      const callee = node.callee;
      if (callee.type === 'Identifier') {
        calledIdents.add(callee);
        if (callee.name === 's' || callee.name === 'sound') {
          res.soundArgs.push({ fn: callee.name, value: literalString(node.arguments[0]), ...at(node.arguments[0] ?? node) });
        }
        if (callee.name === 'register') {
          const n = literalString(node.arguments[0]);
          if (n) res.registered.add(n);
        }
      } else if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier') {
        const name = callee.property.name;
        res.refs.push({ name, kind: 'method', called: true, ...at(callee.property) });
        if (name === 's' || name === 'sound' || name === 'bank') {
          // `"sawtooth".s()` form: the receiver is the value
          const arg = node.arguments[0] ?? (literalString(callee.object) !== null ? callee.object : null);
          res.soundArgs.push({ fn: name, value: literalString(arg), ...at(arg ?? node) });
        }
      }
    },
  });
  walk.simple(ast, {
    Identifier(node: any) {
      if (res.declared.has(node.name)) return;
      res.refs.push({ name: node.name, kind: 'ident', called: calledIdents.has(node), ...at(node) });
    },
  });
  res.refs.sort((a, b) => a.line - b.line || a.col - b.col);
  return res;
}
