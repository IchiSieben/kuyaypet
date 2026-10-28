import { expect, test, type Page } from '@playwright/test';

const EV = '../../Sprint_03/7.Pruebas/evidencias/HU-08';
const shot = (page: Page, name: string) => page.screenshot({ path: `${EV}/${name}.png` });

// Seed: Valeria already has a Match with Patricia Salazar about p13 (direct thread t-001, three messages).
const THREAD = 't-001';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await expect(page.locator('[data-tour="deck"] article').first()).toBeVisible();
});

async function dbState(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('kuyaypet-db')!).state);
}

const petName = async (page: Page, id: string): Promise<string> =>
  (await dbState(page)).pets.find((p: { id: string }) => p.id === id).name;

const bubbles = (page: Page) => page.locator('[data-tour="chat-messages"] p.whitespace-pre-wrap');

async function send(page: Page, text: string) {
  await page.getByLabel('Mensaje').fill(text);
  await page.getByRole('button', { name: 'Enviar' }).click();
}

test('HU-08 c2: "Chatear" en la mascota abre la conversación con su responsable', async ({ page }) => {
  await page.goto('./#/mascota/p13');
  await expect(page.locator('[data-hu="HU-03"]')).toBeVisible();
  await page.getByRole('button', { name: 'Chatear' }).click();
  await expect(page).toHaveURL(new RegExp(`#/chats/${THREAD}$`));
  await expect(page.locator('[data-hu="HU-08"]')).toBeVisible();
  await expect(page.locator('header').getByText('Patricia Salazar')).toBeVisible();
  await shot(page, 'despues-chatear-abre-conversacion');
});

test('HU-08 c3: el mensaje que envía el adoptante se registra y se muestra en el chat', async ({ page }) => {
  await page.goto(`./#/chats/${THREAD}`);
  const text = 'Hola, ¿sigue disponible para una visita?';
  await send(page, text);
  await expect(bubbles(page).filter({ hasText: text })).toBeVisible();
  await expect(page.getByLabel('Mensaje')).toHaveValue('');
  const msg = (await dbState(page)).messages.find((m: { text: string }) => m.text === text);
  expect(msg.threadId).toBe(THREAD);
  expect(msg.senderId).toBe('u-adopter-demo');
  await shot(page, 'despues-mensaje-enviado');
});

test('HU-08 c5: el chat identifica la mascota de la conversación', async ({ page }) => {
  const name = await petName(page, 'p13');
  await page.goto(`./#/chats/${THREAD}`);
  await expect(page.locator('header').getByText(name, { exact: true })).toBeVisible();
  await expect(page.locator('header a[href$="/mascota/p13"] img[src*="p13"]')).toBeVisible();
  await page.goto('./#/chats');
  await expect(page.getByRole('link', { name: new RegExp(`${name} · Patricia Salazar`) })).toBeVisible();
  await shot(page, 'despues-chat-identifica-mascota');
});

test('HU-08 c6: los mensajes se muestran en orden cronológico', async ({ page }) => {
  await page.goto(`./#/chats/${THREAD}`);
  await send(page, 'Qué tal, me gustaría coordinar una visita');
  // wait for the simulated owner reply so the thread mixes sent and received messages
  await expect.poll(async () => (await dbState(page)).messages.filter((m: { threadId: string }) => m.threadId === THREAD).length, { timeout: 10000 }).toBe(5);
  const expected = (await dbState(page)).messages
    .filter((m: { threadId: string; system?: boolean }) => m.threadId === THREAD && !m.system)
    .sort((a: { createdAt: string }, b: { createdAt: string }) => a.createdAt.localeCompare(b.createdAt))
    .map((m: { text: string }) => m.text);
  expect(expected.length).toBe(5);
  await expect(bubbles(page)).toHaveText(expected);
  expect(expected[3]).toBe('Qué tal, me gustaría coordinar una visita');
  await shot(page, 'despues-orden-cronologico');
});

test('HU-08 c8: el adoptante consulta después el historial de la conversación', async ({ page }) => {
  const text = 'Gracias, quedo atenta a la visita';
  await page.goto(`./#/chats/${THREAD}`);
  await send(page, text);
  await expect(bubbles(page).filter({ hasText: text })).toBeVisible();
  await page.reload();
  await page.goto('./#/chats');
  await page.getByRole('link', { name: /Patricia Salazar/ }).first().click();
  await expect(page.locator('[data-hu="HU-08"]')).toBeVisible();
  await expect(bubbles(page).filter({ hasText: 'Hola, vi que aceptaste mi' })).toBeVisible();
  await expect(bubbles(page).filter({ hasText: 'Este sábado en la tarde' })).toBeVisible();
  await expect(bubbles(page).filter({ hasText: text })).toBeVisible();
  await shot(page, 'despues-historial-reabierto');
});

test('HU-08 c9: al finalizar la conversación se conserva el historial', async ({ page }) => {
  const text = 'Disculpa, ya no podré adoptar';
  await page.goto(`./#/chats/${THREAD}`);
  await send(page, text);
  await expect(bubbles(page).filter({ hasText: text })).toBeVisible();
  await expect(bubbles(page)).toHaveCount(5, { timeout: 10000 }); // simulated owner reply arrived
  const before = await bubbles(page).allTextContents();
  await shot(page, 'antes-de-finalizar-con-opcion');

  await page.getByRole('button', { name: 'Finalizar conversación' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Finalizar', exact: true }).click();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await page.waitForTimeout(500);
  await expect(page.getByRole('status').filter({ hasText: 'conversación fue finalizada' })).toBeVisible();
  await expect(page.getByLabel('Mensaje')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Enviar' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Finalizar conversación' })).toHaveCount(0);
  await shot(page, 'despues-conversacion-finalizada');

  // history intact, now and after reopening
  await expect(bubbles(page)).toHaveText(before);
  await page.reload();
  await expect(page.getByRole('status').filter({ hasText: 'conversación fue finalizada' })).toBeVisible();
  await expect(bubbles(page)).toHaveText(before);
  await page.goto('./#/chats');
  await expect(page.getByRole('link', { name: /Patricia Salazar/ }).first()).toBeVisible();
});
