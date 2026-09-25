// npm run backup — git bundle (full history) + zip of dist/ (+ demo manual PDF) copied to Google Drive via rclone.
// Destinations follow Gdrive:02-Proyectos/REGISTRO.md: bundles → 05-Backups/repos, project artifacts → produccion/kuyaypet.
// Uses `rclone copy` only (never sync/delete). Nothing secret is uploaded: .env files are not in the bundle's tracked tree.
import { execFileSync, execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'backups';
const DRIVE_BUNDLE = 'Gdrive:05-Backups/repos/kuyaypet';
const DRIVE_PROJECT = 'Gdrive:02-Proyectos/produccion/kuyaypet';
const date = new Date().toISOString().slice(0, 10);

function findRclone() {
  if (process.env.RCLONE) return process.env.RCLONE;
  try {
    execFileSync('rclone', ['version'], { stdio: 'ignore' });
    return 'rclone';
  } catch {
    /* not on PATH (Windows winget install) */
  }
  const base = join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Packages');
  if (existsSync(base)) {
    for (const pkg of readdirSync(base).filter((d) => d.startsWith('Rclone.Rclone'))) {
      for (const sub of readdirSync(join(base, pkg))) {
        const exe = join(base, pkg, sub, 'rclone.exe');
        if (existsSync(exe)) return exe;
      }
    }
  }
  throw new Error('rclone no encontrado: instala rclone o define RCLONE=<ruta>');
}

const run = (cmd, args) => execFileSync(cmd, args, { stdio: 'inherit' });

mkdirSync(OUT, { recursive: true });
const bundle = join(OUT, 'kuyaypet.bundle');
const zip = join(OUT, `kuyaypet-dist-${date}.zip`);
rmSync(bundle, { force: true });
rmSync(zip, { force: true });

console.log('› git bundle (historial completo)');
run('git', ['bundle', 'create', bundle, '--all']);
run('git', ['bundle', 'verify', bundle]);

console.log('› build + zip de dist/');
execSync('npm run build', { stdio: 'inherit' });
// Windows' bsdtar creates real .zip files; GNU tar (Git Bash) would not.
const tar = process.platform === 'win32' ? join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe') : 'zip';
if (process.platform === 'win32') run(tar, ['-a', '-cf', zip, '-C', 'dist', '.']);
else run('sh', ['-c', `cd dist && zip -qr ../${zip} .`]);

const rclone = findRclone();
console.log('› rclone copy → Drive');
run(rclone, ['copy', bundle, DRIVE_BUNDLE]);
run(rclone, ['copy', zip, `${DRIVE_PROJECT}/deploy`]);
if (existsSync('docs/MANUAL_DEMO.pdf')) run(rclone, ['copy', 'docs/MANUAL_DEMO.pdf', `${DRIVE_PROJECT}/docs`]);
if (existsSync('docs/PROYECTO.md')) run(rclone, ['copy', 'docs/PROYECTO.md', DRIVE_PROJECT]);

console.log('› verificación');
run(rclone, ['lsf', DRIVE_BUNDLE]);
run(rclone, ['lsf', '-R', DRIVE_PROJECT]);
console.log('✓ respaldo completo');
