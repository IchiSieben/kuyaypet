// HU-10 evidence: criteria 1-7 of "Coordinar posible adopción" (Sprint_03), one screenshot per criterion.
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart, readDb, switchSession } from './shared';

function futureDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

test('HU-10 coordinar posible adopción: criterios 1 a 7', async ({ page }) => {
  await freshStart(page);
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await expect(page.locator('[data-tour="deck"]')).toBeVisible();
  await beat(page);

  // c1: the profile of an available pet offers "Coordinar"
  await page.goto('./#/mascota/p01');
  const btn = page.getByRole('button', { name: 'Coordinar' });
  await expect(btn).toBeVisible();
  await beat(page);
  await evid(page, 'HU-10', 'P-HU-10-01-opcion-coordinar');

  // c2: the coordination form allows sending a request
  await btn.click();
  await expect(page).toHaveURL(/#\/coordinar\/p01/);
  await expect(page.getByRole('heading', { name: 'Coordinar adopción' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enviar solicitud' })).toBeEnabled();
  await beat(page);
  await evid(page, 'HU-10', 'P-HU-10-02-formulario-de-solicitud');

  // c3: the proposed date and time are the ones registered
  const date = futureDate(45);
  await page.locator('#date').fill(date);
  await page.locator('#time').fill('15:30');
  await beat(page);
  await evid(page, 'HU-10', 'P-HU-10-03-fecha-y-hora-propuestas');

  // c7: "Enviar solicitud" shows the confirmation message
  await page.getByRole('button', { name: 'Enviar solicitud' }).click();
  await expect(page.getByText('¡Solicitud enviada!')).toBeVisible();
  const mine = (await readDb(page)).adoptions.filter((a: any) => a.adopterId === 'u-adopter-demo' && a.petId === 'p01');
  expect(mine).toHaveLength(1);
  expect(mine[0].date).toBe(date);
  expect(mine[0].time).toBe('15:30');
  await beat(page);
  await evid(page, 'HU-10', 'P-HU-10-07-confirmacion-solicitud-enviada');

  // c5: the adopter sees the current status (confirmation screen and pet profile)
  await expect(page.locator('[data-tour="coordinate-status"]')).toHaveText('Estado: Pendiente');
  await page.goto('./#/mascota/p01');
  const card = page.locator('[data-hu="HU-10"]').filter({ hasText: 'Tu solicitud de adopción' });
  await expect(card.locator('xpath=..').getByText('Pendiente', { exact: true })).toBeVisible();
  await card.scrollIntoViewIfNeeded();
  await beat(page);
  await evid(page, 'HU-10', 'P-HU-10-05-estado-pendiente');

  // a second request (Lucas, p12) to show both an acceptance and a rejection later
  await page.goto('./#/coordinar/p12');
  await page.getByRole('button', { name: 'Enviar solicitud' }).click();
  await expect(page.getByText('¡Solicitud enviada!')).toBeVisible();
  const adopterName = (await readDb(page)).users.find((u: any) => u.id === 'u-adopter-demo').name as string;

  // c4: the owner receives the requests
  await switchSession(page, 'u-owner-demo');
  await page.goto('./#/responsable');
  const section = page.locator('[data-tour="owner-requests"]');
  const accepting = section.locator('li').filter({ hasText: `${adopterName} → Porotopo` });
  const rejecting = section.locator('li').filter({ hasText: `${adopterName} → Lucas` });
  await expect(accepting).toBeVisible();
  await expect(rejecting).toBeVisible();
  await section.scrollIntoViewIfNeeded();
  await beat(page);
  await evid(page, 'HU-10', 'P-HU-10-04-responsable-recibe-solicitud');

  // c6: the owner answers; the adopter sees accepted / rejected
  await accepting.getByRole('button', { name: 'Aceptar' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Aceptar' }).click();
  await rejecting.getByRole('button', { name: 'Rechazar' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Rechazar' }).click();
  await beat(page);
  await switchSession(page, 'u-adopter-demo');
  await page.goto('./#/mascota/p01');
  const accepted = page.locator('[data-hu="HU-10"]').filter({ hasText: 'Tu solicitud de adopción' }).locator('xpath=..');
  await expect(accepted.getByText('Aceptada', { exact: true })).toBeVisible();
  await accepted.scrollIntoViewIfNeeded();
  await beat(page);
  await evid(page, 'HU-10', 'P-HU-10-06a-respuesta-aceptada');
  await page.goto('./#/mascota/p12');
  const rejected = page.locator('[data-hu="HU-10"]').filter({ hasText: 'Tu solicitud de adopción' }).locator('xpath=..');
  await expect(rejected.getByText('Rechazada', { exact: true })).toBeVisible();
  await rejected.scrollIntoViewIfNeeded();
  await beat(page);
  await evid(page, 'HU-10', 'P-HU-10-06b-respuesta-rechazada');
  await beat(page, 1500);
});
