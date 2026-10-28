// HU-03 evidence: one screenshot per acceptance criterion (c1-c5) and the walk-through video of task #32
// (p01 all optional fields, p02 story only, p03 none).
import { expect, test } from '@playwright/test';
import { beat, evid, freshStart, readDb } from './shared';

const ageText = (m: number) => (m < 12 ? `${m} ${m === 1 ? 'mes' : 'meses'}` : `${Math.floor(m / 12)} ${Math.floor(m / 12) === 1 ? 'año' : 'años'}`);
const speciesText = (s: string) => (s === 'perro' ? 'Perro' : 'Gato');

test('HU-03 perfil de una mascota: criterios 1 a 5', async ({ page }) => {
  await freshStart(page);
  await page.getByRole('button', { name: /Adoptante/ }).click();
  await beat(page);
  const db = await readDb(page);
  const profile = page.locator('[data-hu="HU-03"]');

  const openFromList = async (id: string) => {
    await page.goto('./#/buscar');
    const card = page.locator(`[data-hu="HU-02"] a[href="#/mascota/${id}"]`).first();
    await card.scrollIntoViewIfNeeded();
    await beat(page);
    const name = (await card.locator('h3').textContent())!.trim();
    await card.click();
    await expect(page).toHaveURL(new RegExp(`#/mascota/${id}$`));
    await expect(profile.locator('h1')).toHaveText(name);
    return { name, pet: db.pets.find((p: any) => p.id === id) };
  };

  // c1: selecting a pet card opens its detailed profile
  const p01 = await openFromList('p01');
  await beat(page, 1000);
  await evid(page, 'HU-03', 'P-HU-03-01-perfil-detallado');

  // c2: photo, name, species, breed, age and location
  await expect(profile.locator('img').first()).toHaveAttribute('alt', new RegExp(`de ${p01.pet.name}$`));
  await expect(profile.locator('img').first()).toHaveAttribute('src', p01.pet.photos[0]);
  await expect(profile).toContainText(`${speciesText(p01.pet.species)} · ${p01.pet.breed}`);
  await expect(profile).toContainText(ageText(p01.pet.ageMonths));
  await expect(profile).toContainText(`${p01.pet.district}, Lima`);
  await beat(page);
  await evid(page, 'HU-03', 'P-HU-03-02-foto-y-datos-basicos');

  // c3: additional information registered by the owner
  const extra = profile.getByRole('heading', { name: /Información adicional/ });
  await extra.scrollIntoViewIfNeeded();
  await expect(extra).toBeVisible();
  if (p01.pet.about) await expect(profile).toContainText(p01.pet.about);
  if (p01.pet.story) await expect(profile).toContainText(p01.pet.story);
  if (p01.pet.specialCare) await expect(profile).toContainText(p01.pet.specialCare);
  await beat(page, 1000);
  await evid(page, 'HU-03', 'P-HU-03-03-informacion-adicional');

  // c4: what the profile shows matches what is stored, for the three seed pets
  for (const id of ['p01', 'p02', 'p03']) {
    const { pet } = await openFromList(id);
    await expect(profile).toContainText(`${speciesText(pet.species)} · ${pet.breed}`);
    await expect(profile).toContainText(ageText(pet.ageMonths));
    await expect(profile).toContainText(pet.district);
    await expect(profile).toContainText(pet.sex === 'macho' ? 'Macho' : 'Hembra');
    await expect(profile).toContainText({ S: 'Pequeño', M: 'Mediano', L: 'Grande' }[pet.size as 'S' | 'M' | 'L']);
    if (pet.about) await expect(profile).toContainText(pet.about);
    if (pet.story) await expect(profile).toContainText(pet.story);
    await beat(page, 800);
    await page.mouse.wheel(0, 700);
    await beat(page, 800);
    if (id === 'p02') await evid(page, 'HU-03', 'P-HU-03-04-datos-coinciden-p02');
  }

  // c5: a pet without optional information (p03) shows only what exists, with no errors
  const p03 = db.pets.find((p: any) => p.id === 'p03');
  expect(p03.story || p03.specialCare).toBeFalsy();
  await page.goto('./#/mascota/p03');
  await expect(profile.locator('h1')).toHaveText(p03.name);
  await expect(profile).not.toContainText(/undefined|NaN|null/);
  await expect(profile.getByText('Cuidados especiales')).toHaveCount(0);
  await expect(profile.getByText('Mi historia')).toHaveCount(0);
  await beat(page);
  await page.mouse.wheel(0, 700);
  await beat(page, 1000);
  await evid(page, 'HU-03', 'P-HU-03-05-sin-informacion-adicional');
});
