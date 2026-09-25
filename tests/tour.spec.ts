import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 920 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });

test('Tour guiado completo 3 veces seguidas, mismo estado final', async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
  await expect(page.getByLabel('Panel de presentador')).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'docs/screenshots/presentador-escritorio.png' });
  const finals: string[] = [];
  for (let run = 0; run < 3; run++) {
    await page.getByLabel('Panel de presentador').getByRole('button', { name: /Tour/ }).click();
    const next = page.locator('[data-tour-next]');
    for (let i = 0; i < 12; i++) {
      await expect(next).toBeEnabled({ timeout: 10000 });
      await page.waitForTimeout(run === 0 ? 1600 : 500);
      if (run === 0) await page.screenshot({ path: `docs/screenshots/tour-paso-${i + 1}.png` });
      await next.click();
    }
    await expect(page.locator('[data-tour-overlay]')).toHaveCount(0);
    const state = await page.evaluate(() => JSON.parse(localStorage.getItem('kuyaypet-db')!).state);
    expect(state.adoptions.some((a: { adopterId: string; petId: string; status: string }) => a.adopterId === 'u-adopter-demo' && a.petId === 'p29' && a.status === 'aceptada')).toBe(true);
    expect(state.matches.some((m: { petId: string }) => m.petId === 'p29')).toBe(true);
    finals.push(
      JSON.stringify({
        matches: state.matches.map((m: { petId: string; adopterId: string }) => m.adopterId + m.petId).sort(),
        adoptions: state.adoptions.map((a: { petId: string; status: string; adopterId: string }) => a.adopterId + a.petId + a.status).sort(),
        pending: state.pets.filter((p: { approval: string }) => p.approval === 'pendiente').length,
      }),
    );
  }
  expect(new Set(finals).size).toBe(1);
});
