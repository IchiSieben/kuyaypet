// Generador determinista de datos semilla para KuyayPet (demo académica).
// Ejecutar con: npm run seed
// Referencia de fecha fija (NO usar Date.now()): 2026-09-25
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SEED_DIR = join(ROOT, 'src', 'data', 'seed');
mkdirSync(SEED_DIR, { recursive: true });

const REF_DATE = new Date('2026-09-25T12:00:00-05:00');

// ---------- PRNG determinista (mulberry32) ----------
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(2026);
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rnd() * arr.length)];
}
function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rnd() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}
function intBetween(min: number, max: number): number {
  return Math.floor(rnd() * (max - min + 1)) + min;
}
function chance(p: number): boolean {
  return rnd() < p;
}
function isoDaysAgo(days: number, hourOffset = 0): string {
  const d = new Date(REF_DATE.getTime() - days * 86400000 + hourOffset * 3600000);
  return d.toISOString();
}

// ---------- Distritos (copiados de src/data/districts.ts para no importar TS con paths alias) ----------
const DISTRICTS = [
  { name: 'Miraflores', lat: -12.1211, lng: -77.0297 },
  { name: 'San Isidro', lat: -12.0977, lng: -77.0365 },
  { name: 'Barranco', lat: -12.1498, lng: -77.0213 },
  { name: 'Santiago de Surco', lat: -12.1459, lng: -76.9918 },
  { name: 'San Borja', lat: -12.1077, lng: -76.999 },
  { name: 'La Molina', lat: -12.0864, lng: -76.9366 },
  { name: 'Jesús María', lat: -12.0776, lng: -77.0492 },
  { name: 'Lince', lat: -12.0845, lng: -77.0351 },
  { name: 'Magdalena del Mar', lat: -12.0911, lng: -77.0703 },
  { name: 'Pueblo Libre', lat: -12.0746, lng: -77.0633 },
  { name: 'San Miguel', lat: -12.0776, lng: -77.0903 },
  { name: 'Chorrillos', lat: -12.1686, lng: -77.0158 },
  { name: 'San Martín de Porres', lat: -12.0292, lng: -77.055 },
  { name: 'Los Olivos', lat: -11.9918, lng: -77.0706 },
  { name: 'Callao', lat: -12.0566, lng: -77.1181 },
  { name: 'Ate', lat: -12.0266, lng: -76.9186 },
  { name: 'Surquillo', lat: -12.1136, lng: -77.0122 },
  { name: 'Cercado de Lima', lat: -12.0464, lng: -77.0428 },
  { name: 'San Juan de Miraflores', lat: -12.1569, lng: -76.9722 },
  { name: 'Comas', lat: -11.9331, lng: -77.046 },
];
function jitteredLocation(d: { lat: number; lng: number }) {
  return { lat: d.lat + (rnd() * 2 - 1) * 0.008, lng: d.lng + (rnd() * 2 - 1) * 0.008 };
}

// ---------- Razas ----------
type DogBreed = { name: string; path: string; size: 'S' | 'M' | 'L'; energy: number; hypo?: boolean };
const DOG_BREEDS: DogBreed[] = [
  { name: 'Labrador', path: 'labrador', size: 'L', energy: 4 },
  { name: 'Golden Retriever', path: 'retriever/golden', size: 'L', energy: 4 },
  { name: 'Beagle', path: 'beagle', size: 'M', energy: 4 },
  { name: 'Husky Siberiano', path: 'husky', size: 'L', energy: 5 },
  { name: 'Pug', path: 'pug', size: 'S', energy: 2 },
  { name: 'Shih Tzu', path: 'shihtzu', size: 'S', energy: 2, hypo: true },
  { name: 'Schnauzer', path: 'schnauzer/miniature', size: 'S', energy: 3, hypo: true },
  { name: 'Poodle', path: 'poodle/toy', size: 'S', energy: 3, hypo: true },
  { name: 'Chihuahua', path: 'chihuahua', size: 'S', energy: 3 },
  { name: 'Dachshund', path: 'dachshund', size: 'S', energy: 3 },
  { name: 'Border Collie', path: 'collie/border', size: 'M', energy: 5 },
  { name: 'Pastor Alemán', path: 'germanshepherd', size: 'L', energy: 4 },
  { name: 'Boxer', path: 'boxer', size: 'L', energy: 4 },
  { name: 'Cocker Spaniel', path: 'spaniel/cocker', size: 'M', energy: 3 },
  { name: 'Pitbull', path: 'pitbull', size: 'L', energy: 4 },
  { name: 'Maltés', path: 'maltese', size: 'S', energy: 2, hypo: true },
  { name: 'Pomerania', path: 'pomeranian', size: 'S', energy: 3 },
  { name: 'Bulldog Francés', path: 'bulldog/french', size: 'S', energy: 2 },
];
const MESTIZO_DOG: DogBreed = { name: 'Mestizo', path: 'mix', size: 'M', energy: 3 };

