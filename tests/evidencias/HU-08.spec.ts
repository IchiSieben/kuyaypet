// HU-08 evidence: criteria 1-9 of "Comunicarse con el responsable" (Sprint_03), one screenshot per criterion.
// c4 and c7 are SIMULADO: the owner's answer comes from template replies (services/chat.ts), not from a person.
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart, readDb } from './shared';

const THREAD = 't-001'; // seed: Valeria <-> Patricia Salazar about p13 (Otto), three messages

test('HU-08 comunicarse con el responsable: criterios 1 a 9', async ({ page }) => {
  const bubbles = page.locator('[data-tour="chat-messages"] p.whitespace-pre-wrap');
  const send = async (text: string) => {
    await page.getByLabel('Mensaje').fill(text);
    await page.getByRole('button', { name: 'Enviar' }).click();
  };
  const threadCount = async () => (await readDb(page)).messages.filter((m: any) => m.threadId === THREAD).length;
  await freshStart(page);
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await expect(page.locator('[data-tour="deck"] article').first()).toBeVisible();
  await beat(page);

  // c1: the adopter can start a conversation with the owner from the pet profile
  await page.goto('./#/mascota/p13');
  await expect(page.locator('[data-hu="HU-03"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Chatear' })).toBeVisible();
  await beat(page);
  await evid(page, 'HU-08', 'P-HU-08-01-opcion-iniciar-chat');

  // c2: "Chatear" opens the conversation with that pet's owner
  await page.getByRole('button', { name: 'Chatear' }).click();
  await expect(page).toHaveURL(new RegExp(`#/chats/${THREAD}$`));
  await expect(page.locator('[data-hu="HU-08"]')).toBeVisible();
  await expect(page.locator('header').getByText('Patricia Salazar')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-08', 'P-HU-08-02-chat-abierto-con-responsable');

  // c3: the adopter's message is registered and shown
  const text = 'Hola, ¿sigue disponible para una visita?';
  await send(text);
  await expect(bubbles.filter({ hasText: text })).toBeVisible();
  await expect(page.getByLabel('Mensaje')).toHaveValue('');
  const msg = (await readDb(page)).messages.find((m: any) => m.text === text);
  expect(msg.threadId).toBe(THREAD);
  expect(msg.senderId).toBe('u-adopter-demo');
  await evid(page, 'HU-08', 'P-HU-08-03-mensaje-enviado');

  // c4 (Simulado): a message from the owner is visible; the reply arrives from the template engine
  await expect.poll(threadCount, { timeout: 10_000 }).toBe(5);
  const received = (await readDb(page)).messages.filter((m: any) => m.threadId === THREAD && !m.system && m.senderId !== 'u-adopter-demo');
  expect(received.length).toBeGreaterThan(0);
  await expect(bubbles.filter({ hasText: received.at(-1).text })).toBeVisible();
  await beat(page);
  await evid(page, 'HU-08', 'P-HU-08-04-mensaje-recibido-simulado');

  // c5: the chat identifies the related pet (header and chat list)
  await expect(page.locator('header').getByText('Otto', { exact: true })).toBeVisible();
  await expect(page.locator('header a[href$="/mascota/p13"] img[src*="p13"]')).toBeVisible();
  await evid(page, 'HU-08', 'P-HU-08-05-chat-identifica-mascota');

  // c6: sent and received messages in chronological order
  const expected = (await readDb(page)).messages
    .filter((m: any) => m.threadId === THREAD && !m.system)
    .sort((a: any, b: any) => a.createdAt.localeCompare(b.createdAt))
    .map((m: any) => m.text);
  await expect(bubbles).toHaveText(expected);
  expect(expected[3]).toBe(text);
  await evid(page, 'HU-08', 'P-HU-08-06-orden-cronologico');

  // c7 (Simulado): an information request is answered by the template reply
  const ask = '¿Cuántas vacunas tiene Otto?';
  await send(ask);
  await expect(bubbles.filter({ hasText: ask })).toBeVisible();
  await expect.poll(threadCount, { timeout: 10_000 }).toBe(7);
  await expect(bubbles).toHaveCount(7);
  await beat(page);
  await evid(page, 'HU-08', 'P-HU-08-07-consulta-y-respuesta-simulada');

  // c8: the history can be consulted later (reload, chat list, reopen)
  await page.reload();
  await page.goto('./#/chats');
  await expect(page.getByRole('link', { name: /Otto · Patricia Salazar/ })).toBeVisible();
  await beat(page);
  await page.getByRole('link', { name: /Patricia Salazar/ }).first().click();
  await expect(bubbles.filter({ hasText: 'Hola, vi que aceptaste mi' })).toBeVisible();
  await expect(bubbles.filter({ hasText: ask })).toBeVisible();
  await expect(bubbles).toHaveCount(7);
  await beat(page);
  await evid(page, 'HU-08', 'P-HU-08-08-historial-reabierto');

  // c9: finishing the conversation keeps the history
  const before = await bubbles.allTextContents();
  await page.getByRole('button', { name: 'Finalizar conversación' }).click();
  await beat(page);
  await page.getByRole('alertdialog').getByRole('button', { name: 'Finalizar', exact: true }).click();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await expect(page.getByRole('status').filter({ hasText: 'conversación fue finalizada' })).toBeVisible();
  await expect(page.getByLabel('Mensaje')).toBeDisabled();
  await expect(bubbles).toHaveText(before);
  await page.reload();
  await expect(page.getByRole('status').filter({ hasText: 'conversación fue finalizada' })).toBeVisible();
  await expect(bubbles).toHaveText(before);
  await beat(page);
  await evid(page, 'HU-08', 'P-HU-08-09-conversacion-finalizada-con-historial');
  await beat(page, 1500);
});
