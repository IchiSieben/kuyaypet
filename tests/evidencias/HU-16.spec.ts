// HU-16 evidence: one screenshot per acceptance criterion (c1-c7) of "Registro visual y etiquetado de mascotas".
import { expect, test } from '@playwright/test';
import { TINY_PNG, beat, evid, freshStart, login, logout } from './shared';

test('HU-16 registro visual y etiquetado: criterios 1 a 7', async ({ page }) => {
  await freshStart(page);
  await page.getByRole('button', { name: /Responsable/ }).click();
  await expect(page.locator('[data-tour="owner-interests"]')).toBeVisible();
  await beat(page);
  await page.getByRole('link', { name: 'Registrar' }).click();

  // c2: required fields missing -> the system says which
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-16', 'P-HU-16-02-campos-faltantes');

  await page.locator('#name').fill('Visible');
  await page.locator('#breed').fill('Mestizo');
  await page.locator('#age').fill('18');
  await page.locator('#district').selectOption('Miraflores');
  await page.getByRole('button', { name: 'Continuar' }).click();

  // c1: the form takes data and photos
  await expect(page.getByText('Fotos (máximo 4)')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-16', 'P-HU-16-01-formulario-con-fotos');

  // c4: invalid file format -> error
  await page.locator('input[type="file"]').setInputFiles({ name: 'documento.txt', mimeType: 'text/plain', buffer: Buffer.from('no es una imagen') });
  await expect(page.getByRole('alert')).toContainText('Formato no permitido');
  await beat(page);
  await evid(page, 'HU-16', 'P-HU-16-04-formato-no-permitido');

  // c3: valid file -> preview
  await page.locator('input[type="file"]').setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: TINY_PNG });
  await expect(page.locator('img[alt=""]').first()).toBeVisible();
  await beat(page);
  await evid(page, 'HU-16', 'P-HU-16-03-vista-previa');

  // c5: personality tag selectable
  const tag = page.getByRole('button', { name: 'Cariñoso/a' });
  await tag.click();
  await expect(tag).toHaveAttribute('aria-pressed', 'true');
  await beat(page);
  await evid(page, 'HU-16', 'P-HU-16-05-etiqueta-elegida');

  // c6: publishing saves and confirms
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.locator('#about').fill('Compañero buscando hogar.');
  await page.getByRole('button', { name: 'Publicar mascota' }).click();
  await beat(page);
  await page.getByRole('alertdialog').getByRole('button', { name: 'Publicar' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('¡Mascota registrada!');
  await expect(page.getByText('Visible').first()).toBeVisible();
  await evid(page, 'HU-16', 'P-HU-16-06-mensaje-de-confirmacion');

  // c7: after the admin approves it, an adopter sees photo, data and tags
  await logout(page);
  await login(page, 'admin@kuyaypet.pe');
  await expect(page.locator('[data-tour="admin-pending"]')).toBeVisible();
  await page.locator('li', { hasText: 'Visible' }).getByRole('button', { name: 'Aprobar' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Aprobar' }).click();
  await beat(page);
  await logout(page);
  await page.goto('./');
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await page.goto('./#/buscar');
  const img = page.getByRole('img', { name: 'Foto de Visible' });
  await expect(img).toBeVisible();
  await expect(img).toHaveAttribute('src', /^data:image\//);
  await beat(page);
  await evid(page, 'HU-16', 'P-HU-16-07a-en-catalogo');
  await img.click();
  await expect(page.getByRole('heading', { name: 'Visible', exact: true })).toBeVisible();
  await expect(page.getByText('Cariñoso/a', { exact: true })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Foto 1 de Visible' })).toBeVisible();
  await beat(page, 1000);
  await evid(page, 'HU-16', 'P-HU-16-07b-perfil-con-foto-y-etiqueta');
});
