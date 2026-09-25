# Prompt — Fase 1: respaldo, tour a prueba de balas, manual de demo, HUs restantes y pasada “wow”

> Pegar en la sesión de Claude Code de `Kuyaypet_ingsoft` (o en una nueva: leerá `HANDOFF.md`).

---

OK a la Fase 0, quedó muy bien. Ahora, en este orden (commit + push + redespliegue a Hostinger y Pages al cerrar cada bloque; actualiza `HANDOFF.md` al final):

## Bloque A — Respaldo (primero, 10 min)
1. GitHub: confirma que `main` está al día y crea el tag `v0.1-fase0`.
2. Google Drive (rclone, remoto `Gdrive:` ya configurado en esta máquina): revisa la estructura con `rclone lsd Gdrive:` y `rclone lsd Gdrive:02-Proyectos`, elige una carpeta coherente para un proyecto de la universidad (propuesta: `Gdrive:02-Proyectos/upch/kuyaypet/`; si no encaja, dime cuál y no inventes una estructura nueva). Sube: `kuyaypet.bundle` (`git bundle create --all`, historial completo), `kuyaypet-dist-<fecha>.zip` y `docs/MANUAL_DEMO.pdf` cuando exista. Verifica con `rclone lsf`.
3. Crea `npm run backup` (bundle + zip de dist + rclone copy) y documenta en `DEPLOY.md` los 3 destinos: GitHub, Hostinger, Drive. Nada de secretos en lo que se sube.

## Bloque B — El tour no se puede “pisar”
Problemas que vi en las capturas:
- La tarjeta del tour tapa justo el elemento que explica (paso 3 tapa la carta; paso 1 tapa el splash) y el spotlight duplica elementos (los chips de razones de la carta se ven dos veces, superpuestos).
- El paso 2 “Cuestionario de compatibilidad” se muestra estando ya en `/descubrir`, no sobre el cuestionario.
- Si durante el tour hago swipe, like, o navego por mi cuenta, el guion se desincroniza (el Match esperado puede no ocurrir).

Rediseña el tour como una **máquina de estados con guion determinista**:
- Cada paso declara: ruta, rol, precondición de datos, elemento objetivo y **cómo avanza** (botón “Siguiente”, o esperar una acción concreta del presentador, p.ej. “haz swipe derecha en Luna”, con timeout y botón “hazlo por mí”).
- Al iniciar: guarda el estado actual, carga un **escenario del tour** fijo (semilla), activa “Match garantizado” para las cartas del guion y bloquea las acciones fuera del guion (o, si ocurren, re-sincroniza el paso en vez de romperse). Al salir: restaura el estado previo.
- El Match del tour ocurre siempre, con el mismo animal y el mismo responsable, y la solicitud aparece del lado del Responsable al cambiar de rol.
- Popover con posicionamiento automático (Floating UI: flip/shift) que **nunca** tapa el objetivo; spotlight por recorte (máscara SVG/box-shadow) del elemento real, sin clonarlo.
- Controles: Siguiente / Atrás / Saltar / “Reiniciar tour”, teclas ← →, indicador “paso 4 de 12”, y el panel de presentador muestra en qué paso vas.
- Test Playwright que recorre el tour completo **3 veces seguidas** y otro que mete acciones fuera de guion a mitad del tour; ambos deben terminar en el mismo estado final.

## Bloque C — Manual de la demo (para leerlo yo, aparte)
`docs/MANUAL_DEMO.md` + exportado a `docs/MANUAL_DEMO.pdf` (con capturas reales de cada paso), escrito para mí como presentador:
1. Preparación antes de clase (qué URL abrir, pantalla completa, reiniciar demo, probar el QR, plan sin internet).
2. Guion paso a paso del tour: qué hago clic, qué pasa en pantalla, **qué digo** (1–2 frases), qué HU estoy demostrando, tiempo aproximado. Total objetivo: 5–7 min.
3. Recorrido libre por rol (Adoptante, Responsable, Admin): qué se puede mostrar en cada uno y cómo funciona el Admin (usuarios, publicaciones, aprobar/rechazar, desactivar).
4. Qué es simulado y cómo explicarlo si preguntan (sin backend, datos en el navegador, responsables automáticos, Google simulado) y qué sería la fase siguiente.
5. Plan B: si algo falla (reiniciar demo, recargar, versión Pages, capturas del manual).
6. Tabla de trazabilidad HU → pantalla → paso del tour.

## Bloque D — Arreglos visuales detectados
- La isla/notch del marco tapa contenido: el nombre de la mascota en la cabecera del chat (“Gordo” queda oculto), el texto superior del splash. Aplica safe-area superior dentro del marco (y `env(safe-area-inset-*)` en celular real).
- Cabecera del chat trunca “Responsable: Carlos …”: rediseñar a dos líneas o avatar + nombre.
- Botones de rol del panel: emoji arriba en uno y al lado en otros; unificar (íconos lucide, misma alineación).
- En el panel, opción “ocultar contador de HU” para exponer (mostrar 10/26 puede leerse como incompleto) o etiquetarlo “Fase 1”.
- Datos semilla: Porotopo (texto vs `goodWithDogs`), dos mascotas “Nube”; que el seed sea determinista y fije las fotos curadas (Luna) para que no cambien al regenerar.

## Bloque E — HUs pendientes (seguir el plan de fases del prompt inicial)
HU-04, 05, 09, 11, 12, 13 (corregir: clic en notificación → perfil del adoptante o chat de esa solicitud), 14, 15, 16, 17, 18, 19, 22, 23, 25, 26. Cada una con sus criterios de `docs/historias_usuario.md`, `data-hu`, captura y test. Actualiza `huStatus.ts` solo con criterios cumplidos de verdad.

## Bloque F — Pasada “wow” de la demo (después de E, o intercalada si hay tiempo antes de la clase)
- **Swipe con física real**: pila de 3 cartas (las de atrás asomando y escaladas), rotación según arrastre, sellos “ME GUSTA” / “NO” que aparecen con la distancia, salida con velocidad, `navigator.vibrate` en celular.
- **Match cinematográfico**: fotos que entran y “chocan”, confeti de huellas y corazones (canvas-confetti con formas propias), anillo de compatibilidad que se llena 0→86 % y las razones apareciendo una a una.
- **“Por qué hacemos match”** en el perfil: barras por factor (cercanía, vivienda, energía, tiempo, hogar, experiencia) animadas, con los pesos del motor.
- **Transición compartida** carta → perfil (Framer `layoutId`), carrusel de fotos con blur-up y skeletons.
- **Mapa HU-05**: Leaflet con marcadores de huella y teselas claras (p.ej. CARTO Voyager), círculo del radio que cambia con el slider. Verificar términos del proveedor de teselas.
- **Splash animado**: perro y gato del logo asomándose, tagline escrito.
- **Admin con dashboard**: KPIs del caso de negocio (usuarios, matches, activos, adopciones vs metas 500/200/60 %/80 %) con conteo animado y mini gráficos.
- **Modo “Pantalla dividida”** en el panel de presentador: dos celulares lado a lado (Adoptante | Responsable) sobre el mismo estado, para que la clase vea el like, la notificación, la aceptación y el Match en vivo desde ambos lados (HU-06/07/13/08 a la vez). Es el momento estrella de la exposición.
- `prefers-reduced-motion` respetado en todo; Lighthouse móvil ≥ 90.

Antes de empezar, dame en ≤ 10 líneas tu estimación de tiempo por bloque y qué recomiendas dejar para después si la clase es pronto. Luego ejecuta A → B → C sin parar, y detente para mostrarme B y C antes de seguir con D–F.
