import { expect, test, type Page } from '@playwright/test';

const EV = '../../Sprint_03/7.Pruebas/evidencias/HU-10';
const shot = (page: Page, name: string) => page.screenshot({ path: `${EV}/${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await expect(page.locator('[data-tour="deck"]')).toBeVisible();
});

async function switchSession(page: Page, userId: string) {
  await page.evaluate((id) => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    raw.state.sessionUserId = id;
    localStorage.setItem('kuyaypet-db', JSON.stringify(raw));
  }, userId);
  await page.goto('./');
  await page.reload();
}

const adoptions = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('kuyaypet-db')!).state.adoptions as { adopterId: string; petId: string; date: string; time: string; status: string }[]);

function futureDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

test('HU-10 c1: el perfil de una mascota disponible ofrece "Coordinar"', async ({ page }) => {
  await page.goto('./#/mascota/p01');
  const btn = page.getByRole('button', { name: 'Coordinar' });
  await expect(btn).toBeVisible();
  await shot(page, 'despues-boton-coordinar');
  await btn.click();
  await expect(page).toHaveURL(/#\/coordinar\/p01/);
  await expect(page.getByRole('heading', { name: 'Coordinar adopción' })).toBeVisible();
});

test('HU-10 c3: la fecha y hora ingresadas son las que se registran', async ({ page }) => {
  await page.goto('./#/coordinar/p01');
  const date = futureDate(45);
  await page.locator('#date').fill(date);
  await page.locator('#time').fill('15:30');
  await shot(page, 'despues-fecha-hora-ingresadas');
  await page.getByRole('button', { name: 'Enviar solicitud' }).click();
  await expect(page.getByText('¡Solicitud enviada!')).toBeVisible();
  const mine = (await adoptions(page)).filter((a) => a.adopterId === 'u-adopter-demo' && a.petId === 'p01');
  expect(mine).toHaveLength(1);
  expect(mine[0].date).toBe(date);
  expect(mine[0].time).toBe('15:30');
});

test('HU-10 c5: el adoptante ve el estado de su solicitud', async ({ page }) => {
  await page.goto('./#/coordinar/p01');
  await page.getByRole('button', { name: 'Enviar solicitud' }).click();
  await expect(page.locator('[data-tour="coordinate-status"]')).toHaveText('Estado: Pendiente');
  await shot(page, 'despues-estado-confirmacion');
  await page.goto('./#/mascota/p01');
  const card = page.locator('[data-hu="HU-10"]').filter({ hasText: 'Tu solicitud de adopción' });
  await expect(card).toBeVisible();
  await expect(card.locator('xpath=..').getByText('Pendiente', { exact: true })).toBeVisible();
  await shot(page, 'despues-estado-perfil');
});

test('HU-10 c6: el adoptante ve si el responsable aceptó o rechazó', async ({ page }) => {
  for (const petId of ['p01', 'p12']) {
    await page.goto(`./#/coordinar/${petId}`);
    await page.reload();
    await page.getByRole('button', { name: 'Enviar solicitud' }).click();
    await expect(page.getByText('¡Solicitud enviada!')).toBeVisible();
  }
  const adopterName = await page.evaluate(() => JSON.parse(localStorage.getItem('kuyaypet-db')!).state.users.find((u: { id: string }) => u.id === 'u-adopter-demo').name as string);

  await switchSession(page, 'u-owner-demo');
  await page.goto('./#/responsable');
  const section = page.locator('[data-tour="owner-requests"]');
  const accepting = section.locator('li').filter({ hasText: `${adopterName} → Porotopo` });
  await accepting.getByRole('button', { name: 'Aceptar' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Aceptar' }).click();
  const rejecting = section.locator('li').filter({ hasText: `${adopterName} → Lucas` });
  await rejecting.getByRole('button', { name: 'Rechazar' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Rechazar' }).click();

  await switchSession(page, 'u-adopter-demo');
  await page.goto('./#/mascota/p01');
  const accepted = page.locator('[data-hu="HU-10"]').filter({ hasText: 'Tu solicitud de adopción' }).locator('xpath=..');
  await expect(accepted.getByText('Aceptada', { exact: true })).toBeVisible();
  await shot(page, 'despues-respuesta-aceptada');

  await page.goto('./#/mascota/p12');
  const rejected = page.locator('[data-hu="HU-10"]').filter({ hasText: 'Tu solicitud de adopción' }).locator('xpath=..');
  await expect(rejected.getByText('Rechazada', { exact: true })).toBeVisible();
  await shot(page, 'despues-respuesta-rechazada');
});
