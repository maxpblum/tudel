# Attribution

## License of this project

Strudel Tutor bundles `@strudel/*` packages, which are licensed AGPL-3.0-or-later, so the app as a whole is distributed under the **GNU Affero General Public License v3.0 or later** (see `LICENSE`). For personal, local use, nothing more is required. If the app is ever served to other people over a network, its complete source must be offered to them.

## Software

| Component | License | Notes |
|---|---|---|
| [Strudel](https://codeberg.org/uzu/strudel) (`@strudel/core`, `mini`, `tonal`, `transpiler`, `webaudio`, `web`, `draw`, `soundfonts`, `superdough`) by Felix Roos, Alex McLean, and contributors | AGPL-3.0-or-later | Pinned in `tools/strudel-ref/pin.json`. `tools/strudel-ref/doc.json` is generated from Strudel's JSDoc comments. The app's prebake is adapted from `website/src/repl/prebake.mjs` |
| [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) | MIT | Spaced-repetition scheduling |
| [abcjs](https://github.com/paulrosen/abcjs) | MIT | Staff notation |
| [tonal](https://github.com/tonaljs/tonal) | MIT | Pitch math in the verifier |
| [Shiki](https://shiki.style) | MIT | Build-time code highlighting |
| [@viz-js/viz](https://github.com/mdaines/viz-js) (Graphviz compiled to WebAssembly) | MIT (Graphviz: EPL-1.0) | Build-time diagrams |
| React, Vite, Vitest, Playwright, zod, Prettier, unified/remark/rehype, esbuild, acorn | MIT / Apache-2.0 | Build and test tooling |

## Sounds loaded at runtime (not redistributed)

The app loads Strudel's standard sample banks from `https://strudel.b-cdn.net`, the same CDN strudel.cc uses. These include the Salamander Grand Piano (CC-BY 3.0), VCSL (CC0), tidal-drum-machines, the uzu drumkit and wavetables, mridangam samples, and Dirt-Samples subsets. The licenses are those of the respective sample collections.

## Teaching content

- **The official Strudel workshop** (https://strudel.cc/workshop/, AGPL-3.0-or-later) shaped the teaching order. Variant `snd.filter-sweep.v02` uses the workshop's `sine.range(…).slow(n)` filter idiom (`website/src/pages/workshop/first-effects.mdx`). No workshop text or code is copied verbatim.
- *BreathOfStrudle* (CC BY 4.0) is planned as a source for later milestones. No material from it is used in M1.
- The timbre lexicon (`content/glossary/timbre-lexicon.yaml`) cites published sources for each entry. The works are cited, not reproduced.
- Community song collections without a license (`terryds/awesome-strudel`, `eefano/strudel-songs-collection`) are **link-only** and are never copied.
- All melodies in exercises are original.
