import { expect, test, type Page } from '@playwright/test';

const shot = (page: Page, name: string) => page.screenshot({ path: `../../Sprint_04/7.Pruebas/evidencias/HU-15/despues-${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./#/recuperar');
});

async function requestCode(page: Page, email: string) {
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByRole('button', { name: 'Enviar enlace de recuperación' }).click();
  await expect(page.getByRole('dialog', { name: 'Bandeja de correo simulada' })).toBeVisible();
  await page.getByRole('button', { name: /Usar código/ }).click();
}

test('HU-15 c3: correo no registrado o con formato inválido muestra error', async ({ page }) => {
  await page.getByLabel('Correo electrónico').fill('nadie.registrado@correo.com');
  await page.getByRole('button', { name: 'Enviar enlace de recuperación' }).click();
  await expect(page.getByRole('alert')).toContainText('No encontramos una cuenta con ese correo.');
  await expect(page.getByLabel('Código de 6 dígitos')).toHaveCount(0);
  await shot(page, 'correo-no-registrado');
  await page.getByLabel('Correo electrónico').fill('correo-sin-formato');
  await page.getByRole('button', { name: 'Enviar enlace de recuperación' }).click();
  await expect(page.getByRole('alert')).toContainText('formato válido');
  await expect(page.getByLabel('Código de 6 dígitos')).toHaveCount(0);
});

test('HU-15 c4: la nueva contraseña exige mínimo 8 caracteres y confirmación igual', async ({ page }) => {
  await requestCode(page, 'adoptante@kuyaypet.pe');
  await page.getByLabel('Nueva contraseña').fill('corta1');
  await page.getByLabel('Confirmar contraseña').fill('corta1');
  await page.getByRole('button', { name: 'Cambiar contraseña' }).click();
  await expect(page.getByRole('alert')).toContainText('al menos 8 caracteres');
  await expect(page).toHaveURL(/#\/recuperar/);
  await page.getByLabel('Nueva contraseña').fill('nuevaClave123');
  await page.getByLabel('Confirmar contraseña').fill('otraClave456');
  await page.getByRole('button', { name: 'Cambiar contraseña' }).click();
  await expect(page.getByRole('alert')).toContainText('no coinciden');
  await expect(page).toHaveURL(/#\/recuperar/);
  await shot(page, 'no-coinciden');
});

test('HU-15 c5: al confirmar se muestra el mensaje y se redirige al login con la nueva contraseña', async ({ page }) => {
  await requestCode(page, 'adoptante@kuyaypet.pe');
  await page.getByLabel('Nueva contraseña').fill('nuevaClave123');
  await page.getByLabel('Confirmar contraseña').fill('nuevaClave123');
  await page.getByRole('button', { name: 'Cambiar contraseña' }).click();
  await expect(page).toHaveURL(/#\/login/);
  await expect(page.locator('[aria-live="polite"]')).toContainText('Contraseña actualizada');
  await shot(page, 'contrasena-actualizada');
  await page.getByLabel('Correo electrónico').fill('adoptante@kuyaypet.pe');
  await page.locator('#password').fill('nuevaClave123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/#\/(descubrir|onboarding)/);
});
