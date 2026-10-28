import { expect, test, type Page } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const shot = (page: Page, name: string) => page.screenshot({ path: `../../Sprint_04/7.Pruebas/evidencias/HU-22/despues-${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./#/login');
  await page.getByLabel('Correo electrónico').fill('admin@kuyaypet.pe');
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.locator('[data-tour="admin-pending"]')).toBeVisible();
});

async function openUser(page: Page, search: string) {
  await page.goto('./#/admin/usuarios');
  await page.getByLabel('Buscar usuario por nombre o correo').fill(search);
  await page.locator('a[href^="#/admin/usuarios/"]').first().click();
  await expect(page.locator('[data-hu="HU-22"]')).toBeVisible();
}

test('HU-22 c4: guardar cambios actualiza de verdad la información del usuario', async ({ page }) => {
  await openUser(page, 'Valeria Torres');
  const detailUrl = page.url();
  await page.locator('label:has-text("Nombre") input').fill('Valeria Persistida');
  await page.locator('label:has-text("Distrito") input').fill('Barranco');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('Cambios guardados');
  await page.reload();
  await page.goto(detailUrl);
  await expect(page.locator('label:has-text("Nombre") input')).toHaveValue('Valeria Persistida');
  await expect(page.locator('label:has-text("Distrito") input')).toHaveValue('Barranco');
  await expect(page.getByText('Valeria Persistida').first()).toBeVisible();
  await shot(page, 'datos-persistidos');
  await page.goto('./#/admin/usuarios');
  await page.getByLabel('Buscar usuario por nombre o correo').fill('Valeria Persistida');
  await expect(page.locator('a[href^="#/admin/usuarios/"]').first()).toContainText('Valeria Persistida');
});

test('HU-22 c7: desactivar un usuario muestra el mensaje de confirmación', async ({ page }) => {
  await openUser(page, 'Valeria Torres');
  await page.getByRole('button', { name: 'Desactivar usuario' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Desactivar' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('fue desactivado');
  await expect(page.locator('[aria-live="polite"]')).toContainText('Inactiva');
  await shot(page, 'desactivacion-toast');
});
