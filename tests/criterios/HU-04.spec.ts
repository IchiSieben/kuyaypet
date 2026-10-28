import { expect, test, type Page } from '@playwright/test';

const SHOTS = '../../Sprint_02/7.Pruebas/evidencias/HU-04';
const cards = '[data-hu="HU-02"] a[href^="#/mascota/"]';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await page.goto('./#/buscar');
  await expect(page.locator(cards).first()).toBeVisible();
});

async function filterCats(page: Page) {
  await page.getByRole('button', { name: /^Filtros/ }).click();
  await page.locator('[data-hu="HU-04"]').getByRole('button', { name: '🐱 Gato' }).click();
  await page.getByRole('button', { name: 'Aplicar filtros' }).click();
  await expect(page.getByRole('button', { name: /^Filtros \(1\)/ })).toBeVisible();
}

test('HU-04 c5: con filtros aplicados se ven las mascotas encontradas y todas cumplen el filtro', async ({ page }) => {
  const initial = await page.locator(cards).count();
  await filterCats(page);
  const list = page.locator(cards);
  const n = await list.count();
  expect(n).toBeGreaterThan(0);
  expect(n).toBeLessThan(initial);
  for (let i = 0; i < n; i++) {
    await expect(list.nth(i)).toBeVisible();
    await expect(list.nth(i)).toContainText('Gato');
    await expect(list.nth(i)).not.toContainText('Perro');
  }
  await page.screenshot({ path: `${SHOTS}/despues-resultados-filtrados.png` });
});

test('HU-04 c9: desde los resultados filtrados se abre el perfil de la mascota elegida', async ({ page }) => {
  await filterCats(page);
  const card = page.locator(cards).first();
  const name = (await card.locator('h3').textContent())!.trim();
  const href = (await card.getAttribute('href'))!;
  await card.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.locator('[data-hu="HU-03"] h1')).toHaveText(name);
  await page.screenshot({ path: `${SHOTS}/despues-perfil-desde-filtrados.png` });
});

test('HU-04 c10: tras limpiar los filtros y volver a la sección, la lista no tiene restricciones', async ({ page }) => {
  const initial = await page.locator(cards).count();
  await filterCats(page);
  await page.getByRole('button', { name: /^Filtros/ }).click();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(page.locator(cards)).toHaveCount(initial);
  await page.goto('./#/perfil');
  await expect(page.locator(cards)).toHaveCount(0);
  await page.goto('./#/buscar');
  await expect(page.locator(cards)).toHaveCount(initial);
  await expect(page.getByRole('button', { name: /^Filtros \(/ })).toHaveCount(0);
  await page.screenshot({ path: `${SHOTS}/despues-vuelta-sin-filtros.png` });
});
