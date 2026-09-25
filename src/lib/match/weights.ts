import type { MatchFactor } from '../../types';

export const WEIGHTS: Record<MatchFactor, number> = {
  distance: 20,
  housing: 20,
  lifestyle: 15,
  time: 15,
  home: 15,
  experience: 10,
  preferences: 5,
};
