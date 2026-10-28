// HU-05 evidence: one screenshot per acceptance criterion (c1-c5) of "Búsqueda de mascotas cercanas".
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart } from './shared';

const cards = '[data-hu="HU-02"] a[href^="#/mascota/"]';

test('HU-05 búsqueda de cercanas: criterios 1 a 5', async ({ page }) => {
  await freshStart(page);
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await page.goto('./#/buscar');
  await expect(page.locator(cards).first()).toBeVisible();
  await beat(page);
  const search = page.locator('[data-hu="HU-05"]');

  // c1: a location can be chosen
  await page.locator('#browse-district').selectOption('Miraflores');
  await expect(page.locator('#browse-district')).toHaveValue('Miraflores');
  await beat(page);
  await evid(search, 'HU-05', 'P-HU-05-01-ubicacion-elegida');

  // c2: a radius in km can be set
  await page.locator('#browse-radius').fill('5');
  await expect(search).toContainText('5 km');
  await beat(page);
  await evid(search, 'HU-05', 'P-HU-05-02-radio-en-km');

  // c3: "Buscar" shows the pets inside the area
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByText('Mostrando mascotas cerca de Miraflores')).toBeVisible();
  const n = await page.locator(cards).count();
  expect(n).toBeGreaterThan(0);
  await beat(page);
  await evid(page, 'HU-05', 'P-HU-05-03-resultados-en-el-area');

  // c4: basic info and approximate distance on every result
  for (let i = 0; i < n; i++) {
    const card = page.locator(cards).nth(i);
    await expect(card.locator('h3')).not.toBeEmpty();
    await expect(card.locator('img')).toBeVisible();
    const dist = (await card.locator('b').textContent())!.trim();
    expect(dist).toMatch(/^a (\d+ m|\d+\.\d km)$/);
    const km = dist.endsWith(' km') ? parseFloat(dist.slice(2)) : parseInt(dist.slice(2)) / 1000;
    expect(km).toBeLessThanOrEqual(5.05);
  }
  await page.mouse.wheel(0, 650);
  await beat(page);
  await evid(page, 'HU-05', 'P-HU-05-04-informacion-y-distancia');
  await page.mouse.wheel(0, -650);

  // c5: radius 1 km from a district with no pets nearby -> message
  await page.locator('#browse-radius').fill('1');
  const options = await page.locator('#browse-district option').evaluateAll((os) => os.map((o) => (o as unknown as { value: string }).value).filter(Boolean));
  let found = '';
  for (const d of options) {
    await page.locator('#browse-district').selectOption(d);
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    if ((await page.locator(cards).count()) === 0) {
      found = d;
      break;
    }
  }
  expect(found).not.toBe('');
  await expect(page.getByText('No se encontraron mascotas cercanas')).toBeVisible();
  console.log(`P-HU-05-05: sin cercanas en ${found} a 1 km`);
  await beat(page);
  await evid(page, 'HU-05', 'P-HU-05-05-sin-mascotas-cercanas');
});
