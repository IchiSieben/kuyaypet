import type {
  AdopterProfile,
  MatchFactor,
  MatchResult,
  Pet,
  Reason,
} from '../../types';
import { WEIGHTS } from './weights';
import { formatKm, haversineKm } from './geo';

export interface ComputeMatchOptions {
  allowAllergyRisk?: boolean;
  ignoreRadius?: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function ageBucket(ageMonths: number): 'cachorro' | 'joven' | 'adulto' | 'senior' {
  if (ageMonths < 12) return 'cachorro';
  if (ageMonths < 36) return 'joven';
  if (ageMonths < 96) return 'adulto';
  return 'senior';
}

function scoreDistance(distanceKm: number, radiusKm: number): number {
  const weight = WEIGHTS.distance;
  if (distanceKm <= 2) return weight;
  if (radiusKm <= 2) return 0;
  const ratio = 1 - (distanceKm - 2) / (radiusKm - 2);
  return clamp(weight * ratio, 0, weight);
}

function scoreHousing(adopter: AdopterProfile, pet: Pet): number {
  const weight = WEIGHTS.housing;
  if (pet.species === 'gato') {
    let score = weight * 0.85;
    if (adopter.homeSize === 'grande') score = weight * 0.95;
    return clamp(score, 0, weight);
  }

  let score: number;
  if (pet.needsYard && adopter.housing !== 'casa_con_patio') {
    score = weight * 0.1;
  } else if (adopter.housing === 'departamento') {
    if (pet.energy >= 4) score = weight * 0.2;
    else if (pet.energy === 3) score = weight * 0.6;
    else score = weight * 0.9;
  } else if (adopter.housing === 'casa_sin_patio') {
    score = pet.energy >= 4 ? weight * 0.6 : weight * 0.8;
  } else {
    score = pet.energy >= 4 ? weight : weight * 0.9;
  }

  if (adopter.homeSize === 'pequena' && pet.size === 'L') score -= weight * 0.2;
  if (adopter.homeSize === 'grande' && pet.size !== 'S') score += weight * 0.05;

  return clamp(score, 0, weight);
}

function scoreLifestyle(adopter: AdopterProfile, pet: Pet): number {
  const weight = WEIGHTS.lifestyle;
  const activityLevel = { sedentario: 1.5, moderado: 3, muy_activo: 4.5 }[
    adopter.activity
  ];
  const diff = Math.abs(activityLevel - pet.energy);
  return clamp(weight - diff * (weight / 3.5), 0, weight);
}

function scoreTime(adopter: AdopterProfile, pet: Pet): number {
  const weight = WEIGHTS.time;
  const neededTolerance = { '0-2': 1, '3-5': 2.5, '6-8': 4, '8+': 5 }[
    adopter.hoursAlone
  ];
  const diff = Math.max(0, neededTolerance - pet.aloneTolerance);
  return clamp(weight - diff * (weight / 3), 0, weight);
}

function scoreHome(adopter: AdopterProfile, pet: Pet): number {
  const kidsWeight = WEIGHTS.home * (8 / 15);
  const petsWeight = WEIGHTS.home - kidsWeight;

  let kidsScore: number;
  if (adopter.kids === 'no') {
    kidsScore = kidsWeight;
  } else if (adopter.kids === 'mayores_6') {
    kidsScore = pet.goodWithKids ? kidsWeight : kidsWeight * 0.6;
  } else {
    kidsScore = pet.goodWithKids ? kidsWeight : kidsWeight * 0.1;
  }

  let petsScore: number;
  if (adopter.otherPets === 'ninguna') {
    petsScore = petsWeight;
  } else if (adopter.otherPets === 'perro') {
    petsScore = pet.goodWithDogs ? petsWeight : petsWeight * 0.1;
  } else if (adopter.otherPets === 'gato') {
    petsScore = pet.goodWithCats ? petsWeight : petsWeight * 0.1;
  } else {
    const goodCount = (pet.goodWithDogs ? 1 : 0) + (pet.goodWithCats ? 1 : 0);
    if (goodCount === 2) petsScore = petsWeight;
    else if (goodCount === 1) petsScore = petsWeight * 0.5;
    else petsScore = petsWeight * 0.1;
  }

  return clamp(kidsScore + petsScore, 0, WEIGHTS.home);
}

function scoreExperience(adopter: AdopterProfile, pet: Pet): number {
  const weight = WEIGHTS.experience;
  if (adopter.experience === 'primera') {
    return pet.firstTimerFriendly ? weight * 0.8 : weight * 0.2;
  }
  return weight;
}

function scorePreferences(adopter: AdopterProfile, pet: Pet): number {
  const weight = WEIGHTS.preferences;
  const parts: number[] = [];

  parts.push(
    adopter.prefs.species.length === 0 || adopter.prefs.species.includes(pet.species) ? 1 : 0,
  );
  parts.push(
    adopter.prefs.sizes.length === 0 || adopter.prefs.sizes.includes(pet.size) ? 1 : 0,
  );
  parts.push(
    adopter.prefs.ages.length === 0 || adopter.prefs.ages.includes(ageBucket(pet.ageMonths))
      ? 1
      : 0,
  );
  parts.push(
    adopter.prefs.sex === 'cualquiera' || adopter.prefs.sex === pet.sex ? 1 : 0,
  );

  const ratio = parts.reduce((a, b) => a + b, 0) / parts.length;
  return clamp(weight * ratio, 0, weight);
}

function petAdj(pet: Pet, masc: string, fem: string): string {
  return pet.sex === 'hembra' ? fem : masc;
}

function emptyBreakdown(): Record<MatchFactor, number> {
  return {
    distance: 0,
    housing: 0,
    lifestyle: 0,
    time: 0,
    home: 0,
    experience: 0,
    preferences: 0,
  };
}

export function computeMatch(
  adopter: AdopterProfile,
  pet: Pet,
  opts: ComputeMatchOptions = {},
): MatchResult {
  const distanceKm = haversineKm(adopter.location, pet.location);

  if (pet.status !== 'disponible' || pet.approval !== 'aprobada') {
    return {
      score: 0,
      reasons: [],
      warnings: [],
      hardBlock: 'Esta mascota ya no está disponible para adopción.',
      distanceKm,
      breakdown: emptyBreakdown(),
    };
  }

  if (adopter.prefs.species.length > 0 && !adopter.prefs.species.includes(pet.species)) {
    return {
      score: 0,
      reasons: [],
      warnings: [],
      hardBlock: 'Esta especie no coincide con lo que buscas.',
      distanceKm,
      breakdown: emptyBreakdown(),
    };
  }

  const warnings: Reason[] = [];

  if (adopter.allergies && !pet.hypoallergenic) {
    if (!opts.allowAllergyRisk) {
      return {
        score: 0,
        reasons: [],
        warnings: [],
        hardBlock: 'Esta mascota no es hipoalergénica y podría afectar tus alergias.',
        distanceKm,
        breakdown: emptyBreakdown(),
      };
    }
    warnings.push({
      factor: 'preferences',
      icon: '⚠️',
      text: '⚠️ Riesgo de alergias: esta mascota no es hipoalergénica',
      points: 0,
    });
  }

  if (distanceKm > adopter.radiusKm && !opts.ignoreRadius) {
    return {
      score: 0,
      reasons: [],
      warnings: [],
      hardBlock: 'Esta mascota está fuera de tu radio de búsqueda.',
      distanceKm,
      breakdown: emptyBreakdown(),
    };
  }

  const breakdown: Record<MatchFactor, number> = {
    distance: scoreDistance(distanceKm, adopter.radiusKm),
    housing: scoreHousing(adopter, pet),
    lifestyle: scoreLifestyle(adopter, pet),
    time: scoreTime(adopter, pet),
    home: scoreHome(adopter, pet),
    experience: scoreExperience(adopter, pet),
    preferences: scorePreferences(adopter, pet),
  };

  const reasons: Reason[] = [];

  const distText = capitalize(formatKm(distanceKm)) + ` de ti (${pet.district})`;
  if (breakdown.distance >= WEIGHTS.distance * 0.6) {
    reasons.push({ factor: 'distance', icon: '📍', text: `📍 ${distText}`, points: breakdown.distance });
  }

  if (breakdown.housing >= WEIGHTS.housing * 0.6) {
    const text =
      pet.species === 'gato'
        ? '🏡 Buena adaptación a tu hogar'
        : adopter.housing === 'casa_con_patio'
        ? '🏡 Ideal para tu patio: espacio y energía compatibles'
        : '🏡 Ideal para tu vivienda: tamaño y energía tranquila';
    reasons.push({ factor: 'housing', icon: '🏡', text, points: breakdown.housing });
  } else if (breakdown.housing <= WEIGHTS.housing * 0.3) {
    if (pet.needsYard && adopter.housing !== 'casa_con_patio') {
      warnings.push({
        factor: 'housing',
        icon: '⚠️',
        text: '⚠️ Necesita patio y tú no tienes uno',
        points: breakdown.housing,
      });
    } else {
      warnings.push({
        factor: 'housing',
        icon: '⚠️',
        text: '⚠️ Su energía no encaja bien con tu vivienda',
        points: breakdown.housing,
      });
    }
  }

  if (breakdown.lifestyle >= WEIGHTS.lifestyle * 0.6) {
    reasons.push({
      factor: 'lifestyle',
      icon: '⚡',
      text: `⚡ Su energía (${pet.energy}/5) encaja con tu estilo ${adopter.activity.replace('_', ' ')}`,
      points: breakdown.lifestyle,
    });
  } else if (breakdown.lifestyle <= WEIGHTS.lifestyle * 0.3) {
    warnings.push({
      factor: 'lifestyle',
      icon: '⚠️',
      text: `⚠️ Su energía (${pet.energy}/5) no encaja con tu estilo ${adopter.activity.replace('_', ' ')}`,
      points: breakdown.lifestyle,
    });
  }

  if (breakdown.time >= WEIGHTS.time * 0.6) {
    reasons.push({
      factor: 'time',
      icon: '⏰',
      text: '⏰ Tolera bien estar solo unas horas',
      points: breakdown.time,
    });
  } else if (breakdown.time <= WEIGHTS.time * 0.3) {
    warnings.push({
      factor: 'time',
      icon: '⚠️',
      text: `⚠️ Necesita compañía: tú estarías fuera ${adopter.hoursAlone} h al día`,
      points: breakdown.time,
    });
  }

  if (breakdown.home >= WEIGHTS.home * 0.6) {
    if (adopter.kids !== 'no' && pet.goodWithKids) {
      reasons.push({
        factor: 'home',
        icon: '👶',
        text: `👶 Se lleva ${petAdj(pet, 'bien', 'bien')} con niños`,
        points: breakdown.home,
      });
    } else if (adopter.otherPets !== 'ninguna') {
      reasons.push({
        factor: 'home',
        icon: '🐾',
        text: `🐾 Se lleva bien con otras mascotas`,
        points: breakdown.home,
      });
    } else {
      reasons.push({ factor: 'home', icon: '🏠', text: '🏠 Encaja bien con tu hogar', points: breakdown.home });
    }
  } else {
    if (adopter.kids === 'pequenos' && !pet.goodWithKids) {
      warnings.push({
        factor: 'home',
        icon: '⚠️',
        text: '⚠️ No es ideal con niños pequeños',
        points: breakdown.home,
      });
    } else if (breakdown.home <= WEIGHTS.home * 0.3) {
      warnings.push({
        factor: 'home',
        icon: '⚠️',
        text: '⚠️ Podría no llevarse bien con tus otras mascotas',
        points: breakdown.home,
      });
    }
  }

  if (breakdown.experience >= WEIGHTS.experience * 0.6) {
    reasons.push({
      factor: 'experience',
      icon: '🌱',
      text: '🌱 Apto para primerizos',
      points: breakdown.experience,
    });
  } else if (breakdown.experience <= WEIGHTS.experience * 0.3) {
    warnings.push({
      factor: 'experience',
      icon: '⚠️',
      text: '⚠️ No es recomendable para primerizos',
      points: breakdown.experience,
    });
  }

  if (breakdown.preferences >= WEIGHTS.preferences * 0.6) {
    reasons.push({
      factor: 'preferences',
      icon: '💛',
      text: '💛 Coincide con lo que buscas',
      points: breakdown.preferences,
    });
  }

  reasons.sort((a, b) => b.points - a.points);

  const rawScore = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const score = clamp(Math.round(rawScore), 0, 100);

  return {
    score,
    reasons,
    warnings,
    distanceKm,
    breakdown,
  };
}
