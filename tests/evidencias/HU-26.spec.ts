// HU-26 evidence: the PDF has no HU-26 section; both criteria come from issue #26 (propuesta, pendiente de validar con el equipo).
import { expect, test, type Page } from '@playwright/test';
import { beat, evid, freshStart } from './shared';

test.use({ reducedMotion: 'reduce' });

async function login(page: Page, email: string, home: string) {
  await page.goto('./#/login');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(new RegExp(`#${home}`));
}

async function logout(page: Page) {
  await page.goto('./#/perfil');
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/#\/login/);
}

test('HU-26 gestionar información inapropiada: criterios 1 y 2 del issue', async ({ page }) => {
  await freshStart(page);
  await login(page, 'admin@kuyaypet.pe', '/admin');
  await beat(page);

  // C1: retiring the content stops showing it to users (hide a publication, deactivate an account)
  await page.goto('./#/admin/reportes/rep-001');
  await expect(page.getByRole('button', { name: 'Ocultar publicación' })).toBeVisible();
  await beat(page);
  await page.getByRole('button', { name: 'Ocultar publicación' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Ocultar' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('Publicación ocultada');
  await expect(page.getByText('Resuelto', { exact: true })).toBeVisible();
  await beat(page);
  await evid(page, 'HU-26', 'P-HU-26-01a-publicacion-ocultada');

  await page.goto('./#/admin/reportes/rep-003');
  await page.getByRole('button', { name: /^Desactivar cuenta de / }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Desactivar' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('Cuenta desactivada');
  await expect(page.getByText('Resuelto', { exact: true })).toBeVisible();
  await beat(page);
  await evid(page, 'HU-26', 'P-HU-26-01b-cuenta-desactivada');

  await logout(page);
  await page.getByLabel('Correo electrónico').fill('milagros.flores@kuyaypet.pe');
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('alert')).toContainText('desactivada');
  await beat(page);
  await login(page, 'adoptante@kuyaypet.pe', '/descubrir');
  await page.goto('./#/buscar');
  await expect(page.getByRole('heading', { name: 'Max' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Toby' })).toHaveCount(0);
  await beat(page);
  await evid(page, 'HU-26', 'P-HU-26-01c-publicacion-oculta-en-buscar');

  // C2: a user without the admin role cannot reach the retire actions
  for (const ruta of ['/admin', '/admin/reportes', '/admin/reportes/rep-001']) {
    await page.goto(`./#${ruta}`);
    await expect(page).toHaveURL(/#\/descubrir/);
    await expect(page.locator('[data-hu="HU-26"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Ocultar publicación' })).toHaveCount(0);
    await beat(page);
  }
  await evid(page, 'HU-26', 'P-HU-26-02-adoptante-rechazado');
  await beat(page, 1500);
});
