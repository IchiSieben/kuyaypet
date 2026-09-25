# ESTADO_CLASE — actualizado 2026-09-25 17:16 (Lima)

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
- F: Match cinematográfico (anillo, razones una a una, confeti de huellas); pantalla dividida Adoptante | Responsable con sesiones reales (ADR-13); barras por factor en “¿Por qué hacemos match?”; stack de 3 cartas con vibración; splash animado; mapa de cercanía con Leaflet y OpenStreetMap (ADR-14; CARTO pedía API key); carga diferida y primer pintado estático (ADR-15).

## Tests (`main` = `fase1-cont`, commit previo al despliegue)
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
