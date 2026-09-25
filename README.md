# KuyayPet 🐾 — Adopta · Conecta · Transforma

Prototipo interactivo de una app tipo “Tinder/Bumble” para **adopción de mascotas en Lima**: swipe, motor de compatibilidad explicable, Match por interés mutuo, chat, coordinación de adopción y paneles de responsable y administrador.
Curso Ingeniería de Software — UPCH 2026-2.

- **Demo:** https://firebrick-cod-910257.hostingersite.com/ · espejo https://ichisieben.github.io/kuyaypet/
- **Cuentas demo** (contraseña `kuyay2026`): `adoptante@kuyaypet.pe`, `responsable@kuyaypet.pe`, `admin@kuyaypet.pe` — o los botones “Probar la demo como…”.
- En escritorio aparece el **modo presentador**: tour guiado, cambio de rol, “Match garantizado”, reiniciar demo, QR y la lista de 26 HU.

## Correr en local
```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest: motor de compatibilidad
npm run build && npm run test:e2e   # Playwright en viewport 390×844
```

## Stack
Vite + React 18 + TypeScript strict · Tailwind · Framer Motion · Zustand (persist) · PWA · Vitest · Playwright. Ver `docs/decisiones.md`.

## Qué es real y qué es simulado
Real: registro/login con validaciones, cuestionario y motor de compatibilidad, Match, chat persistente, solicitudes y moderación (todo en el navegador, `localStorage`).
Simulado: la respuesta de los responsables (aceptar interés y contestar en el chat), “Continuar con Google” (selector simulado si no hay `VITE_GOOGLE_CLIENT_ID`; con client ID usa Google Identity Services **sin** verificar el token, porque no hay backend), correo y notificaciones push.

## Créditos
Equipo en `data/team.json` (pantalla “Equipo KuyayPet”). Fotos: Dog CEO, The Cat API y randomuser.me — detalle en `CREDITS.md`. Personas y albergues son ficticios.