type CatBreed = { name: string; id?: string; hypo?: boolean };
const CAT_BREEDS: CatBreed[] = [
  { name: 'Siamés', id: 'siam' },
  { name: 'Persa', id: 'pers' },
  { name: 'Angora', id: 'tang' },
  { name: 'Bengalí', id: 'beng', hypo: true },
  { name: 'Azul Ruso', id: 'rblu', hypo: true },
];
const MESTIZO_CAT: CatBreed = { name: 'Mestizo (doméstico pelo corto)' };

const DOG_NAMES = [
  'Porotopo', 'Max', 'Toby', 'Rocky', 'Simón', 'Frijolito', 'Chocolate', 'Capitán',
  'Firulais', 'Bruno', 'Zeus', 'Lucas', 'Otto', 'Nube', 'Coco', 'Tarzán',
  'Beto', 'Rufo', 'Sultán', 'Milo', 'Duque', 'Bongo', 'Django', 'Pancho',
  'Trueno', 'Wasabi', 'Gordo', 'Tyson',
];
const CAT_NAMES = [
  'Luna', 'Mishi', 'Chispita', 'Nala', 'Kira', 'Pelusa', 'Tomasa', 'Canela',
  'Michi', 'Salem', 'Nube Gris', 'Mostaza',
];

const PERSONALITY_M = ['Cariñoso', 'Juguetón', 'Tranquilo', 'Guardián', 'Curioso', 'Dormilón', 'Sociable'];
const PERSONALITY_F = ['Cariñosa', 'Juguetona', 'Tranquila', 'Guardiana', 'Curiosa', 'Dormilona', 'Sociable'];

function personalityFor(sex: 'macho' | 'hembra') {
  const list = sex === 'macho' ? PERSONALITY_M : PERSONALITY_F;
  return pickN(list, intBetween(3, 4));
}

const DOG_ABOUT = [
  'Me encanta correr en el parque y saludar a todos los que pasan. Busco una familia activa que quiera aventuras conmigo.',
  'Soy tranquilo en casa pero me pongo feliz con mi pelota favorita. Aprendo rápido y obedezco bien.',
  'Me gusta dormir la siesta al sol y recibir mimos. Soy bueno con niños y otras mascotas.',
  'Soy curioso y explorador, siempre quiero oler todo lo nuevo. Necesito paciencia al inicio pero doy mucho cariño.',
  'Soy protector con mi familia y muy leal. Me adapto bien a departamentos si salgo a pasear seguido.',
];
const CAT_ABOUT = [
  'Me gusta observar por la ventana y dormir largas horas. Soy independiente pero busco caricias por las noches.',
  'Soy juguetona con los hilos y curiosa con las cajas. Me llevo bien con otros gatos.',
  'Soy tranquila y silenciosa, ideal para departamentos pequeños. Disfruto de un rayito de sol.',
  'Me encanta trepar y jugar, tengo mucha energía en las mañanas. Ronroneo fuerte cuando estoy contenta.',
];
const STORIES = [
  'Me encontraron abandonado cerca de un mercado cuando era cachorro; un vecino me llevó al albergue.',
  'Llegué al refugio tras el fallecimiento de mi anterior familia, que me cuidó muchos años.',
  'Me rescataron de la calle en temporada de lluvias, estaba muy delgado pero ya me recuperé.',
  'Fui entregado por mi familia anterior porque se mudaron fuera del país.',
];
const SPECIAL_CARE = [
  'Necesito gotas oculares una vez al día por una alergia leve.',
  'Estoy en tratamiento para la piel, requiere shampoo especial cada semana.',
  'Soy mayor y necesito una dieta blanda para mis dientes.',
  'Tengo una pata delantera más débil, nada grave, solo evitar saltos altos.',
];

