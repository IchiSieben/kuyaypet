# Manual de la demo · KuyayPet

*Para el presentador. Ingeniería de Software · UPCH 2026-2.*

**Link principal:** https://firebrick-cod-910257.hostingersite.com/
**Espejo (plan B):** https://ichisieben.github.io/kuyaypet/
**Cuentas demo** (contraseña `kuyay2026`): `adoptante@kuyaypet.pe` (Valeria) · `responsable@kuyaypet.pe` (Rosa) · `admin@kuyaypet.pe`

---

## 1. Preparación antes de clase (5 min)

1. Abre el link principal en **Chrome de escritorio** y pon **pantalla completa (F11)**. A partir de 1024 px de ancho aparecen el **marco de celular** y el **panel de presentador** a la derecha.
2. En el panel pulsa **Reiniciar demo**: vuelven los datos semilla y se cierra la sesión.
3. **Prueba el QR** del panel con tu celular: debe abrir la misma app a pantalla completa. Esa es la invitación para que la clase la abra.
4. Deja el zoom del navegador en 100 %. Si el proyector es de baja resolución, prueba con 90 % (Ctrl −).
5. **Sin internet:** abre la app una vez con internet antes de clase. Es una PWA: queda en caché con fotos y fuentes incluidas. Si el aula no tiene red, recarga igual y funcionará desde la caché. Como respaldo extremo, usa las capturas de este manual.
6. **Teclado:** durante el tour, **→** avanza, **←** retrocede y **Esc** sale.

![Modo presentador](screenshots/presentador-escritorio.png)

---

## 2. Guion del tour (5–7 min)

Pulsa **Tour guiado** en el panel. El tour **reinicia los datos**, fija a **Luna** (la gata de Rosa) como primera carta y **ejecuta cada acción por ti**: tú solo pulsas **Siguiente** (o →). Mientras dura, la pantalla del celular no acepta toques fuera del guion, así el Match no se puede desincronizar. El panel muestra “Tour: paso N/12”.

| # | Qué pasa en pantalla | Qué digo (1–2 frases) | HU | ≈ tiempo |
|---|---|---|---|---|
| 1 | Pantalla de inicio con los botones de rol | “KuyayPet es un Tinder para adoptar: la información de adopción en Lima está dispersa; aquí se centraliza y se conecta por compatibilidad.” | HU-01 | 40 s |
| 2 | Cuestionario tipo Bumble | “Primero conocemos al adoptante: vivienda, horas que pasa fuera, actividad, niños, alergias. Una pregunta por pantalla.” | HU-20 | 40 s |
| 3 | Deck con Luna, % y razones | “Cada carta muestra el porcentaje y **por qué**: distancia, vivienda, energía. Nada de caja negra.” | HU-06, HU-20 | 40 s |
| 4 | Se resalta **Me gusta** → al avanzar, el like se da solo | “Un like no es un Match: avisa al responsable. El Match solo ocurre con interés mutuo.” | HU-06 | 20 s |
| 5 | **¡Es un Match!** con confeti | “Rosa aceptó. Aquí la aceptación está simulada; en la fase 2 la hace una persona real desde su celular.” | HU-07 | 30 s |
| 6 | Chat con Luna: se envía un mensaje y Rosa responde | “El chat queda vinculado a la mascota y se guarda el historial.” | HU-08 | 30 s |
| 7 | Formulario **Coordinar adopción** | “Desde el chat propongo fecha y hora para conocer a Luna.” | HU-10 | 20 s |
| 8 | **¡Solicitud enviada!** con estado Pendiente | “Veo el estado: pendiente, aceptada o rechazada. Ahora cambiemos de lado.” | HU-10 | 15 s |
| 9 | Somos **Rosa**: se resalta la campana con el contador | “La responsable recibe la notificación al instante.” | HU-13 | 30 s |
| 10 | Rosa **acepta** la visita | “Acepta, y Valeria recibe la confirmación en el chat.” | HU-10, HU-13 | 20 s |
| 11 | **Admin** aprueba una publicación pendiente | “Toda mascota nueva pasa por moderación: así evitamos ventas encubiertas (Ley 30407).” | HU-24 | 30 s |
| 12 | Créditos del equipo | “Escaneen el QR y pruébenlo en su celular.” | — | 20 s |

![Paso 3 · deck](screenshots/tour-paso-3.png)
![Paso 5 · Match](screenshots/tour-paso-5.png)
![Paso 9 · responsable](screenshots/tour-paso-9.png)

---

## 3. Recorrido libre por rol

Cambia de rol con los tres botones del panel (**Adoptante · Responsable · Admin**). Al cambiar, entras directo con la cuenta demo de ese rol.

