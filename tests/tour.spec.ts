import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 920 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });

test('Tour guiado completo en modo presentador', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
  await expect(page.getByLabel('Panel de presentador')).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'docs/screenshots/presentador-escritorio.png' });
  await page.getByLabel('Panel de presentador').getByRole('button', { name: 'Tour guiado' }).click();
  const next = page.locator('[data-tour-next]');
  for (let i = 0; i < 12; i++) {
    await expect(next).toBeEnabled({ timeout: 10000 });
    await page.waitForTimeout(i === 2 || i === 4 || i === 8 ? 1800 : 700);
    if (i === 2 || i === 4 || i === 8) await page.screenshot({ path: `docs/screenshots/tour-paso-${i + 1}.png` });
    await next.click();
  }
  await expect(page.locator('[data-tour-overlay]')).toHaveCount(0);
  // side effects of the tour: request accepted and publication approved
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('kuyaypet-db')!).state);
  expect(state.adoptions.some((a: { adopterId: string; petId: string; status: string }) => a.adopterId === 'u-adopter-demo' && a.petId === 'p29' && a.status === 'aceptada')).toBe(true);
  expect(state.matches.some((m: { petId: string }) => m.petId === 'p29')).toBe(true);
});
