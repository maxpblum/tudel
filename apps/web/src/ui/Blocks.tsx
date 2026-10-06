import type { Block } from '@tudel/content-schema';
import { AbcNotation } from '../notation/Abc';
import { CodeBlock, PlayControls } from './components';
import { EnvelopePlot, FilterPlot, SignalPlot } from './plots';

/** Renders a block list (lesson body, exercise prompt, bridge callout). `idPrefix` makes playback owners unique. */
export function Blocks({ blocks, idPrefix, cycles = 4 }: { blocks: Block[]; idPrefix: string; cycles?: number }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} id={`${idPrefix}:${i}`} cycles={cycles} />
      ))}
    </>
  );
}

function BlockView({ block: b, id, cycles }: { block: Block; id: string; cycles: number }) {
  switch (b.kind) {
    case 'html':
      return <div className="prose" dangerouslySetInnerHTML={{ __html: b.html }} />;
    case 'code':
      return <CodeBlock snippet={b.snippet} />;
    case 'play':
      return (
        <div className="play-block" data-testid="play-block">
          {b.label && <div className="play-label">{b.label}</div>}
          <PlayControls code={b.snippet.code} ownerId={id} cycles={cycles} needsNetwork={b.snippet.needsNetwork} />
          {b.showCode && <CodeBlock snippet={b.snippet} />}
        </div>
      );
    case 'abc':
      return <AbcNotation abc={b.abc} />;
    case 'diagram':
      return <figure className="diagram" data-testid="diagram" dangerouslySetInnerHTML={{ __html: b.svg }} />;
    case 'envelope':
      return <EnvelopePlot {...b} />;
    case 'filter':
      return <FilterPlot {...b} />;
    case 'signal':
      return <SignalPlot {...b} />;
    case 'bridge':
      return (
        <aside className="bridge" data-testid="bridge">
          <div className="bridge-title">{b.title ?? 'Bridge'}</div>
          <Blocks blocks={b.blocks} idPrefix={id} cycles={cycles} />
        </aside>
      );
    case 'compare':
      return (
        <div className="compare" data-testid="compare">
          <div className="compare-diff">
            Difference: <strong>{b.diff}</strong>
          </div>
          <div className="compare-grid">
            {(['a', 'b'] as const).map((k) => (
              <div key={k} className="compare-side">
                <div className="play-label">{b[k].label}</div>
                <PlayControls code={b[k].snippet.code} ownerId={`${id}:${k}`} cycles={cycles} needsNetwork={b[k].snippet.needsNetwork} loopable={false} />
                <CodeBlock snippet={b[k].snippet} />
              </div>
            ))}
          </div>
        </div>
      );
  }
}
