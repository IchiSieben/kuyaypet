// Helpers for the evidence specs (run with scripts/record-hu.mjs, not with `npm run test:e2e`).
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Locator, Page } from '@playwright/test';

/** Screenshots land in <EVIDENCIAS_DIR>/HU-NN/. Point it at Sprint_0N/7.Pruebas/evidencias to publish them. */
export const EVIDENCIAS_DIR = process.env.EVIDENCIAS_DIR || 'test-results/evidencias-capturas';

/** Pause so a person can follow the recorded video; it does not change what is asserted. */
export const beat = (page: Page, ms = 700) => page.waitForTimeout(ms);

export async function evid(target: Page | Locator, hu: string, name: string) {
  const dir = join(EVIDENCIAS_DIR, hu);
  mkdirSync(dir, { recursive: true });
  await target.screenshot({ path: join(dir, `${name}.png`) });
}

export async function freshStart(page: Page) {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
}

/** Raw persisted store (zustand persist writes `{ state, version }` under `kuyaypet-db`). */
export async function readDb(page: Page): Promise<any> {
  return page.evaluate(() => JSON.parse(localStorage.getItem('kuyaypet-db') || '{}').state);
}
