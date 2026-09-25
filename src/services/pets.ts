// Mascotas + Perfil Mascota + Compatibilidad (UML).
import { useMemo } from 'react';
import { computeMatch } from '@/lib/match';
import type { AdopterProfile, MatchResult, Pet, User } from '@/types';
import { db, useDb } from './store';

export function usePets(): Pet[] {
  return useDb((s) => s.pets);
}

export function usePet(id: string | undefined): Pet | undefined {
  return useDb((s) => s.pets.find((p) => p.id === id));
}

export function getPet(id: string): Pet | undefined {
  return db.get().pets.find((p) => p.id === id);
}

export function isPublic(p: Pet) {
  return p.approval === 'aprobada';
}

export function isAvailable(p: Pet) {
  return p.status === 'disponible' && p.approval === 'aprobada';
}

export function useUser(id: string | undefined): User | undefined {
  return useDb((s) => s.users.find((u) => u.id === id));
}

export function getUser(id: string): User | undefined {
  return db.get().users.find((u) => u.id === id);
}

export function hasCompleteProfile(u: User | null | undefined): u is User & { profile: AdopterProfile } {
  return !!u?.profile;
}

export function matchFor(profile: AdopterProfile | undefined, pet: Pet, ignoreRadius = true): MatchResult | null {
  if (!profile) return null;
  return computeMatch(profile, pet, { ignoreRadius });
}

export function useMatch(profile: AdopterProfile | undefined, pet: Pet | undefined): MatchResult | null {
  return useMemo(() => (profile && pet ? computeMatch(profile, pet, { ignoreRadius: true }) : null), [profile, pet]);
}

export function ageLabel(months: number): string {
  if (months < 12) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  const y = Math.floor(months / 12);
  return `${y} ${y === 1 ? 'año' : 'años'}`;
}

export const SIZE_LABEL = { S: 'Pequeño', M: 'Mediano', L: 'Grande' } as const;
export const SPECIES_LABEL = { perro: 'Perro', gato: 'Gato' } as const;
export const SEX_LABEL = { macho: 'Macho', hembra: 'Hembra' } as const;
