import { expect, test, type Page } from '@playwright/test';

const shot = (page: Page, name: string) => page.screenshot({ path: `docs/screenshots/${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
  await page.getByRole('button', { name: /Responsable/ }).click();
  await expect(page.locator('[data-tour="owner-interests"]')).toBeVisible();
  await page.goto('./#/responsable/editar/p01');
  await expect(page.locator('[data-hu="HU-12"]')).toBeVisible();
});

test('HU-12 c1: el formulario de edición viene prellenado con los datos actuales', async ({ page }) => {
  await expect(page.locator('#name')).toHaveValue('Porotopo');
  await expect(page.locator('#breed')).not.toHaveValue('');
  await expect(page.locator('#about')).not.toHaveValue('');
  await expect(page.locator('#story')).not.toHaveValue('');
  await shot(page, 'HU-12-prellenado');
});

test('HU-12 c2: al guardar se muestra "Cambios guardados con éxito"', async ({ page }) => {
  await page.locator('#name').fill('Porotopo Nuevo');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('Cambios guardados con éxito');
  await shot(page, 'HU-12-guardado');
});

test('HU-12 c3: Cancelar descarta los cambios y vuelve a la pantalla anterior', async ({ page }) => {
  await page.locator('#name').fill('No Debe Guardarse');
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page).toHaveURL(/#\/responsable$/);
  await expect(page.getByText('No Debe Guardarse')).toHaveCount(0);
  await expect(page.getByText('Porotopo').first()).toBeVisible();
  await page.goto('./#/mascota/p01');
  await expect(page.getByRole('heading', { name: 'Porotopo', exact: true })).toBeVisible();
});

test('HU-12 c4: con el nombre vacío se muestra error y no se guarda', async ({ page }) => {
  await page.locator('#name').fill('');
  await expect(page.locator('#name')).toHaveClass(/ring-coral/);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByRole('alert')).toContainText('El nombre no puede estar vacío');
  await expect(page).toHaveURL(/#\/responsable\/editar\/p01/);
  await shot(page, 'HU-12-error-nombre');
  await page.goto('./#/mascota/p01');
  await expect(page.getByRole('heading', { name: 'Porotopo', exact: true })).toBeVisible();
});

test('HU-12 c5: tras guardar se muestra el perfil público con los datos nuevos', async ({ page }) => {
  await page.locator('#name').fill('Porotopo Editado');
  await page.locator('#about').fill('Descripción nueva para el criterio cinco.');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await shot(page, 'HU-12-tras-guardar');
  await expect(page).toHaveURL(/#\/mascota\/p01/);
  await expect(page.getByRole('heading', { name: 'Porotopo Editado', exact: true })).toBeVisible();
  await expect(page.getByText('Descripción nueva para el criterio cinco.')).toBeVisible();
});
