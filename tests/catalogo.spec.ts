import { expect, test, type Page } from '@playwright/test';

const shot = (page: Page, name: string) => page.screenshot({ path: `docs/screenshots/${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
});

async function loginAsAdopter(page: Page) {
  await page.getByRole('button', { name: /Adoptante/ }).click();
}

test('HU-02: mensaje cuando no hay mascotas disponibles', async ({ page }) => {
  await loginAsAdopter(page);
  await page.goto('./#/buscar');
  await expect(page.locator('[data-hu="HU-02"]')).toBeVisible();
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    raw.state.pets = raw.state.pets.map((p: { status: string }) => ({ ...p, status: 'adoptada' }));
    localStorage.setItem('kuyaypet-db', JSON.stringify(raw));
  });
  await page.reload();
  await expect(page.locator('[data-hu="HU-02"] a[href^="#/mascota/"]')).toHaveCount(0);
  await expect(page.getByText('No hay mascotas disponibles por ahora')).toBeVisible();
  await expect(page.getByText(/Vuelve pronto/)).toBeVisible();
  await shot(page, 'HU-02-sin-disponibles');
});
