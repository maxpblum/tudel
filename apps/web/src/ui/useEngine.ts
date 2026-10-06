import { useEffect, useState } from 'react';
import { engine, type EngineStatus } from '../engine';

export function useEngineStatus(): EngineStatus {
  const [s, setS] = useState(engine.getStatus());
  useEffect(() => engine.subscribe(setS), []);
  return s;
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

/** True when network-needing snippets (CDN sample banks) probably can't load. */
export function useSamplesUnavailable(): boolean {
  const online = useOnline();
  const st = useEngineStatus();
  const networkLoaders = (st.failedLoaders ?? []).filter((l) => l !== 'synths' && l !== 'zzfx');
  return !online || networkLoaders.length > 0;
}
