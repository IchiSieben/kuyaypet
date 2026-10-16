# Decisiones de arquitectura (ADR cortos)

## ADR-01 · Capa de servicios delante de un “backend falso”
**Contexto:** en esta fase no hay servidor, pero en la Fase 2 habrá Supabase.
**Decisión:** todo el estado vive en un store Zustand persistido en `localStorage` (`src/services/store.ts`, el componente “BD” del UML). Las pantallas **solo** llaman funciones de `src/services/*` (auth, pets, match, chat, notifications, adoptions, moderation…), nombradas como los componentes del UML.
**Consecuencia:** para pasar a Supabase se reescriben los servicios, no la UI. Coste: hoy hay algo de indirección que parece innecesaria.

## ADR-02 · HashRouter
**Contexto:** Hostinger (hosting compartido estático) y GitHub Pages no reescriben rutas a `index.html`.
**Decisión:** rutas con `#/` (`/#/descubrir`) y `base: './'` en Vite. El mismo `dist/` funciona en la raíz de Hostinger y en `/kuyaypet/` de Pages.
**Alternativa descartada:** BrowserRouter + `.htaccess`/404.html: URLs más limpias pero dos configuraciones distintas.

## ADR-03 · Motor de compatibilidad como función pura
`computeMatch(adoptante, mascota)` en `src/lib/match/` no toca React ni el reloj: recibe datos y devuelve `{score, reasons, warnings, hardBlock, breakdown}`. Por eso se testea con Vitest sin navegador (13 casos del `motor_match.md`) y se podrá portar tal cual a Dart/Flutter. Los pesos (`weights.ts`) son **heurísticos**, no validados con datos reales.

## ADR-04 · Match = interés mutuo, con responsable simulado
HU-07 exige que el responsable acepte. Un “Me gusta” crea un `Interest(pendiente)` y notifica al responsable. Los responsables sintéticos responden solos (probabilidad 0.3–0.9, 2–6 s); la responsable demo (Rosa) responde a mano, que es parte del tour. El panel de presentador puede forzar “Match garantizado”. El chat se habilita **después** del Match (HU-07 “desde el Match se continúa al contacto”); “Coordinar adopción” está disponible siempre que la mascota esté disponible (HU-10).

## ADR-05 · HU-11 vs HU-24: publicación con moderación previa
HU-11 dice que la mascota “queda disponible”; HU-24 pide aprobación del admin. Decisión: al registrar, la publicación queda **“En revisión”** y solo aparece a los adoptantes cuando el admin la aprueba. Protege contra ventas encubiertas (Ley 30407) y hace visible el rol del admin en la demo.

## ADR-06 · Control de acceso por rol en el cliente
`RequireAuth` exige sesión y rol correcto por ruta (`canAccess`), y cierra la sesión tras 15 min de inactividad (HU-21). Es solo UX: sin backend no hay seguridad real (las contraseñas demo están en `localStorage`). En Fase 2 lo reemplazan Supabase Auth + Row Level Security.

## ADR-07 · Offline para el aula
Fotos descargadas y optimizadas a WebP (~3 MB), fuentes self-hosted (`@fontsource`) y PWA con `autoUpdate`: la demo funciona sin internet una vez abierta y cada redespliegue se actualiza solo.

## ADR-08 · Tour guiado que “actúa”
Cada paso del tour puede cambiar de rol, navegar y ejecutar la acción (dar like, enviar el formulario, aceptar). El presentador solo pulsa “Siguiente”. Reinicia los datos semilla al empezar y fija a Luna (de Rosa) como primera carta, para que el cambio a Responsable muestre la solicitud recién creada.

## ADR-09 · Tour: arreglos seguros antes de la clase, rediseño completo después (2026-09-25, modo autónomo)
Con 30 min hasta el corte de las 15:40 no era seguro reescribir el tour como máquina de estados con Floating UI. Se aplicaron arreglos de bajo riesgo: (1) el overlay del tour **bloquea toques fuera del guion** (el presentador solo avanza con Siguiente / →), así el Match no se desincroniza; (2) los anclajes `data-tour` solo existen en la carta superior (se acabó el spotlight duplicado); (3) la tarjeta se coloca en el lado con más espacio libre; (4) el paso 2 espera la redirección del splash antes de ir al cuestionario; (5) teclas ← → Esc; (6) el panel muestra “Tour: paso N/12”. El rediseño completo (Floating UI, guardar/restaurar estado previo, pasos que esperan una acción real con “hazlo por mí”) queda en la rama `fase1-cont`.

