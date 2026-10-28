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

async function fillStep1(page: Page, name: string) {
  await page.getByRole('link', { name: 'Registrar' }).click();
  await page.locator('#name').fill(name);
  await page.locator('#breed').fill('Mestizo');
  await page.locator('#age').fill('18');
  await page.locator('#district').selectOption('Miraflores');
  await page.getByRole('button', { name: 'Continuar' }).click();
}

async function publish(page: Page) {
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.locator('#about').fill('Compañero buscando hogar.');
  await page.getByRole('button', { name: 'Publicar mascota' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Publicar' }).click();
}

async function logout(page: Page) {
  await page.goto('./#/perfil');
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/#\/login/);
}

test('HU-16 c5: la etiqueta de personalidad elegida queda seleccionada y se ve en el perfil', async ({ page }) => {
  await fillStep1(page, 'Etiquetada');
  await page.locator('input[type="file"]').setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: TINY_PNG });
  const tag = page.getByRole('button', { name: 'Cariñoso/a' });
  await tag.click();
  await expect(tag).toHaveAttribute('aria-pressed', 'true');
  await shot(page, 'HU-16-etiqueta-elegida');
  await publish(page);
  await page.getByRole('link', { name: /Etiquetada/ }).click();
  await expect(page).toHaveURL(/#\/mascota\//);
  await expect(page.getByText('Cariñoso/a', { exact: true })).toBeVisible();
});

test('HU-16 c6: al publicar se guarda y se muestra un mensaje de confirmación', async ({ page }) => {
  await fillStep1(page, 'Confirmada');
  await page.locator('input[type="file"]').setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: TINY_PNG });
  await publish(page);
  await expect(page.locator('[aria-live="polite"]')).toContainText('¡Mascota registrada!');
  await expect(page.getByText('Confirmada').first()).toBeVisible();
  await shot(page, 'HU-16-confirmacion');
});

test('HU-16 c7: registrar, aprobar el admin y ver la mascota con su foto en /buscar', async ({ page }) => {
  await fillStep1(page, 'Visible');
  await page.locator('input[type="file"]').setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: TINY_PNG });
  await page.getByRole('button', { name: 'Cariñoso/a' }).click();
  await publish(page);
  await logout(page);

  await page.getByLabel('Correo electrónico').fill('admin@kuyaypet.pe');
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.locator('[data-tour="admin-pending"]')).toBeVisible();
  await page.locator('li', { hasText: 'Visible' }).getByRole('button', { name: 'Aprobar' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Aprobar' }).click();
  await logout(page);

  await page.goto('./');
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await page.goto('./#/buscar');
  const img = page.getByRole('img', { name: 'Foto de Visible' });
  await expect(img).toBeVisible();
  await expect(img).toHaveAttribute('src', /^data:image\//);
  await shot(page, 'HU-16-en-catalogo');
  await img.click();
  await expect(page).toHaveURL(/#\/mascota\//);
  await expect(page.getByRole('heading', { name: 'Visible', exact: true })).toBeVisible();
  await expect(page.getByText('Cariñoso/a', { exact: true })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Foto 1 de Visible' })).toBeVisible();
});
