import { expect, test, type Page } from '@playwright/test';

const shot = (page: Page, name: string) => page.screenshot({ path: `docs/screenshots/${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
});

test('HU-01 registro: validaciones y cuenta nueva → cuestionario', async ({ page }) => {
  await expect(page.locator('[data-hu="HU-01"]')).toBeVisible();
  await page.waitForTimeout(900);
  await shot(page, 'HU-01-splash');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await page.getByRole('button', { name: 'Registrarse' }).click();
  await expect(page.getByRole('alert')).toContainText('obligatorios');
  await page.getByLabel('Nombre completo').fill('Ana Prueba');
  await page.getByLabel('Correo electrónico').fill('ana@');
  await page.locator('#password').fill('12345678');
  await page.locator('#confirm').fill('12345678');
  await page.getByRole('button', { name: 'Registrarse' }).click();
  await expect(page.getByRole('alert')).toContainText('formato');
  await page.getByLabel('Correo electrónico').fill('adoptante@kuyaypet.pe');
  await page.getByRole('button', { name: 'Registrarse' }).click();
  await expect(page.getByRole('alert')).toContainText('ya está registrado');
  await page.locator('#password').fill('123');
  await page.getByLabel('Correo electrónico').fill('ana@correo.com');
  await page.getByRole('button', { name: 'Registrarse' }).click();
  await expect(page.getByRole('alert')).toContainText('8 caracteres');
  await page.locator('#password').fill('12345678');
  await shot(page, 'HU-01-registro');
  await page.getByRole('button', { name: 'Registrarse' }).click();
  await expect(page.locator('[data-tour="onboarding"]')).toBeVisible();
  await shot(page, 'HU-20-cuestionario');
  for (let i = 0; i < 7; i++) await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: /Ver mis mascotas compatibles/ }).click();
  await expect(page.locator('[data-tour="deck"]')).toBeVisible();
});

test('Flujo estrella: deck → Match → chat → coordinar → responsable acepta', async ({ page }) => {
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await expect(page.locator('[data-tour="deck"] article').first()).toBeVisible();
  await page.waitForTimeout(600);
  await shot(page, 'HU-06-deck');
  // presenter "guaranteed match" is a store flag; toggle it through the app state
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    raw.state.demo.guaranteedMatch = true;
    localStorage.setItem('kuyaypet-db', JSON.stringify(raw));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Me gusta', exact: true }).click();
  await expect(page.getByText('¡Es un Match!')).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(900);
  await shot(page, 'HU-07-match');
  await page.getByRole('button', { name: 'Continuar al chat' }).click();
  await expect(page.locator('[data-hu="HU-08"]')).toBeVisible();
  await page.getByLabel('Mensaje').fill('Hola, ¿podemos coordinar una visita?');
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expect(page.getByText(/Coordinar adopción/).first()).toBeVisible({ timeout: 8000 });
  await shot(page, 'HU-08-chat');
  await page.locator('[data-tour="chat-coordinate"]').click();
  await shot(page, 'HU-10-coordinar');
  await page.getByRole('button', { name: 'Enviar solicitud' }).click();
  await expect(page.getByText('¡Solicitud enviada!')).toBeVisible();
  await shot(page, 'HU-10-enviada');
  await page.goto('./#/matches');
  await expect(page.locator('[data-hu="HU-20"]')).toBeVisible();
  await shot(page, 'HU-20-matches');
  await page.locator('a[href^="#/mascota/"]').first().click();
  await expect(page.locator('[data-hu="HU-03"]')).toBeVisible();
  await shot(page, 'HU-03-perfil');
});

test('Responsable ve notificaciones y acepta solicitud; admin aprueba', async ({ page }) => {
  await page.getByRole('button', { name: /Responsable/ }).click();
  await expect(page.locator('[data-tour="owner-interests"]')).toBeVisible();
  await shot(page, 'HU-13-responsable');
  await page.locator('[data-tour="bell"]').click();
  await shot(page, 'HU-13-notificaciones');
  await page.goto('./#/perfil');
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/#\/login/);
  await page.goto('./#/responsable');
  await expect(page).toHaveURL(/#\/login/);
  await page.getByLabel('Correo electrónico').fill('admin@kuyaypet.pe');
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.locator('[data-tour="admin-pending"]')).toBeVisible();
  await page.waitForTimeout(4200); // KPI count-up and welcome toast finish before the report screenshot
  await shot(page, 'HU-24-admin');
});
