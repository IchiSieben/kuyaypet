import { expect, test, type Page } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 920 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });

const STEPS = 12;
const panel = (page: Page) => page.getByLabel('Panel de presentador');
const next = (page: Page) => page.locator('[data-tour-next]');
const stepIs = (page: Page, n: number) => expect(page.locator(`[data-tour-overlay][data-tour-step="${n}"][data-tour-phase="ready"]`)).toHaveCount(1, { timeout: 15000 });

async function dbState(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('kuyaypet-db')!).state);
}

/** What the scripted story must leave behind, independent of ids and timestamps. */
async function scenario(page: Page) {
  const s = await dbState(page);
  expect(s.adoptions.some((a: { adopterId: string; petId: string; status: string }) => a.adopterId === 'u-adopter-demo' && a.petId === 'p29' && a.status === 'aceptada')).toBe(true);
  expect(s.matches.some((m: { petId: string }) => m.petId === 'p29')).toBe(true);
  return JSON.stringify({
    matches: s.matches.map((m: { petId: string; adopterId: string }) => m.adopterId + m.petId).sort(),
    adoptions: s.adoptions.map((a: { petId: string; status: string; adopterId: string }) => a.adopterId + a.petId + a.status).sort(),
    interests: s.interests.map((i: { petId: string; adopterId: string; status: string }) => i.adopterId + i.petId + i.status).sort(),
    pending: s.pets.filter((p: { approval: string }) => p.approval === 'pendiente').length,
  });
}

/** The popover must never cover the spotlighted target (polled: both animate with springs). */
async function expectNoOverlap(page: Page, step: number) {
  const spot = page.locator('[data-tour-spot]');
  if ((await spot.count()) === 0) return;
  await expect
    .poll(
      async () => {
        const a = await spot.boundingBox();
        const b = await page.locator('[data-tour-popover]').boundingBox();
        if (!a || !b) return 0;
        return Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      },
      { message: `paso ${step}: el popover tapa el objetivo`, timeout: 4000 },
    )
    .toBeLessThanOrEqual(2);
}

async function fresh(page: Page) {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
  await expect(panel(page)).toBeVisible();
}

async function runScripted(page: Page, shots = false) {
  await panel(page).getByRole('button', { name: /Tour/ }).click();
  for (let i = 1; i <= STEPS; i++) {
    await stepIs(page, i);
    await page.waitForTimeout(shots ? 1200 : 300);
    await expectNoOverlap(page, i);
    if (shots) await page.screenshot({ path: `docs/screenshots/tour-paso-${i}.png` });
    if (i === STEPS) break;
    await next(page).click();
  }
  return scenario(page);
}

async function finish(page: Page) {
  await next(page).click();
  await expect(page.locator('[data-tour-overlay]')).toHaveCount(0);
}

test('Tour guiado completo 3 veces seguidas, mismo estado final y restaura el estado previo', async ({ page }) => {
  test.setTimeout(300_000);
  await fresh(page);
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'docs/screenshots/presentador-escritorio.png' });
  // Pre-tour state: logged in as Admin on the admin panel.
  await panel(page).getByRole('button', { name: 'Admin', exact: true }).click();
  await expect(page).toHaveURL(/#\/admin/);
  const before = await dbState(page);

  const finals: string[] = [];
  for (let run = 0; run < 3; run++) {
    finals.push(await runScripted(page, run === 0));
    await finish(page);
    // Exit restores what the presenter had before the tour.
    await expect(page).toHaveURL(/#\/admin/);
    const after = await dbState(page);
    expect(after.sessionUserId).toBe(before.sessionUserId);
    expect(after.matches.length).toBe(before.matches.length);
    expect(after.adoptions.length).toBe(before.adoptions.length);
  }
  expect(new Set(finals).size).toBe(1);
});

test('Acciones fuera de guion a mitad del tour: se re-sincroniza y termina igual', async ({ page }) => {
  test.setTimeout(300_000);
  await fresh(page);
  const reference = await runScripted(page);
  await finish(page);

  await panel(page).getByRole('button', { name: /Tour/ }).click();
  await stepIs(page, 1);
  await next(page).click();
  await stepIs(page, 2);
  await next(page).click();
  await stepIs(page, 3);
  // Off-script 1: the presenter switches role from the panel → the tour puts Valeria back on the deck.
  await panel(page).getByRole('button', { name: 'Responsable', exact: true }).click();
  await stepIs(page, 3);
  await expect(page).toHaveURL(/#\/descubrir/);
  await expect(page.locator('[data-tour="top-card"]')).toContainText('Luna');
  await next(page).click();
  // Step 4 waits for the real action: a click outside the target is blocked, the real ♥ works.
  await stepIs(page, 4);
  await page.getByRole('button', { name: 'No me gusta' }).click({ force: true }).catch(() => {});
  await expect(page.locator('[data-tour="top-card"]')).toContainText('Luna');
  await page.locator('[data-tour="like-btn"]').click();
  await stepIs(page, 5);
  // Off-script 2: navigating away by hand → back to the Match screen.
  await page.evaluate("location.hash = '#/buscar'");
  await stepIs(page, 5);
  await expect(page.locator('[data-tour="match-chat"]')).toBeVisible();
  await page.locator('[data-tour="match-chat"]').click();
  await stepIs(page, 6);
  // Off-script 3: back and forth with the keyboard.
  await page.keyboard.press('ArrowLeft');
  await stepIs(page, 5);
  await page.keyboard.press('ArrowRight');
  await stepIs(page, 6);
  for (let i = 6; i < STEPS; i++) {
    await next(page).click();
    await stepIs(page, i + 1);
  }
  expect(await scenario(page)).toBe(reference);
  await finish(page);
});
