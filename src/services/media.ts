// Media (UML): file validation + resize helpers for owner uploads (HU-16).
// Components never touch File/Canvas APIs directly; they call this service.

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_DIMENSION = 600;
const JPEG_QUALITY = 0.85;

export function isAllowedImage(file: File): boolean {
  return ALLOWED_TYPES.includes(file.type);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo cargar la imagen.'));
    img.src = src;
  });
}

/**
 * Reads a jpg/png/webp file, downsizes it to at most 600px on its longest side
 * (keeping the aspect ratio) and re-encodes it as JPEG so seed-sized photos
 * don't blow past the localStorage quota.
 */
export async function processImage(file: File): Promise<{ ok: true; dataUrl: string } | { ok: false; error: string }> {
  if (!isAllowedImage(file)) {
    return { ok: false, error: 'Formato no permitido. Usa una imagen JPG, PNG o WEBP.' };
  }
  try {
    const raw = await readAsDataUrl(file);
    const img = await loadImage(raw);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { ok: false, error: 'Tu navegador no soporta el procesamiento de imágenes.' };
    ctx.drawImage(img, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
    return { ok: true, dataUrl };
  } catch {
    return { ok: false, error: 'No se pudo procesar la imagen. Intenta con otro archivo.' };
  }
}

export const MAX_PET_PHOTOS = 4;

/**
 * Processes a batch of picked files against the photo limit (HU-16). Shared by the
 * register and edit screens so validation ("Formato no permitido") and the max of
 * MAX_PET_PHOTOS behave identically. Invalid files are skipped; the last error wins.
 */
export async function processPhotoBatch(files: FileList | File[], currentCount: number): Promise<{ dataUrls: string[]; error: string }> {
  const remaining = Math.max(0, MAX_PET_PHOTOS - currentCount);
  const dataUrls: string[] = [];
  let error = '';
  for (const file of Array.from(files).slice(0, remaining)) {
    const result = await processImage(file);
    if (result.ok) dataUrls.push(result.dataUrl);
    else error = result.error;
  }
  return { dataUrls, error };
}
