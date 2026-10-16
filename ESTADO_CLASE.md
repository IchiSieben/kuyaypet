# ESTADO_CLASE — actualizado 2026-10-16 16:45 (Lima)

## Qué versión está dónde
| URL | Versión | Build |
|---|---|---|
| https://firebrick-cod-910257.hostingersite.com/ | **producción `v0.3-fase1`** (la que se presenta) | `index-BmydHsl6.js` |
| https://firebrick-cod-910257.hostingersite.com/next/ | preview `v0.4-ui` | `index-DoPHrMAe.js` |
| https://firebrick-cod-910257.hostingersite.com/next2/ | preview **`v0.5-ui`** (rediseño completo) | `index-DwMPTle2.js` |

**Aviso de service worker:** el de la v0.3 (alcance `/`) responde las navegaciones a `/next/` y `/next2/` en navegadores que ya abrieron la raíz. Abrir las previews en **ventana de incógnito** (o borrar los datos del sitio). Arreglo pendiente: `denylist: [/^\/next2?\//]` en el próximo deploy de producción.

## v0.5-ui en preview (16 oct 2026)
- Rama `v0.5-ui` (IchiSieben/kuyaypet). Deploys a `/next2/`: 16:02 (fases 1 y 5) y **16:35 (final)**.
- Rediseño de las 26 rutas: adoptante, responsable, admin (back-office), login/registro/recuperar/guía; carta → perfil animada; contraste AA verificado con axe; fecha de entrega de `/sprints` corregida (UTC).
- Tests: 22/22 Vitest · 21/21 Playwright (`--workers=1`). Lighthouse `/next2/`: móvil 88–93, escritorio 100 (accesibilidad 100).
- Capturas: `Inge software/kuyaypet-v05-shots/` (`00-antes`, `fase1`…`fase4`, `fase6/movil`, `fase6/escritorio`).

## v0.4-ui en preview (16 oct 2026)
- **Preview:** https://firebrick-cod-910257.hostingersite.com/next/ — rama `v0.4-ui` (4 commits sobre `v0.3-fase1`), build con `VITE_BASE=/next/` (`index-DoPHrMAe.js`).
- **Producción sin cambios:** la raíz sigue en **`v0.3-fase1`** (`index-BmydHsl6.js`). La preview vive solo en `public_html/next/`, con su propio `.htaccess` (fallback a `/next/index.html`).
- **Tests de la rama:** 22/22 Vitest · 21/21 Playwright (`--workers=1`, local en el puerto 4199).
- **En vivo desde GitHub:** `/next/#/historias` lee `docs/historias-de-usuario.md` y `/next/#/sprints` lee hitos e issues de ClxNode/KuyayPet (verificado: respuestas 200, sin errores de consola).
- **Aviso:** si el navegador ya abrió la v0.3, su service worker (alcance `/`) responde las navegaciones a `/next/` con la v0.3. Para ver la preview: ventana de incógnito o borrar los datos del sitio. El arreglo es agregar `/next/` al `denylist` del service worker de producción (no se hizo: toca la raíz).
- **Pendiente v0.4:** transición carta → perfil; pase de tokens en Browse, Matches, Chats, Onboarding y Owner/Admin; en `/sprints` la fecha de entrega se muestra un día antes (el hito vence `2026-10-30T00:00Z` y se formatea en hora de Lima).

## Estado al 2026-09-25 17:45 (v0.3-fase1)

## Links para la clase
- **App (Hostinger):** https://firebrick-cod-910257.hostingersite.com/
- **Manual de la demo:** https://firebrick-cod-910257.hostingersite.com/manual/ (también botón en el panel de presentador y en la pantalla de inicio)
- **Manual PDF en Drive:** https://drive.google.com/open?id=1ssicn7e1TAbWMn4sQGb1JQPfGtOgEp1z
- **Espejo (plan B):** https://ichisieben.github.io/kuyaypet/ · manual en `/kuyaypet/manual/`
- Cuentas demo (contraseña `kuyay2026`): adoptante@ · responsable@ · admin@ kuyaypet.pe

## Versión desplegada
- **Tag `v0.3-fase1`** (commit `e06c048`), desplegada a las 17:31 en Hostinger (TUS + deploy) y en Pages (push a `main`). Las dos URLs sirven el mismo build (`index-BmydHsl6.js`).
- **Suite completa contra Hostinger: 21/21 Playwright en verde** (tour ×3, tour con acciones fuera de guion, pantalla dividida, mapa, todas las HU). Local: 22 Vitest + 21 Playwright.
- Versión anterior de respaldo: `v0.2-clase`.

## HU listas: 26/26 (en producción)
Cada una tiene `data-hu`, un test Playwright y capturas en `docs/screenshots/`. Simulado (y así se dice en la demo): correo de recuperación (bandeja simulada), respuestas del responsable en el chat, aceptación automática de responsables sintéticos y login con Google.

## Qué se hizo hoy
- A: tag `v0.1-fase0`; bundle, zip y manual en Drive (`05-Backups/repos/kuyaypet`, `02-Proyectos/produccion/kuyaypet`); `npm run backup`; fila en REGISTRO.md.
- B **completo** (rama): tour como máquina de estados. Pasos de acción con “Hazlo por mí”; foto de la BD por paso (Atrás y acciones fuera de guion vuelven al paso correcto); guarda y restaura el estado previo; popover que nunca tapa el objetivo, verificado por test; Saltar y Reiniciar. Tests: tour ×3 y recorrido con acciones fuera de guion (ADR-12).
- C: manual (MD, PDF, /manual/). Actualizado en la rama con el tour nuevo, la pantalla dividida y las 26 HU.
- D: arreglos visuales (en producción). Semilla (rama): Porotopo coherente con sus banderas, “Nube Gris” → “Ceniza” y fotos de Luna fijas en `fetch-images`.
- E (rama): HU-04, 05, 09, 14, 15, 17, 18 (adoptante); 11, 12, 13, 16, 19 (responsable); 22, 23, 25, 26 (admin, con panel en pestañas y KPIs).
- F: Match cinematográfico (anillo, razones una a una, confeti de huellas); pantalla dividida Adoptante | Responsable con sesiones reales (ADR-13); barras por factor en “¿Por qué hacemos match?”; stack de 3 cartas con vibración; splash animado; mapa de cercanía con Leaflet y OpenStreetMap (ADR-14; CARTO pedía API key); carga diferida y primer pintado estático (ADR-15).

## Tests (commit desplegado)
22 Vitest + 21 Playwright en verde: tour ×3, tour con acciones fuera de guion, pantalla dividida, mapa y una prueba por HU.

## Lighthouse (local)
- Escritorio: Rendimiento 98 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100.
- Móvil (4G lento simulado): **Rendimiento 80** (meta 90 **no alcanzada**: el LCP ≈ 5 s depende del bundle de React + Framer Motion) · Accesibilidad 100 · Buenas prácticas 100 · SEO 100.

## Pendiente
- Rendimiento móvil ≥ 90 (ver ADR-15).
- Transición carta → perfil con `layoutId` (Bloque F): no se hizo.

## Problemas / avisos
- Ninguno bloqueante.
- `rclone link` hizo el PDF del manual legible para cualquiera con el enlace (no contiene secretos; solo las cuentas demo que ya están en el manual público).
- **Primera carga tras el despliegue:** quien ya abrió la v0.2 conserva sus datos viejos en el navegador (sin error, porque los tipos no cambiaron). Para ver la semilla nueva, pulsa **Reiniciar demo**.
