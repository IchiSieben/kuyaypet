import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });

test('HU-02 escritorio: el catálogo y el perfil usan el ancho de la pantalla', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
  await page.getByRole('button', { name: /Adoptante/ }).first().click();
  await expect(page.getByTestId('device-frame')).toHaveCount(1); // /descubrir keeps the presentation frame

  // Catálogo: sin marco, ancho útil y 3+ tarjetas en la primera fila.
  await page.goto('./#/buscar');
  const list = page.locator('[data-hu="HU-02"]');
  await expect(list).toBeVisible();
  await expect(page.getByTestId('device-frame')).toHaveCount(0);
  expect((await list.boundingBox())!.width).toBeGreaterThan(900);
  const cards = page.locator('[data-hu="HU-02"] a[href^="#/mascota/"]');
  await expect(cards.first()).toBeVisible();
  // Cards animate in, so poll until the first row settles.
  await expect
    .poll(async () => {
      const tops = await cards.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
      return tops.filter((t) => Math.abs(t - tops[0]) <= 2).length;
    })
    .toBeGreaterThanOrEqual(3);
  await page.screenshot({ path: 'docs/screenshots/HU-02-escritorio-catalogo.png' });

  // El panel del presentador sigue alcanzable (pestaña plegable).
  await page.getByRole('button', { name: 'Abrir panel de presentador' }).click();
  await expect(page.getByLabel('Panel de presentador')).toBeVisible();
  await expect(page.getByLabel('Panel de presentador').getByRole('button', { name: /Reiniciar demo/ })).toBeVisible();
  await page.getByRole('button', { name: 'Ocultar panel' }).click();

  // Perfil: sin marco, fotos | información en dos columnas.
  await cards.first().click();
  await expect(page).toHaveURL(/#\/mascota\//);
  const profile = page.locator('[data-hu="HU-03"]').first();
  await expect(profile).toBeVisible();
  await expect(page.getByTestId('device-frame')).toHaveCount(0);
  expect((await profile.boundingBox())!.width).toBeGreaterThan(900);
  const photo = await page.locator('img[alt^="Foto 1 de"]').boundingBox();
  const title = await page.getByRole('heading', { level: 1 }).boundingBox();
  expect(photo!.width).toBeGreaterThan(400);
  expect(title!.x).toBeGreaterThan(photo!.x + photo!.width - 1);
  await page.screenshot({ path: 'docs/screenshots/HU-02-escritorio-perfil.png' });

  // Otra ruta vuelve al modo presentación (marco + panel).
  await page.goto('./#/matches');
  await expect(page.getByTestId('device-frame')).toHaveCount(1);
  await expect(page.getByLabel('Panel de presentador')).toBeVisible();
});
