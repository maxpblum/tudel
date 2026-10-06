/**
 * Engine facade: the only module the UI imports. It holds no Strudel code; the real engine
 * (`strudelEngine.ts`, which imports @strudel/web) is loaded lazily on the first play() call, which
 * must happen inside a user gesture (a click), so that the browser lets audio start.
 */
import type { StrudelEngine } from './strudelEngine';
import { rms } from './code';

export interface PlayOptions {
  /** Time-stretch factor (2 = half speed). Ear exercises only. */
  slow?: number;
  /** Loop until stop() (default false: stop after `cycles`). */
  loop?: boolean;
  /** Cycles to play when not looping (default 4). */
  cycles?: number;
  /** Who started playback (e.g. a snippet id), so the UI can show which button is active. */
  ownerId?: string;
}

export type EngineState = 'idle' | 'loading' | 'playing';

export interface EngineStatus {
  state: EngineState;
  ownerId: string | null;
  /** Last error message (evaluation or scheduler), cleared on the next play(). */
  error: string | null;
  /** ownerId of the playback that produced `error`. */
  errorOwnerId: string | null;
  /** Prebake loaders that failed (e.g. CDN sample maps when offline). Null until initialized. */
  failedLoaders: string[] | null;
}

type Listener = (s: EngineStatus) => void;

class Engine {
  private impl: Promise<StrudelEngine> | null = null;
  private status: EngineStatus = { state: 'idle', ownerId: null, error: null, errorOwnerId: null, failedLoaders: null };
  private listeners = new Set<Listener>();
  private errorListeners = new Set<(msg: string) => void>();
  private stopTimer: ReturnType<typeof setTimeout> | null = null;
  private playToken = 0;

  get isPlaying() {
    return this.status.state === 'playing';
  }

  getStatus() {
    return this.status;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.status);
    return () => this.listeners.delete(fn);
  }

  onError(fn: (msg: string) => void): () => void {
    this.errorListeners.add(fn);
    return () => this.errorListeners.delete(fn);
  }

  private set(patch: Partial<EngineStatus>) {
    this.status = { ...this.status, ...patch };
    for (const l of this.listeners) l(this.status);
  }

  private reportError(message: string, ownerId = this.status.ownerId) {
    // Strudel logs eval errors and we also throw them; report once.
    if (message.startsWith('[eval] error')) return;
    this.set({ error: message, errorOwnerId: ownerId });
    for (const l of this.errorListeners) l(message);
  }

  /**
   * Fetch the engine code without initializing audio (no AudioContext is created), so playback still
   * works if the network drops after the page loaded. Called once the app is idle.
   */
  preload(): void {
    void import('./strudelEngine').catch(() => {});
  }

  /** Load and initialize the engine (idempotent). Call from a user gesture. */
  init(): Promise<StrudelEngine> {
    if (!this.impl) {
      this.impl = import('./strudelEngine').then((m) =>
        m.createStrudelEngine({ onError: (msg) => this.reportError(msg) }),
      );
      this.impl.then(
        (e) => this.set({ failedLoaders: e.prebake.failed }),
        (err: unknown) => {
          this.impl = null;
          this.reportError(`engine failed to start: ${(err as Error)?.message ?? String(err)}`);
        },
      );
    }
    return this.impl;
  }

  async play(code: string, opts: PlayOptions = {}): Promise<void> {
    const token = ++this.playToken;
    this.clearTimer();
    const ownerId = opts.ownerId ?? null;
    this.set({ state: 'loading', ownerId, error: null, errorOwnerId: null });
    try {
      const e = await this.init();
      if (token !== this.playToken) return;
      const slow = opts.slow ?? 1;
      const cps = await e.start(code, slow);
      if (token !== this.playToken) return;
      this.set({ state: 'playing' });
      if (!opts.loop) {
        const cycles = opts.cycles ?? 4;
        const ms = (cycles * slow * 1000) / (cps || 0.5);
        this.stopTimer = setTimeout(() => {
          if (token === this.playToken) this.stop();
        }, ms);
      }
    } catch (err) {
      if (token !== this.playToken) return;
      this.set({ state: 'idle', ownerId: null });
      this.reportError((err as Error)?.message ?? String(err), ownerId);
    }
  }

  stop(): void {
    this.playToken++;
    this.clearTimer();
    if (this.impl) void this.impl.then((e) => e.stop(), () => {});
    this.set({ state: 'idle', ownerId: null });
  }

  private clearTimer() {
    if (this.stopTimer) clearTimeout(this.stopTimer);
    this.stopTimer = null;
  }

  /** Attach a live piano roll canvas; returns a detach function. Does not initialize the engine. */
  attachPianoroll(canvas: HTMLCanvasElement): () => void {
    let detach: (() => void) | null = null;
    let cancelled = false;
    if (this.impl) {
      void this.impl.then((e) => {
        if (!cancelled) detach = e.attachPianoroll(canvas);
      }, () => {});
    } else {
      // attach once the engine exists
      const unsub = this.subscribe(() => {
        if (this.impl && !detach && !cancelled) {
          void this.impl.then((e) => {
            if (!cancelled && !detach) detach = e.attachPianoroll(canvas);
          }, () => {});
        }
      });
      return () => {
        cancelled = true;
        unsub();
        detach?.();
      };
    }
    return () => {
      cancelled = true;
      detach?.();
    };
  }

  /**
   * Sample the output tap for `ms` milliseconds; returns the max and mean RMS of 2048-sample windows.
   * Used by gate L6 (the smoke route).
   */
  async measureRms(ms: number): Promise<{ max: number; mean: number }> {
    const e = await this.init();
    const buf = new Float32Array(e.analyser.fftSize);
    let max = 0;
    let sum = 0;
    let n = 0;
    const end = performance.now() + ms;
    while (performance.now() < end) {
      e.analyser.getFloatTimeDomainData(buf);
      const r = rms(buf);
      max = Math.max(max, r);
      sum += r;
      n++;
      await new Promise((res) => setTimeout(res, 40));
    }
    return { max, mean: n ? sum / n : 0 };
  }
}

export const engine = new Engine();
export type { Engine };
