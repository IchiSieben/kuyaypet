import { expect, test } from '@playwright/test';

const cards = '[data-hu="HU-02"] a[href^="#/mascota/"]';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
});

test('HU-05 c4: cada resultado cercano muestra su información básica y su distancia aproximada', async ({ page }) => {
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await page.goto('./#/buscar');
  await expect(page.locator(cards).first()).toBeVisible();
  await expect(page.locator(`${cards} b`)).toHaveCount(0);
  await page.getByLabel('O elige tu distrito').selectOption('Miraflores');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByText('Mostrando mascotas cerca de Miraflores')).toBeVisible();
  const list = page.locator(cards);
  const n = await list.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    const card = list.nth(i);
    await expect(card.locator('h3')).not.toBeEmpty();
    await expect(card.locator('img')).toBeVisible();
    const dist = (await card.locator('b').textContent())!.trim();
    expect(dist).toMatch(/^a (\d+ m|\d+\.\d km)$/);
    const km = dist.endsWith(' km') ? parseFloat(dist.slice(2)) : parseInt(dist.slice(2)) / 1000;
    expect(km).toBeLessThanOrEqual(10.05);
  }
  await list.first().screenshot({ path: '../../Sprint_02/7.Pruebas/evidencias/HU-05/despues-tarjeta-con-distancia.png' });
});
