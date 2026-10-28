// HU-06 evidence: criteria 1-5 of "Indicar interés en una mascota" (Sprint_03), one screenshot per criterion.
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart, readDb } from './shared';

test('HU-06 indicar interés (Me gusta / No me gusta): criterios 1 a 5', async ({ page }) => {
  await freshStart(page);
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await expect(page.locator('[data-tour="deck"] article').first()).toBeVisible();
  const top = page.locator('[data-tour="top-card"]');
  const nameOf = async () => ((await top.getAttribute('aria-label'))!).split(',')[0];
  const like = page.getByRole('button', { name: 'Me gusta', exact: true });
  const dislike = page.getByRole('button', { name: 'No me gusta', exact: true });
  const clearMatch = async () => {
    const keep = page.getByRole('button', { name: 'Seguir descubriendo' });
    if (await keep.isVisible()) await keep.click();
  };
  await beat(page, 1200);

  // c1: both options are shown on an available pet
  await expect(like).toBeVisible();
  await expect(dislike).toBeVisible();
  await evid(page, 'HU-06', 'P-HU-06-01-opciones-me-gusta-no-me-gusta');

  // c2: "Me gusta" registers the interest
  const n1 = await nameOf();
  const before = await readDb(page);
  await like.click();
  await expect(page.getByText(`Te gusta ${n1}`)).toBeVisible();
  const afterLike = await readDb(page);
  const liked = afterLike.interactions.at(-1);
  expect(afterLike.interactions.length).toBe(before.interactions.length + 1);
  expect(liked.kind).toBe('like');
  expect(afterLike.pets.find((p: any) => p.id === liked.petId).name).toBe(n1);
  expect(afterLike.interests.length).toBe(before.interests.length + 1);
  await evid(page, 'HU-06', 'P-HU-06-02-me-gusta-registrado');
  await beat(page, 1200);
  await clearMatch();

  // c3: "No me gusta" registers the lack of interest and does not notify the owner
  await expect(top).not.toHaveAttribute('aria-label', new RegExp(`^${n1},`));
  const n2 = await nameOf();
  const interestsBefore = (await readDb(page)).interests.length;
  await dislike.click();
  await expect(page.getByText(`No te mostraremos a ${n2} de nuevo.`)).toBeVisible();
  const afterDislike = await readDb(page);
  const disliked = afterDislike.interactions.at(-1);
  expect(disliked.kind).toBe('dislike');
  expect(afterDislike.pets.find((p: any) => p.id === disliked.petId).name).toBe(n2);
  expect(afterDislike.interests.length).toBe(interestsBefore);
  await evid(page, 'HU-06', 'P-HU-06-03-no-me-gusta-registrado');
  await beat(page, 1200);

  // c4: visual confirmation of the option chosen (toast with the pet name)
  await expect(top).not.toHaveAttribute('aria-label', new RegExp(`^${n2},`));
  const n3 = await nameOf();
  await like.click();
  await expect(page.getByText(`Te gusta ${n3}`)).toBeVisible();
  await expect(page.getByText('Siguiente', { exact: true })).toBeVisible();
  await evid(page, 'HU-06', 'P-HU-06-04-confirmacion-visual');
  await beat(page, 1200);
  await clearMatch();

  // c5: after choosing, another available pet is shown and the options remain
  await expect(top).not.toHaveAttribute('aria-label', new RegExp(`^${n3},`));
  const n4 = await nameOf();
  expect(n4).not.toBe(n3);
  await expect(like).toBeVisible();
  await expect(dislike).toBeVisible();
  await evid(page, 'HU-06', 'P-HU-06-05-siguiente-mascota');
  await beat(page, 1500);
});
