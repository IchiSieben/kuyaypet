import { describe, expect, it } from 'vitest';
import type { AdopterProfile, Pet } from '../../types';
import { computeMatch } from './computeMatch';
import { rankDeck } from './rankDeck';
import { haversineKm } from './geo';

const MIRAFLORES = { lat: -12.1211, lng: -77.0269 };
const SAN_ISIDRO = { lat: -12.0985, lng: -77.0332 };

function makeAdopter(overrides: Partial<AdopterProfile> = {}): AdopterProfile {
  return {
    district: 'Miraflores',
    location: MIRAFLORES,
    radiusKm: 10,
    housing: 'casa_con_patio',
    homeSize: 'grande',
    hoursAlone: '0-2',
    activity: 'muy_activo',
    experience: 'he_tenido',
    kids: 'no',
    otherPets: 'ninguna',
    allergies: false,
    prefs: { species: [], sizes: [], ages: [], sex: 'cualquiera' },
    ...overrides,
  };
}

function makePet(overrides: Partial<Pet> = {}): Pet {
  return {
    id: 'pet-1',
    ownerId: 'owner-1',
    name: 'Firulais',
    species: 'perro',
    breed: 'Mestizo',
    ageMonths: 24,
    size: 'M',
    sex: 'macho',
    energy: 4,
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
    location: MIRAFLORES,
    personality: ['juguetón'],
    about: 'Un perro alegre',
    photos: [],
    status: 'disponible',
    approval: 'aprobada',
    createdAt: new Date(2024, 0, 1).toISOString(),
    ...overrides,
  };
}

describe('computeMatch', () => {
  it('scores high for a close, ideal pair', () => {
    const adopter = makeAdopter({ activity: 'muy_activo', housing: 'casa_con_patio' });
    const pet = makePet({ energy: 5, aloneTolerance: 5 });
    const result = computeMatch(adopter, pet);
    expect(result.hardBlock).toBeUndefined();
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('scores low with a warning for depa + high-energy dog that needs a yard', () => {
    const adopter = makeAdopter({
      housing: 'departamento',
      homeSize: 'pequena',
      activity: 'sedentario',
      hoursAlone: '8+',
    });
    const pet = makePet({ energy: 5, size: 'L', needsYard: true, aloneTolerance: 1 });
    const result = computeMatch(adopter, pet);
    expect(result.hardBlock).toBeUndefined();
    expect(result.score).toBeLessThanOrEqual(50);
    expect(result.warnings.some((w) => w.text.includes('patio'))).toBe(true);
  });

  it('hard blocks on allergy risk, and warns instead when allowed', () => {
    const adopter = makeAdopter({ allergies: true });
    const pet = makePet({ hypoallergenic: false });

    const blocked = computeMatch(adopter, pet);
    expect(blocked.hardBlock).toBeDefined();
    expect(blocked.score).toBe(0);

    const allowed = computeMatch(adopter, pet, { allowAllergyRisk: true });
    expect(allowed.hardBlock).toBeUndefined();
    expect(allowed.warnings.some((w) => w.text.toLowerCase().includes('alerg'))).toBe(true);
  });

  it('hard blocks when pet is outside the search radius', () => {
    const adopter = makeAdopter({ radiusKm: 1 });
    const pet = makePet({ location: SAN_ISIDRO });
    const result = computeMatch(adopter, pet);
    expect(result.hardBlock).toBeDefined();
    expect(result.score).toBe(0);
  });

  it('hard blocks when pet is not available or not approved', () => {
    const adopter = makeAdopter();
    const notAvailable = computeMatch(adopter, makePet({ status: 'adoptada' }));
    expect(notAvailable.hardBlock).toBeDefined();

    const notApproved = computeMatch(adopter, makePet({ approval: 'pendiente' }));
    expect(notApproved.hardBlock).toBeDefined();
  });

  it('hard blocks when species is excluded by preferences', () => {
    const adopter = makeAdopter({ prefs: { species: ['gato'], sizes: [], ages: [], sex: 'cualquiera' } });
    const pet = makePet({ species: 'perro' });
    const result = computeMatch(adopter, pet);
    expect(result.hardBlock).toBeDefined();
  });

  it('penalizes a not-first-timer-friendly pet for a first-time adopter', () => {
    const adopter = makeAdopter({ experience: 'primera' });
    const friendly = computeMatch(adopter, makePet({ firstTimerFriendly: true }));
    const unfriendly = computeMatch(adopter, makePet({ firstTimerFriendly: false }));
    expect(unfriendly.breakdown.experience).toBeLessThan(friendly.breakdown.experience);
  });

  it('warns when the adopter is away 8+ hours and the pet has low tolerance', () => {
    const adopter = makeAdopter({ hoursAlone: '8+' });
    const pet = makePet({ aloneTolerance: 1 });
    const result = computeMatch(adopter, pet);
    expect(result.warnings.some((w) => w.text.includes('8+'))).toBe(true);
  });

  it('warns when there are small kids and the pet is not good with kids', () => {
    const adopter = makeAdopter({ kids: 'pequenos' });
    const pet = makePet({ goodWithKids: false });
    const result = computeMatch(adopter, pet);
    expect(result.warnings.some((w) => w.text.includes('niños pequeños'))).toBe(true);
  });

  it('keeps the score a 0-100 integer and the breakdown summing to score within rounding', () => {
    const adopter = makeAdopter();
    const pet = makePet();
    const result = computeMatch(adopter, pet);
    expect(Number.isInteger(result.score)).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    const sum = Object.values(result.breakdown).reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - result.score)).toBeLessThanOrEqual(1);
  });

  it('produces non-empty reasons sorted descending by points for a good match', () => {
    const adopter = makeAdopter();
    const pet = makePet({ energy: 5, aloneTolerance: 5 });
    const result = computeMatch(adopter, pet);
    expect(result.reasons.length).toBeGreaterThan(0);
    for (let i = 1; i < result.reasons.length; i++) {
      expect(result.reasons[i - 1].points).toBeGreaterThanOrEqual(result.reasons[i].points);
    }
  });
});

describe('haversineKm', () => {
  it('estimates the Miraflores -> San Isidro distance at about 2.7 km', () => {
    const km = haversineKm(MIRAFLORES, SAN_ISIDRO);
    expect(km).toBeGreaterThan(2.2);
    expect(km).toBeLessThan(3.2);
  });
});

describe('rankDeck', () => {
  it('excludes seen and hard-blocked pets, and is deterministic with a seeded rng', () => {
    const adopter = makeAdopter();
    const pets = [
      makePet({ id: 'a', energy: 5, aloneTolerance: 5 }),
      makePet({ id: 'b', status: 'adoptada' }),
      makePet({ id: 'c', energy: 2, aloneTolerance: 2 }),
    ];
    const seen = new Set(['c']);

    let seed = 42;
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const deck1 = rankDeck(adopter, pets, seen, rng);
    const ids1 = deck1.map((e) => e.pet.id);

    seed = 42;
    const deck2 = rankDeck(adopter, pets, seen, rng);
    const ids2 = deck2.map((e) => e.pet.id);

    expect(ids1).not.toContain('b');
    expect(ids1).not.toContain('c');
    expect(ids1).toContain('a');
    expect(ids1).toEqual(ids2);
  });
});
