import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 920 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });

test('Pantalla dividida: el like de Valeria llega a Rosa y el Match vuelve a Valeria', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./?split=1#/');
  await expect(page.locator('[data-split-stage]')).toBeVisible();
  const adopter = page.frameLocator('[data-split-phone="adopter"]');
  const owner = page.frameLocator('[data-split-phone="owner"]');
  await expect(adopter.getByText('Descubre').first()).toBeVisible({ timeout: 15000 });
  await expect(owner.locator('[data-tour="owner-interests"]')).toBeVisible({ timeout: 15000 });

  // Valeria likes Luna (Rosa's cat) from its profile.
  await page.frame({ url: /as=adopter/ })!.evaluate("location.hash = '#/mascota/p29'");
  await adopter.getByRole('button', { name: /Me gusta/ }).first().click();

  // Rosa sees the interest without reloading, and accepts it.
  const acceptBtn = owner.locator('[data-tour="owner-accept-interest"]').first();
  await expect(acceptBtn).toBeVisible({ timeout: 10000 });
  await page.screenshot({ path: 'docs/screenshots/F-pantalla-dividida.png' });
  await acceptBtn.click();

  // Valeria gets the Match celebration in her own phone.
  await expect(adopter.locator('[data-tour="match-overlay"]')).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: 'docs/screenshots/F-pantalla-dividida-match.png' });
  // Each phone kept its own session.
  await expect(owner.locator('[data-tour="owner-interests"]')).toBeVisible();
});
