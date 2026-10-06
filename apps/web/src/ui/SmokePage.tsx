/**
 * Hidden route #/__smoke for gate L6: plays every variant's canonical solution and every lesson/prompt
 * play and compare snippet through the real engine, measuring output RMS. Driven by Playwright through
 * `window.__smoke`; also usable by hand.
 */
import { useEffect, useState } from 'react';
import { bundle } from '../content';
import { smokeSnippets, type PlayableSnippet } from '../content/snippets';
import { engine } from '../engine';

export interface SmokeResult {
  id: string;
  maxRms: number;
  meanRms: number;
  errors: string[];
}

export interface SmokeApi {
  snippets: PlayableSnippet[];
  init(): Promise<{ failedLoaders: string[] }>;
  run(id: string, opts?: { ms?: number }): Promise<SmokeResult>;
}

const snippets = smokeSnippets(bundle);

async function waitForSilence(timeoutMs: number) {
  const end = performance.now() + timeoutMs;
  while (performance.now() < end) {
    const { max } = await engine.measureRms(120);
    if (max < 1e-4) return;
  }
}

async function run(id: string, { ms = 3000 } = {}): Promise<SmokeResult> {
  const s = snippets.find((x) => x.id === id);
  if (!s) throw new Error(`unknown snippet ${id}`);
  await waitForSilence(4000);
  const errors: string[] = [];
  const off = engine.onError((m) => errors.push(m));
  try {
    await engine.play(s.code, { loop: true, ownerId: `smoke:${id}` });
    const { max, mean } = await engine.measureRms(ms);
    return { id, maxRms: max, meanRms: mean, errors };
  } finally {
    engine.stop();
    off();
  }
}

const api: SmokeApi = {
  snippets,
  async init() {
    const e = await engine.init();
    return { failedLoaders: e.prebake.failed };
  },
  run,
};

declare global {
  interface Window {
    __smoke?: SmokeApi;
  }
}

export function SmokePage() {
  const [results, setResults] = useState<Record<string, SmokeResult>>({});
  const [running, setRunning] = useState(false);
  useEffect(() => {
    window.__smoke = api;
    return () => {
      delete window.__smoke;
    };
  }, []);
  return (
    <div className="page" data-testid="smoke">
      <h1>Audio smoke test (gate L6)</h1>
      <p className="muted">{snippets.length} snippets. Click to start the engine, then run all.</p>
      <div className="row">
        <button type="button" className="btn" data-testid="smoke-init" onClick={() => void api.init()}>
          Start engine
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={running}
          onClick={async () => {
            setRunning(true);
            for (const s of snippets) {
              const r = await run(s.id).catch((e: unknown) => ({ id: s.id, maxRms: 0, meanRms: 0, errors: [String(e)] }));
              setResults((prev) => ({ ...prev, [s.id]: r }));
            }
            setRunning(false);
          }}
        >
          Run all
        </button>
      </div>
      <table className="smoke-table">
        <tbody>
          {snippets.map((s) => {
            const r = results[s.id];
            return (
              <tr key={s.id}>
                <td>
                  <code>{s.id}</code>
                  {s.needsNetwork && <span className="tag">network</span>}
                </td>
                <td>{r ? r.maxRms.toFixed(4) : ''}</td>
                <td className="error-note">{r?.errors.join('; ')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
