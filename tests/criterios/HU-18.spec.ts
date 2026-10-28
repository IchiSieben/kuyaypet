import { expect, test, type Page } from '@playwright/test';

const EV = '../../Sprint_03/7.Pruebas/evidencias/HU-18';
const shot = (page: Page, name: string) => page.screenshot({ path: `${EV}/${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await expect(page.locator('[data-tour="deck"]')).toBeVisible();
});

/** Adds likes by the demo adopter on pets that are adopted (p04), withdrawn (p35) or not approved (p39). */
async function seedUnavailableHistory(page: Page) {
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    const at = '2026-09-30T17:00:00.000Z';
    for (const petId of ['p04', 'p35', 'p39']) raw.state.interactions.push({ id: `int-t-${petId}`, adopterId: 'u-adopter-demo', petId, kind: 'like', createdAt: at });
    localStorage.setItem('kuyaypet-db', JSON.stringify(raw));
  });
  await page.reload();
}

const row = (page: Page, name: string) => page.locator('[data-hu="HU-18"] li').filter({ hasText: name });

test('HU-18 c1: el perfil ofrece la opción "Historial de interés"', async ({ page }) => {
  await page.goto('./#/perfil');
  const option = page.getByRole('link', { name: /Historial de interés/ });
  await expect(option).toBeVisible();
  await shot(page, 'despues-perfil-opcion-historial');
  await option.click();
  await expect(page).toHaveURL(/#\/historial/);
  await expect(page.locator('[data-hu="HU-18"]')).toBeVisible();
});

test('HU-18 c2: una mascota que me gustó aparece en el historial', async ({ page }) => {
  await page.goto('./#/mascota/p01');
  await page.getByRole('button', { name: 'Me gusta', exact: true }).click();
  await page.goto('./#/historial');
  await expect(row(page, 'Porotopo')).toBeVisible();
  await shot(page, 'despues-historial-mascota-con-me-gusta');
});

test('HU-18 c3: cada registro muestra foto, nombre, fecha y estado actual', async ({ page }) => {
  await seedUnavailableHistory(page);
  await page.goto('./#/historial');
  const items = page.locator('[data-hu="HU-18"] li');
  await expect(items).toHaveCount(5);
  for (const li of await items.all()) {
    await expect(li.locator('img')).toBeVisible();
    await expect(li).toContainText(/\d{4}/);
  }
  await expect(row(page, 'Otto')).toContainText('Disponible');
  await expect(row(page, 'Capitán')).toContainText('Disponible');
  await expect(row(page, 'Rocky')).toContainText('Adoptada');
  await expect(row(page, 'Tomasa')).toContainText('Retirada');
  await expect(row(page, 'Ceniza')).toContainText('No disponible');
  await shot(page, 'despues-historial-estado-actual');
  await page.goto('./#/coordinar/p13');
  await page.getByRole('button', { name: 'Enviar solicitud' }).click();
  await page.goto('./#/historial');
  await expect(row(page, 'Otto')).toContainText('En proceso');
});

test('HU-18 c4: una mascota disponible abre su perfil completo', async ({ page }) => {
  await page.goto('./#/historial');
  await row(page, 'Otto').click();
  await expect(page).toHaveURL(/#\/mascota\/p13/);
  await expect(page.locator('[data-hu="HU-03"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Otto' }).first()).toBeVisible();
});

test('HU-18 c5: una mascota adoptada se muestra con el estado "Adoptada"', async ({ page }) => {
  await seedUnavailableHistory(page);
  await page.goto('./#/historial');
  await expect(row(page, 'Rocky').getByText('Adoptada', { exact: true })).toBeVisible();
  await shot(page, 'despues-historial-adoptada');
});

test('HU-18 c6: una mascota retirada indica que su perfil ya no está disponible', async ({ page }) => {
  await seedUnavailableHistory(page);
  await page.goto('./#/historial');
  await expect(row(page, 'Tomasa')).toContainText('Este perfil ya no está disponible');
  await expect(row(page, 'Tomasa').getByRole('link')).toHaveCount(0);
  await shot(page, 'despues-historial-retirada');
});

test('HU-18 c7: sin interés previo, el historial vacío muestra un mensaje', async ({ page }) => {
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    raw.state.interactions = raw.state.interactions.filter((i: { adopterId: string }) => i.adopterId !== 'u-adopter-demo');
    localStorage.setItem('kuyaypet-db', JSON.stringify(raw));
  });
  await page.reload();
  await page.goto('./#/historial');
  await expect(page.getByText('Todavía no tienes historial')).toBeVisible();
  await expect(page.locator('[data-hu="HU-18"] li')).toHaveCount(0);
  await shot(page, 'despues-historial-vacio');
});
