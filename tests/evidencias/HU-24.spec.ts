// HU-24 evidence: criteria 1-7 of the PDF, one screenshot per criterion (C7 has one per outcome).
import { expect, test, type Page } from '@playwright/test';
import { beat, evid, freshStart } from './shared';

test.use({ reducedMotion: 'reduce' });

async function login(page: Page, email: string, home: string) {
  await page.goto('./#/login');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.locator('#password').fill('kuyay2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(new RegExp(`#${home}`));
}

async function logout(page: Page) {
  await page.goto('./#/perfil');
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/#\/login/);
}

const card = (page: Page, name: string) => page.locator('[data-hu="HU-24"] li', { hasText: name });

test('HU-24 aprobar o rechazar publicaciones: criterios 1 a 7', async ({ page }) => {
  await freshStart(page);
  await login(page, 'admin@kuyaypet.pe', '/admin');
  await beat(page);

  // C1: the admin sees the publications pending review
  await expect(page.locator('[data-tour="admin-pending"]')).toBeVisible();
  await expect(card(page, 'Salem')).toBeVisible();
  await expect(card(page, 'Michi')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-24', 'P-HU-24-01-pendientes-de-revision');

  // C2: selecting a pending publication shows the pet information
  await card(page, 'Salem').locator('a').click();
  await expect(page).toHaveURL(/#\/mascota\/p38/);
  await expect(page.getByRole('heading', { name: 'Salem' }).first()).toBeVisible();
  await beat(page);
  await evid(page, 'HU-24', 'P-HU-24-02-informacion-mascota');
  await page.goto('./#/admin');
  await expect(card(page, 'Salem')).toBeVisible();

  // C3: "Aprobar" asks for confirmation; cancelling leaves it pending
  await card(page, 'Salem').getByRole('button', { name: 'Aprobar' }).click();
  const dlg = page.getByRole('alertdialog');
  await expect(dlg).toContainText('¿Aprobar a Salem?');
  await beat(page);
  await evid(page, 'HU-24', 'P-HU-24-03-confirmar-aprobacion');
  await dlg.getByRole('button', { name: 'Cancelar' }).click();
  await expect(card(page, 'Salem')).toBeVisible();
  await beat(page);

  // C4 + C7 (approved): confirming sets the state to Aprobada and shows the message
  await card(page, 'Salem').getByRole('button', { name: 'Aprobar' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Aprobar' }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('Publicación de Salem aprobada');
  await expect(card(page, 'Salem')).toHaveCount(0);
  await beat(page);
  await evid(page, 'HU-24', 'P-HU-24-07a-mensaje-aprobada');
  await page.goto('./#/admin/publicaciones/p38');
  await expect(page.getByText('Aprobada', { exact: true })).toBeVisible();
  await beat(page);
  await evid(page, 'HU-24', 'P-HU-24-04-estado-aprobada');

  // C5: "Rechazar" lets the admin give a reason (and requires one)
  await page.goto('./#/admin');
  await card(page, 'Michi').getByRole('button', { name: 'Rechazar' }).click();
  const publish = page.getByRole('button', { name: 'Rechazar publicación' });
  await expect(page.getByLabel('Motivo del rechazo')).toBeVisible();
  await expect(publish).toBeDisabled();
  await page.getByRole('button', { name: 'Contenido inapropiado' }).click();
  await expect(publish).toBeEnabled();
  await beat(page);
  await evid(page, 'HU-24', 'P-HU-24-05-motivo-rechazo');

  // C6 + C7 (rejected): confirming sets the state to Rechazada, shows the message, and the owner sees it
  await page.getByLabel('Motivo del rechazo').fill('Fotos no corresponden a la mascota');
  await publish.click();
  await expect(page.locator('[aria-live="polite"]')).toContainText('Publicación de Michi rechazada');
  await expect(card(page, 'Michi')).toHaveCount(0);
  await beat(page);
  await evid(page, 'HU-24', 'P-HU-24-07b-mensaje-rechazada');
  await page.goto('./#/admin/publicaciones/p37');
  await expect(page.getByText('Rechazada', { exact: true })).toBeVisible();
  await expect(page.getByText('Fotos no corresponden a la mascota')).toBeVisible();
  await beat(page);
  await evid(page, 'HU-24', 'P-HU-24-06-estado-rechazada');

  // Side effect: approved pet is public, rejected one is not
  await logout(page);
  await login(page, 'adoptante@kuyaypet.pe', '/descubrir');
  await page.goto('./#/buscar');
  await expect(page.getByRole('heading', { name: 'Salem' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Michi' })).toHaveCount(0);
  await beat(page, 1500);
});
