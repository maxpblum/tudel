/**
 * Minimal IndexedDB wrapper for the event log. One object store `events` with auto-increment keys, so
 * key order is append order. Every write resolves only after its transaction commits.
 */
export const DB_NAME = 'strudel-tutor';
const DB_VERSION = 1;
const STORE = 'events';

export interface EventDb {
  getAll(): Promise<Record<string, unknown>[]>;
  append(event: object): Promise<void>;
  replaceAll(events: object[]): Promise<void>;
  close(): void;
}

function req<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('transaction aborted'));
  });
}

export async function openEventDb(name = DB_NAME, factory: IDBFactory = indexedDB): Promise<EventDb> {
  const open = factory.open(name, DB_VERSION);
  open.onupgradeneeded = () => {
    const db = open.result;
    if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { autoIncrement: true });
  };
  const db = await req(open);
  return {
    async getAll() {
      const tx = db.transaction(STORE, 'readonly');
      const all = await req(tx.objectStore(STORE).getAll());
      await done(tx);
      return all as Record<string, unknown>[];
    },
    async append(event) {
      const tx = db.transaction(STORE, 'readwrite', { durability: 'strict' });
      tx.objectStore(STORE).add(event);
      await done(tx);
    },
    async replaceAll(events) {
      const tx = db.transaction(STORE, 'readwrite', { durability: 'strict' });
      const store = tx.objectStore(STORE);
      store.clear();
      for (const e of events) store.add(e);
      await done(tx);
    },
    close() {
      db.close();
    },
  };
}
