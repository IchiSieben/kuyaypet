import { expect, test, type Page } from '@playwright/test';

const EVID = '../../Sprint_02/7.Pruebas/evidencias/HU-19';
const shot = (page: Page, name: string) => page.screenshot({ path: `${EVID}/${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
});

async function loginAsAdopter(page: Page) {
  await page.getByRole('button', { name: /Adoptante/ }).click();
}

/** Marks a pet as adopted directly in the local "database" (the owner flow is covered by owner.spec.ts). */
async function markAdopted(page: Page, petId: string) {
  await page.evaluate((id) => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    raw.state.pets = raw.state.pets.map((p: { id: string }) => (p.id === id ? { ...p, status: 'adoptada' } : p));
    localStorage.setItem('kuyaypet-db', JSON.stringify(raw));
  }, petId);
  await page.reload();
}

test('HU-19 c6: la mascota adoptada aparece como "Adoptada" en el historial', async ({ page }) => {
  await loginAsAdopter(page);
  await page.goto('./#/historial');
  const row = page.locator('[data-hu="HU-18"] li').first();
  await expect(row).toBeVisible();
  const name = (await row.locator('span.font-bold').first().textContent())!.trim();
  const link = row.locator('a[href^="#/mascota/"]');
  const petId = (await link.getAttribute('href'))!.split('/').pop()!;
  await markAdopted(page, petId);
  await page.goto('./#/historial');
  await expect(page.locator('[data-hu="HU-18"] li').filter({ hasText: name }).getByText('Adoptada', { exact: true })).toBeVisible();
  await shot(page, 'despues-adoptada-historial');
});

test('HU-19 c6: un favorito adoptado muestra "Adoptada" en favoritos', async ({ page }) => {
  await loginAsAdopter(page);
  await page.goto('./#/favoritos');
  const first = page.locator('[data-hu="HU-17"] a[href^="#/mascota/"]').first();
  await expect(first).toBeVisible();
  const href = (await first.getAttribute('href')) ?? '';
  await markAdopted(page, href.split('/').pop()!);
  await expect(page.locator(`[data-hu="HU-17"] a[href="${href}"]`).getByText('Adoptada 🎉')).toBeVisible();
  await shot(page, 'despues-adoptada-favoritos');
});

test('HU-19 c7: una mascota adoptada impide nuevas solicitudes y muestra un mensaje', async ({ page }) => {
  await loginAsAdopter(page);
  await page.goto('./#/favoritos');
  const first = page.locator('[data-hu="HU-17"] a[href^="#/mascota/"]').first();
  await expect(first).toBeVisible();
  const href = (await first.getAttribute('href')) ?? '';
  await markAdopted(page, href.split('/').pop()!);
  await page.goto(`./${href}`);
  await expect(page.getByText(/ya encontró un hogar\. No se aceptan nuevas solicitudes\./)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Me gusta', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Coordinar' })).toHaveCount(0);
  await shot(page, 'despues-solicitud-bloqueada');
});
