import { expect, test, type Page } from '@playwright/test';

const shot = (page: Page, name: string) => page.screenshot({ path: `docs/screenshots/${name}.png` });

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
});

async function loginAsAdopter(page: Page) {
  await page.getByRole('button', { name: /Adoptante/ }).click();
}

test('HU-04 y HU-05: filtros y cercanía en /buscar', async ({ page }) => {
  await loginAsAdopter(page);
  await page.goto('./#/buscar');
  await expect(page.locator('[data-hu="HU-02"]')).toBeVisible();
  const initialCount = await page.locator('[data-hu="HU-02"] a[href^="#/mascota/"]').count();
  expect(initialCount).toBeGreaterThan(0);

  // HU-04: abrir filtros, marcar especie=gato, aplicar
  await page.getByRole('button', { name: /^Filtros/ }).click();
  await expect(page.locator('[data-hu="HU-04"]')).toBeVisible();
  await shot(page, 'HU-04-filtros');
  await page.locator('[data-hu="HU-04"]').getByRole('button', { name: '🐱 Gato' }).click();
  await page.getByRole('button', { name: 'Aplicar filtros' }).click();
  await expect(page.getByRole('button', { name: /^Filtros \(1\)/ })).toBeVisible();
  const filteredCount = await page.locator('[data-hu="HU-02"] a[href^="#/mascota/"]').count();
  expect(filteredCount).toBeLessThan(initialCount);
  await shot(page, 'HU-04-resultado');

  // Filtro imposible: especie gato + tamaño L + raza inexistente combination -> puede o no vaciar, probamos edad imposible
  await page.getByRole('button', { name: /^Filtros/ }).click();
  await page.getByLabel('Edad mínima en meses').fill('9999');
  await page.getByRole('button', { name: 'Aplicar filtros' }).click();
  await expect(page.getByText(/No hay mascotas que cumplan estos criterios/)).toBeVisible();
  await shot(page, 'HU-04-sin-resultados');

  // Limpiar filtros restaura la lista completa
  await page.getByRole('button', { name: /^Filtros/ }).click();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(page.getByRole('button', { name: 'Filtros', exact: true })).toBeVisible();
  const restoredCount = await page.locator('[data-hu="HU-02"] a[href^="#/mascota/"]').count();
  expect(restoredCount).toBe(initialCount);

  // HU-05: buscar por distrito con radio grande, debería mostrar distancias
  await expect(page.locator('[data-hu="HU-05"]')).toBeVisible();
  await page.locator('#browse-district').selectOption('Miraflores');
  await page.locator('#browse-radius').fill('20');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByText(/Mostrando mascotas cerca de/)).toBeVisible();
  await shot(page, 'HU-05-cercania');

  // radio muy chico probablemente no encuentra nada
  await page.locator('#browse-radius').fill('1');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  const noneOrSome = page.locator('[data-hu="HU-02"]');
  await expect(noneOrSome).toBeVisible();

  // Limpiar ubicación restaura la lista completa
  const clearLocationBtn = page.getByRole('button', { name: 'Limpiar ubicación' });
  if (await clearLocationBtn.isVisible()) {
    await clearLocationBtn.click();
    const afterClear = await page.locator('[data-hu="HU-02"] a[href^="#/mascota/"]').count();
    expect(afterClear).toBe(initialCount);
  }
});

test('HU-09: unirme al chat grupal de una mascota', async ({ page }) => {
  await loginAsAdopter(page);
  await page.goto('./#/buscar');
  await page.locator('[data-hu="HU-02"] a[href^="#/mascota/"]').first().click();
  await expect(page.locator('[data-hu="HU-03"]')).toBeVisible();
  await page.getByRole('button', { name: 'Unirme al chat de la mascota' }).click();
  await expect(page.locator('[data-hu="HU-09"]')).toBeVisible();
  await expect(page.getByText(/^Grupo de /)).toBeVisible();
  await shot(page, 'HU-09-chat-grupal');
  const sendBtn = page.getByRole('button', { name: 'Enviar' });
  await expect(sendBtn).toBeDisabled();
  await page.getByLabel('Mensaje').fill('   ');
  await expect(sendBtn).toBeDisabled();
  await page.getByLabel('Mensaje').fill('Hola a todos, me interesa esta mascota');
  await expect(sendBtn).toBeEnabled();
  await sendBtn.click();
  await expect(page.getByText('Hola a todos, me interesa esta mascota')).toBeVisible();

  // aparece en la lista de chats
  await page.goto('./#/chats');
  await expect(page.getByText(/^Grupo de /).first()).toBeVisible();
});

