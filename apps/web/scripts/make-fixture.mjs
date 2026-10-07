// Generates src/content/fixture.bundle.json: a small, schema-conforming bundle used by unit tests and
// by dev/build when the real bundle (src/content/bundle.json, written by `pnpm verify`) is absent.
// It is NOT verified content. Run: node scripts/make-fixture.mjs
import { writeFileSync } from 'node:fs';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const snip = (code, needsNetwork = false) => ({
  code,
  html: `<pre class="shiki fixture"><code>${esc(code)}</code></pre>`,
  needsNetwork,
});
const html = (h) => ({ kind: 'html', html: h });
const midi = { c3: 48, e3: 52, g3: 55, a2: 45, c4: 60, d3: 50, b2: 47 };
const seqRoll = (notes, cycles, s) => {
  const out = [];
  for (let c = 0; c < cycles; c++)
    notes.forEach((n, i) => {
      const step = 1 / notes.length;
      out.push({ b: c + i * step, e: c + (i + 1) * step, midi: n ? midi[n] : null, s });
    });
  return out;
};

const units = [
  { id: 'u1', title: 'Time & rhythm (fixture)', milestone: 'M2', summary: 'Fixture unit for interleaving tests.', order: 1 },
  { id: 'u3a', title: 'Sound basics (fixture)', milestone: 'M1', summary: 'Fixture unit: waveforms, filters, envelopes.', order: 3 },
];

const skills = [
  {
    id: 'fx.waveforms', unit: 'u3a', title: 'Waveforms', prereqs: [], summary: 'Pick a waveform with s().',
    vocabulary: ['s', 'note'], lesson: 'fx.waveforms.lesson', idiom_note: 'Say what is played, then with what sound.',
    variants: ['fx.waveforms.v01', 'fx.waveforms.v02', 'fx.waveforms.v03'],
  },
  {
    id: 'fx.lowpass', unit: 'u3a', title: 'Low-pass filter', prereqs: ['fx.waveforms'], summary: 'Darken a sound with lpf.',
    vocabulary: ['lpf', 'lpq'], lesson: 'fx.lowpass.lesson', idiom_note: 'Filter after the source, before the amp.',
    variants: ['fx.lowpass.v01', 'fx.lowpass.v02', 'fx.lowpass.v03'],
  },
  {
    id: 'fx.envelope', unit: 'u3a', title: 'Amplitude envelope', prereqs: ['fx.waveforms'], summary: 'Shape onset and decay.',
    vocabulary: ['attack', 'decay', 'sustain', 'release'], lesson: 'fx.envelope.lesson', idiom_note: 'Envelopes shape character more than notes do.',
    variants: ['fx.envelope.v01', 'fx.envelope.v02'],
  },
  {
    id: 'fx.drums', unit: 'u1', title: 'First beat', prereqs: [], summary: 'Play drum samples with s().',
    vocabulary: ['s'], lesson: 'fx.drums.lesson', idiom_note: 'Mini-notation is the score.',
    variants: ['fx.drums.v01', 'fx.drums.v02'],
  },
];

