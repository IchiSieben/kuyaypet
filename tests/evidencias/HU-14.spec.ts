// HU-14 evidence: criteria 1-4 of the PDF, one screenshot per criterion.
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart } from './shared';

test('HU-14 consulta de información sobre adopción: criterios 1 a 4', async ({ page }) => {
  await freshStart(page);
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await beat(page);
  await page.goto('./#/buscar');
  await beat(page);

  // C1: the guide is reached from the main navigation and shows requirements, FAQ and tips
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(nav).toBeVisible();
  await nav.getByRole('link', { name: 'Guía' }).click();
  const guide = page.locator('[data-hu="HU-14"]');
  await expect(guide.getByRole('heading', { name: 'Guía de adopción responsable' })).toBeVisible();
  await expect(guide.getByRole('button', { name: /Requisitos para adoptar/ })).toBeVisible();
  await expect(guide.getByRole('button', { name: /Preguntas frecuentes/ })).toBeVisible();
  await expect(guide.getByRole('button', { name: /Preparar tu hogar/ })).toBeVisible();
  await expect(guide.getByText('Ser mayor de edad')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-14', 'P-HU-14-01-centro-informativo');

  // C2: selecting a category expands its detailed content
  await guide.getByRole('button', { name: /Preparar tu hogar/ }).click();
  await expect(guide.getByRole('button', { name: /Preparar tu hogar/ })).toHaveAttribute('aria-expanded', 'true');
  await expect(guide.getByText('Asegura ventanas, balcones y rejas')).toBeVisible();
  await expect(guide.getByText('Ser mayor de edad')).toBeHidden();
  await beat(page);
  await evid(page, 'HU-14', 'P-HU-14-02-categoria-desplegada');

  // C3: from a pet profile, the adoption-process link opens the guide and "Volver" returns to the pet
  await page.goto('./#/buscar');
  await page.locator('[data-hu="HU-02"] a[href^="#/mascota/"]').first().click();
  await expect(page.locator('[data-hu="HU-03"]')).toBeVisible();
  await beat(page);
  await page.getByRole('link', { name: /Guía de adopción responsable/ }).click();
  await expect(guide).toBeVisible();
  await beat(page);
  await evid(page, 'HU-14', 'P-HU-14-03-guia-desde-mascota');
  await page.getByRole('button', { name: 'Volver' }).click();
  await expect(page.locator('[data-hu="HU-03"]')).toBeVisible();
  await beat(page);

  // C4: the search filters the related articles and hides the rest
  await page.goto('./#/guia');
  const search = page.getByLabel('Buscar en la guía');
  await search.fill('contrato');
  await expect(guide.getByRole('button', { name: /Seguimiento post-adopción/ })).toBeVisible();
  await expect(guide.getByRole('button', { name: /Requisitos para adoptar/ })).toBeHidden();
  await expect(guide.getByRole('button', { name: /Preparar tu hogar/ })).toBeHidden();
  await beat(page);
  await evid(page, 'HU-14', 'P-HU-14-04-buscador-contrato');
  await search.fill('vacunas');
  await expect(guide.getByRole('button', { name: /Vacunas y salud/ })).toBeVisible();
  await expect(guide.getByRole('button', { name: /Marco legal en Perú/ })).toBeHidden();
  await beat(page, 1500);
});