## ADR-10 · Carpeta de Drive
La propuesta `02-Proyectos/upch/kuyaypet/` no existe en la estructura de `REGISTRO.md` (los proyectos se organizan por estado). Se usó lo existente: `02-Proyectos/produccion/kuyaypet/` (PROD: tiene URL viva) para zip y manual, y `05-Backups/repos/kuyaypet/` para el `git bundle`.

## ADR-11 · Contador de HU oculto por defecto
El panel muestra “Fase 1 en curso”; un clic revela “10/26 implementadas”. Evita que la clase lea el prototipo como incompleto sin ocultar el dato.

## ADR-12 · Tour como máquina de estados con guion determinista (Bloque B, rama `fase1-cont`)
**Decisión:** cada paso declara rol, ruta, objetivo y cómo avanza: *Siguiente* o una **acción real** del presentador (“Toca ♥ en Luna”), con el botón **“Hazlo por mí”**. A los 30 s sin acción, la pista parpadea: no se hace sola, para no sorprender al presentador mientras habla. Al iniciar se guarda el estado previo y se carga la semilla. En la entrada de cada paso se toma una **foto** de la BD: *Atrás* y cualquier acción fuera de guion (cambiar de rol desde el panel, navegar a mano) restauran esa foto y re-entran al paso, en vez de romperse. Al salir (*Terminar*, *Saltar*, Esc) se restaura lo que había antes del tour.
**Clics:** cuatro bloqueadores rodean el recorte del spotlight; solo el objetivo es clicable, y solo en pasos de acción.
**Popover:** posicionamiento propio con *flip* (abajo ↔ arriba) y *shift* dentro de la pantalla, y modo compacto si no cabe. No se usó la librería Floating UI porque el celular vive dentro de un marco con `transform`: mezclar su sistema de coordenadas con el del marco agrega riesgo y no gana nada en ~20 líneas. El test verifica en cada paso que el popover **no se superpone** al objetivo.
**Tests:** `tests/tour.spec.ts` recorre el tour 3 veces (mismo estado final y restauración del estado previo) y hace otro recorrido con acciones fuera de guion que termina en el mismo estado que el de referencia.

## ADR-13 · Pantalla dividida con dos sesiones reales (Bloque F)
**Decisión:** `?split=1` muestra dos celulares: cada uno es un `iframe` de la misma app con `?as=adopter` / `?as=owner`. En esos marcos la sesión es **propia de cada celular**: no se escribe ni se lee del `localStorage` compartido (`partialize`/`merge` del persist). El resto de la BD sí se comparte, y el evento `storage` avisa a cada marco que el otro escribió: re-lee la BD y muestra lo que llegó (toast de la notificación o la celebración del Match).
**Por qué:** el flujo estrella tiene dos actores. Verlos a la vez explica el “interés mutuo” mejor que cambiar de rol. Es la misma arquitectura que tendrá la Fase 2 con Supabase Realtime, solo que el canal hoy es el navegador.
**Límite:** es solo para escritorio. Al salir, la ventana principal vuelve al inicio sin sesión.

## ADR-14 · Mapa de HU-05 con tiles de OpenStreetMap
**Decisión:** Leaflet con los tiles estándar de OpenStreetMap (`tile.openstreetmap.org`) y la atribución obligatoria “© OpenStreetMap contributors”.
**Por qué no CARTO:** se probó primero CARTO Voyager, como pedía el prompt, pero hoy esa URL responde con tiles “API KEY REQUIRED”. La política de uso de OSM permite un uso liviano con atribución, y una demo de clase lo es. Para producción con tráfico real habría que usar un proveedor con clave (MapTiler, Stadia) o tiles propios.
**Offline:** los tiles requieren internet. Si fallan (`tileerror`), aparece el aviso “Mapa sin conexión: usa la vista Lista”, y la lista sigue funcionando sin red con los datos semilla. El componente se carga con `React.lazy` para no crecer el bundle inicial.

