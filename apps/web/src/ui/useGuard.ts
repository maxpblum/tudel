import { useCallback, useRef, useState } from 'react';

/**
 * One-at-a-time async actions for buttons that append to the log (start, continue, reveal, rate,
 * skip). `busy` state alone is not enough: two clicks dispatched before React re-renders (e.g.
 * `el.click(); el.click()`, ghost clicks) would both see `busy === false` and append twice. The ref
 * flips synchronously, so the second call is dropped.
 *
 * `release: false` keeps the guard engaged after success, for actions that move the UI away
 * (start session, finish lesson).
 */
export function useGuard(): [boolean, (fn: () => Promise<unknown>, opts?: { release?: boolean }) => Promise<void>] {
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const run = useCallback(async (fn: () => Promise<unknown>, { release = true }: { release?: boolean } = {}) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    let ok = false;
    try {
      await fn();
      ok = true;
    } finally {
      if (release || !ok) {
        running.current = false;
        setBusy(false);
      }
    }
  }, []);
  return [busy, run];
}
