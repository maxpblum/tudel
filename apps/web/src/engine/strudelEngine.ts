/**
 * The real Strudel engine. Browser-only (risk K5): importing @strudel/web assigns `window.initStrudel`.
 * Never import this module statically; `engine/index.ts` loads it with a dynamic import on the first
 * user gesture (Play), so the AudioContext is created during user activation.
 */
import { getAudioContext, getSuperdoughAudioController, initAudio, initStrudel } from '@strudel/web';
import { Drawer, drawPianoroll } from '@strudel/draw';
import { prebake, type PrebakeReport } from './prebake';
import { slowedCode } from './code';

export interface StrudelCallbacks {
  onError(message: string): void;
}

export interface StrudelEngine {
  /** Evaluate and start. Resolves with the effective cycles-per-second after evaluation, or throws. */
  start(code: string, slow: number): Promise<number>;
  stop(): void;
  analyser: AnalyserNode;
  prebake: PrebakeReport;
  attachPianoroll(canvas: HTMLCanvasElement): () => void;
}

if (typeof AudioNode !== 'undefined' && !('__safeDisconnect' in AudioNode.prototype)) {
  const origDisconnect = AudioNode.prototype.disconnect;
  AudioNode.prototype.disconnect = function (this: AudioNode, ...args: any[]) {
    try {
      return (origDisconnect as any).apply(this, args);
    } catch (err: unknown) {
      if (err instanceof DOMException && (err.name === 'InvalidAccessError' || /not connected/i.test(err.message))) {
        return undefined as any;
      }
      throw err;
    }
  };
  (AudioNode.prototype as any).__safeDisconnect = true;
}

export async function createStrudelEngine(cb: StrudelCallbacks): Promise<StrudelEngine> {
  const ctx = getAudioContext();
  void ctx.resume();
  // initStrudel registers a one-shot 'mousedown' listener for initAudio. The gesture that brought us
  // here has already happened, so initialize audio (worklets, resume) explicitly.
  const audioReady = initAudio();
  let report: PrebakeReport = { failed: [] };
  let lastEvalError: unknown = null;
  const repl = await initStrudel({
    prebake: async () => {
      report = await prebake();
    },
    onEvalError: (err: unknown) => {
      lastEvalError = err;
    },
  });
  await audioReady;

  // Scheduler / superdough errors are not thrown; they are reported through Strudel's logger as
  // 'strudel.log' events (e.g. "[getTrigger] error: sound foo not found! Is it loaded?").
  document.addEventListener('strudel.log', (e: Event) => {
    const { message, type } = (e as CustomEvent<{ message: string; type?: string }>).detail;
    if (type === 'error' || /\berror\b/i.test(message)) cb.onError(message);
  });

  // Output tap: superdough mixes every orbit into SuperdoughOutput.destinationGain, which feeds the
  // destination. We connect an AnalyserNode in parallel (it does not alter the signal path).
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  let tappedNode: GainNode | null = null;
  const ensureTap = () => {
    const node = getSuperdoughAudioController().output.destinationGain;
    if (node && node !== tappedNode) {
      node.connect(analyser);
      tappedNode = node;
    }
  };
  ensureTap();

  const drawers = new Set<Drawer>();

  return {
    analyser,
    prebake: report,
    async start(code, slow) {
      lastEvalError = null;
      await ctx.resume();
      ensureTap();
      const pattern = await repl.evaluate(slowedCode(code, slow), true);
      if (lastEvalError || !pattern) {
        const err = lastEvalError as { message?: string } | null;
        throw new Error(err?.message ?? 'evaluation failed');
      }
      for (const d of drawers) d.start(repl.scheduler);
      return repl.scheduler.cps as number;
    },
    stop() {
      repl.stop();
      for (const d of drawers) d.stop();
    },
    attachPianoroll(canvas) {
      const c2d = canvas.getContext('2d');
      if (!c2d) return () => {};
      const drawTime: [number, number] = [-2, 2];
      const fg = getComputedStyle(canvas).color || '#334';
      const drawer = new Drawer((haps, time) => {
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth * dpr;
        const h = canvas.clientHeight * dpr;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        c2d.clearRect(0, 0, canvas.width, canvas.height);
        drawPianoroll({
          ctx: c2d,
          time,
          haps,
          drawTime,
          autorange: 1,
          fold: 1,
          inactive: fg,
          active: fg,
          playheadColor: fg,
          background: 'transparent',
        });
      }, drawTime);
      drawers.add(drawer);
      if (repl.scheduler.started) drawer.start(repl.scheduler);
      return () => {
        drawer.stop();
        drawers.delete(drawer);
        c2d.clearRect(0, 0, canvas.width, canvas.height);
      };
    },
  };
}
