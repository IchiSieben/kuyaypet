// Búsqueda (UML): filtros (HU-04) + cercanía (HU-05). Funciones puras, sin tocar el store.
import { haversineKm } from '@/lib/match';
import type { GeoPoint, Pet, Sex, Size, Species } from '@/types';

export interface PetFilters {
  species: Species[];
  breeds: string[];
  sex: Sex[];
  sizes: Size[];
  ageMin: number | null; // months
  ageMax: number | null; // months
}

export const EMPTY_FILTERS: PetFilters = {
  species: [],
  breeds: [],
  sex: [],
  sizes: [],
  ageMin: null,
  ageMax: null,
};

export function isFiltersEmpty(f: PetFilters): boolean {
  return (
    f.species.length === 0 &&
    f.breeds.length === 0 &&
    f.sex.length === 0 &&
    f.sizes.length === 0 &&
    f.ageMin == null &&
    f.ageMax == null
  );
}

/** Combina todos los criterios marcados con AND. Un criterio vacío no filtra nada. */
export function filterPets(pets: Pet[], f: PetFilters): Pet[] {
  return pets.filter((p) => {
    if (f.species.length && !f.species.includes(p.species)) return false;
    if (f.breeds.length && !f.breeds.includes(p.breed)) return false;
    if (f.sex.length && !f.sex.includes(p.sex)) return false;
    if (f.sizes.length && !f.sizes.includes(p.size)) return false;
    if (f.ageMin != null && p.ageMonths < f.ageMin) return false;
    if (f.ageMax != null && p.ageMonths > f.ageMax) return false;
    return true;
  });
}

export function breedsOf(pets: Pet[]): string[] {
  return Array.from(new Set(pets.map((p) => p.breed))).sort((a, b) => a.localeCompare(b, 'es'));
}

export interface NearbyResult {
  pet: Pet;
  distanceKm: number;
}

/** HU-05: mascotas dentro de `radiusKm` del origen, ordenadas por cercanía. */
export function nearbyPets(pets: Pet[], origin: GeoPoint, radiusKm: number): NearbyResult[] {
  return pets
    .map((pet) => ({ pet, distanceKm: haversineKm(origin, pet.location) }))
    .filter((r) => r.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
