// HU-12 evidence: one screenshot per acceptance criterion (c1-c5) of "Editar información textual de una mascota".
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart } from './shared';

test('HU-12 editar información: criterios 1 a 5', async ({ page }) => {
  await freshStart(page);
  await page.getByRole('button', { name: /Responsable/ }).click();
  await expect(page.locator('[data-tour="owner-interests"]')).toBeVisible();
  await beat(page);

  // c1: "Editar información" opens the form prefilled
  await page.getByRole('link', { name: 'Editar información' }).first().click();
  await expect(page.locator('[data-hu="HU-12"]')).toBeVisible();
  await expect(page).toHaveURL(/#\/responsable\/editar\/p01/);
  await expect(page.locator('#name')).toHaveValue('Porotopo');
  await expect(page.locator('#breed')).not.toHaveValue('');
  await expect(page.locator('#about')).not.toHaveValue('');
  await expect(page.locator('#story')).not.toHaveValue('');
  await beat(page);
  await evid(page, 'HU-12', 'P-HU-12-01-formulario-prellenado');

  // c3: Cancelar discards the changes and goes back
  await page.locator('#name').fill('No Debe Guardarse');
  await beat(page);
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page).toHaveURL(/#\/responsable$/);
  await expect(page.getByText('No Debe Guardarse')).toHaveCount(0);
  await expect(page.getByText('Porotopo').first()).toBeVisible();
  await beat(page);
  await evid(page, 'HU-12', 'P-HU-12-03-cancelar-descarta-cambios');

  // c4: empty required field -> highlighted, error message, nothing saved
  await page.goto('./#/responsable/editar/p01');
  await page.locator('#name').fill('');
  await expect(page.locator('#name')).toHaveClass(/ring-coral/);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByRole('alert')).toContainText('El nombre no puede estar vacío');
  await expect(page).toHaveURL(/#\/responsable\/editar\/p01/);
  await beat(page);
  await evid(page, 'HU-12', 'P-HU-12-04-campo-obligatorio-vacio');

  // c2: saving updates the data and shows "Cambios guardados con éxito"
  await page.locator('#name').fill('Porotopo Editado');
  await page.locator('#about').fill('Descripción nueva para el criterio cinco.');
  await beat(page);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('Cambios guardados con éxito');
  await evid(page, 'HU-12', 'P-HU-12-02-cambios-guardados');

  // c5: redirected to the public profile with the new data
  await expect(page).toHaveURL(/#\/mascota\/p01/);
  await expect(page.getByRole('heading', { name: 'Porotopo Editado', exact: true })).toBeVisible();
  await expect(page.getByText('Descripción nueva para el criterio cinco.')).toBeVisible();
  await beat(page, 1000);
  await evid(page, 'HU-12', 'P-HU-12-05-perfil-publico-actualizado');
});
