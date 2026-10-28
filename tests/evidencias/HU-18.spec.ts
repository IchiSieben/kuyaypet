// HU-18 evidence: criteria 1-7 of "Historial de mascotas de interés" (Sprint_03), one screenshot per criterion.
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart } from './shared';

test('HU-18 historial de mascotas de interés: criterios 1 a 7', async ({ page }) => {
  const row = (name: string) => page.locator('[data-hu="HU-18"] li').filter({ hasText: name });
  await freshStart(page);
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await expect(page.locator('[data-tour="deck"]')).toBeVisible();
  await beat(page);

  // c1: the profile offers "Historial de interés"
  await page.goto('./#/perfil');
  const option = page.getByRole('link', { name: /Historial de interés/ });
  await expect(option).toBeVisible();
  await beat(page);
  await evid(page, 'HU-18', 'P-HU-18-01-opcion-historial-de-interes');
  await option.click();
  await expect(page).toHaveURL(/#\/historial/);
  await expect(page.locator('[data-hu="HU-18"]')).toBeVisible();
  await beat(page);

  // c2: a pet the adopter liked appears in the history
  await page.goto('./#/mascota/p01');
  await page.getByRole('button', { name: 'Me gusta', exact: true }).click();
  await page.goto('./#/historial');
  await expect(row('Porotopo')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-18', 'P-HU-18-02-mascota-con-me-gusta-en-historial');

  // likes on pets that are adopted (p04), withdrawn (p35) or not approved (p39)
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    const at = '2026-09-30T17:00:00.000Z';
    for (const petId of ['p04', 'p35', 'p39']) raw.state.interactions.push({ id: `int-t-${petId}`, adopterId: 'u-adopter-demo', petId, kind: 'like', createdAt: at });
    localStorage.setItem('kuyaypet-db', JSON.stringify(raw));
  });
  await page.reload();
  await page.goto('./#/historial');

  // c3: every record shows photo, name, date and current status
  const items = page.locator('[data-hu="HU-18"] li');
  await expect(items).toHaveCount(6);
  for (const li of await items.all()) {
    await expect(li.locator('img')).toBeVisible();
    await expect(li).toContainText(/\d{4}/);
  }
  await expect(row('Otto')).toContainText('Disponible');
  await expect(row('Porotopo')).toContainText('Disponible');
  await expect(row('Rocky')).toContainText('Adoptada');
  await expect(row('Tomasa')).toContainText('Retirada');
  await expect(row('Ceniza')).toContainText('No disponible');
  await beat(page);
  await evid(page, 'HU-18', 'P-HU-18-03-foto-nombre-fecha-y-estado');

  // c5: adopted pet shows "Adoptada"
  await expect(row('Rocky').getByText('Adoptada', { exact: true })).toBeVisible();
  await evid(page, 'HU-18', 'P-HU-18-05-estado-adoptada');

  // c6: withdrawn pet says its profile is no longer available and is not a link
  await expect(row('Tomasa')).toContainText('Este perfil ya no está disponible');
  await expect(row('Tomasa').getByRole('link')).toHaveCount(0);
  await evid(page, 'HU-18', 'P-HU-18-06-perfil-retirado-no-disponible');

  // c4: an available pet opens its full profile
  await row('Otto').click();
  await expect(page).toHaveURL(/#\/mascota\/p13/);
  await expect(page.locator('[data-hu="HU-03"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Otto' }).first()).toBeVisible();
  await beat(page);
  await evid(page, 'HU-18', 'P-HU-18-04-perfil-completo-de-mascota-disponible');

  // c7: with no previous interest the history is empty and says so
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    raw.state.interactions = raw.state.interactions.filter((i: { adopterId: string }) => i.adopterId !== 'u-adopter-demo');
    localStorage.setItem('kuyaypet-db', JSON.stringify(raw));
  });
  await page.reload();
  await page.goto('./#/historial');
  await expect(page.getByText('Todavía no tienes historial')).toBeVisible();
  await expect(items).toHaveCount(0);
  await beat(page);
  await evid(page, 'HU-18', 'P-HU-18-07-historial-vacio');
  await beat(page, 1500);
});
