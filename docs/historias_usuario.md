# KuyayPet — Historias de Usuario (spec condensada para desarrollo)

Fuente oficial: `Lista_Historias_de_Usuario_KuyayPet.docx.pdf` (texto completo en `historias_usuario_FUENTE.txt`).
Wireframes del equipo: `docs/wireframes/HU-XX-*.jpg` (boceto a lápiz, layout web de escritorio → adaptar a móvil).
Criterios abreviados; **CA-n** = n-ésimo criterio en el orden original. Cada pantalla del prototipo debe poder rastrearse a su HU.

## Roles
- **Adoptante** — busca y adopta.
- **Responsable de mascota** — publica/gestiona mascotas en adopción (persona o albergue).
- **Usuario común** — cualquier usuario registrado.
- **Administrador** — modera usuarios y publicaciones.

## Resumen
| ID | Rol | Historia | Prioridad |
|---|---|---|---|
| HU-01 | Usuario | Registrarme para acceder a la plataforma | Alta |
| HU-02 | Adoptante | Ver mascotas disponibles | Alta |
| HU-03 | Adoptante | Ver perfil detallado de una mascota | Alta |
| HU-04 | Adoptante | Filtrar mascotas según preferencias | Alta |
| HU-05 | Adoptante | Buscar mascotas cercanas a mi ubicación | Media |
| HU-06 | Adoptante | Me gusta / No me gusta | Media |
| HU-07 | Adoptante | Recibir un Match cuando hay interés compatible | Media |
| HU-08 | Adoptante | Chat con el responsable | Alta |
| HU-09 | Usuario | Chat grupal con otros interesados en la misma mascota | Baja |
| HU-10 | Adoptante | Coordinar posible adopción (solicitud + fecha/hora) | Alta |
| HU-11 | Responsable | Registrar mascota | Media |
| HU-12 | Responsable | Editar información textual de la mascota | Alta |
| HU-13 | Responsable | Notificación cuando un adoptante muestra interés | Media |
| HU-14 | Usuario | Guía/centro de información sobre adopción | Baja |
| HU-15 | Usuario | Recuperar contraseña | Media |
| HU-16 | Responsable | Fotos + etiquetas de la mascota | Media |
| HU-17 | Adoptante | Favoritos | Media |
| HU-18 | Adoptante | Historial de “me gusta” | Baja |
| HU-19 | Responsable | Marcar mascota como adoptada | Media |
| HU-20 | Adoptante | Ver mis Matches ordenados por compatibilidad | Media |
| HU-21 | Usuario | Cerrar sesión | Alta |
| HU-22 | Admin | Gestionar cuentas de usuarios | Alta |
| HU-23 | Admin | Revisar publicaciones de mascotas | Alta |
| HU-24 | Admin | Aprobar / rechazar publicaciones | Alta |
| HU-25 | Admin | Desactivar cuentas que incumplen | Media |
| HU-26 | Admin | Revisar y gestionar información inapropiada | Media (sin ficha detallada) |

---

## HU-01 Registro de usuario
- CA-1 Pide nombre, correo, contraseña (wireframe añade “confirmar contraseña” y botones Google/Apple).
- CA-2 Campos vacíos → “todos los campos son obligatorios”.
- CA-3 Correo con formato válido. CA-4 Contraseña ≥ 8 caracteres.
- CA-5 Correo ya registrado → no permite crear cuenta.
- CA-6 Éxito → crea cuenta + mensaje de confirmación. CA-7 Dato inválido → mensaje de error.

## HU-02 Mascotas disponibles
- Lista de mascotas **solo disponibles**; cada tarjeta: foto, nombre, especie, edad, ubicación.
- Seleccionar → detalle. Sin mascotas → mensaje informativo. Responsive (móvil y PC).

## HU-03 Perfil de mascota
- Botón “Ver perfil” → foto(s) (carrusel), nombre, especie, raza, edad, ubicación, info adicional (“Sobre mí”, etiquetas).
- Si no hay info adicional, mostrar solo lo disponible sin errores.

## HU-04 Filtros
- Botón “Filtros” abre panel; seleccionar varios criterios antes de aplicar.
- “Aplicar filtros” actualiza lista; combinación de filtros = AND.
- Sin resultados → mensaje. Modificar criterios → actualiza. “Limpiar filtros” → lista completa.
- Desde resultados se accede al perfil. Filtros sugeridos (wireframe): especie, raza, edad, género, tamaño.

## HU-05 Mascotas cercanas
- Ingresar/seleccionar ubicación (distrito o “Usar mi ubicación actual”) + radio en km (slider 1–20).
- “Buscar” → mascotas dentro del radio con **distancia aproximada** (“a 1.2 km”).
- Sin resultados → “No se encontraron mascotas cercanas”.

## HU-06 Me gusta / No me gusta
- Opciones “Me gusta” y “No me gusta” sobre la mascota (en la app: swipe derecha/izquierda + botones).
- Registra la elección, confirmación visual, pasa a la siguiente mascota.

## HU-07 Match
- Match = adoptante dio “Me gusta” **Y** el responsable acepta continuar (interés mutuo).
- Notifica al adoptante (“¡Es un Match!”), aparece en “Mis Matches”, muestra info básica de la mascota.
- Desde el Match se continúa al contacto (chat). Queda registrado en la cuenta. Sin interés mutuo → no hay Match.

