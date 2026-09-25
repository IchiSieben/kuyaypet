# HANDOFF — 2026-09-25 16:50 (Fase 1: B, D, E cerrados en rama; F en curso)

- **Producción:** `v0.2-clase` (Hostinger + Pages). **Hostinger congelado hasta 17:30 Lima.**
- **Rama `fase1-cont`:** B completo (ADR-12), semilla D, las 26 HU (E), Match cinematográfico y pantalla dividida (F, ADR-13). 22 Vitest + 20 Playwright verdes.
- **En curso:** 2 agentes en worktrees: (1) barras por factor + stack 3 cartas + splash; (2) mapa Leaflet HU-05 (ADR-14). Integrar solo si pasan todos los tests.
- **Siguiente (después de 17:30):** merge `fase1-cont` → `main` con la suite completa verde (incluye tour ×3) → `npm run manual` → build → zip con `C:\Windows\System32	ar.exe` → TUS + deploy Hostinger → push (Pages) → smoke contra producción → tag `v0.3` → `npm run backup` → actualizar ESTADO_CLASE.md.
- **Trampas:** el lock `.git/index.lock` puede quedar colgado (verificar que no haya proceso git y borrarlo); las capturas en conflicto se resuelven con `--ours` y se regeneran con la suite.

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
