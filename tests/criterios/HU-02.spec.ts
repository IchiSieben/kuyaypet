import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
});

test('HU-02 c2: cada tarjeta muestra la edad de la mascota', async ({ page }) => {
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await page.goto('./#/buscar');
  const cards = page.locator('[data-hu="HU-02"] a[href^="#/mascota/"]');
  await expect(cards.first()).toBeVisible();
  const db = await page.evaluate(() => JSON.parse(localStorage.getItem('kuyaypet-db') || '{}').state);
  const n = await cards.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    const card = cards.nth(i);
    const id = (await card.getAttribute('href'))!.replace('#/mascota/', '');
    const pet = db.pets.find((p: any) => p.id === id);
    const months: number = pet.ageMonths;
    const expected = months < 12 ? `${months} ${months === 1 ? 'mes' : 'meses'}` : `${Math.floor(months / 12)} ${Math.floor(months / 12) === 1 ? 'año' : 'años'}`;
    await expect(card).toContainText(expected);
  }
  await cards.first().screenshot({ path: '../../Sprint_01/7.Pruebas/evidencias/HU-02/despues-tarjeta-con-edad.png' });
});
