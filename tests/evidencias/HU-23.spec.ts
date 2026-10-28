// HU-23 evidence: criteria 1-6 of the PDF, one screenshot per criterion.
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart } from './shared';

test.use({ reducedMotion: 'reduce' });

test('HU-23 revisar publicaciones de mascotas: criterios 1 a 6', async ({ page }) => {
  await freshStart(page);
  await page.goto('./#/login');
  await page.getByLabel('Correo electrónico').fill('admin@kuyaypet.pe');
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.locator('[data-tour="admin-pending"]')).toBeVisible();
  await beat(page);

  // C1: the publications module lists the registered publications
  await page.goto('./#/admin/publicaciones');
  await expect(page.locator('[data-hu="HU-23"]')).toBeVisible();
  await expect(page.locator('a[href^="#/admin/publicaciones/"]').first()).toBeVisible();
  await beat(page);
  await evid(page, 'HU-23', 'P-HU-23-01-lista-publicaciones');

  // C2: selecting a pet shows its registered information
  await page.locator('a[href^="#/admin/publicaciones/"]').first().click();
  await expect(page.locator('[data-hu="HU-23"]')).toBeVisible();
  await expect(page.locator('[data-hu="HU-23"] h1, [data-hu="HU-23"] h2').first()).toBeVisible();
  const detailUrl = page.url();
  await beat(page);
  await evid(page, 'HU-23', 'P-HU-23-02-detalle-publicacion');

  // C3: species, age, sex, size, district and health are identifiable
  const field = (label: string) => page.locator(`dt:text-is("${label}") + dd`);
  await expect(field('Especie')).toHaveText(/^(Perro|Gato)$/);
  await expect(field('Edad')).toHaveText(/(mes|año)/);
  await expect(field('Sexo')).toHaveText(/^(Macho|Hembra)$/);
  await expect(field('Tamaño')).toHaveText(/^(Pequeño|Mediano|Grande)$/);
  await expect(field('Distrito')).not.toBeEmpty();
  await expect(field('Salud')).not.toBeEmpty();
  await field('Especie').scrollIntoViewIfNeeded();
  await beat(page);
  await evid(page, 'HU-23', 'P-HU-23-03-datos-caracteristicas');

  // C4: the information can be modified
  const about = page.locator('label:has-text("Sobre mí") textarea');
  const breed = page.locator('label:has-text("Raza") input');
  await expect(about).toBeEditable();
  await expect(breed).toBeEditable();
  await about.fill('Descripción persistida por el admin.');
  await breed.fill('Raza Editada');
  await beat(page);
  await evid(page, 'HU-23', 'P-HU-23-04-campos-editables');

  // C5 + C6: "Guardar cambios" persists the data and shows the confirmation message
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('Cambios guardados');
  await beat(page);
  await evid(page, 'HU-23', 'P-HU-23-06-mensaje-confirmacion');
  await page.reload();
  await page.goto(detailUrl);
  await expect(about).toHaveValue('Descripción persistida por el admin.');
  await expect(breed).toHaveValue('Raza Editada');
  await beat(page);
  await evid(page, 'HU-23', 'P-HU-23-05-cambios-persistidos');
  await page.goto('./#/admin/publicaciones');
  await expect(page.getByText(/Raza Editada/).first()).toBeVisible();
  await beat(page, 1500);
});
