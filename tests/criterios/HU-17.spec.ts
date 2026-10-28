import { expect, test, type Page } from '@playwright/test';

const EVID = '../../Sprint_02/7.Pruebas/evidencias/HU-17';
const shot = (page: Page, name: string) => page.screenshot({ path: `${EVID}/${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
});

async function loginAsAdopter(page: Page) {
  await page.getByRole('button', { name: /Adoptante/ }).click();
}

test('HU-17 c3: confirmación visual al agregar a favoritos', async ({ page }) => {
  await loginAsAdopter(page);
  await page.goto('./#/buscar');
  const add = page.locator('[data-hu="HU-02"] button[aria-label^="Agregar"]').first();
  const label = (await add.getAttribute('aria-label')) ?? '';
  const name = label.replace(/^Agregar a /, '').replace(/ a favoritos$/, '');
  await expect(add).toHaveAttribute('aria-pressed', 'false');
  await add.click();
  await expect(page.getByText(`${name} está en tus favoritos`)).toBeVisible();
  await expect(page.locator(`button[aria-label="Quitar a ${name} de favoritos"]`).first()).toHaveAttribute('aria-pressed', 'true');
  await shot(page, 'despues-confirmacion-favorito');
});

test('HU-17 c6: los favoritos se conservan tras cerrar sesión y volver a ingresar', async ({ page }) => {
  await loginAsAdopter(page);
  await page.goto('./#/favoritos');
  const cards = page.locator('[data-hu="HU-17"] a[href^="#/mascota/"]');
  await expect(cards.first()).toBeVisible();
  const before = await cards.count();
  const names = await page.locator('[data-hu="HU-17"] h3').allTextContents();

  await page.goto('./#/perfil');
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/#\/login/);

  await page.getByLabel('Correo electrónico').fill('adoptante@kuyaypet.pe');
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.goto('./#/favoritos');
  await expect(cards).toHaveCount(before);
  expect(await page.locator('[data-hu="HU-17"] h3').allTextContents()).toEqual(names);
  await shot(page, 'despues-favoritos-tras-relogin');
});

test('HU-17 c7: un favorito adoptado muestra su estado "Adoptada"', async ({ page }) => {
  await loginAsAdopter(page);
  await page.goto('./#/favoritos');
  const firstCard = page.locator('[data-hu="HU-17"] a[href^="#/mascota/"]').first();
  await expect(firstCard).toBeVisible();
  const href = (await firstCard.getAttribute('href')) ?? '';
  const petId = href.split('/').pop()!;
  await page.evaluate((id) => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    raw.state.pets = raw.state.pets.map((p: { id: string }) => (p.id === id ? { ...p, status: 'adoptada' } : p));
    localStorage.setItem('kuyaypet-db', JSON.stringify(raw));
  }, petId);
  await page.reload();
  await expect(page.locator(`[data-hu="HU-17"] a[href="${href}"]`).getByText('Adoptada 🎉')).toBeVisible();
  await shot(page, 'despues-favorito-adoptada');
});
