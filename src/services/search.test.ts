import { describe, expect, it } from 'vitest';
import { EMPTY_FILTERS, breedsOf, filterPets, isFiltersEmpty, nearbyPets, type PetFilters } from './search';
import type { Pet } from '@/types';

function pet(overrides: Partial<Pet>): Pet {
  return {
    id: 'p1',
    ownerId: 'o1',
    name: 'Firulais',
    species: 'perro',
    breed: 'Mestizo',
    ageMonths: 24,
    size: 'M',
    sex: 'macho',
    energy: 3,
    goodWithKids: true,
    goodWithDogs: true,
    goodWithCats: true,
    needsYard: false,
    aloneTolerance: 3,
    firstTimerFriendly: true,
    hypoallergenic: false,
    sterilized: true,
    vaccinated: true,
    dewormed: true,
    district: 'Miraflores',
    location: { lat: -12.1211, lng: -77.0297 },
    personality: [],
    about: '',
    photos: [],
    status: 'disponible',
    approval: 'aprobada',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

const dog = pet({ id: 'p1', species: 'perro', breed: 'Mestizo', sex: 'macho', size: 'M', ageMonths: 24 });
const cat = pet({ id: 'p2', species: 'gato', breed: 'Persa', sex: 'hembra', size: 'S', ageMonths: 6 });
const puppy = pet({ id: 'p3', species: 'perro', breed: 'Labrador', sex: 'macho', size: 'L', ageMonths: 3 });
const pets = [dog, cat, puppy];

describe('filterPets', () => {
  it('sin criterios devuelve todas', () => {
    expect(filterPets(pets, EMPTY_FILTERS)).toEqual(pets);
    expect(isFiltersEmpty(EMPTY_FILTERS)).toBe(true);
  });

  it('filtra por especie', () => {
    const f: PetFilters = { ...EMPTY_FILTERS, species: ['gato'] };
    expect(filterPets(pets, f)).toEqual([cat]);
    expect(isFiltersEmpty(f)).toBe(false);
  });

  it('combina varios criterios con AND', () => {
    const f: PetFilters = { ...EMPTY_FILTERS, species: ['perro'], sizes: ['L'] };
    expect(filterPets(pets, f)).toEqual([puppy]);
  });

  it('filtra por rango de edad', () => {
    const f: PetFilters = { ...EMPTY_FILTERS, ageMin: 12, ageMax: 36 };
    expect(filterPets(pets, f)).toEqual([dog]);
  });

  it('filtra por sexo y raza combinados', () => {
    const f: PetFilters = { ...EMPTY_FILTERS, sex: ['macho'], breeds: ['Labrador'] };
    expect(filterPets(pets, f)).toEqual([puppy]);
  });

  it('sin resultados si la combinación es imposible', () => {
    const f: PetFilters = { ...EMPTY_FILTERS, species: ['gato'], sizes: ['L'] };
    expect(filterPets(pets, f)).toEqual([]);
  });
});

describe('breedsOf', () => {
  it('devuelve razas únicas y ordenadas', () => {
    expect(breedsOf(pets)).toEqual(['Labrador', 'Mestizo', 'Persa']);
  });
});

describe('nearbyPets', () => {
  const origin = { lat: -12.1211, lng: -77.0297 }; // Miraflores, igual que `dog`

  it('incluye solo mascotas dentro del radio, ordenadas por cercanía', () => {
    const far = pet({ id: 'p4', location: { lat: -11.9331, lng: -77.046 } }); // Comas, lejos
    const near = pet({ id: 'p5', location: { lat: -12.1136, lng: -77.0122 } }); // Surquillo, cerca
    const result = nearbyPets([dog, far, near], origin, 10);
    expect(result.map((r) => r.pet.id)).toEqual(['p1', 'p5']);
    expect(result[0].distanceKm).toBeCloseTo(0, 3);
  });

  it('sin resultados si nada está dentro del radio', () => {
    const far = pet({ id: 'p4', location: { lat: -11.9331, lng: -77.046 } });
    expect(nearbyPets([far], origin, 1)).toEqual([]);
  });
});
