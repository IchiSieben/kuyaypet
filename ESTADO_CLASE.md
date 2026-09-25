# ESTADO_CLASE — actualizado 2026-09-25 16:50 (Lima)

## Links para la clase
- **App (Hostinger):** https://firebrick-cod-910257.hostingersite.com/
- **Manual de la demo:** https://firebrick-cod-910257.hostingersite.com/manual/ (también botón en el panel de presentador y en la pantalla de inicio)
- **Manual PDF en Drive:** https://drive.google.com/open?id=1ssicn7e1TAbWMn4sQGb1JQPfGtOgEp1z
- **Espejo (plan B):** https://ichisieben.github.io/kuyaypet/ · manual en `/kuyaypet/manual/`
- Cuentas demo (contraseña `kuyay2026`): adoptante@ · responsable@ · admin@ kuyaypet.pe

## Versión desplegada
- Tag `v0.2-clase` (commit `1997f9a`), desplegada a las 15:19 en Hostinger y Pages.
- Tests: 13 Vitest + 4 Playwright en verde (incluye el tour recorrido **3 veces seguidas** con el mismo estado final). Smoke en producción: 3/3.
- **Congelado Hostinger 15:45–17:30.** El trabajo sigue en la rama `fase1-cont`.

## HU listas
- **En producción (`v0.2-clase`):** 10/26: HU-01, 02, 03, 06, 07, 08, 10, 20, 21, 24.
- **En la rama `fase1-cont` (pendiente de integrar a `main` después de las 17:30):** 26/26 marcadas, con test Playwright por HU y capturas en `docs/screenshots/`.

## Qué se hizo hoy
- A: tag `v0.1-fase0`; bundle, zip y manual en Drive (`05-Backups/repos/kuyaypet`, `02-Proyectos/produccion/kuyaypet`); `npm run backup`; fila en REGISTRO.md.
- B **completo** (rama): tour como máquina de estados. Pasos de acción con “Hazlo por mí”; foto de la BD por paso (Atrás y acciones fuera de guion vuelven al paso correcto); guarda y restaura el estado previo; popover que nunca tapa el objetivo, verificado por test; Saltar y Reiniciar. Tests: tour ×3 y recorrido con acciones fuera de guion (ADR-12).
- C: manual (MD, PDF, /manual/). Actualizado en la rama con el tour nuevo, la pantalla dividida y las 26 HU.
- D: arreglos visuales (en producción). Semilla (rama): Porotopo coherente con sus banderas, “Nube Gris” → “Ceniza” y fotos de Luna fijas en `fetch-images`.
- E (rama): HU-04, 05, 09, 14, 15, 17, 18 (adoptante); 11, 12, 13, 16, 19 (responsable); 22, 23, 25, 26 (admin, con panel en pestañas y KPIs).
- F (rama): Match cinematográfico (anillo, razones una a una, confeti de huellas); pantalla dividida Adoptante | Responsable con sesiones reales (ADR-13). En curso: barras por factor, stack de 3 cartas, splash animado y mapa Leaflet (HU-05).

## Tests (rama `fase1-cont`)
22 Vitest + 20 Playwright en verde (incluye tour ×3, tour con acciones fuera de guion y pantalla dividida).

## Pendiente
- 17:30: integrar `fase1-cont` → `main` si todo está verde, redesplegar Hostinger y Pages, smoke en producción, subir el manual nuevo a Drive.
- F restante: Lighthouse ≥ 90, transición carta → perfil (layoutId).

## Problemas / avisos
- Ninguno bloqueante.
- `rclone link` hizo el PDF del manual legible para cualquiera con el enlace (no contiene secretos; solo las cuentas demo que ya están en el manual público).
- En producción (v0.2) el tour todavía deja la app en Créditos sin sesión. En la rama ya restaura el estado previo.
