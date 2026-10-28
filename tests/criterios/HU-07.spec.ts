import { expect, test, type Page } from '@playwright/test';

const EV = '../../Sprint_03/7.Pruebas/evidencias/HU-07';
const shot = (page: Page, name: string) => page.screenshot({ path: `${EV}/${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
});

const mutual = (page: Page) => page.locator('[data-tour="mutual-matches"]');

async function dbState(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('kuyaypet-db')!).state);
}

/** Valeria likes the top deck card with a forced owner acceptance; returns the pet name. */
async function getMatch(page: Page): Promise<string> {
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await expect(page.locator('[data-tour="deck"] article').first()).toBeVisible();
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    raw.state.demo.guaranteedMatch = true;
    localStorage.setItem('kuyaypet-db', JSON.stringify(raw));
  });
  await page.reload();
  const label = (await page.locator('[data-tour="top-card"]').getAttribute('aria-label'))!;
  const name = label.split(',')[0];
  await page.getByRole('button', { name: 'Me gusta', exact: true }).click();
  await expect(page.getByText('¡Es un Match!')).toBeVisible({ timeout: 8000 });
  await page.getByRole('button', { name: 'Seguir descubriendo' }).click();
  return name;
}

async function logout(page: Page) {
  await page.goto('./#/perfil');
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/#\/login/);
}

async function login(page: Page, email: string) {
  await page.getByLabel('Correo electrónico').fill(email);
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
}

test('HU-07 c4: desde la sección de coincidencias se ve la mascota con la que hubo Match', async ({ page }) => {
  const name = await getMatch(page);
  await page.goto('./#/matches');
  await expect(page.locator('[data-hu="HU-20"]')).toBeVisible();
  await expect(mutual(page).getByRole('button', { name: new RegExp(name) })).toBeVisible();
  await shot(page, 'despues-match-en-coincidencias');
});

test('HU-07 c5: el Match muestra información básica de la mascota (foto y nombre)', async ({ page }) => {
  const name = await getMatch(page);
  await page.goto('./#/matches');
  const entry = mutual(page).getByRole('button', { name: new RegExp(name) });
  await expect(entry.locator('img')).toBeVisible();
  await expect(entry.locator('img')).toHaveAttribute('src', /.+/);
  await expect(entry.getByText(name, { exact: true })).toBeVisible();
  await shot(page, 'despues-match-info-basica');
});

test('HU-07 c6: al seleccionar el Match se continúa el contacto con el responsable (chat)', async ({ page }) => {
  const name = await getMatch(page);
  await page.goto('./#/matches');
  await mutual(page).getByRole('button', { name: new RegExp(name) }).click();
  await expect(page).toHaveURL(/#\/chats\/t-/);
  await expect(page.locator('[data-hu="HU-08"]')).toBeVisible();
  await expect(page.locator('header').getByText(name, { exact: true })).toBeVisible();
  await expect(page.getByText(/¡Es un Match!/)).toBeVisible();
  await shot(page, 'despues-match-abre-chat');
});

test('HU-07 c7: el Match queda registrado en la cuenta y se consulta después (recarga y nueva sesión)', async ({ page }) => {
  const name = await getMatch(page);
  const state = await dbState(page);
  expect(state.matches.filter((m: { adopterId: string }) => m.adopterId === 'u-adopter-demo').length).toBe(3);

  await page.goto('./#/matches');
  await page.reload();
  await expect(mutual(page).getByRole('button', { name: new RegExp(name) })).toBeVisible();

  await logout(page);
  await login(page, 'adoptante@kuyaypet.pe');
  await page.goto('./#/matches');
  await expect(mutual(page).getByRole('button', { name: new RegExp(name) })).toBeVisible();
  await shot(page, 'despues-match-persiste');
});

test('HU-07 c8: si el responsable rechaza el interés no se genera Match', async ({ page }) => {
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await page.goto('./#/mascota/p29');
  await expect(page.locator('[data-hu="HU-03"]')).toBeVisible();
  await page.getByRole('button', { name: 'Me gusta', exact: true }).click();
  const mine = async () => (await dbState(page)).interests.filter((i: { petId: string; adopterId: string }) => i.petId === 'p29' && i.adopterId === 'u-adopter-demo');
  await expect.poll(async () => (await mine()).length).toBe(1);
  const matchesBefore = (await dbState(page)).matches.length;

  await logout(page);
  await login(page, 'responsable@kuyaypet.pe');
  await expect(page.locator('[data-tour="owner-interests"]')).toBeVisible();
  await page.locator('li').filter({ hasText: 'Valeria Torres' }).filter({ hasText: 'quiere conocer a Luna' }).getByRole('button', { name: 'Rechazar' }).click();
  await expect.poll(async () => (await mine())[0].status).toBe('rechazado');

  await logout(page);
  await login(page, 'adoptante@kuyaypet.pe');
  await page.goto('./#/matches');
  await expect(mutual(page)).toBeVisible();
  await expect(mutual(page).getByRole('button', { name: /Luna/ })).toHaveCount(0);
  const after = await dbState(page);
  expect(after.matches.length).toBe(matchesBefore);
  expect(after.matches.some((m: { petId: string }) => m.petId === 'p29')).toBe(false);
  await shot(page, 'despues-rechazo-sin-match');
});
