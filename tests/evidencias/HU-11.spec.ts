// HU-11 evidence: one screenshot per acceptance criterion (c1-c6) of "Registrar mascota".
// c6 is recorded as observed: the pet is "En revisión" and hidden from adopters until the admin approves it (ADR-05).
import { expect, test } from '@playwright/test';
import { TINY_PNG, beat, evid, freshStart, logout } from './shared';

test('HU-11 registrar mascota: criterios 1 a 6', async ({ page }) => {
  await freshStart(page);
  await page.getByRole('button', { name: /Responsable/ }).click();
  await expect(page.locator('[data-tour="owner-interests"]')).toBeVisible();
  await beat(page, 1000);

  // c1: "Registrar" shows the registration form
  await page.getByRole('link', { name: 'Registrar' }).click();
  await expect(page.locator('[data-hu="HU-11"]')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-11', 'P-HU-11-01-formulario-de-registro');

  // c5: without the required fields the system says what is missing
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('alert')).not.toBeEmpty();
  await beat(page);
  await evid(page, 'HU-11', 'P-HU-11-05-campos-obligatorios');

  // c2: the data can be entered and the registration completed (3-step wizard)
  await page.locator('#name').fill('Registrada');
  await page.locator('#breed').fill('Mestizo');
  await page.locator('#age').fill('18');
  await page.locator('#district').selectOption('Miraflores');
  await evid(page, 'HU-11', 'P-HU-11-02a-datos-paso-1');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: TINY_PNG });
  await expect(page.locator('img[alt=""]').first()).toBeVisible();
  await beat(page);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.locator('#about').fill('Compañera buscando hogar.');
  await beat(page);
  await evid(page, 'HU-11', 'P-HU-11-02b-datos-paso-3');

  // c3 + c4: publishing registers the pet and shows the confirmation message
  await page.getByRole('button', { name: 'Publicar mascota' }).click();
  await beat(page);
  await page.getByRole('alertdialog').getByRole('button', { name: 'Publicar' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('¡Mascota registrada!');
  await evid(page, 'HU-11', 'P-HU-11-04-mensaje-de-confirmacion');
  await expect(page).toHaveURL(/#\/responsable/);
  await expect(page.getByText('Registrada').first()).toBeVisible();
  await beat(page, 1000);
  await evid(page, 'HU-11', 'P-HU-11-03-mascota-registrada');

  // c6 (as observed): "En revisión", not visible to adopters yet
  await expect(page.getByText('En revisión').first()).toBeVisible();
  await logout(page);
  await page.goto('./');
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await page.goto('./#/buscar');
  await expect(page.getByRole('img', { name: 'Foto de Porotopo' }).first()).toBeVisible();
  await expect(page.getByRole('img', { name: 'Foto de Registrada' })).toHaveCount(0);
  await beat(page);
  await evid(page, 'HU-11', 'P-HU-11-06-en-revision-no-visible');
});