// ---------- Owners ----------
const SHELTER_NAMES = [
  'Albergue Patitas del Sur', 'Refugio Huellitas Felices', 'Casa Hogar Colita Feliz',
  'Refugio San Francisco de Asís Perú', 'Albergue Amigos de Cuatro Patas',
];
const OWNER_PERSON_NAMES: Array<{ name: string; gender: 'M' | 'F' }> = [
  { name: 'Rosa Quispe', gender: 'F' },
  { name: 'Jorge Ramírez', gender: 'M' },
  { name: 'Milagros Flores', gender: 'F' },
  { name: 'Carlos Huamán', gender: 'M' },
  { name: 'Patricia Salazar', gender: 'F' },
  { name: 'Renzo Delgado', gender: 'M' },
  { name: 'Ana Vargas', gender: 'F' },
];
const ADOPTER_NAMES: Array<{ name: string; gender: 'M' | 'F' }> = [
  { name: 'Valeria Torres', gender: 'F' },
  { name: 'Diego Alvarado', gender: 'M' },
  { name: 'Fiorella Castro', gender: 'F' },
  { name: 'Sebastián Rojas', gender: 'M' },
  { name: 'Camila Mendoza', gender: 'F' },
  { name: 'Andrés Paredes', gender: 'M' },
  { name: 'Gabriela Ríos', gender: 'F' },
  { name: 'Martín Chávez', gender: 'M' },
];

type ImageManifestEntry = {
  path: string; // relative public path e.g. img/pets/p01-1.webp
  kind: 'pet-dog' | 'pet-cat' | 'person';
  breedPath?: string;
  catBreedId?: string;
  gender?: 'M' | 'F';
  index?: number;
};
const imageManifest: ImageManifestEntry[] = [];

// ---------- USERS ----------
const users: any[] = [];
users.push({
  id: 'u-admin',
  role: 'admin',
  name: 'Admin KuyayPet',
  email: 'admin@kuyaypet.pe',
  password: 'kuyay2026',
  avatar: 'img/people/u-admin.webp',
  active: true,
  createdAt: isoDaysAgo(200),
  provider: 'email',
});
imageManifest.push({ path: 'img/people/u-admin.webp', kind: 'person', gender: 'M', index: 32 });

const ownerIds: string[] = [];
const OWNER_COUNT = 12;
for (let i = 0; i < OWNER_COUNT; i++) {
  const isDemo = i === 0;
  const id = isDemo ? 'u-owner-demo' : `u-owner-${String(i + 1).padStart(2, '0')}`;
  ownerIds.push(id);
  const isAlbergue = !isDemo && chance(0.4);
  const district = pick(DISTRICTS).name;
  let name: string;
  let gender: 'M' | 'F' = 'F';
  if (isDemo) {
    name = 'Rosa Quispe';
    gender = 'F';
  } else if (isAlbergue) {
    name = SHELTER_NAMES[(i - 1) % SHELTER_NAMES.length];
  } else {
    const p = OWNER_PERSON_NAMES[i % OWNER_PERSON_NAMES.length];
    name = p.name;
    gender = p.gender;
  }
  const genderIdx = intBetween(1, 90);
  users.push({
    id,
    role: 'owner',
    name,
    email: isDemo ? 'responsable@kuyaypet.pe' : `${name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/g, '.')}@kuyaypet.pe`,
    password: 'kuyay2026',
    avatar: `img/people/${id}.webp`,
    phone: `9${intBetween(10000000, 99999999)}`,
    district,
    bio: isAlbergue
      ? 'Refugio sin fines de lucro dedicado al rescate y adopción responsable de mascotas en Lima.'
      : 'Amante de los animales, dedico tiempo a rescatar y encontrar hogares responsables.',
    active: true,
    createdAt: isoDaysAgo(intBetween(60, 400)),
    provider: 'email',
    kind: isAlbergue ? 'albergue' : 'persona',
    autoAcceptProbability: Number((0.3 + rnd() * 0.6).toFixed(2)),
  });
  if (!isAlbergue) {
    imageManifest.push({ path: `img/people/${id}.webp`, kind: 'person', gender, index: genderIdx });
  }
}

