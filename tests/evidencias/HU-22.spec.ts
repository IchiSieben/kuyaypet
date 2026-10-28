// HU-22 evidence: criteria 1-7 of the PDF, one screenshot per criterion.
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart } from './shared';

test.use({ reducedMotion: 'reduce' });

test('HU-22 gestionar usuarios: criterios 1 a 7', async ({ page }) => {
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
  await evid(page, 'HU-22', 'P-HU-22-01-lista-usuarios');

  // C2: selecting a user shows the registered information
  await page.getByLabel('Buscar usuario por nombre o correo').fill('Valeria Torres');
  await page.locator('a[href^="#/admin/usuarios/"]').first().click();
  await expect(page.locator('[data-hu="HU-22"]')).toBeVisible();
  await expect(page.getByText('Valeria Torres').first()).toBeVisible();
  const detailUrl = page.url();
  await beat(page);
  await evid(page, 'HU-22', 'P-HU-22-02-informacion-usuario');

  // C3: the edit option lets the admin change the data
  const name = page.locator('label:has-text("Nombre") input');
  const district = page.locator('label:has-text("Distrito") input');
  await expect(name).toBeEditable();
  await expect(district).toBeEditable();
  await name.fill('Valeria Persistida');
  await district.fill('Barranco');
  await beat(page);
  await evid(page, 'HU-22', 'P-HU-22-03-campos-editables');

  // C4 + C7 (edit): "Guardar cambios" shows the confirmation and really updates the user
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('Cambios guardados');
  await beat(page);
  await evid(page, 'HU-22', 'P-HU-22-07a-mensaje-edicion');
  await page.reload();
  await page.goto(detailUrl);
  await expect(name).toHaveValue('Valeria Persistida');
  await expect(district).toHaveValue('Barranco');
  await beat(page);
  await evid(page, 'HU-22', 'P-HU-22-04-datos-persistidos');

  // C5: deactivate with confirmation -> status Inactiva
  await page.goto('./#/admin/usuarios');
  await page.getByLabel('Buscar usuario por nombre o correo').fill('adoptante@kuyaypet.pe');
  await page.locator('a[href^="#/admin/usuarios/"]').first().click();
  await page.getByRole('button', { name: 'Desactivar usuario' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await beat(page);
  await page.getByRole('alertdialog').getByRole('button', { name: 'Desactivar' }).click();
  await expect(page.locator('[data-hu="HU-25"]').getByText('Inactiva')).toBeVisible();
  await expect(page.locator('[aria-live="polite"]')).toContainText('fue desactivado');
  await beat(page);
  await evid(page, 'HU-22', 'P-HU-22-05-cuenta-inactiva');

  // C7 (deactivation): confirmation message
  await evid(page, 'HU-22', 'P-HU-22-07b-mensaje-desactivacion');

  // C6: the deactivated user cannot log in
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
  await evid(page, 'HU-22', 'P-HU-22-06-login-bloqueado');
  await beat(page, 1500);
});
