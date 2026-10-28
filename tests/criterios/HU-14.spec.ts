import { expect, test, type Page } from '@playwright/test';

const PREFIX = process.env.SHOT_PREFIX ?? 'despues';
const shot = (page: Page, name: string) => page.screenshot({ path: `../../Sprint_04/7.Pruebas/evidencias/HU-14/${PREFIX}-${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
});

async function loginAsAdopter(page: Page) {
  await page.getByRole('button', { name: /Adoptante/ }).click();
}

test('HU-14 c1: la guía es accesible desde la navegación principal y muestra requisitos, preguntas frecuentes y consejos', async ({ page }) => {
  await loginAsAdopter(page);
  await page.goto('./#/buscar');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(nav).toBeVisible();
  await shot(page, 'barra-principal');
  await nav.getByRole('link', { name: 'Guía' }).click();
  const guide = page.locator('[data-hu="HU-14"]');
  await expect(guide).toBeVisible();
  await expect(guide.getByRole('heading', { name: 'Guía de adopción responsable' })).toBeVisible();
  await expect(guide.getByRole('button', { name: /Requisitos para adoptar/ })).toBeVisible();
  await expect(guide.getByRole('button', { name: /Preguntas frecuentes/ })).toBeVisible();
  await expect(guide.getByRole('button', { name: /Preparar tu hogar/ })).toBeVisible();
  await expect(guide.getByText('Ser mayor de edad')).toBeVisible();
  await shot(page, 'guia');
});

test('HU-14 c2: seleccionar una categoría despliega su contenido detallado', async ({ page }) => {
  await page.goto('./#/guia');
  const guide = page.locator('[data-hu="HU-14"]');
  await expect(guide.getByText('Asegura ventanas')).toBeHidden();
  await guide.getByRole('button', { name: /Preparar tu hogar/ }).click();
  await expect(guide.getByRole('button', { name: /Preparar tu hogar/ })).toHaveAttribute('aria-expanded', 'true');
  await expect(guide.getByText('Asegura ventanas, balcones y rejas')).toBeVisible();
  await expect(guide.getByText('Ser mayor de edad')).toBeHidden();
  await guide.getByRole('button', { name: /Preguntas frecuentes/ }).click();
  await expect(guide.getByText('¿La adopción tiene costo?')).toBeVisible();
  await shot(page, 'categoria');
});

test('HU-14 c4: el buscador filtra los artículos relacionados y oculta los demás', async ({ page }) => {
  await page.goto('./#/guia');
  const guide = page.locator('[data-hu="HU-14"]');
  const search = page.getByLabel('Buscar en la guía');
  await search.fill('contrato');
  await expect(guide.getByRole('button', { name: /Seguimiento post-adopción/ })).toBeVisible();
  await expect(guide.getByRole('button', { name: /Requisitos para adoptar/ })).toBeHidden();
  await expect(guide.getByRole('button', { name: /Preparar tu hogar/ })).toBeHidden();
  await shot(page, 'buscador-contrato');
  await search.fill('vacunas');
  await expect(guide.getByRole('button', { name: /Vacunas y salud/ })).toBeVisible();
  await expect(guide.getByRole('button', { name: /Preparar tu hogar/ })).toBeHidden();
  await expect(guide.getByRole('button', { name: /Marco legal en Perú/ })).toBeHidden();
  await search.fill('zzzxx');
  await expect(guide.getByText(/No encontramos resultados/)).toBeVisible();
});