const adopterIds: string[] = [];
const ADOPTER_COUNT = 8;
for (let i = 0; i < ADOPTER_COUNT; i++) {
  const isDemo = i === 0;
  const id = isDemo ? 'u-adopter-demo' : `u-adopter-${String(i + 1).padStart(2, '0')}`;
  adopterIds.push(id);
  const person = isDemo ? { name: 'Valeria Torres', gender: 'F' as const } : ADOPTER_NAMES[i % ADOPTER_NAMES.length];
  const district = isDemo ? 'Miraflores' : pick(DISTRICTS).name;
  const genderIdx = intBetween(1, 90);
  const hasProfile = isDemo || chance(0.75);
  const profile = hasProfile
    ? isDemo
      ? {
          district: 'Miraflores',
          location: jitteredLocation(DISTRICTS.find((d) => d.name === 'Miraflores')!),
          radiusKm: 10,
          housing: 'departamento',
          homeSize: 'mediana',
          hoursAlone: '3-5',
          activity: 'moderado',
          experience: 'he_tenido',
          kids: 'no',
          otherPets: 'ninguna',
          allergies: false,
          prefs: { species: [], sizes: [], ages: [], sex: 'cualquiera' },
        }
      : {
          district,
          location: jitteredLocation(DISTRICTS.find((d) => d.name === district)!),
          radiusKm: intBetween(3, 20),
          housing: pick(['departamento', 'casa_sin_patio', 'casa_con_patio']),
          homeSize: pick(['pequena', 'mediana', 'grande']),
          hoursAlone: pick(['0-2', '3-5', '6-8', '8+']),
          activity: pick(['sedentario', 'moderado', 'muy_activo']),
          experience: pick(['primera', 'he_tenido', 'experto']),
          kids: pick(['no', 'mayores_6', 'pequenos']),
          otherPets: pick(['ninguna', 'perro', 'gato', 'ambos']),
          allergies: chance(0.15),
          prefs: {
            species: chance(0.3) ? [pick(['perro', 'gato'])] : [],
            sizes: chance(0.3) ? pickN(['S', 'M', 'L'], intBetween(1, 2)) : [],
            ages: chance(0.3) ? pickN(['cachorro', 'joven', 'adulto', 'senior'], intBetween(1, 2)) : [],
            sex: chance(0.2) ? pick(['macho', 'hembra']) : 'cualquiera',
          },
        }
    : undefined;
  const isDeactivated = i === ADOPTER_COUNT - 1;
  users.push({
    id,
    role: 'adopter',
    name: person.name,
    email: isDemo ? 'adoptante@kuyaypet.pe' : `${person.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/g, '.')}@kuyaypet.pe`,
    password: 'kuyay2026',
    avatar: `img/people/${id}.webp`,
    district,
    active: !isDeactivated,
    createdAt: isoDaysAgo(intBetween(10, 300)),
    provider: 'email',
    profile,
  });
  imageManifest.push({ path: `img/people/${id}.webp`, kind: 'person', gender: person.gender, index: genderIdx });
}

// ---------- PETS ----------
const pets: any[] = [];
const DOG_COUNT = 28;
const CAT_COUNT = 12;
const MESTIZO_DOG_TARGET = 8;
let mestizoDogsUsed = 0;
let dogNameIdx = 0;
let catNameIdx = 0;

function petIdOf(n: number) {
  return `p${String(n).padStart(2, '0')}`;
}

let petNum = 1;
const petOwnerAssignment: Record<string, string> = {};

// Reserve Porotopo and Luna for u-owner-demo (Rosa Quispe)
for (let i = 0; i < DOG_COUNT; i++) {
  const id = petIdOf(petNum++);
  const useMestizo = mestizoDogsUsed < MESTIZO_DOG_TARGET && (chance(0.3) || DOG_COUNT - i <= MESTIZO_DOG_TARGET - mestizoDogsUsed);
  const breed = useMestizo ? MESTIZO_DOG : pick(DOG_BREEDS);
  if (useMestizo) mestizoDogsUsed++;
  const sex: 'macho' | 'hembra' = chance(0.5) ? 'macho' : 'hembra';
  const name = dogNameIdx === 0 ? 'Porotopo' : DOG_NAMES[dogNameIdx % DOG_NAMES.length];
  dogNameIdx++;
  const district = pick(DISTRICTS);
  const ageMonths = intBetween(2, 120);
  const isLarge = breed.size === 'L';
  pets.push(buildPet({
    id,
    name,
    species: 'perro',
    breed: breed.name,
    breedPath: breed.path,
    ageMonths,
    size: breed.size,
    sex,
    energy: Math.min(5, Math.max(1, breed.energy + intBetween(-1, 1))),
    hypoallergenic: !!breed.hypo,
    needsYard: isLarge && breed.energy >= 4,
    district,
    aboutPool: DOG_ABOUT,
  }));
}
for (let i = 0; i < CAT_COUNT; i++) {
  const id = petIdOf(petNum++);
  const useMestizo = chance(0.6);
  const breed = useMestizo ? MESTIZO_CAT : pick(CAT_BREEDS);
  const sex: 'macho' | 'hembra' = chance(0.5) ? 'macho' : 'hembra';
  const name = catNameIdx === 0 ? 'Luna' : CAT_NAMES[catNameIdx % CAT_NAMES.length];
  catNameIdx++;
  const district = pick(DISTRICTS);
  const ageMonths = intBetween(2, 120);
  pets.push(buildPet({
    id,
    name,
    species: 'gato',
    breed: breed.name,
    catBreedId: breed.id,
    ageMonths,
    size: 'S',
    sex,
    energy: intBetween(1, 5),
    hypoallergenic: !!breed.hypo,
    needsYard: false,
    district,
    aboutPool: CAT_ABOUT,
  }));
}

