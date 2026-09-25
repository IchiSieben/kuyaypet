// Publicaciones (UML): create/edit a pet listing and the "mark as adopted" lifecycle.
// New publications stay 'pendiente' until the admin approves them (ADR-05 / moderation.ts).
import type { Pet, Sex, Size, Species } from '@/types';
import { districtByName } from '@/data/districts';
import { db, nowIso, uid, useDb } from './store';
import { notify } from './notifications';

export interface NewPetInput {
  name: string;
  species: Species;
  breed: string;
  ageMonths: number;
  sex: Sex;
  size: Size;
  district: string;
  photos: string[];
  personality: string[];
  goodWithKids: boolean;
  goodWithDogs: boolean;
  goodWithCats: boolean;
  energy: number;
  aloneTolerance: number;
  vaccinated: boolean;
  sterilized: boolean;
  dewormed: boolean;
  about: string;
  story?: string;
  specialCare?: string;
}

export interface NewPetErrors {
  [field: string]: string;
}

/** Required-field validation for step navigation and the final "Publicar" click. */
export function validateNewPet(i: Partial<NewPetInput>): NewPetErrors {
  const errors: NewPetErrors = {};
  if (!i.name?.trim()) errors.name = 'El nombre es obligatorio.';
  if (!i.species) errors.species = 'Elige la especie.';
  if (!i.breed?.trim()) errors.breed = 'La raza es obligatoria.';
  if (i.ageMonths === undefined || i.ageMonths === null || Number.isNaN(i.ageMonths) || i.ageMonths < 0) errors.ageMonths = 'La edad es obligatoria.';
  if (!i.sex) errors.sex = 'Elige el sexo.';
  if (!i.size) errors.size = 'Elige el tamaño.';
  if (!i.district?.trim()) errors.district = 'El distrito es obligatorio.';
  return errors;
}

export function createPublication(ownerId: string, input: NewPetInput): { ok: true; pet: Pet } | { ok: false; errors: NewPetErrors } {
  const errors = validateNewPet(input);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  const pet: Pet = {
    id: uid('p'),
    ownerId,
    name: input.name.trim(),
    species: input.species,
    breed: input.breed.trim(),
    ageMonths: input.ageMonths,
    size: input.size,
    sex: input.sex,
    energy: input.energy,
    goodWithKids: input.goodWithKids,
    goodWithDogs: input.goodWithDogs,
    goodWithCats: input.goodWithCats,
    needsYard: input.size === 'L',
    aloneTolerance: input.aloneTolerance,
    firstTimerFriendly: true,
    hypoallergenic: false,
    sterilized: input.sterilized,
    vaccinated: input.vaccinated,
    dewormed: input.dewormed,
    district: input.district,
    location: districtByName(input.district),
    personality: input.personality,
    about: input.about.trim(),
    story: input.story?.trim() || undefined,
    specialCare: input.specialCare?.trim() || undefined,
    photos: input.photos,
    status: 'disponible',
    approval: 'pendiente',
    createdAt: nowIso(),
  };
  db.set((s) => ({ pets: [...s.pets, pet] }));
  const admins = db.get().users.filter((u) => u.role === 'admin');
  admins.forEach((admin) =>
    notify(
      { userId: admin.id, kind: 'publicacion', title: `Nueva publicación: ${pet.name}`, body: 'Espera tu revisión antes de mostrarse a los adoptantes.', link: '/admin', petId: pet.id, actorId: ownerId },
      { toastIfCurrent: false },
    ),
  );
  return { ok: true, pet };
}

export interface EditPetInput {
  name: string;
  about: string;
  breed: string;
  ageMonths: number;
  story?: string;
  specialCare?: string;
}

export function validateEditPet(i: Partial<EditPetInput>): NewPetErrors {
  const errors: NewPetErrors = {};
  if (!i.name?.trim()) errors.name = 'El nombre no puede estar vacío.';
  return errors;
}

export function updatePublication(petId: string, input: EditPetInput): { ok: true } | { ok: false; errors: NewPetErrors } {
  const errors = validateEditPet(input);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  db.set((s) => ({
    pets: s.pets.map((p) =>
      p.id === petId
        ? {
            ...p,
            name: input.name.trim(),
            about: input.about.trim(),
            breed: input.breed.trim(),
            ageMonths: input.ageMonths,
            story: input.story?.trim() || undefined,
            specialCare: input.specialCare?.trim() || undefined,
          }
        : p,
    ),
  }));
  return { ok: true };
}

/** HU-19: marking a pet adopted removes it from availability and blocks new requests (see adoptions.validateAdoption). */
export function markAdopted(petId: string) {
  db.set((s) => ({ pets: s.pets.map((p) => (p.id === petId ? { ...p, status: 'adoptada' } : p)) }));
}

export function useOwnedPet(ownerId: string | undefined, petId: string | undefined) {
  return useDb((s) => s.pets.find((p) => p.id === petId && p.ownerId === ownerId));
}
