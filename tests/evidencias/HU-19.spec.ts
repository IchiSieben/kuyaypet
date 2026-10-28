// HU-19 evidence: one screenshot per acceptance criterion (c1-c7) of "Actualización de mascota como adoptada".
// c6 and c7 use a prepared scenario: a favorite of the adopter is marked as adopted directly in the local store.
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart, login, logout } from './shared';

test('HU-19 marcar como adoptada: criterios 1 a 7', async ({ page }) => {
  await freshStart(page);
  await page.getByRole('button', { name: /Responsable/ }).click();
  await expect(page.locator('[data-tour="owner-interests"]')).toBeVisible();
  await beat(page);

  // c1: "Mis publicaciones" lists the owner's pets
  await expect(page.getByText('Mis publicaciones')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Editar información' }).first()).toBeVisible();
  await page.getByText('Mis publicaciones').scrollIntoViewIfNeeded();
  await beat(page);
  await evid(page, 'HU-19', 'P-HU-19-01-mis-publicaciones');

  // c2: an available pet offers "Marcar como adoptada"
  const mark = page.getByRole('button', { name: 'Marcar como adoptada' }).first();
  await expect(mark).toBeVisible();
  const card = page.locator('div.overflow-hidden.rounded-3xl', { has: mark }).first();
  const name = (await card.locator('span.font-bold').first().textContent())!.trim();
  await mark.scrollIntoViewIfNeeded();
  await beat(page);
  await evid(page, 'HU-19', 'P-HU-19-02-opcion-marcar-adoptada');

  // c3: the system asks for confirmation
  await mark.click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await beat(page);
  await evid(page, 'HU-19', 'P-HU-19-03-confirmacion');

  // c4: confirming updates the status to "Adoptada"
  await dialog.getByRole('button', { name: /Marcar|Confirmar|Sí|Adoptada/ }).last().click();
  await expect(page.locator('div.overflow-hidden.rounded-3xl', { hasText: name }).first().getByText('Adoptada 🎉')).toBeVisible();
  await beat(page, 1000);
  await evid(page, 'HU-19', 'P-HU-19-04-estado-adoptada');

  // c5: adopters no longer see it among the available pets
  await logout(page);
  await page.goto('./');
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await page.goto('./#/buscar');
  await expect(page.locator('[data-hu="HU-02"] a[href^="#/mascota/"]').first()).toBeVisible();
  await expect(page.locator('[data-hu="HU-02"]').getByRole('img', { name: `Foto de ${name}` })).toHaveCount(0);
  await beat(page);
  await evid(page, 'HU-19', 'P-HU-19-05-no-aparece-como-disponible');

  // c6: a saved pet that was adopted shows "Adoptada" in favorites and history
  await page.goto('./#/favoritos');
  const first = page.locator('[data-hu="HU-17"] a[href^="#/mascota/"]').first();
  await expect(first).toBeVisible();
  const href = (await first.getAttribute('href'))!;
  const id = href.split('/').pop()!;
  await page.evaluate((pid) => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    raw.state.pets = raw.state.pets.map((p: { id: string }) => (p.id === pid ? { ...p, status: 'adoptada' } : p));
    localStorage.setItem('kuyaypet-db', JSON.stringify(raw));
  }, id);
  await page.reload();
  await expect(page.locator(`[data-hu="HU-17"] a[href="${href}"]`).getByText('Adoptada 🎉')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-19', 'P-HU-19-06a-favoritos-adoptada');
  await page.goto('./#/historial');
  const row = page.locator('[data-hu="HU-18"] li', { has: page.locator(`a[href="${href}"]`) });
  if (await row.count()) {
    await expect(row.first().getByText('Adoptada', { exact: true })).toBeVisible();
    await beat(page);
    await evid(page, 'HU-19', 'P-HU-19-06b-historial-adoptada');
  }

  // c7: an adopted pet blocks new requests and says so
  await page.goto(`./${href}`);
  await expect(page.getByText(/ya encontró un hogar\. No se aceptan nuevas solicitudes\./)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Me gusta', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Coordinar' })).toHaveCount(0);
  await beat(page, 1000);
  await evid(page, 'HU-19', 'P-HU-19-07-solicitud-bloqueada');
});
