import { envelopePoints, filterDb, signalPoints, thinTicks, type Pt } from './plotMath';

/** Minimum distance between x-axis tick labels (SVG units; labels are ~6 units per character). */
const MIN_TICK_GAP = 30;

const W = 320;
const H = 120;
const PAD = { l: 34, r: 8, t: 8, b: 22 };

function path(pts: Pt[], sx: (x: number) => number, sy: (y: number) => number) {
  return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ');
}

function Frame({ children, label, xTicks, yTicks }: { children: React.ReactNode; label: string; xTicks: [number, string][]; yTicks: [number, string][] }) {
  return (
    <svg className="plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      <rect x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={H - PAD.t - PAD.b} className="plot-bg" />
      {xTicks.map(([x, t], i) => (
        <text key={`x${i}`} x={x} y={H - 6} className="plot-tick" textAnchor={x > W - PAD.r - 12 ? 'end' : 'middle'}>
          {t}
        </text>
      ))}
      {yTicks.map(([y, t], i) => (
        <text key={`y${i}`} x={PAD.l - 4} y={y + 3} className="plot-tick" textAnchor="end">
          {t}
        </text>
      ))}
      {children}
    </svg>
  );
}

const fmt = (n: number) => (Math.abs(n) >= 1000 ? `${+(n / 1000).toFixed(1)}k` : `${+n.toFixed(2)}`);

export function EnvelopePlot({ attack, decay, sustain, release, hold }: { attack: number; decay: number; sustain: number; release: number; hold?: number }) {
  const { pts, end, releaseAt } = envelopePoints(attack, decay, sustain, release, hold);
  const sx = (x: number) => PAD.l + (x / (end || 1)) * (W - PAD.l - PAD.r);
  const sy = (y: number) => H - PAD.b - y * (H - PAD.t - PAD.b);
  return (
    <figure className="plot-figure" data-testid="plot-envelope">
      <Frame label={`Envelope: attack ${attack}, decay ${decay}, sustain ${sustain}, release ${release}`} xTicks={thinTicks([[sx(0), '0 s'], [sx(releaseAt), `${fmt(releaseAt)} s`], [sx(end), `${fmt(end)} s`]], MIN_TICK_GAP)} yTicks={[[sy(0), '0'], [sy(1), '1']]}>
        <line x1={sx(releaseAt)} x2={sx(releaseAt)} y1={PAD.t} y2={H - PAD.b} className="plot-guide" />
        <path d={path(pts, sx, sy)} className="plot-line" />
      </Frame>
      <figcaption>
        attack {attack} s · decay {decay} s · sustain {sustain} · release {release} s
      </figcaption>
    </figure>
  );
}

export function FilterPlot({ type, cutoff, q }: { type: 'lowpass' | 'highpass' | 'bandpass'; cutoff: number; q: number }) {
  const fmin = 20, fmax = 20000, dbMin = -36, dbMax = Math.max(18, type === 'bandpass' ? 0 : q + 6);
  const pts: Pt[] = [];
  for (let i = 0; i <= 200; i++) {
    const f = fmin * (fmax / fmin) ** (i / 200);
    pts.push([f, Math.max(dbMin, Math.min(dbMax, filterDb(type, cutoff, q, f)))]);
  }
  const sx = (f: number) => PAD.l + (Math.log(f / fmin) / Math.log(fmax / fmin)) * (W - PAD.l - PAD.r);
  const sy = (db: number) => PAD.t + ((dbMax - db) / (dbMax - dbMin)) * (H - PAD.t - PAD.b);
  return (
    <figure className="plot-figure" data-testid="plot-filter">
      <Frame label={`${type} filter at ${cutoff} Hz, Q ${q}`} xTicks={[100, 1000, 10000].map((f) => [sx(f), `${fmt(f)}Hz`] as [number, string])} yTicks={[[sy(0), '0 dB'], [sy(-24), '-24']]}>
        <line x1={sx(cutoff)} x2={sx(cutoff)} y1={PAD.t} y2={H - PAD.b} className="plot-guide" />
        <line x1={PAD.l} x2={W - PAD.r} y1={sy(0)} y2={sy(0)} className="plot-guide" />
        <path d={path(pts, sx, sy)} className="plot-line" />
      </Frame>
      <figcaption>
        {type} · cutoff {cutoff} Hz · {type === 'bandpass' ? `Q ${q}` : `resonance ${q} (peak ≈ ${q} dB at the cutoff, as in Web Audio)`}
      </figcaption>
    </figure>
  );
}

export function SignalPlot({ shape, min, max, period, cycles, label }: { shape: string; min: number; max: number; period: number; cycles: number; label?: string }) {
  const pts = signalPoints(shape, min, max, period, cycles);
  const lo = Math.min(min, max), hi = Math.max(min, max);
  const sx = (t: number) => PAD.l + (t / cycles) * (W - PAD.l - PAD.r);
  const sy = (v: number) => H - PAD.b - ((v - lo) / (hi - lo || 1)) * (H - PAD.t - PAD.b);
  const ticks: [number, string][] = Array.from({ length: Math.min(cycles, 16) + 1 }, (_, i) => {
    const c = (i * cycles) / Math.min(cycles, 16);
    return [sx(c), `${+c.toFixed(1)}`];
  });
  return (
    <figure className="plot-figure" data-testid="plot-signal">
      <Frame label={`${shape} from ${min} to ${max}, period ${period} cycles`} xTicks={ticks} yTicks={[[sy(lo), fmt(lo)], [sy(hi), fmt(hi)]]}>
        <path d={path(pts, sx, sy)} className="plot-line" />
      </Frame>
      <figcaption>
        {label ? `${label}: ` : ''}
        {shape} · {min}–{max} · one period = {period} cycle{period === 1 ? '' : 's'} (bars) · x axis in cycles
      </figcaption>
    </figure>
  );
}
