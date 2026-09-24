import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/**
 * Header search is global; pages that support local filtering call `usePageSearch()`.
 * While such a page is mounted, typing in the header filters that page live and Enter
 * does NOT jump to AI Chat. On other pages Enter sends the query to AURA.
 */
interface SearchCtx { query: string; setQuery: (q: string) => void; local: number; setLocal: (f: (n: number) => number) => void }

const Ctx = createContext<SearchCtx | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  const [local, setLocal] = useState(0);
  const value = useMemo(() => ({ query, setQuery, local, setLocal }), [query, local]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSearchCtx() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSearchCtx must be used inside SearchProvider');
  return c;
}

/** Returns the lower-cased header query and marks this page as locally searchable. */
export function usePageSearch() {
  const { query, setLocal } = useSearchCtx();
  useEffect(() => {
    setLocal((n) => n + 1);
    return () => setLocal((n) => n - 1);
  }, [setLocal]);
  return query.trim().toLowerCase();
}

export const matches = (q: string, ...fields: (string | undefined)[]) => !q || fields.some((f) => f?.toLowerCase().includes(q));