const lessons = [
  {
    id: 'fx.waveforms.lesson', title: 'Four waveforms', skill: 'fx.waveforms',
    blocks: [
      html('<p>Strudel has four basic oscillator waveforms. Think of them as organ stops: same pitch, different colour.</p>'),
      { kind: 'play', label: 'Sawtooth', showCode: true, snippet: snip('note("c3 e3 g3").s("sawtooth")') },
      { kind: 'play', label: 'Mystery sound', showCode: false, snippet: snip('note("c3 e3 g3").s("square")') },
      { kind: 'code', snippet: snip('note("c3").s("triangle")') },
      { kind: 'abc', abc: 'X:1\nM:4/4\nL:1/4\nK:C clef=bass\nC, E, G, z|' },
      { kind: 'diagram', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40"><rect x="1" y="5" width="60" height="30" fill="none" stroke="currentColor"/><text x="10" y="25" font-size="12" fill="currentColor">osc</text><line x1="61" y1="20" x2="120" y2="20" stroke="currentColor"/><text x="125" y="25" font-size="12" fill="currentColor">out</text></svg>' },
      {
        kind: 'bridge', title: 'From the organ loft',
        blocks: [html('<p>A waveform is like a registration: an 8′ flute versus an 8′ reed.</p>')],
      },
      {
        kind: 'compare', diff: 's "sine" → "sawtooth"',
        a: { label: 'Sine', snippet: snip('note("c3").s("sine")') },
        b: { label: 'Sawtooth', snippet: snip('note("c3").s("sawtooth")') },
      },
    ],
    text: 'Strudel has four basic oscillator waveforms.',
  },
  {
    id: 'fx.lowpass.lesson', title: 'The low-pass filter', skill: 'fx.lowpass',
    blocks: [
      html('<p>A low-pass filter removes frequencies above its <code>lpf</code> cutoff.</p>'),
      { kind: 'filter', type: 'lowpass', curves: [{ cutoff: 800, q: 1 }] },
      {
        kind: 'filter', type: 'lowpass', title: 'Same cutoff (800 Hz), different resonance',
        curves: [{ cutoff: 800, q: 1, label: 'lpq 1 (default)' }, { cutoff: 800, q: 10, label: 'lpq 10' }, { cutoff: 800, q: 18, label: 'lpq 18' }],
      },
      { kind: 'signal', shape: 'sine', min: 200, max: 2000, period: 4, cycles: 8, label: 'lpf sweep' },
      {
        kind: 'compare', diff: 'lpf 400 → 2000',
        a: { label: 'Dark', snippet: snip('note("c3 e3 g3").s("sawtooth").lpf(400)') },
        b: { label: 'Bright', snippet: snip('note("c3 e3 g3").s("sawtooth").lpf(2000)') },
      },
    ],
    text: 'A low-pass filter removes frequencies above its cutoff.',
  },
  {
    id: 'fx.envelope.lesson', title: 'ADSR', skill: 'fx.envelope',
    blocks: [
      html('<p>Attack, decay, sustain and release shape the loudness of each note.</p>'),
      { kind: 'envelope', attack: 0.3, decay: 0.2, sustain: 0.6, release: 0.5, hold: 1 },
      { kind: 'play', label: 'Slow attack', showCode: true, snippet: snip('note("c3").s("sawtooth").attack(0.5)') },
    ],
    text: 'Attack, decay, sustain and release shape the loudness of each note.',
  },
  {
    id: 'fx.drums.lesson', title: 'A first beat', skill: 'fx.drums',
    blocks: [
      html('<p>Sample names go in <code>s</code>. These load from the CDN.</p>'),
      { kind: 'play', label: 'Beat', showCode: true, snippet: snip('s("bd sd bd sd")', true) },
    ],
    text: 'Sample names go in s.',
  },
];

const variant = (o) => ({
  abc: null, starter: null, hideReferenceCodeUntilReveal: true, listenFor: [], rubric: null, cycles: 2, sources: [], difficulty: 1,
  ...o,
});
const variants = [
  variant({
    id: 'fx.waveforms.v01', skills: ['fx.waveforms'], type: 'dictation', title: 'Arpeggio on a saw',
    prompt: [html('<p>Write this arpeggio with a sawtooth.</p>')],
    abc: 'X:1\nM:4/4\nL:1/4\nK:C clef=bass\nC, E, G, z|',
    solutions: [{ snippet: snip('note("c3 e3 g3 ~").s("sawtooth")') }],
    listenFor: ['Buzzy, bright tone'],
    roll: seqRoll(['c3', 'e3', 'g3', null], 2, 'sawtooth').filter((h) => h.midi !== null),
  }),
  variant({
    id: 'fx.waveforms.v02', skills: ['fx.waveforms'], type: 'match-by-ear', title: 'Which wave?',
    prompt: [html('<p>Listen and recreate the sound.</p>')],
    solutions: [{ snippet: snip('note("c3 g3").s("square")') }, { snippet: snip('note("c3 g3").s("square").gain(1)'), note: 'Explicit default gain.' }],
    listenFor: ['Hollow, clarinet-like'],
    roll: seqRoll(['c3', 'g3'], 2, 'square'),
  }),
  variant({
    id: 'fx.waveforms.v03', skills: ['fx.waveforms'], type: 'describe-to-code', title: 'Soft and pure',
    prompt: [html('<p>A soft, pure tone on C3 and E3.</p>')],
    solutions: [{ snippet: snip('note("c3 e3").s("sine")') }],
    listenFor: ['No buzz at all'],
    roll: seqRoll(['c3', 'e3'], 2, 'sine'),
  }),
  variant({
    id: 'fx.lowpass.v01', skills: ['fx.lowpass', 'fx.waveforms'], type: 'spec-to-code', title: 'Dark saw',
    prompt: [html('<p>Saw on C3–E3–G3, low-pass at 800 Hz.</p>')],
    solutions: [{ snippet: snip('note("c3 e3 g3").s("sawtooth").lpf(800)') }],
    listenFor: ['Muted top end'],
    roll: seqRoll(['c3', 'e3', 'g3'], 2, 'sawtooth'),
  }),
  variant({
    id: 'fx.lowpass.v02', skills: ['fx.lowpass'], type: 'sweep', title: 'Opening filter',
    prompt: [html('<p>Make the filter open over four bars.</p>')],
    solutions: [{ snippet: snip('note("c3*4").s("sawtooth").lpf(sine.range(200, 2000).slow(4))') }],
    listenFor: ['Brightness rises and falls over four bars'],
    rubric: null, cycles: 4,
    roll: seqRoll(['c3', 'c3', 'c3', 'c3'], 4, 'sawtooth'),
  }),
  variant({
    id: 'fx.lowpass.v03', skills: ['fx.lowpass'], type: 'ear-dictation', title: 'Bass line by ear',
    prompt: [html('<p>Write down the bass line you hear.</p>')],
    solutions: [{ snippet: snip('note("a2 c3 d3 b2").s("sawtooth").lpf(600)') }],
    listenFor: ['Four notes per bar'],
    roll: seqRoll(['a2', 'c3', 'd3', 'b2'], 2, 'sawtooth'),
  }),
  variant({
    id: 'fx.envelope.v01', skills: ['fx.envelope'], type: 'transform', title: 'Make it swell',
    prompt: [html('<p>Give the starter a slow attack.</p>')],
    starter: snip('note("c3 e3").s("sawtooth")'), hideReferenceCodeUntilReveal: true,
    solutions: [{ snippet: snip('note("c3 e3").s("sawtooth").attack(0.4)') }],
    listenFor: ['Notes fade in'],
    roll: seqRoll(['c3', 'e3'], 2, 'sawtooth'),
  }),
  variant({
    id: 'fx.envelope.v02', skills: ['fx.envelope'], type: 'read-the-code', title: 'Predict the pluck',
    prompt: [html('<p>Predict how this sounds, then play it.</p>')],
    hideReferenceCodeUntilReveal: false,
    solutions: [{ snippet: snip('note("c4 g3").s("triangle").decay(0.1).sustain(0)') }],
    rubric: ['Did you predict a short pluck?'],
    roll: [{ b: 0, e: 0.5, midi: 60, s: 'triangle' }, { b: 0.5, e: 1, midi: 55, s: 'triangle' }, { b: 1, e: 1.5, midi: 60, s: 'triangle' }, { b: 1.5, e: 2, midi: 55, s: 'triangle' }],
  }),
  variant({
    id: 'fx.drums.v01', skills: ['fx.drums'], type: 'recall', title: 'Four on the floor',
    prompt: [html('<p>Kick on every beat.</p>')],
    solutions: [{ snippet: snip('s("bd*4")', true) }],
    roll: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ b: i / 4, e: (i + 1) / 4, midi: null, s: 'bd' })),
  }),
  variant({
    id: 'fx.drums.v02', skills: ['fx.drums'], type: 'creative', title: 'Your own beat',
    prompt: [html('<p>Write a one-bar beat with kick and snare.</p>')],
    solutions: [{ snippet: snip('s("bd sd bd sd")', true) }],
    rubric: ['Kick and snare both present', 'Fits in one bar'],
    roll: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ b: i / 4, e: (i + 1) / 4, midi: null, s: i % 2 ? 'sd' : 'bd' })),
  }),
];