function buildPet(opts: {
  id: string; name: string; species: 'perro' | 'gato'; breed: string; breedPath?: string; catBreedId?: string;
  ageMonths: number; size: 'S' | 'M' | 'L'; sex: 'macho' | 'hembra'; energy: number; hypoallergenic: boolean;
  needsYard: boolean; district: { name: string; lat: number; lng: number }; aboutPool: string[];
}) {
  const nPhotos = intBetween(2, 3);
  const photos: string[] = [];
  for (let p = 1; p <= nPhotos; p++) {
    const path = `img/pets/${opts.id}-${p}.webp`;
    photos.push(path);
    imageManifest.push({
      path,
      kind: opts.species === 'perro' ? 'pet-dog' : 'pet-cat',
      breedPath: opts.breedPath,
      catBreedId: opts.catBreedId,
    });
  }
  const hasStory = chance(0.7);
  const hasSpecialCare = chance(0.2);
  return {
    id: opts.id,
    ownerId: '', // asignado luego
    name: opts.name,
    species: opts.species,
    breed: opts.breed,
    ageMonths: opts.ageMonths,
    size: opts.size,
    sex: opts.sex,
    energy: opts.energy,
    goodWithKids: chance(0.75),
    goodWithDogs: chance(0.7),
    goodWithCats: chance(0.55),
    needsYard: opts.needsYard,
    aloneTolerance: opts.species === 'gato' ? intBetween(3, 5) : intBetween(1, 4),
    firstTimerFriendly: chance(0.6),
    hypoallergenic: opts.hypoallergenic,
    sterilized: chance(0.85),
    vaccinated: chance(0.9),
    dewormed: chance(0.92),
    district: opts.district.name,
    location: jitteredLocation(opts.district),
    personality: personalityFor(opts.sex),
    about: `${pick(opts.aboutPool)}`,
    story: hasStory ? pick(STORIES) : undefined,
    specialCare: hasSpecialCare ? pick(SPECIAL_CARE) : undefined,
    photos,
    status: 'disponible',
    approval: 'aprobada',
    createdAt: isoDaysAgo(intBetween(1, 250)),
  };
}

// Assign owners: Porotopo (p01) and Luna (p29) + 3 more to u-owner-demo
const porotopo = pets.find((p) => p.name === 'Porotopo')!;
const luna = pets.find((p) => p.name === 'Luna')!;
porotopo.ownerId = 'u-owner-demo';
luna.ownerId = 'u-owner-demo';
const remainingPets = pets.filter((p) => p.id !== porotopo.id && p.id !== luna.id);
const extraForDemo = pickN(remainingPets, 3);
extraForDemo.forEach((p) => (p.ownerId = 'u-owner-demo'));
const stillUnassigned = pets.filter((p) => !p.ownerId);
stillUnassigned.forEach((p) => {
  p.ownerId = pick(ownerIds.filter((o) => o !== 'u-owner-demo'));
});

// Approval / status distribution: p37, p38 pendiente; p39 rechazada; one of demo's 5 pending
const p37 = pets.find((p) => p.id === 'p37')!;
const p38 = pets.find((p) => p.id === 'p38')!;
const p39 = pets.find((p) => p.id === 'p39')!;
p37.approval = 'pendiente';
p38.approval = 'pendiente';
p39.approval = 'rechazada';
p39.status = 'disponible';
p39.rejectionReason = 'La foto no corresponde a la mascota descrita. Por favor sube imágenes reales y actualizadas.';
// tie one of demo's 5 pets to p37 pending, per instructions
p37.ownerId = 'u-owner-demo';
// remove p37 from whichever list it was in already fine, ensure not double counted as one of extraForDemo list conceptually
// Additional statuses among approved 36
const approvedPets = pets.filter((p) => p.approval === 'aprobada');
const adoptadaPets = pickN(approvedPets, 2);
adoptadaPets.forEach((p) => (p.status = 'adoptada'));
const retiradaCandidates = approvedPets.filter((p) => !adoptadaPets.includes(p));
const retiradaPet = pick(retiradaCandidates);
retiradaPet.status = 'retirada';

