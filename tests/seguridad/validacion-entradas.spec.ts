import { expect, test, type Page } from '@playwright/test';

// Validación de entradas y archivos (Sprint 4): texto con HTML/JS se muestra como texto,
// archivos que no son imagen se rechazan y los formularios no aceptan datos inválidos.

test.use({ reducedMotion: 'reduce' });

const PAYLOAD = '<img src=x onerror="window.__xss=1"><script>window.__xss=2</script>';

async function fresh(page: Page) {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
}

test('SEG-08: un mensaje de chat con HTML se muestra como texto y no ejecuta código', async ({ page }) => {
  await fresh(page);
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await expect(page.locator('[data-tour="deck"] article').first()).toBeVisible();
  let dialog = false;
  page.on('dialog', async (d) => { dialog = true; await d.dismiss(); });
  await page.goto('./#/chats/t-001');
  await page.getByLabel('Mensaje').fill(PAYLOAD);
  await page.getByRole('button', { name: 'Enviar' }).click();
  const bubble = page.locator('[data-tour="chat-messages"] p.whitespace-pre-wrap').filter({ hasText: '<img src=x' });
  await expect(bubble).toBeVisible();
  await expect(bubble).toHaveText(PAYLOAD);
  await expect(page.locator('[data-tour="chat-messages"] img[src="x"]')).toHaveCount(0);
  expect(await page.evaluate(() => (globalThis as unknown as { __xss?: number }).__xss)).toBeUndefined();
  expect(dialog).toBe(false);
});

test('SEG-09: el nombre de una mascota con HTML se guarda y se muestra como texto', async ({ page }) => {
  await fresh(page);
  await page.getByRole('button', { name: /Responsable/ }).click();
  await expect(page.locator('[data-tour="owner-interests"]')).toBeVisible();
  await page.goto('./#/responsable/editar/p01');
  await page.locator('#name').fill(PAYLOAD);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page).toHaveURL(/#\/(mascota\/p01|responsable)$/);
  await page.goto('./#/mascota/p01');
  await expect(page.getByRole('heading', { name: PAYLOAD, exact: true })).toBeVisible();
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
  expect(await page.evaluate(() => (globalThis as unknown as { __xss?: number }).__xss)).toBeUndefined();
});

test('SEG-10: subir un archivo que no es imagen (txt, svg, ejecutable) se rechaza', async ({ page }) => {
  await fresh(page);
  await page.getByRole('button', { name: /Responsable/ }).click();
  await expect(page.locator('[data-tour="owner-interests"]')).toBeVisible();
  await page.goto('./#/responsable/editar/p01');
  const photosBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('kuyaypet-db')!).state.pets.find((p: { id: string }) => p.id === 'p01').photos.length);
  const input = page.locator('input[type="file"]');
  const files = [
    { name: 'notas.txt', mimeType: 'text/plain', buffer: Buffer.from('hola') },
    { name: 'logo.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="window.__xss=3"/>') },
    { name: 'setup.exe', mimeType: 'application/x-msdownload', buffer: Buffer.from('MZ') },
  ];
  for (const f of files) {
    await input.setInputFiles(f);
    await expect(page.getByRole('alert').filter({ hasText: 'Formato no permitido' })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  const photosAfter = await page.evaluate(() => JSON.parse(localStorage.getItem('kuyaypet-db')!).state.pets.find((p: { id: string }) => p.id === 'p01').photos.length);
  expect(photosAfter).toBe(photosBefore);
  expect(await page.evaluate(() => (globalThis as unknown as { __xss?: number }).__xss)).toBeUndefined();
});

test('SEG-11: el registro rechaza correo inválido, contraseña corta y correo duplicado', async ({ page }) => {
  await fresh(page);
  await page.goto('./#/registro');
  const fill = async (email: string, pass: string) => {
    await page.locator('#name').fill('Prueba Seguridad');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(pass);
    await page.locator('#confirm').fill(pass);
    await page.getByRole('button', { name: "Registrarse" }).click();
  };
  await fill('no-es-correo', 'clave-segura-1');
  await expect(page.getByRole('alert')).toBeVisible();
  await fill('nuevo@kuyaypet.pe', 'corta');
  await expect(page.getByRole('alert')).toContainText('8 caracteres');
  await fill('adoptante@kuyaypet.pe', 'clave-segura-1');
  await expect(page.getByRole('alert')).toBeVisible();
  // Ninguno de los tres intentos creó una cuenta ni abrió sesión.
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('kuyaypet-db') ?? '{"state":{"users":[]}}').state);
  expect((state.users ?? []).filter((u: { name: string }) => u.name === 'Prueba Seguridad')).toHaveLength(0);
  expect(state.sessionUserId ?? null).toBeNull();
  await expect.poll(() => new URL(page.url()).hash).toBe('#/registro');
});