## HU-08 Chat con el responsable
- Iniciar chat desde la mascota → conversación vinculada a esa mascota (se muestra en el header del chat).
- Enviar/recibir mensajes, orden cronológico, historial persistente; al finalizar la adopción se conserva el historial.

## HU-09 Chat grupal por mascota
- “Unirme al chat de la mascota” → sala vinculada a la mascota; mensajes con nombre y hora del remitente.
- Muestra historial previo; si está vacío, invita a iniciar conversación.
- Sin sesión → pide iniciar sesión. Mensaje vacío/solo espacios → botón “Enviar” deshabilitado.

## HU-10 Coordinar adopción
- Opción “Coordinar adopción” en la mascota → formulario con fecha y hora propuesta → “Enviar solicitud” → confirmación.
- El responsable recibe la solicitud. Adoptante ve estado: Pendiente / Aceptada / Rechazada.

## HU-11 Registrar mascota
- Responsable con sesión → “Registrar mascota” → formulario. Campos obligatorios marcados; si faltan, indicarlos.
- Éxito → confirmación y queda disponible (en el prototipo: queda “Pendiente de aprobación” si el admin modera — ver HU-24; decidir y documentar).

## HU-12 Editar información textual
- “Editar información” → formulario prellenado (nombre, descripción, raza, edad, historia, cuidados especiales).
- “Guardar cambios” → “Cambios guardados con éxito”. “Cancelar” descarta. Nombre vacío → resalta y bloquea.
- El perfil público refleja los cambios al instante.

## HU-13 Notificaciones al responsable
- “Me interesa”/“Solicitar adopción” → notificación inmediata al responsable.
- Campana con contador en la barra superior. Click → perfil del adoptante o chat de la solicitud.
- Centro de notificaciones: adoptante, mascota, fecha/hora; leídas vs no leídas; marcar leída actualiza contador.

## HU-14 Guía de adopción
- Sección “Guía de adopción / Sobre nosotros”: FAQ, requisitos, consejos de adopción responsable (Ley 30407, Ley 31807).
- Categorías desplegables; buscador por palabras clave (“vacunas”, “contrato”, “seguimiento”).
- Enlace desde el perfil de la mascota sin perder contexto (volver al perfil).

## HU-15 Recuperar contraseña
- “¿Olvidaste tu contraseña?” → ingresar correo → “Enviar enlace de recuperación”.
- Correo no registrado o inválido → error. Enlace/código → nueva contraseña + confirmación (≥ 8) → mensaje y redirección al login.
- En la demo: simular el correo (mostrar el “correo recibido” en un toast/bandeja simulada).

## HU-16 Fotos y etiquetas
- Formulario con fotografías: vista previa al cargar; formato no permitido → error.
- Etiquetas: especie, edad, tamaño, sexo, personalidad. “Publicar mascota” → confirmación; el adoptante ve foto, datos y etiquetas.

## HU-17 Favoritos
- Icono corazón en cada mascota; toggle agregar/quitar con confirmación visual.
- Sección “Favoritos”; persisten tras cerrar sesión; si la mascota ya no está disponible, mostrar estado actualizado.

## HU-18 Historial de interés
- “Historial de interés” en el perfil del adoptante: foto, nombre, fecha de interacción, estado actual.
- Disponible → perfil completo. Adoptada → badge “Adoptada”. Retirada → “perfil ya no disponible”. Vacío → mensaje.

## HU-19 Marcar como adoptada
- “Mis publicaciones” → “Marcar como adoptada” → confirmación → estado “Adoptada”.
- Ya no aparece en disponibles; en favoritos/historial se ve “Adoptada”; nuevas solicitudes bloqueadas con mensaje.

## HU-20 Mis Matches / compatibilidad
- Requiere preferencias completas (si no, pedir completarlas).
- Lista ordenada de mayor a menor compatibilidad; tarjeta con foto, info básica y **% de compatibilidad**.
- En el perfil: **criterios que originaron la compatibilidad** (ver `motor_match.md`).
- Si una mascota deja de estar disponible, se retira/actualiza. Sin compatibles → mensaje + editar preferencias.

## HU-21 Cerrar sesión
- Menú de perfil → “Cerrar sesión” → confirmación → fin de sesión → redirige a inicio/login.
- Volver atrás a páginas privadas → pide credenciales. Cierre automático por inactividad. Error → informar y reintentar.

## HU-22 Gestionar usuarios (Admin)
- Módulo usuarios: lista → detalle → editar → “Guardar cambios” → confirmación.
- “Desactivar usuario” con confirmación → estado inactivo → ese usuario no puede iniciar sesión.

## HU-23 Revisar publicaciones (Admin)
- Lista de publicaciones → detalle → editar → guardar → confirmación.

## HU-24 Aprobar / rechazar (Admin)
- Lista de pendientes → detalle → “Aprobar” (con confirmación) → “Aprobada”; “Rechazar” pide motivo → “Rechazada”. Mensaje de confirmación.

## HU-25 Desactivar cuentas (Admin)
- Lista → detalle con estado → “Desactivar” con confirmación → “Inactiva” → no puede iniciar sesión.
- Si ya está inactiva → informar. (El wireframe del documento repite el de cierre de sesión; diseñar libremente.)

## HU-26 Información inapropiada (Admin)
- Sin ficha detallada. Mantener como cola de **reportes** (“Reportar” en perfiles/chats) que el admin revisa. No inventar sanciones más allá de ocultar la publicación / desactivar (HU-25).
