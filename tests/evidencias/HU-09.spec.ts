// HU-09 evidence: criteria 1-7 of "Chat entre usuarios interesados en la misma mascota" (Sprint_03), one screenshot per criterion.
// The whole run is desktop-sized because c2 (delivery to the other users) can only be shown in the split stage (two phones).
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart, login } from './shared';

const GROUP = 't-003'; // seed: group chat about p01 (Porotopo), 5 messages from Sebastián Rojas, Valeria Torres, Gabriela Ríos
const TIME = /\d{1,2}:\d{2}/;

test.use({
  viewport: { width: 1440, height: 920 },
  isMobile: false,
  hasTouch: false,
  deviceScaleFactor: 1,
  video: { mode: 'on', size: { width: 1440, height: 920 } },
});

test('HU-09 chat entre interesados en la misma mascota: criterios 1 a 7', async ({ page }) => {
  test.setTimeout(120_000);
  const bubbles = page.locator('[data-tour="chat-messages"] p.whitespace-pre-wrap');
  await freshStart(page);
  await beat(page, 1200);

  // c6: without an active session the chat asks for login and shows nothing
  await page.goto(`./#/chats/${GROUP}`);
  await expect(page).toHaveURL(/#\/login/);
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  await expect(page.locator('[data-hu="HU-09"]')).toHaveCount(0);
  await expect(page.getByText('vi la publicación de Porotopo')).toHaveCount(0);
  await beat(page);
  await evid(page, 'HU-09', 'P-HU-09-06-sin-sesion-pide-login');

  // c1: from the pet profile, "Unirme al chat de la mascota" opens the chat linked to that pet
  await login(page, 'camila.mendoza@kuyaypet.pe');
  await page.goto('./#/mascota/p01');
  await expect(page.locator('[data-hu="HU-03"]')).toBeVisible();
  const join = page.getByRole('button', { name: 'Unirme al chat de la mascota' });
  await expect(join).toBeVisible();
  await beat(page);
  await join.click();
  await expect(page).toHaveURL(new RegExp(`#/chats/${GROUP}$`));
  await expect(page.locator('[data-hu="HU-09"]')).toBeVisible();
  await expect(page.locator('header').getByText('Grupo de Porotopo', { exact: true })).toBeVisible();
  await beat(page);
  await evid(page, 'HU-09', 'P-HU-09-01-unirme-al-chat-de-la-mascota');

  // c4: first entry shows the previous history
  await expect(bubbles).toHaveCount(5);
  await expect(bubbles.first()).toContainText('vi la publicación de Porotopo');
  await expect(page.getByText(/Todavía no hay mensajes/)).toHaveCount(0);
  await beat(page);
  await evid(page, 'HU-09', 'P-HU-09-04-historial-primera-vez');

  // c7: empty or whitespace-only message keeps the send button disabled and sends nothing
  const send = page.getByRole('button', { name: 'Enviar' });
  await expect(send).toBeDisabled();
  await page.getByLabel('Mensaje').fill('     ');
  await expect(send).toBeDisabled();
  await beat(page);
  await evid(page, 'HU-09', 'P-HU-09-07-enviar-deshabilitado-mensaje-vacio');
  await send.click({ force: true }).catch(() => {});
  await expect(bubbles).toHaveCount(5);
  await page.getByLabel('Mensaje').fill('');

  // c5: a pet chat without messages says so and invites to start the conversation
  await page.goto('./#/mascota/p02');
  await expect(page.locator('[data-hu="HU-03"]')).toBeVisible();
  await page.getByRole('button', { name: 'Unirme al chat de la mascota' }).click();
  await expect(page.locator('[data-hu="HU-09"]')).toBeVisible();
  await expect(bubbles).toHaveCount(0);
  await expect(page.getByText('Todavía no hay mensajes. ¡Rompe el hielo!')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-09', 'P-HU-09-05-chat-vacio-invita-a-conversar');

  // c3 (seed history): messages from other users carry sender name and time
  await page.goto(`./#/chats/${GROUP}`);
  const other = page.locator('[data-tour="chat-messages"] > div').filter({ hasText: 'vi la publicación de Porotopo' });
  await expect(other.getByText('Sebastián Rojas', { exact: true })).toBeVisible();
  await expect(other.getByText(TIME)).toBeVisible();
  const rios = page.locator('[data-tour="chat-messages"] > div').filter({ hasText: 'Les cuento cómo me va' });
  await expect(rios.getByText('Gabriela Ríos', { exact: true })).toBeVisible();
  await beat(page);
  await evid(page, 'HU-09', 'P-HU-09-03a-remitente-y-hora-historial');

  // c2 and c3 live: split stage, two phones (adopter and owner) on the same group chat
  await freshStart(page);
  await page.goto('./?split=1#/');
  await expect(page.locator('[data-split-stage]')).toBeVisible();
  const adopter = page.frameLocator('[data-split-phone="adopter"]');
  const owner = page.frameLocator('[data-split-phone="owner"]');
  await expect(adopter.getByText('Descubre').first()).toBeVisible({ timeout: 15_000 });
  await expect(owner.locator('[data-tour="owner-interests"]')).toBeVisible({ timeout: 15_000 });
  await page.frame({ url: /as=adopter/ })!.evaluate(`location.hash = '#/chats/${GROUP}'`);
  await page.frame({ url: /as=owner/ })!.evaluate(`location.hash = '#/chats/${GROUP}'`);
  await expect(adopter.locator('[data-hu="HU-09"]')).toBeVisible();
  await expect(owner.locator('[data-hu="HU-09"]')).toBeVisible();
  await beat(page, 1200);

  const fromValeria = 'Hola grupo, ¿alguien quiere ir junto a la visita?';
  await adopter.getByLabel('Mensaje').fill(fromValeria);
  await adopter.getByRole('button', { name: 'Enviar' }).click();
  await expect(adopter.getByText(fromValeria)).toBeVisible();
  await expect(owner.getByText(fromValeria)).toBeVisible({ timeout: 10_000 });
  await beat(page);
  await evid(page, 'HU-09', 'P-HU-09-02-mensaje-llega-a-otro-usuario');

  const incoming = owner.locator('[data-tour="chat-messages"] > div').filter({ hasText: fromValeria });
  await expect(incoming.getByText('Valeria Torres', { exact: true })).toBeVisible();
  await expect(incoming.getByText(TIME)).toBeVisible();
  const fromRosa = 'Yo también quiero ir, ¿a qué hora?';
  await owner.getByLabel('Mensaje').fill(fromRosa);
  await owner.getByRole('button', { name: 'Enviar' }).click();
  const incoming2 = adopter.locator('[data-tour="chat-messages"] > div').filter({ hasText: fromRosa });
  await expect(incoming2.getByText('Rosa Quispe', { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(incoming2.getByText(TIME)).toBeVisible();
  await beat(page, 1000);
  await evid(page, 'HU-09', 'P-HU-09-03-remitente-y-hora-en-tiempo-real');
  await beat(page, 1500);
});
