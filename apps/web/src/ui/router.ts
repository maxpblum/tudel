import { useEffect, useState } from 'react';

/** Hash routing: `#/library/skill/fx.lowpass` → ['library', 'skill', 'fx.lowpass']. */
export function parseHash(hash: string): string[] {
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
}

export function useRoute(): string[] {
  const [parts, setParts] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const on = () => {
      setParts(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return parts;
}

export function href(...parts: string[]): string {
  return `#/${parts.map(encodeURIComponent).join('/')}`;
}

export function navigate(...parts: string[]) {
  window.location.hash = href(...parts);
}
