// HU-17 evidence: one screenshot per acceptance criterion (c1-c7) of "Guardado de mascotas favoritas".
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart, login, logout } from './shared';

test('HU-17 favoritos: criterios 1 a 7', async ({ page }) => {
  await freshStart(page);
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await page.goto('./#/favoritos');
  const favCards = page.locator('[data-hu="HU-17"] a[href^="#/mascota/"]');
  await expect(favCards.first()).toBeVisible();
  const before = await favCards.count();
  await beat(page);

  // c1: an available pet offers the "add to favorites" option
  await page.goto('./#/buscar');
  const add = page.locator('[data-hu="HU-02"] button[aria-label^="Agregar"]').first();
  await expect(add).toBeVisible();
  await expect(add).toHaveAttribute('aria-pressed', 'false');
  const label = (await add.getAttribute('aria-label')) ?? '';
  const name = label.replace(/^Agregar a /, '').replace(/ a favoritos$/, '');
  await add.scrollIntoViewIfNeeded();
  await beat(page);
  await evid(page, 'HU-17', 'P-HU-17-01-opcion-de-favorito');

  // c2 + c3: tapping the heart saves it and shows a visual confirmation
  await add.click();
  await expect(page.getByText(`${name} está en tus favoritos`)).toBeVisible();
  const remove = page.locator(`button[aria-label="Quitar a ${name} de favoritos"]`).first();
  await expect(remove).toHaveAttribute('aria-pressed', 'true');
  await evid(page, 'HU-17', 'P-HU-17-03-confirmacion-visual');
  await evid(remove, 'HU-17', 'P-HU-17-02-corazon-guardado');
  await beat(page);

  // c4: "Favoritos" lists every saved pet
  await page.goto('./#/favoritos');
  await expect(favCards).toHaveCount(before + 1);
  await expect(page.locator('[data-hu="HU-17"] h3', { hasText: name })).toBeVisible();
  await beat(page);
  await evid(page, 'HU-17', 'P-HU-17-04-lista-de-favoritos');

  // c6: favorites survive logout and a new login
  await logout(page);
  await login(page, 'adoptante@kuyaypet.pe');
  await page.goto('./#/favoritos');
  await expect(favCards).toHaveCount(before + 1);
  await expect(page.locator('[data-hu="HU-17"] h3', { hasText: name })).toBeVisible();
  await beat(page);
  await evid(page, 'HU-17', 'P-HU-17-06-favoritos-tras-relogin');

  // c7: a favorite that is no longer available shows its updated status
  const firstHref = (await favCards.first().getAttribute('href'))!;
  await page.evaluate((id) => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    raw.state.pets = raw.state.pets.map((p: { id: string }) => (p.id === id ? { ...p, status: 'adoptada' } : p));
    localStorage.setItem('kuyaypet-db', JSON.stringify(raw));
  }, firstHref.split('/').pop()!);
  await page.reload();
  await expect(page.locator(`[data-hu="HU-17"] a[href="${firstHref}"]`).getByText('Adoptada 🎉')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-17', 'P-HU-17-07-favorito-adoptada');

  // c5: tapping the heart again removes it from the list
  await page.locator(`[data-hu="HU-17"] button[aria-label="Quitar a ${name} de favoritos"]`).first().click();
  await expect(page.locator('[data-hu="HU-17"] h3', { hasText: name })).toHaveCount(0);
  await beat(page);
  await evid(page, 'HU-17', 'P-HU-17-05-quitar-de-favoritos');
});
