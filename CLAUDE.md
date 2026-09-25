# KuyayPet — prototipo interactivo (Ingeniería de Software, UPCH 2026-2)

App tipo “Tinder/Bumble” para **adopción de mascotas** en Lima: swipe de mascotas, motor de compatibilidad explicable, Match por interés mutuo, chat, coordinación de adopción, panel de responsable y panel de administrador.
Objetivo inmediato: **demo espectacular para mostrar en clase** (proyector + celulares de los compañeros vía QR).

## Fuentes de verdad (leer antes de codificar)
1. `docs/historias_usuario.md` — 26 HU con criterios condensados (fuente completa: `docs/historias_usuario_FUENTE.txt`).
2. `docs/wireframes/HU-XX-*.jpg` — bocetos del equipo. Respetar **estructura y contenido** de cada pantalla; el estilo visual final sí lo diseñamos nosotros (el boceto es a lápiz y en layout desktop; la app es mobile-first).
3. `docs/motor_match.md` — algoritmo de compatibilidad y reglas de Match.
4. `docs/contexto_negocio.md` — problema, objetivos, slogan, equipo, marco legal, nombres de componentes UML.
5. `data/team.json` — integrantes y créditos.

## Stack (decidido — no cambiar sin avisar)
- **Vite + React 18 + TypeScript** (strict), **Tailwind CSS**, **Framer Motion** (swipe, animación de Match), **lucide-react** (íconos).
- Router: **HashRouter** (hosting compartido estático, sin reescrituras de servidor).
- Estado/“backend” falso: **Zustand + persist (localStorage)** detrás de una capa `src/services/`. Los componentes **nunca** tocan localStorage directo: llaman servicios. Así, en fase 2, se cambia la implementación por Supabase/Firebase/API sin tocar la UI.
- Servicios nombrados como los componentes del UML: `auth`, `session`, `users`, `pets`, `publications`, `media`, `search` (filtros + geolocalización), `compatibility`, `match`, `interactions` (likes, favoritos, historial), `chat`, `notifications`, `adoptions` (coordinación), `info` (guía), `moderation` (admin + reportes).
- **PWA** (vite-plugin-pwa): instalable en el celular, funciona offline con los datos semilla.
- Tests: **Vitest** para `compatibility`/`match`; **Playwright** (viewport de celular 390×844) para el smoke test de flujos.
- Sin backend real en esta fase. Todo el build es estático (`dist/`).

## Diseño
- **Mobile-first**. En móvil: app a pantalla completa con barra de navegación inferior (Descubrir · Buscar · Matches · Chats · Perfil).
- En escritorio/proyector: la app se muestra **dentro de un marco de celular** centrado + **Panel de presentador** lateral (ver abajo).
- Identidad: cálida y amigable, inspirada en los bocetos. Fondo crema, primario marrón/terracota, acento coral para “Me gusta”, verde salvia para estados positivos. Esquinas muy redondeadas, sombras suaves, micro-animaciones. Tipografía redondeada (p.ej. “Baloo 2” / “Nunito”) y una manuscrita (p.ej. “Caveat”) solo para taglines tipo “Adopta · Conecta · Transforma”. Fuentes vía Google Fonts o self-host.
- Logo: SVG **original** (perro + gato asomados sobre un cartel con huella en la “A”, texto “KuyayPet”, subtítulo “Conecta · Comparte · Socializa”), como en los bocetos. No usar logos de terceros.
- Accesible: contraste AA, botones con texto además de gestos (el swipe siempre tiene botones ✕ / ♥ / ⭐), `prefers-reduced-motion`.
- Todo el texto de la UI en **español peruano** neutro (“departamento”, “distrito”, etc.).

## Modo demo (clave para la exposición)
- **Selector de rol** sin fricción: Adoptante / Responsable / Admin (cuentas demo precargadas) + registro real funcional (HU-01).
- **Tour guiado** (coach marks en español) que recorre el flujo estrella: onboarding → deck → Match → chat → coordinar adopción → cambio a Responsable → notificación → aceptar → Admin aprueba publicación.
- **Panel de presentador** (solo escritorio, colapsable): lista de las 26 HU con check de “implementada”, click = navega a esa pantalla con el rol correcto; “Match garantizado en la próxima carta”; “Reiniciar demo” (vuelve a los datos semilla); **QR** con la URL pública para que la clase la abra en su celular; créditos del integrante asignado a la HU.
- Toda pantalla lleva `data-hu="HU-XX"` en su contenedor raíz (trazabilidad HU ↔ pantalla ↔ test).

