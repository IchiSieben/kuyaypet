# HANDOFF — 2026-10-28 13:45 (Sprint 2 desplegado: `v0.3.1-sprint2`)

- **Producción:** `v0.3.1-sprint2` en la raíz de Hostinger (`index-DQQidj1w.js`), con 54/54 Playwright contra producción. `/next/` (v0.4) y `/next2/` (v0.5) siguen intactos. `main` = `9c6a9a9` (Sprints 1–4).
- **Cómo se desplegó:** `npm run build` desde `main` (con `.env.production`). Después `hosting_files_generate-upload-url`, que es una operación del MCP que no aparece en `search` pero existe. Luego `tus_root.py creds.json dist` (TUS archivo por archivo con **curl**, porque el `urllib` de Python no valida la cadena YE1 de Let's Encrypt). Se rechaza cualquier ruta `next/`/`next2/`, y `index.html`, `sw.js` y `manifest` van al final. Al terminar se borra `creds.json`. **Nunca** `hosting_deploy`: reemplaza el sitio entero.
- **Código idéntico al del grupo:** `kuyaypet-tools/DIFF_REPOS_2026-10-28.txt` (`src`, `tests`, `public` y configs idénticos).
- **Pendiente:**
  - El tag `v0.3.1-sprint2` apunta a `a8ecf24`, que tiene un error de tipos en un spec de evidencias, ya arreglado en `c108d41`. No se movió por la regla de no hacer force-push; el comando está en DECISIONES.
  - Liberar los Sprints 3–4 en ClxNode (`LIBERACION.md`).
- **Lecciones:**
  - Correr `npm run build` después del último cambio: `tsc -b` también compila `tests/` con la configuración de Node, que no tiene tipos del DOM.
  - Las ramas de evidencias de cada sprint se encadenan (S2 → S3 → S4) porque comparten `tests/evidencias/shared.ts`.
  - Un `net::ERR_ABORTED` aislado en un `beforeEach` fue inestabilidad del entorno con 3 servidores a la vez; al repetir pasó 14/14.

---

## HANDOFF anterior — 2026-09-25 17:45 (Fase 1 desplegada: `v0.3-fase1`)

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
