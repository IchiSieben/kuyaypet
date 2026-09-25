// Usuarios (UML): profile + onboarding preferences.
import type { AdopterProfile, User } from '@/types';
import { db, useDb } from './store';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function useUsers() {
  return useDb((s) => s.users);
}

export function useAdminUser(id: string | undefined) {
  return useDb((s) => s.users.find((u) => u.id === id));
}

/** HU-22: admin edits name/email/district. Role is read-only from this form. */
export function validateUserEdit(userId: string, input: { name: string; email: string }): { error: string; field?: string } | null {
  if (!input.name.trim()) return { error: 'El nombre es obligatorio.', field: 'name' };
  if (!EMAIL_RE.test(input.email.trim())) return { error: 'Ingresa un correo con formato válido (ej. nombre@correo.com).', field: 'email' };
  const dup = db.get().users.find((u) => u.id !== userId && u.email.toLowerCase() === input.email.trim().toLowerCase());
  if (dup) return { error: 'Ese correo ya lo usa otra cuenta.', field: 'email' };
  return null;
}

export function updateUser(userId: string, patch: Partial<Pick<User, 'name' | 'email' | 'district'>>) {
  db.set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, ...patch, email: (patch.email ?? u.email).trim().toLowerCase() } : u)) }));
}

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
