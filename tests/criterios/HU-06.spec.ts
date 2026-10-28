import { expect, test, type Page } from '@playwright/test';

const EV = '../../Sprint_03/7.Pruebas/evidencias/HU-06';
const shot = (page: Page, name: string) => page.screenshot({ path: `${EV}/${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await expect(page.locator('[data-tour="deck"] article').first()).toBeVisible();
});

const topCard = (page: Page) => page.locator('[data-tour="top-card"]');

async function dbState(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('kuyaypet-db')!).state);
}

test('HU-06 c1: el adoptante ve las opciones "Me gusta" y "No me gusta" sobre una mascota disponible', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Me gusta', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'No me gusta', exact: true })).toBeVisible();
  await shot(page, 'despues-opciones-deck');

  await page.goto('./#/buscar');
  await page.locator('[data-hu="HU-02"] a[href^="#/mascota/"]').first().click();
  await expect(page.locator('[data-hu="HU-03"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Me gusta', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'No me gusta', exact: true })).toBeVisible();
  await shot(page, 'despues-opciones-perfil');
});

test('HU-06 c3: "No me gusta" registra que no está interesado en esa mascota', async ({ page }) => {
  const label = (await topCard(page).getAttribute('aria-label'))!;
  const name = label.split(',')[0];
  const before = await dbState(page);
  await page.getByRole('button', { name: 'No me gusta', exact: true }).click();
  await expect(page.getByText(`No te mostraremos a ${name} de nuevo.`)).toBeVisible();
  const after = await dbState(page);
  expect(after.interactions.length).toBe(before.interactions.length + 1);
  const last = after.interactions.at(-1);
  expect(last.kind).toBe('dislike');
  expect(after.pets.find((p: { id: string }) => p.id === last.petId).name).toBe(name);
  // dislike is not an interest: the owner is not notified
  expect(after.interests.length).toBe(before.interests.length);
  await shot(page, 'despues-no-me-gusta-registrado');
});

test('HU-06 c4: tras elegir una opción se muestra una confirmación visual', async ({ page }) => {
  const nameOf = async () => ((await topCard(page).getAttribute('aria-label'))!).split(',')[0];

  const n1 = await nameOf();
  await page.getByRole('button', { name: 'No me gusta', exact: true }).click();
  await expect(page.getByText('Siguiente', { exact: true })).toBeVisible();
  await expect(page.getByText(`No te mostraremos a ${n1} de nuevo.`)).toBeVisible();
  await shot(page, 'despues-confirmacion-no-me-gusta');

  await expect(topCard(page)).not.toHaveAttribute('aria-label', new RegExp(`^${n1},`));
  const n2 = await nameOf();
  await page.getByRole('button', { name: 'Me gusta', exact: true }).click();
  await expect(page.getByText(`Te gusta ${n2}`)).toBeVisible();
  await shot(page, 'despues-confirmacion-me-gusta');
});

test('HU-06 c5: tras indicar su preferencia puede seguir viendo otra mascota', async ({ page }) => {
  const first = (await topCard(page).getAttribute('aria-label'))!;
  await page.getByRole('button', { name: 'No me gusta', exact: true }).click();
  await expect(topCard(page)).not.toHaveAttribute('aria-label', first);
  const second = (await topCard(page).getAttribute('aria-label'))!;
  expect(second).not.toBe(first);
  await expect(page.getByRole('button', { name: 'Me gusta', exact: true })).toBeVisible();
  await shot(page, 'despues-siguiente-mascota');
  await page.getByRole('button', { name: 'Me gusta', exact: true }).click();
  await expect(topCard(page)).not.toHaveAttribute('aria-label', second);
});
