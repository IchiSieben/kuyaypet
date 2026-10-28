import { expect, test, type Page } from '@playwright/test';

const EV = '../../Sprint_03/7.Pruebas/evidencias/HU-13';
const shot = (page: Page, name: string) => page.screenshot({ path: `${EV}/${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
  await page.getByRole('button', { name: /Responsable/ }).click();
  await expect(page.locator('[data-tour="owner-interests"]')).toBeVisible();
});

async function switchSession(page: Page, userId: string) {
  await page.evaluate((id) => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    raw.state.sessionUserId = id;
    localStorage.setItem('kuyaypet-db', JSON.stringify(raw));
  }, userId);
  await page.goto('./');
  await page.reload();
}

/** The demo adopter likes Porotopo (owned by the demo owner); the session ends back as the owner. */
async function adopterLikesPorotopo(page: Page) {
  await switchSession(page, 'u-adopter-demo');
  await page.goto('./#/mascota/p01');
  await page.getByRole('button', { name: 'Me gusta', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Me gusta', exact: true })).toHaveCount(0);
  await switchSession(page, 'u-owner-demo');
}

const badge = (page: Page) => page.locator('[data-tour="bell"] span.bg-coral');

test('HU-13 c2: la campana muestra el contador de notificaciones sin leer', async ({ page }) => {
  await expect(badge(page)).toHaveText('2');
  await shot(page, 'despues-campana-contador-2');
  await adopterLikesPorotopo(page);
  await expect(badge(page)).toHaveText('3');
  await expect(page.locator('[data-tour="bell"]')).toHaveAttribute('aria-label', 'Notificaciones, 3 sin leer');
  await shot(page, 'despues-campana-contador-3');
});

test('HU-13 c4: la lista muestra adoptante, mascota, fecha y hora, y distingue leídas de no leídas', async ({ page }) => {
  await adopterLikesPorotopo(page);
  const adopterName = await page.evaluate(() => JSON.parse(localStorage.getItem('kuyaypet-db')!).state.users.find((u: { id: string }) => u.id === 'u-adopter-demo').name as string);
  await page.goto('./#/notificaciones');
  const items = page.locator('[data-hu="HU-13"] ul li');
  const fresh = items.first();
  await expect(fresh).toContainText(adopterName);
  await expect(fresh).toContainText('Porotopo');
  await expect(fresh).toContainText(/\d{1,2}:\d{2}/);
  await expect(fresh.getByLabel('No leída')).toBeVisible();
  await expect(items).toHaveCount(4);
  await expect(page.getByLabel('No leída')).toHaveCount(3);
  const readOne = items.filter({ hasNot: page.getByLabel('No leída') });
  await expect(readOne).toHaveCount(1);
  await expect(readOne.first()).toContainText(/\d{1,2}:\d{2}/);
  await shot(page, 'despues-lista-leidas-no-leidas');
});

test('HU-13 c5: al marcar como leída el contador de la campana se actualiza', async ({ page }) => {
  await expect(badge(page)).toHaveText('2');
  await page.goto('./#/notificaciones');
  await expect(page.getByText('2 sin leer')).toBeVisible();
  await page.locator('[data-hu="HU-13"] ul li button', { hasText: 'Nuevo interés' }).first().click();
  await expect(badge(page)).toHaveText('1');
  await expect(page.getByText('1 sin leer')).toBeVisible();
  await shot(page, 'despues-contador-tras-leer-una');
  await page.getByRole('button', { name: 'Marcar todo como leído' }).click();
  await expect(badge(page)).toHaveCount(0);
  await expect(page.getByText('Estás al día')).toBeVisible();
  await shot(page, 'despues-contador-tras-leer-todo');
});