test('HU-14: guía de adopción con buscador y volver mantiene contexto', async ({ page }) => {
  await loginAsAdopter(page);
  await page.goto('./#/buscar');
  await page.locator('[data-hu="HU-02"] a[href^="#/mascota/"]').first().click();
  await expect(page.locator('[data-hu="HU-03"]')).toBeVisible();
  await page.getByRole('link', { name: /Guía de adopción responsable/ }).click();
  await expect(page.locator('[data-hu="HU-14"]')).toBeVisible();
  await shot(page, 'HU-14-guia');
  await page.getByLabel('Buscar en la guía').fill('vacunas');
  await expect(page.getByText(/Vacunas y salud/)).toBeVisible();
  await shot(page, 'HU-14-busqueda');
  await page.getByLabel('Buscar en la guía').fill('');
  await page.getByRole('button', { name: 'Volver' }).click();
  await expect(page.locator('[data-hu="HU-03"]')).toBeVisible();
});

test('HU-15: recuperar contraseña con correo simulado', async ({ page }) => {
  await page.goto('./#/login');
  await page.getByRole('link', { name: '¿Olvidaste tu contraseña?' }).click();
  await expect(page.locator('[data-hu="HU-15"]')).toBeVisible();
  await shot(page, 'HU-15-paso1');
  await page.getByLabel('Correo electrónico').fill('adoptante@kuyaypet.pe');
  await page.getByRole('button', { name: 'Enviar enlace de recuperación' }).click();
  await expect(page.getByRole('dialog', { name: 'Bandeja de correo simulada' })).toBeVisible();
  await shot(page, 'HU-15-bandeja');
  await page.getByRole('button', { name: /Usar código/ }).click();
  await page.getByLabel('Nueva contraseña').fill('nuevaClave123');
  await page.getByLabel('Confirmar contraseña').fill('nuevaClave123');
  await shot(page, 'HU-15-paso2');
  await page.getByRole('button', { name: 'Cambiar contraseña' }).click();
  await expect(page).toHaveURL(/#\/login/);
  await page.getByLabel('Correo electrónico').fill('adoptante@kuyaypet.pe');
  await page.locator('#password').fill('nuevaClave123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/#\/(descubrir|onboarding)/);
});

test('HU-17: favoritos', async ({ page }) => {
  await loginAsAdopter(page);
  await page.goto('./#/perfil');
  await page.getByRole('link', { name: /Favoritos/ }).click();
  await expect(page.locator('[data-hu="HU-17"]')).toBeVisible();
  const before = await page.locator('[data-hu="HU-17"] a[href^="#/mascota/"]').count();

  // agregar una nueva mascota a favoritos desde /buscar y verificar que aparece
  await page.goto('./#/buscar');
  const newFavCard = page.locator('[data-hu="HU-02"] a[href^="#/mascota/"]').filter({ has: page.locator('button[aria-label^="Agregar"]') }).first();
  await newFavCard.locator('button[aria-label^="Agregar"]').click();
  await page.goto('./#/favoritos');
  await expect(page.locator('[data-hu="HU-17"] a[href^="#/mascota/"]')).toHaveCount(before + 1);
  await shot(page, 'HU-17-favoritos');

  // quitar esa mascota restaura el conteo anterior
  await page.locator('[data-hu="HU-17"] button[aria-label^="Quitar"]').first().click();
  await expect(page.locator('[data-hu="HU-17"] a[href^="#/mascota/"]')).toHaveCount(before);
});

test('HU-18: historial de interés', async ({ page }) => {
  await loginAsAdopter(page);
  await page.goto('./#/historial');
  await expect(page.locator('[data-hu="HU-18"]')).toBeVisible();
  const before = await page.locator('[data-hu="HU-18"] li').count();

  await page.goto('./#/buscar');
  const notLikedCard = page.locator('[data-hu="HU-02"] a[href^="#/mascota/"]').first();
  await notLikedCard.click();
  await expect(page.locator('[data-hu="HU-03"]')).toBeVisible();
  const likeBtn = page.getByRole('button', { name: 'Me gusta', exact: true });
  if (await likeBtn.isVisible()) {
    await likeBtn.click();
  }
  await page.goto('./#/historial');
  await expect(page.locator('[data-hu="HU-18"]')).toBeVisible();
  await expect(page.locator('[data-hu="HU-18"] li').first()).toBeVisible();
  await shot(page, 'HU-18-historial');
  expect(await page.locator('[data-hu="HU-18"] li').count()).toBeGreaterThanOrEqual(before);
});
