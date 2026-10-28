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

## HANDOFF anterior — 2026-10-16 16:45 (v0.5-ui terminada, preview en `/next2/`)

- **Dónde está cada versión:** raíz = producción **`v0.3-fase1`** (`index-BmydHsl6.js`) · `/next/` = `v0.4-ui` (`index-DoPHrMAe.js`) · `/next2/` = **`v0.5-ui`** (`index-DwMPTle2.js`). `main` de IchiSieben/kuyaypet sin cambios (`898a9f6`).
- **Service worker:** el de la v0.3 (alcance `/`) captura `/next/` y `/next2/` en navegadores que ya abrieron la raíz → abrir las previews en **incógnito**. Arreglo: `denylist: [/\/manual\//, /^\/next2?\//]` en el próximo deploy de producción (no se hizo: toca la raíz).
- **Tests v0.5:** 22/22 Vitest · 21/21 Playwright (`--workers=1`, `BASE_URL=http://localhost:4199/`) tras cada integración y al cierre. axe: 0 violaciones en 32 rutas.
- **Lighthouse `/next2/`:** móvil 88 y 93 (dos corridas; `/next/` 89) · escritorio 100/100/100/100. Bundle 482,9 → 507,3 kB (+5 %).
- **Redesplegar `/next2/`:** PowerShell `$env:VITE_BASE='/next2/'; npx vite build --outDir dist-next2 --emptyOutDir` → `hosting_files_generate-upload-url` → `tus_upload.py creds.json dist-next2 next2 next2.htaccess=.htaccess` (curl, TLS verificado, reintentos, `index.html` al final) → borrar `creds.json`. `.htaccess` con `RewriteBase /next2/` y regla a `/next2/index.html`.
- **Pendiente:** ver "Otra sesión" abajo.

## v0.5-ui — progreso por fase (rama `v0.5-ui`, desde `origin/v0.4-ui`)

| Fase | Alcance | Responsable | Estado |
|---|---|---|---|
| Prep | Primitivas `PageHeader/Section/ListGroup/ListRow/StatTile/Skeleton/IconButton`, `docs/v05-design.md`, `docs/test-selectors.txt` | hilo principal | hecho (`e4496db`) |
| 1a | Browse, PetMap, Favoritos, Historial, Matches | agente A (worktree `kuyaypet-wt/f1a`) | hecho (`2794bf7`) |
| 1b | Chats (lista y conversación), Coordinar, Perfil, Onboarding | agente B (`kuyaypet-wt/f1b`) | hecho (`cb7fea7`) · **1er deploy `/next2/` 2026-10-16 16:02** |
| 2 | Responsable (panel, nueva, editar), Notificaciones, perfil del adoptante | agente C (`kuyaypet-wt/f2`) | hecho (`35bb570`) |
| 3 | Admin (shell, dashboard, usuarios, publicaciones, reportes, detalles) | agente D (`kuyaypet-wt/f3`) | hecho (`f7ae9a5`) |
| 4 | Login, registro, recuperar, bandeja simulada, guía | agente E (`kuyaypet-wt/f4`) | hecho (`cc66914`) |
| 5 | Movimiento: carta → perfil (`layoutId`), Match, transiciones de ruta, skeletons de Descubrir/Perfil | hilo principal | hecho (`bac2b28`, `39a81c1` sin startTransition) |
| 6 | Pulido transversal, fecha UTC en /sprints, 26 rutas, Lighthouse | hilo principal | hecho (`0b8525b`) · **deploy final 16:35** |

### Decisiones v0.5 (sin consulta, modo desatendido)
- **Seguimiento en esta tabla** en vez de TaskCreate (no disponible en esta sesión).
- **Worktrees creados a mano** (`git worktree add -b v0.5-ui-<fase> … v0.5-ui`), no con el aislamiento del Agent: los worktrees automáticos nacen de la rama por defecto del remoto (lección de Fase 1). Integración una rama a la vez, con `git diff --stat` revisado contra la lista de archivos del agente.
- **Archivos disjuntos**: `components/ui/index.tsx`, `PetCard`, `MatchCelebration`, `shell/*`, `App.tsx` y Splash solo los toca el hilo principal; la firma de props de `PetCard` queda congelada. Cada agente pone sus propios skeletons en sus pantallas.
- **Playwright solo en el hilo principal**, `--workers=1`, puerto 4199. Agentes: build + Vitest, capturas en puertos 4201+.
- **`scripts/v05-shots.mjs` queda fuera de git** (`.git/info/exclude`): es herramienta local de capturas.
- **Perfil de mascota sale del code-splitting** (bundle inicial +19 kB, 507 kB): con `v7_startTransition` la animación `layoutId` sobrevivía al chunk perezoso, pero el `pathname` diferido hacía que el tour se re-sincronizara a destiempo (flaky en `tour.spec.ts`). Cargarlo de entrada da el mismo commit carta→perfil sin tocar el router. Revertir: volver a `lazyNamed` en `App.tsx` (se pierde la animación la primera vez).
- **Copy nuevo mínimo aceptado** de los agentes (conteo "N mascotas", acciones en estados vacíos, separadores de fecha del chat, nombres de pasos): no reemplaza texto existente ni nombres accesibles que use la suite.
- **Subida TUS con reintentos** (4 por archivo): una subida de 232 archivos tuvo un `Connection reset`; `index.html` va al final, así que un fallo nunca deja la preview apuntando a assets ausentes.
- **Contraste por uso, no por paleta:** blanco sobre `sage`/`coral` no llega a AA; se usan `sage-600`/`coral-600` (o texto oscuro sobre miel) en botones e insignias con texto. Los valores de la paleta no cambian.
- **Worktrees `kuyaypet-wt/f1a…f4` y ramas `v0.5-ui-*`** quedan locales (ya integradas). Se pueden quitar con `git worktree remove`; no se borraron (borrado = OK explícito).
- **Build de despliegue en `dist-next2/`** (`--outDir`) para no pisar el `dist/` que sirve la preview local de tests.

### Otra sesión (en orden)
1. Producción: `denylist` del SW para `/next*/` y decidir si `v0.5-ui` pasa a la raíz (fusionar a `main`, deploy completo, suite contra Hostinger).
2. Lighthouse móvil ≥ 95 estable: TBT 260–390 ms viene del bundle principal (507 kB); sacar Leaflet/confeti/Tour del chunk inicial y precargar el perfil en vez de importarlo de entrada.
3. Promover a `components/ui` los helpers que los agentes dejaron locales (`Field`/`FormAlert` de auth, `FilterBar`/`ActionBar`/`RejectSheet` de admin, `Stepper` de NewPet, `Tile` de Perfil) y dar a `PageHeader` un `backLabel`.

# HANDOFF anterior — 2026-10-16 15:10 (v0.4-ui en preview `/next/`)

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