const bundle = {
  schemaVersion: 2,
  strudel: { commit: 'f610965f', npm: { '@strudel/web': '1.3.0', '@strudel/core': '1.2.6' } },
  contentHash: 'fixture-0001',
  units,
  skills,
  lessons,
  variants,
  lexicon: [
    {
      term: 'warm', tendencies: ['lower lpf cutoff'], status: 'canonical', confidence: 'medium',
      sources: [{ title: 'Fixture source', url: 'https://example.org/warm' }],
    },
  ],
  chords: [
    { symbol: 'Cmaj7', tones: ['C', 'E', 'G', 'B'], name: 'C major seventh', skills: ['fx.waveforms'] },
  ],
  terms: [
    { name: 'attack', synopsis: 'Amplitude envelope attack time: Specifies how long it takes for the sound to reach its peak value, relative to the onset.', synonyms: ['att'], skills: ['fx.envelope'] },
    { name: 'decay', synopsis: 'Amplitude envelope decay time: the time it takes after the attack time to reach the sustain level.', synonyms: ['dec'], skills: ['fx.envelope'] },
    { name: 'lpf', synopsis: 'Applies the cutoff frequency of the low-pass filter.', synonyms: ['cutoff', 'ctf', 'lp'], skills: ['fx.lowpass'] },
    { name: 'lpq', synopsis: 'Controls the low-pass q-value.', synonyms: ['resonance'], skills: ['fx.lowpass'] },
    { name: 'note', synopsis: 'Plays the given note name or midi number.', synonyms: [], skills: ['fx.waveforms'] },
    { name: 'release', synopsis: 'Amplitude envelope release time: The time it takes after the offset to go from sustain level to zero.', synonyms: ['rel'], skills: ['fx.envelope'] },
    { name: 's', synopsis: 'Select a sound / sample by name.', synonyms: ['sound'], skills: ['fx.waveforms', 'fx.drums'] },
    { name: 'sustain', synopsis: 'Amplitude envelope sustain level: The level which is reached after attack / decay, being sustained until the offset.', synonyms: ['sus'], skills: ['fx.envelope'] },
  ],
};
writeFileSync(new URL('../src/content/fixture.bundle.json', import.meta.url), JSON.stringify(bundle, null, 2) + '\n');
console.log('wrote fixture.bundle.json');
