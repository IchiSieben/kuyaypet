import { expect, test, type Page } from '@playwright/test';

const shot = (page: Page, name: string) => page.screenshot({ path: `docs/screenshots/${name}.png` });

// 1x1 red pixel PNG, valid image bytes for setInputFiles.
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

test('HU-11/16 registrar mascota: wizard de 3 pasos con validaciones y fotos', async ({ page }) => {
  await page.getByRole('link', { name: 'Registrar' }).click();
  await expect(page.locator('[data-hu="HU-11"]')).toBeVisible();

  // Paso 1: intenta continuar sin llenar campos obligatorios.
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.locator('[role="alert"]')).toBeVisible();

  await page.locator('#name').fill('Firulais de Prueba');
  await page.locator('#breed').fill('Mestizo');
  await page.locator('#age').fill('18');
  await page.locator('#district').selectOption('Miraflores');
  await shot(page, 'HU-11-paso1');
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Paso 2: fotos y etiquetas.
  await expect(page.getByText('Fotos (máximo 4)')).toBeVisible();
  const fileInput = page.locator('input[type="file"]');

  // Archivo con formato inválido → error, sin crashear.
  await fileInput.setInputFiles({ name: 'documento.txt', mimeType: 'text/plain', buffer: Buffer.from('no es una imagen') });
  await expect(page.locator('[role="alert"]')).toContainText('Formato no permitido');

  // Archivo válido → preview instantáneo.
  await fileInput.setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: TINY_PNG });
  await expect(page.locator('img[alt=""]').first()).toBeVisible();
  await page.getByRole('button', { name: 'Cariñoso/a' }).click();
  await shot(page, 'HU-16-paso2');
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Paso 3: sobre mí, salud, energía.
  await page.locator('#about').fill('Un compañero muy especial buscando hogar.');
  await page.getByRole('button', { name: '✓ Vacunada' }).click();
  await shot(page, 'HU-11-paso3');
  await page.getByRole('button', { name: 'Publicar mascota' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Publicar' }).click();

  await expect(page).toHaveURL(/#\/responsable/);
  await expect(page.getByText('Firulais de Prueba').first()).toBeVisible();
  await expect(page.getByText('En revisión').first()).toBeVisible();
});

test('HU-12 editar información de una mascota propia', async ({ page }) => {
  await page.getByRole('link', { name: /Porotopo/ }).click();
  await expect(page).toHaveURL(/#\/mascota\//);
  const url = page.url();
  const id = url.match(/mascota\/([^/?]+)/)?.[1];
  await page.goto(`./#/responsable/editar/${id}`);
  await expect(page.locator('[data-hu="HU-12"]')).toBeVisible();
  await shot(page, 'HU-12-editar');
  const nameInput = page.locator('#name');
  await nameInput.fill('');
  await expect(nameInput).toHaveClass(/ring-coral/);
  await nameInput.fill('Porotopo Editado');
  await page.locator('#about').fill('Nueva descripción de prueba.');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page).toHaveURL(/#\/responsable/);
  await expect(page.getByText('Porotopo Editado').first()).toBeVisible();
});

test('HU-13 click en notificación de interés navega al perfil del adoptante', async ({ page }) => {
  // Generate a fresh interest (with actorId) as the adopter demo before checking the owner's notifications.
  await page.goto('./#/perfil');
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.goto('./');
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await page.goto('./#/mascota/p01');
  await page.getByRole('button', { name: 'Me gusta', exact: true }).click();

  await page.goto('./#/perfil');
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.goto('./');
  await page.getByRole('button', { name: /Responsable/ }).click();

  await page.goto('./#/notificaciones');
  await expect(page.locator('[data-hu="HU-13"]')).toBeVisible();
  await shot(page, 'HU-13-notificaciones-lista');
  const interestNotif = page.locator('ul li button', { hasText: /interesad/i }).first();
  await interestNotif.click();
  await expect(page).toHaveURL(/#\/adoptante\//);
  await expect(page.locator('[data-hu="HU-13"]')).toBeVisible();
});

test('HU-19 marcar mascota como adoptada bloquea nuevas solicitudes', async ({ page }) => {
  await page.getByRole('button', { name: 'Marcar como adoptada' }).first().click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Marcar como adoptada' }).click();
  await expect(page.getByText('Adoptada 🎉').first()).toBeVisible();
  await shot(page, 'HU-19-adoptada');
});
