/*
 * Prebake: registers the same "built-in" sounds strudel.cc has.
 *
 * Adapted from strudel.cc's website/src/repl/prebake.mjs at the pinned commit
 * (tools/strudel-ref/pin.json, f610965f), https://codeberg.org/uzu/strudel
 * Copyright (C) Strudel contributors. AGPL-3.0-or-later.
 *
 * Differences from the original (see docs/decisions/0102-engine-and-prebake.md):
 *  - `registerSamplesFromDB()` is omitted (user samples stored by the strudel.cc website).
 *  - `import './files.mjs'` (Tauri desktop file access) is omitted.
 *  - `import './piano.mjs'` is omitted: prebake.mjs redefines Pattern.prototype.piano after
 *    importing it, so only the prebake.mjs definition (copied below) was ever effective.
 *  - `Promise.all` became `Promise.allSettled` and the result is reported, so that a missing network
 *    (CDN sample maps unreachable) does not prevent synths from playing. Failures are surfaced
 *    to the UI as an offline banner instead of a rejected init.
 *  - The un-awaited `aliasBank(...)` call gets a `.catch` so that offline use does not raise an
 *    unhandled promise rejection.
 *  - `import.meta.env.BASE_URL` / settings imports are unused here and omitted.
 */
import {
  Pattern,
  aliasBank,
  noteToMidi,
  registerSynthSounds,
  registerZZFXSounds,
  samples,
  valueToMidi,
} from '@strudel/web';

export const baseCDN = 'https://strudel.b-cdn.net';

export interface PrebakeReport {
  /** Labels of loaders that failed (network sample maps, soundfonts). Empty when all succeeded. */
  failed: string[];
}

