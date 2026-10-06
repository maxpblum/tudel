import { describe, expect, it } from 'vitest';
import { envelopePoints, filterDb, signalValue, signalPoints, thinTicks } from './plotMath';

describe('plot math', () => {
  it('draws ADSR with sustain plateau and release', () => {
    const e = envelopePoints(0.1, 0.2, 0.5, 0.3, 1);
    expect(e.pts).toEqual([[0, 0], [0.1, 1], [0.30000000000000004, 0.5], [1, 0.5], [1.3, 0]]);
    expect(envelopePoints(0.5, 0.2, 0.5, 0.3, 0.25).pts.at(-2)).toEqual([0.25, 0.5]);
  });
  it('filter response follows the Web Audio biquad (Q in dB for lowpass/highpass, linear for bandpass)', () => {
    // lowpass/highpass: gain at the cutoff equals Q in dB
    expect(filterDb('lowpass', 1000, 10, 1000)).toBeCloseTo(10, 6);
    expect(filterDb('lowpass', 1000, 1, 1000)).toBeCloseTo(1, 6); // superdough default q = 1
    expect(filterDb('lowpass', 1000, 0, 1000)).toBeCloseTo(0, 6);
    expect(filterDb('highpass', 800, 10, 800)).toBeCloseTo(10, 6);
    // passband is flat, stopband attenuates at ~12 dB/oct
    expect(filterDb('lowpass', 1000, 1, 10)).toBeCloseTo(0, 2);
    expect(filterDb('highpass', 1000, 1, 20000)).toBeCloseTo(0, 0);
    expect(filterDb('lowpass', 1000, 1, 8000)).toBeLessThan(-30);
    expect(filterDb('highpass', 1000, 1, 125)).toBeLessThan(-30);
    // bandpass: 0 dB at centre for any Q; higher Q is narrower
    expect(filterDb('bandpass', 1000, 10, 1000)).toBeCloseTo(0, 6);
    expect(filterDb('bandpass', 1000, 0.5, 1000)).toBeCloseTo(0, 6);
    expect(filterDb('bandpass', 1000, 10, 2000)).toBeLessThan(filterDb('bandpass', 1000, 1, 2000));
    // a linear-Q (analog) reading of q=10 would give 20 dB at the cutoff; Web Audio gives 10 dB
    expect(filterDb('lowpass', 1000, 10, 1000)).toBeLessThan(15);
  });
  it('signals match Strudel shapes', () => {
    expect(signalValue('sine', 0)).toBeCloseTo(0.5);
    expect(signalValue('sine', 0.25)).toBeCloseTo(1);
    expect(signalValue('cosine', 0)).toBeCloseTo(1);
    expect(signalValue('saw', 0.25)).toBeCloseTo(0.25);
    expect(signalValue('isaw', 0.25)).toBeCloseTo(0.75);
    expect(signalValue('tri', 0.25)).toBeCloseTo(0.5);
    expect(signalValue('square', 0.75)).toBe(1);
    const p = signalPoints('saw', 200, 2000, 4, 4, 4);
    expect(p[2]).toEqual([2, 200 + 0.5 * 1800]);
    for (const s of ['perlin', 'rand']) expect(signalValue(s, 1.3)).toBeGreaterThanOrEqual(0);
  });
  it('thins crowded axis ticks so labels do not overlap (QA: envelope 0.5 s / 0.51 s)', () => {
    expect(thinTicks([[0, 'a'], [100, 'b'], [200, 'c']], 30)).toEqual([[0, 'a'], [100, 'b'], [200, 'c']]);
    // release start right next to the end: keep the end label
    expect(thinTicks([[34, '0 s'], [303, '0.5 s'], [312, '0.51 s']], 30)).toEqual([[34, '0 s'], [312, '0.51 s']]);
    // never drop the first tick, even if the last crowds it
    expect(thinTicks([[0, 'a'], [10, 'b']], 30)).toEqual([[0, 'a']]);
    expect(thinTicks([], 30)).toEqual([]);
  });
});
