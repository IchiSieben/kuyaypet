import { expect, test, type Page } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const EVID = '../../Sprint_04/7.Pruebas/evidencias/HU-26';
const shot = (page: Page, name: string) => page.screenshot({ path: `${EVID}/${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
});

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

test('HU-26 c1: Ocultar publicación desde un reporte la retira de /buscar', async ({ page }) => {
  await login(page, 'admin@kuyaypet.pe', '/admin');
  await page.goto('./#/admin/reportes/rep-001');
  await expect(page.getByRole('button', { name: 'Ocultar publicación' })).toBeVisible();
  await shot(page, 'despues-c1-acciones-reporte');
  await page.getByRole('button', { name: 'Ocultar publicación' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Ocultar' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('Publicación ocultada');
  await expect(page.getByText('Resuelto', { exact: true })).toBeVisible();

  await logout(page);
  await login(page, 'adoptante@kuyaypet.pe', '/descubrir');
  await page.goto('./#/buscar');
  await expect(page.getByRole('heading', { name: 'Max' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Toby' })).toHaveCount(0);
  await shot(page, 'despues-c1-publicacion-oculta-en-buscar');
});

test('HU-26 c1: Desactivar cuenta desde un reporte impide iniciar sesión', async ({ page }) => {
  await login(page, 'admin@kuyaypet.pe', '/admin');
  await page.goto('./#/admin/reportes/rep-003');
  await page.getByRole('button', { name: /^Desactivar cuenta de / }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Desactivar' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('Cuenta desactivada');
  await expect(page.getByText('Resuelto', { exact: true })).toBeVisible();
  await shot(page, 'despues-c1-cuenta-desactivada');

  await logout(page);
  await page.getByLabel('Correo electrónico').fill('milagros.flores@kuyaypet.pe');
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('alert')).toContainText('desactivada');
});

for (const [rol, email, home] of [
  ['responsable', 'responsable@kuyaypet.pe', '/responsable'],
  ['adoptante', 'adoptante@kuyaypet.pe', '/descubrir'],
] as const) {
  test(`HU-26 c2: un ${rol} (sin rol admin) no puede abrir las rutas de administración`, async ({ page }) => {
    await login(page, email, home);
    for (const ruta of ['/admin', '/admin/reportes', '/admin/reportes/rep-001']) {
      await page.goto(`./#${ruta}`);
      await expect(page).toHaveURL(new RegExp(`#${home}`));
      await expect(page.locator('[data-hu="HU-26"]')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Ocultar publicación' })).toHaveCount(0);
    }
    await shot(page, `despues-c2-${rol}-rechazado`);
  });
}