export async function prebake(): Promise<PrebakeReport> {
  // https://archive.org/details/SalamanderGrandPianoV3
  // License: CC-by http://creativecommons.org/licenses/by/3.0/ Author: Alexander Holm
  const loaders: [string, Promise<unknown>][] = [
    ['synths', registerSynthSounds()],
    ['zzfx', registerZZFXSounds()],
    // need dynamic import here, because importing @strudel/soundfonts fails on server:
    // => getting "window is not defined", as soon as "@strudel/soundfonts" is imported statically
    // seems to be a problem with soundfont2
    ['soundfonts', import('@strudel/soundfonts').then(({ registerSoundfonts }) => registerSoundfonts())],
    ['piano', samples(`${baseCDN}/piano.json`, `${baseCDN}/piano/`, { prebake: true })],
    // https://github.com/sgossner/VCSL/
    // https://api.github.com/repositories/126427031/contents/
    // LICENSE: CC0 general-purpose
    ['vcsl', samples(`${baseCDN}/vcsl.json`, `${baseCDN}/VCSL/`, { prebake: true })],
    [
      'tidal-drum-machines',
      samples(`${baseCDN}/tidal-drum-machines.json`, `${baseCDN}/tidal-drum-machines/machines/`, {
        prebake: true,
        tag: 'drum-machines',
      }),
    ],
    [
      'uzu-drumkit',
      samples(`${baseCDN}/uzu-drumkit.json`, `${baseCDN}/uzu-drumkit/`, {
        prebake: true,
        tag: 'drum-machines',
      }),
    ],
    [
      'uzu-wavetables',
      samples(`${baseCDN}/uzu-wavetables.json`, `${baseCDN}/uzu-wavetables/`, {
        prebake: true,
      }),
    ],
    ['mridangam', samples(`${baseCDN}/mridangam.json`, `${baseCDN}/mrid/`, { prebake: true, tag: 'drum-machines' })],
    [
      'dirt-samples',
      samples(
        {
          casio: ['casio/high.wav', 'casio/low.wav', 'casio/noise.wav'],
          crow: ['crow/000_crow.wav', 'crow/001_crow2.wav', 'crow/002_crow3.wav', 'crow/003_crow4.wav'],
          insect: [
            'insect/000_everglades_conehead.wav',
            'insect/001_robust_shieldback.wav',
            'insect/002_seashore_meadow_katydid.wav',
          ],
          wind: [
            'wind/000_wind1.wav',
            'wind/001_wind10.wav',
            'wind/002_wind2.wav',
            'wind/003_wind3.wav',
            'wind/004_wind4.wav',
            'wind/005_wind5.wav',
            'wind/006_wind6.wav',
            'wind/007_wind7.wav',
            'wind/008_wind8.wav',
            'wind/009_wind9.wav',
          ],
          jazz: [
            'jazz/000_BD.wav',
            'jazz/001_CB.wav',
            'jazz/002_FX.wav',
            'jazz/003_HH.wav',
            'jazz/004_OH.wav',
            'jazz/005_P1.wav',
            'jazz/006_P2.wav',
            'jazz/007_SN.wav',
          ],
          metal: [
            'metal/000_0.wav',
            'metal/001_1.wav',
            'metal/002_2.wav',
            'metal/003_3.wav',
            'metal/004_4.wav',
            'metal/005_5.wav',
            'metal/006_6.wav',
            'metal/007_7.wav',
            'metal/008_8.wav',
            'metal/009_9.wav',
          ],
          east: [
            'east/000_nipon_wood_block.wav',
            'east/001_ohkawa_mute.wav',
            'east/002_ohkawa_open.wav',
            'east/003_shime_hi.wav',
            'east/004_shime_hi_2.wav',
            'east/005_shime_mute.wav',
            'east/006_taiko_1.wav',
            'east/007_taiko_2.wav',
            'east/008_taiko_3.wav',
          ],
          space: [
            'space/000_0.wav',
            'space/001_1.wav',
            'space/002_11.wav',
            'space/003_12.wav',
            'space/004_13.wav',
            'space/005_14.wav',
            'space/006_15.wav',
            'space/007_16.wav',
            'space/008_17.wav',
            'space/009_18.wav',
            'space/010_2.wav',
            'space/011_3.wav',
            'space/012_4.wav',
            'space/013_5.wav',
            'space/014_6.wav',
            'space/015_7.wav',
            'space/016_8.wav',
            'space/017_9.wav',
          ],
          numbers: [
            'numbers/0.wav',
            'numbers/1.wav',
            'numbers/2.wav',
            'numbers/3.wav',
            'numbers/4.wav',
            'numbers/5.wav',
            'numbers/6.wav',
            'numbers/7.wav',
            'numbers/8.wav',
          ],
          num: [
            'num/00.wav',
            'num/01.wav',
            'num/02.wav',
            'num/03.wav',
            'num/04.wav',
            'num/05.wav',
            'num/06.wav',
            'num/07.wav',
            'num/08.wav',
            'num/09.wav',
            'num/10.wav',
            'num/11.wav',
            'num/12.wav',
            'num/13.wav',
            'num/14.wav',
            'num/15.wav',
            'num/16.wav',
            'num/17.wav',
            'num/18.wav',
            'num/19.wav',
            'num/20.wav',
          ],
        },
        `${baseCDN}/Dirt-Samples/`,
        {
          prebake: true,
        },
      ),
    ],
  ];
  const results = await Promise.allSettled(loaders.map(([, p]) => p));
  const failed = loaders.filter((_, i) => results[i]!.status === 'rejected').map(([label]) => label);

  aliasBank(`${baseCDN}/tidal-drum-machines-alias.json`).catch(() => {
    failed.push('drum-machine-aliases');
  });
  return { failed };
}

const maxPan = noteToMidi('C8');
const panwidth = (pan: number, width: number) => pan * width + (1 - width) / 2;

Pattern.prototype.piano = function () {
  return this.fmap((v: any) => ({ ...v, clip: v.clip ?? 1 })) // set clip if not already set..
    .s('piano')
    .release(0.1)
    .fmap((value: any) => {
      const midi = valueToMidi(value);
      // pan by pitch
      const pan = panwidth(Math.min(Math.round(midi) / maxPan, 1), 0.5);
      return { ...value, pan: (value.pan || 1) * pan };
    });
};
