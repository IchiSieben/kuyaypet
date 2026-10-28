import { expect, test, type Page } from '@playwright/test';

const EV = '../../Sprint_03/7.Pruebas/evidencias/HU-09';
const shot = (page: Page, name: string) => page.screenshot({ path: `${EV}/${name}.png` });

// Seed: group chat t-003 about p01 (Porotopo) with 5 messages from Sebastián Rojas, Valeria Torres and Gabriela Ríos.
const GROUP = 't-003';
const TIME = /\d{1,2}:\d{2}/;

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
});

async function login(page: Page, email: string) {
  await page.getByLabel('Correo electrónico').fill(email);
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
}

const bubbles = (page: Page) => page.locator('[data-tour="chat-messages"] p.whitespace-pre-wrap');

test.describe('chat grupal en pantalla dividida', () => {
  test.use({ viewport: { width: 1440, height: 920 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });

  test('HU-09 c2 y c3: el mensaje de un usuario llega a los demás en tiempo real, con remitente y hora', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('./?split=1#/');
    await expect(page.locator('[data-split-stage]')).toBeVisible();
    const adopter = page.frameLocator('[data-split-phone="adopter"]');
    const owner = page.frameLocator('[data-split-phone="owner"]');
    await expect(adopter.getByText('Descubre').first()).toBeVisible({ timeout: 15000 });
    await expect(owner.locator('[data-tour="owner-interests"]')).toBeVisible({ timeout: 15000 });
    await page.frame({ url: /as=adopter/ })!.evaluate(`location.hash = '#/chats/${GROUP}'`);
    await page.frame({ url: /as=owner/ })!.evaluate(`location.hash = '#/chats/${GROUP}'`);
    await expect(adopter.locator('[data-hu="HU-09"]')).toBeVisible();
    await expect(owner.locator('[data-hu="HU-09"]')).toBeVisible();

    // c2: Valeria writes, Rosa's phone shows it without reloading
    const fromValeria = 'Hola grupo, ¿alguien quiere ir junto a la visita?';
    await adopter.getByLabel('Mensaje').fill(fromValeria);
    await adopter.getByRole('button', { name: 'Enviar' }).click();
    await expect(adopter.getByText(fromValeria)).toBeVisible();
    await expect(owner.getByText(fromValeria)).toBeVisible({ timeout: 10000 });
    // c3: on Rosa's phone the incoming message carries sender name and time
    const incoming = owner.locator('[data-tour="chat-messages"] > div').filter({ hasText: fromValeria });
    await expect(incoming.getByText('Valeria Torres', { exact: true })).toBeVisible();
    await expect(incoming.getByText(TIME)).toBeVisible();

    // and the other way round: Rosa answers, Valeria's phone shows "Rosa Quispe" + time while she is active in the chat
    const fromRosa = 'Yo también quiero ir, ¿a qué hora?';
    await owner.getByLabel('Mensaje').fill(fromRosa);
    await owner.getByRole('button', { name: 'Enviar' }).click();
    const incoming2 = adopter.locator('[data-tour="chat-messages"] > div').filter({ hasText: fromRosa });
    await expect(incoming2.getByText('Rosa Quispe', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(incoming2.getByText(TIME)).toBeVisible();
    await page.waitForTimeout(500);
    await shot(page, 'despues-chat-grupal-tiempo-real');
  });
});

test('HU-09 c3: los mensajes de otros usuarios muestran nombre del remitente y hora', async ({ page }) => {
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await page.goto(`./#/chats/${GROUP}`);
  const other = page.locator('[data-tour="chat-messages"] > div').filter({ hasText: 'vi la publicación de Porotopo' });
  await expect(other.getByText('Sebastián Rojas', { exact: true })).toBeVisible();
  await expect(other.getByText(TIME)).toBeVisible();
  const rios = page.locator('[data-tour="chat-messages"] > div').filter({ hasText: 'Les cuento cómo me va' });
  await expect(rios.getByText('Gabriela Ríos', { exact: true })).toBeVisible();
  await shot(page, 'despues-remitente-y-hora');
});

test('HU-09 c4: al entrar por primera vez al chat de la mascota se muestra el historial previo', async ({ page }) => {
  await page.goto('./#/login');
  await login(page, 'camila.mendoza@kuyaypet.pe');
  await page.goto('./#/mascota/p01');
  await expect(page.locator('[data-hu="HU-03"]')).toBeVisible();
  await page.getByRole('button', { name: 'Unirme al chat de la mascota' }).click();
  await expect(page).toHaveURL(new RegExp(`#/chats/${GROUP}$`));
  await expect(page.locator('[data-hu="HU-09"]')).toBeVisible();
  await expect(bubbles(page)).toHaveCount(5);
  await expect(bubbles(page).first()).toContainText('vi la publicación de Porotopo');
  await expect(page.getByText(/Todavía no hay mensajes/)).toHaveCount(0);
  await shot(page, 'despues-historial-primera-vez');
});

test('HU-09 c5: sin mensajes previos se indica que no hay mensajes y se invita a iniciar la conversación', async ({ page }) => {
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await page.goto('./#/mascota/p02');
  await expect(page.locator('[data-hu="HU-03"]')).toBeVisible();
  await page.getByRole('button', { name: 'Unirme al chat de la mascota' }).click();
  await expect(page.locator('[data-hu="HU-09"]')).toBeVisible();
  await expect(bubbles(page)).toHaveCount(0);
  await expect(page.getByText('Todavía no hay mensajes. ¡Rompe el hielo!')).toBeVisible();
  await shot(page, 'despues-chat-vacio');
});

test('HU-09 c6: sin sesión activa, abrir el chat de una mascota pide iniciar sesión', async ({ page }) => {
  await page.goto(`./#/chats/${GROUP}`);
  await expect(page).toHaveURL(/#\/login/);
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  await expect(page.locator('[data-hu="HU-09"]')).toHaveCount(0);
  await expect(page.getByText('vi la publicación de Porotopo')).toHaveCount(0);
  await shot(page, 'despues-chat-sin-sesion-login');
});
