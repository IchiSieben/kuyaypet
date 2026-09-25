# Despliegue

| Destino | URL | Cómo |
|---|---|---|
| Hostinger (principal) | https://firebrick-cod-910257.hostingersite.com/ | `npm run build` → zip de `dist/` → MCP `hosting_deployStaticSiteArchiveV1` (orden 1008316349, usuario u901782070) |
| GitHub Pages (espejo) | https://ichisieben.github.io/kuyaypet/ | automático con cada push a `main` (`.github/workflows/pages.yml`) |

- El zip se arma con `C:WindowsSystem32	ar.exe -a -cf dist.zip -C dist .` (bsdtar de Windows; el `tar` de Git Bash genera .tar, no .zip) (sin carpeta `dist/` dentro).
- El QR del panel de presentador usa la URL desde la que se abre la app; en `localhost` usa `VITE_PUBLIC_URL` (`.env.production`).
- La PWA usa `autoUpdate`: tras redesplegar, los celulares toman la nueva versión al recargar.
