// "BD" component of the UML: a fake backend kept in localStorage via Zustand persist.
// Only src/services/* may import this file. Phase 2 swaps it for Supabase without touching the UI.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SEED } from '@/data/seed';
import type { SeedData } from '@/types';

export interface DbState extends SeedData {
  sessionUserId: string | null;
  lastActivity: number;
  demo: {
    guaranteedMatch: boolean;
    tourDone: boolean;
    /** Mailbox for simulated e-mails (HU-15). */
    outbox: { id: string; to: string; subject: string; body: string; code?: string; createdAt: string }[];
  };
}

function initialState(): DbState {
  // Deep clone so mutations never leak into the imported seed module.
  const seed = JSON.parse(JSON.stringify(SEED)) as SeedData;
  return {
    ...seed,
    sessionUserId: null,
    lastActivity: Date.now(),
    demo: { guaranteedMatch: false, tourDone: false, outbox: [] },
  };
}

export const useDb = create<DbState>()(
  persist(() => initialState(), {
    name: 'kuyaypet-db',
    version: 1,
    storage: createJSONStorage(() => localStorage),
  }),
);

export const db = {
  get: useDb.getState,
  set: useDb.setState,
  reset(keepSession = false) {
    const session = useDb.getState().sessionUserId;
    const tourDone = useDb.getState().demo.tourDone;
    const next = initialState();
    next.demo.tourDone = tourDone;
    if (keepSession) next.sessionUserId = session;
    useDb.setState(next, true);
  },
};

let counter = 0;
export function uid(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

export const nowIso = () => new Date().toISOString();
