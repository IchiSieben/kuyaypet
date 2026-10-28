// HU-13 evidence: criteria 1-5 of "Notificación de interés en mascota" (Sprint_03), one screenshot per criterion.
// In-app notification only (no e-mail channel), as the criterion allows "en la plataforma y/o correo".
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart, readDb, switchSession } from './shared';

test('HU-13 notificación de interés en mascota: criterios 1 a 5', async ({ page }) => {
  const badge = page.locator('[data-tour="bell"] span.bg-coral');
  await freshStart(page);
  await page.getByRole('button', { name: /Responsable/ }).click();
  await expect(page.locator('[data-tour="owner-interests"]')).toBeVisible();
  await expect(badge).toHaveText('2');
  await beat(page);
  const ownerNotifs = async () => (await readDb(page)).notifications.filter((n: any) => n.userId === 'u-owner-demo').length;
  const notifsBefore = await ownerNotifs();

  // the adopter likes Porotopo (owned by the demo owner)
  await switchSession(page, 'u-adopter-demo');
  await page.goto('./#/mascota/p01');
  await page.getByRole('button', { name: 'Me gusta', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Me gusta', exact: true })).toHaveCount(0);
  const adopterName = (await readDb(page)).users.find((u: any) => u.id === 'u-adopter-demo').name as string;
  await beat(page);

  // c1: the owner got the notification immediately
  expect(await ownerNotifs()).toBe(notifsBefore + 1);
  await switchSession(page, 'u-owner-demo');
  await page.goto('./#/notificaciones');
  const items = page.locator('[data-hu="HU-13"] ul li');
  await expect(items.first()).toContainText('Porotopo');
  await expect(items.first()).toContainText(adopterName);
  await beat(page);
  await evid(page, 'HU-13', 'P-HU-13-01-notificacion-al-responsable');

  // c2: the bell in the top bar shows the unread counter
  await page.goto('./#/responsable');
  await expect(badge).toHaveText('3');
  await expect(page.locator('[data-tour="bell"]')).toHaveAttribute('aria-label', 'Notificaciones, 3 sin leer');
  await beat(page);
  await evid(page, 'HU-13', 'P-HU-13-02-campana-con-contador');

  // c4: the list shows adopter, pet, date and time, and tells read from unread
  await page.goto('./#/notificaciones');
  await expect(items.first()).toContainText(/\d{1,2}:\d{2}/);
  await expect(items.first().getByLabel('No leída')).toBeVisible();
  await expect(items).toHaveCount(4);
  await expect(page.getByLabel('No leída')).toHaveCount(3);
  const readOne = items.filter({ hasNot: page.getByLabel('No leída') });
  await expect(readOne).toHaveCount(1);
  await expect(readOne.first()).toContainText(/\d{1,2}:\d{2}/);
  await beat(page);
  await evid(page, 'HU-13', 'P-HU-13-04-lista-leidas-y-no-leidas');

  // c3: selecting the notification goes to the interested adopter's profile
  await items.first().locator('button').first().click();
  await expect(page).toHaveURL(/#\/adoptante\//);
  await expect(page.getByText(adopterName).first()).toBeVisible();
  await beat(page);
  await evid(page, 'HU-13', 'P-HU-13-03-redirige-al-perfil-del-adoptante');

  // c5: marking as read updates the counter in the top bar
  await page.goto('./#/notificaciones');
  await expect(badge).toHaveText('2');
  await expect(page.getByText('2 sin leer')).toBeVisible();
  await page.locator('[data-hu="HU-13"] ul li button', { hasText: 'Nuevo interés' }).first().click();
  await page.goto('./#/notificaciones');
  await expect(badge).toHaveText('1');
  await expect(page.getByText('1 sin leer')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-13', 'P-HU-13-05a-contador-tras-leer-una');
  await page.getByRole('button', { name: 'Marcar todo como leído' }).click();
  await expect(badge).toHaveCount(0);
  await expect(page.getByText('Estás al día')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-13', 'P-HU-13-05b-contador-tras-leer-todo');
  await beat(page, 1500);
});