// ---------- INTERACTIONS ----------
const interactions: any[] = [];
let interId = 1;
function nextInterId() {
  return `int-${String(interId++).padStart(3, '0')}`;
}
const demoDisliked = pickN(pets.filter((p) => p.id !== porotopo.id && p.id !== luna.id), 2);
const demoLiked = pickN(pets.filter((p) => !demoDisliked.includes(p)), 2);
demoDisliked.forEach((p) =>
  interactions.push({ id: nextInterId(), adopterId: 'u-adopter-demo', petId: p.id, kind: 'dislike', createdAt: isoDaysAgo(intBetween(3, 20)) }),
);
demoLiked.forEach((p) =>
  interactions.push({ id: nextInterId(), adopterId: 'u-adopter-demo', petId: p.id, kind: 'like', createdAt: isoDaysAgo(intBetween(3, 20)) }),
);
for (const adopterId of adopterIds.filter((a) => a !== 'u-adopter-demo')) {
  const n = intBetween(2, 5);
  const chosen = pickN(pets, n);
  chosen.forEach((p) => {
    interactions.push({
      id: nextInterId(),
      adopterId,
      petId: p.id,
      kind: chance(0.7) ? 'like' : 'dislike',
      createdAt: isoDaysAgo(intBetween(1, 25)),
    });
  });
}

// ---------- INTERESTS + MATCHES ----------
const interests: any[] = [];
const matches: any[] = [];
let interestId = 1;
let matchId = 1;

// Demo adopter has 2 matches on 2 of her liked pets (not owned by herself)
const demoMatchPets = pickN(demoLiked, Math.min(2, demoLiked.length));
demoMatchPets.forEach((p) => {
  const interest = {
    id: `is-${String(interestId++).padStart(3, '0')}`,
    adopterId: 'u-adopter-demo',
    petId: p.id,
    ownerId: p.ownerId,
    status: 'aceptado',
    super: false,
    score: intBetween(70, 95),
    createdAt: isoDaysAgo(intBetween(10, 20)),
    answeredAt: isoDaysAgo(intBetween(5, 9)),
  };
  interests.push(interest);
  matches.push({
    id: `m-${String(matchId++).padStart(3, '0')}`,
    adopterId: 'u-adopter-demo',
    petId: p.id,
    ownerId: p.ownerId,
    score: interest.score,
    createdAt: interest.answeredAt,
    seen: chance(0.5),
  });
});

// Other adopters -> interests pointing to u-owner-demo pets (pendiente / aceptado)
const demoOwnerPets = pets.filter((p) => p.ownerId === 'u-owner-demo');
for (const p of demoOwnerPets) {
  if (chance(0.6)) {
    const adopterId = pick(adopterIds.filter((a) => a !== 'u-adopter-demo'));
    interests.push({
      id: `is-${String(interestId++).padStart(3, '0')}`,
      adopterId,
      petId: p.id,
      ownerId: 'u-owner-demo',
      status: chance(0.5) ? 'pendiente' : 'aceptado',
      super: chance(0.2),
      score: intBetween(55, 90),
      createdAt: isoDaysAgo(intBetween(1, 15)),
    });
  }
}

// Scatter a few more interests/matches elsewhere in the graph for richness
for (let i = 0; i < 6; i++) {
  const adopterId = pick(adopterIds.filter((a) => a !== 'u-adopter-demo'));
  const pet = pick(pets.filter((p) => p.ownerId !== 'u-owner-demo' && p.status === 'disponible'));
  interests.push({
    id: `is-${String(interestId++).padStart(3, '0')}`,
    adopterId,
    petId: pet.id,
    ownerId: pet.ownerId,
    status: pick(['pendiente', 'aceptado', 'rechazado']),
    super: chance(0.15),
    score: intBetween(50, 95),
    createdAt: isoDaysAgo(intBetween(1, 25)),
  });
}

// ---------- THREADS + MESSAGES ----------
const threads: any[] = [];
const messages: any[] = [];
let threadId = 1;
let msgId = 1;

const DEMO_MESSAGES_TEMPLATES = [
  ['Hola, vi que aceptaste mi interés. ¿Podemos coordinar una visita?', 'owner'],
  ['¡Hola! Claro que sí, ¿qué día te acomoda?', 'adopter'],
  ['¿Este sábado en la tarde estaría bien?', 'owner'],
  ['Perfecto, ahí estaré. ¿Me confirmas la dirección?', 'adopter'],
  ['Te la envío por aquí apenas coordinemos la hora exacta.', 'owner'],
];

