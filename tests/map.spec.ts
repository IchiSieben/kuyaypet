import { expect, test } from '@playwright/test';

test('HU-05 mapa: la vista Mapa muestra marcadores dentro del radio', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await page.goto('./#/buscar');
  await page.locator('#browse-district').selectOption('Miraflores');
  await page.locator('#browse-radius').fill('20');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await page.getByRole('button', { name: 'Mapa' }).click();
  await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible({ timeout: 15000 });
  await page.locator('.leaflet-container').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'docs/screenshots/HU-05-mapa.png' });
});
