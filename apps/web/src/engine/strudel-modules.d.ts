// The @strudel/* packages ship no TypeScript types. We type only what the engine uses.
declare module '@strudel/web' {
  export const Pattern: any;
  export function initStrudel(options?: Record<string, unknown>): Promise<any>;
  export function evaluate(code: string, autoplay?: boolean): Promise<any>;
  export function hush(): void;
  export function initAudio(options?: Record<string, unknown>): Promise<void>;
  export function getAudioContext(): AudioContext;
  export function getSuperdoughAudioController(): { output: { destinationGain: GainNode | null } };
  export function registerSynthSounds(): Promise<void>;
  export function registerZZFXSounds(): Promise<void>;
  export function samples(map: unknown, base?: string, options?: Record<string, unknown>): Promise<void>;
  export function aliasBank(...args: unknown[]): Promise<void>;
  export function noteToMidi(note: string): number;
  export function valueToMidi(value: unknown): number;
}
declare module '@strudel/draw' {
  export class Drawer {
    constructor(onDraw: (haps: any[], time: number, drawer: Drawer, painters: unknown[]) => void, drawTime: [number, number]);
    start(scheduler: unknown): void;
    stop(): void;
    invalidate(scheduler?: unknown, t?: number): void;
  }
  export function drawPianoroll(options: Record<string, unknown>): void;
}
declare module '@strudel/soundfonts' {
  export function registerSoundfonts(): Promise<void>;
}
