// HU-07 evidence: criteria 1-8 of "Recibir un Match por compatibilidad" (Sprint_03), one screenshot per criterion.
// Owner answers through the real owner UI (Luna accepted, Lucas rejected), not through the simulated auto-answer.
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart, login, logout, readDb } from './shared';

test('HU-07 recibir un Match por compatibilidad: criterios 1 a 8', async ({ page }) => {
  const mutual = page.locator('[data-tour="mutual-matches"]');
  await freshStart(page);
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await expect(page.locator('[data-tour="deck"] article').first()).toBeVisible();
  await beat(page);

  // adopter shows interest in Luna (p29) and Lucas (p12), both owned by the demo owner
  for (const id of ['p29', 'p12']) {
    await page.goto(`./#/mascota/${id}`);
    await expect(page.locator('[data-hu="HU-03"]')).toBeVisible();
    await page.getByRole('button', { name: 'Me gusta', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Me gusta', exact: true })).toHaveCount(0);
    await beat(page);
  }
  const pending = (await readDb(page)).interests.filter((i: any) => i.adopterId === 'u-adopter-demo' && ['p29', 'p12'].includes(i.petId));
  expect(pending).toHaveLength(2);
  const matchesBefore = (await readDb(page)).matches.length;

  // c1: the system identifies the compatible interest and shows it to the owner with its compatibility score
  await logout(page);
  await login(page, 'responsable@kuyaypet.pe');
  await expect(page.locator('[data-tour="owner-interests"]')).toBeVisible();
  const luna = page.locator('li').filter({ hasText: 'Valeria Torres' }).filter({ hasText: 'quiere conocer a Luna' });
  const lucas = page.locator('li').filter({ hasText: 'Valeria Torres' }).filter({ hasText: 'quiere conocer a Lucas' });
  await expect(luna.getByText(/\d+%/)).toBeVisible();
  await luna.scrollIntoViewIfNeeded();
  await beat(page);
  await evid(page, 'HU-07', 'P-HU-07-01-interes-compatible-identificado');

  // c8 (first half): the owner rejects Lucas
  await lucas.getByRole('button', { name: 'Rechazar' }).click();
  await expect.poll(async () => (await readDb(page)).interests.find((i: any) => i.petId === 'p12' && i.adopterId === 'u-adopter-demo').status).toBe('rechazado');
  await beat(page);

  // c2: the owner accepts Luna and the system generates the Match
  await luna.getByRole('button', { name: 'Aceptar y hacer Match' }).click();
  await expect.poll(async () => (await readDb(page)).matches.some((m: any) => m.petId === 'p29' && m.adopterId === 'u-adopter-demo')).toBe(true);
  expect((await readDb(page)).matches.length).toBe(matchesBefore + 1);
  await beat(page, 1000);
  await evid(page, 'HU-07', 'P-HU-07-02-responsable-acepta-genera-match');

  // c3: the adopter is notified of the Match
  await logout(page);
  await login(page, 'adoptante@kuyaypet.pe');
  await page.goto('./#/notificaciones');
  await expect(page.locator('[data-hu="HU-13"]')).toBeVisible();
  await expect(page.getByText('¡Es un Match con Luna!')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-07', 'P-HU-07-03-notificacion-de-match');

  // c4: in the coincidences section the Match pet is visible
  await page.goto('./#/matches');
  await expect(page.locator('[data-hu="HU-20"]')).toBeVisible();
  const entry = mutual.getByRole('button', { name: /Luna/ });
  await expect(entry).toBeVisible();
  await beat(page);
  await evid(page, 'HU-07', 'P-HU-07-04-match-en-coincidencias');

  // c5: basic information of the pet (photo and name)
  await expect(entry.locator('img')).toHaveAttribute('src', /.+/);
  await expect(entry.getByText('Luna', { exact: true })).toBeVisible();
  await evid(page, 'HU-07', 'P-HU-07-05-info-basica');

  // c7: the Match is stored in the account and survives a reload and a new session
  await page.reload();
  await expect(mutual.getByRole('button', { name: /Luna/ })).toBeVisible();
  await logout(page);
  await login(page, 'adoptante@kuyaypet.pe');
  await page.goto('./#/matches');
  await expect(mutual.getByRole('button', { name: /Luna/ })).toBeVisible();
  await beat(page);
  await evid(page, 'HU-07', 'P-HU-07-07-match-registrado-en-la-cuenta');

  // c8: the rejected interest produced no Match
  await expect(mutual.getByRole('button', { name: /Lucas/ })).toHaveCount(0);
  const db = await readDb(page);
  expect(db.matches.some((m: any) => m.petId === 'p12' && m.adopterId === 'u-adopter-demo')).toBe(false);
  expect(db.matches.length).toBe(matchesBefore + 1);
  await evid(page, 'HU-07', 'P-HU-07-08-rechazo-sin-match');

  // c6: selecting the Match continues to the chat with the owner
  await mutual.getByRole('button', { name: /Luna/ }).click();
  await expect(page).toHaveURL(/#\/chats\/t-/);
  await expect(page.locator('[data-hu="HU-08"]')).toBeVisible();
  await expect(page.locator('header').getByText('Luna', { exact: true })).toBeVisible();
  await expect(page.getByText(/¡Es un Match!/)).toBeVisible();
  await beat(page, 1200);
  await evid(page, 'HU-07', 'P-HU-07-06-match-abre-chat');
});
