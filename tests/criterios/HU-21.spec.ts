import { expect, test, type Page } from '@playwright/test';

const EVID = '../../Sprint_02/7.Pruebas/evidencias/HU-21';
const shot = (page: Page, name: string) => page.screenshot({ path: `${EVID}/${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
});

async function loginAsAdopter(page: Page) {
  await page.getByRole('button', { name: /Adoptante/ }).click();
}

async function confirmLogout(page: Page) {
  await page.getByRole('main').getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cerrar sesión' }).click();
}

const readDb = (page: Page) =>
  page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    return { sessionUserId: raw.state.sessionUserId as string | null, users: raw.state.users.length as number };
  });

test('HU-21 c5: tras cerrar sesión no queda sesión ni usuario activo en el almacenamiento', async ({ page }) => {
  await loginAsAdopter(page);
  await page.goto('./#/perfil');
  expect((await readDb(page)).sessionUserId).not.toBeNull();
  await confirmLogout(page);
  await expect(page).toHaveURL(/#\/login/);
  const db = await readDb(page);
  expect(db.sessionUserId).toBeNull();
  await page.reload();
  await expect(page).toHaveURL(/#\/login/);
  await page.goto('./#/perfil');
  await expect(page).toHaveURL(/#\/login/);
  await shot(page, 'despues-sin-sesion-residual');
});

test('HU-21 c6: la sesión se cierra automáticamente tras 15 minutos de inactividad', async ({ page }) => {
  await page.clock.install();
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
  await loginAsAdopter(page);
  await page.goto('./#/buscar');
  await expect(page.locator('[data-hu="HU-02"]')).toBeVisible();
  await page.clock.fastForward('14:00');
  await expect(page).toHaveURL(/#\/buscar/);
  await page.clock.fastForward('02:00');
  await expect(page).toHaveURL(/#\/login/);
  await expect(page.getByText('Sesión cerrada por inactividad')).toBeVisible();
  expect((await readDb(page)).sessionUserId).toBeNull();
  await shot(page, 'despues-cierre-por-inactividad');
});

test('HU-21 c7: si falla el cierre de sesión se informa y se puede reintentar', async ({ page }) => {
  await loginAsAdopter(page);
  await page.goto('./#/perfil');
  await page.evaluate(() => {
    const orig = Storage.prototype.setItem;
    let fail = true;
    Storage.prototype.setItem = function (k: string, v: string) {
      if (fail && k === 'kuyaypet-db' && JSON.parse(v).state.sessionUserId === null) {
        fail = false;
        throw new Error('storage failure');
      }
      return orig.call(this, k, v);
    };
  });
  await confirmLogout(page);
  await expect(page.getByText('No se pudo cerrar sesión. Intenta de nuevo.')).toBeVisible();
  await expect(page).toHaveURL(/#\/perfil/);
  expect((await readDb(page)).sessionUserId).not.toBeNull();
  await shot(page, 'despues-error-al-cerrar-sesion');

  await confirmLogout(page);
  await expect(page).toHaveURL(/#\/login/);
  expect((await readDb(page)).sessionUserId).toBeNull();
});
