# Prompt de arranque — pegar en Claude Code abierto en esta carpeta

> Abre una terminal en `Kuyaypet_ingsoft`, ejecuta `claude` y pega todo lo que está debajo de la línea.

---

Vamos a construir el **prototipo interactivo de KuyayPet**, un “Tinder/Bumble para adoptar mascotas” de mi curso de Ingeniería de Software (UPCH). Lo voy a mostrar en clase lo antes posible, así que la prioridad es: **navegable, bonito y desplegado rápido**; después completamos las 26 historias de usuario.

**Primero lee** `CLAUDE.md` (reglas, stack, diseño, despliegue) y luego `docs/historias_usuario.md`, `docs/motor_match.md`, `docs/contexto_negocio.md`, `data/team.json`, y mira los wireframes en `docs/wireframes/` (al menos HU-01, 02, 03, 05, 06, 07, 08, 20 antes de diseñar). No me preguntes lo que ya está decidido ahí.

**Antes de escribir código**, dame en máximo 15 líneas: tu plan por fases, qué vas a simular vs qué será real, y cualquier bloqueo que veas (Node/gh instalados, sesión de GitHub, MCP de Hostinger disponible). Si falta algo que puedas instalar o resolver tú, resuélvelo; si necesita que yo haga login (gh auth, etc.), dímelo en una línea y sigue con lo demás.

## Fase 0 — Demo mínima espectacular (lo primero que quiero ver desplegado)
1. Proyecto Vite + React + TS + Tailwind + Framer Motion + Zustand + PWA, `git init`, repo `kuyaypet` en GitHub con `gh`, primer push.
2. `scripts/fetch-images.ts` + `scripts/seed.ts`: descarga y optimiza fotos (perros por raza, gatos, personas), genera los JSON semilla (mascotas, responsables, adoptantes, admin, chats, notificaciones, publicaciones pendientes, reportes) con distritos de Lima y lat/lng. `CREDITS.md` con el origen de cada imagen.
3. Logo SVG original + sistema de diseño (tokens de color, tipografías, componentes base: Button, Card, Chip, Sheet, Toast, Modal de confirmación).
4. Shell: marco de celular en escritorio + panel de presentador (lista de HU, selector de rol, QR, reiniciar demo, “Match garantizado”); pantalla completa en móvil con tab bar inferior.
5. Flujo estrella: splash → login/registro (HU-01, Google real si hay `VITE_GOOGLE_CLIENT_ID`, si no simulado) → **cuestionario de compatibilidad tipo Bumble** (una pregunta por pantalla, con ilustraciones/emoji) → **deck de swipe** con % de compatibilidad y 2–3 razones visibles (HU-06, HU-20) → **“¡Es un Match!”** animado con confeti (HU-07) → **chat** con respuestas simuladas del responsable (HU-08) → **coordinar adopción** con fecha/hora (HU-10).
6. `src/lib/match/` con `computeMatch()` puro + tests Vitest de los casos del documento.
7. **Tour guiado** en español del flujo estrella (se lanza la primera vez y desde el panel de presentador).
8. Pantalla **Créditos / Equipo** con los 7 integrantes de `data/team.json`, rol, HUs a su cargo y enlaces; también accesible desde el splash (“Hecho por el Equipo KuyayPet · UPCH”).
9. Despliegue: crea el sitio en un **subdominio gratuito genérico de Hostinger** (flujo exacto en `CLAUDE.md`), sube `dist/`, y activa el espejo de GitHub Pages. Verifica que ambas URLs cargan en viewport móvil con Playwright y dame los links.

**Detente al final de la Fase 0** y dame: URLs, cómo correrlo local (`npm run dev`), captura del deck y del Match, y qué HUs ya cumplen criterios.

## Fase 1 — Resto de HUs de Adoptante y Usuario
HU-02 lista/grid · HU-03 perfil con carrusel y “por qué hacemos match” · HU-04 filtros · HU-05 cercanía con slider de km, “usar mi ubicación” y mapa ligero (Leaflet + OpenStreetMap, solo si no retrasa; si no, lista con distancias) · HU-09 chat grupal por mascota · HU-14 guía de adopción con buscador (contenido real: requisitos, preparar el hogar, vacunas, esterilización, Ley 30407 y 31807) · HU-15 recuperar contraseña con “bandeja de correo simulada” · HU-17 favoritos · HU-18 historial · HU-21 cerrar sesión con confirmación y cierre por inactividad.

## Fase 2 — Responsable
HU-11 registrar mascota (wizard de 3 pasos) · HU-16 fotos con vista previa y validación de formato + etiquetas · HU-12 editar · HU-13 campana con contador + centro de notificaciones · aceptar/rechazar interés (cierra el ciclo del Match) y solicitudes de adopción · HU-19 marcar como adoptada (se refleja en favoritos/historial del adoptante).

## Fase 3 — Administrador
Panel admin (puede verse mejor en escritorio, pero usable en móvil): HU-22 usuarios · HU-23 publicaciones · HU-24 aprobar/rechazar con motivo · HU-25 desactivar cuentas (el usuario desactivado no puede entrar) · HU-26 cola de reportes de contenido inapropiado. Mini-dashboard con las métricas del caso de negocio (usuarios, matches, activos, adopciones) calculadas de los datos semilla.

## Fase 4 — Pulido para la exposición
- Pestaña **Comunidad** (teaser Fase 2, estilo Bumble BFF): paseos grupales y playdates entre perros compatibles, eventos de adopción; interactiva pero marcada “Próximamente”.
- Pantalla “Cómo funciona KuyayMatch” (factores y pesos, honesta sobre que son heurísticos).
- Capturas por HU en `docs/screenshots/`, `README.md` con links, cómo usar la demo, stack, créditos y trazabilidad HU → pantalla → test; `docs/decisiones.md` con los ADR.
- Lighthouse móvil ≥ 90 en performance/accesibilidad si es razonable. Redesplegar ambos.

## Reglas
- Commit + push al cerrar cada paso importante; redespliegue al cerrar cada fase.
- Cada pantalla con `data-hu`. Marca el avance en `src/data/huStatus.ts` solo cuando los criterios de esa HU se cumplan de verdad.
- Si algo del documento de HU es ambiguo o contradictorio (p.ej. HU-11 “queda disponible” vs HU-24 aprobación previa), elige lo razonable, anótalo en `docs/decisiones.md` y sigue.
- Explícame brevemente el “por qué” de las decisiones de arquitectura mientras avanzas; quiero aprender, no solo recibir código.