demoMatchPets.forEach((p) => {
  const tId = `t-${String(threadId++).padStart(3, '0')}`;
  threads.push({
    id: tId,
    kind: 'direct',
    petId: p.id,
    memberIds: ['u-adopter-demo', p.ownerId],
    createdAt: isoDaysAgo(intBetween(5, 9)),
    lastReadAt: { 'u-adopter-demo': isoDaysAgo(1), [p.ownerId]: isoDaysAgo(2) },
  });
  const n = intBetween(3, 6);
  for (let i = 0; i < n; i++) {
    const [text, from] = DEMO_MESSAGES_TEMPLATES[i % DEMO_MESSAGES_TEMPLATES.length];
    messages.push({
      id: `msg-${String(msgId++).padStart(4, '0')}`,
      threadId: tId,
      senderId: from === 'owner' ? p.ownerId : 'u-adopter-demo',
      text,
      createdAt: isoDaysAgo(8 - i, i),
    });
  }
});

// group thread about Porotopo
const groupMembers = pickN(adopterIds.filter((a) => a !== 'u-adopter-demo'), 2).concat(['u-adopter-demo']);
const gId = `t-${String(threadId++).padStart(3, '0')}`;
threads.push({
  id: gId,
  kind: 'group',
  petId: porotopo.id,
  memberIds: [...groupMembers, porotopo.ownerId],
  createdAt: isoDaysAgo(6),
  lastReadAt: Object.fromEntries([...groupMembers, porotopo.ownerId].map((m) => [m, isoDaysAgo(intBetween(0, 3))])),
});
const groupTexts = [
  'Hola a todos, vi la publicación de Porotopo, ¡qué lindo perrito!',
  '¡Sí! Yo también estoy interesada, ¿alguien ya coordinó visita?',
  'Yo escribí a la responsable, dice que está disponible este finde.',
  'Genial, ojalá se pueda hacer una visita grupal.',
  'Les cuento cómo me va, ¡gracias por el dato!',
];
groupTexts.forEach((text, i) => {
  messages.push({
    id: `msg-${String(msgId++).padStart(4, '0')}`,
    threadId: gId,
    senderId: i % 2 === 0 ? groupMembers[i % groupMembers.length] : 'u-adopter-demo',
    text,
    createdAt: isoDaysAgo(6 - i, i),
  });
});

// ---------- ADOPTIONS ----------
const adoptions: any[] = [];
const pendingAdoptionPet = demoOwnerPets.find((p) => p.status === 'disponible' && p.approval === 'aprobada') ?? demoOwnerPets[0];
adoptions.push({
  id: 'ad-001',
  adopterId: pick(adopterIds.filter((a) => a !== 'u-adopter-demo')),
  petId: pendingAdoptionPet.id,
  ownerId: 'u-owner-demo',
  date: '2026-10-02',
  time: '16:00',
  place: 'Parque Kennedy, Miraflores',
  message: 'Hola, me encantaría conocer a la mascota y coordinar la adopción.',
  status: 'pendiente',
  createdAt: isoDaysAgo(2),
});
const acceptedElsewherePet = pick(pets.filter((p) => p.ownerId !== 'u-owner-demo'));
adoptions.push({
  id: 'ad-002',
  adopterId: 'u-adopter-demo',
  petId: acceptedElsewherePet.id,
  ownerId: acceptedElsewherePet.ownerId,
  date: '2026-09-18',
  time: '11:00',
  place: 'Parque Reducto N°2, Miraflores',
  message: 'Quedamos en vernos para conocer al perrito.',
  status: 'aceptada',
  createdAt: isoDaysAgo(12),
});

// ---------- NOTIFICATIONS ----------
const notifications: any[] = [];
let notifId = 1;
function pushNotif(n: any) {
  notifications.push({ id: `notif-${String(notifId++).padStart(3, '0')}`, ...n });
}
pushNotif({ userId: 'u-owner-demo', kind: 'interes', title: 'Nuevo interés', body: 'Alguien mostró interés en uno de tus peluditos.', read: false, createdAt: isoDaysAgo(1) });
pushNotif({ userId: 'u-owner-demo', kind: 'solicitud', title: 'Solicitud de adopción', body: 'Tienes una solicitud pendiente de revisar.', read: false, createdAt: isoDaysAgo(2) });
pushNotif({ userId: 'u-owner-demo', kind: 'interes', title: 'Nuevo interés', body: 'Recibiste un nuevo interés en tu publicación.', read: true, createdAt: isoDaysAgo(5) });
pushNotif({ userId: 'u-adopter-demo', kind: 'match', title: '¡Tienes un nuevo Match!', body: 'Hiciste match con una mascota. ¡Escríbele!', read: false, createdAt: isoDaysAgo(8) });
pushNotif({ userId: 'u-adopter-demo', kind: 'mensaje', title: 'Nuevo mensaje', body: 'Tienes un mensaje sin leer en tus chats.', read: false, createdAt: isoDaysAgo(1) });
pushNotif({ userId: 'u-admin', kind: 'publicacion', title: 'Publicaciones por revisar', body: 'Hay mascotas nuevas esperando aprobación.', read: false, createdAt: isoDaysAgo(1) });

