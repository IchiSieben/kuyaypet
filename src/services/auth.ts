// Autenticación + Validación + Sesiones (UML). Demo only: credentials live in localStorage.
import type { User } from '@/types';
import { db, nowIso, uid, useDb } from './store';

export const DEMO_IDS = { adopter: 'u-adopter-demo', owner: 'u-owner-demo', admin: 'u-admin' } as const;
export const INACTIVITY_MS = 15 * 60 * 1000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type AuthResult = { ok: true; user: User } | { ok: false; error: string; field?: string };

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

export function validateRegister(input: RegisterInput): { error: string; field?: string } | null {
  const { name, email, password, confirm } = input;
  if (!name.trim() || !email.trim() || !password || !confirm) return { error: 'Todos los campos son obligatorios.' };
  if (!EMAIL_RE.test(email.trim())) return { error: 'Ingresa un correo con formato válido (ej. nombre@correo.com).', field: 'email' };
  if (password.length < 8) return { error: 'La contraseña debe tener al menos 8 caracteres.', field: 'password' };
  if (password !== confirm) return { error: 'Las contraseñas no coinciden.', field: 'confirm' };
  if (findByEmail(email)) return { error: 'Este correo ya está registrado. Inicia sesión o usa otro correo.', field: 'email' };
  return null;
}

export function findByEmail(email: string): User | undefined {
  const e = email.trim().toLowerCase();
  return db.get().users.find((u) => u.email.toLowerCase() === e);
}

function startSession(user: User) {
  db.set({ sessionUserId: user.id, lastActivity: Date.now() });
}

export function register(input: RegisterInput): AuthResult {
  const invalid = validateRegister(input);
  if (invalid) return { ok: false, ...invalid };
  const user: User = {
    id: uid('u'),
    role: 'adopter',
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    avatar: '',
    active: true,
    createdAt: nowIso(),
    provider: 'email',
  };
  db.set((s) => ({ users: [...s.users, user] }));
  startSession(user);
  return { ok: true, user };
}

export function login(email: string, password: string): AuthResult {
  if (!email.trim() || !password) return { ok: false, error: 'Ingresa tu correo y contraseña.' };
  const user = findByEmail(email);
  if (!user || user.password !== password) return { ok: false, error: 'Correo o contraseña incorrectos.' };
  if (!user.active) return { ok: false, error: 'Tu cuenta está desactivada. Escríbenos a soporte@kuyaypet.pe.' };
  startSession(user);
  return { ok: true, user };
}

/** Demo shortcut used by the role picker, the presenter panel and the tour. */
export function loginAs(userId: string): AuthResult {
  const user = db.get().users.find((u) => u.id === userId);
  if (!user) return { ok: false, error: 'Usuario demo no encontrado.' };
  if (!user.active) return { ok: false, error: 'Esta cuenta está desactivada.' };
  startSession(user);
  return { ok: true, user };
}

/** Google sign-in. With VITE_GOOGLE_CLIENT_ID the profile comes from Google Identity Services;
 * otherwise from the simulated account picker. There is no backend to verify the token. */
export function loginWithGoogleProfile(profile: { name: string; email: string; picture?: string }): AuthResult {
  const existing = findByEmail(profile.email);
  if (existing) {
    if (!existing.active) return { ok: false, error: 'Tu cuenta está desactivada.' };
    startSession(existing);
    return { ok: true, user: existing };
  }
  const user: User = {
    id: uid('u'),
    role: 'adopter',
    name: profile.name,
    email: profile.email.toLowerCase(),
    password: '',
    avatar: profile.picture ?? '',
    active: true,
    createdAt: nowIso(),
    provider: 'google',
  };
  db.set((s) => ({ users: [...s.users, user] }));
  startSession(user);
  return { ok: true, user };
}

export function logout() {
  db.set({ sessionUserId: null });
}

export function touchActivity() {
  db.set({ lastActivity: Date.now() });
}

export function useCurrentUser(): User | null {
  return useDb((s) => s.users.find((u) => u.id === s.sessionUserId) ?? null);
}

export function currentUser(): User | null {
  const s = db.get();
  return s.users.find((u) => u.id === s.sessionUserId) ?? null;
}

export const HOME_BY_ROLE: Record<User['role'], string> = {
  adopter: '/descubrir',
  owner: '/responsable',
  admin: '/admin',
};

// Control de acceso (UML): which role(s) may open which private route.
const ROLE_ONLY: [RegExp, User['role'][]][] = [
  [/^\/(descubrir|buscar|matches|onboarding|coordinar)/, ['adopter']],
  [/^\/responsable/, ['owner']],
  [/^\/admin/, ['admin']],
  [/^\/adoptante\//, ['owner', 'admin']],
];

export function canAccess(role: User['role'], path: string): boolean {
  const rule = ROLE_ONLY.find(([re]) => re.test(path));
  return !rule || rule[1].includes(role);
}
