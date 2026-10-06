import { describe, expect, it } from 'vitest';
import { rms, slowedCode } from './code';

describe('engine code helpers', () => {
  it('appends an all(slow) transform only when slowing', () => {
    expect(slowedCode('note("c3")', 1)).toBe('note("c3")');
    expect(slowedCode('note("c3") // x', 2)).toBe('note("c3") // x\nall(x => x.slow(2))');
    expect(() => slowedCode('x', -1)).toThrow();
  });
  it('computes RMS', () => {
    expect(rms(new Float32Array([1, -1, 1, -1]))).toBe(1);
    expect(rms(new Float32Array(0))).toBe(0);
  });
});
