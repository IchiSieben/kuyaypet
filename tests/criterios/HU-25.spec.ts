import { expect, test, type Page } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const EVID = '../../Sprint_04/7.Pruebas/evidencias/HU-25';
const shot = (page: Page, name: string) => page.screenshot({ path: `${EVID}/${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
});

async function loginAdmin(page: Page) {
  await page.goto('./#/login');
  await page.getByLabel('Correo electrónico').fill('admin@kuyaypet.pe');
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.locator('[data-tour="admin-pending"]')).toBeVisible();
}

async function openUser(page: Page, email: string) {
  await page.goto('./#/admin/usuarios');
  await page.getByLabel('Buscar usuario por nombre o correo').fill(email);
  await page.locator('a[href^="#/admin/usuarios/"]').first().click();
  await expect(page.getByText('Estado de la cuenta')).toBeVisible();
}

test('HU-25 c5: una cuenta desactivada no puede iniciar sesión', async ({ page }) => {
  await loginAdmin(page);
  await openUser(page, 'adoptante@kuyaypet.pe');
  await page.getByRole('button', { name: 'Desactivar usuario' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Desactivar' }).click();
  await expect(page.locator('[data-hu="HU-25"]').getByText('Inactiva')).toBeVisible();

  await page.goto('./#/perfil');
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/#\/login/);
  await page.getByLabel('Correo electrónico').fill('adoptante@kuyaypet.pe');
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('alert')).toContainText('desactivada');
  await expect(page).toHaveURL(/#\/login/);
  await shot(page, 'despues-c5-login-bloqueado');
});

test('HU-25 c6: al desactivar la cuenta se muestra un mensaje de confirmación', async ({ page }) => {
  await loginAdmin(page);
  await openUser(page, 'adoptante@kuyaypet.pe');
  await page.getByRole('button', { name: 'Desactivar usuario' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Desactivar' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('fue desactivado');
  await shot(page, 'despues-c6-mensaje-desactivado');
});

test('HU-25 c7: una cuenta ya inactiva informa que ya se encuentra inactiva', async ({ page }) => {
  await loginAdmin(page);
  await openUser(page, 'martin.chavez@kuyaypet.pe');
  await expect(page.locator('[data-hu="HU-25"]').getByText('Inactiva')).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'La cuenta ya está inactiva' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Desactivar usuario' })).toHaveCount(0);
  await shot(page, 'despues-c7-cuenta-ya-inactiva');
});
