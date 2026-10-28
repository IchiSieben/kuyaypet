// HU-01 evidence: cases P-HU-01-01..04 of Sprint_01/7.Pruebas, one screenshot per case.
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart, readDb } from './shared';

test('HU-01 registro de usuario: casos P-HU-01-01 a P-HU-01-04', async ({ page }) => {
  await freshStart(page);
  await beat(page, 1200);
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await beat(page);

  // P-HU-01-01: required fields empty
  await page.getByRole('button', { name: 'Registrarse' }).click();
  await expect(page.getByRole('alert')).toContainText('obligatorios');
  await beat(page);
  await evid(page, 'HU-01', 'P-HU-01-01-campos-obligatorios');

  // P-HU-01-02: invalid e-mail, then password shorter than 8 characters
  await page.getByLabel('Nombre completo').fill('Ana Prueba');
  await page.getByLabel('Correo electrónico').fill('ana@');
  await page.locator('#password').fill('12345678');
  await page.locator('#confirm').fill('12345678');
  await page.getByRole('button', { name: 'Registrarse' }).click();
  await expect(page.getByRole('alert')).toContainText('formato');
  await beat(page);
  await evid(page, 'HU-01', 'P-HU-01-02a-correo-invalido');

  await page.getByLabel('Correo electrónico').fill('ana.prueba@correo.com');
  await page.locator('#password').fill('123');
  await page.getByRole('button', { name: 'Registrarse' }).click();
  await expect(page.getByRole('alert')).toContainText('8 caracteres');
  await beat(page);
  await evid(page, 'HU-01', 'P-HU-01-02b-contrasena-corta');

  // P-HU-01-03: e-mail already registered (demo adopter account)
  await page.locator('#password').fill('12345678');
  await page.getByLabel('Correo electrónico').fill('adoptante@kuyaypet.pe');
  await page.getByRole('button', { name: 'Registrarse' }).click();
  await expect(page.getByRole('alert')).toContainText('ya está registrado');
  await beat(page);
  await evid(page, 'HU-01', 'P-HU-01-03-correo-duplicado');

  // P-HU-01-04: valid data creates the account and confirms it
  await page.getByLabel('Correo electrónico').fill('ana.prueba@correo.com');
  await page.getByRole('button', { name: 'Registrarse' }).click();
  await expect(page.getByText('¡Cuenta creada con éxito!')).toBeVisible();
  await expect(page.locator('[data-tour="onboarding"]')).toBeVisible({ timeout: 15_000 });
  await evid(page, 'HU-01', 'P-HU-01-04-cuenta-creada');
  const after = await readDb(page);
  const created = after.users.find((u: any) => u.email === 'ana.prueba@correo.com');
  expect(created?.name).toBe('Ana Prueba');
  expect(after.sessionUserId).toBe(created.id);
  // P-HU-01-03 (continued): the rejected duplicate did not add a second account
  expect(after.users.filter((u: any) => u.email === 'adoptante@kuyaypet.pe')).toHaveLength(1);
  await beat(page, 1500);
});
