// Records one evidence video per HU with the Playwright `evidencias` project.
//
//   BASE_URL=http://localhost:4199/ node scripts/record-hu.mjs 01 02 03
//
// Env: BASE_URL (a running `vite preview`), EVIDENCIAS_DIR (screenshots, default test-results/evidencias-capturas),
//      VIDEOS_DIR (videos, default test-results/videos-hu; keep it outside git).
// Output: <VIDEOS_DIR>/HU-NN.webm, plus HU-NN.mp4 when ffmpeg is on PATH. Exit code = Playwright's.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const hus = (process.argv.slice(2).length ? process.argv.slice(2) : ['01', '02', '03']).map((n) => `HU-${n.replace(/^HU-/i, '').padStart(2, '0')}`);
const files = hus.map((hu) => `tests/evidencias/${hu}.spec.ts`).filter((f) => existsSync(f));
if (!files.length) {
  console.error(`No hay specs para ${hus.join(', ')} en tests/evidencias/`);
  process.exit(1);
}
const outputDir = 'test-results/evidencias';
const videosDir = resolve(process.env.VIDEOS_DIR || 'test-results/videos-hu');

const run = spawnSync('npx', ['playwright', 'test', '--project=evidencias', '--workers=1', ...files], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, EVIDENCIAS: '1', BASE_URL: process.env.BASE_URL || 'http://localhost:4199/' },
});

const hasFfmpeg = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore', shell: true }).status === 0;
mkdirSync(videosDir, { recursive: true });
for (const dir of existsSync(outputDir) ? readdirSync(outputDir) : []) {
  const hu = dir.match(/HU-\d\d/)?.[0];
  const webm = join(outputDir, dir, 'video.webm');
  if (!hu || !existsSync(webm)) continue;
  const target = join(videosDir, `${hu}.webm`);
  copyFileSync(webm, target);
  console.log(`video: ${target}`);
  if (hasFfmpeg) {
    const mp4 = join(videosDir, `${hu}.mp4`);
    const conv = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `"${target}"`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `"${mp4}"`], { stdio: 'inherit', shell: true });
    console.log(conv.status === 0 ? `video: ${mp4}` : `ffmpeg falló para ${hu}`);
  }
}
if (!hasFfmpeg) console.log('ffmpeg no está en PATH: solo se generaron .webm');
process.exit(run.status ?? 1);
