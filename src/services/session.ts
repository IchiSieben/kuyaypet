// Sesión (UML) — split-screen sync. Both phones share localStorage; the `storage` event tells each frame
// that the other one wrote, so it re-reads the db and surfaces what arrived (toast, Match celebration).
import { db, FRAME_ROLE, useDb } from './store';
import { toast, useUi } from './ui';

export const IS_SPLIT_FRAME = !!FRAME_ROLE;

export function initFrameSync() {
  if (!IS_SPLIT_FRAME) return;
  window.addEventListener('storage', async (e) => {
    if (e.key !== 'kuyaypet-db') return;
    const me = db.get().sessionUserId;
    const seenNotes = new Set(db.get().notifications.map((n) => n.id));
    const seenMatches = new Set(db.get().matches.map((m) => m.id));
    await useDb.persist.rehydrate();
    const s = db.get();
    const match = s.matches.find((m) => m.adopterId === me && !seenMatches.has(m.id));
    if (match) return useUi.setState({ celebrationMatchId: match.id, toasts: [] }); // the celebration says it all
    const note = s.notifications.find((n) => n.userId === me && !seenNotes.has(n.id));
    if (note) toast({ title: note.title, body: note.body, emoji: '🔔' });
  });
}
