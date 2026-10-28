# ESTADO_CLASE — actualizado 2026-10-28 13:45 (Lima)

## Dónde está cada versión
| URL | Versión | Build |
|---|---|---|
| https://firebrick-cod-910257.hostingersite.com/ | **`v0.3.1-sprint2`**: arreglos de criterios de los Sprints 1–2 | `index-DQQidj1w.js` |
| https://firebrick-cod-910257.hostingersite.com/next/ | preview `v0.4-ui` (sin tocar) | `index-DoPHrMAe.js` |
| https://firebrick-cod-910257.hostingersite.com/next2/ | preview `v0.5-ui` (sin tocar) | `index-DwMPTle2.js` |
| https://ichisieben.github.io/kuyaypet/ | espejo de `main` = Sprints 1–4 completos (`9c6a9a9`) | build de Pages |

- **Deploy del 28-oct, 13:40–13:44:** se subieron 235 archivos a la raíz por TUS (curl), con `index.html` al final y sin borrar nada. **Suite completa contra Hostinger: 54/54 Playwright** y 22/22 Vitest.
- **Service worker:** ahora tiene `navigateFallbackDenylist: [/\/manual\//, /^\/next2?\//]`. En navegadores que todavía tienen el SW viejo, la primera carga de la raíz lo actualiza (`autoUpdate`). Desde ahí `/next/` y `/next2/` abren sin incógnito.
- **Qué cambió para la demo (escena 6):**
  - Al editar una mascota se pueden agregar y quitar fotos y etiquetas (HU-16).
  - Al guardar, la app abre el **perfil público** (HU-12 c5).
  - En computadora, `/buscar` y el perfil usan el ancho completo, sin marco de teléfono (I-02). El resto de las rutas, el tour y la pantalla dividida siguen con marco.
  - Si no hay mascotas disponibles aparece "No hay mascotas disponibles por ahora" (I-01).
  - Cerrar sesión avisa si falla (HU-21).
  - Guion corregido en `../ENSAYO_VIDEO.md`.
- **Revertir a v0.3-fase1:** subir `../revert-v0.3-fase1/{manifest.webmanifest,sw.js,index.html}` con `tus_root.py` (ver `kuyaypet-tools/DECISIONES.md`). Los assets viejos siguen en el servidor.
- **Repos:**
  - IchiSieben/kuyaypet `main` tiene los Sprints 1–4. El tag `v0.3.1-sprint2` (`a8ecf24`) es lo desplegado en Hostinger.
  - ClxNode/KuyayPet: PR #48–#65 del Sprint 2 abiertos (se fusionan en el video después de #35 y #47). Los Sprints 3–4 están en ramas locales; ver `kuyaypet-tools/LIBERACION.md`.
- **Videos de evidencias:** Drive `02-Proyectos/produccion/kuyaypet/videos-hu/` (26 videos), https://drive.google.com/open?id=1e3GcYnJlez_F5GLwqA6CveFjX5wRCiQV

---

## ESTADO_CLASE anterior — actualizado 2026-09-25 17:45 (Lima)

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
