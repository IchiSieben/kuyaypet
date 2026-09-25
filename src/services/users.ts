// Usuarios (UML): profile + onboarding preferences.
import type { AdopterProfile } from '@/types';
import { db } from './store';

export function saveAdopterProfile(userId: string, profile: AdopterProfile) {
  db.set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, profile, district: profile.district } : u)) }));
}

export function isGuaranteedMatch() {
  return db.get().demo.guaranteedMatch;
}

export function resetDemo() {
  db.reset(false);
}

export function setTourDone(done: boolean) {
  db.set((s) => ({ demo: { ...s.demo, tourDone: done } }));
}