// ---------- REPORTS ----------
const reports: any[] = [];
let reportId = 1;
function pushReport(r: any) {
  reports.push({ id: `rep-${String(reportId++).padStart(3, '0')}`, ...r });
}
pushReport({ reporterId: adopterIds[1], targetType: 'mascota', targetId: pick(pets).id, reason: 'Publicación sospechosa', detail: 'La publicación pide dinero por adelantado, algo inusual para una adopción.', status: 'abierto', createdAt: isoDaysAgo(4) });
pushReport({ reporterId: adopterIds[2], targetType: 'mensaje', targetId: messages[0]?.id ?? 'msg-0001', reason: 'Mensaje ofensivo', detail: 'El responsable me respondió de forma grosera en el chat.', status: 'abierto', createdAt: isoDaysAgo(6) });
pushReport({ reporterId: adopterIds[3], targetType: 'usuario', targetId: ownerIds[2], reason: 'Perfil falso', detail: 'El usuario parece tener datos inventados y fotos repetidas.', status: 'abierto', createdAt: isoDaysAgo(9) });
pushReport({ reporterId: adopterIds[4], targetType: 'mascota', targetId: pick(pets).id, reason: 'Spam', detail: 'La misma publicación aparece repetida varias veces.', status: 'abierto', createdAt: isoDaysAgo(3) });
pushReport({ reporterId: adopterIds[5], targetType: 'mascota', targetId: pick(pets).id, reason: 'Información incorrecta', detail: 'La edad de la mascota no coincide con la foto.', status: 'resuelto', createdAt: isoDaysAgo(20), resolution: 'Se contactó al responsable y se corrigió la publicación.' });

// ---------- FAVORITES ----------
const favorites: any[] = [];
const adoptadaFav = adoptadaPets[0];
const otherFavs = pickN(pets.filter((p) => p.id !== adoptadaFav.id), 2);
[adoptadaFav, ...otherFavs].forEach((p) => {
  favorites.push({ adopterId: 'u-adopter-demo', petId: p.id, createdAt: isoDaysAgo(intBetween(2, 15)) });
});

// ---------- WRITE FILES ----------
function writeJSON(name: string, data: unknown) {
  writeFileSync(join(SEED_DIR, `${name}.json`), JSON.stringify(data, null, 2) + '\n', 'utf-8');
}
writeJSON('users', users);
writeJSON('pets', pets.map(({ /* strip helper-only fields */ ...p }) => p));
writeJSON('interactions', interactions);
writeJSON('interests', interests);
writeJSON('matches', matches);
writeJSON('threads', threads);
writeJSON('messages', messages);
writeJSON('adoptions', adoptions);
writeJSON('notifications', notifications);
writeJSON('reports', reports);
writeJSON('favorites', favorites);

const indexTs = `// Generado por scripts/seed.ts — no editar a mano.
import type { SeedData } from '@/types';
import users from './users.json';
import pets from './pets.json';
import interactions from './interactions.json';
import interests from './interests.json';
import matches from './matches.json';
import threads from './threads.json';
import messages from './messages.json';
import adoptions from './adoptions.json';
import notifications from './notifications.json';
import reports from './reports.json';
import favorites from './favorites.json';

export const SEED: SeedData = {
  users,
  pets,
  interactions,
  interests,
  matches,
  threads,
  messages,
  adoptions,
  notifications,
  reports,
  favorites,
} as unknown as SeedData;
`;
writeFileSync(join(SEED_DIR, 'index.ts'), indexTs, 'utf-8');

writeFileSync(join(ROOT, 'scripts', 'image-manifest.json'), JSON.stringify(imageManifest, null, 2) + '\n', 'utf-8');

console.log(`Seed generado: ${users.length} usuarios, ${pets.length} mascotas, ${imageManifest.length} imágenes en el manifiesto.`);
