/** Pure math for the small lesson plots (envelope, filter response, signal over time). */

export type Pt = [number, number];

/** ADSR outline: level (0–1) over seconds. `hold` = time the note is held before release starts. */
export function envelopePoints(a: number, d: number, s: number, r: number, hold?: number): { pts: Pt[]; end: number; releaseAt: number } {
  const releaseAt = Math.max(hold ?? a + d + Math.max(0.25, (a + d + r) * 0.4), 0);
  const pts: Pt[] = [[0, 0]];
  if (releaseAt <= a) {
    // released during attack
    const lvl = a > 0 ? releaseAt / a : 1;
    pts.push([releaseAt, lvl], [releaseAt + r, 0]);
  } else if (releaseAt <= a + d) {
    const lvl = 1 - (1 - s) * (d > 0 ? (releaseAt - a) / d : 1);
    pts.push([a, 1], [releaseAt, lvl], [releaseAt + r, 0]);
  } else {
    pts.push([a, 1], [a + d, s], [releaseAt, s], [releaseAt + r, 0]);
  }
  return { pts, end: releaseAt + r, releaseAt };
}

/** Sample rate assumed for the filter plot (typical AudioContext rate). */
export const PLOT_SAMPLE_RATE = 48000;

/**
 * Magnitude in dB, at frequency `f`, of the Web Audio BiquadFilterNode that superdough creates.
 *
 * What superdough passes, at the pin (f610965f): `packages/superdough/superdough.mjs` maps
 * `cutoff`→frequency and `resonance` (lpq; `hresonance` = hpq for hpf; `bandq` for bpf) → `q`, and
 * `createFilter` in `packages/superdough/helpers.mjs` writes `q` (default 1 when unset) **unchanged** into
 * `BiquadFilterNode.Q` for the default 12 dB model (`ftype` "24db" cascades two identical biquads; the
 * "ladder" model is a worklet with different semantics and is not modelled here).
 *
 * How Web Audio interprets Q (W3C Web Audio API, BiquadFilterNode, "Filters characteristics", which
 * uses the Audio EQ Cookbook coefficients): for lowpass/highpass Q is in **dB**,
 * α = sin(w0) / (2·10^(Q/20)), so the gain at the cutoff equals Q dB. For bandpass Q is the **linear**
 * quality factor, α = sin(w0) / (2Q), with 0 dB at the centre.
 */
export function filterDb(type: 'lowpass' | 'highpass' | 'bandpass', cutoff: number, q: number, f: number, sampleRate = PLOT_SAMPLE_RATE): number {
  const w0 = (2 * Math.PI * cutoff) / sampleRate;
  const cos = Math.cos(w0);
  const sin = Math.sin(w0);
  let b0: number, b1: number, b2: number, alpha: number;
  if (type === 'bandpass') {
    alpha = sin / (2 * Math.max(q, 1e-4));
    [b0, b1, b2] = [alpha, 0, -alpha];
  } else {
    alpha = sin / (2 * 10 ** (q / 20));
    [b0, b1, b2] = type === 'lowpass' ? [(1 - cos) / 2, 1 - cos, (1 - cos) / 2] : [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2];
  }
  const [a0, a1, a2] = [1 + alpha, -2 * cos, 1 - alpha];
  // H(e^{jw}) = (b0 + b1 z^-1 + b2 z^-2) / (a0 + a1 z^-1 + a2 z^-2)
  const w = (2 * Math.PI * f) / sampleRate;
  const c1 = Math.cos(w), s1 = Math.sin(w), c2 = Math.cos(2 * w), s2 = Math.sin(2 * w);
  const nr = b0 + b1 * c1 + b2 * c2, ni = -(b1 * s1 + b2 * s2);
  const dr = a0 + a1 * c1 + a2 * c2, di = -(a1 * s1 + a2 * s2);
  const mag = Math.sqrt((nr * nr + ni * ni) / (dr * dr + di * di));
  return 20 * Math.log10(Math.max(mag, 1e-9));
}

/** Strudel signal shapes in 0–1 at cycle position t (packages/core/signal.mjs at the pin). */
export function signalValue(shape: string, t: number): number {
  const ph = ((t % 1) + 1) % 1;
  switch (shape) {
    case 'sine':
      return 0.5 + 0.5 * Math.sin(2 * Math.PI * t);
    case 'cosine':
      return 0.5 + 0.5 * Math.sin(2 * Math.PI * (t + 0.25));
    case 'saw':
      return ph;
    case 'isaw':
      return 1 - ph;
    case 'tri':
      return ph < 0.5 ? ph * 2 : 2 - ph * 2;
    case 'square':
      return Math.floor((t * 2) % 2);
    default: {
      // perlin / rand: illustrative smooth noise (deterministic), not Strudel's exact values
      const i = Math.floor(t * 4);
      const h = (n: number) => {
        const s = Math.sin(n * 127.1) * 43758.5453;
        return s - Math.floor(s);
      };
      if (shape === 'rand') return h(Math.floor(t * 16));
      const f = t * 4 - i;
      const u = f * f * (3 - 2 * f);
      return h(i) * (1 - u) + h(i + 1) * u;
    }
  }
}

/** Sample a signal shape with range [min, max] and period (cycles) over `cycles` cycles. */
export function signalPoints(shape: string, min: number, max: number, period: number, cycles: number, n = 240): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * cycles;
    pts.push([t, min + signalValue(shape, t / Math.max(period, 1e-6)) * (max - min)]);
  }
  return pts;
}

/**
 * Drop axis ticks whose positions are closer than `minGap` (SVG units) so labels never overlap.
 * Ticks are [position, label] sorted by position; the first and last are always kept, and an
 * inner tick that crowds the last one is dropped in its favour.
 */
export function thinTicks<T>(ticks: [number, T][], minGap: number): [number, T][] {
  const out: [number, T][] = [];
  ticks.forEach((t, i) => {
    const prev = out.at(-1);
    if (!prev || t[0] - prev[0] >= minGap) out.push(t);
    else if (i === ticks.length - 1) {
      if (out.length > 1) out[out.length - 1] = t;
    }
  });
  return out;
}