## Datos sintéticos
- `src/data/seed/*.json` generados por `scripts/seed.ts`: ~40 mascotas (≈ 28 perros, 12 gatos) con razas reales + mestizos, edades, tamaños, energía, sociabilidad, personalidad, distrito de Lima con lat/lng; ~12 responsables (personas y albergues **ficticios**); ~8 adoptantes; 1 admin; publicaciones pendientes, reportes, chats y notificaciones precargados para que ningún módulo se vea vacío.
- Imágenes **descargadas al repo** (no hotlink; la demo debe funcionar sin internet en el aula) por `scripts/fetch-images.ts`, optimizadas a WebP ~600 px con `sharp`, en `public/img/pets/` y `public/img/people/`.
  - Perros: Dog CEO API (`https://dog.ceo/api/breed/<raza>/images/random`), coincidiendo raza de la foto con la raza del perfil.
  - Gatos: The Cat API (`https://api.thecatapi.com/v1/images/search`).
  - Personas: randomuser.me (`https://randomuser.me/api/portraits/...`).
  - Registrar origen de cada archivo en `CREDITS.md`. Uso académico/demostrativo; si algún día es comercial, reemplazar por imágenes con licencia clara.
- Nombres de personas y albergues inventados; nunca usar organizaciones reales como si fueran socias.

## Login con Google
- Si existe `VITE_GOOGLE_CLIENT_ID`: usar **Google Identity Services** (solo frontend, obtiene nombre/foto/email; sin backend no hay verificación de token → es demo, decirlo en el README).
- Si no existe: botón “Continuar con Google” abre un selector de cuenta **simulado**. Nunca bloquear la demo por esto.

## Repositorio y despliegue
- GitHub: repo `kuyaypet` (usar `gh`), rama `main`, commits pequeños y descriptivos en español. `.gitignore` estándar de Node; nunca subir `.env`.
- Hostinger (plan de hosting compartido, estático): sitio en **subdominio gratuito genérico `*.hostingersite.com`** (NO en ichisieben.dev). Orden de hosting: `1008316349`.
  Flujo con el MCP de Hostinger: `hosting_generateAFreeSubdomainV1` → `hosting_createWebsiteV1` → esperar a que aparezca en `hosting_listWebsitesV1` → `npm run build` → zip de `dist/` → `hosting_deployStaticSiteArchiveV1`. Guardar el dominio resultante en `DEPLOY.md` y en `.env.production` (`VITE_PUBLIC_URL`) para el QR.
- Espejo gratuito: GitHub Pages vía GitHub Actions (`base` relativo `./` en Vite para que funcione en ambos).
- Redesplegar al terminar cada fase.

## Forma de trabajar
- Prioridad = que la demo esté **navegable y desplegada pronto**, luego completar HUs. Nunca dejar `main` roto.
- Antes de dar por hecha una HU: revisar sus criterios en `docs/historias_usuario.md` y marcarla en `src/data/huStatus.ts`.
- Verificar con Playwright en viewport móvil y guardar capturas por HU en `docs/screenshots/` (sirven para el informe del curso).
- iC7 (Yoichi) quiere **aprender mientras construimos**: en cada fase, explicar en 3–5 líneas las decisiones de arquitectura (por qué capa de servicios, por qué HashRouter, cómo se testea el motor) y dejarlas en `docs/decisiones.md` (formato ADR corto).
- Ser honesto sobre lo simulado vs lo real (chat, correo de recuperación, notificaciones push y Google login son simulados en esta fase).

## Fase 2 (no ahora, solo dejar preparado)
- Backend real (Supabase: auth + Postgres + realtime para chat) reemplazando `src/services/*`.
- App nativa en **Flutter** reutilizando la spec, el modelo de datos (`src/types`) y el motor de match (portar la función pura).
- Módulo “Comunidad” estilo Bumble BFF: paseos grupales, playdates entre perros compatibles, eventos de adopción con albergues.
