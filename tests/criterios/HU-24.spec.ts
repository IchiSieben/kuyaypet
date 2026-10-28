import { expect, test, type Page } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const EVID = '../../Sprint_04/7.Pruebas/evidencias/HU-24';
const shot = (page: Page, name: string) => page.screenshot({ path: `${EVID}/${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
});

async function login(page: Page, email: string, home: string) {
  await page.goto('./#/login');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(new RegExp(`#${home}`));
}

async function logout(page: Page) {
  await page.goto('./#/perfil');
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/#\/login/);
}

const card = (page: Page, name: string) => page.locator('[data-hu="HU-24"] li', { hasText: name });

test('HU-24 c2: al seleccionar una publicación pendiente se muestra la información de la mascota', async ({ page }) => {
  await login(page, 'admin@kuyaypet.pe', '/admin');
  await card(page, 'Salem').locator('a').click();
  await expect(page).toHaveURL(/#\/mascota\/p38/);
  await expect(page.getByRole('heading', { name: 'Salem' }).first()).toBeVisible();
  await shot(page, 'despues-c2-informacion-mascota');
});

test('HU-24 c3: Aprobar solicita confirmación; cancelar no cambia el estado', async ({ page }) => {
  await login(page, 'admin@kuyaypet.pe', '/admin');
  await card(page, 'Salem').getByRole('button', { name: 'Aprobar' }).click();
  const dlg = page.getByRole('alertdialog');
  await expect(dlg).toContainText('¿Aprobar a Salem?');
  await shot(page, 'despues-c3-confirmar-aprobacion');
  await dlg.getByRole('button', { name: 'Cancelar' }).click();
  await expect(card(page, 'Salem')).toBeVisible();
});

test('HU-24 c4, c7: al confirmar la aprobación la mascota queda Aprobada, visible en /buscar, con mensaje de confirmación', async ({ page }) => {
  await login(page, 'admin@kuyaypet.pe', '/admin');
  await card(page, 'Salem').getByRole('button', { name: 'Aprobar' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Aprobar' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('Publicación de Salem aprobada');
  await expect(card(page, 'Salem')).toHaveCount(0);
  await shot(page, 'despues-c7-mensaje-aprobada');

  await page.goto('./#/admin/publicaciones/p38');
  await expect(page.getByText('Aprobada', { exact: true })).toBeVisible();

  await logout(page);
  await login(page, 'adoptante@kuyaypet.pe', '/descubrir');
  await page.goto('./#/buscar');
  await expect(page.getByRole('heading', { name: 'Salem' })).toBeVisible();
  await shot(page, 'despues-c4-visible-en-buscar');
});

test('HU-24 c5: Rechazar permite indicar el motivo y exige uno', async ({ page }) => {
  await login(page, 'admin@kuyaypet.pe', '/admin');
  await card(page, 'Michi').getByRole('button', { name: 'Rechazar' }).click();
  const publish = page.getByRole('button', { name: 'Rechazar publicación' });
  await expect(page.getByLabel('Motivo del rechazo')).toBeVisible();
  await expect(publish).toBeDisabled();
  await page.getByRole('button', { name: 'Contenido inapropiado' }).click();
  await expect(publish).toBeEnabled();
  await shot(page, 'despues-c5-motivo-rechazo');
});

test('HU-24 c6, c7: al confirmar el rechazo queda Rechazada con mensaje, no visible en /buscar y el responsable ve el estado', async ({ page }) => {
  await login(page, 'admin@kuyaypet.pe', '/admin');
  await card(page, 'Michi').getByRole('button', { name: 'Rechazar' }).click();
  await page.getByLabel('Motivo del rechazo').fill('Fotos no corresponden a la mascota');
  await page.getByRole('button', { name: 'Rechazar publicación' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('Publicación de Michi rechazada');
  await expect(card(page, 'Michi')).toHaveCount(0);
  await shot(page, 'despues-c7-mensaje-rechazada');

  await page.goto('./#/admin/publicaciones/p37');
  await expect(page.getByText('Rechazada', { exact: true })).toBeVisible();
  await expect(page.getByText('Fotos no corresponden a la mascota')).toBeVisible();

  await logout(page);
  await login(page, 'adoptante@kuyaypet.pe', '/descubrir');
  await page.goto('./#/buscar');
  await expect(page.getByRole('heading', { name: 'Toby' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Michi' })).toHaveCount(0);

  await logout(page);
  await login(page, 'responsable@kuyaypet.pe', '/responsable');
  await expect(page.getByRole('link', { name: 'Michi Rechazada' })).toBeVisible();
  await shot(page, 'despues-c6-responsable-ve-rechazada');
});
