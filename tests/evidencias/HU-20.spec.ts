// HU-20 evidence: criteria 1-7 of "Visualización de compatibilidades" (Sprint_03), one screenshot per criterion.
import { expect, test, type Page } from '@playwright/test';
import { beat, evid, freshStart } from './shared';

/** Mutates the persisted store (state is rehydrated on reload). */
async function editStore(page: Page, fn: string) {
  await page.evaluate((src) => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    new Function('state', src)(raw.state);
    localStorage.setItem('kuyaypet-db', JSON.stringify(raw));
  }, fn);
  await page.reload();
}

test('HU-20 visualización de compatibilidades: criterios 1 a 7', async ({ page }) => {
  const cards = page.locator('[data-hu="HU-20"] section:not([data-hu="HU-07"]) a[href^="#/mascota/"]');
  await freshStart(page);
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await expect(page.locator('[data-tour="deck"]')).toBeVisible();
  await beat(page);

  // c1: "Mis Matches" shows compatible pets
  await page.goto('./#/matches');
  await expect(page.getByRole('heading', { name: /Mis Matches/ })).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(0);
  await expect(cards.first()).toContainText(/\d+%/);
  await beat(page);
  await evid(page, 'HU-20', 'P-HU-20-01-mis-matches-compatibles');

  // c2: sorted from highest to lowest compatibility
  const scores = (await cards.allTextContents()).map((t) => Number(t.match(/(\d+)%/)![1]));
  expect(scores.length).toBeGreaterThan(2);
  expect(scores).toEqual([...scores].sort((a, b) => b - a));
  await evid(page, 'HU-20', 'P-HU-20-02-orden-de-mayor-a-menor');

  // c3: the card shows photo, basic info and compatibility level
  const card = cards.first();
  await expect(card.locator('img').first()).toBeVisible();
  await expect(card.getByRole('heading')).not.toBeEmpty();
  await expect(card).toContainText(/(Perro|Gato) · .+ · (Pequeño|Mediano|Grande)/);
  await expect(card).toContainText(/\d+%/);
  await expect(card).toContainText('Coincide contigo porque');
  await beat(page);
  await evid(page, 'HU-20', 'P-HU-20-03-tarjeta-foto-info-y-compatibilidad');

  // c4: the profile shows the criteria behind the compatibility
  const href = (await card.getAttribute('href'))!;
  const petId = href.split('/').pop()!;
  await card.click();
  await expect(page).toHaveURL(/#\/mascota\//);
  const box = page.locator('h2[data-hu="HU-20"]').locator('xpath=..');
  await expect(box).toContainText('¿Por qué hacemos match?');
  expect(await box.locator('text=/\\d+\\/\\d+/').count()).toBeGreaterThan(2);
  expect(await box.locator('ul li').count()).toBeGreaterThan(0);
  await box.scrollIntoViewIfNeeded();
  await beat(page);
  await evid(page, 'HU-20', 'P-HU-20-04-criterios-de-compatibilidad');

  // c5: a pet that stops being available leaves the matches
  await page.goto('./#/matches');
  await expect(page.locator(`a[href="${href}"]`)).toHaveCount(1);
  await editStore(page, `state.pets.find((p) => p.id === '${petId}').status = 'adoptada';`);
  await page.goto('./#/matches');
  await expect(cards.first()).toBeVisible();
  await expect(page.locator(`[data-hu="HU-20"] a[href="${href}"]`)).toHaveCount(0);
  await beat(page);
  await evid(page, 'HU-20', 'P-HU-20-05-mascota-no-disponible-sale-de-matches');

  // c6: with no compatible pets there is a message and a way to edit the preferences
  await editStore(page, `state.pets.forEach((p) => { p.status = 'adoptada'; });`);
  await page.goto('./#/matches');
  await expect(page.getByText('No encontramos mascotas compatibles')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Editar preferencias' })).toBeVisible();
  await beat(page);
  await evid(page, 'HU-20', 'P-HU-20-06-sin-compatibles-editar-preferencias');
  await page.getByRole('button', { name: 'Editar preferencias' }).click();
  await expect(page).toHaveURL(/#\/onboarding/);
  await beat(page);

  // c7: without completed preferences, the app asks to complete them
  await freshStart(page);
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await expect(page.locator('[data-tour="deck"]')).toBeVisible();
  await editStore(page, `delete state.users.find((u) => u.id === 'u-adopter-demo').profile;`);
  await page.goto('./#/matches');
  await expect(page.getByText('Completa tus preferencias')).toBeVisible();
  await expect(cards).toHaveCount(0);
  await beat(page);
  await evid(page, 'HU-20', 'P-HU-20-07-sin-preferencias-pide-completarlas');
  await page.getByRole('button', { name: 'Completar preferencias' }).click();
  await expect(page).toHaveURL(/#\/onboarding/);
  await beat(page, 1500);
});
