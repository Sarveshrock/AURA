import { useSyncExternalStore } from 'react';

/**
 * Minimal shared store (no dependency). Screens that show the same data
 * (e.g. Automation Hub + Automations) read/write one store.
 * Swap `initial` for an API/Supabase loader later without touching components.
 */
export function createStore<T>(initial: T) {
  let state = initial;
  const subs = new Set<() => void>();
  const get = () => state;
  const set = (update: T | ((prev: T) => T)) => {
    state = typeof update === 'function' ? (update as (prev: T) => T)(state) : update;
    subs.forEach((f) => f());
  };
  const subscribe = (f: () => void) => {
    subs.add(f);
    return () => { subs.delete(f); };
  };
  const use = () => useSyncExternalStore(subscribe, get, get);
  return { get, set, use };
}

let seq = 0;
export const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${(seq++).toString(36)}`;
