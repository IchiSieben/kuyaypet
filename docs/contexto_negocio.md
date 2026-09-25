# KuyayPet — contexto de negocio (resumen del Caso de Negocio y BMC)

- **Nombre:** KuyayPet (*kuyay* = “amar/querer” en quechua). Slogan: **“Conecta • Comparte • Socializa”**. Taglines: “¡Encuentra tu mejor compañero!”, “Adopta con amor, cambia una vida”, “Conecta corazones, cambia vidas”, “Adopta · Conecta · Transforma”.
- **Curso:** Ingeniería de Software — Universidad Peruana Cayetano Heredia (UPCH), 2026-2. Docente asesor: Juan Huapalla.
- **Problema:** la información de mascotas en adopción está dispersa (redes sociales, albergues, publicaciones); buscar es lento, manual y poco confiable.
- **Solución:** app móvil tipo “Tinder” para adopción: perfiles detallados de mascotas, búsqueda por cercanía y preferencias, Like/Dislike → Match por interés mutuo, chat integrado.
- **Objetivos:** facilitar la búsqueda; mejorar la compatibilidad adoptante–mascota; centralizar la información; facilitar el contacto.
- **Métricas / metas:** usuarios registrados (500), matches (200), usuarios activos mensuales (60 %), satisfacción (80 %).
- **Modelo de ingresos:** suscripciones, publicidad, productos y alianzas con negocios *pet friendly* (veterinarias, pet shops, grooming).
- **Marco legal Perú:** Ley N.º 30407 (Protección y Bienestar Animal), Ley N.º 31807 (adopción e identificación de animales de compañía), guía MINSA de tenencia responsable.
- **Referente:** A la Cucha (alacucha.com), “Tinder de mascotas” argentino.
- **Contexto geográfico de la demo:** Lima Metropolitana (Miraflores, San Isidro, Surco, SMP, Callao, Barranco, Jesús María, Lince, La Molina, San Borja, Los Olivos, Chorrillos…).

## Equipo
Ver `data/team.json`. Líder del proyecto: Joseph Lombardi. Patrocinador: Dylan Quispe.

## Artefactos previos del equipo
- Lista de 26 HU con criterios DADO/CUANDO/ENTONCES y wireframes a lápiz (`docs/wireframes/`).
- Modelado UML en StarUML: 26 HU × 5 vistas (caso de uso, actividades, secuencia, componentes, colaboración) = 130 diagramas.
- Componentes/objetos del UML (usar estos nombres para módulos del código, así la demo es trazable al modelo):
  Interfaz, Autenticación, Sesiones, Control de acceso, Validación, Recuperación, Usuarios, Mascotas, Perfil Mascota,
  Gestión Mascotas, Publicaciones, Multimedia, Almacenamiento, Búsqueda, Filtros, Geolocalización, Compatibilidad, Match,
  Interacciones, Favoritos, Historial, Chat, Mensajería, Notificaciones, Coordinación, Adopciones, Información,
  Panel Admin, Moderación, BD.
