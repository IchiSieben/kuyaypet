// HU-25 evidence: criteria 1-7 of the PDF (C7 is truncated in the PDF: "...ya se encuentra"), one screenshot per criterion.
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart } from './shared';

test.use({ reducedMotion: 'reduce' });

test('HU-25 desactivar cuentas de usuarios: criterios 1 a 7', async ({ page }) => {
  await freshStart(page);
  await page.goto('./#/login');
  await page.getByLabel('Correo electrónico').fill('admin@kuyaypet.pe');
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.locator('[data-tour="admin-pending"]')).toBeVisible();
  await beat(page);

  // C1: the users module lists the registered users
  await page.goto('./#/admin/usuarios');
  await expect(page.locator('[data-hu="HU-22"]')).toBeVisible();
  await expect(page.locator('a[href^="#/admin/usuarios/"]').first()).toBeVisible();
  await beat(page);
  await evid(page, 'HU-25', 'P-HU-25-01-lista-usuarios');

  // C2: selecting a user shows the account information and current status
  await page.getByLabel('Buscar usuario por nombre o correo').fill('adoptante@kuyaypet.pe');
  await page.locator('a[href^="#/admin/usuarios/"]').first().click();
  await expect(page.getByText('Estado de la cuenta')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Desactivar usuario' })).toBeVisible();
  await beat(page);
  await evid(page, 'HU-25', 'P-HU-25-02-informacion-y-estado');

  // C3: "Desactivar usuario" asks for confirmation
  await page.getByRole('button', { name: 'Desactivar usuario' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-25', 'P-HU-25-03-confirmar-desactivacion');

  // C4 + C6: confirming sets the status to Inactiva and shows the confirmation message
  await page.getByRole('alertdialog').getByRole('button', { name: 'Desactivar' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('fue desactivado');
  await expect(page.locator('[data-hu="HU-25"]').getByText('Inactiva')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-25', 'P-HU-25-06-mensaje-desactivado');
  await evid(page, 'HU-25', 'P-HU-25-04-estado-inactiva');

  // C5: the inactive account cannot log in
  await page.goto('./#/perfil');
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/#\/login/);
  await page.getByLabel('Correo electrónico').fill('adoptante@kuyaypet.pe');
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('alert')).toContainText('desactivada');
  await expect(page).toHaveURL(/#\/login/);
  await beat(page);
  await evid(page, 'HU-25', 'P-HU-25-05-login-bloqueado');

  // C7: an account that is already inactive says so
  await page.getByLabel('Correo electrónico').fill('admin@kuyaypet.pe');
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.locator('[data-tour="admin-pending"]')).toBeVisible();
  await page.goto('./#/admin/usuarios');
  await page.getByLabel('Buscar usuario por nombre o correo').fill('martin.chavez@kuyaypet.pe');
  await page.locator('a[href^="#/admin/usuarios/"]').first().click();
  await expect(page.locator('[data-hu="HU-25"]').getByText('Inactiva')).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'La cuenta ya está inactiva' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Desactivar usuario' })).toHaveCount(0);
  await beat(page);
  await evid(page, 'HU-25', 'P-HU-25-07-cuenta-ya-inactiva');
  await beat(page, 1500);
});
