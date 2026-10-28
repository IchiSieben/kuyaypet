// HU-15 evidence: criteria 1-5 of the PDF, one screenshot per criterion. C2 is Simulado: the e-mail is an in-app mailbox.
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart } from './shared';

test('HU-15 recuperación de contraseña: criterios 1 a 5', async ({ page }) => {
  await freshStart(page);
  await page.goto('./#/login');
  await beat(page);

  // C1: "¿Olvidaste tu contraseña?" opens the view to enter the registered e-mail
  await page.getByRole('link', { name: '¿Olvidaste tu contraseña?' }).click();
  await expect(page.locator('[data-hu="HU-15"]')).toBeVisible();
  await expect(page.getByLabel('Correo electrónico')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-15', 'P-HU-15-01-vista-correo');

  // C3: unregistered e-mail and invalid format both show an error and no code step
  await page.getByLabel('Correo electrónico').fill('nadie.registrado@correo.com');
  await page.getByRole('button', { name: 'Enviar enlace de recuperación' }).click();
  await expect(page.getByRole('alert')).toContainText('No encontramos una cuenta con ese correo.');
  await expect(page.getByLabel('Código de 6 dígitos')).toHaveCount(0);
  await beat(page);
  await evid(page, 'HU-15', 'P-HU-15-03a-correo-no-registrado');
  await page.getByLabel('Correo electrónico').fill('correo-sin-formato');
  await page.getByRole('button', { name: 'Enviar enlace de recuperación' }).click();
  await expect(page.getByRole('alert')).toContainText('formato válido');
  await expect(page.getByLabel('Código de 6 dígitos')).toHaveCount(0);
  await beat(page);
  await evid(page, 'HU-15', 'P-HU-15-03b-formato-invalido');

  // C2 (Simulado): registered e-mail -> simulated mailbox shown in the app, nothing is really sent
  await page.getByLabel('Correo electrónico').fill('adoptante@kuyaypet.pe');
  await page.getByRole('button', { name: 'Enviar enlace de recuperación' }).click();
  await expect(page.getByRole('dialog', { name: 'Bandeja de correo simulada' })).toBeVisible();
  await beat(page);
  await evid(page, 'HU-15', 'P-HU-15-02-bandeja-simulada');
  await page.getByRole('button', { name: /Usar código/ }).click();

  // C4: reset view with minimum security rules (8 characters, matching confirmation)
  await page.getByLabel('Nueva contraseña').fill('corta1');
  await page.getByLabel('Confirmar contraseña').fill('corta1');
  await page.getByRole('button', { name: 'Cambiar contraseña' }).click();
  await expect(page.getByRole('alert')).toContainText('al menos 8 caracteres');
  await expect(page).toHaveURL(/#\/recuperar/);
  await beat(page);
  await evid(page, 'HU-15', 'P-HU-15-04a-minimo-8-caracteres');
  await page.getByLabel('Nueva contraseña').fill('nuevaClave123');
  await page.getByLabel('Confirmar contraseña').fill('otraClave456');
  await page.getByRole('button', { name: 'Cambiar contraseña' }).click();
  await expect(page.getByRole('alert')).toContainText('no coinciden');
  await expect(page).toHaveURL(/#\/recuperar/);
  await beat(page);
  await evid(page, 'HU-15', 'P-HU-15-04b-no-coinciden');

  // C5: success -> confirmation message, redirect to login, new password works
  await page.getByLabel('Confirmar contraseña').fill('nuevaClave123');
  await page.getByRole('button', { name: 'Cambiar contraseña' }).click();
  await expect(page).toHaveURL(/#\/login/);
  await expect(page.locator('[aria-live="polite"]')).toContainText('Contraseña actualizada');
  await beat(page);
  await evid(page, 'HU-15', 'P-HU-15-05-contrasena-actualizada');
  await page.getByLabel('Correo electrónico').fill('adoptante@kuyaypet.pe');
  await page.locator('#password').fill('nuevaClave123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/#\/(descubrir|onboarding)/);
  await beat(page, 1500);
});