**Adoptante (Valeria)**
- **Descubrir:** desliza con el mouse o usa ✕ / ⭐ / ♥. El botón **Match garantizado en la próxima carta** del panel asegura que el siguiente like termine en Match.
- **Buscar:** grilla de mascotas disponibles, con la distancia a ti (HU-02).
- **Matches:** Matches con interés mutuo y ranking de compatibilidad, con los motivos de cada uno (HU-20).
- **Perfil de mascota:** carrusel de fotos, “¿Por qué hacemos match?”, favoritos y botón Coordinar (HU-03).
- **Perfil:** preferencias y cerrar sesión con confirmación (HU-21).

**Responsable (Rosa)**
- Interesados con su % de compatibilidad: ✓ acepta (se crea el Match y se abre el chat) y ✕ rechaza.
- Solicitudes de adopción con fecha, hora y mensaje: aceptar o rechazar.
- Mis publicaciones, con su estado (Publicada / En revisión / Rechazada).
- La campana y **Avisos** muestran las notificaciones leídas y no leídas.

**Administrador**
- Métricas del caso de negocio: usuarios (meta 500), matches (meta 200), mascotas activas y adopciones.
- **Publicaciones pendientes:** *Aprobar* pide confirmación. *Rechazar* pide un motivo (hay chips sugeridos) y se le notifica al responsable (HU-24).
- **Reportes abiertos:** la cola de contenido inapropiado (HU-26, gestión completa en la siguiente fase).
- La gestión de usuarios y la desactivación de cuentas (HU-22/25) están en desarrollo. El login ya bloquea las cuentas inactivas.

---

## 4. Qué es simulado y cómo explicarlo

| Pregunta posible | Respuesta corta |
|---|---|
| ¿Dónde está la base de datos? | “En esta fase los datos viven en el navegador (localStorage), detrás de una capa de servicios. La fase 2 cambia esa capa por Supabase sin tocar las pantallas.” |
| ¿Quién acepta los likes? | “Responsables simulados con una probabilidad y un retardo; Rosa, la responsable demo, acepta a mano en el tour.” |
| ¿Y el chat? | “Los mensajes se guardan de verdad; las respuestas del responsable son plantillas. En la fase 2 será tiempo real.” |
| ¿Login con Google? | “Selector simulado. Con un Client ID se usa Google Identity Services, pero sin backend no se puede verificar el token, por eso no lo activamos.” |
| ¿El % es confiable? | “Son pesos heurísticos y explicables. La fase 2 los calibra con adopciones reales.” |
| ¿Es seguro? | “Es un prototipo: las contraseñas demo están en el navegador. La fase 2 usa Supabase Auth con permisos por fila.” |

**Siguiente fase:** backend Supabase (auth, Postgres y chat en tiempo real), app Flutter y módulo Comunidad (paseos y playdates).

---

## 5. Plan B

1. **Algo raro en pantalla:** pulsa **Reiniciar demo** en el panel y vuelve a lanzar el tour.
2. **El tour se trabó:** pulsa **Esc** para salir y luego *Tour guiado* otra vez (siempre empieza desde cero).
3. **La página no responde:** recarga (F5). Los datos se conservan.
4. **Hostinger caído:** usa el espejo https://ichisieben.github.io/kuyaypet/
5. **Sin proyector ni internet:** muestra las capturas de este manual.

---

## 6. Trazabilidad HU → pantalla → tour

| HU | Pantalla (ruta) | Paso del tour | Estado |
|---|---|---|---|
| HU-01 Registro | `/registro`, `/login` | 1 | Lista |
| HU-02 Mascotas disponibles | `/buscar` | — | Lista |
| HU-03 Perfil de mascota | `/mascota/:id` | — | Lista |
| HU-06 Me gusta / No me gusta | `/descubrir` | 3–4 | Lista |
| HU-07 Match | overlay + `/matches` | 5 | Lista |
| HU-08 Chat | `/chats/:id` | 6 | Lista |
| HU-10 Coordinar adopción | `/coordinar/:id` | 7–8, 10 | Lista |
| HU-13 Notificaciones | campana, `/notificaciones`, `/responsable` | 9 | Parcial |
| HU-20 Compatibilidad | `/onboarding`, `/matches` | 2–3 | Lista |
| HU-21 Cerrar sesión | `/perfil` | — | Lista |
| HU-24 Aprobar / rechazar | `/admin` | 11 | Lista |
| HU-04, 05, 09, 11, 12, 14–19, 22, 23, 25, 26 | — | — | En desarrollo |
