// HU-04 evidence: one screenshot per acceptance criterion (c1-c10) of "Filtrar mascotas según preferencias".
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart, readDb } from './shared';

const cards = '[data-hu="HU-02"] a[href^="#/mascota/"]';

test('HU-04 filtrar mascotas: criterios 1 a 10', async ({ page }) => {
  await freshStart(page);
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await page.goto('./#/buscar');
  await expect(page.locator(cards).first()).toBeVisible();
  await beat(page);
  const initial = await page.locator(cards).count();
  const db = await readDb(page);
  const visible = db.pets.filter((p: any) => p.status === 'disponible' && p.approval === 'aprobada');
  const filters = page.locator('[data-hu="HU-04"]');
  const open = async () => {
    await page.getByRole('button', { name: /^Filtros/ }).click();
    await expect(filters).toBeVisible();
    await beat(page);
  };
  const apply = async () => {
    await page.getByRole('button', { name: 'Aplicar filtros' }).click();
    await beat(page, 900);
  };

  // c1: "Filtros" shows the filter options
  await open();
  await expect(filters.getByText('Especie')).toBeVisible();
  await expect(filters.getByText('Sexo')).toBeVisible();
  await expect(filters.getByText('Tamaño')).toBeVisible();
  await evid(page, 'HU-04', 'P-HU-04-01-opciones-de-filtrado');

  // c2: criteria can be selected before applying; the list does not change until "Aplicar"
  await filters.getByRole('button', { name: '🐱 Gato' }).click();
  await beat(page);
  expect(await page.locator(cards).count()).toBe(initial);
  await evid(page, 'HU-04', 'P-HU-04-02-seleccion-antes-de-aplicar');

  // c3: applying shows only the pets that meet the criterion
  await apply();
  const cats = visible.filter((p: any) => p.species === 'gato').length;
  expect(cats).toBeGreaterThan(0);
  expect(cats).toBeLessThan(initial);
  await expect(page.locator(cards)).toHaveCount(cats);
  for (const t of await page.locator(cards).allInnerTexts()) expect(t).toContain('Gato');
  await evid(page, 'HU-04', 'P-HU-04-03-aplicar-filtro-especie');

  // c4: several filters at once (gato + hembra)
  await open();
  await filters.getByRole('button', { name: 'Hembra' }).click();
  await apply();
  const catsF = visible.filter((p: any) => p.species === 'gato' && p.sex === 'hembra').length;
  expect(catsF).toBeGreaterThan(0);
  await expect(page.locator(cards)).toHaveCount(catsF);
  await expect(page.getByRole('button', { name: /^Filtros \(2\)/ })).toBeVisible();
  await evid(page, 'HU-04', 'P-HU-04-04-varios-filtros');

  // c5: the matching pets can be seen
  await expect(page.locator(cards).first()).toBeVisible();
  await page.mouse.wheel(0, 500);
  await beat(page);
  await evid(page, 'HU-04', 'P-HU-04-05-mascotas-encontradas');
  await page.mouse.wheel(0, -500);

  // c6: no pet matches -> informative message
  await open();
  await page.getByLabel('Edad mínima en meses').fill('9999');
  await apply();
  await expect(page.locator(cards)).toHaveCount(0);
  await expect(page.getByText(/No hay mascotas que cumplan estos criterios/)).toBeVisible();
  await evid(page, 'HU-04', 'P-HU-04-06-sin-coincidencias');

  // c7: modifying a criterion updates the results (gato -> perro, no age filter)
  await open();
  await page.getByLabel('Edad mínima en meses').fill('');
  await filters.getByRole('button', { name: '🐱 Gato' }).click();
  await filters.getByRole('button', { name: '🐶 Perro' }).click();
  await apply();
  const dogsF = visible.filter((p: any) => p.species === 'perro' && p.sex === 'hembra').length;
  await expect(page.locator(cards)).toHaveCount(dogsF);
  for (const t of await page.locator(cards).allInnerTexts()) expect(t).toContain('Perro');
  await evid(page, 'HU-04', 'P-HU-04-07-modificar-criterios');

  // c8: "Limpiar filtros" restores the full list
  await open();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await beat(page, 900);
  await expect(page.locator(cards)).toHaveCount(initial);
  await expect(page.getByRole('button', { name: /^Filtros \(/ })).toHaveCount(0);
  await evid(page, 'HU-04', 'P-HU-04-08-limpiar-filtros');

  // c9: from filtered results, open a pet's profile
  await open();
  await filters.getByRole('button', { name: '🐱 Gato' }).click();
  await apply();
  const card = page.locator(cards).first();
  const name = (await card.locator('h3').textContent())!.trim();
  await card.click();
  await expect(page.locator('[data-hu="HU-03"] h1')).toHaveText(name);
  await beat(page, 1000);
  await evid(page, 'HU-04', 'P-HU-04-09-perfil-desde-resultados');

  // c10: leaving and coming back shows the list without restrictions
  await page.goto('./#/perfil');
  await beat(page);
  await page.goto('./#/buscar');
  await expect(page.locator(cards)).toHaveCount(initial);
  await expect(page.getByRole('button', { name: /^Filtros \(/ })).toHaveCount(0);
  await beat(page);
  await evid(page, 'HU-04', 'P-HU-04-10-vuelta-sin-restricciones');
});
