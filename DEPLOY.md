# Despliegue y respaldo

Tres destinos: **GitHub** (código + tags), **Hostinger** (sitio principal), **Google Drive** (respaldo: bundle, zips de dist, manual).

| Destino | URL | Cómo |
|---|---|---|
| Hostinger (principal) | https://firebrick-cod-910257.hostingersite.com/ | `npm run build` → zip de `dist/` → MCP `hosting_deployStaticSiteArchiveV1` (orden 1008316349, usuario u901782070) |
| GitHub Pages (espejo) | https://ichisieben.github.io/kuyaypet/ | automático con cada push a `main` (`.github/workflows/pages.yml`) |

- El zip se arma con `C:WindowsSystem32	ar.exe -a -cf dist.zip -C dist .` (bsdtar de Windows; el `tar` de Git Bash genera .tar, no .zip) (sin carpeta `dist/` dentro).
- El QR del panel de presentador usa la URL desde la que se abre la app; en `localhost` usa `VITE_PUBLIC_URL` (`.env.production`).
- La PWA usa `autoUpdate`: tras redesplegar, los celulares toman la nueva versión al recargar.

## Google Drive (respaldo) — `npm run backup`
- `Gdrive:05-Backups/repos/kuyaypet/kuyaypet.bundle` — historial completo (`git clone kuyaypet.bundle kuyaypet`).
- `Gdrive:02-Proyectos/produccion/kuyaypet/deploy/kuyaypet-dist-<fecha>.zip` — build listo para subir.
- `Gdrive:02-Proyectos/produccion/kuyaypet/docs/MANUAL_DEMO.pdf` — manual (link: https://drive.google.com/open?id=1ssicn7e1TAbWMn4sQGb1JQPfGtOgEp1z).
- Solo `rclone copy` (nunca sync/delete). No se sube `.env` ni credenciales.

## Manual — `npm run manual`
`docs/MANUAL_DEMO.md` → `public/manual/index.html` (+ imágenes) → `docs/MANUAL_DEMO.pdf`. Se publica en `/manual/` con cada build.
