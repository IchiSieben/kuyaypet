// HU-03 video: the walk-through of task #32 (p01 all optional fields, p02 story only, p03 none).
// Screenshots for HU-03 already live in Sprint_01/7.Pruebas/evidencias; this spec only records the video.
import { expect, test } from '@playwright/test';
import { beat, freshStart } from './shared';

test('HU-03 perfil de una mascota: p01, p02 y p03', async ({ page }) => {
  await freshStart(page);
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await beat(page);
  for (const id of ['p01', 'p02', 'p03']) {
    await page.goto('./#/buscar');
    const card = page.locator(`[data-hu="HU-02"] a[href="#/mascota/${id}"]`).first();
    await card.scrollIntoViewIfNeeded();
    await beat(page);
    const name = (await card.locator('h3').textContent())!.trim();
    await card.click();
    await expect(page).toHaveURL(new RegExp(`#/mascota/${id}$`));
    const profile = page.locator('[data-hu="HU-03"]');
    await expect(profile.locator('h1')).toHaveText(name);
    await beat(page, 1000);
    await page.mouse.wheel(0, 700);
    await beat(page, 1000);
    await page.mouse.wheel(0, 700);
    await beat(page, 1000);
    await expect(profile).not.toContainText(/undefined|NaN/);
  }
});
