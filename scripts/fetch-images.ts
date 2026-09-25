// Descarga imágenes reales para el seed de KuyayPet, según scripts/image-manifest.json.
// Ejecutar con: npm run images (después de npm run seed)
// Idempotente: si el archivo de salida ya existe, se omite.
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MANIFEST_PATH = join(ROOT, 'scripts', 'image-manifest.json');
const PUBLIC_DIR = join(ROOT, 'public');

type ImageManifestEntry = {
  path: string;
  kind: 'pet-dog' | 'pet-cat' | 'person';
  breedPath?: string;
  catBreedId?: string;
  gender?: 'M' | 'F';
  index?: number;
};

const manifest: ImageManifestEntry[] = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));

const CONCURRENCY = 6;
const RETRIES = 3;
const TIMEOUT_MS = 10000;

type CreditRow = { file: string; url: string; provider: string };
const credits: CreditRow[] = [];

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

async function withRetries<T>(fn: () => Promise<T>, retries: number): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

async function resolveDogUrl(breedPath?: string): Promise<string> {
  const primary = breedPath ? `https://dog.ceo/api/breed/${breedPath}/images/random` : 'https://dog.ceo/api/breeds/image/random';
  try {
    const res = await withRetries(() => fetchWithTimeout(primary, TIMEOUT_MS), RETRIES);
    if (res.ok) {
      const data: any = await res.json();
      if (data?.status === 'success' && data?.message) return data.message as string;
    }
  } catch {
    // fall through to fallback
  }
  const res = await withRetries(() => fetchWithTimeout('https://dog.ceo/api/breeds/image/random', TIMEOUT_MS), RETRIES);
  const data: any = await res.json();
  return data.message as string;
}

async function resolveCatUrl(breedId: string | undefined, usedUrls: Set<string>): Promise<string> {
  const primary = breedId
    ? `https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}`
    : 'https://api.thecatapi.com/v1/images/search';
  try {
    const res = await withRetries(() => fetchWithTimeout(primary, TIMEOUT_MS), RETRIES);
    if (res.ok) {
      const data: any = await res.json();
      const url = data?.[0]?.url as string | undefined;
      if (url && !usedUrls.has(url)) return url;
    }
  } catch {
    // fall through
  }
  const res = await withRetries(() => fetchWithTimeout('https://api.thecatapi.com/v1/images/search', TIMEOUT_MS), RETRIES);
  const data: any = await res.json();
  return data[0].url as string;
}

function personUrl(gender: 'M' | 'F' | undefined, index: number | undefined): string {
  const folder = gender === 'M' ? 'men' : 'women';
  const n = ((index ?? 1) % 99) || 1;
  return `https://randomuser.me/api/portraits/${folder}/${n}.jpg`;
}

async function downloadAndProcess(url: string, outPath: string, maxWidth: number, quality: number): Promise<void> {
  const res = await withRetries(async () => {
    const r = await fetchWithTimeout(url, TIMEOUT_MS);
    if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
    return r;
  }, RETRIES);
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(dirname(outPath), { recursive: true });
  await sharp(buf).resize({ width: maxWidth, withoutEnlargement: true }).webp({ quality }).toFile(outPath);
}

const petUsedUrls = new Map<string, Set<string>>(); // per-pet dedupe for cat photos (keyed by prefix before -N)

async function processEntry(entry: ImageManifestEntry): Promise<{ ok: boolean; entry: ImageManifestEntry }> {
  const outPath = join(PUBLIC_DIR, entry.path);
  if (existsSync(outPath)) {
    return { ok: true, entry };
  }
  try {
    if (entry.kind === 'pet-dog') {
      const url = await resolveDogUrl(entry.breedPath);
      await downloadAndProcess(url, outPath, 600, 72);
      credits.push({ file: `public/${entry.path}`, url, provider: 'Dog CEO API / Stanford Dogs Dataset' });
    } else if (entry.kind === 'pet-cat') {
      const petKey = entry.path.replace(/-\d+\.webp$/, '');
      if (!petUsedUrls.has(petKey)) petUsedUrls.set(petKey, new Set());
      const used = petUsedUrls.get(petKey)!;
      const url = await resolveCatUrl(entry.catBreedId, used);
      used.add(url);
      await downloadAndProcess(url, outPath, 600, 72);
      credits.push({ file: `public/${entry.path}`, url, provider: 'The Cat API' });
    } else {
      const url = personUrl(entry.gender, entry.index);
      await downloadAndProcess(url, outPath, 256, 80);
      credits.push({ file: `public/${entry.path}`, url, provider: 'randomuser.me' });
    }
    return { ok: true, entry };
  } catch (err) {
    console.error(`Fallo al descargar ${entry.path}:`, (err as Error).message);
    return { ok: false, entry };
  }
}

async function runPool<T>(items: T[], size: number, worker: (item: T) => Promise<any>) {
  let idx = 0;
  const results: any[] = [];
  async function next(): Promise<void> {
    const i = idx++;
    if (i >= items.length) return;
    results[i] = await worker(items[i]);
    return next();
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, () => next()));
  return results;
}

async function main() {
  mkdirSync(join(PUBLIC_DIR, 'img', 'pets'), { recursive: true });
  mkdirSync(join(PUBLIC_DIR, 'img', 'people'), { recursive: true });

  const results = await runPool(manifest, CONCURRENCY, processEntry);
  const failed = results.filter((r) => !r.ok);
  const okCount = results.filter((r) => r.ok).length;

  // Escribir CREDITS.md (solo para los archivos descargados en esta corrida; si ya existían, no se listan de nuevo).
  const header = `# Créditos de imágenes

Estas imágenes fueron obtenidas de APIs públicas para fines académicos y de demostración del prototipo KuyayPet (curso de Ingeniería de Software, UPCH). No tienen licencia comercial verificada: antes de cualquier uso comercial, deben reemplazarse por imágenes con licencia clara.

| Archivo | Fuente | Proveedor |
|---|---|---|
`;
  const rows = credits.map((c) => `| ${c.file} | ${c.url} | ${c.provider} |`).join('\n');
  writeFileSync(join(ROOT, 'CREDITS.md'), header + rows + '\n', 'utf-8');

  console.log(`Descarga completa: ${okCount}/${manifest.length} archivos OK.`);
  if (failed.length) {
    console.log(`Fallidos (${failed.length}):`, failed.map((f) => f.entry.path).join(', '));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
