# HANDOFF — 2026-10-16 15:10 (v0.4-ui en preview `/next/`)

- **Producción:** sigue `v0.3-fase1` en la raíz de Hostinger y en Pages. `main` sin cambios (`898a9f6`).
- **Preview:** rama `v0.4-ui` en https://firebrick-cod-910257.hostingersite.com/next/ (build `VITE_BASE=/next/`). 22/22 Vitest y 21/21 Playwright.
- **Cómo se desplegó la preview (sin tocar la raíz):** `VITE_BASE=/next/ npm run build` desde PowerShell (en Git Bash, MSYS convierte `/next/` en `C:/Program Files/Git/next/`; usar `MSYS_NO_PATHCONV=1`). Luego MCP `hosting_files_generate-upload-url` y TUS archivo por archivo a `next/<ruta>`, con `index.html` al final y un `.htaccess` propio en `next/`. **Nunca** `hosting_deployStaticSiteArchiveV1` para la preview: reemplaza el sitio completo.
- **Pendiente v0.4:** transición carta → perfil; pase de tokens en Browse, Matches, Chats, Onboarding y Owner/Admin; fecha de entrega en `/sprints` un día antes (formatear el hito en UTC); el service worker de la v0.3 captura `/next/` en navegadores que ya lo tenían (agregar `/^\/next\//` al `denylist` en el próximo deploy de producción).
- **Lecciones:** el Python de Windows rechaza la cadena TLS (válida) de `srv*-files.hstgr.io` con "certificate has expired"; `curl` (schannel) la verifica bien: subir con curl. El puerto 4173 puede estar ocupado por otra app: servir en 4199 y usar `BASE_URL`.

## Estado al 2026-09-25 17:45 (Fase 1 desplegada: `v0.3-fase1`)

- **Producción:** `v0.3-fase1` en Hostinger y Pages; 21/21 Playwright contra Hostinger. `main` = `fase1-cont`.
- **Hecho:** A–E completos; F: Match cinematográfico, pantalla dividida (ADR-13), barras por factor, stack de 3 cartas, splash, mapa OSM (ADR-14), rendimiento (ADR-15).
- **Pendiente:** Lighthouse móvil 80 → ≥ 90 (LazyMotion, panel de presentador fuera del chunk inicial); transición carta → perfil con `layoutId`; `data/team.json` sin HU asignadas.
- **Lecciones:** los worktrees de agentes nacen de la rama por defecto del remoto, no de la rama local: pedir `git merge fase1-cont` al inicio o integrar a mano. `npm ci` falla en Windows si hay un `vite preview` corriendo (bloquea `node_modules`). CARTO `rastertiles/voyager` ahora exige API key.

## Estado de Fase 0 (histórico)

## Estado
- Fase 0 desplegada: https://firebrick-cod-910257.hostingersite.com/ y https://ichisieben.github.io/kuyaypet/ (Pages se publica solo con cada push).
- Tests: `npm test` (13 Vitest, motor), `npm run test:e2e` (4 Playwright: 3 smoke móviles + tour escritorio). Todos verdes local y contra ambas URLs.
- HU marcadas done (10): 01, 02, 03, 06, 07, 08, 10, 20, 21, 24.

## Pendiente / conocido
- Fase 1: HU-04 filtros, HU-05 cercanía, HU-09 chat grupal (hay hilo semilla de Porotopo), HU-14 guía, HU-15 recuperar contraseña, HU-17 favoritos, HU-18 historial (filas en Perfil marcadas "Fase 1").
- HU-13 casi lista: falta que el click en la notificación abra el perfil del adoptante / chat de la solicitud (hoy va a /responsable).
- Seed: Porotopo (p01) dice "bueno con otras mascotas" pero goodWithDogs=false; hay dos "Nube" (p14, p39). Corregir en scripts/seed.ts.
- Fotos de Luna (p29) reemplazadas a mano; si se borra public/img y se vuelve a correr `npm run images`, vuelven otras.
- `data/team.json` sin HU asignadas → pantalla de créditos dice "HU por asignar".
- Bundle 520 kB (warning de Vite); code-splitting por rol en Fase 4.

## Redesplegar Hostinger
`npm run build` → `C:\Windows\System32\tar.exe -a -cf dist.zip -C dist .` → MCP generateUploadURL + TUS (ver DEPLOY.md) → `hosting_deployStaticSiteArchiveV1` (u901782070, dist.zip).
