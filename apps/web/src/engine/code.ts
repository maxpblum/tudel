/**
 * Pure helpers for code passed to the engine. Kept free of Strudel imports so they are unit-testable.
 */

/**
 * Slow-down for ear exercises. `all(f)` is injected into the eval scope by the pinned repl
 * (packages/core/repl.mjs, `const all = function (transform) {...}`); every registered transform is
 * applied to the final stacked pattern, including `$:`-labelled parts. `.slow(f)` stretches time by
 * `f`, so `f = 2` plays at half speed with unchanged pitch.
 */
export function slowedCode(code: string, slow: number): string {
  if (!slow || slow === 1) return code;
  if (!Number.isFinite(slow) || slow <= 0) throw new Error(`invalid slow factor ${slow}`);
  return `${code}\nall(x => x.slow(${slow}))`;
}

/** RMS of a block of float samples. */
export function rms(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i]! * samples[i]!;
  return samples.length ? Math.sqrt(sum / samples.length) : 0;
}
