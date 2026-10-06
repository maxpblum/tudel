import { createRoot } from 'react-dom/client';
import { EventLog } from './store/log';
import { AppProvider } from './ui/appContext';
import { App } from './ui/App';
import { engine } from './engine';
import { preloadNotation } from './notation/Abc';
import './ui/styles.css';

const root = createRoot(document.getElementById('root')!);

EventLog.open()
  .then(({ log, report }) => {
    if (report.invalid > 0) console.warn(`[store] ${report.invalid} stored events failed validation and are ignored`);
    root.render(
      <AppProvider log={log}>
        <App />
      </AppProvider>,
    );
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1500));
    idle(() => {
      engine.preload();
      preloadNotation();
    });
  })
  .catch((err: unknown) => {
    root.render(
      <div className="page">
        <h1>Storage unavailable</h1>
        <p>This app keeps your progress in IndexedDB, which could not be opened: {String(err)}</p>
      </div>,
    );
  });
