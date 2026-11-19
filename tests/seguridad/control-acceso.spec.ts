import { expect, test, type Page } from '@playwright/test';

// Pruebas de seguridad del prototipo (Sprint 4). Sin backend: el control de acceso vive en el
// cliente (`RequireAuth` + `canAccess` en src/services/auth.ts). Estas pruebas verifican que
// ese control se cumple en la interfaz; lo que queda fuera por no haber servidor está en docs/pruebas.md.

test.use({ reducedMotion: 'reduce' });

const PRIVATE_ROUTES = [
  '/descubrir', '/buscar', '/matches', '/chats', '/perfil', '/notificaciones', '/favoritos', '/historial',
  '/responsable', '/responsable/nueva', '/responsable/editar/p01', '/admin', '/admin/usuarios', '/admin/publicaciones',
  '/admin/reportes', '/mascota/p01', '/chats/t-001', '/coordinar/p01', '/adoptante/u-adopter-demo', '/onboarding',
];

async function fresh(page: Page) {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
}

async function loginAs(page: Page, role: 'Adoptante' | 'Responsable') {
  await fresh(page);
  await page.getByRole('button', { name: new RegExp(role) }).click();
  await expect(page).toHaveURL(role === 'Adoptante' ? /#\/(descubrir|onboarding)/ : /#\/responsable/);
}

async function loginAdmin(page: Page) {
  await fresh(page);
  await page.goto('./#/login');
  await page.getByLabel('Correo electrónico').fill('admin@kuyaypet.pe');
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/#\/admin/);
}

const sessionUser = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('kuyaypet-db') ?? '{"state":{"sessionUserId":null}}').state.sessionUserId ?? null);

const hashPath = (page: Page) => new URL(page.url()).hash.replace(/^#/, '');

test('SEG-01: sin sesión, todas las rutas privadas redirigen al login', async ({ page }) => {
  await fresh(page);
  for (const route of PRIVATE_ROUTES) {
    await page.goto(`./#${route}`);
    await expect.poll(() => hashPath(page), { message: route }).toBe('/login');
  }
});

test('SEG-02: el adoptante no entra a rutas del responsable ni del administrador', async ({ page }) => {
  await loginAs(page, 'Adoptante');
  for (const route of ['/responsable', '/responsable/nueva', '/responsable/editar/p01', '/admin', '/admin/usuarios', '/admin/reportes', '/adoptante/u-owner-10']) {
    await page.goto(`./#${route}`);
    await expect.poll(() => hashPath(page), { message: route }).toBe('/descubrir');
  }
});

test('SEG-03: el responsable no entra a rutas del adoptante ni del administrador', async ({ page }) => {
  await loginAs(page, 'Responsable');
  for (const route of ['/descubrir', '/buscar', '/favoritos', '/coordinar/p01', '/admin', '/admin/publicaciones']) {
    await page.goto(`./#${route}`);
    await expect.poll(() => hashPath(page), { message: route }).toBe('/responsable');
  }
});

test('SEG-04: el administrador no entra a rutas del responsable ni del adoptante', async ({ page }) => {
  await loginAdmin(page);
  for (const route of ['/responsable', '/responsable/nueva', '/descubrir', '/favoritos']) {
    await page.goto(`./#${route}`);
    await expect.poll(() => hashPath(page), { message: route }).toBe('/admin');
  }
});

test('SEG-05: el responsable no puede editar una mascota ajena y los datos no cambian', async ({ page }) => {
  await loginAs(page, 'Responsable');
  const readPet = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem('kuyaypet-db')!).state.pets.find((p: { id: string }) => p.id === 'p02'));
  const before = await readPet();
  expect(before.ownerId).not.toBe(await page.evaluate(() => JSON.parse(localStorage.getItem('kuyaypet-db')!).state.sessionUserId));
  await page.goto('./#/responsable/editar/p02');
  await expect(page.getByText('Mascota no encontrada')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Guardar cambios' })).toHaveCount(0);
  expect(await readPet()).toEqual(before);
});

test('SEG-06: una cuenta desactivada no puede iniciar sesión', async ({ page }) => {
  await loginAs(page, 'Adoptante');
  // Se desactiva la cuenta y se cierra la sesión directamente en los datos persistidos.
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    const u = raw.state.users.find((x: { email: string }) => x.email === 'adoptante@kuyaypet.pe');
    u.active = false;
    raw.state.sessionUserId = null;
    localStorage.setItem('kuyaypet-db', JSON.stringify(raw));
  });
  await page.goto('./#/login');
  await page.reload();
  await page.getByLabel('Correo electrónico').fill('adoptante@kuyaypet.pe');
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('alert')).toContainText('desactivada');
  await expect.poll(() => hashPath(page)).toBe('/login');
  expect(await sessionUser(page)).toBeNull();
});

test('SEG-07: contraseña incorrecta no abre sesión y el mensaje no dice cuál dato falló', async ({ page }) => {
  await fresh(page);
  await page.goto('./#/login');
  await page.getByLabel('Correo electrónico').fill('adoptante@kuyaypet.pe');
  await page.locator('#password').fill('otra-clave-123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('alert')).toHaveText('Correo o contraseña incorrectos.');
  expect(await sessionUser(page)).toBeNull();
});

test('SEG-12: si el administrador desactiva una cuenta con sesión abierta, esa sesión se cierra', async ({ page }) => {
  await loginAs(page, 'Adoptante');
  await page.goto('./#/perfil');
  await expect.poll(() => hashPath(page)).toBe('/perfil');
  // Otra pestaña (el administrador) desactiva la cuenta: el cambio llega por los datos persistidos.
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('kuyaypet-db')!);
    const u = raw.state.users.find((x: { id: string }) => x.id === raw.state.sessionUserId);
    u.active = false;
    localStorage.setItem('kuyaypet-db', JSON.stringify(raw));
  });
  await page.reload();
  await expect.poll(() => hashPath(page)).toBe('/login');
  expect(await sessionUser(page)).toBeNull();
});

test('SEG-13: un usuario no puede leer un chat directo del que no es parte', async ({ page }) => {
  await loginAs(page, 'Responsable');
  const isMember = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('kuyaypet-db')!).state;
    return s.threads.find((t: { id: string }) => t.id === 't-001').memberIds.includes(s.sessionUserId);
  });
  expect(isMember).toBe(false);
  await page.goto('./#/chats/t-001');
  await expect(page.getByText('Conversación no encontrada')).toBeVisible();
  await expect(page.locator('[data-tour="chat-messages"]')).toHaveCount(0);
  await expect(page.getByLabel('Mensaje')).toHaveCount(0);
});
