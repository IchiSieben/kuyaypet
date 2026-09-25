// Notificaciones (UML). In-app only in this phase; push is simulated with a toast.
import type { AppNotification } from '@/types';
import { db, nowIso, uid, useDb } from './store';
import { toast } from './ui';

export function notify(n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>, opts: { toastIfCurrent?: boolean } = {}) {
  const item: AppNotification = { ...n, id: uid('n'), read: false, createdAt: nowIso() };
  db.set((s) => ({ notifications: [item, ...s.notifications] }));
  if (opts.toastIfCurrent !== false && db.get().sessionUserId === n.userId) {
    toast({ title: n.title, body: n.body, emoji: '🔔' });
  }
  return item;
}

export function useNotifications(userId: string | undefined): AppNotification[] {
  return useDb((s) => s.notifications).filter((n) => n.userId === userId);
}

export function useUnreadCount(userId: string | undefined): number {
  return useDb((s) => s.notifications.reduce((acc, n) => acc + (n.userId === userId && !n.read ? 1 : 0), 0));
}

export function markRead(id: string) {
  db.set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
}

export function markAllRead(userId: string) {
  db.set((s) => ({ notifications: s.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)) }));
}
