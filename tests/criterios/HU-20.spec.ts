import { expect, test, type Page } from '@playwright/test';

const EV = '../../Sprint_03/7.Pruebas/evidencias/HU-20';
const shot = (page: Page, name: string) => page.screenshot({ path: `${EV}/${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await expect(page.locator('[data-tour="deck"]')).toBeVisible();
});

/** Mutates the persisted store (state is rehydrated on reload). */
async function editStore(page: Page, fn: string) {
  await page.evaluate((src) => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    new Function('state', src)(raw.state);
    localStorage.setItem('kuyaypet-db', JSON.stringify(raw));
  }, fn);
  await page.reload();
}

const cards = (page: Page) => page.locator('[data-hu="HU-20"] section:not([data-hu="HU-07"]) a[href^="#/mascota/"]');

test('HU-20 c1: "Mis Matches" muestra las mascotas compatibles', async ({ page }) => {
  await page.goto('./#/matches');
  await expect(page.getByRole('heading', { name: /Mis Matches/ })).toBeVisible();
  expect(await cards(page).count()).toBeGreaterThan(0);
  await expect(cards(page).first()).toContainText(/\d+%/);
  await shot(page, 'despues-matches-compatibles');
});

test('HU-20 c2: las mascotas se ordenan de mayor a menor compatibilidad', async ({ page }) => {
  await page.goto('./#/matches');
  await expect(cards(page).first()).toBeVisible();
  const scores = (await cards(page).allTextContents()).map((t) => Number(t.match(/(\d+)%/)![1]));
  expect(scores.length).toBeGreaterThan(2);
  expect(scores).toEqual([...scores].sort((a, b) => b - a));
  await shot(page, 'despues-matches-orden');
});

test('HU-20 c3: la tarjeta muestra foto, información básica y nivel de compatibilidad', async ({ page }) => {
  await page.goto('./#/matches');
  const card = cards(page).first();
  await expect(card.locator('img').first()).toBeVisible();
  await expect(card.getByRole('heading')).not.toBeEmpty();
  await expect(card).toContainText(/(Perro|Gato) · .+ · (Pequeño|Mediano|Grande)/);
  await expect(card).toContainText(/\d+%/);
  await expect(card).toContainText('Coincide contigo porque');
  await shot(page, 'despues-matches-tarjeta');
});

test('HU-20 c4: el perfil muestra los criterios que originan la compatibilidad', async ({ page }) => {
  await page.goto('./#/matches');
  await cards(page).first().click();
  await expect(page).toHaveURL(/#\/mascota\//);
  const box = page.locator('h2[data-hu="HU-20"]').locator('xpath=..');
  await expect(box).toContainText('¿Por qué hacemos match?');
  expect(await box.locator('text=/\\d+\\/\\d+/').count()).toBeGreaterThan(2);
  expect(await box.locator('ul li').count()).toBeGreaterThan(0);
  await box.scrollIntoViewIfNeeded();
  await shot(page, 'despues-perfil-por-que-match');
});

test('HU-20 c5: una mascota que deja de estar disponible sale de los matches', async ({ page }) => {
  await page.goto('./#/matches');
  const first = cards(page).first();
  const href = (await first.getAttribute('href'))!;
  const petId = href.split('/').pop()!;
  await expect(page.locator(`a[href="${href}"]`)).toHaveCount(1);
  await editStore(page, `state.pets.find((p) => p.id === '${petId}').status = 'adoptada';`);
  await page.goto('./#/matches');
  await expect(cards(page).first()).toBeVisible();
  await expect(page.locator(`[data-hu="HU-20"] a[href="${href}"]`)).toHaveCount(0);
  await shot(page, 'despues-matches-mascota-retirada');
});

test('HU-20 c6: sin mascotas compatibles hay mensaje y se pueden modificar las preferencias', async ({ page }) => {
  await editStore(page, `state.pets.forEach((p) => { p.status = 'adoptada'; });`);
  await page.goto('./#/matches');
  await expect(page.getByText('No encontramos mascotas compatibles')).toBeVisible();
  await shot(page, 'despues-matches-vacio');
  await page.getByRole('button', { name: 'Editar preferencias' }).click();
  await expect(page).toHaveURL(/#\/onboarding/);
});

test('HU-20 c7: sin preferencias completas se pide completarlas', async ({ page }) => {
  await editStore(page, `delete state.users.find((u) => u.id === 'u-adopter-demo').profile;`);
  await page.goto('./#/matches');
  await expect(page.getByText('Completa tus preferencias')).toBeVisible();
  await expect(cards(page)).toHaveCount(0);
  await shot(page, 'despues-matches-sin-preferencias');
  await page.getByRole('button', { name: 'Completar preferencias' }).click();
  await expect(page).toHaveURL(/#\/onboarding/);
});
