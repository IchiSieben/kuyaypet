// HU-02 evidence: cases P-06..P-09 of DevBrad's test plan (Sprint_01/7.Pruebas), one screenshot per case.
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart, readDb } from './shared';

const cards = '[data-hu="HU-02"] a[href^="#/mascota/"]';

test('HU-02 mascotas disponibles: casos P-06 a P-09', async ({ page, browser, baseURL }) => {
  await freshStart(page);
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await beat(page);
  await page.goto('./#/buscar');
  await expect(page.locator('[data-hu="HU-02"]')).toBeVisible();
  await beat(page);

  // P-06: the list shows exactly the available (and approved) pets
  const db = await readDb(page);
  const expected = db.pets.filter((p: any) => p.status === 'disponible' && p.approval === 'aprobada').map((p: any) => p.id);
  const notListed = db.pets.filter((p: any) => !expected.includes(p.id)).map((p: any) => p.id);
  expect(notListed.length).toBeGreaterThan(0); // the seed has adopted / pending pets, so the check is meaningful
  const shown = await page.locator(cards).evaluateAll((els) => els.map((a) => a.getAttribute('href')!.replace('#/mascota/', '')));
  expect([...new Set(shown)].sort()).toEqual([...expected].sort());
  console.log(`P-06: ${shown.length} tarjetas = ${expected.length} disponibles; ${notListed.length} no disponibles ocultas`);
  await evid(page, 'HU-02', 'P-06-lista-disponibles');

  // P-07: photo, name, species, age and location on a card, matching the stored data
  const first = page.locator(cards).first();
  const id = (await first.getAttribute('href'))!.replace('#/mascota/', '');
  const pet = db.pets.find((p: any) => p.id === id);
  await expect(first.locator('img')).toHaveAttribute('alt', `Foto de ${pet.name}`);
  await expect(first.locator('h3')).toHaveText(pet.name);
  await expect(first).toContainText(pet.breed);
  await expect(first).toContainText(pet.district);
  await expect(first).toContainText(pet.species === 'perro' ? 'Perro' : 'Gato');
  await evid(first, 'HU-02', 'P-07-campos-visibles');
  await beat(page);

  // P-09: mobile (this context, 390x844) and desktop (separate 1280x800 context)
  await page.mouse.wheel(0, 900);
  await beat(page);
  await evid(page, 'HU-02', 'P-09-movil-390x844');
  const desktop = await browser.newContext({ baseURL, viewport: { width: 1280, height: 800 }, locale: 'es-PE', serviceWorkers: 'block' });
  const dpage = await desktop.newPage();
  await dpage.goto('./');
  // On desktop the presenter panel repeats the role buttons; the first one is the splash's.
  await dpage.getByRole('button', { name: /Adoptante/ }).first().click();
  await dpage.goto('./#/buscar');
  await expect(dpage.locator(cards).first()).toBeVisible();
  await beat(dpage);
  await evid(dpage, 'HU-02', 'P-09-computadora-1280x800');
  await desktop.close();

  // P-08: no pets available -> informative message (scenario prepared by marking every pet as adopted)
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    raw.state.pets = raw.state.pets.map((p: any) => ({ ...p, status: 'adoptada' }));
    localStorage.setItem('kuyaypet-db', JSON.stringify(raw));
  });
  await page.reload();
  await expect(page.locator('[data-hu="HU-02"]')).toBeVisible();
  await expect(page.locator(cards)).toHaveCount(0);
  await expect(page.getByText('No hay mascotas disponibles por ahora')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-02', 'P-08-sin-mascotas-disponibles');
  await beat(page, 1500);
});
