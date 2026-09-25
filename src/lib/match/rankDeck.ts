import type { AdopterProfile, MatchResult, Pet } from '../../types';
import { computeMatch } from './computeMatch';

export interface DeckEntry {
  pet: Pet;
  match: MatchResult;
}

export function rankDeck(
  adopter: AdopterProfile,
  pets: Pet[],
  seenPetIds: Set<string>,
  rng: () => number = Math.random,
): DeckEntry[] {
  const entries: (DeckEntry & { jitteredScore: number })[] = [];

  for (const pet of pets) {
    if (seenPetIds.has(pet.id)) continue;
    const match = computeMatch(adopter, pet);
    if (match.hardBlock) continue;
    const jitter = (rng() * 2 - 1) * 5;
    entries.push({ pet, match, jitteredScore: match.score + jitter });
  }

  entries.sort((a, b) => b.jitteredScore - a.jitteredScore);

  return entries.map(({ pet, match }) => ({ pet, match }));
}
