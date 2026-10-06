/**
 * Headless Strudel evaluation in Node.
 *
 * Mirrors Strudel's own test runtime (test/runtime.mjs at the pinned commit) but uses
 * `@strudel/core`'s real `repl()` so REPL-level features (`$:` labels, `setcpm`, `all`,
 * `each`, `hush`) behave exactly as in the learner's tool. A fresh repl is created per
 * evaluation so tempo and labeled patterns never leak between snippets.
 *
 * Nothing that content teaches is mocked here. `@strudel/webaudio` imports fine in Node;
 * audio only happens when a scheduler starts, and we never start one (autostart=false).
 *
 * NOTE: this module must be bundled with esbuild (`--main-fields=module,main`) before
 * running in Node: `@kabelsalat/web` (a dependency of @strudel/core) ships a CJS `main`
 * that plain Node ESM resolution picks, which breaks named imports. See scripts/run.mjs.
 */
import { core, mini, m, tonal, webaudio, transpiler } from './strudel-deps.js';

let scopeReady: Promise<unknown> | undefined;
function ensureScope() {
  scopeReady ??= core.evalScope(core, { mini, m }, tonal, webaudio);
  return scopeReady;
}

export interface EvalResult {
  ok: boolean;
  error?: string;
  /** The evaluated pattern (undefined if evaluation failed). */
  pattern?: any;
  /** Cycles per second after evaluation (reflects setcps/setcpm in the code). */
  cps: number;
  /** Console output Strudel produced while evaluating (minus known-benign lines). */
  logs: string[];
}

/** Lines Strudel always logs on a successful evaluation; not a sign of trouble. */
const BENIGN_LOGS = [/^\[eval\] code updated$/];

/** Evaluate Strudel code exactly as the REPL would, without starting playback. */
export async function evaluateCode(code: string): Promise<EvalResult> {
  await ensureScope();
  let error: unknown;
  // Capture the repl's console output: we report errors ourselves, and any other warning is
  // surfaced to gate L1 (the learner's tool would show it too).
  const logs: string[] = [];
  const orig = { log: console.log, warn: console.warn, error: console.error, info: console.info };
  const capture = (...args: unknown[]) => {
    // Browser-style `%c` styling: drop the markers and their CSS arguments.
    if (typeof args[0] === 'string' && args[0].includes('%c')) {
      const n = args[0].split('%c').length - 1;
      args = [args[0].replace(/%c/g, ''), ...args.slice(1 + n)];
    }
    const line = args.map((a) => (typeof a === 'string' ? a : a instanceof Error ? a.message : JSON.stringify(a))).join(' ');
    if (!BENIGN_LOGS.some((re) => re.test(line))) logs.push(line);
  };
  console.log = console.warn = console.info = capture;
  console.error = () => {};
  try {
    const repl = (core as any).repl({
      transpiler,
      getTime: () => 0,
      defaultOutput: () => {},
      onEvalError: (e: unknown) => (error = e),
    });
    const pattern = await repl.evaluate(code, false);
    if (error || !pattern) {
      return { ok: false, error: String((error as Error)?.message ?? error ?? 'no pattern'), cps: repl.scheduler.cps, logs };
    }
    return { ok: true, pattern, cps: repl.scheduler.cps, logs };
  } finally {
    Object.assign(console, orig);
  }
}

/** Haps formatted like Strudel's own snapshot tests (`hap.show(true)`), sorted by part. */
export async function queryCode(code: string, cycles = 4): Promise<{ ok: boolean; error?: string; haps: string[]; cps: number }> {
  const r = await evaluateCode(code);
  if (!r.ok) return { ok: false, error: r.error, haps: [], cps: r.cps };
  const haps = r.pattern.sortHapsByPart().queryArc(0, cycles);
  return { ok: true, haps: haps.map((h: any) => h.show(true)), cps: r.cps };
}

/** Raw hap objects (for L4 notation agreement and static piano rolls). */
export async function queryHaps(code: string, cycles = 4): Promise<any[]> {
  const r = await evaluateCode(code);
  if (!r.ok) throw new Error(r.error);
  return r.pattern.sortHapsByPart().queryArc(0, cycles);
}

export interface SnippetRun {
  ok: boolean;
  error?: string;
  /** Raw haps from `pattern.sortHapsByPart().queryArc(0, cycles)`. */
  haps: any[];
  /** `hap.show(true)` for each hap (the L3 snapshot lines). */
  shows: string[];
  cps: number;
  logs: string[];
}

/** Evaluate and query in one step, catching query-time errors too. */
export async function runSnippet(code: string, cycles: number): Promise<SnippetRun> {
  const r = await evaluateCode(code);
  if (!r.ok) return { ok: false, error: r.error, haps: [], shows: [], cps: r.cps, logs: r.logs };
  try {
    const haps = r.pattern.sortHapsByPart().queryArc(0, cycles);
    return { ok: true, haps, shows: haps.map((h: any) => h.show(true)), cps: r.cps, logs: r.logs };
  } catch (e) {
    return { ok: false, error: `query failed: ${(e as Error)?.message ?? e}`, haps: [], shows: [], cps: r.cps, logs: r.logs };
  }
}

/** Caches runs by (code, cycles) so every gate sees the same evaluation. */
export class RunCache {
  private runs = new Map<string, Promise<SnippetRun>>();
  run(code: string, cycles: number): Promise<SnippetRun> {
    const key = `${cycles}\u0000${code}`;
    let p = this.runs.get(key);
    if (!p) {
      p = runSnippet(code, cycles);
      this.runs.set(key, p);
    }
    return p;
  }
}
