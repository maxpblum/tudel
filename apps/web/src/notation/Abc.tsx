import { useEffect, useRef, useState } from 'react';

/**
 * Fetch the abcjs chunk without rendering anything, so dictation notation still renders if the
 * network drops after the page loaded (QA M1). Called once the app is idle.
 */
export function preloadNotation(): void {
  void import('abcjs').catch(() => {});
}

/**
 * Renders ABC notation to an SVG staff with abcjs (loaded lazily, browser only).
 */
export function AbcNotation({ abc }: { abc: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    import('abcjs')
      .then((mod) => {
        const abcjs = mod.default ?? mod;
        if (cancelled || !ref.current) return;
        abcjs.renderAbc(ref.current, abc, { responsive: 'resize', add_classes: true, staffwidth: 560, paddingtop: 0, paddingbottom: 0 });
      })
      .catch((e: unknown) => setError(String(e)));
    return () => {
      cancelled = true;
    };
  }, [abc]);
  return (
    <figure className="abc" data-testid="abc">
      <div ref={ref} className="abc-render" />
      {error && <p className="error-note">Could not render notation: {error}</p>}
      <details className="abc-source">
        <summary>ABC source</summary>
        <pre>{abc}</pre>
      </details>
    </figure>
  );
}
