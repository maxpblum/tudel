import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { EventLog } from '../store/log';
import type { LogEvent, NewEvent } from '../store/events';
import { replaySrs, type SrsState } from '../srs';
import { replayMinutes, replaySessions, variantHistory, type SessionsState, type VariantHistory } from '../session';

interface AppCtx {
  log: EventLog;
  clock: () => number;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ log, clock = Date.now, children }: { log: EventLog; clock?: () => number; children: ReactNode }) {
  const value = useMemo(() => ({ log, clock }), [log, clock]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('AppProvider missing');
  return c;
}

export function useEvents(): readonly LogEvent[] {
  const { log } = useApp();
  return useSyncExternalStore(log.subscribe, log.getEvents);
}

/** Durable append: resolves after the event is committed to IndexedDB. Await it before moving on. */
export function useAppend(): (e: NewEvent) => Promise<LogEvent> {
  const { log } = useApp();
  return useCallback((e: NewEvent) => log.append(e), [log]);
}

/** Current time, refreshed every 30 s and on every log change. */
export function useNow(): Date {
  const { clock } = useApp();
  const events = useEvents();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => new Date(clock()), [clock, tick, events]);
}

export interface Derived {
  events: readonly LogEvent[];
  srs: SrsState;
  sessions: SessionsState;
  history: VariantHistory;
  minutes: number;
}

/** All state is derived by replaying the log (pure functions). */
export function useDerived(): Derived {
  const events = useEvents();
  return useMemo(
    () => ({
      events,
      srs: replaySrs(events),
      sessions: replaySessions(events),
      history: variantHistory(events),
      minutes: replayMinutes(events),
    }),
    [events],
  );
}
