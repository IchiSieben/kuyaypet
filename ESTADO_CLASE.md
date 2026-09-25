# ESTADO_CLASE — actualizado 2026-09-25 15:22 (Lima)

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

## HU listas (10/26)
HU-01, 02, 03, 06, 07, 08, 10, 20, 21, 24.

## Qué se hizo hoy (Fase 1, bloques A–D)
- A: tag `v0.1-fase0`, bundle + zip + manual en Drive (`05-Backups/repos/kuyaypet`, `02-Proyectos/produccion/kuyaypet`), `npm run backup`, fila en REGISTRO.md.
- B (parcial, lo seguro): el tour bloquea toques fuera del guion, sin spotlight duplicado, tarjeta en el lado libre, paso 2 sobre el cuestionario, teclas ← → Esc, paso visible en el panel.
- C: manual (MD, PDF, /manual/).
- D (rápidos): espacio para la isla del marco, cabecera del chat legible, botones de rol con íconos, contador de HU oculto (“Fase 1 en curso”; clic lo muestra).

## Pendiente
- B completo: Floating UI, guardar/restaurar el estado previo al tour, pasos que esperan acción real con “hazlo por mí”, test de acciones fuera de guion.
- D: datos semilla (Porotopo, dos “Nube”, fotos curadas fijas en el seed).
- E: HU-04, 05, 09, 11, 12, 13 (clic en notificación), 14–19, 22, 23, 25, 26.
- F: pasada “wow” (pantalla dividida, Match cinematográfico, mapa, etc.).

## Problemas / avisos
- Ninguno bloqueante. El tour no guarda la sesión previa: al terminar deja la app en Créditos sin sesión (usa los botones de rol para seguir).
- `rclone link` hizo el PDF del manual legible para cualquiera con el enlace (no contiene secretos; solo las cuentas demo que ya están en el manual público).
