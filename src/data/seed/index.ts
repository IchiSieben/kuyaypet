// Generado por scripts/seed.ts — no editar a mano.
import type { SeedData } from '@/types';
import users from './users.json';
import pets from './pets.json';
import interactions from './interactions.json';
import interests from './interests.json';
import matches from './matches.json';
import threads from './threads.json';
import messages from './messages.json';
import adoptions from './adoptions.json';
import notifications from './notifications.json';
import reports from './reports.json';
import favorites from './favorites.json';

export const SEED: SeedData = {
  users,
  pets,
  interactions,
  interests,
  matches,
  threads,
  messages,
  adoptions,
  notifications,
  reports,
  favorites,
} as unknown as SeedData;
