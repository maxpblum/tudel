import { useRef, useState } from 'react';
import { content, isFixtureContent } from '../content';
import { exportFileName, parseExport, serializeLog } from '../store/exportImport';
import { LOG_VERSION } from '../store/events';
import { useApp, useEvents } from './appContext';

export function DataPage() {
  const { log, clock } = useApp();
  const events = useEvents();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const doExport = () => {
    const now = new Date(clock());
    const blob = new Blob([serializeLog([...events], now)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFileName(now);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const doImport = async (file: File) => {
    const text = await file.text();
    const r = parseExport(text);
    if (!r.ok) {
      setMsg({ kind: 'error', text: `Import failed: ${r.error}` });
      return;
    }
    const ok = window.confirm(
      `Replace your current progress (${events.length} events) with the file’s ${r.events.length} events? This cannot be undone; export first if unsure.`,
    );
    if (!ok) {
      setMsg({ kind: 'error', text: 'Import cancelled.' });
      return;
    }
    await log.replaceAll(r.events);
    setMsg({ kind: 'ok', text: `Imported ${r.events.length} events${r.fromVersion < LOG_VERSION ? ` (migrated from format version ${r.fromVersion})` : ''}.` });
  };

  return (
    <div className="page" data-testid="data-page">
      <h1>Your data</h1>
      <section className="card">
        <p>
          All progress lives in this browser as an append-only event log (<span data-testid="event-count">{events.length}</span> events, format version {LOG_VERSION}). Export it to back up or move to another browser.
        </p>
        <div className="row">
          <button type="button" className="btn btn-primary" data-testid="export" onClick={doExport}>
            Export progress (JSON)
          </button>
          <button type="button" className="btn" data-testid="import" onClick={() => fileRef.current?.click()}>
            Import progress…
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            data-testid="import-file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) void doImport(f);
            }}
          />
        </div>
        {msg && (
          <p className={msg.kind === 'ok' ? 'ok-note' : 'error-note'} data-testid="import-message">
            {msg.text}
          </p>
        )}
      </section>
      <section className="card muted small">
        <p>
          Content: {content.bundle.skills.length} skills, {content.bundle.variants.length} exercises, hash <code>{content.bundle.contentHash}</code>
          {isFixtureContent ? ' (fixture)' : ''}. Strudel pinned at <code>{content.bundle.strudel.commit}</code>.
        </p>
      </section>
    </div>
  );
}
