import { expect, test } from '@playwright/test';

const SHOTS = '../../Sprint_01/7.Pruebas/evidencias/HU-03';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./');
  await page.getByRole('button', { name: /Adoptante/ }).click();
});

async function openPet(page: import('@playwright/test').Page, id: string) {
  const db = await page.evaluate(() => JSON.parse(localStorage.getItem('kuyaypet-db') || '{}').state);
  const pet = db.pets.find((p: any) => p.id === id);
  await page.goto(`./#/mascota/${id}`);
  await expect(page.locator('[data-hu="HU-03"] h1')).toHaveText(pet.name);
  return pet;
}

const ageText = (m: number) => (m < 12 ? `${m} ${m === 1 ? 'mes' : 'meses'}` : `${Math.floor(m / 12)} ${Math.floor(m / 12) === 1 ? 'año' : 'años'}`);

test('HU-03 c2: el perfil muestra foto, nombre, especie, raza, edad y ubicación', async ({ page }) => {
  const pet = await openPet(page, 'p01');
  const profile = page.locator('[data-hu="HU-03"]');
  await expect(profile.locator('img').first()).toHaveAttribute('alt', new RegExp(`de ${pet.name}$`));
  await expect(profile.locator('img').first()).toHaveAttribute('src', pet.photos[0]);
  await expect(profile).toContainText(pet.species === 'perro' ? 'Perro' : 'Gato');
  await expect(profile).toContainText(pet.breed);
  await expect(profile).toContainText(ageText(pet.ageMonths));
  await expect(profile).toContainText(`${pet.district}, Lima`);
  await page.screenshot({ path: `${SHOTS}/despues-perfil-campos-basicos.png` });
});

test('HU-03 c3: el perfil muestra la información adicional registrada', async ({ page }) => {
  const pet = await openPet(page, 'p01');
  const profile = page.locator('[data-hu="HU-03"]');
  const extra = profile.getByRole('heading', { name: /Información adicional/ });
  await expect(extra).toBeVisible();
  if (pet.about) await expect(profile).toContainText(pet.about);
  if (pet.story) await expect(profile).toContainText(pet.story);
  if (pet.specialCare) await expect(profile).toContainText(pet.specialCare);
  if (pet.vaccinated) await expect(profile).toContainText('Vacunas al día');
  if (pet.goodWithKids) await expect(profile).toContainText('Se lleva bien con');
  expect(pet.about || pet.story || pet.specialCare || pet.vaccinated || pet.goodWithKids).toBeTruthy();
  await extra.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS}/despues-perfil-info-adicional.png` });
});

test('HU-03 c4: los datos del perfil coinciden con los registrados por el responsable', async ({ page }) => {
  for (const id of ['p01', 'p02', 'p03']) {
    const pet = await openPet(page, id);
    const profile = page.locator('[data-hu="HU-03"]');
    await expect(profile.locator('h1')).toHaveText(pet.name);
    await expect(profile).toContainText(`${pet.species === 'perro' ? 'Perro' : 'Gato'} · ${pet.breed}`);
    await expect(profile).toContainText(ageText(pet.ageMonths));
    await expect(profile).toContainText(pet.district);
    await expect(profile).toContainText(pet.sex === 'macho' ? 'Macho' : 'Hembra');
    await expect(profile).toContainText({ S: 'Pequeño', M: 'Mediano', L: 'Grande' }[pet.size as 'S' | 'M' | 'L']);
    if (pet.about) await expect(profile).toContainText(pet.about);
    if (pet.story) await expect(profile).toContainText(pet.story);
  }
});
