// HU-21 evidence: one screenshot per acceptance criterion (c1-c7) of "Cierre seguro de sesión".
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart, login, readDb } from './shared';

test('HU-21 cierre de sesión: criterios 1 a 7', async ({ page }) => {
  await page.clock.install();
  await freshStart(page);
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await page.goto('./#/perfil');
  const logoutBtn = page.getByRole('main').getByRole('button', { name: 'Cerrar sesión' });
  const confirm = async () => {
    await logoutBtn.click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Cerrar sesión' }).click();
  };

  // c1: the profile menu offers "Cerrar sesión"
  await expect(logoutBtn).toBeVisible();
  await logoutBtn.scrollIntoViewIfNeeded();
  await beat(page, 1000);
  await evid(page, 'HU-21', 'P-HU-21-01-opcion-cerrar-sesion');

  // c2: selecting it asks for confirmation; confirming ends the session
  await logoutBtn.click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-21', 'P-HU-21-02-confirmacion');
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cerrar sesión' }).click();

  // c3: redirected to the login screen
  await expect(page).toHaveURL(/#\/login/);
  await beat(page, 1000);
  await evid(page, 'HU-21', 'P-HU-21-03-redireccion-al-inicio-de-sesion');

  // c4: a private page now asks for credentials again
  await page.goto('./#/favoritos');
  await expect(page).toHaveURL(/#\/login/);
  await beat(page);
  await evid(page, 'HU-21', 'P-HU-21-04-pagina-privada-pide-credenciales');

  // c5: no session left in storage, not even after reload
  expect((await readDb(page)).sessionUserId).toBeNull();
  await page.reload();
  await page.goto('./#/perfil');
  await expect(page).toHaveURL(/#\/login/);
  await beat(page);
  await evid(page, 'HU-21', 'P-HU-21-05-sin-sesion-residual');

  // c7: a failure while closing the session is reported and can be retried
  await login(page, 'adoptante@kuyaypet.pe');
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
  await confirm();
  await expect(page.getByText('No se pudo cerrar sesión. Intenta de nuevo.')).toBeVisible();
  await expect(page).toHaveURL(/#\/perfil/);
  expect((await readDb(page)).sessionUserId).not.toBeNull();
  await beat(page);
  await evid(page, 'HU-21', 'P-HU-21-07a-error-al-cerrar');
  await confirm();
  await expect(page).toHaveURL(/#\/login/);
  expect((await readDb(page)).sessionUserId).toBeNull();
  await beat(page);
  await evid(page, 'HU-21', 'P-HU-21-07b-reintento-exitoso');

  // c6: automatic close after 15 minutes of inactivity
  await login(page, 'adoptante@kuyaypet.pe');
  await page.goto('./#/buscar');
  await expect(page.locator('[data-hu="HU-02"]')).toBeVisible();
  await page.clock.fastForward('14:00');
  await expect(page).toHaveURL(/#\/buscar/);
  await page.clock.fastForward('02:00');
  await expect(page).toHaveURL(/#\/login/);
  await expect(page.getByText('Sesión cerrada por inactividad')).toBeVisible();
  expect((await readDb(page)).sessionUserId).toBeNull();
  await beat(page, 1000);
  await evid(page, 'HU-21', 'P-HU-21-06-cierre-por-inactividad');
});