## ADR-15 · Rendimiento: primer pintado estático y carga diferida
Lighthouse en local (móvil, 4G lento simulado): Rendimiento 37 → **80**, Accesibilidad 100, Buenas prácticas 100, SEO 100. En escritorio: 98/100/100/100.
**Qué se hizo:** carga diferida de las pantallas que no se ven al inicio (597 → 477 kB en el chunk inicial), un splash estático en `index.html` que se pinta antes del JS (FCP 4.7 s → 1.1 s) y `robots.txt`.
**Pendiente para llegar a ≥ 90 en móvil:** el LCP (≈ 5 s) depende del bundle de React + Framer Motion. Opciones: `LazyMotion` de Framer, sacar el panel de presentador (QR) del chunk inicial y precargar la fuente principal.

## ADR-16 · v0.4: capa de tokens y pantallas que leen el repo del equipo en vivo
**Tokens.** `tailwind.config.js` define las escalas (tipografía ~1.2, radios control→carta→hoja, elevación con sombras teñidas de cocoa en dos capas, easings y duraciones) y `src/index.css` expone en `:root` los *tiers* de superficie (`--surface-0…3`) y las variables de movimiento. Las pantallas usan `.surface-1/2/3` y `.glass` (translucidez + hairline + blur) en lugar de cajas planas teñidas. `prefers-reduced-motion` anula duraciones y repeticiones. La paleta y las fuentes **no cambian**: la mejora es de jerarquía, profundidad y estados (rest/hover/active/focus/disabled coherentes en `components/ui`).
**Historias y Sprints.** `/historias` descarga `docs/historias-de-usuario.md` del repo `ClxNode/KuyayPet` y parsea la tabla; `/sprints` lee milestones e issues de la API pública de GitHub. No hay copia local: lo que se ve es lo que el repo tiene ahora. `src/services/github.ts` guarda cada respuesta 10 min en `sessionStorage` (límite de 60 peticiones/hora sin sesión), distingue *rate limit* de otros errores y, si falla la red, sirve la última lectura guardada o un estado vacío con instrucciones. Son rutas públicas (sin `RequireAuth`) y no llevan `data-hu`: son material de la exposición, no una HU.
**Base de Vite.** `VITE_BASE` permite construir para un subdirectorio (`VITE_BASE=/next/ npm run build`); sin la variable sigue `./` (ADR-02).
**Pendiente.** Transición carta → perfil con `layoutId` (riesgo con `drag` + rutas diferidas; mejor hacerlo con tiempo para probar el tour).

## ADR-17 · v0.5: rediseño de todas las pantallas sobre los tokens de v0.4
**Contrato de diseño.** `docs/v05-design.md` fija una sola gramática para las 26 rutas: la foto de la mascota es lo único protagonista; el resto es papel crema, vidrio y tipografía. Primitivas nuevas en `components/ui`: `PageHeader` (un `h1` por pantalla, "Volver" con nombre accesible fijo), `Section`, `ListGroup`/`ListRow` (listas agrupadas tipo iOS en vez de tarjetas sueltas), `StatTile` (KPIs con `tabular-nums`), `Skeleton` e `IconButton`. Paleta y fuentes no cambian; sí cambia **qué tono se usa para texto**: blanco sobre `sage` (4,07:1) y sobre `coral` (3,6:1) no llega a AA, así que los botones `success`/`like`, el `ScoreBadge` y las insignias usan `sage-600`/`coral-600` o texto oscuro sobre miel. Verificado con axe en 32 rutas (0 violaciones de contraste y nombres).
**Selectores como contrato.** `docs/test-selectors.txt` lista cada `data-hu`, `data-tour`, `id`, etiqueta y nombre accesible que usa la suite e2e. El rediseño se hizo en 5 ramas paralelas con archivos disjuntos; ninguna cambió un selector, y la suite pasó 21/21 tras cada integración.
**Movimiento.** Una sola transición de ruta (fundido de 180 ms solo al entrar, sin `transform` ni salida: nunca bloquea un clic ni falsea una medición) y `MotionConfig reducedMotion="user"` global. Carta → perfil con `layoutId` compartido entre la foto de `PetCard` y el héroe de `PetProfile`; para que ambos estén en el mismo *commit*, el perfil sale del *code-splitting* (+19 kB). Se probó `v7_startTransition` de React Router, pero el `pathname` diferido hacía que el tour se re-sincronizara a destiempo (`tour.spec.ts` intermitente).
**Coste.** Bundle principal 482,9 → 507,3 kB (+5 %, tope 10 %). Lighthouse en `/next2/`: móvil 88–93 (v0.4: 89), escritorio 100; accesibilidad 100 en ambos.
