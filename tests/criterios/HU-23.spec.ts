import { expect, test, type Page } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const PREFIX = process.env.SHOT_PREFIX ?? 'despues';
const shot = (page: Page, name: string) => page.screenshot({ path: `../../Sprint_04/7.Pruebas/evidencias/HU-23/${PREFIX}-${name}.png`, fullPage: true });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./#/login');
  await page.getByLabel('Correo electrónico').fill('admin@kuyaypet.pe');
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.locator('[data-tour="admin-pending"]')).toBeVisible();
  await page.goto('./#/admin/publicaciones');
  await page.locator('a[href^="#/admin/publicaciones/"]').first().click();
  await expect(page.locator('[data-hu="HU-23"]')).toBeVisible();
});

test('HU-23 c3: el detalle muestra especie, edad, sexo, tamaño, distrito y salud', async ({ page }) => {
  await shot(page, 'detalle');
  const field = (label: string) => page.locator(`dt:text-is("${label}") + dd`);
  await expect(field('Especie')).toHaveText(/^(Perro|Gato)$/);
  await expect(field('Edad')).toHaveText(/(mes|año)/);
  await expect(field('Sexo')).toHaveText(/^(Macho|Hembra)$/);
  await expect(field('Tamaño')).toHaveText(/^(Pequeño|Mediano|Grande)$/);
  await expect(field('Distrito')).not.toBeEmpty();
  await expect(field('Salud')).not.toBeEmpty();
});

test('HU-23 c5: guardar cambios persiste la información de la mascota', async ({ page }) => {
  const detailUrl = page.url();
  await page.locator('label:has-text("Sobre mí") textarea').fill('Descripción persistida por el admin.');
  await page.locator('label:has-text("Raza") input').fill('Raza Editada');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('Cambios guardados');
  await page.reload();
  await page.goto(detailUrl);
  await expect(page.locator('label:has-text("Sobre mí") textarea')).toHaveValue('Descripción persistida por el admin.');
  await expect(page.locator('label:has-text("Raza") input')).toHaveValue('Raza Editada');
  await shot(page, 'persistencia');
  await page.goto('./#/admin/publicaciones');
  await expect(page.getByText(/Raza Editada/).first()).toBeVisible();
});
