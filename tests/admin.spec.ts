import { expect, test, type Page } from '@playwright/test';

// Report screenshots without mid-animation numbers (the dashboard honours reduced motion).
test.use({ reducedMotion: 'reduce' });

const shot = (page: Page, name: string) => page.screenshot({ path: `docs/screenshots/${name}.png` });

async function loginAdmin(page: Page) {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./#/login');
  await page.getByLabel('Correo electrónico').fill('admin@kuyaypet.pe');
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.locator('[data-tour="admin-pending"]')).toBeVisible();
}

test('HU-22 gestionar usuarios: buscar, editar y guardar', async ({ page }) => {
  await loginAdmin(page);
  await page.goto('./#/admin/usuarios');
  await expect(page.locator('[data-hu="HU-22"]')).toBeVisible();
  await shot(page, 'HU-22-usuarios');
  await page.getByLabel('Buscar usuario por nombre o correo').fill('Valeria Torres');
  await page.locator('a[href^="#/admin/usuarios/"]').first().click();
  await expect(page.locator('[data-hu="HU-22"]')).toBeVisible();
  const nameInput = page.locator('label:has-text("Nombre") input');
  await nameInput.fill('Valeria Editada Prueba');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('Cambios guardados');
  await shot(page, 'HU-22-editar');
});

test('HU-25 desactivar cuenta: usuario inactivo no puede iniciar sesión', async ({ page }) => {
  await loginAdmin(page);
  await page.goto('./#/admin/usuarios');
  await page.getByLabel('Buscar usuario por nombre o correo').fill('martin.chavez@kuyaypet.pe');
  await page.locator('a[href^="#/admin/usuarios/"]').first().click();
  await expect(page.locator('[data-hu="HU-25"]').getByText('Inactiva')).toBeVisible();
  await shot(page, 'HU-25-detalle-inactivo');
  // Reactivar y volver a desactivar para probar el flujo de confirmación de principio a fin.
  await page.getByRole('button', { name: 'Reactivar usuario' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Reactivar' }).click();
  await expect(page.getByRole('button', { name: 'Desactivar usuario' })).toBeVisible();
  await page.getByRole('button', { name: 'Desactivar usuario' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Desactivar' }).click();
  await expect(page.locator('[data-hu="HU-25"]').getByText('Inactiva')).toBeVisible();

  await page.goto('./#/perfil');
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/#\/login/);
  await page.getByLabel('Correo electrónico').fill('martin.chavez@kuyaypet.pe');
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('alert')).toContainText('desactivada');
});

test('HU-23 revisar publicaciones: filtrar, editar y guardar', async ({ page }) => {
  await loginAdmin(page);
  await page.goto('./#/admin/publicaciones');
  await expect(page.locator('[data-hu="HU-23"]')).toBeVisible();
  await shot(page, 'HU-23-publicaciones');
  await page.locator('a[href^="#/admin/publicaciones/"]').first().click();
  await expect(page.locator('[data-hu="HU-23"]')).toBeVisible();
  const aboutBox = page.locator('label:has-text("Sobre mí") textarea');
  await aboutBox.fill('Descripción editada por el admin para la demo.');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('Cambios guardados');
  await shot(page, 'HU-23-editar');
});

test('HU-26 reportes: revisar y descartar', async ({ page }) => {
  await loginAdmin(page);
  await page.goto('./#/admin/reportes');
  await expect(page.locator('[data-hu="HU-26"]')).toBeVisible();
  await shot(page, 'HU-26-reportes');
  await page.locator('a[href^="#/admin/reportes/"]').first().click();
  await expect(page.locator('[data-hu="HU-26"]')).toBeVisible();
  await page.getByRole('button', { name: 'Descartar reporte' }).click();
  await page.getByLabel('Nota de resolución').fill('Revisado, sin evidencia suficiente.');
  await page.getByRole('button', { name: 'Confirmar descarte' }).click();
  await expect(page.getByText('Descartado', { exact: true })).toBeVisible();
  await shot(page, 'HU-26-resuelto');
});
