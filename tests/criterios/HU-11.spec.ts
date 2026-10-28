import { expect, test, type Page } from '@playwright/test';

const shot = (page: Page, name: string) => page.screenshot({ path: `docs/screenshots/${name}.png` });

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
  await page.getByRole('button', { name: /Responsable/ }).click();
  await expect(page.locator('[data-tour="owner-interests"]')).toBeVisible();
});

async function registerPet(page: Page, name: string) {
  await page.getByRole('link', { name: 'Registrar' }).click();
  await page.locator('#name').fill(name);
  await page.locator('#breed').fill('Mestizo');
  await page.locator('#age').fill('18');
  await page.locator('#district').selectOption('Miraflores');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: TINY_PNG });
  await expect(page.locator('img[alt=""]').first()).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.locator('#about').fill('Compañero buscando hogar.');
  await page.getByRole('button', { name: 'Publicar mascota' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Publicar' }).click();
}

test('HU-11 c4: al registrar se muestra el mensaje de confirmación', async ({ page }) => {
  await registerPet(page, 'Confirmada');
  const live = page.locator('[aria-live="polite"]');
  await expect(live).toContainText('¡Mascota registrada!');
  await shot(page, 'HU-11-confirmacion');
  await expect(page).toHaveURL(/#\/responsable/);
});

test('HU-11 c6: documenta el comportamiento real: queda "En revisión" y es visible en /buscar solo tras aprobación del admin (ADR-05)', async ({ page }) => {
  await registerPet(page, 'Revisada');
  await expect(page.getByText('Revisada').first()).toBeVisible();
  await expect(page.getByText('En revisión').first()).toBeVisible();

  const logout = async () => {
    await page.goto('./#/perfil');
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page).toHaveURL(/#\/login/);
  };

  // Antes de aprobar: un adoptante no la ve en /buscar.
  await logout();
  await page.goto('./');
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await page.goto('./#/buscar');
  await expect(page.getByRole('img', { name: 'Foto de Porotopo' }).first()).toBeVisible();
  await expect(page.getByRole('img', { name: 'Foto de Revisada' })).toHaveCount(0);
  await logout();

  // El admin la aprueba.
  await page.getByLabel('Correo electrónico').fill('admin@kuyaypet.pe');
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.locator('[data-tour="admin-pending"]')).toBeVisible();
  await page.locator('li', { hasText: 'Revisada' }).getByRole('button', { name: 'Aprobar' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Aprobar' }).click();
  await logout();

  // Después de aprobar: el adoptante la ve en /buscar.
  await page.goto('./');
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await page.goto('./#/buscar');
  await expect(page.getByRole('img', { name: 'Foto de Revisada' })).toBeVisible();
  await shot(page, 'HU-11-visible-tras-aprobar');
});
