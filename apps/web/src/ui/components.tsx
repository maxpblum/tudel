import { useEffect, useRef, useState } from 'react';
import type { CodeSnippet, RollHap } from '@tutor/content-schema';
import { engine } from '../engine';
import { useEngineStatus, useSamplesUnavailable } from './useEngine';

async function writeClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for contexts without the async clipboard API
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <button
      type="button"
      className="btn btn-small copy-btn"
      data-testid="copy"
      aria-label={`${label} code to clipboard`}
      onClick={async () => {
        await writeClipboard(text);
        setCopied(true);
      }}
    >
      {copied ? 'Copied' : label}
    </button>
  );
}

/** Read-only highlighted code (pre-rendered by Shiki at build time) with a copy button. No editing. */
export function CodeBlock({ snippet, caption }: { snippet: CodeSnippet; caption?: string }) {
  return (
    <div className="code-block" data-testid="code-block">
      <div className="code-toolbar">
        <span className="code-caption">{caption ?? ''}</span>
        {snippet.needsNetwork && <span className="tag" title="Uses sample banks from the Strudel CDN">network</span>}
        <CopyButton text={snippet.code} />
      </div>
      <div className="code-html" dangerouslySetInnerHTML={{ __html: snippet.html }} />
    </div>
  );
}

export const SLOW_OPTIONS = [
  { label: '1×', slow: 1 },
  { label: '0.75×', slow: 4 / 3 },
  { label: '0.5×', slow: 2 },
];

export interface PlayControlsProps {
  code: string;
  ownerId: string;
  label?: string;
  cycles?: number;
  needsNetwork?: boolean;
  /** Show loop toggle (default true). */
  loopable?: boolean;
  /** Show the slow-down selector (ear exercises). */
  slowable?: boolean;
  onPlay?: () => void;
}

export function PlayControls({ code, ownerId, label = 'Play', cycles = 4, needsNetwork, loopable = true, slowable, onPlay }: PlayControlsProps) {
  const st = useEngineStatus();
  const [loop, setLoop] = useState(false);
  const [slow, setSlow] = useState(1);
  const samplesUnavailable = useSamplesUnavailable();
  const mine = st.ownerId === ownerId;
  const active = mine && st.state !== 'idle';
  // Playback belongs to the controls that started it: when they unmount (navigation, next session
  // step, reveal), stop, or a looping snippet keeps sounding with no Stop button on screen (QA M1).
  useEffect(
    () => () => {
      if (engine.getStatus().ownerId === ownerId) engine.stop();
    },
    [ownerId],
  );
  return (
    <div className="play-controls" data-testid="play-controls">
      <button
        type="button"
        className={`btn ${active ? 'btn-stop' : 'btn-play'}`}
        data-testid={active ? 'stop' : 'play'}
        onClick={() => {
          if (active) engine.stop();
          else {
            onPlay?.();
            void engine.play(code, { ownerId, loop, cycles, slow });
          }
        }}
      >
        {active ? (st.state === 'loading' ? 'Loading…' : '■ Stop') : `▶ ${label}`}
      </button>
      {loopable && (
        <label className="check">
          <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} /> Loop
        </label>
      )}
      {slowable && (
        <label className="check">
          Speed{' '}
          <select value={slow} onChange={(e) => setSlow(Number(e.target.value))} aria-label="Playback speed">
            {SLOW_OPTIONS.map((o) => (
              <option key={o.label} value={o.slow}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      )}
      {needsNetwork && samplesUnavailable && (
        <span className="offline-note" data-testid="offline-note">
          Needs network: uses sample banks from the Strudel CDN.
        </span>
      )}
      {st.error && st.errorOwnerId === ownerId && <span className="error-note">Playback error: {st.error}</span>}
    </div>
  );
}

/** Live piano roll (@strudel/draw) of whatever the engine is playing. */
export function LivePianoRoll() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    return engine.attachPianoroll(ref.current);
  }, []);
  return <canvas ref={ref} className="live-roll" aria-label="Live piano roll" data-testid="live-roll" />;
}

/** Static piano roll from the verifier's haps. Pitched haps by MIDI; unpitched by sound name. */
export function StaticPianoRoll({ roll, cycles }: { roll: RollHap[]; cycles: number }) {
  if (!roll.length) return null;
  const W = 600;
  const H = 120;
  const pitched = roll.filter((h) => h.midi !== null);
  const unpitched = roll.filter((h) => h.midi === null);
  const names = [...new Set(unpitched.map((h) => h.s ?? '?'))];
  const lo = pitched.length ? Math.min(...pitched.map((h) => h.midi!)) : 0;
  const hi = pitched.length ? Math.max(...pitched.map((h) => h.midi!)) : 0;
  const rows = (pitched.length ? hi - lo + 1 : 0) + names.length;
  const rowH = Math.max(3, Math.min(14, (H - 4) / Math.max(rows, 1)));
  const height = rows * rowH + 4;
  const x = (t: number) => (t / cycles) * W;
  const rowOf = (h: RollHap) => (h.midi !== null ? hi - h.midi : (hi - lo + (pitched.length ? 1 : 0)) + names.indexOf(h.s ?? '?'));
  return (
    <svg className="static-roll" viewBox={`0 0 ${W} ${height}`} role="img" aria-label="Piano roll of the reference" data-testid="static-roll">
      {Array.from({ length: cycles + 1 }, (_, c) => (
        <line key={c} x1={x(c)} x2={x(c)} y1={0} y2={height} className="roll-bar" />
      ))}
      {roll.map((h, i) => (
        <rect key={i} x={x(h.b) + 0.5} y={2 + rowOf(h) * rowH} width={Math.max(1, x(h.e) - x(h.b) - 1)} height={rowH - 1} rx={1.5} className={h.midi === null ? 'roll-hap unpitched' : 'roll-hap'}>
          <title>{h.midi !== null ? `midi ${h.midi}` : h.s} @ {h.b.toFixed(2)}</title>
        </rect>
      ))}
    </svg>
  );
}
