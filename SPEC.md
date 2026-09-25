# SPEC — KuyayPet prototipo (Fase 0)

Fuentes: `docs/historias_usuario.md`, `docs/motor_match.md`, `docs/contexto_negocio.md`, `CLAUDE.md`.

## Entradas
- Datos semilla deterministas (`npm run seed` → `src/data/seed/*.json`), fotos locales (`npm run images`).
- Acciones del usuario en la PWA (registro, cuestionario, swipe, chat, solicitudes, moderación).

## Salidas
- Build estático `dist/` desplegado en Hostinger y GitHub Pages.

## Invariantes
- Los componentes nunca tocan `localStorage`: solo `src/services/*`.
- Toda pantalla raíz lleva `data-hu="HU-XX"`.
- `base: './'` + HashRouter: el mismo build sirve en cualquier subruta.
- Un Match existe solo si hay `Interest` aceptado por el responsable.
- `computeMatch` es pura y cubierta por Vitest; `huStatus.ts` marca `done` solo con todos los criterios cumplidos.

## Fuera de alcance (Fase 0)
- Backend real, verificación de token de Google, correo real, push real, pagos, app nativa.
